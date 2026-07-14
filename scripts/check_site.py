#!/usr/bin/env python3
"""Validate the static blog before committing or deploying."""

from __future__ import annotations

import html.parser
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITE_URL = "https://xinma5993-glitch.github.io/blog/"
REQUIRED_FILES = [
    "index.html",
    "about.html",
    "404.html",
    "posts/welcome.html",
    "posts/git-and-github.html",
    "posts/learning-notes.html",
    "assets/css/style.css",
    "assets/js/main.js",
    "assets/images/avatar.svg",
    "assets/images/favicon.svg",
    "robots.txt",
    "sitemap.xml",
    "feed.xml",
    "site.webmanifest",
    ".nojekyll",
    "README.md",
    "AGENTS.md",
]
HTML_FILES = [
    "index.html",
    "about.html",
    "404.html",
    "posts/welcome.html",
    "posts/git-and-github.html",
    "posts/learning-notes.html",
]
POSTS = [
    "posts/welcome.html",
    "posts/git-and-github.html",
    "posts/learning-notes.html",
]
SECRET_PATTERNS = [
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]+"),
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"xox[baprs]-[A-Za-z0-9-]+"),
    re.compile(r"BEGIN (RSA|OPENSSH|DSA|EC|PGP) PRIVATE KEY"),
    re.compile(r"(?i)\b(password|api[_-]?key|secret|token)\s*="),
]
EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


class PageParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.title = ""
        self.html_lang = ""
        self.links: list[tuple[str, str]] = []
        self.images: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {key: value or "" for key, value in attrs}
        if tag == "html":
            self.html_lang = attr.get("lang", "")
        if tag == "title":
            self.in_title = True
        if tag == "a" and attr.get("href"):
            self.links.append(("href", attr["href"]))
        if tag == "link" and attr.get("href"):
            self.links.append(("href", attr["href"]))
        if tag == "script" and attr.get("src"):
            self.links.append(("src", attr["src"]))
        if tag == "img":
            self.images.append((attr.get("src", ""), attr.get("alt", "")))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data.strip()


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def is_external(target: str) -> bool:
    parsed = urlparse(target)
    return bool(parsed.scheme or parsed.netloc or target.startswith("#"))


def strip_fragment(target: str) -> str:
    return target.split("#", 1)[0]


def check_local_target(errors: list[str], source: Path, target: str) -> None:
    clean_target = strip_fragment(target)
    if not clean_target or is_external(clean_target):
        return
    if clean_target.startswith("/"):
        fail(errors, f"{source.relative_to(ROOT)} uses root-absolute path: {target}")
        return
    candidate = (source.parent / clean_target).resolve()
    try:
        candidate.relative_to(ROOT)
    except ValueError:
        fail(errors, f"{source.relative_to(ROOT)} links outside repository: {target}")
        return
    if not candidate.exists():
        fail(errors, f"{source.relative_to(ROOT)} links missing file: {target}")


def check_html(errors: list[str]) -> None:
    index_text = (ROOT / "index.html").read_text(encoding="utf-8")
    for post in POSTS:
        if post not in index_text:
            fail(errors, f"index.html does not link to {post}")

    for rel in HTML_FILES:
        path = ROOT / rel
        parser = PageParser()
        text = path.read_text(encoding="utf-8")
        parser.feed(text)

        if not parser.title:
            fail(errors, f"{rel} is missing <title>")
        if parser.html_lang != "zh-CN":
            fail(errors, f"{rel} must declare lang=\"zh-CN\"")
        for src, alt in parser.images:
            if src and alt is None:
                fail(errors, f"{rel} has image without alt: {src}")
        for _, target in parser.links:
            check_local_target(errors, path, target)


def check_required_files(errors: list[str]) -> None:
    for rel in REQUIRED_FILES:
        if not (ROOT / rel).exists():
            fail(errors, f"Missing required file: {rel}")


def check_site_metadata(errors: list[str]) -> None:
    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    feed = (ROOT / "feed.xml").read_text(encoding="utf-8")
    if f"Sitemap: {SITE_URL}sitemap.xml" not in robots:
        fail(errors, "robots.txt has incorrect sitemap URL")
    for text_name, text in [("sitemap.xml", sitemap), ("feed.xml", feed)]:
        if SITE_URL not in text:
            fail(errors, f"{text_name} does not include the expected site URL")
        if "https://xinma5993-glitch.github.io/" in text and SITE_URL not in text:
            fail(errors, f"{text_name} may point to the wrong GitHub Pages root")


def check_sensitive_content(errors: list[str]) -> None:
    ignored_dirs = {".git"}
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in ignored_dirs for part in path.parts):
            continue
        rel = path.relative_to(ROOT)
        if rel.name == ".env" or ".env." in rel.name:
            fail(errors, f"Environment file should not be present: {rel}")
            continue
        if path.suffix.lower() in {".db", ".sqlite", ".sqlite3", ".pem", ".key", ".p12", ".pfx"}:
            fail(errors, f"Sensitive or local-state file should not be present: {rel}")
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                fail(errors, f"Potential secret pattern found in {rel}")
                break
        if EMAIL_PATTERN.search(text):
            fail(errors, f"Unexpected email address exposed in {rel}")


def main() -> int:
    errors: list[str] = []
    check_required_files(errors)
    check_html(errors)
    check_site_metadata(errors)
    check_sensitive_content(errors)

    if errors:
        print("Site check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Site check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
