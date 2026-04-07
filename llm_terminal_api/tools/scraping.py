"""
Scraping tools module for LLM Terminal API
Provides specialized scraping utilities for LLM agents
"""

import re
import json
import csv
import time
from typing import Dict, List, Optional, Any, Union
from urllib.parse import urljoin, urlparse, parse_qs
from ..core.config import Config
import logging


class ScrapingTools:
    """Specialized scraping tools for LLM agents"""

    def __init__(self, config: Config):
        self.config = config
        self.logger = logging.getLogger(__name__)

    def extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text"""
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        emails = re.findall(email_pattern, text)
        # Remove duplicates while preserving order
        seen = set()
        unique_emails = []
        for email in emails:
            if email.lower() not in seen:
                seen.add(email.lower())
                unique_emails.append(email)
        return unique_emails

    def extract_phone_numbers(self, text: str, country_code: str = "US") -> List[str]:
        """Extract phone numbers from text"""
        # Basic US phone number pattern
        if country_code.upper() == "US":
            patterns = [
                r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",  # 123-456-7890 or 1234567890
                r"\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b",  # (123) 456-7890
                r"\b\d{3}\s\d{3}\s\d{4}\b",  # 123 456 7890
                r"\b\d{3}[-.]?\d{4}\b",  # 7-digit numbers
            ]
        else:
            # Generic international pattern (simplified)
            patterns = [
                r"\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}",  # +1 234 567 8901
                r"\+\d{1,3}\s?\d{1,14}",  # + followed by digits
                r"\b\d{1,4}\s?\d{1,4}\s?\d{1,9}\b",  # Local formats
            ]

        phone_numbers = []
        for pattern in patterns:
            matches = re.findall(pattern, text)
            phone_numbers.extend(matches)

        # Clean up and remove duplicates
        cleaned = []
        seen = set()
        for phone in phone_numbers:
            # Remove extra characters for comparison
            cleaned_phone = re.sub(r"[^\d+]", "", phone)
            if cleaned_phone not in seen and len(cleaned_phone) >= 7:
                seen.add(cleaned_phone)
                cleaned.append(phone)

        return cleaned

    def extract_urls(self, text: str, base_url: Optional[str] = None) -> List[str]:
        """Extract URLs from text"""
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, text)

        # Convert relative URLs to absolute if base_url provided
        if base_url:
            absolute_urls = []
            for url in urls:
                absolute_url = urljoin(base_url, url)
                absolute_urls.append(absolute_url)
            urls = absolute_urls

        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url in urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        return unique_urls

    def extract_social_media(self, text: str) -> Dict[str, List[str]]:
        """Extract social media handles/urls from text"""
        patterns = {
            "twitter": r"(?:@|\bhttps?://(?:www\.)?twitter\.com/)([A-Za-z0-9_]{1,15})\b",
            "facebook": r"(?:https?://(?:www\.)?facebook\.com/)([A-Za-z0-9\.]{5,})",
            "instagram": r"(?:@|\bhttps?://(?:www\.)?instagram\.com/)([A-Za-z0-9_]{1,30})\b",
            "linkedin": r"(?:https?://(?:www\.)?linkedin\.com/(?:in|company)/)([A-Za-z0-9\-_]+)",
            "youtube": r"(?:https?://(?:www\.)?youtube\.com/(?:user|channel|@)/)([A-Za-z0-9_\-]+)",
            "tiktok": r"(?:@|\bhttps?://(?:www\.)?tiktok\.com/@)([A-Za-z0-9_.]{1,24})\b",
        }

        results = {platform: [] for platform in patterns.keys()}

        for platform, pattern in patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            results[platform] = list(set(matches))  # Remove duplicates

        return results

    def extract_meta_tags(self, html_content: str) -> Dict[str, str]:
        """Extract meta tags from HTML content"""
        meta_pattern = r'<meta[^>]*name\s*=\s*["\']([^"\']*)["\'][^>]*content\s*=\s*["\']([^"\']*)["\'][^>]*>'
        meta_tags = {}

        matches = re.findall(meta_pattern, html_content, re.IGNORECASE)
        for name, content in matches:
            meta_tags[name.lower()] = content

        # Also extract property-based meta tags (OG tags)
        og_pattern = r'<meta[^>]*property\s*=\s*["\']([^"\']*)["\'][^>]*content\s*=\s*["\']([^"\']*)["\'][^>]*>'
        og_matches = re.findall(og_pattern, html_content, re.IGNORECASE)
        for property_name, content in og_matches:
            meta_tags[property_name.lower()] = content

        return meta_tags

    def extract_forms(self, html_content: str) -> List[Dict[str, Any]]:
        """Extract form information from HTML content"""
        # Simple regex-based form extraction (for demonstration)
        # In production, you'd want to use a proper HTML parser

        form_pattern = r"<form[^>]*>(.*?)</form>"
        input_pattern = r"<input[^>]*>"
        select_pattern = r"<select[^>]*>.*?</select>"
        textarea_pattern = r"<textarea[^>]*>.*?</textarea>"

        forms = []
        form_matches = re.findall(form_pattern, html_content, re.IGNORECASE | re.DOTALL)

        for i, form_content in enumerate(form_matches):
            form_info = {
                "form_index": i,
                "action": self._extract_attribute(form_content, "action"),
                "method": self._extract_attribute(
                    form_content, "method", "get"
                ).lower(),
                "inputs": [],
                "selects": [],
                "textareas": [],
            }

            # Extract inputs
            input_matches = re.findall(input_pattern, form_content, re.IGNORECASE)
            for inp in input_matches:
                input_type = self._extract_attribute(inp, "type", "text")
                input_name = self._extract_attribute(inp, "name")
                input_value = self._extract_attribute(inp, "value", "")

                form_info["inputs"].append(
                    {"type": input_type, "name": input_name, "value": input_value}
                )

            # Extract selects
            select_matches = re.findall(
                select_pattern, form_content, re.IGNORECASE | re.DOTALL
            )
            for select in select_matches:
                select_name = self._extract_attribute(select, "name")
                options = re.findall(
                    r'<option[^>]*value\s*=\s*["\']([^"\']*)["\'][^>]*>([^<]*)</option>',
                    select,
                    re.IGNORECASE,
                )

                form_info["selects"].append(
                    {
                        "name": select_name,
                        "options": [
                            {"value": val, "text": text} for val, text in options
                        ],
                    }
                )

            # Extract textareas
            textarea_matches = re.findall(
                textarea_pattern, form_content, re.IGNORECASE | re.DOTALL
            )
            for textarea in textarea_matches:
                textarea_name = self._extract_attribute(textarea, "name")
                textarea_value = re.sub(r"<[^>]+>", "", textarea).strip()

                form_info["textareas"].append(
                    {"name": textarea_name, "value": textarea_value}
                )

            forms.append(form_info)

        return forms

    def _extract_attribute(self, tag: str, attribute: str, default: str = "") -> str:
        """Extract attribute value from HTML tag"""
        pattern = rf'{attribute}\s*=\s*["\']([^"\']*)["\']'
        match = re.search(pattern, tag, re.IGNORECASE)
        if match:
            return match.group(1)
        return default

    def clean_text(
        self,
        text: str,
        remove_extra_whitespace: bool = True,
        remove_special_chars: bool = False,
        keep_numbers: bool = True,
        keep_letters: bool = True,
    ) -> str:
        """Clean and normalize text"""
        if not text:
            return ""

        # Remove extra whitespace
        if remove_extra_whitespace:
            text = re.sub(r"\s+", " ", text)
            text = text.strip()

        # Remove special characters if requested
        if remove_special_chars:
            # Keep letters, numbers, and basic punctuation
            pattern = (
                r"[^a-zA-Z0-9\s\.\,\!\?\-]"
                if keep_letters and keep_numbers
                else r"[^a-zA-Z\s\.\,\!\?\-]"
                if keep_letters
                else r"[^0-9\s\.\,\!\?\-]"
                if keep_numbers
                else r"[^\s\.\,\!\?\-]"
            )
            text = re.sub(pattern, "", text)

        return text

    def extract_json_ld(self, html_content: str) -> List[Dict[str, Any]]:
        """Extract JSON-LD structured data from HTML"""
        json_ld_pattern = (
            r'<script[^>]*type\s*=\s*["\']application/ld\+json["\'][^>]*>(.*?)</script>'
        )
        json_ld_scripts = re.findall(
            json_ld_pattern, html_content, re.IGNORECASE | re.DOTALL
        )

        structured_data = []
        for script in json_ld_scripts:
            try:
                data = json.loads(script.strip())
                structured_data.append(data)
            except json.JSONDecodeError as e:
                self.logger.warning(f"Failed to parse JSON-LD: {str(e)}")
                continue

        return structured_data

    def extract_open_graph(self, html_content: str) -> Dict[str, str]:
        """Extract Open Graph protocol data"""
        og_pattern = r'<meta[^>]*property\s*=\s*["\']og:([^"\']*)["\'][^>]*content\s*=\s*["\']([^"\']*)["\'][^>]*>'
        og_matches = re.findall(og_pattern, html_content, re.IGNORECASE)

        og_data = {}
        for property_name, content in og_matches:
            og_data[property_name.lower()] = content

        return og_data

    def extract_twitter_cards(self, html_content: str) -> Dict[str, str]:
        """Extract Twitter Card data"""
        twitter_pattern = r'<meta[^>]*name\s*=\s*["\']twitter:([^"\']*)["\'][^>]*content\s*=\s*["\']([^"\']*)["\'][^>]*>'
        twitter_matches = re.findall(twitter_pattern, html_content, re.IGNORECASE)

        twitter_data = {}
        for property_name, content in twitter_matches:
            twitter_data[property_name.lower()] = content

        return twitter_data

    def parse_query_string(self, url: str) -> Dict[str, List[str]]:
        """Parse query string from URL"""
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        return query_params

    def build_url(
        self,
        base_url: str,
        path: str = "",
        params: Optional[Dict[str, Any]] = None,
        fragment: str = "",
    ) -> str:
        """Build a URL from components"""
        from urllib.parse import urlencode, urljoin, urlparse, urlunparse

        # Parse base URL
        parsed = urlparse(base_url)

        # Update components
        scheme = parsed.scheme
        netloc = parsed.netloc
        url_path = urljoin(parsed.path, path) if path else parsed.path
        query = urlencode(params) if params else parsed.query
        fragment = fragment or parsed.fragment

        # Reconstruct URL
        return urlunparse((scheme, netloc, url_path, "", query, fragment))

    def normalize_url(self, url: str, base_url: Optional[str] = None) -> str:
        """Normalize a URL"""
        if not url:
            return ""

        # Handle relative URLs
        if base_url and not urlparse(url).netloc:
            url = urljoin(base_url, url)

        # Parse URL
        parsed = urlparse(url)

        # Normalize components
        scheme = parsed.scheme.lower() or "http"
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/") or "/"
        if path == "" and parsed.path != "":
            path = "/"
        params = ""  # Not commonly used
        query = ""  # We ignore query for normalization in this simple version
        fragment = ""  # We ignore fragment for normalization

        # Reconstruct
        from urllib.parse import urlunparse

        return urlunparse((scheme, netloc, path, params, query, fragment))

    def scrape_to_csv(
        self, data: List[Dict[str, Any]], filename: str
    ) -> Dict[str, Any]:
        """Scrape data to CSV file"""
        if not data:
            return {
                "action": "scrape_to_csv",
                "filename": filename,
                "status": "error",
                "error": "No data provided",
            }

        try:
            # Get all unique keys from all dictionaries
            fieldnames = set()
            for item in data:
                if isinstance(item, dict):
                    fieldnames.update(item.keys())

            fieldnames = sorted(list(fieldnames))

            with open(filename, "w", newline="", encoding="utf-8") as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()

                for item in data:
                    if isinstance(item, dict):
                        # Flatten nested dictionaries for CSV
                        flattened = {}
                        for key, value in item.items():
                            if isinstance(value, (dict, list)):
                                flattened[key] = json.dumps(value)
                            else:
                                flattened[key] = value
                        writer.writerow(flattened)

            self.logger.info(f"Data scraped to CSV: {filename} ({len(data)} rows)")

            return {
                "action": "scrape_to_csv",
                "filename": filename,
                "rows": len(data),
                "columns": len(fieldnames),
                "status": "success",
            }
        except Exception as e:
            self.logger.error(f"Failed to write CSV {filename}: {str(e)}")
            return {
                "action": "scrape_to_csv",
                "filename": filename,
                "status": "error",
                "error": str(e),
            }

    def scrape_to_json(self, data: Any, filename: str) -> Dict[str, Any]:
        """Scrape data to JSON file"""
        try:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            self.logger.info(f"Data scraped to JSON: {filename}")

            return {
                "action": "scrape_to_json",
                "filename": filename,
                "status": "success",
            }
        except Exception as e:
            self.logger.error(f"Failed to write JSON {filename}: {str(e)}")
            return {
                "action": "scrape_to_json",
                "filename": filename,
                "status": "error",
                "error": str(e),
            }

    def extract_table_from_text(
        self, text: str, delimiter: str = None
    ) -> List[List[str]]:
        """Extract table-like data from text"""
        lines = text.strip().split("\n")
        if not lines:
            return []

        # Determine delimiter if not provided
        if delimiter is None:
            # Try to guess delimiter
            first_line = lines[0]
            if "\t" in first_line:
                delimiter = "\t"
            elif "," in first_line and first_line.count(",") > 1:
                delimiter = ","
            elif "|" in first_line and first_line.count("|") > 1:
                delimiter = "|"
            else:
                # Split by whitespace
                delimiter = None

        table = []
        for line in lines:
            if delimiter:
                row = [cell.strip() for cell in line.split(delimiter)]
            else:
                # Split by whitespace and filter empty cells
                row = [cell for cell in line.split() if cell]
            if row:  # Only add non-empty rows
                table.append(row)

        return table

    def deduplicate_data(
        self, data: List[Dict[str, Any]], key_fields: List[str]
    ) -> List[Dict[str, Any]]:
        """Remove duplicate entries based on key fields"""
        seen = set()
        unique_data = []

        for item in data:
            if not isinstance(item, dict):
                unique_data.append(item)
                continue

            # Create key from specified fields
            key_parts = []
            for field in key_fields:
                value = item.get(field, "")
                key_parts.append(str(value))

            key = "|".join(key_parts)

            if key not in seen:
                seen.add(key)
                unique_data.append(item)

        return unique_data

    def filter_data(
        self, data: List[Dict[str, Any]], filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Filter data based on conditions"""
        filtered_data = []

        for item in data:
            if not isinstance(item, dict):
                filtered_data.append(item)
                continue

            match = True
            for field, condition in filters.items():
                if field not in item:
                    match = False
                    break

                value = item[field]

                # Handle different condition types
                if isinstance(condition, dict):
                    # Complex conditions like {'gt': 5}, {'contains': 'text'}
                    for op, target in condition.items():
                        if op == "eq" and value != target:
                            match = False
                            break
                        elif op == "ne" and value == target:
                            match = False
                            break
                        elif op == "gt" and not (
                            isinstance(value, (int, float)) and value > target
                        ):
                            match = False
                            break
                        elif op == "lt" and not (
                            isinstance(value, (int, float)) and value < target
                        ):
                            match = False
                            break
                        elif op == "gte" and not (
                            isinstance(value, (int, float)) and value >= target
                        ):
                            match = False
                            break
                        elif op == "lte" and not (
                            isinstance(value, (int, float)) and value <= target
                        ):
                            match = False
                            break
                        elif op == "contains" and target not in str(value):
                            match = False
                            break
                        elif op == "startswith" and not str(value).startswith(target):
                            match = False
                            break
                        elif op == "endswith" and not str(value).endswith(target):
                            match = False
                            break
                else:
                    # Simple equality check
                    if value != condition:
                        match = False
                        break

            if match:
                filtered_data.append(item)

        return filtered_data
