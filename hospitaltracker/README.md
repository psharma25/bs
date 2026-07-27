# Hospital Tracker

This folder is a self-contained browser build of the BitSense Hospital & Medical-Device Security Tracker and is ready to upload to a GitHub repository.

## Included Files

- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `.gitignore`

## Upload To GitHub

You can upload this folder directly into a repository, for example:

```text
Hospital Tracker/
  index.html
  styles.css
  app.js
  README.md
  .gitignore
```

If you want this to be the publish root for GitHub Pages, place these files in the folder or branch you publish from.

## Run Modes

### Direct file

Open `index.html` locally from your machine.

### GitHub Pages or any static host

This is the better deployment target because:

- the app is served over HTTPS
- WebGPU features behave more reliably on secure origins
- browser-local model loading is more dependable than `file://`

## AI Behavior

This build uses a hybrid browser-local assistant:

- instant deterministic local answer from tracker data
- browser-local RAG upgrade when WebGPU is available
- pinned free WebLLM model: `Qwen2.5-0.5B-Instruct-q4f16_1-MLC`

## What The Full AI Path Needs

The browser-local AI mode needs:

- a WebGPU-capable browser
- internet access on first use to download model artifacts
- internet access to load CDN assets such as `jsPDF` and `WebLLM`

If those are unavailable, the tracker still works and falls back to deterministic local answers.

## Current Architecture

- Retrieval:
  local structured retrieval over hospitals, CVEs, incidents, and tracker notes
- Generation:
  browser-local WebLLM model over WebGPU when supported
- Fallback:
  deterministic rules-based local answers if model loading fails

## Practical Recommendation

This folder is ready to upload now.

For best results after upload:

1. host it on GitHub Pages or another HTTPS static host
2. test the Ask flows in Chrome or Edge with WebGPU enabled
3. later, move hardcoded data out of `app.js` into JSON files if you want cleaner scheduled refresh workflows
