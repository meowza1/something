"""
Web scraping module for LLM Terminal API
Provides advanced web scraping capabilities with stealth and anti-detection features
"""

import requests
import time
import random
from typing import Dict, List, Optional, Any, Union
from urllib.parse import urljoin, urlparse
from requests.adapters import HTTPAdapter
from requests.models import Response
import json
import logging

try:
    from bs4 import BeautifulSoup

    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    BeautifulSoup = None

from ..core.config import Config


class WebScraper:
    """Advanced web scraping capabilities for LLM agents"""

    def __init__(self, config: Config):
        self.config = config
        self.session = requests.Session()
        self.logger = logging.getLogger(__name__)

        # Set default headers
        self.session.headers.update(
            {
                "User-Agent": self.config.user_agent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
        )

        # Configure session
        self.session.max_redirects = self.config.max_retries
        adapter = HTTPAdapter(
            pool_connections=10, pool_maxsize=20, max_retries=self.config.max_retries
        )
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def get(
        self,
        url: str,
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        timeout: Optional[int] = None,
    ) -> requests.Response:
        """Perform a GET request with retry logic and stealth features"""
        timeout = timeout or self.config.scrape_timeout

        # Rotate user agent for stealth
        if self.config.stealth_enabled and hasattr(self.config, "stealth_user_agents"):
            ua = random.choice(self.config.stealth_user_agents)
            headers = headers or {}
            headers["User-Agent"] = ua

        # Add delay for stealth
        if self.config.scraping_enabled:
            time.sleep(random.uniform(0.5, self.config.scraping_delay))

        for attempt in range(self.config.max_retries):
            try:
                response = self.session.get(
                    url, params=params, headers=headers, timeout=timeout
                )
                response.raise_for_status()
                return response
            except requests.RequestException as e:
                self.logger.warning(f"Attempt {attempt + 1} failed for {url}: {str(e)}")
                if attempt == self.config.max_retries - 1:
                    raise
                time.sleep(2**attempt)  # Exponential backoff
        # This should never be reached, but added for type checker
        raise requests.RequestException("Max retries exceeded")

    def post(
        self,
        url: str,
        data: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        timeout: Optional[int] = None,
    ) -> requests.Response:
        """Perform a POST request with retry logic"""
        timeout = timeout or self.config.scrape_timeout

        # Rotate user agent for stealth
        if self.config.stealth_enabled and hasattr(self.config, "stealth_user_agents"):
            ua = random.choice(self.config.stealth_user_agents)
            headers = headers or {}
            headers["User-Agent"] = ua

        # Add delay for stealth
        if self.config.scraping_enabled:
            time.sleep(random.uniform(0.5, self.config.scraping_delay))

        for attempt in range(self.config.max_retries):
            try:
                response = self.session.post(
                    url, data=data, json=json_data, headers=headers, timeout=timeout
                )
                response.raise_for_status()
                return response
            except requests.RequestException as e:
                self.logger.warning(f"Attempt {attempt + 1} failed for {url}: {str(e)}")
                if attempt == self.config.max_retries - 1:
                    raise
                time.sleep(2**attempt)  # Exponential backoff
        # This should never be reached, but added for type checker
        raise requests.RequestException("Max retries exceeded")

    def scrape_html(self, url: str, parser: str = "html.parser") -> Any:
        """Scrape HTML content and return BeautifulSoup object"""
        if not HAS_BS4:
            raise ImportError(
                "BeautifulSoup4 is required for HTML scraping. Install with: pip install beautifulsoup4"
            )
        if not HAS_BS4:
            raise ImportError(
                "BeautifulSoup4 is required for HTML scraping. Install with: pip install beautifulsoup4"
            )
        response = self.get(url)
        return BeautifulSoup(response.content, parser)

    def scrape_json(
        self, url: str, params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Scrape JSON content from API endpoint"""
        response = self.get(url, params=params)
        return response.json()

    def extract_text(self, url: str, selector: Optional[str] = None) -> str:
        """Extract text content from webpage"""
        if not HAS_BS4:
            raise ImportError(
                "BeautifulSoup4 is required for HTML scraping. Install with: pip install beautifulsoup4"
            )
        soup = self.scrape_html(url)
        if selector:
            elements = soup.select(selector)
            return "\n".join([elem.get_text(strip=True) for elem in elements])
        return soup.get_text(strip=True)

    def extract_links(
        self, url: str, selector: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Extract all links from webpage"""
        if not HAS_BS4:
            raise ImportError(
                "BeautifulSoup4 is required for HTML scraping. Install with: pip install beautifulsoup4"
            )
        soup = self.scrape_html(url)
        links = []

        if selector:
            elements = soup.select(selector)
        else:
            elements = soup.find_all("a", href=True)

        for elem in elements:
            href = elem.get("href")
            if href:
                absolute_url = urljoin(url, href)
                links.append(
                    {
                        "text": elem.get_text(strip=True),
                        "url": absolute_url,
                        "href": href,
                    }
                )

        return links

    def extract_images(
        self, url: str, selector: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Extract all images from webpage"""
        if not HAS_BS4:
            raise ImportError(
                "BeautifulSoup4 is required for HTML scraping. Install with: pip install beautifulsoup4"
            )
        soup = self.scrape_html(url)
        images = []

        if selector:
            elements = soup.select(selector)
        else:
            elements = soup.find_all("img", src=True)

        for elem in elements:
            src = elem.get("src")
            if src:
                absolute_url = urljoin(url, src)
                images.append(
                    {"alt": elem.get("alt", ""), "url": absolute_url, "src": src}
                )

        return images

    def extract_tables(
        self, url: str, selector: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Extract tables from webpage as structured data"""
        if not HAS_BS4:
            raise ImportError(
                "BeautifulSoup4 is required for HTML scraping. Install with: pip install beautifulsoup4"
            )
        soup = self.scrape_html(url)
        tables = []

        if selector:
            elements = soup.select(selector)
        else:
            elements = soup.find_all("table")

        for table in elements:
            # Extract headers
            headers = []
            header_row = table.find("thead")
            if header_row:
                headers = [th.get_text(strip=True) for th in header_row.find_all("th")]
            else:
                # Try first row as headers
                first_row = table.find("tr")
                if first_row:
                    headers = [
                        th.get_text(strip=True)
                        for th in first_row.find_all(["th", "td"])
                    ]

            # Extract rows
            rows = []
            tbody = table.find("tbody") or table
            for tr in tbody.find_all("tr"):
                # Skip header row if we already processed it
                if header_row and tr.find_parent("thead"):
                    continue
                cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                if cells:  # Only add non-empty rows
                    rows.append(cells)

            # Convert to list of dicts if we have headers
            if headers and len(headers) == len(rows[0]) if rows else False:
                table_data = [dict(zip(headers, row)) for row in rows]
            else:
                table_data = rows

            tables.append({"headers": headers, "rows": rows, "data": table_data})

        return tables

    def scrape_multiple(self, urls: List[str], callback=None) -> List[Dict[str, Any]]:
        """Scrape multiple URLs with optional callback for processing"""
        results = []

        for url in urls:
            try:
                response = self.get(url)
                result = {
                    "url": url,
                    "status_code": response.status_code,
                    "content": response.text,
                    "headers": dict(response.headers),
                }

                if callback:
                    result["processed"] = callback(response)

                results.append(result)
            except Exception as e:
                results.append({"url": url, "error": str(e), "status_code": None})

        return results

    def search_google(self, query: str, num_results: int = 10) -> List[Dict[str, str]]:
        """Search Google and return results (requires proper user agent rotation)"""
        # Note: This is a simplified version. In production, you'd need to handle
        # Google's anti-bot measures more carefully
        search_url = "https://www.google.com/search"
        params = {"q": query, "num": num_results, "hl": "en"}

        try:
            response = self.get(search_url, params=params)
            if not HAS_BS4:
                raise ImportError(
                    "BeautifulSoup4 is required for HTML scraping. Install with: pip install beautifulsoup4"
                )
            soup = BeautifulSoup(response.content, "html.parser")

            results = []
            for g in soup.find_all("div", class_="g"):
                anchors = g.find_all("a")
                if anchors:
                    link = anchors[0].get("href")
                    title = g.find("h3")
                    title_text = title.get_text() if title else ""
                    snippet = g.find("div", class_="VwiC3b")
                    snippet_text = snippet.get_text() if snippet else ""

                    if link and link.startswith("http"):
                        results.append(
                            {"title": title_text, "link": link, "snippet": snippet_text}
                        )

            return results[:num_results]
        except Exception as e:
            self.logger.error(f"Google search failed: {str(e)}")
            return []

    def download_file(self, url: str, save_path: str, chunk_size: int = 8192) -> bool:
        """Download a file from URL to local path"""
        try:
            response = self.get(url, timeout=60)  # Longer timeout for downloads
            response.raise_for_status()

            with open(save_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=chunk_size):
                    if chunk:
                        f.write(chunk)

            return True
        except Exception as e:
            self.logger.error(f"Failed to download {url}: {str(e)}")
            return False
