"""
Environment management module for LLM Terminal API
Provides environment variable management, snapshots, and isolation capabilities
"""

import os
import sys
import json
import shutil
import hashlib
import time
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
from ..core.config import Config
import logging


class EnvironmentManager:
    """Environment management capabilities for LLM agents"""

    def __init__(self, config: Config):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.snapshot_dir = Path(config.env_snapshot_dir)
        self.snapshot_dir.mkdir(parents=True, exist_ok=True)
        self._env_cache = {}

        # Auto-save current environment if enabled
        if config.env_auto_save:
            self.snapshot_environment("auto_save_initial")

    def get_env(self, key: Optional[str] = None) -> Union[Dict[str, str], str, None]:
        """Get environment variable(s)"""
        if key is None:
            return os.environ.copy()
        return os.environ.get(key)

    def set_env(self, key: str, value: str, persistent: bool = False) -> Dict[str, Any]:
        """Set an environment variable"""
        old_value = os.environ.get(key)
        os.environ[key] = value

        # Update cache
        self._env_cache[key] = value

        self.logger.info(f"Environment variable set: {key}={value}")

        result = {
            "action": "set_env",
            "key": key,
            "old_value": old_value,
            "new_value": value,
            "persistent": persistent,
            "status": "success",
        }

        # For persistent changes, we would modify shell profiles or config files
        # This is a simplified implementation

        return result

    def unset_env(self, key: str) -> Dict[str, Any]:
        """Unset an environment variable"""
        if key in os.environ:
            old_value = os.environ[key]
            del os.environ[key]

            # Update cache
            if key in self._env_cache:
                del self._env_cache[key]

            self.logger.info(f"Environment variable unset: {key}")

            return {
                "action": "unset_env",
                "key": key,
                "old_value": old_value,
                "status": "success",
            }
        else:
            return {
                "action": "unset_env",
                "key": key,
                "status": "error",
                "error": "Environment variable not found",
            }

    def snapshot_environment(self, name: Optional[str] = None) -> Dict[str, Any]:
        """Create a snapshot of the current environment"""
        if name is None:
            name = f"snapshot_{int(time.time())}"

        # Create snapshot data
        snapshot_data = {
            "name": name,
            "timestamp": time.time(),
            "environment": os.environ.copy(),
            "working_directory": os.getcwd(),
            "python_version": ".".join(map(str, sys.version_info[:3])),
            "platform": sys.platform,
        }

        # Save snapshot to file
        snapshot_file = self.snapshot_dir / f"{name}.json"
        try:
            with open(snapshot_file, "w") as f:
                json.dump(snapshot_data, f, indent=2, default=str)

            self.logger.info(f"Environment snapshot saved: {name}")

            return {
                "action": "snapshot_env",
                "name": name,
                "file": str(snapshot_file),
                "status": "success",
            }
        except Exception as e:
            self.logger.error(f"Failed to save environment snapshot {name}: {str(e)}")
            return {
                "action": "snapshot_env",
                "name": name,
                "status": "error",
                "error": str(e),
            }

    def restore_environment(self, name: str) -> Dict[str, Any]:
        """Restore environment from a snapshot"""
        snapshot_file = self.snapshot_dir / f"{name}.json"

        if not snapshot_file.exists():
            return {
                "action": "restore_env",
                "name": name,
                "status": "error",
                "error": f"Snapshot not found: {name}",
            }

        try:
            with open(snapshot_file, "r") as f:
                snapshot_data = json.load(f)

            # Restore environment variables
            env_vars = snapshot_data.get("environment", {})
            for key, value in env_vars.items():
                os.environ[key] = str(value)

            # Restore working directory if it exists
            working_dir = snapshot_data.get("working_directory")
            if working_dir and os.path.exists(working_dir):
                os.chdir(working_dir)

            self.logger.info(f"Environment restored from snapshot: {name}")

            return {
                "action": "restore_env",
                "name": name,
                "working_directory": working_dir,
                "variables_restored": len(env_vars),
                "status": "success",
            }
        except Exception as e:
            self.logger.error(
                f"Failed to restore environment from snapshot {name}: {str(e)}"
            )
            return {
                "action": "restore_env",
                "name": name,
                "status": "error",
                "error": str(e),
            }

    def list_snapshots(self) -> List[Dict[str, Any]]:
        """List all available environment snapshots"""
        snapshots = []

        for snapshot_file in self.snapshot_dir.glob("*.json"):
            try:
                with open(snapshot_file, "r") as f:
                    data = json.load(f)

                snapshots.append(
                    {
                        "name": data.get("name", snapshot_file.stem),
                        "timestamp": data.get("timestamp"),
                        "file": str(snapshot_file),
                        "size": snapshot_file.stat().st_size,
                    }
                )
            except Exception as e:
                self.logger.warning(
                    f"Failed to read snapshot file {snapshot_file}: {str(e)}"
                )

        # Sort by timestamp (newest first)
        snapshots.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
        return snapshots

    def delete_snapshot(self, name: str) -> Dict[str, Any]:
        """Delete an environment snapshot"""
        snapshot_file = self.snapshot_dir / f"{name}.json"

        if not snapshot_file.exists():
            return {
                "action": "delete_snapshot",
                "name": name,
                "status": "error",
                "error": f"Snapshot not found: {name}",
            }

        try:
            snapshot_file.unlink()
            self.logger.info(f"Environment snapshot deleted: {name}")

            return {"action": "delete_snapshot", "name": name, "status": "success"}
        except Exception as e:
            self.logger.error(f"Failed to delete snapshot {name}: {str(e)}")
            return {
                "action": "delete_snapshot",
                "name": name,
                "status": "error",
                "error": str(e),
            }

    def get_env_diff(self, name1: str, name2: str) -> Dict[str, Any]:
        """Get difference between two environment snapshots"""
        snap1_data = self._load_snapshot(name1)
        snap2_data = self._load_snapshot(name2)

        if not snap1_data or not snap2_data:
            return {
                "action": "env_diff",
                "snapshot1": name1,
                "snapshot2": name2,
                "status": "error",
                "error": "One or both snapshots not found",
            }

        env1 = snap1_data.get("environment", {})
        env2 = snap2_data.get("environment", {})

        # Find differences
        keys1 = set(env1.keys())
        keys2 = set(env2.keys())

        added = keys2 - keys1
        removed = keys1 - keys2
        common = keys1 & keys2

        changed = {k for k in common if env1[k] != env2[k]}
        unchanged = common - changed

        diff = {
            "added": {k: env2[k] for k in added},
            "removed": {k: env1[k] for k in removed},
            "changed": {k: {"old": env1[k], "new": env2[k]} for k in changed},
            "unchanged": {k: env1[k] for k in unchanged},
        }

        return {
            "action": "env_diff",
            "snapshot1": name1,
            "snapshot2": name2,
            "differences": diff,
            "status": "success",
        }

    def _load_snapshot(self, name: str) -> Optional[Dict[str, Any]]:
        """Load a snapshot by name"""
        snapshot_file = self.snapshot_dir / f"{name}.json"

        if not snapshot_file.exists():
            return None

        try:
            with open(snapshot_file, "r") as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Failed to load snapshot {name}: {str(e)}")
            return None

    def export_env(self, file_path: str, format: str = "json") -> Dict[str, Any]:
        """Export current environment to a file"""
        env_data = {
            "timestamp": time.time(),
            "environment": os.environ.copy(),
            "working_directory": os.getcwd(),
            "exported_by": "LLM Terminal API",
        }

        try:
            if format.lower() == "json":
                with open(file_path, "w") as f:
                    json.dump(env_data, f, indent=2, default=str)
            elif format.lower() == "env":
                with open(file_path, "w") as f:
                    for key, value in os.environ.items():
                        f.write(f"{key}={value}\n")
            else:
                return {
                    "action": "export_env",
                    "status": "error",
                    "error": f"Unsupported format: {format}",
                }

            self.logger.info(f"Environment exported to: {file_path}")

            return {
                "action": "export_env",
                "file_path": file_path,
                "format": format,
                "status": "success",
            }
        except Exception as e:
            self.logger.error(f"Failed to export environment to {file_path}: {str(e)}")
            return {
                "action": "export_env",
                "file_path": file_path,
                "status": "error",
                "error": str(e),
            }

    def import_env(
        self, file_path: str, format: str = "json", overwrite: bool = False
    ) -> Dict[str, Any]:
        """Import environment from a file"""
        try:
            if format.lower() == "json":
                with open(file_path, "r") as f:
                    data = json.load(f)
                env_vars = data.get("environment", {})
            elif format.lower() == "env":
                env_vars = {}
                with open(file_path, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line and "=" in line and not line.startswith("#"):
                            key, value = line.split("=", 1)
                            env_vars[key] = value
            else:
                return {
                    "action": "import_env",
                    "status": "error",
                    "error": f"Unsupported format: {format}",
                }

            # Import environment variables
            imported_count = 0
            skipped_count = 0

            for key, value in env_vars.items():
                if key in os.environ and not overwrite:
                    skipped_count += 1
                    continue

                os.environ[key] = str(value)
                imported_count += 1

            self.logger.info(
                f"Environment imported from: {file_path} ({imported_count} imported, {skipped_count} skipped)"
            )

            return {
                "action": "import_env",
                "file_path": file_path,
                "format": format,
                "imported": imported_count,
                "skipped": skipped_count,
                "status": "success",
            }
        except Exception as e:
            self.logger.error(
                f"Failed to import environment from {file_path}: {str(e)}"
            )
            return {
                "action": "import_env",
                "file_path": file_path,
                "status": "error",
                "error": str(e),
            }

    def cleanup_old_snapshots(self, keep_count: Optional[int] = None) -> Dict[str, Any]:
        """Remove old snapshots, keeping only the most recent ones"""
        if keep_count is None:
            keep_count = self.config.backup_retention_count

        snapshots = self.list_snapshots()

        if len(snapshots) <= keep_count:
            return {
                "action": "cleanup_snapshots",
                "status": "success",
                "message": f"No cleanup needed ({len(snapshots)} snapshots, keeping {keep_count})",
            }

        # Remove oldest snapshots
        to_remove = snapshots[keep_count:]
        removed_count = 0

        for snapshot in to_remove:
            try:
                snapshot_file = self.snapshot_dir / f"{snapshot['name']}.json"
                snapshot_file.unlink()
                removed_count += 1
            except Exception as e:
                self.logger.warning(
                    f"Failed to remove snapshot {snapshot['name']}: {str(e)}"
                )

        self.logger.info(f"Cleaned up {removed_count} old environment snapshots")

        return {
            "action": "cleanup_snapshots",
            "removed": removed_count,
            "kept": keep_count,
            "status": "success",
        }
