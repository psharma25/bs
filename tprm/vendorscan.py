#!/usr/bin/env python3
"""
vendorscan.py - passive external security posture scanner for third-party risk assessment.

BitSense, LLC. Passive collection only.

What this does:  DNS record lookups, a single TLS handshake, a single HTTPS GET,
                 and queries to public certificate transparency logs.
What this does NOT do:  port scanning, service enumeration, vulnerability probing,
                        credential testing, or any request the target has not published
                        an endpoint to serve. Everything here is what a browser plus dig
                        already does. No authorisation from the target is required, but
                        keep it that way - do not extend this into active testing without
                        written permission.

Usage:
    python3 vendorscan.py secureframe.com
    python3 vendorscan.py secureframe.com --json out.json --html report.html
    python3 vendorscan.py secureframe.com --svg chart.svg    (standalone chart only)
    python3 vendorscan.py secureframe.com --no-ct        (skip certificate transparency)

Requires: python3.8+, and optionally dnspython (pip install dnspython).
Without dnspython it falls back to the system 'dig'; without either, DNS checks
report as UNKNOWN rather than silently passing.
"""

import argparse, json, re, socket, ssl, subprocess, sys, urllib.request, urllib.error
from datetime import datetime, timezone

VERSION = "1.0"
UA = "BitSense-VendorScan/1.0 (passive third-party risk assessment)"
TIMEOUT = 12

# ---------------------------------------------------------------- scoring model
# Weights sum to 100. Each check contributes points within its category.
CATEGORIES = {
    "transport":   {"label": "Transport security (TLS)",     "weight": 25},
    "headers":     {"label": "HTTP security headers",        "weight": 20},
    "email":       {"label": "Email authentication",         "weight": 20},
    "dns":         {"label": "DNS hygiene",                  "weight": 15},
    "surface":     {"label": "Attack surface",               "weight": 10},
    "disclosure":  {"label": "Disclosure & transparency",    "weight": 10},
}

SEV_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}


class Result:
    def __init__(self, domain):
        self.domain = domain
        self.started = datetime.now(timezone.utc)
        self.findings = []          # dicts
        self.evidence = {}          # raw observations
        self.scores = {}            # category -> (earned, possible)
        self.errors = []

    def add(self, cat, check, passed, severity, title, observed, recommendation, points, possible):
        self.findings.append({
            "category": cat, "check": check, "passed": passed,
            "severity": severity if not passed else "info",
            "title": title, "observed": observed,
            "recommendation": recommendation if not passed else "",
            "points": points, "possible": possible,
        })
        e, p = self.scores.get(cat, (0, 0))
        self.scores[cat] = (e + points, p + possible)

    def unknown(self, cat, check, title, reason, possible):
        """Record a check that could not be run. Awards half credit - neither
        rewarding nor penalising the target for our own collection failure."""
        self.findings.append({
            "category": cat, "check": check, "passed": None,
            "severity": "info", "title": title,
            "observed": "Not determined: " + reason,
            "recommendation": "Re-run this check from an unrestricted network.",
            "points": possible / 2.0, "possible": possible,
        })
        e, p = self.scores.get(cat, (0, 0))
        self.scores[cat] = (e + possible / 2.0, p + possible)

    def category_pct(self, cat):
        e, p = self.scores.get(cat, (0, 0))
        return 100.0 * e / p if p else 0.0

    def total(self):
        t = 0.0
        for cat, meta in CATEGORIES.items():
            t += self.category_pct(cat) * meta["weight"] / 100.0
        return round(t, 1)

    def grade(self):
        s = self.total()
        for cut, g in [(90, "A"), (80, "B"), (70, "C"), (60, "D"), (0, "F")]:
            if s >= cut:
                return g
        return "F"


# ---------------------------------------------------------------- DNS backends
class DNS:
    def __init__(self):
        self.mode = None
        try:
            import dns.resolver  # noqa
            self.mode = "dnspython"
        except ImportError:
            try:
                subprocess.run(["dig", "-v"], capture_output=True, timeout=5)
                self.mode = "dig"
            except Exception:
                self.mode = None

    def query(self, name, rtype):
        """Return list of strings, or None if DNS is unavailable."""
        if self.mode == "dnspython":
            import dns.resolver
            try:
                r = dns.resolver.resolve(name, rtype, lifetime=TIMEOUT)
                out = []
                for rr in r:
                    s = rr.to_text()
                    out.append(s.strip('"').replace('" "', ''))
                return out
            except Exception:
                return []
        elif self.mode == "dig":
            try:
                p = subprocess.run(["dig", "+short", rtype, name],
                                   capture_output=True, text=True, timeout=TIMEOUT)
                lines = [l.strip().strip('"') for l in p.stdout.splitlines() if l.strip()]
                return lines
            except Exception:
                return []
        return None

    def dnssec(self, name):
        if self.mode == "dnspython":
            import dns.resolver
            try:
                dns.resolver.resolve(name, "DNSKEY", lifetime=TIMEOUT)
                return True
            except Exception:
                return False
        elif self.mode == "dig":
            try:
                p = subprocess.run(["dig", "+short", "DNSKEY", name],
                                   capture_output=True, text=True, timeout=TIMEOUT)
                return bool(p.stdout.strip())
            except Exception:
                return False
        return None


