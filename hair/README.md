# Hairstyle try-on — running it and keeping the key safe

Four files:

| File | What it is |
|---|---|
| `index.html` | The whole front end. Works against any of the three setups below. |
| `serve.py` | Local server: serves the page, holds the key, saves looks to `saves/`. |
| `lambda_function.py` | The same backend on AWS Lambda, saving to S3. |
| `devcontainer.json` | Codespaces setup — goes in `.devcontainer/`. |
| `deploy.yml` | GitHub Actions deploy — goes in `.github/workflows/`. |
| `overlay-version.html` | The earlier drawing-based version. No key, no API, no cost. |

---

## 1. Local (a laptop at the salon desk)

```bash
python3 serve.py
```

Asks for the key once, opens `http://localhost:8000`. Saved looks land in
`saves/<reference>-<timestamp>/` next to the script — original photo, every
generated picture, and a `details.json` recording which style the client chose.

The key lives in the server process. The browser never receives it.

---

## 2. GitHub Codespaces — run it from GitHub, no laptop setup

This is the quickest way to get it working, and the key never touches the
browser or the repository.

**Step 1 — put the key in a Codespaces secret.**

Go to **github.com/settings/codespaces** → *Codespace secrets* → **New secret**.

- Name: `GEMINI_API_KEY`
- Value: your Google AI Studio key
- Repository access: tick this repository

That page is per-account, so the secret is yours; it is not stored in the repo
and collaborators do not get it. For a team, use *Settings → Secrets and
variables → Codespaces* on the repository instead, which shares it with anyone
who opens a Codespace there.

**Step 2 — put these files in the repo.**

```
index.html
serve.py
.gitignore
.devcontainer/devcontainer.json   <- devcontainer.json from this folder
```

The `.devcontainer` path matters; Codespaces only reads it from there.

**Step 3 — open the Codespace.** Code → Codespaces → *Create codespace on main*.

`serve.py` starts by itself, reads `GEMINI_API_KEY` from the environment, and
binds `0.0.0.0` so the forwarded port works. A "Hairstyle app" preview opens on
port 8000; the **Ports** tab has the `https://…app.github.dev` link.

**Leave the port private.** It defaults to private and should stay that way —
a public port is an unauthenticated endpoint that spends your Google credits.

Saved looks land in `saves/` inside the Codespace. `.gitignore` keeps them out
of git, which is what you want for client photos, but it also means they vanish
when the Codespace is deleted. Right-click and download anything you need to
keep, or move to the AWS setup below once real clients are involved.

**If it says the key isn't set:** the secret was added after the Codespace was
created. Secrets are injected at start, so restart it (Codespaces → … → Stop,
then reopen).

---

## 3. GitHub Pages (page) + AWS Lambda (backend)

GitHub Pages is static hosting. **It cannot hold a secret** — anything you put
in the repo is public, and anything the page holds is visible in devtools. So
the page goes on Pages and the key goes in Lambda.

**Backend first:**

1. Lambda → create function, Python 3.12, paste `lambda_function.py`.
2. Configuration → Environment variables:
   - `GEMINI_API_KEY` — your key
   - `SAVE_BUCKET` — an S3 bucket you created (Block Public Access ON)
   - `ALLOWED_ORIGIN` — `https://<you>.github.io` — not `*`
3. Configuration → Function URL → Auth type `NONE`, note the URL.
4. Timeout 2 minutes. Memory 512 MB.
5. Execution role → attach an inline policy allowing `s3:PutObject`,
   `s3:GetObject`, `s3:ListBucket` on that bucket only.

**Then the page:**

Edit the config block near the bottom of `index.html`:

```js
window.HAIR_CONFIG = { apiBase: "https://xxxx.lambda-url.us-east-1.on.aws" };
```

Commit `index.html` to a repo, Settings → Pages → deploy from branch. Done.
The page calls your Lambda, your Lambda calls Google. No key in the repo, none
in the browser.

You can also test any backend without editing the file: `?api=https://...`
on the URL overrides the config.

---

## 4. All on AWS

Same Lambda as above, plus the page on S3 + CloudFront:

```bash
aws s3 cp index.html s3://your-site-bucket/index.html
```

