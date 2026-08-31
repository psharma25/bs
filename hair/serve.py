#!/usr/bin/env python3
"""
Run the hairstyle page locally.

    python3 serve.py

It serves index.html at http://localhost:8000 and forwards the image requests
to Google for you. Two things that fixes:

  * "Failed to fetch" goes away. The browser is now talking to localhost, which
    is a real origin, instead of calling Google straight from a file:// page or
    from inside a sandboxed preview.
  * Your API key stays on this machine. It never reaches the browser.

The key is read from the GEMINI_API_KEY environment variable, or --key, or it
asks you when it starts.

    GEMINI_API_KEY=AIza... python3 serve.py
    python3 serve.py --key AIza... --port 8080
"""

import argparse
import base64
import datetime
import http.server
import json
import os
import re
import shutil
import socketserver
import sys
import threading
import urllib.parse
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

GOOGLE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
HERE = Path(__file__).resolve().parent
SAVES = HERE / "saves"
USAGE = HERE / "usage.json"
API_KEY = ""

# What Google charges per generated image, so the per-customer figures mean
# something. Update if the published rates change.
PRICES = {"gemini-3.1-flash-image": 0.067, "gemini-2.5-flash-image": 0.039}
DEFAULT_PRICE = 0.067

_usage_lock = threading.Lock()


def load_usage():
    if USAGE.exists():
        try:
            return json.loads(USAGE.read_text())
        except Exception:
            pass
    return {}


def record_usage(label, model, n=1):
    """One row per customer per month, counted per model."""
    month = datetime.datetime.now().strftime("%Y-%m")
    with _usage_lock:
        data = load_usage()
        customer = data.setdefault(month, {}).setdefault(label or "(unassigned)", {})
        customer[model] = customer.get(model, 0) + n
        USAGE.write_text(json.dumps(data, indent=2))


def usage_summary(allowance=0, month=None):
    month = month or datetime.datetime.now().strftime("%Y-%m")
    data = load_usage().get(month, {})
    rows, t_img, t_cost, t_over = [], 0, 0.0, 0
    for label, models in sorted(data.items()):
        images = sum(models.values())
        cost = sum(PRICES.get(m, DEFAULT_PRICE) * n for m, n in models.items())
        over = max(0, images - allowance) if allowance else 0
        over_cost = sum(
            PRICES.get(m, DEFAULT_PRICE) * n for m, n in models.items()
        ) * (over / images) if images and over else 0.0
        rows.append({
            "customer": label,
            "images": images,
            "cost": round(cost, 4),
            "over": over,
            "overCost": round(over_cost, 4),
            "models": models,
        })
        t_img += images
        t_cost += cost
        t_over += over
    rows.sort(key=lambda r: -r["cost"])
    return {
        "month": month,
        "allowance": allowance,
        "rows": rows,
        "totals": {"images": t_img, "cost": round(t_cost, 4), "over": t_over},
    }


def purge_expired():
    """Delete any saved look whose retention window has passed."""
    if not SAVES.exists():
        return []
    now = datetime.datetime.now().isoformat()
    gone = []
    for folder in list(SAVES.iterdir()):
        meta_file = folder / "details.json"
        if not folder.is_dir() or not meta_file.exists():
            continue
        try:
            expires = json.loads(meta_file.read_text()).get("expiresAt")
        except Exception:
            continue
        if expires and expires < now:
            shutil.rmtree(folder, ignore_errors=True)
            gone.append(folder.name)
    return gone


def slugify(text):
    text = re.sub(r"[^\w.-]+", "-", (text or "").strip().lower()).strip("-")
    return text or "client"


