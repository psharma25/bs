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

For production, configure the optional persistent API described below. Without
it, GitHub Pages still works from generated static RAG files, but administrators
cannot add or version evidence between deployments.

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
`MDR_REPORT_KEY`, generates `data/adverse-events.json`, rebuilds all 101 compact
files under `data/rag/`, and publishes the site.
The downloaded ZIP files are temporary and are not committed to the repository.

MAUDE is a passive surveillance system. Counts are signals—not incidence rates,
proof of causation, safety certifications, or medical advice. Product-family
names may overlap.

## Per-device threat models

Open a product and expand **Security** to see its generated threat model. Each
model combines:

- mapped CISA/vendor advisories and publication dates;
- FDA MAUDE matched-report signals;
- device data flows and inferred attack surfaces;
- SBOM, VEX, MDS2, firmware, and third-party supply-chain evidence;
- the likely hospital deployment boundary, including clinical networks,
  workstations, EHR/PACS integrations, biomedical engineering, and vendor
  services; and
- AI/model-integrity threats for AI-enabled devices.

Each threat row shows severity with its assessment/advisory date, whether it is
likely remediated, and an adverse-impact Y/N signal. These are evidence-backed
screening indicators. “Likely remediated” must be confirmed against the
manufacturer’s current bulletin, VEX, patch notice, and the hospital’s deployed
version. A MAUDE match does not prove causation or establish an incidence rate.

The Security view also contains an OV-2-style operational resource-flow diagram
with a dated advisory overlay. Product-specific CVEs are extracted from mapped
advisories and displayed with the advisory date, CISA KEV Y/N status, and an
inferred remediation flag. A product with no mapped CVE shows the assessment
date and an explicit “no mapped product CVE/KEV” state; this is not proof that
the deployed software is free of vulnerabilities.

## Hospital Tracker install-base inference

`data/hospital-install-base.js` contains the narrow product mappings generated
from the BitSense Hospital Tracker. Named sites remain labeled
`confirmed-fleet`, `confirmed-research`, `inferred`, or `inferred-low`.
Ambiguous category mappings—such as “Philips/GE patient monitors”—remain
explicit hypotheses, never verified deployments.

To refresh the mapping from a local tracker export:

```bash
node scripts/build_hospital_install_base.mjs /path/to/hospital_tracker_source.html
python scripts/generate_device_rags.py
```

The generated static file is committed so GitHub Pages can display the signals
without access to the private/local tracker. Confirm all inferred sites against
the hospital’s current CMMS, network inventory, purchase records, or a licensed
install-base source before operational use.

## Local WebGPU + Ollama RAG

The site uses the smallest practical index for each device. Every profile has
its own `data/rag/<product-id>.json`; the browser downloads only the selected
device's file:

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

## Run Ollama with the site hosted on GitHub

GitHub Pages cannot run Ollama itself. GitHub serves `index.html`, while Ollama
runs on the computer opening the site:

```text
GitHub Pages → browser WebGPU retrieval → http://127.0.0.1:11434 → local Ollama
```

The local model, retrieved passages, questions, and generated answers do not
need to be sent to GitHub or a paid model provider.

### 1. Determine the GitHub Pages origin

For a project site such as:

```text
https://YOUR-ACCOUNT.github.io/medtechriskassessment/
```

the origin to allow is:

```text
https://YOUR-ACCOUNT.github.io
```

Do not include the repository path or trailing slash in `OLLAMA_ORIGINS`.

### 2. Install Ollama and the small model

