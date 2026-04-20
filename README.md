## Metadata
name: JCI Seating Protocol Rebuild README
description: Run guide and architecture notes for the ground-up rebuilt JCI seating protocol webapp without Flask.

# JCI Seating Protocol Rebuild

This project has been rebuilt from the ground up.

What was preserved:
- the seating priority rules
- the ceremonial first-seat pattern
- the JCI Hong Kong recognition list data

What was replaced:
- the old Flask app
- the old server-side arrangement flow
- the old frontend implementation

## New Architecture

- `frontend/logic.js`
  The extracted business logic. This is now the source of truth for classification, ranking, and seat assignment.
- `frontend/index.html`
  The rebuilt UI shell.
- `frontend/script.js`
  Client-side app wiring for input, import, theming, and rendering.
- `frontend/style.css`
  Clean brutalist light/dark presentation.
- `frontend/data/recognition-list.json`
  Recognition list exported from Python for the rebuilt static app.
- `server.mjs`
  Minimal Node static server for local use.
- `tests/logic.test.mjs`
  Node logic tests for the extracted rules.
- `seating_system/main.py`
  Python extraction utility only. It is no longer the runtime app.

## Seating Rules

Priority order:
1. HK Gov
2. GOH
3. Sponsor
4. JCI
5. JCI HK (National)
6. Sister Chapter of JCI HK (local Chapter)
7. JCI HK (local Chapter)
8. Needs layer selection

Ceremonial first-seat pattern:
- `1, 3, 2, 5, 4, 6, 7`

After that, seats continue in ascending order.

## Run

```bash
cd /Users/codeprotege/Desktop/kali/jci_protocol_app-seating-arrangement-system
node server.mjs
```

Open:

```text
http://127.0.0.1:5001
```

## Test

```bash
cd /Users/codeprotege/Desktop/kali/jci_protocol_app-seating-arrangement-system
node tests/logic.test.mjs
```

## Data Refresh

If the recognition list changes, regenerate the exported JSON with:

```bash
/Users/codeprotege/miniforge3/bin/python3 -m seating_system.main
```

## Notes

- The rebuilt app runs fully client-side once the static files are served.
- No Flask code is used in the runtime path.