def data_url_bytes(url):
    """Turn a data: URL into (extension, raw bytes)."""
    head, _, payload = (url or "").partition(",")
    if not payload:
        raise ValueError("not a data url")
    ext = "png" if "png" in head else "jpg"
    return ext, base64.b64decode(payload)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(HERE), **kw)

    def log_message(self, fmt, *args):
        if self.path.startswith("/api/"):
            sys.stderr.write("  %s %s\n" % (self.command, self.path))

    def _json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/health"):
            return self._json(200, {"ok": True, "key": bool(API_KEY)})
        if self.path.startswith("/api/saves"):
            purge_expired()
            return self._json(200, {"items": list_saves()})
        if self.path.startswith("/api/usage"):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            try:
                allowance = int((q.get("allowance") or ["0"])[0])
            except ValueError:
                allowance = 0
            return self._json(200, usage_summary(allowance, (q.get("month") or [None])[0]))
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/delete"):
            return self.do_delete()
        if self.path.startswith("/api/save"):
            return self.do_save()
        if not self.path.startswith("/api/gen"):
            return self._json(404, {"error": {"message": "Unknown endpoint."}})
        try:
            length = int(self.headers.get("Content-Length") or 0)
            req = json.loads(self.rfile.read(length) or b"{}")
            model = req.get("model") or "gemini-3.1-flash-image"
            payload = req.get("payload") or {}
        except Exception as exc:
            return self._json(400, {"error": {"message": "Bad request: %s" % exc}})

        # a key typed into the page's test panel wins for this request only; it is
        # never written to disk and never logged
        key = (req.get("key") or "").strip() or API_KEY
        if not key:
            return self._json(400, {"error": {"message": "No API key on the server, and none supplied."}})

        label = ""
        ref = req.get("ref") or {}
        if isinstance(ref, dict):
            label = ref.get("id") or ref.get("nickname") or ref.get("name") or ""

        url = GOOGLE.format(model=model)
        out = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": key},
            method="POST",
        )
        try:
            with urllib.request.urlopen(out, timeout=180) as resp:
                body = resp.read()
            # only count what Google actually returned
            record_usage(label, model)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except urllib.error.HTTPError as exc:
            # pass Google's own message straight through, so errors stay readable
            raw = exc.read()
            try:
                detail = json.loads(raw)
            except Exception:
                detail = {"error": {"message": raw.decode("utf-8", "replace")[:400]}}
            self._json(exc.code, detail)
        except Exception as exc:
            self._json(502, {"error": {"message": "Could not reach Google: %s" % exc}})


    def do_save(self):
        """Write one client's record to saves/<label>-<timestamp>/."""
        try:
            length = int(self.headers.get("Content-Length") or 0)
            rec = json.loads(self.rfile.read(length) or b"{}")
        except Exception as exc:
            return self._json(400, {"error": {"message": "Bad request: %s" % exc}})

        ref = rec.get("ref") or {}
        label = ref.get("id") or ref.get("nickname") or ref.get("name")
        if not label:
            return self._json(400, {"error": {"message": "Need an ID, a nickname or a name."}})

        try:
            keep_days = int(rec.get("keepDays") or 0)
        except (TypeError, ValueError):
            keep_days = 0

        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        slug = "%s-%s" % (slugify(label), stamp)
        folder = SAVES / slug
        folder.mkdir(parents=True, exist_ok=True)

        written = []
        try:
            if rec.get("original"):
                ext, raw = data_url_bytes(rec["original"])
                (folder / ("original." + ext)).write_bytes(raw)
                written.append("original." + ext)
            for style in rec.get("styles") or []:
                sname = slugify(style.get("style"))
                for img in style.get("images") or []:
                    ext, raw = data_url_bytes(img.get("dataUrl"))
                    fname = "%s-%s.%s" % (sname, slugify(img.get("view")), ext)
                    (folder / fname).write_bytes(raw)
                    written.append(fname)
        except Exception as exc:
            return self._json(400, {"error": {"message": "Could not decode an image: %s" % exc}})

        meta = {
            "slug": slug,
            "ref": ref,
            "label": label,
            "set": rec.get("set"),
            "length": rec.get("length"),
            "chosenStyle": rec.get("chosenStyle"),
            "styles": [
                {"style": st.get("style"), "chosen": bool(st.get("chosen")),
                 "views": [i.get("view") for i in st.get("images") or []]}
                for st in rec.get("styles") or []
            ],
            "when": rec.get("when") or datetime.datetime.now().isoformat(),
            "keepDays": keep_days,
            "expiresAt": (
                (datetime.datetime.now() + datetime.timedelta(days=keep_days)).isoformat()
                if keep_days else None
            ),
            "files": written,
        }
        (folder / "details.json").write_text(json.dumps(meta, indent=2))
        print("  saved %d files to saves/%s" % (len(written), slug))
        return self._json(200, {"ok": True, "slug": slug, "files": written})


    def do_delete(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
            slug = (json.loads(self.rfile.read(length) or b"{}")).get("slug") or ""
        except Exception as exc:
            return self._json(400, {"error": {"message": "Bad request: %s" % exc}})
        # keep the slug inside saves/ whatever was sent
        folder = (SAVES / slug).resolve()
        if not slug or SAVES.resolve() not in folder.parents or not folder.is_dir():
            return self._json(404, {"error": {"message": "No such saved look."}})
        shutil.rmtree(folder, ignore_errors=True)
        print("  deleted saves/%s" % slug)
        return self._json(200, {"ok": True, "slug": slug})


def list_saves():
    """Newest first, with a thumbnail path the page can show."""
    if not SAVES.exists():
        return []
    items = []
    for folder in sorted(SAVES.iterdir(), reverse=True):
        meta_file = folder / "details.json"
        if not folder.is_dir() or not meta_file.exists():
            continue
        try:
            meta = json.loads(meta_file.read_text())
        except Exception:
            continue
        thumb = next((f for f in meta.get("files", []) if f.startswith("original.")), None)
        days_left = None
        if meta.get("expiresAt"):
            try:
                delta = datetime.datetime.fromisoformat(meta["expiresAt"]) - datetime.datetime.now()
                days_left = max(0, delta.days + (1 if delta.seconds else 0))
            except Exception:
                days_left = None
        items.append({
            "slug": meta.get("slug", folder.name),
            "keepDays": meta.get("keepDays"),
            "expiresAt": meta.get("expiresAt"),
            "daysLeft": days_left,
            "label": meta.get("label", folder.name),
            "set": meta.get("set"),
            "chosenStyle": meta.get("chosenStyle"),
            "when": meta.get("when"),
            "path": "/saves/%s/" % folder.name,
            "thumb": ("/saves/%s/%s" % (folder.name, thumb)) if thumb else None,
        })
    return items[:60]


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    global API_KEY
    in_codespace = bool(os.environ.get("CODESPACES"))

    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--key", default="")
    ap.add_argument("--no-browser", action="store_true")
    # a Codespace forwards the port from outside the container, so bind all
    # interfaces there; on a laptop stay on loopback where nothing else can reach it
    ap.add_argument("--host", default="0.0.0.0" if in_codespace else "127.0.0.1")
    args = ap.parse_args()

    API_KEY = args.key or os.environ.get("GEMINI_API_KEY", "")
    if not API_KEY and not in_codespace:
        try:
            API_KEY = input("Google AI Studio API key (blank to type one in the page): ").strip()
        except (EOFError, KeyboardInterrupt):
            pass

    if not API_KEY:
        # not fatal: the page has a test panel that can supply a key per request
        print("No key configured, so the server starts without one.")
        if in_codespace:
            print("For normal use add GEMINI_API_KEY at github.com/settings/codespaces >")
            print("Codespace secrets, give this repository access, then restart the Codespace.")
        else:
            print("For normal use pass --key, set GEMINI_API_KEY, or get one free at")
            print("https://aistudio.google.com/apikey")
        print("Otherwise open the page and use \"Use a different key for testing\".")

    if not (HERE / "index.html").exists():
        print("index.html isn't next to this script. Keep the two files together.")
        return 1

    url = "http://localhost:%d/" % args.port
    name = os.environ.get("CODESPACE_NAME")
    domain = os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", "app.github.dev")
    if in_codespace and name:
        url = "https://%s-%d.%s/" % (name, args.port, domain)

    with Server((args.host, args.port), Handler) as httpd:
        print("Serving %s" % url)
        if in_codespace:
            print("Open it from the Ports tab. Keep the port private \u2014 it spends your API credits.")
        print("Your key stays here; the browser never sees it.")
        print("Saved looks go to %s" % SAVES)
        gone = purge_expired()
        if gone:
            print("Removed %d expired look(s)" % len(gone))
        print("Ctrl-C to stop.")
        if not args.no_browser and not in_codespace:
            threading.Timer(0.6, lambda: webbrowser.open(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
