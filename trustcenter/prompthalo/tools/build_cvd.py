#!/usr/bin/env python3
"""Render the CVD / Responsible Disclosure policy as a Trust Center page."""
import pathlib, sys
sys.path.insert(0, "/home/claude")
from policy2html import CSS

LOGO = pathlib.Path("/home/claude/_phlogo.txt").read_text().strip()

SECTIONS = [
    ("purpose", "1 Purpose", """
<p>PromptHalo builds security testing tools. It would be incoherent to run an adversarial testing platform and make it hard for researchers to tell us when we have a problem of our own. This policy sets out how to report a vulnerability in a PromptHalo product or system, what we commit to in return, and the protections that apply to research conducted in good faith.</p>
<p>This is a coordinated vulnerability disclosure (CVD) policy. It is not a bug bounty programme — see section 9.</p>
"""),
    ("scope", "2 Scope", """
<p><strong>In scope.</strong> Any system PromptHalo operates or controls:</p>
<ul>
<li>The PromptHalo platform and its API</li>
<li>prompthalo.com, this Trust Center, and other PromptHalo-operated web properties</li>
<li>PromptHalo-published client libraries, agents, and integrations</li>
<li>Our cloud infrastructure, insofar as it is reachable from the internet</li>
</ul>
<p><strong>Out of scope.</strong> These are not ours to authorize testing against, and reports about them should go to the party that owns them:</p>
<ul>
<li><strong>Customer target systems.</strong> Systems our customers point the platform at belong to those customers. We cannot grant permission to test them.</li>
<li><strong>Third-party services.</strong> Our subprocessors — cloud, identity, and model providers — have their own disclosure programmes. The current list is published in the Subprocessors section of the Trust Center.</li>
<li>Social engineering of PromptHalo staff, customers, or vendors</li>
<li>Physical attacks against our offices or personnel</li>
<li>Denial-of-service and volumetric testing of any kind</li>
</ul>
<p><strong>Generally not accepted</strong> without a demonstrated security impact: missing security headers, weak TLS ciphers with no exploit path, self-XSS, clickjacking on pages with no sensitive action, output from an automated scanner with no verification, and rate-limiting observations unaccompanied by an attack that they enable.</p>
"""),
    ("safe-harbor", "3 Safe harbour", """
<div class="callout"><b>Our commitment.</b> If you make a good-faith effort to comply with this policy during your research, we will consider your work authorized, we will not initiate or support legal action against you, and we will not report you to law enforcement. If a third party brings legal action against you for research conducted within this policy, we will make it known that your activity was authorized.</div>
<p>Good faith means, concretely:</p>
<ul>
<li>Access, modify, and retain <strong>only</strong> what is necessary to demonstrate the issue. One record is proof; a thousand is exfiltration.</li>
<li>If you encounter personal data, customer content, or credentials, <strong>stop immediately</strong>, do not save or transmit it, and tell us what you found in general terms.</li>
<li>Do not degrade, disrupt, or reduce the availability of any service.</li>
<li>Do not use a finding to pivot further into our environment once impact is established.</li>
<li>Give us reasonable time to remediate before disclosing publicly (section 8).</li>
</ul>
<p>Safe harbour does not extend to activity that violates the law independently of this policy, or to research on out-of-scope assets. This policy is a statement of how we will act; it cannot bind third parties.</p>
"""),
    ("how-to-report", "4 How to report", """
<p>Email <a href="mailto:security@prompthalo.com">security@prompthalo.com</a>. Machine-readable contact details are published at <code>https://prompthalo.com/.well-known/security.txt</code>.</p>
<p>Encrypted reports are welcome — use the PGP key referenced in <code>security.txt</code>. If you would prefer to report anonymously, you may; it only means we cannot follow up or credit you.</p>
<p>A useful report includes:</p>
<ul>
<li>The affected asset — URL, endpoint, or component</li>
<li>Vulnerability type and, if you have one, a CVSS v3.1 vector</li>
<li>Steps to reproduce, in enough detail that we can follow them without guessing</li>
<li>Proof of impact — a screenshot, a request/response pair, a short video</li>
<li>Any prerequisites: authentication, role, tenant, timing</li>
<li>How you would like to be credited, if at all</li>
</ul>
<p>Please do not open a public issue, post to social media, or file through a broker before contacting us.</p>
"""),
    ("our-commitments", "5 What we commit to", """
<p>These are commitments, not aspirations. If we are going to miss one, we will tell you before the deadline rather than after it.</p>
<table>
<thead><tr><th>Stage</th><th>Target</th><th>What happens</th></tr></thead>
<tbody>
<tr><td><strong>Acknowledgement</strong></td><td>2 business days</td><td>A human confirms receipt and gives you a tracking reference.</td></tr>
<tr><td><strong>Triage</strong></td><td>5 business days</td><td>We reproduce the issue, assign severity, and tell you whether it is in scope and accepted.</td></tr>
<tr><td><strong>Status updates</strong></td><td>Every 14 days</td><td>Until the issue is closed, whether or not there is news.</td></tr>
<tr><td><strong>Remediation</strong></td><td>Severity-based — section 6</td><td>Fix deployed, or a documented compensating control with a dated plan.</td></tr>
<tr><td><strong>Resolution notice</strong></td><td>5 business days after fix</td><td>We confirm remediation and invite you to verify.</td></tr>
<tr><td><strong>Coordinated disclosure</strong></td><td>90 days by default</td><td>Published as an advisory, coordinated with you — section 8.</td></tr>
</tbody>
</table>
"""),
    ("severity", "6 Severity and remediation timelines", """
<p>We score with CVSS v3.1 and adjust for exploitability in our environment and for blast radius across tenants. Where our assessment differs from yours, we will explain the reasoning rather than simply reassign the number.</p>
<table>
<thead><tr><th>Severity</th><th>CVSS</th><th>Remediation target</th><th>Typical examples</th></tr></thead>
<tbody>
<tr><td><strong>Critical</strong></td><td>9.0–10.0</td><td>7 calendar days</td><td>Cross-tenant data access, remote code execution, authentication bypass</td></tr>
<tr><td><strong>High</strong></td><td>7.0–8.9</td><td>30 calendar days</td><td>Privilege escalation within a tenant, stored XSS with session impact, SSRF reaching internal services</td></tr>
<tr><td><strong>Medium</strong></td><td>4.0–6.9</td><td>60 calendar days</td><td>Reflected XSS, CSRF on a state-changing action, information disclosure of non-sensitive internals</td></tr>
<tr><td><strong>Low</strong></td><td>0.1–3.9</td><td>90 calendar days</td><td>Issues with limited impact requiring unlikely preconditions</td></tr>
</tbody>
</table>
<p>A critical finding that is actively exploitable takes precedence over planned work, and the clock starts at triage rather than at the next sprint boundary.</p>
"""),
    ("ai-specific", "7 AI-specific findings", """
<p>Because our platform is itself an AI system, some reports concern model behaviour rather than conventional application security. We accept and triage these, with one distinction:</p>
<ul>
<li><strong>In scope:</strong> prompt injection that crosses a trust boundary — causing our platform to act outside a customer's authorized test scope, leak another tenant's data, or exfiltrate credentials or system prompts with security value. Also: jailbreaks that defeat a control we assert publicly, and any path by which test data reaches a model provider contrary to our stated terms.</li>
<li><strong>Not a vulnerability:</strong> eliciting objectionable, inaccurate, or off-policy text from a model with no security consequence. That is a quality issue. Send it to us anyway if you like, but it will not be handled as a security finding.</li>
</ul>
<p>The dividing line is whether the behaviour breaches a security boundary or a promise we have made on the Trust Center.</p>
"""),
    ("disclosure", "8 Coordinated disclosure", """
<p>Our default is publication at <strong>90 days</strong> from triage, or on the day a fix ships — whichever comes first. We would rather publish than let a finding sit quietly.</p>
<p>We will ask to extend past 90 days only where remediation genuinely requires it — a coordinated fix with a third party, or a change that cannot ship safely inside the window. We will explain why, propose a date, and we will not treat silence as consent.</p>
<p>Advisories are published in the Advisories section of the Trust Center and notified to affected account administrators. Where a finding warrants one, we request a CVE. Reporters are credited by name or handle unless they ask otherwise.</p>
<p>If we cannot reproduce an issue, or we assess it as accepted risk, we will tell you plainly and give our reasoning. You remain free to publish; we ask only that you represent our position accurately.</p>
"""),
    ("recognition", "9 Recognition", """
<p>PromptHalo does not currently operate a paid bug bounty. We are a small company and would rather promise what we can deliver: fast acknowledgement, honest triage, remediation on published timelines, and public credit.</p>
<p>Researchers whose reports lead to a fix are credited in the resulting advisory and listed in our acknowledgements. If we introduce a paid programme, it will be announced here first.</p>
"""),
    ("contact", "10 Contact", """
<table>
<thead><tr><th>Purpose</th><th>Contact</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Vulnerability reports</td><td><a href="mailto:security@prompthalo.com">security@prompthalo.com</a></td><td>PGP key referenced in security.txt</td></tr>
<tr><td>Active incident affecting your data</td><td><a href="mailto:security@prompthalo.com">security@prompthalo.com</a></td><td>Put <strong>INCIDENT</strong> in the subject line</td></tr>
<tr><td>Trust desk and document requests</td><td><a href="mailto:security@prompthalo.com">security@prompthalo.com</a></td><td>Response within 2 business days</td></tr>
</tbody>
</table>
<p>PromptHalo Technologies · 6475 Preston Rd, Unit 140 · Frisco, TX 75034, USA</p>
"""),
]