Install [Ollama](https://ollama.com/), then run:

```bash
ollama pull qwen3:0.6b
ollama list
```

`qwen3:0.6b` is the default because it is small and responsive. To use another
installed model, set this browser value from the developer console:

```javascript
localStorage.setItem("bitsense_ollama_model", "YOUR-MODEL")
```

### 3. Permit the GitHub Pages origin

Ollama must explicitly allow cross-origin browser requests from your Pages
hostname.

#### macOS

Use the included helper:

```bash
./scripts/setup_ollama.sh https://YOUR-ACCOUNT.github.io
```

Or configure it manually:

```bash
launchctl setenv OLLAMA_ORIGINS "https://YOUR-ACCOUNT.github.io"
```

Quit Ollama completely and reopen it after setting the variable.

#### Linux with systemd

Run:

```bash
sudo systemctl edit ollama.service
```

Add:

```ini
[Service]
Environment="OLLAMA_ORIGINS=https://YOUR-ACCOUNT.github.io"
```

Then reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

#### Windows PowerShell

Run PowerShell as your normal user:

```powershell
[Environment]::SetEnvironmentVariable(
  "OLLAMA_ORIGINS",
  "https://YOUR-ACCOUNT.github.io",
  "User"
)
```

Exit Ollama from the system tray and start it again.

### 4. Verify Ollama locally

Check that the service and model work:

```bash
curl http://127.0.0.1:11434/api/tags
curl http://127.0.0.1:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3:0.6b","stream":false,"messages":[{"role":"user","content":"Reply with ready"}]}'
```

### 5. Open the GitHub Pages site

Use a current Chromium-based browser with WebGPU enabled. Select a device and
open **Ask a question**. On the first question:

1. the browser downloads and caches the quantized MiniLM embedding model;
2. only that device's compact RAG JSON file is loaded;
3. WebGPU ranks its passages; and
4. the selected evidence is sent to local Ollama for synthesis.

The application calls `http://127.0.0.1:11434/api/chat`. If Ollama cannot be
reached, it returns the retrieved evidence instead of failing.

### Troubleshooting

- **Retrieved passages appear, but no synthesized answer:** Ollama is not
  reachable or the Pages origin is not present in `OLLAMA_ORIGINS`.
- **Model not found:** run `ollama pull qwen3:0.6b`.
- **CORS error in the browser console:** use only the origin, such as
  `https://YOUR-ACCOUNT.github.io`, then restart Ollama.
- **WebGPU unavailable:** update Chrome or Edge and confirm
  `navigator.gpu` exists. The application will otherwise use lexical retrieval.
- **Private repository Pages URL:** use the exact origin shown in the deployed
  Pages URL.
- **Do not use `OLLAMA_ORIGINS=*` in production:** allow only the specific
  GitHub Pages origin.

## Production backend and durable RAG storage

The FastAPI backend stores devices, passages, uploaded source evidence, RAG
versions, and refresh history in PostgreSQL. GitHub Pages remains the frontend;
it requests a selected device's passages from the API, then performs embedding
and retrieval locally through WebGPU.

Start the backend:

```bash
cp .env.example .env
# Replace every placeholder in .env.
docker compose up -d --build
```

Verify it:

```bash
curl http://localhost:8000/api/v1/health
```

For a hosted production API, terminate TLS through a managed load balancer,
Caddy, nginx, or your hosting provider. Set the repository Actions variable
`MEDTECH_API_URL` to its HTTPS origin, for example:

```text
https://api.medtech.example
```

The Pages workflow writes that value into `config.js`. If the API is
unavailable, the frontend automatically falls back to the generated static
per-device RAG file.

Administrative endpoints require `X-Admin-Token`:

```text
GET  /api/v1/health
GET  /api/v1/devices
GET  /api/v1/devices/{device_id}/rag
POST /api/v1/devices/{device_id}/sources
POST /api/v1/admin/refresh
GET  /api/v1/admin/refreshes
```

Example evidence upload:

```bash
curl -X POST https://api.medtech.example/api/v1/devices/omnipod-5/sources \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: $MEDTECH_ADMIN_TOKEN" \
  -d '{"name":"manufacturer-security-note","content":"Verified source text"}'
```

The API increments that device's RAG version, chunks the source, and exposes the
new passages immediately. PostgreSQL data persists in the `postgres_data`
volume.

## Project structure

```text
index.html                         Browser application
data/catalog.json                  101 source device profiles
data/adverse-events.json           Generated FDA aggregate data
data/rag/index.json                Per-device RAG manifest
data/rag/<product-id>.json         One compact knowledge file per device
scripts/build_pages_data.py        FDA downloader and static-data generator
scripts/generate_device_rags.py    Rebuilds all device RAG files
scripts/setup_ollama.sh             Installs/configures the local small model
backend/app/                        Production FastAPI persistence API
backend/requirements.txt            Pinned backend dependencies
docker-compose.yml                  API and PostgreSQL deployment
.env.example                        Required production configuration
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
