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
import socketserver
import sys
import threading
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

GOOGLE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
HERE = Path(__file__).resolve().parent
SAVES = HERE / "saves"
API_KEY = ""


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
            return self._json(200, {"items": list_saves()})
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/save"):
            return self.do_save()
        if not self.path.startswith("/api/gen"):
            return self._json(404, {"error": {"message": "Unknown endpoint."}})
        if not API_KEY:
            return self._json(400, {"error": {"message": "No API key on the server."}})

        try:
            length = int(self.headers.get("Content-Length") or 0)
            req = json.loads(self.rfile.read(length) or b"{}")
            model = req.get("model") or "gemini-3.1-flash-image"
            payload = req.get("payload") or {}
        except Exception as exc:
            return self._json(400, {"error": {"message": "Bad request: %s" % exc}})

        url = GOOGLE.format(model=model)
        out = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY},
            method="POST",
        )
        try:
            with urllib.request.urlopen(out, timeout=180) as resp:
                body = resp.read()
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
            "files": written,
        }
        (folder / "details.json").write_text(json.dumps(meta, indent=2))
        print("  saved %d files to saves/%s" % (len(written), slug))
        return self._json(200, {"ok": True, "slug": slug, "files": written})


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
        items.append({
            "slug": meta.get("slug", folder.name),
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
            API_KEY = input("Google AI Studio API key: ").strip()
        except (EOFError, KeyboardInterrupt):
            pass
    if not API_KEY:
        if in_codespace:
            print("GEMINI_API_KEY is not set in this Codespace.")
            print("Add it at github.com/settings/codespaces > Codespace secrets,")
            print("give this repository access, then rebuild or restart the Codespace.")
        else:
            print("No key given. Get one free at https://aistudio.google.com/apikey")
        return 1

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