# ---------------------------------------------------------------- TLS
def check_tls(res, host):
    cat = "transport"
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((host, 443), timeout=TIMEOUT) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ss:
                cert = ss.getpeercert()
                proto = ss.version()
                cipher = ss.cipher()
    except Exception as e:
        res.errors.append("TLS handshake failed for %s: %s" % (host, e))
        for c, t, pts in [("tls_valid", "Certificate validity", 8),
                          ("tls_expiry", "Certificate expiry window", 6),
                          ("tls_proto", "TLS protocol version", 6),
                          ("tls_cipher", "Cipher strength", 5)]:
            res.unknown(cat, c, t, "handshake failed (%s)" % type(e).__name__, pts)
        return

    res.evidence["tls"] = {"protocol": proto, "cipher": cipher[0] if cipher else None,
                           "bits": cipher[2] if cipher else None,
                           "issuer": _rdn(cert.get("issuer")),
                           "subject": _rdn(cert.get("subject")),
                           "notAfter": cert.get("notAfter"),
                           "san": [v for k, v in cert.get("subjectAltName", []) if k == "DNS"]}

    # chain validated by wrap_socket succeeding
    issuer = _rdn(cert.get("issuer"))
    res.add(cat, "tls_valid", True, "critical", "Certificate chain validates",
            "Trusted chain, hostname matches. Issuer: %s" % issuer,
            "", 8, 8)

    # Detect TLS interception. If the issuer is not a recognised public CA, the
    # handshake terminated at a middlebox and every TLS observation below describes
    # the proxy, not the target. Silently scoring the proxy would be worse than useless.
    KNOWN_CA = ("digicert", "let's encrypt", "lets encrypt", "sectigo", "globalsign",
                "google trust", "amazon", "godaddy", "entrust", "identrust", "cloudflare",
                "microsoft", "apple", "buypass", "zerossl", "ssl.com", "certum",
                "actalis", "quovadis", "comodo", "thawte", "geotrust", "rapidssl",
                "starfield", "isrg")
    if not any(k in issuer.lower() for k in KNOWN_CA):
        res.evidence["tls_intercepted"] = issuer
        res.errors.append(
            "TLS interception detected: chain issued by '%s', which is not a recognised "
            "public CA. All transport findings describe the intercepting proxy, not %s. "
            "Re-run from a network without TLS inspection." % (issuer, host))

    # expiry
    try:
        exp = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days = (exp - datetime.now(timezone.utc)).days
        if days < 0:
            res.add(cat, "tls_expiry", False, "critical", "Certificate expired",
                    "Expired %d days ago" % -days, "Renew immediately.", 0, 6)
        elif days < 14:
            res.add(cat, "tls_expiry", False, "high", "Certificate expiring imminently",
                    "%d days remaining" % days, "Renew and check automation.", 2, 6)
        elif days < 30:
            res.add(cat, "tls_expiry", False, "medium", "Certificate expiring soon",
                    "%d days remaining" % days, "Confirm renewal automation.", 4, 6)
        else:
            res.add(cat, "tls_expiry", True, "info", "Certificate expiry healthy",
                    "%d days remaining (expires %s)" % (days, exp.date()), "", 6, 6)
    except Exception:
        res.unknown(cat, "tls_expiry", "Certificate expiry window", "could not parse notAfter", 6)

    # protocol
    if proto in ("TLSv1.3",):
        res.add(cat, "tls_proto", True, "info", "Modern TLS negotiated", proto, "", 6, 6)
    elif proto == "TLSv1.2":
        res.add(cat, "tls_proto", True, "info", "TLS 1.2 negotiated",
                proto + " (acceptable; 1.3 preferred)", "", 5, 6)
    else:
        res.add(cat, "tls_proto", False, "high", "Legacy TLS negotiated", str(proto),
                "Disable TLS below 1.2 and enable 1.3.", 0, 6)

    # cipher strength
    bits = cipher[2] if cipher else 0
    if bits and bits >= 256:
        res.add(cat, "tls_cipher", True, "info", "Strong cipher", "%s (%d bit)" % (cipher[0], bits), "", 5, 5)
    elif bits and bits >= 128:
        res.add(cat, "tls_cipher", True, "info", "Adequate cipher", "%s (%d bit)" % (cipher[0], bits), "", 4, 5)
    else:
        res.add(cat, "tls_cipher", False, "high", "Weak or unknown cipher", str(cipher),
                "Restrict to AEAD suites at 128 bit or above.", 0, 5)


def _rdn(seq):
    if not seq:
        return "unknown"
    parts = []
    for rdn in seq:
        for k, v in rdn:
            if k in ("organizationName", "commonName"):
                parts.append(v)
    return " / ".join(dict.fromkeys(parts)) or "unknown"


