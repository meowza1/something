"""
File management module for LLM Terminal API
Provides comprehensive file and directory operations for LLM agents
"""

import os
import sys
import time
import shutil
import json
import hashlib
import mimetypes
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
from ..core.config import Config
import logging


class FileManager:
    """File management capabilities for LLM agents"""

    def __init__(self, config: Config):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self._mime_types_initialized = False

        # Initialize MIME types
        if not self._mime_types_initialized:
            mimetypes.init()
            self._mime_types_initialized = True

    def exists(self, path: Union[str, Path]) -> bool:
        """Check if a file or directory exists"""
        return Path(path).exists()

    def is_file(self, path: Union[str, Path]) -> bool:
        """Check if path is a file"""
        return Path(path).is_file()

    def is_dir(self, path: Union[str, Path]) -> bool:
        """Check if path is a directory"""
        return Path(path).is_dir()

    def list_dir(
        self,
        path: Union[str, Path],
        pattern: Optional[str] = None,
        include_hidden: bool = False,
    ) -> List[Dict[str, Any]]:
        """List contents of a directory"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"Path does not exist: {path}")

        if not path_obj.is_dir():
            raise NotADirectoryError(f"Path is not a directory: {path}")

        items = []

        # Determine what to match
        if pattern:
            iterator = path_obj.glob(pattern)
        else:
            iterator = path_obj.iterdir()

        for item in iterator:
            # Skip hidden files unless requested
            if not include_hidden and item.name.startswith("."):
                continue

            try:
                stat = item.stat()
                item_info = {
                    "name": item.name,
                    "path": str(item.absolute()),
                    "is_file": item.is_file(),
                    "is_dir": item.is_dir(),
                    "size": stat.st_size if item.is_file() else 0,
                    "modified_time": stat.st_mtime,
                    "created_time": stat.st_ctime,
                    "permissions": oct(stat.st_mode)[-3:],
                    "mime_type": mimetypes.guess_type(str(item))[0]
                    if item.is_file()
                    else None,
                }
                items.append(item_info)
            except (OSError, PermissionError) as e:
                # Skip items we can't access
                self.logger.warning(f"Could not access {item}: {str(e)}")
                continue

        # Sort by name
        items.sort(key=lambda x: x["name"])
        return items

    def read_file(
        self,
        path: Union[str, Path],
        encoding: str = "utf-8",
        max_size: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Read a file's contents"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"File does not exist: {path}")

        if not path_obj.is_file():
            raise IsADirectoryError(f"Path is a directory, not a file: {path}")

        # Check file size
        max_size = max_size or self.config.file_max_size
        file_size = path_obj.stat().st_size

        if file_size > max_size:
            raise ValueError(f"File too large: {file_size} bytes (max: {max_size})")

        try:
            with open(path_obj, "r", encoding=encoding) as f:
                content = f.read()

            return {
                "path": str(path_obj.absolute()),
                "content": content,
                "size": file_size,
                "encoding": encoding,
                "mime_type": mimetypes.guess_type(str(path_obj))[0],
                "success": True,
            }
        except UnicodeDecodeError:
            # Try reading as binary if UTF-8 fails
            try:
                with open(path_obj, "rb") as f:
                    binary_content = f.read()

                return {
                    "path": str(path_obj.absolute()),
                    "content": binary_content.hex(),  # Return as hex string
                    "size": file_size,
                    "encoding": "binary",
                    "mime_type": mimetypes.guess_type(str(path_obj))[0],
                    "success": True,
                    "is_binary": True,
                }
            except Exception as e:
                self.logger.error(f"Failed to read binary file {path}: {str(e)}")
                raise
        except Exception as e:
            self.logger.error(f"Failed to read file {path}: {str(e)}")
            raise

    def write_file(
        self,
        path: Union[str, Path],
        content: Union[str, bytes],
        encoding: str = "utf-8",
        mode: str = "w",
        backup: bool = True,
    ) -> Dict[str, Any]:
        """Write content to a file"""
        path_obj = Path(path)

        # Create parent directories if they don't exist
        path_obj.parent.mkdir(parents=True, exist_ok=True)

        # Backup existing file if requested
        backup_info = None
        if backup and path_obj.exists():
            backup_info = self.backup_file(path_obj)

        try:
            # Determine write mode
            if isinstance(content, bytes):
                if "b" not in mode:
                    mode += "b"
            else:
                if "b" in mode:
                    mode = mode.replace("b", "")

            with open(
                path_obj, mode, encoding=encoding if "b" not in mode else None
            ) as f:
                f.write(content)

            file_size = path_obj.stat().st_size

            self.logger.info(f"File written: {path_obj} ({file_size} bytes)")

            result = {
                "path": str(path_obj.absolute()),
                "size": file_size,
                "mode": mode,
                "encoding": encoding if "b" not in mode else "binary",
                "success": True,
            }

            if backup_info:
                result["backup"] = backup_info

            return result

        except Exception as e:
            self.logger.error(f"Failed to write file {path}: {str(e)}")
            raise

    def delete_file(
        self, path: Union[str, Path], backup: bool = True
    ) -> Dict[str, Any]:
        """Delete a file"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"File does not exist: {path}")

        if path_obj.is_dir():
            raise IsADirectoryError(
                f"Path is a directory, use delete_dir instead: {path}"
            )

        # Backup file if requested
        backup_info = None
        if backup:
            backup_info = self.backup_file(path_obj)

        try:
            path_obj.unlink()

            self.logger.info(f"File deleted: {path_obj}")

            result = {"path": str(path_obj.absolute()), "success": True}

            if backup_info:
                result["backup"] = backup_info

            return result

        except Exception as e:
            self.logger.error(f"Failed to delete file {path}: {str(e)}")
            raise

    def create_dir(
        self, path: Union[str, Path], parents: bool = True, exist_ok: bool = True
    ) -> Dict[str, Any]:
        """Create a directory"""
        path_obj = Path(path)

        try:
            path_obj.mkdir(parents=parents, exist_ok=exist_ok)

            self.logger.info(f"Directory created: {path_obj}")

            return {"path": str(path_obj.absolute()), "success": True}
        except Exception as e:
            self.logger.error(f"Failed to create directory {path}: {str(e)}")
            raise

    def delete_dir(
        self, path: Union[str, Path], recursive: bool = False, backup: bool = True
    ) -> Dict[str, Any]:
        """Delete a directory"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"Directory does not exist: {path}")

        if not path_obj.is_dir():
            raise NotADirectoryError(f"Path is not a directory: {path}")

        # Check if directory is empty (unless recursive)
        if not recursive:
            try:
                next(path_obj.iterdir())
                raise OSError(f"Directory not empty: {path}")
            except StopIteration:
                pass  # Directory is empty

        # Backup directory if requested
        backup_info = None
        if backup:
            backup_info = self.backup_dir(path_obj)

        try:
            if recursive:
                shutil.rmtree(path_obj)
            else:
                path_obj.rmdir()

            self.logger.info(f"Directory deleted: {path_obj}")

            result = {
                "path": str(path_obj.absolute()),
                "recursive": recursive,
                "success": True,
            }

            if backup_info:
                result["backup"] = backup_info

            return result

        except Exception as e:
            self.logger.error(f"Failed to delete directory {path}: {str(e)}")
            raise

    def copy_file(
        self, src: Union[str, Path], dst: Union[str, Path], backup_dst: bool = True
    ) -> Dict[str, Any]:
        """Copy a file"""
        src_obj = Path(src)
        dst_obj = Path(dst)

        if not src_obj.exists():
            raise FileNotFoundError(f"Source file does not exist: {src}")

        if not src_obj.is_file():
            raise IsADirectoryError(f"Source is a directory, not a file: {src}")

        # Create parent directories for destination
        dst_obj.parent.mkdir(parents=True, exist_ok=True)

        # Backup destination if it exists
        backup_info = None
        if backup_dst and dst_obj.exists():
            backup_info = self.backup_file(dst_obj)

        try:
            shutil.copy2(src_obj, dst_obj)  # copy2 preserves metadata

            self.logger.info(f"File copied: {src_obj} -> {dst_obj}")

            result = {
                "source": str(src_obj.absolute()),
                "destination": str(dst_obj.absolute()),
                "size": dst_obj.stat().st_size,
                "success": True,
            }

            if backup_info:
                result["backup"] = backup_info

            return result

        except Exception as e:
            self.logger.error(f"Failed to copy file {src} to {dst}: {str(e)}")
            raise

    def move_file(
        self, src: Union[str, Path], dst: Union[str, Path], backup_dst: bool = True
    ) -> Dict[str, Any]:
        """Move/rename a file"""
        src_obj = Path(src)
        dst_obj = Path(dst)

        if not src_obj.exists():
            raise FileNotFoundError(f"Source file does not exist: {src}")

        if not src_obj.is_file():
            raise IsADirectoryError(f"Source is a directory, not a file: {src}")

        # Create parent directories for destination
        dst_obj.parent.mkdir(parents=True, exist_ok=True)

        # Backup destination if it exists
        backup_info = None
        if backup_dst and dst_obj.exists():
            backup_info = self.backup_file(dst_obj)

        try:
            shutil.move(str(src_obj), str(dst_obj))

            self.logger.info(f"File moved: {src_obj} -> {dst_obj}")

            result = {
                "source": str(src_obj.absolute()),
                "destination": str(dst_obj.absolute()),
                "success": True,
            }

            if backup_info:
                result["backup"] = backup_info

            return result

        except Exception as e:
            self.logger.error(f"Failed to move file {src} to {dst}: {str(e)}")
            raise

    def get_file_info(self, path: Union[str, Path]) -> Dict[str, Any]:
        """Get detailed information about a file"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"Path does not exist: {path}")

        stat = path_obj.stat()

        info = {
            "path": str(path_obj.absolute()),
            "name": path_obj.name,
            "is_file": path_obj.is_file(),
            "is_dir": path_obj.is_dir(),
            "size": stat.st_size,
            "modified_time": stat.st_mtime,
            "created_time": stat.st_ctime,
            "accessed_time": stat.st_atime,
            "permissions": oct(stat.st_mode)[-3:],
            "owner_uid": stat.st_uid,
            "group_gid": stat.st_gid,
            "mime_type": mimetypes.guess_type(str(path_obj))[0]
            if path_obj.is_file()
            else None,
            "extension": path_obj.suffix.lower() if path_obj.is_file() else None,
            "stem": path_obj.stem if path_obj.is_file() else None,
        }

        # Add hash for files
        if path_obj.is_file():
            try:
                info["md5"] = self._get_file_hash(path_obj, "md5")
                info["sha1"] = self._get_file_hash(path_obj, "sha1")
                info["sha256"] = self._get_file_hash(path_obj, "sha256")
            except Exception as e:
                self.logger.warning(f"Could not compute hashes for {path}: {str(e)}")
                info["hash_error"] = str(e)

        return info

    def search_files(
        self,
        directory: Union[str, Path],
        pattern: str = "*",
        recursive: bool = True,
        file_only: bool = False,
        dir_only: bool = False,
    ) -> List[Dict[str, Any]]:
        """Search for files and directories matching a pattern"""
        dir_obj = Path(directory)

        if not dir_obj.exists():
            raise FileNotFoundError(f"Directory does not exist: {directory}")

        if not dir_obj.is_dir():
            raise NotADirectoryError(f"Path is not a directory: {directory}")

        # Determine search method
        if recursive:
            iterator = dir_obj.rglob(pattern)
        else:
            iterator = dir_obj.glob(pattern)

        results = []

        for item in iterator:
            # Skip if we only want files and this is a directory
            if file_only and not item.is_file():
                continue

            # Skip if we only want directories and this is a file
            if dir_only and not item.is_dir():
                continue

            try:
                stat = item.stat()
                item_info = {
                    "name": item.name,
                    "path": str(item.absolute()),
                    "relative_path": str(item.relative_to(dir_obj)),
                    "is_file": item.is_file(),
                    "is_dir": item.is_dir(),
                    "size": stat.st_size if item.is_file() else 0,
                    "modified_time": stat.st_mtime,
                    "created_time": stat.st_ctime,
                    "permissions": oct(stat.st_mode)[-3:],
                    "mime_type": mimetypes.guess_type(str(item))[0]
                    if item.is_file()
                    else None,
                }
                results.append(item_info)
            except (OSError, PermissionError) as e:
                self.logger.warning(f"Could not access {item}: {str(e)}")
                continue

        # Sort by path
        results.sort(key=lambda x: x["path"])
        return results

    def get_directory_size(self, path: Union[str, Path]) -> Dict[str, Any]:
        """Get total size of a directory"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"Directory does not exist: {path}")

        if not path_obj.is_dir():
            raise NotADirectoryError(f"Path is not a directory: {path}")

        total_size = 0
        file_count = 0
        dir_count = 0

        for item in path_obj.rglob("*"):
            try:
                if item.is_file():
                    total_size += item.stat().st_size
                    file_count += 1
                elif item.is_dir():
                    dir_count += 1
            except (OSError, PermissionError):
                # Skip items we can't access
                continue

        return {
            "path": str(path_obj.absolute()),
            "total_size": total_size,
            "file_count": file_count,
            "directory_count": dir_count,
            "size_human": self._format_bytes(total_size),
        }

    def backup_file(self, path: Union[str, Path]) -> Dict[str, Any]:
        """Create a backup of a file"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"File does not exist: {path}")

        if not path_obj.is_file():
            raise IsADirectoryError(f"Path is a directory, not a file: {path}")

        # Generate backup filename
        timestamp = int(time.time())
        backup_name = f"{path_obj.name}.backup.{timestamp}"
        backup_path = path_obj.parent / backup_name

        try:
            shutil.copy2(path_obj, backup_path)

            self.logger.info(f"File backed up: {path_obj} -> {backup_path}")

            return {
                "original": str(path_obj.absolute()),
                "backup": str(backup_path.absolute()),
                "timestamp": timestamp,
                "success": True,
            }
        except Exception as e:
            self.logger.error(f"Failed to backup file {path}: {str(e)}")
            raise

    def backup_dir(self, path: Union[str, Path]) -> Dict[str, Any]:
        """Create a backup of a directory"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"Directory does not exist: {path}")

        if not path_obj.is_dir():
            raise NotADirectoryError(f"Path is not a directory: {path}")

        # Generate backup directory name
        timestamp = int(time.time())
        backup_name = f"{path_obj.name}.backup.{timestamp}"
        backup_path = path_obj.parent / backup_name

        try:
            shutil.copytree(path_obj, backup_path)

            self.logger.info(f"Directory backed up: {path_obj} -> {backup_path}")

            return {
                "original": str(path_obj.absolute()),
                "backup": str(backup_path.absolute()),
                "timestamp": timestamp,
                "success": True,
            }
        except Exception as e:
            self.logger.error(f"Failed to backup directory {path}: {str(e)}")
            raise

    def restore_from_backup(
        self,
        backup_path: Union[str, Path],
        original_path: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Restore from a backup"""
        backup_obj = Path(backup_path)

        if not backup_obj.exists():
            raise FileNotFoundError(f"Backup does not exist: {backup_path}")

        # Determine original path if not provided
        if original_path is None:
            # Try to infer from backup name
            backup_name = backup_obj.name
            if ".backup." in backup_name:
                original_name = backup_name.split(".backup.")[0]
                original_path = backup_obj.parent / original_name
            else:
                raise ValueError(
                    "Cannot infer original path from backup name and none provided"
                )

        original_obj = Path(original_path)

        try:
            if backup_obj.is_file():
                if original_obj.exists():
                    # Create backup of current file before restoring
                    self.backup_file(original_obj)
                shutil.copy2(backup_obj, original_obj)
            else:
                if original_obj.exists():
                    # Remove current directory before restoring
                    shutil.rmtree(original_obj)
                shutil.copytree(backup_obj, original_obj)

            self.logger.info(f"Restored from backup: {backup_obj} -> {original_obj}")

            return {
                "backup": str(backup_obj.absolute()),
                "original": str(original_obj.absolute()),
                "success": True,
            }
        except Exception as e:
            self.logger.error(f"Failed to restore from backup {backup_path}: {str(e)}")
            raise

    def _get_file_hash(self, path: Union[str, Path], algorithm: str = "md5") -> str:
        """Calculate hash of a file"""
        path_obj = Path(path)

        hash_obj = hashlib.new(algorithm)

        with open(path_obj, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_obj.update(chunk)

        return hash_obj.hexdigest()

    def _format_bytes(self, bytes_count: int) -> str:
        """Format bytes into human readable format"""
        count = float(bytes_count)
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if count < 1024.0:
                return f"{count:.1f} {unit}"
            count /= 1024.0
        return f"{count:.1f} PB"

    def set_permissions(
        self, path: Union[str, Path], mode: Union[int, str]
    ) -> Dict[str, Any]:
        """Set file permissions"""
        path_obj = Path(path)

        if not path_obj.exists():
            raise FileNotFoundError(f"Path does not exist: {path}")

        try:
            if isinstance(mode, str):
                # Convert string like '755' to integer
                mode_int = int(mode, 8)
            else:
                mode_int = mode

            os.chmod(path_obj, mode_int)

            self.logger.info(f"Permissions set: {path_obj} -> {oct(mode_int)[-3:]}")

            return {
                "path": str(path_obj.absolute()),
                "mode": oct(mode_int)[-3:],
                "success": True,
            }
        except Exception as e:
            self.logger.error(f"Failed to set permissions on {path}: {str(e)}")
            raise
