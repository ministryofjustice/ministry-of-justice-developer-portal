#!/usr/bin/env python3
"""Validate sources.json for ingestion operations.

This script is intentionally lightweight so teams can run a preflight check
without understanding the Node ingestion implementation details.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
SOURCES_FILE = ROOT / "sources.json"

ALLOWED_FORMATS = {"tech-docs-template", "markdown", "docsify"}
ALLOWED_LINK_MODES = {"redirect", "live"}
REPO_PATTERN = re.compile(r"^[^/\s]+/[^/\s]+$")


def _error(msg: str) -> str:
    return f"ERROR: {msg}"


def _warn(msg: str) -> str:
    return f"WARN: {msg}"


def validate_source(index: int, source: dict[str, Any]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    source_name = source.get("id", f"index:{index}")

    required = ["id", "name", "repo", "branch", "docsPath", "format", "enabled"]
    for key in required:
        if key not in source:
            errors.append(_error(f"[{source_name}] missing required field '{key}'"))

    source_id = source.get("id")
    if source_id and (not isinstance(source_id, str) or not source_id.strip()):
        errors.append(_error(f"[{source_name}] 'id' must be a non-empty string"))

    repo = source.get("repo")
    if repo and (not isinstance(repo, str) or not REPO_PATTERN.match(repo)):
        errors.append(_error(f"[{source_name}] 'repo' must be in 'owner/repo' format"))

    source_format = source.get("format")
    if source_format and source_format not in ALLOWED_FORMATS:
        errors.append(
            _error(
                f"[{source_name}] unsupported format '{source_format}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_FORMATS))}"
            )
        )

    if source.get("branch") and not str(source["branch"]).strip():
        errors.append(_error(f"[{source_name}] 'branch' cannot be empty"))

    if source.get("docsPath") is None or not str(source.get("docsPath", "")).strip():
        errors.append(_error(f"[{source_name}] 'docsPath' cannot be empty"))

    link_mode = source.get("linkMode")
    if link_mode is not None and link_mode not in ALLOWED_LINK_MODES:
        errors.append(
            _error(
                f"[{source_name}] unsupported linkMode '{link_mode}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_LINK_MODES))}"
            )
        )

    if link_mode == "redirect" and not source.get("externalUrl"):
        errors.append(_error(f"[{source_name}] redirect sources require 'externalUrl'"))

    if source_format == "tech-docs-template" and link_mode == "redirect":
        warnings.append(
            _warn(
                f"[{source_name}] tech-docs-template with linkMode=redirect is unusual; "
                "confirm this is intentional"
            )
        )

    if source.get("enabled") is False:
        warnings.append(_warn(f"[{source_name}] source is disabled and will not be processed"))

    return errors, warnings


def main() -> int:
    if not SOURCES_FILE.exists():
        print(_error(f"sources file not found: {SOURCES_FILE}"))
        return 1

    try:
        payload = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(_error(f"invalid JSON in {SOURCES_FILE}: {exc}"))
        return 1

    sources = payload.get("sources")
    if not isinstance(sources, list):
        print(_error("top-level key 'sources' must be a list"))
        return 1

    all_errors: list[str] = []
    all_warnings: list[str] = []

    seen_ids: set[str] = set()
    for idx, source in enumerate(sources):
        if not isinstance(source, dict):
            all_errors.append(_error(f"[index:{idx}] source entry must be an object"))
            continue

        source_id = source.get("id")
        if isinstance(source_id, str):
            if source_id in seen_ids:
                all_errors.append(_error(f"duplicate source id '{source_id}'"))
            seen_ids.add(source_id)

        errors, warnings = validate_source(idx, source)
        all_errors.extend(errors)
        all_warnings.extend(warnings)

    if all_warnings:
        print("\nWarnings:")
        for warning in all_warnings:
            print(f"  - {warning}")

    if all_errors:
        print("\nValidation failed:")
        for err in all_errors:
            print(f"  - {err}")
        return 1

    print("sources.json validation passed")
    print(f"Checked {len(sources)} source definitions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
