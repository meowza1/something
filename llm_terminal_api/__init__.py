"""
LLM Terminal API - Advanced API for LLM agents to use inside terminals
Supports web scraping, browser automation, custom terminal, file operations, and more
"""

__version__ = "1.0.0"
__author__ = "LLM Agent Community"

# Core imports
from .core.api import LLMApi
from .core.config import Config

# Module imports
from .scraping.web_scraper import WebScraper
from .browser.automation import BrowserAutomation
from .terminal.interface import CustomTerminal
from .env.manager import EnvironmentManager
from .file.manager import FileManager
from .pentest.tools import PentestTools
from .tools.scraping import ScrapingTools
from .reading.tools import ReadingTools
from .writing.tools import WritingTools
from .api.discord import DiscordAPI
from .monitoring.tools import MonitoringTools
from .timeout.manager import TimeoutManager
from .stealth.tools import StealthTools
from .backup.manager import BackupManager
from .automation.engine import AutomationEngine

__all__ = [
    "LLMApi",
    "Config",
    "WebScraper",
    "BrowserAutomation",
    "CustomTerminal",
    "EnvironmentManager",
    "FileManager",
    "PentestTools",
    "ScrapingTools",
    "ReadingTools",
    "WritingTools",
    "DiscordAPI",
    "MonitoringTools",
    "TimeoutManager",
    "StealthTools",
    "BackupManager",
    "AutomationEngine",
]
