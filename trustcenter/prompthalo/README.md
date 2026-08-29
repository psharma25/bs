# PromptHalo Trust Center — deployment package

Static site. No build step, no dependencies, no server-side code. Deploy this
folder as `/trustcenter/` and lift `.well-known/` to the domain root.

---

## 1. What to deploy

The Trust Center is this folder. Deploy it as `/trustcenter/` on the web root,
and put `.well-known/` at the domain root separately.

```
prompthalo-trustcenter/         → deploy as <web root>/trustcenter/
├── index.html                  → the Trust Center
├── policies/                   → 18 published policy pages
├── .well-known/
│   └── security.txt            → deploy separately, to the DOMAIN ROOT
├── README.md                   → not deployed
└── tools/                      → not deployed
```

After deployment:

| URL | Serves |
|---|---|
| `https://prompthalo.com/trustcenter/` | `index.html` |
| `https://prompthalo.com/trustcenter/policies/<name>.html` | Individual policy |
| `https://prompthalo.com/.well-known/security.txt` | Machine-readable security contact |

**`.well-known/security.txt` must sit at the domain root**, not under
`/trustcenter/`. That path is fixed by RFC 9116 — scanners and researchers look
there and nowhere else. Serve it as `text/plain`. It ships inside this folder
only so the package is self-contained; move it up one level when you deploy, and
do not leave a copy under `/trustcenter/`.

Everything else is self-contained: logos are inlined as base64, there are no
external fonts, no CDN references, and no network calls beyond the outbound
links to the compliance page. It works from a `file://` path, from
S3+CloudFront, from GitHub Pages, or from any web server.

Policy pages link back with `../index.html`, so `index.html` and `policies/`
must stay siblings.

---

## 2. Published policy pages (18)

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
| `data-retention.html` | Data Retention and Disposal Policy (POL-DRD-001) |
| `incident-response.html` | Incident Response Policy |
| `business-continuity.html` | Business Continuity and Disaster Recovery Policy (POL-BCP-001) |
| `vendor-management.html` | Vendor Management Policy |
| `vulnerability-patch-management.html` | Vulnerability and Patch Management Policy |
| `vulnerability-disclosure.html` | Coordinated Vulnerability Disclosure Policy (POL-CVD-001) |
| `privacy-notice.html` | Privacy Notice |
| `privacy-policy.html` | Privacy Policy (POL-PRIV-001) |
| `cookie-policy.html` | Cookie Policy |

---

## 3. Editing content

All Trust Center content lives in a single `DEFAULTS` config block inside
`index.html`. Three ways to change it:

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
{n:"Policy Name", s:"Short description", gate:"Public",
 grp:"policy", href:"policies/policy-name.html"},
```

- `gate:"Public"` **with** `href` → renders a **Read** button (opens the page)
- `gate:"Public"` **without** `href` → renders a **Request** button
- `gate:"NDA"` → renders **Under NDA** and a Request button

### Linking a Security practice summary to its full policy

In `DEFAULTS.ph.practices`, add `href:` to the entry:

```js
{t:"Access control", d:"Summary text…",
 href:"policies/access-control.html"},
```

---

## 4. Regenerating policy pages from Word

`tools/policy2html.py` converts a policy `.docx` into a page matching the site.

```bash
pip install beautifulsoup4          # plus pandoc on PATH
python3 tools/policy2html.py POLICY.docx policies/output.html \
        --logo logo.txt
```

`--logo` takes a file containing the `<img …>` tag for the header lockup; copy
it out of `index.html` (`const LOGOS = { ph: '…' }`).

The script reads the DOCUMENT INFORMATION table for the header pills, builds a
live sidebar table of contents from the headings, and starts the published copy
at the first numbered section (**Overview and Purpose**). It strips what should
not appear on a public page: the letterhead image, Word's static table of
contents, the approvals table and signature column, the compliance preamble, the
document validity notice, and any **Annex** section.

`tools/build_cvd.py` regenerates the Coordinated Vulnerability Disclosure page,
which was authored directly rather than converted from Word.

---

## 4a. Policy boundary — retention vs recovery

`data-retention.html` (POL-DRD-001) and `business-continuity.html` (POL-BCP-001)
sit next to each other and a reviewer will read both. The boundary is stated in
POL-DRD-001 v1.1 and should be preserved in any future edit:

- **POL-BCP-001 owns recovery** — backup, separation, recovery time and point
  objectives, restore testing, subservice reliance.
- **POL-DRD-001 owns retention** — periods, bases, legal hold, disposal, and the
  point where a deletion commitment meets backup persistence.

Neither restates the other. If recovery content is ever added to the retention
policy, the docs list and the Reliability panel in `index.html` need changing
too, because both currently route the reader to POL-BCP-001 for recovery
objectives.

Note also that no published policy cites an Availability criterion (A1.x).
Availability is out of examination scope per the `regs` block in `index.html`,
and the library uses **CC9.1** for availability-adjacent controls. Keep it that
way unless the scoping decision changes.

---

## 4b. Compliance section

The in-page Compliance panel (`regs`) has been removed. The Compliance pillar,
the footer link and the sections menu now all point to
`https://www.prompthalo.ai/compliance/`, and each assurance ledger entry that
has an `href` renders a "Details →" link to the same place.