# ---------------------------------------------------------------- HTTP headers
def check_headers(res, host):
    cat = "headers"
    url = "https://" + host + "/"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            hdrs = {k.lower(): v for k, v in r.headers.items()}
            body_head = r.read(4096)
    except urllib.error.HTTPError as e:
        hdrs = {k.lower(): v for k, v in e.headers.items()} if e.headers else {}
        body_head = b""
    except Exception as e:
        res.errors.append("HTTPS GET failed: %s" % e)
        for c, t, pts in [("hsts", "Strict-Transport-Security", 6), ("csp", "Content-Security-Policy", 5),
                          ("xcto", "X-Content-Type-Options", 3), ("frame", "Clickjacking protection", 3),
                          ("refpol", "Referrer-Policy", 2), ("banner", "Server banner disclosure", 1)]:
            res.unknown(cat, c, t, "request failed", pts)
        return

    res.evidence["headers"] = hdrs

    # HSTS
    h = hdrs.get("strict-transport-security", "")
    if h:
        m = re.search(r"max-age=(\d+)", h)
        age = int(m.group(1)) if m else 0
        sub = "includesubdomains" in h.lower()
        pre = "preload" in h.lower()
        if age >= 31536000 and sub and pre:
            res.add(cat, "hsts", True, "info", "HSTS fully configured", h, "", 6, 6)
        elif age >= 31536000 and sub:
            res.add(cat, "hsts", True, "info", "HSTS strong (no preload)", h, "", 5, 6)
        elif age >= 31536000:
            res.add(cat, "hsts", False, "low", "HSTS lacks includeSubDomains", h,
                    "Add includeSubDomains; consider preload.", 3, 6)
        else:
            res.add(cat, "hsts", False, "medium", "HSTS max-age too short", h,
                    "Set max-age to at least 31536000.", 2, 6)
    else:
        res.add(cat, "hsts", False, "high", "No HSTS header", "absent",
                "Add Strict-Transport-Security with max-age >= 1 year.", 0, 6)

    # CSP
    csp = hdrs.get("content-security-policy") or hdrs.get("content-security-policy-report-only")
    if hdrs.get("content-security-policy"):
        weak = "unsafe-inline" in csp.lower() or "unsafe-eval" in csp.lower()
        if weak:
            res.add(cat, "csp", False, "low", "CSP present but permissive",
                    "Contains unsafe-inline or unsafe-eval", "Move to nonce or hash based CSP.", 3, 5)
        else:
            res.add(cat, "csp", True, "info", "CSP enforced", csp[:120] + ("..." if len(csp) > 120 else ""), "", 5, 5)
    elif csp:
        res.add(cat, "csp", False, "medium", "CSP in report-only mode", "report-only",
                "Move to enforcing mode.", 2, 5)
    else:
        res.add(cat, "csp", False, "medium", "No Content-Security-Policy", "absent",
                "Deploy a CSP; start in report-only.", 0, 5)

    # X-Content-Type-Options
    if hdrs.get("x-content-type-options", "").lower() == "nosniff":
        res.add(cat, "xcto", True, "info", "MIME sniffing disabled", "nosniff", "", 3, 3)
    else:
        res.add(cat, "xcto", False, "low", "X-Content-Type-Options missing", "absent",
                "Set to nosniff.", 0, 3)

    # clickjacking
    fa = "frame-ancestors" in (hdrs.get("content-security-policy") or "").lower()
    xfo = hdrs.get("x-frame-options", "")
    if fa or xfo:
        res.add(cat, "frame", True, "info", "Clickjacking protection present",
                "frame-ancestors" if fa else "X-Frame-Options: " + xfo, "", 3, 3)
    else:
        res.add(cat, "frame", False, "medium", "No clickjacking protection", "absent",
                "Set CSP frame-ancestors or X-Frame-Options.", 0, 3)

    # referrer policy
    rp = hdrs.get("referrer-policy", "")
    if rp and rp.lower() not in ("unsafe-url", "no-referrer-when-downgrade"):
        res.add(cat, "refpol", True, "info", "Referrer-Policy set", rp, "", 2, 2)
    elif rp:
        res.add(cat, "refpol", False, "low", "Referrer-Policy permissive", rp,
                "Use strict-origin-when-cross-origin or tighter.", 1, 2)
    else:
        res.add(cat, "refpol", False, "low", "Referrer-Policy missing", "absent",
                "Set strict-origin-when-cross-origin.", 0, 2)

    # banner
    srv = hdrs.get("server", "")
    xp = hdrs.get("x-powered-by", "")
    if re.search(r"\d+\.\d+", srv + " " + xp):
        res.add(cat, "banner", False, "low", "Version disclosed in banner",
                (srv + " " + xp).strip(), "Suppress version strings.", 0, 1)
    else:
        res.add(cat, "banner", True, "info", "No version disclosure",
                srv or "server header absent", "", 1, 1)


# ---------------------------------------------------------------- email auth
COMMON_DKIM = ["google", "selector1", "selector2", "k1", "k2", "dkim", "mail",
               "s1", "s2", "default", "mandrill", "sendgrid", "zoho", "protonmail"]


