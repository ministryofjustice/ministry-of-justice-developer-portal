#!/usr/bin/env python3
"""Summarise current ingested documentation output.

Outputs a simple table of source folders under content/docs with markdown page
and asset counts so operators can quickly spot anomalies.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CONTENT_DOCS = ROOT / "content" / "docs"
SOURCES_FILE = ROOT / "sources.json"

ASSET_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".avif",
    ".bmp",
    ".ico",
    ".pdf",
    ".csv",
    ".xlsx",
    ".xls",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".zip",
    ".drawio",
    ".excalidraw",
}


def count_files(root: Path) -> tuple[int, int]:
    page_count = 0
    asset_count = 0
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        if suffix in {".md", ".mdx"}:
            page_count += 1
        elif suffix in ASSET_EXTENSIONS:
            asset_count += 1
    return page_count, asset_count


def load_source_labels() -> dict[str, str]:
    if not SOURCES_FILE.exists():
        return {}
    try:
        payload = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}

    labels: dict[str, str] = {}
    for source in payload.get("sources", []):
        source_id = source.get("id")
        if isinstance(source_id, str):
            labels[source_id] = str(source.get("name") or source_id)
    return labels


def main() -> int:
    if not CONTENT_DOCS.exists():
        print("No ingestion output found at content/docs")
        return 0

    labels = load_source_labels()
    rows: list[tuple[str, str, int, int]] = []

    for entry in sorted(CONTENT_DOCS.iterdir()):
        if not entry.is_dir():
            continue
        pages, assets = count_files(entry)
        rows.append((entry.name, labels.get(entry.name, "(not in sources.json)"), pages, assets))

    if not rows:
        print("No source directories found under content/docs")
        return 0

    print("Ingestion Output Report")
    print("=" * 80)
    print(f"{'Source ID':30} {'Name':28} {'Pages':>8} {'Assets':>8}")
    print("-" * 80)
    for source_id, name, pages, assets in rows:
        print(f"{source_id:30} {name[:28]:28} {pages:8d} {assets:8d}")

    print("-" * 80)
    print(f"Sources: {len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
