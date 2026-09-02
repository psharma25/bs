# Deliverables – 2 September 2026

The Trust Center sits at the root of this folder, so the three index files are
top level and every relative link resolves without moving anything.

```
.
├── index.html                  petrol on light - the original theme
├── index-brand-light.html      same layout, brand indigo #3c30f0 / magenta #cc3cf0
├── index-brand-dark.html       same layout, brand accents on a dark canvas
├── policies/                   6 PUBLIC pages, plus a dark copy of each - deploy
├── private/nda/                13 gated policies - DO NOT DEPLOY
├── private/internal/           1 internal record - DO NOT DEPLOY
├── .well-known/security.txt    deploy to the DOMAIN ROOT, not /trustcenter/
├── policies.zip                the public set only
├── DEPLOYMENT.md               full deployment guide and editing notes
├── CHANGES.md                  change record and open items
├── tools/                      page generators - not deployed
├── policies-all-20/            all 20 documents flat, for reading - not deployed
└── imperial-distributors/      a separate engagement - not deployed
```

## Deploying

**Rename one index variant to `index.html` and deploy it with `policies/`.**
The three are identical apart from colour – same markup, same JavaScript, same
config, same 24-question FAQ, same trust assistant, same admin panel. Keep
`index.html` and `policies/` as siblings; policy pages link back with
`../index.html`.

**Deploy:** your chosen `index.html`, `policies/`, and `.well-known/` (to the
domain root, served as `text/plain`).

**Do not deploy:** `private/`, `tools/`, `policies-all-20/`,
`imperial-distributors/`, or any `.md` file. Everything in `private/` is gated
in the documents panel; publishing it would make the gate meaningless.

`policies/` holds two copies of each published document: the light shell used by
`index.html` and `index-brand-light.html`, and a `-dark.html` copy used by
`index-brand-dark.html`. The dark pages link only to other dark pages and back
to `index-brand-dark.html`, so the theme never breaks mid-journey.

**If you deploy a light variant the six `-dark.html` files are unused** and can
be deleted; if you deploy the dark variant the light copies are unused except as
the source the dark ones are generated from. Deploying both sets is harmless -
nothing links across.

`policies/` holds two copies of each published document: the light shell used by
`index.html` and `index-brand-light.html`, and a `-dark.html` copy used by
`index-brand-dark.html`. The dark pages link only to other dark pages and back
to `index-brand-dark.html`, so the theme never breaks mid-journey.

**If you deploy a light variant the six `-dark.html` files are unused** and can
be deleted; if you deploy the dark variant the light copies are unused except as
the source the dark ones are generated from. Deploying both sets is harmless –
nothing links across.

## Access tiers

| Tier | Count | Where |
|---|---|---|
| Public – read online | 6 | `policies/` |
| Under NDA on request | 13 | `private/nda/` |
| Internal only | 1 | `private/internal/` |

Public: Security Overview, Privacy Notice, Privacy Policy, Cookie Policy,
Coordinated Vulnerability Disclosure, AI Governance. The Document Availability
table in the Security Overview lists every document with a read link or a request link
on every row.

## Before go-live

1. `security@prompthalo.ai` must be live and monitored – several documents
 commit to a response within two business days.
2. `.well-known/security.txt` must sit at the domain root. Its `Expires` field
 is one year out and must be refreshed before it lapses.
3. The trust assistant falls back to quoting the Trust Center unless an
 `assistantEndpoint` proxy is configured. Do not put an API key in the page.
4. Two subprocessors are flagged inline for confirmation – Amazon SES and Wix.
5. Retention placeholders in the Data & privacy panel are still unfilled.

`CHANGES.md` carries all 11 open items, including the three that need a decision
rather than an edit: the cookie direction, the missing data processing addendum,
and the sub-processor list that three published documents now promise.

## `policies-all-20/`

Every document in one flat folder for reading and editing. Same content as the
copies under `policies/` and `private/`. History tables are present in the 14
gated and internal documents and absent from the 6 published ones, matching what
is deployed.

`gdpr-territorial-scope-assessment.html` is the internal record:
Article 3 is not currently engaged, the Company applies GDPR-grade standards
anyway, and an EU expansion is sequenced – including that Article 3(2)(a) is
engaged by targeting rather than by contract, and that the obligations are met
without additional headcount.

## `imperial-distributors/`

A separate engagement. Passive OSINT only – public DNS records and open sources,
no active scanning.

| File | What it is |
|---|---|
| `imperial_external_footprint.html` | External technology and AI footprint |
| `imperial_external_footprint.pptx` | The same material as a six-slide deck |
| `ai_surfaces_prompt_security_map.html` | Five surfaces where enterprise data meets AI, against Prompt Security coverage and gaps |

Headline findings, all from public DNS: the SPF record exceeds the RFC 7208
ten-lookup limit and returns `permerror`, DMARC sits at `p=none`, and there is no
AI vendor footprint at all – so the governance problem is embedded and unmanaged
AI rather than a procured platform. Vendor positions in the surfaces map reflect
published capability as of September 2026, not head-to-head testing.