def check_email(res, dns, domain):
    cat = "email"
    if dns.mode is None:
        for c, t, pts in [("spf", "SPF record", 7), ("dmarc", "DMARC policy", 9),
                          ("dkim", "DKIM selector discovery", 4)]:
            res.unknown(cat, c, t, "no DNS resolver available", pts)
        return

    # SPF
    txt = dns.query(domain, "TXT") or []
    spf = [t for t in txt if t.lower().startswith("v=spf1")]
    res.evidence["spf"] = spf
    if not spf:
        res.add(cat, "spf", False, "high", "No SPF record", "absent",
                "Publish an SPF record ending in -all.", 0, 7)
    else:
        s = spf[0]
        if s.strip().endswith("-all"):
            res.add(cat, "spf", True, "info", "SPF strict (hard fail)", s, "", 7, 7)
        elif s.strip().endswith("~all"):
            res.add(cat, "spf", False, "low", "SPF soft fail", s,
                    "Move to -all once senders are confirmed.", 5, 7)
        elif s.strip().endswith("?all"):
            res.add(cat, "spf", False, "medium", "SPF neutral - provides no protection", s,
                    "Change ?all to -all.", 2, 7)
        else:
            res.add(cat, "spf", False, "medium", "SPF has no terminating all", s,
                    "Add -all.", 2, 7)

    # DMARC
    dtxt = dns.query("_dmarc." + domain, "TXT") or []
    dmarc = [t for t in dtxt if t.lower().startswith("v=dmarc1")]
    res.evidence["dmarc"] = dmarc
    if not dmarc:
        res.add(cat, "dmarc", False, "high", "No DMARC record", "absent",
                "Publish DMARC at p=none with rua, then progress to reject.", 0, 9)
    else:
        d = dmarc[0].lower()
        has_rua = "rua=" in d
        if "p=reject" in d:
            res.add(cat, "dmarc", True, "info", "DMARC enforcing (reject)",
                    dmarc[0] + ("" if has_rua else "  [no rua - no visibility]"), "", 9 if has_rua else 8, 9)
        elif "p=quarantine" in d:
            res.add(cat, "dmarc", False, "low", "DMARC at quarantine", dmarc[0],
                    "Progress to p=reject.", 6, 9)
        else:
            res.add(cat, "dmarc", False, "medium",
                    "DMARC at p=none - monitoring only, no protection", dmarc[0],
                    "Progress to quarantine then reject.", 3, 9)

    # DKIM - probe common selectors only. Absence proves nothing.
    found = []
    for sel in COMMON_DKIM:
        r = dns.query("%s._domainkey.%s" % (sel, domain), "TXT")
        if r:
            found.append(sel)
    res.evidence["dkim_selectors"] = found
    if found:
        res.add(cat, "dkim", True, "info", "DKIM selector(s) discovered",
                ", ".join(found), "", 4, 4)
    else:
        res.add(cat, "dkim", False, "low",
                "No DKIM selector found among common names", "none of %d probed" % len(COMMON_DKIM),
                "Not conclusive - selectors are arbitrary. Ask the vendor.", 2, 4)


# ---------------------------------------------------------------- DNS hygiene
def check_dns(res, dns, domain):
    cat = "dns"
    if dns.mode is None:
        for c, t, pts in [("caa", "CAA records", 6), ("dnssec", "DNSSEC", 5), ("ns", "Nameserver diversity", 4)]:
            res.unknown(cat, c, t, "no DNS resolver available", pts)
        return

    caa = dns.query(domain, "CAA") or []
    res.evidence["caa"] = caa
    if caa:
        res.add(cat, "caa", True, "info", "CAA records published",
                "; ".join(caa[:3]), "", 6, 6)
    else:
        res.add(cat, "caa", False, "medium", "No CAA records", "absent",
                "Publish CAA to restrict which CAs may issue for this domain.", 0, 6)

    ds = dns.dnssec(domain)
    if ds:
        res.add(cat, "dnssec", True, "info", "DNSSEC signed", "DNSKEY present", "", 5, 5)
    elif ds is False:
        res.add(cat, "dnssec", False, "low", "DNSSEC not enabled", "no DNSKEY",
                "Consider signing. Not universal practice; low weight.", 1, 5)
    else:
        res.unknown(cat, "dnssec", "DNSSEC", "could not determine", 5)

    ns = dns.query(domain, "NS") or []
    res.evidence["ns"] = ns
    provs = set(".".join(n.rstrip(".").split(".")[-2:]) for n in ns)
    if len(ns) >= 4 and len(provs) >= 2:
        res.add(cat, "ns", True, "info", "Nameservers redundant and diverse",
                "%d nameservers across %d providers" % (len(ns), len(provs)), "", 4, 4)
    elif len(ns) >= 2:
        res.add(cat, "ns", True, "info", "Nameservers redundant",
                "%d nameservers, %d provider(s)" % (len(ns), len(provs)), "", 3, 4)
    elif ns:
        res.add(cat, "ns", False, "medium", "Single nameserver", str(ns),
                "Add redundant nameservers.", 0, 4)
    else:
        res.unknown(cat, "ns", "Nameserver diversity", "no NS returned", 4)


# ---------------------------------------------------------------- attack surface
RISKY = re.compile(r"(^|[.\-])(dev|test|staging|stage|uat|qa|demo|sandbox|internal|"
                   r"admin|jenkins|jira|vpn|gitlab|grafana|kibana|legacy|old|backup)([.\-]|$)", re.I)


def check_surface(res, domain, do_ct=True):
    cat = "surface"
    if not do_ct:
        res.unknown(cat, "ct_volume", "Certificate transparency footprint", "skipped by flag", 5)
        res.unknown(cat, "ct_risky", "Sensitive-looking hostnames", "skipped by flag", 5)
        return
    url = "https://crt.sh/?q=%%25.%s&output=json" % domain
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode("utf-8", "replace"))
    except Exception as e:
        res.errors.append("crt.sh query failed: %s" % e)
        res.unknown(cat, "ct_volume", "Certificate transparency footprint", "crt.sh unreachable", 5)
        res.unknown(cat, "ct_risky", "Sensitive-looking hostnames", "crt.sh unreachable", 5)
        return

    names = set()
    for row in data:
        for n in (row.get("name_value") or "").split("\n"):
            n = n.strip().lower().lstrip("*.")
            if n.endswith(domain):
                names.add(n)
    res.evidence["ct_hostnames"] = sorted(names)

    n = len(names)
    if n <= 40:
        res.add(cat, "ct_volume", True, "info", "Contained certificate footprint",
                "%d distinct hostnames in CT logs" % n, "", 5, 5)
    elif n <= 150:
        res.add(cat, "ct_volume", False, "low", "Moderate certificate footprint",
                "%d distinct hostnames" % n, "Review for decommissioned hosts.", 3, 5)
    else:
        res.add(cat, "ct_volume", False, "medium", "Large certificate footprint",
                "%d distinct hostnames" % n,
                "Large surface. Confirm inventory and decommissioning process.", 1, 5)

    risky = sorted([h for h in names if RISKY.search(h.replace(domain, ""))])
    res.evidence["ct_risky"] = risky
    if not risky:
        res.add(cat, "ct_risky", True, "info", "No sensitive-looking hostnames in CT",
                "none matched", "", 5, 5)
    elif len(risky) <= 3:
        res.add(cat, "ct_risky", False, "low", "Some non-production hostnames visible",
                ", ".join(risky[:6]),
                "Confirm these are intended to be internet-facing.", 3, 5)
    else:
        res.add(cat, "ct_risky", False, "medium", "Multiple non-production hostnames visible",
                ", ".join(risky[:8]) + (" (+%d more)" % (len(risky) - 8) if len(risky) > 8 else ""),
                "Ask which are reachable and how they are access-controlled.", 1, 5)


