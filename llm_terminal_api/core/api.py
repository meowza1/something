"""
Main API class for LLM Terminal API
"""

import os
import sys
from typing import Dict, Any, Optional
from .config import Config

# Import all modules (will be implemented)
try:
    from ..scraping.web_scraper import WebScraper
except ImportError:
    WebScraper = None

try:
    from ..browser.automation import BrowserAutomation
except ImportError:
    BrowserAutomation = None

try:
    from ..terminal.interface import CustomTerminal
except ImportError:
    CustomTerminal = None

try:
    from ..env.manager import EnvironmentManager
except ImportError:
    EnvironmentManager = None

try:
    from ..file.manager import FileManager
except ImportError:
    FileManager = None

try:
    from ..pentest.tools import PentestTools
except ImportError:
    PentestTools = None

try:
    from ..tools.scraping import ScrapingTools
except ImportError:
    ScrapingTools = None

try:
    from ..reading.tools import ReadingTools
except ImportError:
    ReadingTools = None

try:
    from ..writing.tools import WritingTools
except ImportError:
    WritingTools = None

try:
    from ..api.discord import DiscordAPI
except ImportError:
    DiscordAPI = None

try:
    from ..monitoring.tools import MonitoringTools
except ImportError:
    MonitoringTools = None

try:
    from ..timeout.manager import TimeoutManager
except ImportError:
    TimeoutManager = None

try:
    from ..stealth.tools import StealthTools
except ImportError:
    StealthTools = None

try:
    from ..backup.manager import BackupManager
except ImportError:
    BackupManager = None

try:
    from ..automation.engine import AutomationEngine
except ImportError:
    AutomationEngine = None


class LLMApi:
    """Main API class that provides access to all terminal capabilities for LLM agents"""

    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config()
        self._modules = {}
        self._initialize_modules()

    def _initialize_modules(self):
        """Initialize all available modules"""
        module_classes = {
            "web_scraper": WebScraper,
            "browser": BrowserAutomation,
            "terminal": CustomTerminal,
            "env": EnvironmentManager,
            "file": FileManager,
            "pentest": PentestTools,
            "scraping": ScrapingTools,
            "reading": ReadingTools,
            "writing": WritingTools,
            "discord": DiscordAPI,
            "monitoring": MonitoringTools,
            "timeout": TimeoutManager,
            "stealth": StealthTools,
            "backup": BackupManager,
            "automation": AutomationEngine,
        }

        for name, module_class in module_classes.items():
            if module_class is not None:
                try:
                    self._modules[name] = module_class(self.config)
                except Exception as e:
                    # Module failed to initialize, but we continue
                    self._modules[name] = None
            else:
                self._modules[name] = None

    def __getattr__(self, name: str) -> Any:
        """Dynamically access modules as attributes"""
        if name in self._modules:
            module = self._modules[name]
            if module is None:
                raise AttributeError(
                    f"Module '{name}' is not available or failed to initialize"
                )
            return module
        raise AttributeError(
            f"'{self.__class__.__name__}' object has no attribute '{name}'"
        )

    def list_modules(self) -> Dict[str, bool]:
        """List all available modules and their status"""
        return {name: module is not None for name, module in self._modules.items()}

    def get_module(self, name: str) -> Any:
        """Get a specific module by name"""
        if name in self._modules:
            module = self._modules[name]
            if module is None:
                raise ValueError(f"Module '{name}' is not available")
            return module
        raise ValueError(f"Unknown module: {name}")
