#!/usr/bin/env python3
## Metadata
# name: Recognition List Exporter
# description: Rebuilds the frontend recognition-list JSON from the latest source document in `recognition list `, preserving precedence order and JCI HK layer tags.
# dependencies: python>=3.8, json, pathlib, re, subprocess

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "frontend" / "data" / "recognition-list.json"
SOURCE_DIR = ROOT / "recognition list "
SOURCE_DOCX = SOURCE_DIR / "dlwid_3778_dlwlistid_5244.docx"

def parse_recognition_line(line: str) -> tuple[str, str]:
    core = line
    suffix = ""
    match = re.search(r"\s*(\([^)]*\))\s*$", core)
    if match:
        suffix = f" {match.group(1)}"
        core = core[: match.start()].rstrip()

    if " Senator " in core:
        title, name = core.rsplit(" Senator ", 1)
        return title.strip() + suffix, f"Senator {name.strip()}"

    tokens = core.split()
    if len(tokens) >= 3 and tokens[-2:] == ["Au", "Yeung"]:
        return " ".join(tokens[:-3]).strip() + suffix, " ".join(tokens[-3:]).strip()
    return " ".join(tokens[:-2]).strip() + suffix, " ".join(tokens[-2:]).strip()


def is_local_chapter_role(title: str) -> bool:
    normalized = title.lower()
    local_chapter_titles = [
        "jci victoria president",
        "jci kowloon president",
        "jci island president",
        "jci peninsula president",
        "jci hong kong jayceettes president",
        "jci lion rock president",
        "jci harbour president",
        "jci yuen long president",
        "jci tai ping shan president",
        "jci bauhinia president",
        "jci dragon president",
        "jci east kowloon president",
        "jci city president",
        "jci queensway president",
        "jci north district president",
        "jci ocean president",
        "jci sha tin president",
        "jci apex president",
        "jci city lady president",
        "jci tsuen wan president",
        "jci lantau president",
    ]
    return any(chapter in normalized for chapter in local_chapter_titles)


def get_recognition_entries(source_path: Path = SOURCE_DOCX) -> list[dict]:
    text = subprocess.check_output(["textutil", "-convert", "txt", "-stdout", str(source_path)], text=True)
    entries: list[dict] = []

    for raw in text.splitlines():
        line = raw.strip().lstrip("•").strip().replace("\xa0", " ")
        line = re.sub(r"\s+", " ", line)
        if not line:
            continue
        if line.startswith("2026 JUNIOR CHAMBER") or line == "RECOGNITION LIST":
            continue
        if line.startswith("("):
            continue
        title, name = parse_recognition_line(line)
        if not name:
            continue
        entries.append(
            {
                "id": f"jci-hk-{len(entries) + 1}",
                "number": len(entries) + 1,
                "name": name,
                "title": title,
                "organization": "JCI HK",
                "layer": "local_chapter" if is_local_chapter_role(title) else "national",
                "source": "recognition_list",
            }
        )

    return entries


def export_recognition_entries(output_path: Path = OUTPUT_PATH) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    entries = get_recognition_entries()
    payload = {
        "meta": {
            "source": "JCIHK_Recognition_List_2026",
            "source_file": SOURCE_DOCX.name,
            "count": len(entries),
        },
        "entries": entries,
    }
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    return output_path


if __name__ == "__main__":
    path = export_recognition_entries()
    print(f"Exported recognition data to {path}")
