"""
Configuration management for LLM Terminal API
"""

import os
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Config:
    """Configuration class for LLM Terminal API"""

    # Web scraping settings
    web_scraping_enabled: bool = True
    scrape_timeout: int = 30
    max_retries: int = 3
    user_agent: str = "LLM-Agent/1.0"

    # Browser automation settings
    browser_enabled: bool = True
    browser_headless: bool = True
    browser_timeout: int = 30

    # Terminal settings
    terminal_enabled: bool = True
    terminal_history_size: int = 1000
    terminal_cols: int = 80
    terminal_rows: int = 24

    # Environment settings
    env_enabled: bool = True
    env_snapshot_dir: str = "./env_snapshots"
    env_auto_save: bool = True

    # File management settings
    file_enabled: bool = True
    file_max_size: int = 100 * 1024 * 1024  # 100MB
    file_allowed_extensions: Optional[list] = None  # None means all allowed

    # Pentest settings
    pentest_enabled: bool = True
    pentest_safe_mode: bool = (
        True  # Only allow safe scanning on localhost/private networks
    )

    # Scraping tools settings
    scraping_enabled: bool = True
    scraping_delay: float = 1.0  # Delay between requests

    # Reading tools settings
    reading_enabled: bool = True
    reading_max_file_size: int = 50 * 1024 * 1024  # 50MB

    # Writing tools settings
    writing_enabled: bool = True
    writing_backup_enabled: bool = True

    # Discord API settings
    discord_enabled: bool = False  # Disabled by default, requires token
    discord_token: Optional[str] = None
    discord_rate_limit: int = 5  # Requests per second

    # Monitoring settings
    monitoring_enabled: bool = True
    monitoring_log_level: str = "INFO"
    monitoring_log_file: Optional[str] = None

    # Timeout settings
    timeout_enabled: bool = True
    timeout_default: int = 20  # Default timeout in seconds
    timeout_max: int = 300  # Maximum timeout allowed

    # Stealth settings
    stealth_enabled: bool = True
    stealth_user_agents: list = field(
        default_factory=lambda: [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        ]
    )

    # Backup settings
    backup_enabled: bool = True
    backup_dir: str = "./backups"
    backup_retention_count: int = 10  # Keep last 10 backups
    backup_auto: bool = True

    # Automation settings
    automation_enabled: bool = True
    automation_max_workers: int = 4
    automation_task_timeout: int = 300  # 5 minutes

    # General settings
    debug: bool = False
    log_level: str = "INFO"

    def __post_init__(self):
        """Post-initialization processing"""
        # Load from environment variables
        self._load_from_env()

        # Load from config file if exists
        self._load_from_file()

    def _load_from_env(self):
        """Load configuration from environment variables"""
        env_mapping = {
            "LLM_WEB_SCRAPING_ENABLED": ("web_scraping_enabled", bool),
            "LLM_SCRAPE_TIMEOUT": ("scrape_timeout", int),
            "LLM_MAX_RETRIES": ("max_retries", int),
            "LLM_USER_AGENT": ("user_agent", str),
            "LLM_BROWSER_ENABLED": ("browser_enabled", bool),
            "LLM_BROWSER_HEADLESS": ("browser_headless", bool),
            "LLM_BROWSER_TIMEOUT": ("browser_timeout", int),
            "LLM_TERMINAL_ENABLED": ("terminal_enabled", bool),
            "LLM_TERMINAL_HISTORY_SIZE": ("terminal_history_size", int),
            "LLM_TERMINAL_COLS": ("terminal_cols", int),
            "LLM_TERMINAL_ROWS": ("terminal_rows", int),
            "LLM_ENV_ENABLED": ("env_enabled", bool),
            "LLM_ENV_SNAPSHOT_DIR": ("env_snapshot_dir", str),
            "LLM_ENV_AUTO_SAVE": ("env_auto_save", bool),
            "LLM_FILE_ENABLED": ("file_enabled", bool),
            "LLM_FILE_MAX_SIZE": ("file_max_size", int),
            "LLM_PENTEST_ENABLED": ("pentest_enabled", bool),
            "LLM_PENTEST_SAFE_MODE": ("pentest_safe_mode", bool),
            "LLM_SCRAPING_ENABLED": ("scraping_enabled", bool),
            "LLM_SCRAPING_DELAY": ("scraping_delay", float),
            "LLM_READING_ENABLED": ("reading_enabled", bool),
            "LLM_READING_MAX_FILE_SIZE": ("reading_max_file_size", int),
            "LLM_WRITING_ENABLED": ("writing_enabled", bool),
            "LLM_WRITING_BACKUP_ENABLED": ("writing_backup_enabled", bool),
            "LLM_DISCORD_ENABLED": ("discord_enabled", bool),
            "LLM_DISCORD_TOKEN": ("discord_token", str),
            "LLM_DISCORD_RATE_LIMIT": ("discord_rate_limit", int),
            "LLM_MONITORING_ENABLED": ("monitoring_enabled", bool),
            "LLM_MONITORING_LOG_LEVEL": ("monitoring_log_level", str),
            "LLM_MONITORING_LOG_FILE": ("monitoring_log_file", str),
            "LLM_TIMEOUT_ENABLED": ("timeout_enabled", bool),
            "LLM_TIMEOUT_DEFAULT": ("timeout_default", int),
            "LLM_TIMEOUT_MAX": ("timeout_max", int),
            "LLM_STEALTH_ENABLED": ("stealth_enabled", bool),
            "LLM_BACKUP_ENABLED": ("backup_enabled", bool),
            "LLM_BACKUP_DIR": ("backup_dir", str),
            "LLM_BACKUP_RETENTION_COUNT": ("backup_retention_count", int),
            "LLM_BACKUP_AUTO": ("backup_auto", bool),
            "LLM_AUTOMATION_ENABLED": ("automation_enabled", bool),
            "LLM_AUTOMATION_MAX_WORKERS": ("automation_max_workers", int),
            "LLM_AUTOMATION_TASK_TIMEOUT": ("automation_task_timeout", int),
            "LLM_DEBUG": ("debug", bool),
            "LLM_LOG_LEVEL": ("log_level", str),
        }

        for env_var, (attr, type_func) in env_mapping.items():
            value = os.getenv(env_var)
            if value is not None:
                try:
                    if type_func == bool:
                        setattr(self, attr, value.lower() in ("true", "1", "yes", "on"))
                    elif type_func == int:
                        setattr(self, attr, int(value))
                    elif type_func == float:
                        setattr(self, attr, float(value))
                    else:
                        setattr(self, attr, type_func(value))
                except ValueError:
                    # Keep default value if conversion fails
                    pass

    def _load_from_file(self):
        """Load configuration from JSON file"""
        config_paths = [
            "./kilo.json",
            "./.kilo/kilo.json",
            "../kilo.json",
            "../.kilo/kilo.json",
            os.path.expanduser("~/.config/kilo/kilo.json"),
        ]

        for config_path in config_paths:
            if os.path.exists(config_path):
                try:
                    with open(config_path, "r") as f:
                        config_data = json.load(f)

                    # Update attributes from config file
                    for key, value in config_data.items():
                        if hasattr(self, key):
                            setattr(self, key, value)
                    break  # Use first found config file
                except (json.JSONDecodeError, IOError):
                    # Continue to next config file
                    continue

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary"""
        return {
            key: value
            for key, value in self.__dict__.items()
            if not key.startswith("_")
        }

    def save_to_file(self, file_path: str):
        """Save current configuration to a JSON file"""
        config_dict = self.to_dict()
        with open(file_path, "w") as f:
            json.dump(config_dict, f, indent=2)
