# Change record – 2 September 2026

Everything altered from the original `prompthalo-trustcenter` package and the
original `policies.zip`. Not deployed; keep it with the source.

---

## 1. Domain

`prompthalo.com` → `prompthalo.ai` everywhere: 39 occurrences across the policy
set, 8 in `index.html`, 5 in the README.

`prompthalo.com` is a parked domain listed for sale on Afternic (nameservers
`ns1/ns2.afternic.com`, null MX, `v=spf1 -all`). It is not controlled by
PromptHalo. Publishing a security contact on a domain someone else can buy is
the risk this closes.

## 2. Typography

357 em-dashes (U+2014) → en-dashes (U+2013) across all policy pages. Surrounding
spaces untouched, so they render as spaced en-dashes. The 6 pre-existing
en-dashes were left alone – five are numeric ranges (CVSS bands, a CCPA section
range) and are correct as they stand.

## 3. Privacy Notice –, v1.0 → v1.1

The notice and the Cookie Policy contradicted each other. The notice promised a
cookie settings link that does not exist and described consent-gated analytics
that are not run.

- Cookie section rewritten to essential-only; cross-reference to added
- Cookie table: one real row plus explicit nil rows for Analytics and Advertising
- Collection table: analytics-cookie row → server-side request records; legal
 basis → legitimate interests in security and availability
- Sharing table: Analytics recipient row removed
- Retention: "Website analytics, fourteen months" → "Server-side request
 records, thirteen months". Fourteen months was the Google Analytics default
 and matched nothing the Company does
- Grammar: "nor not to be discriminated against" → "and not to be"
- "Section 9 explains this further" → names the section; headings are unnumbered
- Document ID **** assigned; it had none
- Audience line corrected from "All personnel, including employees and
 contractors" – wrong audience for a public notice
- Reference and Document Policy History sections added

## 4. Cookie Policy –, v1.0 → v1.1

Rebuilt on the standard policy template. It previously carried its own 155-line
stylesheet, numbered 01–09 sections, no owner, no review cadence and no document
control, which is why it was 54.7 KB against ~30 KB for its siblings.

- Placeholder brackets removed from all six cookie table values
- "preference centre" → "center", "behaviour" → "behavior"
- Voice changed from marketing first person to the library's third person
- Cross-references to and added
- Joint-review commitment with the Privacy Notice recorded, making the
 anti-drift claim mutual rather than one-sided

## 5. Data Classification Policy – The policy stated *"There is no public class"* while four documents were already
labelled Public.

- **Public** tier added; "The Three Classifications" → "The Four"
- Closing rule rewritten from denying the tier to governing it: *"Publication
 remains a deliberate act: information becomes Public only by approval, never
 by default or by omission."*
- **Document Distribution** section added, defining Public / Under NDA on
 request / Internal only as a field separate from classification, with the
 default: *a document with no distribution level recorded is treated as
 Internal only.*

## 6. Classification and distribution – all documents

Every published policy declared itself **Internal** while sitting on a public
site. Classification and distribution are now two separate fields in every
header.

| Distribution | Count | Documents |
|---|---|---|
| Public | 6 | Privacy Notice, Privacy Policy, Cookie Policy, Coordinated Vulnerability Disclosure, AI Governance, Security Overview |
| Under NDA on request | 13 | Information Security, Access Control, Encryption, Logging & Monitoring, Change Management, Secure SDLC, Vulnerability & Patch Management, Incident Response, Business Continuity, Vendor Management, Data Retention, Data Classification, Acceptable Use |
| Internal only | 1 | GDPR / UK GDPR Territorial Scope Assessment |

Fourteen policies were reissued at v1.1 (Data Retention at v1.2) with the
effective date moved to 2 September 2026 and a history entry recording why. The
Coordinated Vulnerability Disclosure meta strip was normalised – it read `Public`
where every other page reads `Classification Public`.

## 7. New documents

**`policies/security-overview.html` –, Public.** Thirteen sections
answering the questions that recur in security reviews, plus a Document
Availability table listing every document and its access level. Every
factual claim traces to a policy in the set; where a figure was unavailable
(RTO/RPO) it points to the gated document rather than guessing.

**`private/internal/gdpr-territorial-scope-assessment.html` –,
Internal only.** Works the Article 3 tests in order: no EU/UK establishment
(3(1)); a seven-row table against the EDPB Guidelines 3/2018 targeting
indicators, all absent (3(2)(a)); no analytics or behavioural tracking
(3(2)(b)). Records the processor position, seven reassessment triggers, and the
seven-step procedure if one fires. Not legal advice; needs counsel review.

Company size is **not** an Article 27 exemption – there is no small-business
carve-out. The exemption relied on is territorial scope, one gate earlier.

## 8. index.html

Look, feel and behaviour unchanged. Content and config only.

- 8 domain references updated, including `secTxtDomain`, `securityEmail`, `trustEmail`
- `docs` list rewritten to 25 entries with correct gates – 7 public, 18 NDA
- 10 `practices` hrefs removed; they pointed at pages no longer deployed and
 would have 404'd
