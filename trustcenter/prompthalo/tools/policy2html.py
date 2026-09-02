#!/usr/bin/env python3
"""
policy2html.py – render a PromptHalo policy .docx as a Trust Center HTML page.

Usage:  python3 policy2html.py <policy.docx> <output.html> [--logo logo.txt]

Reuses the Trust Center palette and type so published policies look native to
the site. Drops artifacts that shouldn't be on a public page: the embedded
letterhead image, the Word table of contents (replaced with a live one), and
the signature column of the approvals table.
"""
import subprocess, sys, re, html, pathlib
from bs4 import BeautifulSoup

CSS = """
:root{
  --paper:#f5f7f9; --card:#fff;
  --ink:#16232e; --ink-soft:#44586a; --ink-faint:#6d8092;
  --petrol:#1b4965; --petrol-deep:#12344a;
  --accent:#7e63a8; --accent-tint:#f4f0fa; --accent-deep:#4a3470;
  --line:#dbe3e9; --line-soft:#e9eef2;
  --ok:#2e7d5b; --ok-tint:#eaf5ef;
  --mono:ui-monospace,"SF Mono","Cascadia Mono","Roboto Mono",Menlo,Consolas,monospace;
  --sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --shadow:0 1px 2px rgba(18,52,74,.05),0 6px 18px rgba(18,52,74,.07);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;scroll-padding-top:86px}
body{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.62;-webkit-font-smoothing:antialiased}
a{color:var(--petrol)}
.topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.93);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid var(--line)}
.topbar-inner{max-width:1080px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:14px}
.brand-lockup{display:flex;align-items:center;gap:11px}
.brand-text{display:flex;flex-direction:column;line-height:1.15}
.brand-name{font-weight:800;font-size:15px;letter-spacing:-.01em}
.brand-sub{font-size:11px;color:var(--ink-faint);font-family:var(--mono);letter-spacing:.04em}
.back{margin-left:auto;font-size:13.5px;text-decoration:none;color:var(--ink-soft);border:1px solid var(--line);border-radius:8px;padding:8px 14px;background:#fff}
.back:hover{color:var(--petrol);border-color:#c5d3dd}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px 70px}
.hero{background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);padding:34px 36px;margin-top:28px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-deep);font-weight:700}
h1.doc{font-size:clamp(26px,3.6vw,34px);letter-spacing:-.02em;font-weight:800;margin:12px 0 14px;line-height:1.15}
.meta-strip{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.pill{font-family:var(--mono);font-size:11px;letter-spacing:.04em;border:1px solid var(--line);border-radius:6px;padding:4px 10px;color:var(--ink-soft);background:var(--paper)}
.pill.cls{border-color:#d8cbe8;background:var(--accent-tint);color:var(--accent-deep)}
.layout{display:grid;grid-template-columns:236px 1fr;gap:28px;align-items:start;margin-top:26px}
nav.toc{position:sticky;top:86px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 14px}
nav.toc .t{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);padding:0 6px 9px;border-bottom:1px solid var(--line-soft);margin-bottom:8px}
nav.toc a{display:block;font-size:13.2px;color:var(--ink-soft);text-decoration:none;padding:5px 7px;border-radius:6px;line-height:1.4}
nav.toc a:hover{background:var(--paper);color:var(--petrol)}
.doc-body{background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);padding:34px 38px}
.doc-body h1{font-size:20px;font-weight:800;letter-spacing:-.01em;margin:34px 0 10px;padding-top:20px;border-top:1px solid var(--line-soft);scroll-margin-top:86px}
.doc-body h1:first-of-type{margin-top:0;padding-top:0;border-top:0}
.doc-body h2{font-size:16px;font-weight:700;margin:22px 0 8px;scroll-margin-top:86px}
.doc-body h3{font-size:14.5px;font-weight:700;margin:18px 0 6px;color:var(--ink-soft)}
.doc-body p{margin:0 0 12px}
.doc-body ul,.doc-body ol{margin:0 0 13px;padding-left:22px}
.doc-body li{margin-bottom:6px}
.doc-body table{width:100%;border-collapse:collapse;font-size:13.5px;margin:6px 0 18px}
.doc-body th,.doc-body td{border:1px solid var(--line);padding:9px 12px;vertical-align:top;text-align:left}
.doc-body thead th,.doc-body tr:first-child td strong{background:var(--paper)}
.doc-body td strong{font-weight:700}
.callout{background:var(--accent-tint);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 18px;font-size:14px}
.callout b{color:var(--accent-deep)}
footer{border-top:1px solid var(--line);margin-top:44px;padding:26px 0 40px;font-size:12.5px;color:var(--ink-faint);font-family:var(--mono)}
footer .fi{max-width:1080px;margin:0 auto;padding:0 24px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between}
@media(max-width:900px){.layout{grid-template-columns:1fr}nav.toc{position:static}}
@media(max-width:620px){.doc-body,.hero{padding:24px 20px}}
@media print{.topbar,nav.toc,.back{display:none}body{background:#fff}.doc-body,.hero{box-shadow:none;border:0;padding:0}.layout{display:block}}
"""

