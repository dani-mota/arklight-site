#!/usr/bin/env python3
"""Copy public/ into _site and prefix root-absolute URLs for GitHub project Pages."""

import shutil
from pathlib import Path

PREFIX = "/arklight-site"
SRC = Path("public")
DST = Path("_site")
TEXT_EXT = {".html", ".css", ".js", ".svg", ".xml", ".txt", ".json", ".webmanifest"}
NEEDLES = (
    'href="/',
    "href='/",
    'src="/',
    "src='/",
    'srcset="/',
    "srcset='/",
    'poster="/',
    "poster='/",
    'action="/',
    "action='/",
    'url("/',
    "url('/",
    '":"/',
)


def rewrite(text: str) -> str:
    for needle in NEEDLES:
        text = text.replace(needle, needle[:-1] + PREFIX + "/")
    return text


def main() -> None:
    if DST.exists():
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)
    (DST / ".nojekyll").write_text("", encoding="utf-8")
    for path in DST.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXT:
            continue
        original = path.read_text(encoding="utf-8", errors="surrogateescape")
        updated = rewrite(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8", errors="surrogateescape")


if __name__ == "__main__":
    main()