toc = "".join(f'<a href="#{i}">{t}</a>' for i, t, _ in SECTIONS)
body = "".join(f'<h1 id="{i}">{t}</h1>{c}' for i, t, c in SECTIONS)

page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Coordinated Vulnerability Disclosure Policy — PromptHalo Trust Center</title>
<meta name="description" content="How to report a security vulnerability to PromptHalo, our safe harbour commitment, and our remediation timelines.">
<style>{CSS}</style>
</head>
<body>
<header class="topbar"><div class="topbar-inner">
  <div class="brand-lockup">{LOGO}
    <div class="brand-text"><span class="brand-name">PromptHalo</span><span class="brand-sub">Trust Center</span></div>
  </div>
  <a class="back" href="../index.html">&larr; Trust Center</a>
</div></header>

<div class="wrap">
  <div class="hero">
    <div class="eyebrow">Published policy</div>
    <h1 class="doc">Coordinated Vulnerability Disclosure Policy</h1>
    <p style="color:var(--ink-soft);max-width:70ch">How to report a security issue in a PromptHalo product, what protections apply to your research, and what we commit to in return.</p>
    <div class="meta-strip">
      <span class="pill">POL-CVD-001</span>
      <span class="pill">Version 1.0</span>
      <span class="pill">Effective 25 Aug 2026</span>
      <span class="pill">Next review 25 Aug 2027</span>
      <span class="pill cls">Public</span>
    </div>
  </div>

  <div class="layout">
    <nav class="toc"><div class="t">On this page</div>{toc}</nav>
    <article class="doc-body">
      <div class="callout"><b>Reporting an issue right now?</b> Email
      <a href="mailto:security@prompthalo.com">security@prompthalo.com</a>. You will hear back from a
      person within 2 business days. Safe harbour (section 3) applies from the moment you begin
      good-faith research — you do not need to read the rest of this first.</div>
      {body}
    </article>
  </div>
</div>

<footer><div class="fi">
  <span>PromptHalo Technologies · 6475 Preston Rd, Unit 140, Frisco, TX 75034</span>
  <span>security@prompthalo.com</span>
</div></footer>
</body>
</html>"""

out = pathlib.Path("/home/claude/out/trustcenter/policies/vulnerability-disclosure.html")
out.write_text(page)
print("wrote", out, len(page), "bytes,", len(SECTIONS), "sections")
