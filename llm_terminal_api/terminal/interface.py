"""
Custom terminal interface for LLM Terminal API
Provides terminal-like capabilities for LLM agents
"""

import os
import sys
import subprocess
import threading
import queue
import time
from typing import Dict, List, Optional, Any, Union
from ..core.config import Config
import logging


class CustomTerminal:
    """Custom terminal interface for LLM agents"""

    def __init__(self, config: Config):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.history = []
        self.history_index = 0
        self.max_history = config.terminal_history_size
        self.cols = config.terminal_cols
        self.rows = config.terminal_rows
        self._processes = {}
        self._next_pid = 1

    def execute_command(
        self,
        command: str,
        timeout: Optional[int] = None,
        cwd: Optional[str] = None,
        env: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Execute a shell command and return results"""
        timeout = timeout or self.config.timeout_default

        self.logger.info(f"Executing command: {command}")

        # Add to history
        self._add_to_history(command)

        try:
            # Prepare environment
            cmd_env = os.environ.copy()
            if env:
                cmd_env.update(env)

            # Execute command
            start_time = time.time()
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=cwd,
                env=cmd_env,
            )
            end_time = time.time()

            # Prepare result
            output = {
                "command": command,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "execution_time": end_time - start_time,
                "timeout": timeout,
                "success": result.returncode == 0,
            }

            self.logger.info(
                f"Command executed: {command} (exit code: {result.returncode})"
            )
            return output

        except subprocess.TimeoutExpired:
            self.logger.warning(f"Command timed out: {command}")
            return {
                "command": command,
                "returncode": -1,
                "stdout": "",
                "stderr": f"Command timed out after {timeout} seconds",
                "execution_time": timeout,
                "timeout": timeout,
                "success": False,
                "timed_out": True,
            }
        except Exception as e:
            self.logger.error(f"Command execution failed: {command} - {str(e)}")
            return {
                "command": command,
                "returncode": -2,
                "stdout": "",
                "stderr": str(e),
                "execution_time": 0,
                "timeout": timeout,
                "success": False,
                "error": str(e),
            }

    def execute_command_stream(
        self,
        command: str,
        timeout: Optional[int] = None,
        cwd: Optional[str] = None,
        env: Optional[Dict[str, str]] = None,
    ):
        """Execute a shell command and yield output in real-time"""
        timeout = timeout or self.config.timeout_default

        self.logger.info(f"Executing command (stream): {command}")

        # Add to history
        self._add_to_history(command)

        try:
            # Prepare environment
            cmd_env = os.environ.copy()
            if env:
                cmd_env.update(env)

            # Execute command with pipes for streaming
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=cwd,
                env=cmd_env,
                bufsize=1,
                universal_newlines=True,
            )

            # Validate process creation
            if process is None:
                raise RuntimeError("Failed to create subprocess")

            # Store process for potential termination
            pid = self._next_pid
            self._next_pid += 1
            self._processes[pid] = process

            start_time = time.time()

            # Yield stdout lines
            try:
                if process.stdout:
                    for line in iter(process.stdout.readline, ""):
                        yield {"type": "stdout", "data": line.rstrip("\\n"), "pid": pid}

                # Yield stderr lines
                if process.stderr:
                    for line in iter(process.stderr.readline, ""):
                        yield {"type": "stderr", "data": line.rstrip("\\n"), "pid": pid}

                # Wait for completion
                return_code = process.wait(timeout=timeout)
                end_time = time.time()

                # Final result
                yield {
                    "type": "result",
                    "command": command,
                    "returncode": return_code,
                    "execution_time": end_time - start_time,
                    "success": return_code == 0,
                    "pid": pid,
                }

            finally:
                # Clean up process reference
                if pid in self._processes:
                    del self._processes[pid]

        except subprocess.TimeoutExpired:
            # Terminate process on timeout
            try:
                if process:
                    process.terminate()
                    process.wait(timeout=1)
            except:
                if process:
                    process.kill()

            self.logger.warning(f"Command timed out (stream): {command}")
            yield {
                "type": "result",
                "command": command,
                "returncode": -1,
                "stderr": f"Command timed out after {timeout} seconds",
                "execution_time": timeout,
                "success": False,
                "timed_out": True,
            }
        except Exception as e:
            self.logger.error(
                f"Command execution failed (stream): {command} - {str(e)}"
            )
            yield {
                "type": "result",
                "command": command,
                "returncode": -2,
                "stderr": str(e),
                "execution_time": 0,
                "success": False,
                "error": str(e),
            }

    def kill_process(self, pid: int) -> Dict[str, Any]:
        """Kill a running process by PID"""
        if pid in self._processes:
            try:
                process = self._processes[pid]
                if process:
                    process.terminate()
                    process.wait(timeout=2)
                    del self._processes[pid]

                    self.logger.info(f"Process terminated: {pid}")
                    return {"pid": pid, "action": "kill", "status": "success"}
            except subprocess.TimeoutExpired:
                # Force kill
                try:
                    if process:
                        process.kill()
                        process.wait()
                        del self._processes[pid]

                        self.logger.info(f"Process force killed: {pid}")
                        return {
                            "pid": pid,
                            "action": "kill",
                            "status": "success",
                            "force_killed": True,
                        }
                except Exception as e:
                    self.logger.error(f"Failed to kill process {pid}: {str(e)}")
                    return {
                        "pid": pid,
                        "action": "kill",
                        "status": "error",
                        "error": str(e),
                    }
            except Exception as e:
                self.logger.error(f"Failed to terminate process {pid}: {str(e)}")
                return {
                    "pid": pid,
                    "action": "kill",
                    "status": "error",
                    "error": str(e),
                }
        else:
            return {
                "pid": pid,
                "action": "kill",
                "status": "error",
                "error": "Process not found",
            }

    def get_history(self, limit: Optional[int] = None) -> List[str]:
        """Get command history"""
        if limit is None:
            return self.history.copy()
        return self.history[-limit:] if limit > 0 else []

    def clear_history(self) -> Dict[str, Any]:
        """Clear command history"""
        self.history.clear()
        self.history_index = 0

        self.logger.info("Terminal history cleared")
        return {"action": "clear_history", "status": "success"}

    def resize(self, cols: int, rows: int) -> Dict[str, Any]:
        """Resize terminal dimensions"""
        self.cols = cols
        self.rows = rows

        self.logger.info(f"Terminal resized: {cols}x{rows}")
        return {"action": "resize", "cols": cols, "rows": rows, "status": "success"}

    def get_env(self) -> Dict[str, str]:
        """Get current environment variables"""
        return os.environ.copy()

    def set_env(self, key: str, value: str, persistent: bool = False) -> Dict[str, Any]:
        """Set an environment variable"""
        os.environ[key] = value

        # Note: For persistent changes, we would need to modify shell profiles
        # This is beyond the scope of this implementation

        self.logger.info(f"Environment variable set: {key}")
        return {
            "action": "set_env",
            "key": key,
            "value": value,
            "persistent": persistent,
            "status": "success",
        }

    def unset_env(self, key: str) -> Dict[str, Any]:
        """Unset an environment variable"""
        if key in os.environ:
            del os.environ[key]
            self.logger.info(f"Environment variable unset: {key}")
            return {"action": "unset_env", "key": key, "status": "success"}
        else:
            return {
                "action": "unset_env",
                "key": key,
                "status": "error",
                "error": "Environment variable not found",
            }

    def _add_to_history(self, command: str):
        """Add command to history"""
        if command and (not self.history or self.history[-1] != command):
            self.history.append(command)
            # Limit history size
            if len(self.history) > self.max_history:
                self.history = self.history[-self.max_history :]
            self.history_index = len(self.history)

    def list_processes(self) -> List[Dict[str, Any]]:
        """List running processes managed by this terminal"""
        processes = []
        for pid, process in self._processes.items():
            try:
                # Check if process is still running
                poll_result = process.poll()
                if poll_result is None:
                    status = "running"
                else:
                    status = f"exited ({poll_result})"
            except:
                status = "unknown"

            processes.append({"pid": pid, "status": status})

        return processes