Two consequences to keep in view:

- **The framework detail text is gone from this site.** The wording that
  distinguished attestation from mapping — and stated plainly that PromptHalo is
  not certified to ISO/IEC 27001 or 42001 — lived in the `regs` block. That
  distinction now has to be carried by the linked page. The only qualifier left
  here is one sentence under the ledger: *"Alignment to a framework is not
  certification."*
- **The linked page is on a different domain.** Everything else on this site
  uses `prompthalo.com`, including the security contact and the RFC 9116 path.

---

## 4c. Compliance ledger

Ledger entries carry an optional `doc` field:

```js
{name:"SOC 2", scope:"...", status:"align", label:"...", date:"...",
 doc:"SOC 2 report"}   // renders "Request under NDA →"
```

`doc` must match a `n:` value in `DEFAULTS.ph.docs` exactly. Clicking reuses the
`[data-doc]` handler: it opens the Document requests panel, expands whichever
document group holds that entry, preselects it in the request form and scrolls
to it.

Nothing is offered as a direct download — everything gated goes through the
request flow, so the ledger and the Document requests gate cannot disagree.

Two documents exist solely to give the ISO and HIPAA rows a target:

| Document | Gate |
|---|---|
| `ISO/IEC 27001 control mapping` | NDA |
| `Business associate agreement` | NDA |

Confirm both artifacts exist before go-live. A request form that accepts a
request for a document nobody can produce is worse than no link.

---

## 4d. Document groups

Each entry in `DEFAULTS.ph.docs` carries `grp:"policy"` or `grp:"assurance"`,
and Document requests renders one collapsible group per value with a count in
the header. An entry with no `grp` falls back to `policy`.

```js
{n:"Penetration test summary", s:"Most recent executive summary",
 gate:"NDA", grp:"assurance"},
```

Adding a group means adding a `<details class="doc-group">` block in the markup
and a matching pair of lines in the render — the split is two explicit groups,
not a loop over distinct values.

---

## 4e. Saved config and `cfgVersion`

`getConfig` merges any admin-panel config from `localStorage` over the shipped
`DEFAULTS`, and the merge is shallow — a saved `docs` array replaces the shipped
one wholesale. A config saved before document grouping existed therefore had no
`grp` on any entry, so every document fell into Policies and the Assurance group
rendered empty. The same applied to the ledger.

`DEFAULTS.ph.cfgVersion` now guards this. On load, a saved config whose version
does not match is copied to `tc.cfg.ph.v1bak` and its structurally changed keys
(`docs`, `ledger`, `pillars`, `regs`, `frameworksIntro`) are dropped so the
shipped values win. Everything else the admin saved is kept. `saveConfig` stamps
the current version.

**Bump `CFG_VERSION` and add the key to `CFG_STALE_KEYS` whenever you change the
shape of a config array**, not just its contents. Otherwise anyone who has ever
opened the admin panel keeps seeing the old structure while a fresh browser sees
the new one — which is exactly the kind of bug that only reproduces for the
person who built the site.

Document grouping also falls back to a name lookup when `grp` is missing, so a
hand-edited config still groups correctly.

---

## 4f. Default open state

Both document groups start **collapsed**. The Documents panel itself was already
collapsed, so a first-time reader sees two labelled headers with counts rather
than twenty-four rows.

Requests arriving from the compliance ledger still work: the `[data-doc]`
handler opens the Documents panel, expands whichever group holds the target
document, preselects it and scrolls to the form.

To ship a group open, add `open` to its `<details class="doc-group">` tag.

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

**3 — Annex A references in the ISP.** Annex A is stripped from published pages
(it is an internal criteria-mapping register). The Information Security Policy
body still refers to it nine times, including *"No security policy or standard is
effective unless it is recorded in Annex A."* A reader now meets repeated
references to a document they cannot see. Cheapest fix: add one line to section 6
of the source noting that Annex A is maintained internally and available under
NDA.

**4 — Retention figures.** The Data & privacy panel in `index.html` carries
bracketed placeholders (`[30]` days deletion, `[35]` day backup cycle,
`[12]` month log retention). The published Data Retention policy has the real
figures. Reconcile — a reviewer will open both.

**5 — Reliability commitments.** The availability and RTO/RPO rows are
deliberately unfilled. Do not publish an availability figure that is not
measured.

**6 — Product description.** The hero describes PromptHalo Litmus as automated
penetration testing of applications and cloud. Confirm this matches the current
product before publishing.

---

## 6. Verification

Checked before packaging:

- JavaScript parses (`node --check`)
- Document groups and ledger render correctly under jsdom, from both a fresh
  browser and a stale pre-`cfgVersion` config
- HTML tag structure balanced on all 19 pages
- All 18 policy links from `index.html` resolve to files that exist
- Every policy page back-links to the Trust Center
- No external network dependencies
- Verified from a clean extraction of this archive, not from a working copy

Contact: security@prompthalo.com
