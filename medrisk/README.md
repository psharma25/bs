# Medtech Risk Assessment

A GitHub Pages-ready medical-device risk and adverse-event library containing
101 device profiles. The application runs entirely in the browser from the
top-level `index.html`.

## Publish on GitHub Pages

1. Create an empty GitHub repository.
2. Upload everything inside this folder, including `.github`.
3. Open **Settings → Pages → Build and deployment**.
4. Set the source to **GitHub Actions**.
5. Open **Actions → Build and deploy GitHub Pages → Run workflow**.

GitHub will display the published URL after deployment. GitHub hosts the site
and refreshes FDA data; WebGPU retrieval runs in the browser and a local Ollama
service generates answers. No paid LLM or cloud API key is required.

To upload from Terminal instead:

```bash
git init
git add .
git commit -m "Initial Medtech Risk Assessment"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
```

## Automatic FDA updates

The workflow in `.github/workflows/pages.yml` runs:

- whenever `main` changes;
- manually from the Actions tab; and
- every Monday at 06:17 UTC.

It downloads the FDA's current monthly MAUDE master and device-detail files,
matches brand/model/manufacturer or FDA product code, joins the records through
`MDR_REPORT_KEY`, generates `data/adverse-events.json`, and publishes the site.
The downloaded ZIP files are temporary and are not committed to the repository.

MAUDE is a passive surveillance system. Counts are signals—not incidence rates,
proof of causation, safety certifications, or medical advice. Product-family
names may overlap.

## Local WebGPU + Ollama RAG

The site uses the smallest practical index for each device:

1. Opening a device and asking the first question builds an index only for that
   device—not the entire 101-device portfolio.
2. Transformers.js loads the quantized `Xenova/all-MiniLM-L6-v2` embedding
   model into WebGPU.
3. Catalog facts, domain findings, advisories, regulatory context, and
   white-paper passages are embedded in the browser.
4. The query is embedded on WebGPU and ranked by cosine similarity.
5. The seven closest passages are sent to local Ollama.
6. `qwen3:0.6b` produces the citation-grounded answer.

The per-device index is cached in memory for the browser session. Multi-device
portfolio questions use the lighter lexical retriever to avoid embedding the
entire catalog. If WebGPU is unavailable, retrieval falls back to lexical
ranking. If Ollama is unavailable, the interface returns the retrieved
passages instead of failing.

### Install and configure Ollama

Install [Ollama](https://ollama.com/), then download the small local model:

```bash
ollama pull qwen3:0.6b
```

Ollama must allow requests from your GitHub Pages origin. On macOS, replace the
example origin with your own GitHub Pages hostname:

```bash
launchctl setenv OLLAMA_ORIGINS "https://YOUR-ACCOUNT.github.io"
```

Quit and reopen Ollama after setting the variable. If running Ollama manually:

```bash
OLLAMA_ORIGINS="https://YOUR-ACCOUNT.github.io" ollama serve
```

The application calls `http://127.0.0.1:11434/api/chat`. The model, prompts,
retrieved evidence, and answers remain on the visitor's machine.

Use a current Chromium-based browser with WebGPU enabled. The first device
question downloads the quantized embedding model from Hugging Face and stores
it in the browser cache; subsequent use is faster.

## Project structure

```text
index.html                         Browser application
data/catalog.json                  101 source device profiles
data/adverse-events.json           Generated FDA aggregate data
scripts/build_pages_data.py        FDA downloader and static-data generator
.github/workflows/pages.yml        Scheduled GitHub Pages deployment
README.md                          Setup and operating notes
```

## Local preview

Opening `index.html` directly works. To test the generated FDA JSON integration,
serve the folder with any static server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Data sources

- [FDA MDR downloadable data files](https://www.fda.gov/medical-devices/medical-device-reporting-mdr-how-report-medical-device-problems/mdr-data-files)
- [FDA MAUDE database](https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm)
- [openFDA device adverse-event API](https://open.fda.gov/apis/device/event/)