def docx_to_soup(path):
    out = subprocess.run(["pandoc","-f","docx","-t","html","--wrap=none",
                          "--no-highlight", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return BeautifulSoup(out, "html.parser")

def harvest_meta(soup):
    """First table is DOCUMENT INFORMATION: label -> value."""
    meta = {}
    t = soup.find("table")
    if not t: return meta, None
    for tr in t.find_all("tr"):
        tds = tr.find_all("td")
        if len(tds) >= 2:
            meta[tds[0].get_text(" ", strip=True).rstrip(":")] = tds[1].get_text(" ", strip=True)
    return meta, t

def clean(soup, meta_table):
    # letterhead image
    for img in soup.find_all("img"):
        p = img.find_parent("p")
        (p or img).decompose()
    # revision/contact preamble duplicated in the meta strip
    for p in soup.find_all("p", limit=4):
        txt = p.get_text(" ", strip=True)
        if txt.startswith(("Revision Date:", "Contact:")):
            p.decompose()
    # DOCUMENT INFORMATION table + its caption (shown in the hero instead)
    if meta_table:
        prev = meta_table.find_previous_sibling("p")
        if prev and "DOCUMENT INFORMATION" in prev.get_text():
            prev.decompose()
        meta_table.decompose()
    # Word TOC -> replaced by the live sidebar
    toc_hdr = soup.find(lambda t: t.name == "p" and "TABLE OF CONTENTS" in t.get_text())
    if toc_hdr:
        nxt = toc_hdr.find_next_sibling()
        while nxt and nxt.name == "p" and nxt.find("a") and nxt.find("a").get("href","").startswith("#"):
            nxt2 = nxt.find_next_sibling(); nxt.decompose(); nxt = nxt2
        toc_hdr.decompose()
    # start the published copy at the first numbered section (Overview),
    # dropping approvals, compliance preamble and validity notice
    first = soup.find("h1")
    if first:
        for el in list(first.find_previous_siblings()):
            el.decompose()
    # drop Annex sections (criteria mappings are internal audit artifacts)
    for h in list(soup.find_all("h1")):
        if re.match(r"^\s*(\d+\s+)?annex\b", h.get_text(" ", strip=True), re.I):
            nxt = h.find_next_sibling()
            h.decompose()
            while nxt and nxt.name != "h1":
                nxt2 = nxt.find_next_sibling(); nxt.decompose(); nxt = nxt2
    # signature column has no meaning on a published copy
    for t in soup.find_all("table"):
        head = t.get_text(" ", strip=True)
        if "Signature" in head:
            for tr in t.find_all("tr"):
                cells = tr.find_all(["td","th"])
                for c in cells:
                    if c.get_text(" ", strip=True) == "Signature":
                        idx = cells.index(c)
                        for tr2 in t.find_all("tr"):
                            cs = tr2.find_all(["td","th"])
                            if len(cs) > idx: cs[idx].decompose()
                        break
            break
    return soup

def slug(s):
    return re.sub(r"[^a-z0-9]+","-", s.lower()).strip("-")

def build_toc(soup):
    items=[]
    for h in soup.find_all(["h1"]):
        txt = h.get_text(" ", strip=True)
        if not txt: continue
        if not h.get("id"): h["id"] = slug(txt)
        items.append((h["id"], txt))
    return items

def render(docx, out, logo_html, back="../index.html", back_label="Trust Center"):
    soup = docx_to_soup(docx)
    meta, mt = harvest_meta(soup)
    soup = clean(soup, mt)
    toc = build_toc(soup)

    title = meta.get("Document Title", pathlib.Path(docx).stem)
    pills = []
    for k, cls in [("Document ID",""),("Current Version",""),("Effective Date",""),
                   ("Next Review Date",""),("Classification","cls"),("Review Cycle","")]:
        if meta.get(k):
            label = {"Current Version":"Version","Next Review Date":"Next review",
                     "Effective Date":"Effective","Document ID":"","Review Cycle":"Review"}.get(k,k)
            v = meta[k]
            pills.append(f'<span class="pill {cls}">{html.escape((label+" " if label else "")+v)}</span>')

    owner = meta.get("Document Owner",""); prepared = meta.get("Prepared By","")
    sub = " · ".join(x for x in [meta.get("Document Family",""), meta.get("Audience","")] if x)

    toc_html = "".join(f'<a href="#{i}">{html.escape(t)}</a>' for i,t in toc)

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)} – PromptHalo Trust Center</title>
<meta name="description" content="{html.escape(title)} – published policy, PromptHalo Trust Center.">
<style>{CSS}</style>
</head>
<body>
<header class="topbar"><div class="topbar-inner">
  <div class="brand-lockup">{logo_html}
    <div class="brand-text"><span class="brand-name">PromptHalo</span><span class="brand-sub">Trust Center</span></div>
  </div>
  <a class="back" href="{back}">&larr; {back_label}</a>