Serve that bucket through CloudFront with Origin Access Control (bucket stays
private). Put the Lambda behind the *same* CloudFront distribution on the
`/api/*` path and you can leave `apiBase` empty — same origin, no CORS at all,
and `ALLOWED_ORIGIN` stops mattering.

For anything customer-facing, add in front of the Lambda:

- **WAF rate limiting** — a few requests per minute per IP. Without it, one
  scraper can spend your Google budget overnight.
- **Some form of login** — Cognito, or a shared passcode your Lambda checks.
  A public unauthenticated endpoint that generates paid images is a bill
  waiting to happen.

---

## Keeping the key safe

**The rule:** the key belongs on a server you control. Never in the HTML, never
in the repo, never in a build artifact the browser downloads.

Ranked, best first:

1. **Secrets Manager or SSM Parameter Store (SecureString).** Lambda reads it at
   cold start. Rotatable without redeploying, access is logged. Cost is cents.
2. **Lambda environment variable** (what `lambda_function.py` uses). Fine to
   start with. Encrypt with a customer-managed KMS key so console viewers
   without the KMS grant can't read it.
3. **Local only** — `serve.py` with the key typed at startup or in your shell.
   Nothing to leak as long as the laptop is yours.

Never do these:

- Commit it. If you already have, **rotate it** — deleting the commit doesn't
  help, the value is in the history and in anyone's clone.
- Paste it into `HAIR_CONFIG` or any other client-side variable.
- Put it in a GitHub Pages repo, public or private. Pages serves the file.
- Email or Slack it to a salon owner. Give each site its own key instead.

Also worth doing:

- **Cap the spend.** Google Cloud → Billing → budget alert, plus a quota limit
  on the Generative Language API. This is the single best protection against a
  mistake becoming expensive.
- **One key per deployment**, so you can revoke one salon without breaking the rest.
- **Rotate quarterly**, and immediately when a laptop or staff member leaves.
- **`.gitignore`**: add `.env`, `saves/`, `*.pem`. Client photos should not be
  in version control.

## Which GitHub secret store to use

None of them, for the Gemini key. Every GitHub secret store is build-time or
developer-time; none can hand a value to a static page at runtime.

| Store | Reaches a running Pages site? | Use it for |
|---|---|---|
| Actions repository secrets | No | CI only |
| Actions environment secrets | No | CI, with approval gates |
| Organization secrets | No | CI shared across repos |
| Codespaces secrets | No (dev container only) | `GEMINI_API_KEY` when running `serve.py` in a Codespace |
| Dependabot secrets | No | Private package registries |

The mistake to avoid: storing the key as an Actions secret and having the
workflow write it into `index.html`. GitHub masks secrets in *logs*, not in
files you build with them. The moment that file is published, the key is public.

`deploy.yml` in this folder shows the shape that works. It references no
secrets at all — only repository *variables* (`AWS_ROLE_ARN`, `AWS_REGION`,
`LAMBDA_NAME`, `API_BASE`), none of which are sensitive. AWS access comes from
OIDC role assumption, so there is no long-lived AWS key in GitHub either. The
last step greps the built file for an `AIza...` pattern and fails the deploy if
one appears.

Turn on as well:

- **Push protection** — free and on by default for public repositories, and
  Google API keys are among the patterns blocked by default. For private repos
  it needs GitHub Secret Protection, billed per committer.
- **Branch protection on `main`**, so nobody pushes straight to what deploys.
- **Environment reviewers** on the `production` environment once real salons
  depend on it.

If a key has ever been committed: rotate it. Rewriting history does not help,
because the value is already in every clone and in GitHub's forks.

## Client photos are personal data

You are storing face photographs against names. That is biometric-adjacent
personal data in most jurisdictions, and salons are not usually set up for it.
Minimum sensible practice:

- Ask the client, out loud, before saving, and note that you did.
- S3 bucket private, encryption on, lifecycle rule to delete after 90 days.
- Be able to delete one client's folder on request — the layout is one folder
  per save, so this is easy.
- Don't post a client's before/after publicly without written permission.

Talk to a lawyer before rolling this out commercially, especially in the EU,
UK, Illinois, Texas or Washington, where biometric and face-image rules are
stricter than most people expect.
