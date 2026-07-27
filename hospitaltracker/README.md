# Hospital Tracker

Production-oriented packaging of the BitSense `Hospital & Medical-Device Security Tracker`.

## Purpose

This tracker is designed to help BitSense or a hospital security team:

- track hospitals, systems, bed counts, and outreach status
- map representative device fleets to public vulnerability intelligence
- distinguish confirmed evidence from inferred hypotheses
- surface documented security incidents
- provide fast, practical answers about hospital risk, device CVEs, and remediation priorities

The interface is intentionally preserved from the original working prototype.

## Files

- `index.html`
  Main application shell and UI markup.
- `styles.css`
  Extracted production stylesheet from the original single-file prototype.
- `app.js`
  Application logic, seed data, risk model, local persistence, local answer engine, and optional live AI assistant path.
- `hospital_tracker_source.html`
  Reference copy of the original single-file source used for preservation and comparison.

## What This App Is Today

This version is a hybrid:

1. Local deterministic application
   - The core tracker, filtering, sorting, risk scoring, detail pages, CSV export, and saved browser data all run locally in the browser.

2. Local retrieval / rules-based QA
   - The "Ask" features always work locally.
   - They retrieve from in-memory tracker data and produce templated answers.
   - This is fast because there is no network call and no external model dependency.

3. Optional live LLM + tool-calling path
   - `app.js` includes a live assistant path that calls the Anthropic Messages API.
   - It exposes a small toolset like `list_hospitals`, `get_hospital`, `get_device_cve`, and `list_cves`.
   - When available, the model can plan, call tools, iterate, and then answer.
   - When unavailable, the app falls back to the local engine.

## Is It RAG, Agentic AI, or LLM?

Short answer:

- Local mode: not true vector RAG, not true external LLM, and only lightly agent-like
- Live Anthropic mode: LLM + tool-calling agent pattern

More precisely:

### Local mode

The current local mode is best described as:

- structured retrieval from in-memory data
- rules-based answer generation
- deterministic fallback assistant

It is not full RAG in the usual modern sense because:

- there is no embedding model
- there is no vector database
- there is no semantic chunk retrieval over external documents

It is also not a full autonomous agent locally because:

- there is no model planning loop locally
- the local answer engine uses hand-authored branching logic

### Live mode

The live mode is best described as:

- LLM-backed
- tool-using
- agentic within a constrained dataset

Why:

- the model receives instructions
- it can choose tools
- it can call several tools iteratively
- it answers only from tool results

That is a legitimate small agent pattern.

## Why It Can Still Be Fast

It stays fast because most of the app is local:

- all tracker data is already loaded in the browser
- risk scoring is computed directly in JavaScript
- filtering and sorting are in-memory
- local QA does not wait on network calls
- only the optional live AI path needs a remote API

This is a good design for usability:

- instant UI
- instant fallback answers
- graceful degradation if the model is unavailable

## How The Data Is Generated Today

Today, most of the data is hand-curated seed data inside `app.js`:

- `SEED`
  Hospital records, system affiliation, bed counts, notes, and representative device tags
- `CVEDB`
  Public device vulnerability reference data
- `INCIDENTS`
  Public incident summaries
- `SOURCES`
  Human-readable source references

This means the current app is:

- fast
- portable
- easy to demo

But it is not yet a fully automated pipeline.

## Recommended Data Generation Model

For a real production workflow, separate data generation from UI runtime.

### Good production pattern

1. Source collection
   - hospital rosters
   - system affiliation sources
   - public CVE feeds
   - CISA advisories
   - OCR breach data
   - internal BitSense research notes

2. Normalization pipeline
   - clean hospital names
   - deduplicate systems
   - standardize device names
   - assign confidence labels
   - calculate risk inputs

3. Build artifacts
   - output JSON files such as:
     - `hospitals.json`
     - `devices.json`
     - `incidents.json`
     - `cves.json`
     - `sources.json`

4. Runtime app
   - `index.html` loads those generated JSON artifacts
   - the UI stays fast and simple

## Should There Be A Button To Rerun Everything?

Usually not in the main user-facing app.

Why not:

- rerunning source ingestion can be slow
- some sources may fail or change structure
- some updates need review before publication
- you usually do not want ordinary users rebuilding production data from the browser

### Better approach

Have two modes:

1. User mode
   - read-only tracker
   - filtering, editing local notes, exports, and QA

2. Admin/update mode
   - rebuild datasets
   - re-import public sources
   - review diffs
   - publish updated JSON

### Best UI pattern

Instead of a "rerun all files" button in the main tracker, use:

- `Refresh public data` in an admin-only panel
- `Rebuild datasets` in a separate maintenance page
- `Last updated` timestamp in the main UI
- `Data quality / confidence review` before publishing

## Recommended Next Step

If this tracker is becoming a real product, the next upgrade should be:

1. move `SEED`, `CVEDB`, `INCIDENTS`, and `SOURCES` into separate JSON files
2. add a small build script to regenerate them
3. keep the interface unchanged
4. optionally add a protected admin rebuild workflow

## Prompt Preservation

The preserved design intent for this tracker is:

> Build a hospital and medical-device security tracker that preserves a compact, usable interface; shows hospitals, representative device fleets, CVE exposure, incidents, and risk; clearly separates confirmed evidence from inferred hypotheses; supports fast local use; and optionally upgrades to a live tool-using LLM assistant without breaking the user experience.

## Important Boundaries

- Device deployment is often inferred, not proven.
- Public CVEs do not prove product applicability.
- Risk score is a prioritization signal, not an attestation of compromise.
- Absence of a public incident does not prove no incident occurred.
- Vendor SBOM, VEX, and patch applicability are often not publicly available.

## Run Options

### Direct file

Open `index.html` directly in a browser.

### Static hosting

Serve the folder with any static host or local server.

### Optional app server

The root project also contains `app.py`, but this tracker does not require it to function as a static application.