</div></header>

<div class="wrap">
  <div class="hero">
    <div class="eyebrow">Published policy</div>
    <h1 class="doc">{html.escape(title)}</h1>
    <p style="color:var(--ink-soft);max-width:70ch">{html.escape(sub)}</p>
    <div class="meta-strip">{''.join(pills)}</div>
  </div>

  <div class="layout">
    <nav class="toc"><div class="t">On this page</div>{toc_html}</nav>
    <article class="doc-body">
      <div class="callout"><b>About this copy.</b> This is the published version of {html.escape(title)}
      ({html.escape(meta.get("Document ID",""))}, version {html.escape(meta.get("Current Version",""))}).
      Owner: {html.escape(owner)}. Prepared by: {html.escape(prepared)}.
      Printed or locally saved copies are uncontrolled – verify against this page before use.</div>
      {soup.decode()}
    </article>
  </div>
</div>

<footer><div class="fi">
  <span>PromptHalo Technologies · 6475 Preston Rd, Unit 140, Frisco, TX 75034</span>
  <span>security@prompthalo.ai</span>
</div></footer>
</body>
</html>"""
    pathlib.Path(out).write_text(page)
    return title, len(toc), meta

if __name__ == "__main__":
    docx, out = sys.argv[1], sys.argv[2]
    logo = ""
    if "--logo" in sys.argv:
        logo = pathlib.Path(sys.argv[sys.argv.index("--logo")+1]).read_text().strip()
    t, n, m = render(docx, out, logo)
    print(f"{out}: {t} – {n} sections, classification={m.get('Classification','?')}")
