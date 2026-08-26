# PromptHalo Trust Center — deployment package

Static site. No build step, no dependencies, no server-side code. Copy the two
top-level folders to the web root and it works.

---

## 1. What to deploy

```
<web root>/
├── .well-known/
│   └── security.txt            → must be served from the DOMAIN ROOT
└── trustcenter/
    ├── index.html              → the Trust Center
    └── policies/               → 17 published policy pages
```

Result:

| URL | Serves |
|---|---|
| `https://prompthalo.com/trustcenter/` | Trust Center |
| `https://prompthalo.com/trustcenter/policies/<name>.html` | Individual policy |
| `https://prompthalo.com/.well-known/security.txt` | Machine-readable security contact |

**`.well-known/security.txt` must sit at the domain root**, not under
`/trustcenter/`. That path is fixed by RFC 9116 — scanners and researchers look
there and nowhere else. Serve it as `text/plain`.

Everything else is self-contained: logos are inlined as base64, there are no
external fonts, no CDN references, and no network calls. It works from a file://
path, from S3+CloudFront, from GitHub Pages, or from any web server.

---

## 2. Published policy pages (17)

| Page | Document |
|---|---|
| `information-security-policy.html` | Information Security Policy (POL-ISP-001) |
| `ai-governance.html` | AI Governance Policy |
| `acceptable-use.html` | Acceptable Use Policy |
| `access-control.html` | Access Control Policy (POL-AC-001) |
| `change-management.html` | Change Management Policy (POL-CM-001) |
| `encryption.html` | Encryption Policy (POL-ENC-001) |
| `secure-sdlc.html` | Secure SDLC Policy (POL-SDLC-001) |
| `logging-monitoring.html` | Logging and Monitoring Policy (POL-LOG-001) |
| `data-classification.html` | Data Classification Policy |
| `data-retention.html` | Data Retention and Disposal Policy |
| `incident-response.html` | Incident Response Policy |
| `business-continuity.html` | Business Continuity and DR Policy |
| `vendor-management.html` | Vendor Management Policy |
| `vulnerability-patch-management.html` | Vulnerability and Patch Management Policy |
| `vulnerability-disclosure.html` | Coordinated Vulnerability Disclosure Policy (POL-CVD-001) |
| `privacy-notice.html` | Privacy Notice |
| `cookie-policy.html` | Cookie Policy |

---

## 3. Editing content

All Trust Center content lives in a single `DEFAULTS` config block inside
`trustcenter/index.html`. Three ways to change it:

1. **Edit `index.html` directly** — find `const DEFAULTS = {` and edit the
   `ph:` object. This is what actually ships.
2. **Admin panel** — the passphrase gate opens an inline editor. Edits save to
   `localStorage` in that browser only. Use **Export config** and paste the
   result back into the `DEFAULTS` block to publish for everyone.
3. **Inline editing** — click any text on the page after unlocking admin.

The admin gate is a convenience lock, not a security boundary. For a hosted
admin route, front it with Cloudflare Access.

### Adding a policy to the document list

In `DEFAULTS.ph.docs`:

```js
{n:"Policy Name", s:"POL-XXX-001 · short description",
 gate:"Public", href:"policies/policy-name.html"},
```

- `gate:"Public"` **with** `href` → renders a **Read** button (opens the page)
- `gate:"Public"` **without** `href` → renders a **Request** button
- `gate:"NDA"` → renders **Under NDA** and a Request button

### Linking a Security practice summary to its full policy

In `DEFAULTS.ph.practices`, add `href:` to the entry:

```js
{t:"Access control — POL-AC-001", d:"Summary text…",
 href:"policies/access-control.html"},
```

---

## 4. Regenerating policy pages from Word

`tools/policy2html.py` converts a policy `.docx` into a page matching the site.

```bash
pip install beautifulsoup4          # plus pandoc on PATH
python3 tools/policy2html.py POLICY.docx trustcenter/policies/output.html \
        --logo logo.txt
```

`--logo` takes a file containing the `<img …>` tag for the header lockup; copy
it out of `index.html` (`const LOGOS = { ph: '…' }`).

The script reads the DOCUMENT INFORMATION table for the header pills, builds a
live sidebar table of contents from the headings, and strips three things that
should not be public: the letterhead image, Word's static table of contents, and
the **signature column** of the approvals table.

`tools/build_cvd.py` regenerates the Coordinated Vulnerability Disclosure page,
which was authored directly rather than converted from Word.

---

## 5. Open items before go-live

These are content decisions, not deployment blockers. The site will serve
correctly as-is.

**1 — Document classification.** Every published policy is classified
**Internal** in its own header, and each carries a validity clause restricting
distribution outside PromptHalo without written approval of the Security
Officer. Publishing a document that declares itself Internal is a
policy-adherence finding. Reclassify the published set to **Public** and reissue
at v1.1.

**2 — GDPR / EU references.** `index.html` is clean. Thirty references remain
inside the policy pages:

- *Twelve security policies* — compliance-mapping citations only
  ("supports SOC 2 CC6.7 and GDPR Article 32"). No commitment is made.
- *`privacy-notice.html`* — **seven live commitments**: reliance on UK and EU
  Standard Contractual Clauses, the International Data Transfer Addendum, the
  right to complain to a local supervisory authority, and use of EEA-based
  providers.

Because these pages are renderings of controlled `.docx` files, the published
copy must not be edited independently of its source. Revise the source
documents and re-render with `policy2html.py`.

**3 — Retention figures.** The Data & privacy panel in `index.html` carries
bracketed placeholders (`[30]` days deletion, `[35]` day backup cycle,
`[12]` month log retention). The published Data Retention policy has the real
figures. Reconcile — a reviewer will open both.

**4 — Reliability commitments.** The availability and RTO/RPO rows are
deliberately unfilled. Do not publish an availability figure that is not
measured.

**5 — Product description.** The hero describes PromptHalo Litmus as automated
penetration testing of applications and cloud. Confirm this matches the current
product before publishing.

---

## 6. Verification

Checked before packaging:

- JavaScript parses (`node --check`)
- HTML tag structure balanced on all 18 pages
- All 17 policy links from `index.html` resolve to files that exist
- No external network dependencies

Contact: security@prompthalo.com