# ---------------------------------------------------------------- disclosure
def check_disclosure(res, host):
    cat = "disclosure"
    found = None
    for path in ("/.well-known/security.txt", "/security.txt"):
        try:
            req = urllib.request.Request("https://" + host + path, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                if r.status == 200:
                    body = r.read(4096).decode("utf-8", "replace")
                    if "contact" in body.lower():
                        found = (path, body)
                        break
        except Exception:
            continue
    res.evidence["security_txt"] = found[0] if found else None
    if found:
        body = found[1].lower()
        extras = sum(1 for k in ("expires", "policy", "encryption") if k in body)
        res.add(cat, "sectxt", True, "info", "security.txt published",
                "%s with Contact%s" % (found[0], ", plus %d optional fields" % extras if extras else ""),
                "", 6 if extras else 5, 6)
    else:
        res.add(cat, "sectxt", False, "medium", "No security.txt (RFC 9116)", "absent",
                "Publish /.well-known/security.txt with a Contact and Policy link. "
                "For a security vendor this is a notable omission.", 0, 6)

    # cookie flags on landing page
    try:
        req = urllib.request.Request("https://" + host + "/", headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            cookies = r.headers.get_all("Set-Cookie") or []
    except Exception:
        cookies = []
    res.evidence["cookies"] = len(cookies)
    if not cookies:
        res.add(cat, "cookies", True, "info", "No cookies set on landing page",
                "none observed", "", 4, 4)
    else:
        bad = [c.split("=")[0] for c in cookies
               if "secure" not in c.lower() or "httponly" not in c.lower()]
        if not bad:
            res.add(cat, "cookies", True, "info", "Cookies carry Secure and HttpOnly",
                    "%d cookie(s), all flagged" % len(cookies), "", 4, 4)
        else:
            res.add(cat, "cookies", False, "low", "Cookies missing Secure or HttpOnly",
                    "%d of %d: %s" % (len(bad), len(cookies), ", ".join(bad[:5])),
                    "Set Secure, HttpOnly and SameSite.", 1, 4)


# ---------------------------------------------------------------- report
def render_svg(res):
    """Standalone SVG chart. Self-contained, no external references, no CSS
    variables - safe to drop into PowerPoint, Word, Confluence or a web page."""
    cats = list(CATEGORIES.items())
    W, H = 760, 150 + len(cats) * 34 + 72
    pad, track = 210, 760 - 210 - 96
    unit = track / 100.0
    g = res.grade()
    gcol = {"A": "#1d6b4f", "B": "#1d6b4f", "C": "#8a5b00", "D": "#8a5b00", "F": "#9b2226"}[g]
    bands = [(75, "75%", "#1d6b4f"), (50, "50%", "#8a5b00")]
    npass = sum(1 for f in res.findings if f["passed"] is True)
    nfail = sum(1 for f in res.findings if f["passed"] is False)
    nunk = sum(1 for f in res.findings if f["passed"] is None)
    FF = "Inter,Calibri,'Segoe UI',system-ui,sans-serif"

    p = []
    p.append('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
             'viewBox="0 0 %d %d" role="img" aria-label="External security posture for %s">'
             % (W, H, W, H, _esc(res.domain)))
    p.append('<title>External security posture &#8212; %s</title>' % _esc(res.domain))
    p.append('<rect width="%d" height="%d" fill="#ffffff"/>' % (W, H))

    # header band
    p.append('<rect x="0" y="0" width="%d" height="62" fill="#1b4965"/>' % W)
    p.append('<text x="26" y="27" font-family="%s" font-size="15" font-weight="600" fill="#ffffff">'
             'External security posture &#8212; %s</text>' % (FF, _esc(res.domain)))
    p.append('<text x="26" y="46" font-family="%s" font-size="11" fill="#b9cede">'
             'BitSense passive scan v%s &#183; %s &#183; no active testing performed</text>'
             % (FF, VERSION, res.started.strftime("%Y-%m-%d %H:%M UTC")))

    # hero
    y = 92
    p.append('<text x="26" y="%d" font-family="%s" font-size="10" font-weight="600" '
             'letter-spacing="0.7" fill="#75868f">GRADE</text>' % (y, FF))
    p.append('<text x="26" y="%d" font-family="%s" font-size="44" font-weight="600" fill="%s">%s</text>'
             % (y + 40, FF, gcol, g))
    p.append('<text x="120" y="%d" font-family="%s" font-size="10" font-weight="600" '
             'letter-spacing="0.7" fill="#75868f">WEIGHTED SCORE</text>' % (y, FF))
    p.append('<text x="120" y="%d" font-family="%s" font-size="26" font-weight="600" fill="#1b4965">%s'
             '<tspan font-size="12" fill="#75868f"> / 100</tspan></text>' % (y + 30, FF, res.total()))
    p.append('<text x="300" y="%d" font-family="%s" font-size="10" font-weight="600" '
             'letter-spacing="0.7" fill="#75868f">CHECKS</text>' % (y, FF))
    p.append('<text x="300" y="%d" font-family="%s" font-size="15" fill="#41545f">'
             '<tspan font-weight="600" fill="#1d6b4f">%d</tspan> pass &#183; '
             '<tspan font-weight="600" fill="#9b2226">%d</tspan> fail &#183; '
             '<tspan font-weight="600" fill="#a15c00">%d</tspan> unknown</text>'
             % (y + 28, FF, npass, nfail, nunk))
    p.append('<line x1="26" y1="150" x2="%d" y2="150" stroke="#d7e0e7" stroke-width="1"/>' % (W - 26))

    # band gridlines
    top = 166
    bot = top + len(cats) * 34 - 8
    for cut, letter, col in bands:
        gx = pad + cut * unit
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#dde5eb" stroke-width="1" '
                 'stroke-dasharray="2,3"/>' % (gx, top - 8, gx, bot + 6))
        p.append('<text x="%.1f" y="%d" font-family="%s" font-size="10" font-weight="600" '
                 'fill="%s" text-anchor="middle">%s</text>' % (gx, bot + 22, FF, col, letter))

    # bars
    for i, (key, meta) in enumerate(cats):
        pct = res.category_pct(key)
        fill, ink = band_for(pct)
        by = top + i * 34
        p.append('<text x="%d" y="%d" font-family="%s" font-size="11.5" fill="#41545f" '
                 'text-anchor="end">%s</text>' % (pad - 12, by + 14, FF, _esc(meta["label"])))
        p.append('<text x="%d" y="%d" font-family="%s" font-size="9.5" fill="#98a7b0" '
                 'text-anchor="end">weight %d%%</text>' % (pad - 12, by + 25, FF, meta["weight"]))
        p.append('<rect x="%d" y="%d" width="%d" height="20" rx="3" fill="#f2f6f9"/>' % (pad, by, track))
        p.append('<rect x="%d" y="%d" width="%.1f" height="20" rx="3" fill="%s"/>'
                 % (pad, by, pct * unit, fill))
        p.append('<text x="%d" y="%d" font-family="%s" font-size="11.5" font-weight="600" '
                 'fill="%s">%d%%</text>' % (pad + track + 10, by + 14, FF, ink, round(pct)))

    # footnote
    p.append('<text x="26" y="%d" font-family="%s" font-size="9.5" fill="#98a7b0">'
             'Externally observable hygiene only. Does not measure internal controls, data handling, '
             'tenant isolation or incident response.</text>' % (H - 12, FF))
    p.append('</svg>')
    return "\n".join(p)



# Pastel bar fills with saturated text tones so labels stay legible.
# Thresholds: 75%+ green, 50-74% yellow, below 50% red.
PALETTE = [(75, "#a3d9b8", "#1d6b4f"), (50, "#f6d98f", "#8a5b00"), (0, "#f2aba9", "#9b2226")]


def band_for(pct):
    for cut, fill, ink in PALETTE:
        if pct >= cut:
            return fill, ink
    return PALETTE[-1][1], PALETTE[-1][2]


def _chart_only_svg(res):
    """The category chart alone, for embedding in the HTML report."""
    cats = list(CATEGORIES.items())
    W, rowH, top, pad = 760, 38, 26, 210
    track, H = W - pad - 96, top + len(cats) * rowH + 34
    unit = track / 100.0
    FF = "Inter,Calibri,'Segoe UI',system-ui,sans-serif"
    bands = [(75, "75%", "#1d6b4f"), (50, "50%", "#8a5b00")]
    p = ['<svg width="100%%" viewBox="0 0 %d %d" role="img" aria-label="Category scores" '
         'style="max-width:%dpx">' % (W, H, W)]
    for cut, letter, col in bands:
        gx = pad + cut * unit
        p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#dde5eb" stroke-width="1" '
                 'stroke-dasharray="2,3"/>' % (gx, top - 10, gx, top + len(cats) * rowH - 12))
        p.append('<text x="%.1f" y="%d" font-family="%s" font-size="10" font-weight="600" fill="%s" '
                 'text-anchor="middle">%s</text>' % (gx, top + len(cats) * rowH + 4, FF, col, letter))
    for i, (key, meta) in enumerate(cats):
        pct = res.category_pct(key)
        fill, ink = band_for(pct)
        y = top + i * rowH
        p.append('<text x="%d" y="%d" font-family="%s" font-size="11.5" fill="#41545f" '
                 'text-anchor="end">%s</text>' % (pad - 12, y + 14, FF, _esc(meta["label"])))
        p.append('<text x="%d" y="%d" font-family="%s" font-size="9.5" fill="#98a7b0" '
                 'text-anchor="end">weight %d%%</text>' % (pad - 12, y + 26, FF, meta["weight"]))
        p.append('<rect x="%d" y="%d" width="%d" height="20" rx="3" fill="#f2f6f9"/>' % (pad, y, track))
        p.append('<rect x="%d" y="%d" width="%.1f" height="20" rx="3" fill="%s"/>' % (pad, y, pct * unit, fill))
        p.append('<text x="%d" y="%d" font-family="%s" font-size="11.5" font-weight="600" fill="%s">%d%%</text>'
                 % (pad + track + 10, y + 14, FF, ink, round(pct)))
    p.append('</svg>')
    lg = '<div style="margin-top:10px;font-size:12px;color:#75868f">'
    for label, (cut, fill, ink) in zip(["&#8805;75%", "50&#8211;74%", "&lt;50%"], PALETTE):
        lg += ('<span style="display:inline-block;width:11px;height:11px;border-radius:2px;'
               'background:%s;border:1px solid %s33;margin:0 5px 0 %dpx"></span>%s'
               % (fill, ink, 0 if cut == 75 else 16, label))
    p.append(lg + '</div>')
    return "".join(p)


