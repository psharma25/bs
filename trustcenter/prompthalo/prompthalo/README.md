# Publishing advisories and security incidents

Two files in this folder are the live source for the Trust Center. It fetches
both on every page load, so publishing is a commit. Nothing else is redeployed.

| File | Drives |
|---|---|
| `advisories.json`        | **Security advisories & CVEs** |
| `incidents.json`         | **Security incidents** (third party) |
| `disclosure-record.json` | **Coordinated disclosure record** |

They load independently. If one is broken, the others still publish.

Both are served from the same origin as the Trust Center page, so there is no
CORS configuration and no third party able to influence what is published.

## To publish

1. Edit the relevant file (the GitHub web editor is fine, including on a phone).
2. Set `published` to today's date.
3. Commit to the default branch.
4. Reload the Trust Center. A green banner shows the published date.

## Why an entry is listed

Every record must say how far the issue sits from us. Set `order` to one of:

| `order` | Meaning |
|---|---|
| `First-order`  | The issue is in PromptHalo's own code, service or configuration. |
| `Second-order` | The issue is in a component, library or vendor we use directly. |
| `Third-order`  | The issue reaches us through one of our vendors' own suppliers. |
| `Ecosystem`    | No dependency path to us. Listed because customers ask about it. |

Any other value renders no badge. `why` is the sentence explaining the
relationship, shown under "Why this is listed" when the record is expanded.
Write it so a reviewer can tell, without asking, whether this was our defect,
our vendor's, or neither.

## Field reference

`advisories[]`: `id`, `title`, `severity`, `status`, `date`, `order`, `why`, `impact`, `url`, `detail`
`incidents[]`: `id`, `source`, `title`, `date`, `order`, `why`, `impact`, `url`, `detail`

### Patch and remediation fields

Optional on both `advisories[]` and `incidents[]`. Each renders as a row in a
spec grid inside the expanded record, and is omitted when absent, so old records
need no backfill.

| Field | Example |
|---|---|
| `affected`    | `Litmus 3.0 to 3.1.4` |
| `fixedIn`     | `3.1.5` (also shown on the collapsed row as "Fixed in 3.1.5") |
| `patched`     | `2026-09-18` |
| `cvss`        | `7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)` |
| `remediation` | `Upgrade to 3.1.5. No customer action required for hosted tenants.` |

### Adding your own fields

Anything else goes in a `fields` array. This is the supported way to extend the
format without changing any code:

```json
"fields": [
  {"label": "Discovered by", "value": "Internal review"},
  {"label": "Ticket", "value": "PH-2291"}
]
```

Up to 8 pairs per record. `label` is capped at 40 characters, `value` at 300.
A pair missing either half is dropped.

New keys added at the **top level** of a record are ignored by design. Rendering
unvalidated keys is how layout breaks and injection gets in, so the choice is
between adding a named field here (a code change) or using `fields` (no code
change).
`cvdRecord[]`: `ref`, `title`, `severity`, `resolved`, `reported`, `credit`

Publish a researcher's name in `credit` only with their consent. Where consent
was not given, write "Reported anonymously" rather than leaving it blank.

`severity` must be Critical, High, Medium, Low or Informational.
`impact` is a badge on the collapsed row and renders green when it begins with
"No". State it only where you can evidence it: this is a published claim.
`url` should link to the original advisory or disclosure. It must be http(s) or
it is dropped, and it opens in a new tab.

All fields are plain text and are escaped on render, so HTML in these files is
displayed, never executed. Each record renders as a collapsible row.

## Failure behaviour

If a file is missing, unreachable or malformed, that section falls back to the
copy embedded in `assets/trustcenter.js` and shows no published-feed banner. The
green banner is the only signal that a publish worked, so bump `published` on
every edit and check the date on the page. A
bad edit degrades to stale-but-correct rather than to a blank section. Note that
the embedded fallback carries its own copy of these records, so if you correct
wording that matters, update both.

## Why there is no login on the website

Anything that lets a browser write to a static site needs either a secret in the
page (readable by everyone) or a backend. The repository is already an
access-controlled write path with authentication, review, history and rollback.
Protect it with branch protection and required 2FA, and the publishing control
is stronger than any in-page passphrase could be.