- Governance blurb corrected from "Twelve are published in full on this page"
- Subprocessor list 4 → 7. **AWS was missing** although the policies name it as
 where the platform runs. Amazon SES (present in the SPF record) and Wix
 (authoritative DNS) added and flagged inline for confirmation
- `cfgVersion` 2 → 3, `subs` added to `CFG_STALE_KEYS`, so a saved admin config
 cannot resurrect the old gates
- FAQ 4 → 24 entries covering data and AI, privacy, security, compliance and
 document access

## 9. Trust assistant

The bot already existed. Three defects fixed:

- The corpus described **every** public document as "available on request",
 which was true before the gating change and wrong after it. Six are now
 readable with one click
- Six grounding entries added: document distribution, cookies and tracking,
 GDPR scope, model training, document currency, certification status. Without
 them the bot fell back to "not published on the Trust Center" for exactly the
 questions asked first
- Two system-prompt rules added. It must not estimate or infer a number, date,
 region, retention period or recovery objective absent from context; and it
 must **never reveal the contents of an NDA-gated document** – it may say the
 document exists, what it covers and how to request it. Without the second
 rule the bot holds all the policy text and will summarise gated documents on
 request, making the gate decorative

**Before go-live:** with no `assistantEndpoint` set, the bot calls the Anthropic
API directly, which needs a key in the browser and cannot ship publicly. The
call fails and it falls back to quoting the Trust Center – safe, deterministic,
zero hallucination risk, and a defensible permanent posture. For fluent answers
plus live CVE lookup, stand up a proxy holding the key server-side.

## 10. Themes

Three index files, byte-identical apart from colour.

| File | Theme |
|---|---|
| `index.html` | Petrol on light – the original |
| `index-brand-light.html` | Brand indigo `#3c30f0` / magenta `#cc3cf0` on light |
| `index-brand-dark.html` | Brand accents on `#0a0f1c` page, `#121a2b` surfaces |

Brand hexes were sampled from the logo artwork, not guessed – indigo and magenta
are the two colours the mark is built from. The live prompthalo.ai stylesheet
could not be read; the site renders client-side and returns only meta tags to a
fetcher. If the marketing palette differs, it is a fifteen-variable change.

Green for Public and amber for Under NDA are unchanged in all three. They carry
meaning, not brand.

The dark variant recolours `index.html` only. Policy pages keep the light
document shell deliberately: long prose reads better on light, and those pages
get printed and attached to questionnaires.

## 11. Cross-linking

 is reachable from the header nav on all three variants, the primary
hero button, the Governance & policy practice entry, the Document requests
assurance group, and a second header link on all 19 other policy pages.

Pages under `private/` link back with `../../` so they resolve when opened
locally. They are still not for deployment.

## 12. `.well-known/security.txt`

Created. It was absent from the original package although the README described
deploying it and publishes the path. Deploy to the **domain root**,
not under `/trustcenter/`, and serve as `text/plain`. The `Expires` field is set
one year out and must be refreshed before it lapses.

---

# Open items

1. **The cookie direction was a judgment call.** The Privacy Notice was aligned
 to the Cookie Policy – essential cookies only – because that document is more
 recent and more specific. If PromptHalo does run analytics, this is backwards.
2. **GDPR framing in the Privacy Notice.** Seven live commitments remain (UK and
 EU Standard Contractual Clauses, the International Data Transfer Addendum,
 the right to complain to a supervisory authority). These assert that GDPR
 applies, which contradicts. Soften them to a voluntary
 commitment extended to everyone, or accept applicability and appoint an
 Article 27 representative.
3. **`security@prompthalo.ai` must be live and monitored.** Multiple documents
 commit to same-day triage and a response within two business days.
4. **Two subprocessors need confirming** – Amazon SES and Wix, flagged inline.
5. **The AWS load balancer claim.** names AWSALB cookies, but
 `www.prompthalo.ai` sits behind Cloudflare. Check the cookie jar in a clean
 browser against section 4; removing the placeholder brackets made that table
 a firmer claim than it was.
6. **Sub-processor list and DPA.** Three published documents promise a
 subprocessor list. The DPA that gives it legal effect does not exist. GDPR
 Article 28(2) needs the authorisation, notice period and objection right to
 live somewhere.
7. **Retention placeholders** in the Data & privacy panel of `index.html`
 (`[30]`, `[35]`, `[12]`) are still unfilled.
8. **Reliability commitments** and the **hero product description** remain as
 flagged in README section 5.
9. **Document history is no longer published.** The history tables were removed
 from the six public pages; version, effective date and next
 review remain in every header. The full history is retained in the
 `private/` copies, which are released under NDA – if it should be withheld
 there too, that is a separate change.
10. **`api.prompthalo.ai`** resolves to `47.209.88.71`, which has no PTR record
 and sits in no major cloud range. Confirm it is intentional.
11. **`staging.prompthalo.ai`** resolves publicly via CloudFront. Expect to be
 asked about it in a security review.