def render_html(res):
    g = res.grade()
    gcol = {"A": "var(--green)", "B": "var(--green)", "C": "var(--amber)",
            "D": "var(--amber)", "F": "var(--red)"}[g]
    rows = []
    order = sorted(res.findings, key=lambda f: (list(CATEGORIES).index(f["category"]),
                                                SEV_ORDER.get(f["severity"], 9)))
    for f in order:
        if f["passed"] is True:
            badge = '<span class="tag c">Pass</span>'
        elif f["passed"] is False:
            badge = '<span class="tag %s">%s</span>' % (
                "u" if f["severity"] in ("critical", "high") else "i", f["severity"].title())
        else:
            badge = '<span class="tag i">Unknown</span>'
        rows.append(
            '<tr data-cat="%s"><td>%s</td><td><strong>%s</strong></td><td>%s</td>'
            '<td>%s</td><td>%s</td><td class="num">%s / %s</td></tr>' % (
                f["category"], CATEGORIES[f["category"]]["label"], _esc(f["title"]),
                _esc(f["observed"]), badge, _esc(f["recommendation"]) or "&mdash;",
                ("%g" % f["points"]), ("%g" % f["possible"])))

    cats = [_chart_only_svg(res)]

    errs = ""
    if res.errors:
        errs = ('<div class="callout warn"><strong>Collection errors.</strong><ul class="tight">'
                + "".join("<li>%s</li>" % _esc(e) for e in res.errors) + "</ul></div>")

    return HTML_TMPL.format(
        domain=_esc(res.domain), grade=g, gcol=gcol, score=res.total(),
        when=res.started.strftime("%Y-%m-%d %H:%M UTC"), version=VERSION,
        cats="".join(cats), rows="".join(rows), errs=errs,
        npass=sum(1 for f in res.findings if f["passed"] is True),
        nfail=sum(1 for f in res.findings if f["passed"] is False),
        nunk=sum(1 for f in res.findings if f["passed"] is None))


def _esc(s):
    return (str(s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


HTML_TMPL = """<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>External posture &mdash; {domain}</title><style>
:root{{--petrol:#1b4965;--petrol-dark:#12334a;--wash:#eef3f7;--wash2:#f7f9fb;--ink:#14212b;
--ink2:#41545f;--ink3:#75868f;--line:#d7e0e7;--line2:#b6c5d0;--paper:#fff;
--amber:#a15c00;--amber-bg:#fdf3e3;--red:#9b2226;--red-bg:#fbecec;--green:#1d6b4f;--green-bg:#e8f4ee}}
*{{box-sizing:border-box}}body{{margin:0;font-family:Inter,Calibri,"Segoe UI",system-ui,sans-serif;
background:var(--wash2);color:var(--ink);font-size:15px;line-height:1.55}}
header{{background:var(--petrol);color:#fff;padding:16px 26px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}}
header h1{{font-size:17px;margin:0;font-weight:600}}header .sub{{font-size:12px;opacity:.75;margin-top:2px}}
main{{max-width:1120px;margin:0 auto;padding:22px 26px 80px}}
.card{{background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:18px 20px;
margin-bottom:16px;box-shadow:0 1px 2px rgba(20,33,43,.06),0 4px 14px rgba(20,33,43,.05)}}
.card h3{{font-size:15px;margin:0 0 4px;color:var(--petrol-dark)}}
.card .hint{{font-size:12.5px;color:var(--ink3);margin:0 0 12px}}
.hero{{display:flex;gap:30px;align-items:center;flex-wrap:wrap}}
.grade{{font-size:64px;font-weight:600;line-height:1}}
.sc{{font-size:30px;font-weight:600;color:var(--petrol);font-variant-numeric:tabular-nums}}
.lab{{font-size:11px;text-transform:uppercase;letter-spacing:.7px;color:var(--ink3);font-weight:600}}
.catrow{{display:grid;grid-template-columns:200px 1fr 48px;gap:12px;align-items:center;margin-bottom:9px}}
.cl{{font-size:13px;font-weight:600;color:var(--ink2)}}.cl small{{display:block;font-weight:400;color:var(--ink3);font-size:11px}}
.bar{{background:var(--wash);border-radius:3px;height:16px;overflow:hidden}}
.bar span{{display:block;height:100%;border-radius:3px}}
.cp{{text-align:right;font-size:12.5px;color:var(--ink3);font-variant-numeric:tabular-nums}}
table{{width:100%;border-collapse:collapse;font-size:13px}}
th{{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--ink3);
font-weight:600;padding:7px 8px;border-bottom:1px solid var(--line2)}}
td{{padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}}
td.num{{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink3);white-space:nowrap}}
tbody tr:hover td{{background:var(--wash2)}}
.tag{{display:inline-block;font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:20px;
background:var(--wash);color:var(--petrol);border:1px solid var(--line);white-space:nowrap}}
.tag.c{{background:var(--green-bg);color:var(--green);border-color:#bcdccb}}
.tag.i{{background:var(--amber-bg);color:var(--amber);border-color:#ecd6ae}}
.tag.u{{background:var(--red-bg);color:var(--red);border-color:#e3bfc0}}
.callout{{border-left:3px solid var(--petrol);background:var(--wash);padding:12px 15px;
border-radius:0 6px 6px 0;margin:14px 0;font-size:13.5px}}
.callout.warn{{border-left-color:var(--amber);background:var(--amber-bg)}}
ul.tight{{margin:6px 0;padding-left:20px}}ul.tight li{{margin-bottom:4px}}
@media print{{header{{-webkit-print-color-adjust:exact}}}}
</style></head><body>
<header><div><h1>External security posture &mdash; {domain}</h1>
<div class="sub">BitSense passive scan v{version} &middot; {when} &middot; no active testing performed</div></div></header>
<main>
<div class="card"><div class="hero">
<div><div class="lab">Grade</div><div class="grade" style="color:{gcol}">{grade}</div></div>
<div><div class="lab">Weighted score</div><div class="sc">{score}<span style="font-size:15px;color:var(--ink3)"> / 100</span></div></div>
<div><div class="lab">Checks</div><div class="sc">{npass}<span style="font-size:15px;color:var(--ink3)"> pass</span> &middot; {nfail}<span style="font-size:15px;color:var(--ink3)"> fail</span> &middot; {nunk}<span style="font-size:15px;color:var(--ink3)"> unknown</span></div></div>
</div></div>
<div class="card"><h3>Category breakdown</h3>
<p class="hint">Pastel fill by score band. Dashed gridlines mark the 50% and 75% colour thresholds.</p>{cats}</div>
{errs}
<div class="card"><h3>Findings</h3>
<p class="hint">Sorted by category, then severity. Points shown are earned against possible.</p>
<table><thead><tr><th style="width:15%">Category</th><th style="width:19%">Check</th>
<th style="width:24%">Observed</th><th style="width:9%">Result</th>
<th style="width:24%">Recommendation</th><th style="width:9%">Points</th></tr></thead>
<tbody>{rows}</tbody></table></div>
<div class="card"><h3>Interpretation and limits</h3>
<ul class="tight">
<li>This measures <strong>externally observable hygiene</strong>. It does not measure internal controls,
data handling, tenant isolation, or incident response &mdash; the things that actually determine whether a
vendor is safe to use. A grade of A here is compatible with poor internal security.</li>
<li>Commercial ratings services measure roughly this, plus breach feeds and IP reputation. Treat any such
score, including this one, as <strong>change detection</strong> rather than assessment.</li>
<li>Unknown results award half credit so that a collection failure neither rewards nor penalises the target.
Re-run from an unrestricted network to resolve them.</li>
<li>Absence of a DKIM selector is not evidence of absent DKIM &mdash; selectors are arbitrary strings and only
common names are probed.</li>
</ul></div>
</main></body></html>"""


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description="Passive external posture scan for vendor risk assessment.")
    ap.add_argument("domain")
    ap.add_argument("--host", help="hostname to connect to (default: www.<domain> falling back to <domain>)")
    ap.add_argument("--json", help="write raw results to this path")
    ap.add_argument("--html", help="write HTML report to this path")
    ap.add_argument("--svg", help="write a standalone SVG chart to this path")
    ap.add_argument("--no-ct", action="store_true", help="skip certificate transparency lookup")
    args = ap.parse_args()

    domain = args.domain.strip().lower().replace("https://", "").replace("http://", "").strip("/")
    host = args.host or domain
    try:
        socket.gethostbyname(host)
    except Exception:
        alt = "www." + domain
        try:
            socket.gethostbyname(alt)
            host = alt
        except Exception:
            pass

    res = Result(domain)
    dns = DNS()
    print("vendorscan %s  target=%s  host=%s  dns=%s" % (VERSION, domain, host, dns.mode or "unavailable"),
          file=sys.stderr)

    check_tls(res, host)
    check_headers(res, host)
    check_email(res, dns, domain)
    check_dns(res, dns, domain)
    check_surface(res, domain, do_ct=not args.no_ct)
    check_disclosure(res, host)

    out = {"scanner": "vendorscan", "version": VERSION, "domain": domain, "host": host,
           "scanned_utc": res.started.isoformat(), "grade": res.grade(), "score": res.total(),
           "categories": {k: round(res.category_pct(k), 1) for k in CATEGORIES},
           "findings": res.findings, "evidence": res.evidence, "errors": res.errors}

    if args.json:
        with open(args.json, "w") as f:
            json.dump(out, f, indent=2)
        print("wrote %s" % args.json, file=sys.stderr)
    if args.html:
        with open(args.html, "w") as f:
            f.write(render_html(res))
        print("wrote %s" % args.html, file=sys.stderr)
    if args.svg:
        with open(args.svg, "w") as f:
            f.write(render_svg(res))
        print("wrote %s" % args.svg, file=sys.stderr)
    if not args.json and not args.html and not args.svg:
        print(json.dumps(out, indent=2))

    print("\n%s  grade %s  score %.1f/100  (%d pass / %d fail / %d unknown)" % (
        domain, res.grade(), res.total(),
        sum(1 for f in res.findings if f["passed"] is True),
        sum(1 for f in res.findings if f["passed"] is False),
        sum(1 for f in res.findings if f["passed"] is None)), file=sys.stderr)


if __name__ == "__main__":
    main()
