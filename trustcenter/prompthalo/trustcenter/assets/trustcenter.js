"use strict";


const LAST_UPDATED = "2026-07-25";
const ADMIN_HASH = "244065b2cfc6c1643c2d2b218ffbe5eb620b5407632e4e0a3ba6fd6975d09cb8";

const LOGOS = {
  ph: '<img src="data:image/png;base64,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" width="34" height="34" alt="PromptHalo logo" style="display:block">'
};

const PILLAR_ICONS = {
  security:'<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2 L17 5 V10 C17 14 14 17 10 18.5 C6 17 3 14 3 10 V5 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7.2 10.2 L9.2 12.2 L13 8.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  compliance:'<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2.5" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 7 H13 M7 10 H13 M7 13 H10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  privacy:'<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.5" y="8.5" width="11" height="8.5" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 8.5 V6.5 A3 3 0 0 1 13 6.5 V8.5" stroke="currentColor" stroke-width="1.6"/><circle cx="10" cy="12.7" r="1.4" fill="currentColor"/></svg>',
  reliability:'<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12 L6.5 12 L8.5 6.5 L11.5 15 L13.5 10 L17.5 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const DEFAULTS = {
  ph: {
    cfgVersion:4,
    accent:"#7e63a8", accentTint:"#f4f0fa", accentDeep:"#4a3470",
    name:"PromptHalo", sub:"Trust Center",
    heroTitle:"Rapid. Continuous. Answerable to auditors.",
    heroLede:"PromptHalo Litmus provides automated penetration testing , continuously probing your applications and cloud environment the way an attacker would, and turning findings into evidence your auditors and customers accept. Companies point Litmus at their real attack surface, so we hold ourselves to the standard our customers are measured against: documented controls, minimal data, independent examination.",
    heroMeta:"",
    pillars:[
      {icon:"security", t:"Security", d:"Layered controls protecting the service and your data.", href:"#security"},
      {icon:"compliance", t:"Compliance", d:"Frameworks and regulations we work to.", href:"https://www.prompthalo.ai/compliance/"},
      {icon:"privacy", t:"Privacy", d:"Minimal collection, clear retention, published notice.", href:"#privacy"},
      {icon:"reliability", t:"Reliability", d:"Resilient delivery with tested backups and rollback.", href:"#reliability"}
    ],
    ledger:[
      {name:"SOC 2", scope:"Security (Common Criteria) only", status:"align", label:"Report under NDA", date:"Reviewed annually", doc:"SOC 2 report"},
      {name:"GDPR / UK GDPR", scope:"Territorial scope assessed annually; GDPR-grade rights extended to everyone", status:"align", label:"Standards applied by policy", date:"Assessed September 2026"},
      {name:"ISO/IEC 27001", scope:"Information security controls", status:"align", label:"Control set aligned", date:"Reviewed annually", doc:"ISO/IEC 27001 control mapping"},
      {name:"HIPAA", scope:"Engagements involving protected health information", status:"align", label:"Business associate where engaged", date:"BAA on request", doc:"Business associate agreement"},
      {name:"Security program", scope:"Policies & controls", status:"ok", label:"Operating", date:"Reviewed annually", href:"policies/security-overview.html"},
      {name:"NIST AI RMF 1.0", scope:"AI governance", status:"align", label:"Aligned", date:"Reviewed annually"},
      {name:"ISO/IEC 42001", scope:"AI management system", status:"align", label:"Aligned", date:"Reviewed annually"}
    ],
    practicesIntro:"",
    practices:[
      {t:"Governance & policy", d:"The security overview at policies/security-overview.html summarises every control on one page. Behind it sits a complete security policy library with matching implementation plans, owned by the security lead and approved by executive leadership. Every policy carries a document ID, version, effective date and annual review date. Five are published in full on this page, alongside a security overview; the rest are summarised below and released under NDA."},
      {t:"Access control", d:"Access is denied by default and granted on least privilege to a named individual identity; shared logins are not used. Approval precedes the grant and the record shows who asked, who approved, and what was granted. New joiners get a defined baseline for their role rather than a copy of a colleague\u2019s access, which is how privilege accumulates unnoticed. Authentication runs through Google Workspace SSO. Privileged access is approved separately and held apart from day-to-day accounts; break-glass credentials sit behind hardware MFA, raise an alert on use, and are recorded with a reason. Non-human identities \u2014 service accounts, automations, agents \u2014 are inventoried with a named human owner and reviewed alongside people. Production and non-production are separated at the cloud account boundary. Access is revoked within one business day of departure and immediately where the departure is involuntary."},
      {t:"Access to client environments", d:"Any access we hold inside a client environment exists only under the engagement agreement, is limited to the authorised scope, and is surrendered when the engagement ends. We treat standing access to a client estate as our single largest insider risk, so it is reviewed monthly rather than waiting for the quarterly cycle."},
      {t:"Access reviews", d:"Access within the audit boundary is reviewed on a fixed quarterly cadence, with removals actioned and the action recorded. Non-human identities and client-environment access are included in the same review rather than handled separately. A review that identifies removals and does not complete them is worse evidence than no review at all, because it shows we knew."},
      {t:"Change management", d:"Every in-scope change goes through a pull request that records what is changing and why; the pull request is the change record and no separate register is kept. Approval precedes implementation and comes from someone other than the author, enforced by branch protection so it cannot be skipped by accident. Production is reachable only through the pipeline \u2014 a manual console change is an emergency change by definition, recorded the same day and approved after the fact by a second person. Security impact is assessed inside the review rather than at a separate gate. The full deployment population is exportable and reviewed every six months for changes with no approver, self-approved changes, and deployments with no matching record."},
      {t:"Secure development", d:"Security requirements are considered at design rather than retrofitted; for anything handling client information or granting access that means a recorded conversation about how it could be misused. Static analysis and dependency scanning run on every change, and secrets are scanned on commit. Test and development environments hold no real client information \u2014 realistic data is synthetic or masked. Prompts, tool definitions and retrieval configuration are treated as code: held in the repository, reviewed, and changed through the same path. Internet-facing surfaces are tested before first exposure and again when the attack surface changes materially. Independent penetration tests are commissioned when a client agreement requires one or the service has changed enough to warrant it, not on a calendar to produce a certificate."},
      {t:"Cryptography", d:"TLS 1.2 minimum and 1.3 preferred, restricted to forward-secret authenticated cipher suites, with plain HTTP redirected. Confidential and Restricted information is encrypted at rest with AES-256 or equivalent, and cloud storage, databases, backups and snapshots have encryption enabled by default at account level so a resource created without thought is still encrypted. Secrets live in a managed secrets service or the password manager and are retrieved at runtime \u2014 never in source, committed environment files, tickets, chat or logs. Keys are managed by the platform key service with rotation enabled; we do not run our own key infrastructure and do not implement our own cryptography. A deprecated or broken algorithm is treated as a significant change and remediated on a timescale set by exposure rather than convenience."},
      {t:"Logging & monitoring", d:"Four platforms carry almost everything that matters: AWS CloudTrail management events across every account and region plus data events for buckets holding client information, Google Workspace admin, login and OAuth grant logs, GitHub organisation and repository audit logs, and application activity from our own code. Logs are retained at least thirteen months with the most recent ninety days available for immediate query \u2014 thirteen so a twelve-month observation period is covered with margin. Log storage is separated from the accounts that generate it, with object lock or equivalent, so compromising a workload does not erase the record of it. Alert dispositions for production are reviewed monthly, and a month with no alerts is recorded as such."},
      {t:"AI and agent activity", d:"Each agent runs under its own identity rather than a person\u2019s credentials, so its actions are attributable in the same logs as anyone else\u2019s. Agent activity is logged with enough context to reconstruct what happened: the triggering input, the tools invoked, the parameters used, the actions taken and the outcome. Prompts, tool definitions, retrieval configuration, guardrails and model versions move through the same approval path as code, and those changes are logged \u2014 what the model was and what it was told are part of reconstructing what it did. The AI Statement covers this in full; the AI Governance Policy behind it is available under NDA.", href:"policies/ai-statement.html"},
      {t:"Vendor management", d:"Subprocessors are risk-tiered, reviewed before onboarding against SOC 2 or equivalent, and re-reviewed annually. The subprocessor list is released under NDA, and customers are notified before a new one begins processing. The full policy is published; see Document requests."},
      {t:"Incident response & continuity", d:"A documented incident response plan with customer-notification commitments, annual exercises, and encrypted versioned backups with periodic restore tests. Both the Incident Response and Business Continuity policies are published in full; see Document requests."}
    ],
    dataIntro:"What the service holds, where it lives, and how long it is kept.",
    data:[
      ["Customer program data","Content customers place in the service, stored in access-controlled, encrypted infrastructure. Customers control what they upload and can export or delete it."],
      ["Account & contact data","Names, work emails, and authentication data needed to operate accounts. Never sold or shared for advertising."],
      ["Retention & deletion","Customer data is retained while the account is active and deleted within 30 days of a verified deletion request or contract end, backups included on their cycle."],
      ["Data subject requests","Access, correction, and deletion requests are honored within 30 days via the privacy contact below."]
    ],
    reliabilityIntro:"Availability commitments and how the service recovers when things fail.",
    reliability:[
      ["Availability","The service is designed for high availability on redundant cloud infrastructure; material incidents are communicated to affected customers."],
      ["Backups","Encrypted, versioned backups held separately from the workloads they protect, with annual restore tests. Recovery objectives are set in the Business Continuity and Disaster Recovery Policy; how long data is kept is set in the Data Retention and Disposal Policy."],
      ["Change safety","Releases are staged, reviewed, and reversible; a rollback path exists for every production change."],
      ["Incident communication","Customers are notified of incidents affecting their data without undue delay, with a post-incident summary on request."]
    ],
    subs:[
      ["Amazon Web Services, Inc.","Platform hosting, compute and storage","US","SOC 2 / ISO 27001; DPA in place"],
      ["Google LLC (Google Workspace)","Email, documents, storage, identity provider","US","SOC 2 / ISO 27001; DPA in place"],
      ["GitHub, Inc.","Source control and build","US","SOC 2; private repos, MFA enforced"],
      ["Cloudflare, Inc.","DNS, delivery, access gateway","Global edge","SOC 2 / ISO 27001; TLS enforced"],
      ["Anthropic, PBC","AI-assisted features","US","SOC 2; enterprise terms exclude customer inputs from training"],
      ["Amazon SES","Transactional email delivery","US","Covered by the AWS DPA \u2014 confirm before publishing"],
      ["Wix.com Ltd.","Marketing site and authoritative DNS","US / Global","No customer personal data \u2014 confirm whether in scope"]
    ],
    advisories:[
      {id:"CISA \u00b7 Five Eyes joint guide", title:"Careful Adoption of Agentic AI Services", severity:"Informational", status:"Reviewed, no product change required", date:"2026-05-01", order:"First-order", impact:"No customer impact",
       why:"Listed because it applies directly to what PromptHalo builds. This is guidance addressed to developers, vendors and operators of agentic AI, not a defect in a product or a vendor. No dependency path is involved, so there is no second or third-order exposure to assess.",
       url:"https://www.cisa.gov/resources-tools/resources/careful-adoption-agentic-ai-services",
       detail:"Joint guidance published by CISA, the NSA and the cyber agencies of Australia, Canada, New Zealand and the United Kingdom, covering privilege escalation, design and configuration flaws, behavioral misalignment, cascading failures and accountability in agentic AI. PromptHalo reviewed the guidance against its own agent controls. Per-agent identity, scoped tool permissions and full logging of agent actions were already in place, so no product change was required. This is guidance, not a vulnerability in PromptHalo, and no customer action is needed."}
    ],
    incidentsIntro:"Vulnerabilities and incidents elsewhere in the AI and agent supply chain that a customer might reasonably ask us about, with our assessment of whether they affected this service. Each entry states why it is listed and how far it sits from us: first-order means the issue is in PromptHalo code or service, second-order means it is in a component or vendor we use directly, third-order means it reaches us through one of our vendors\u0027 own suppliers, and ecosystem means there is no dependency path to us at all. An entry here does not mean PromptHalo was breached. Incidents affecting PromptHalo itself are reported to affected customers directly under the Incident Response Policy, and are recorded here once resolved.",
    incidents:[
      {id:"MCP SDK command injection", source:"Disclosed by OX Security", title:"Command injection in the STDIO transport of the official Model Context Protocol SDKs", date:"2026-04",
       order:"Second-order", impact:"No customer impact", url:"https://www.ox.security/blog/the-mother-of-all-ai-supply-chains/",
       why:"Listed because it is second-order: the defect is in the official Model Context Protocol SDKs, which PromptHalo uses directly as a dependency in Litmus and Septa. It is not a defect in PromptHalo code, but the component sits inside our build, so it is ours to inventory, patch and account for.",
       detail:"Researchers reported that the STDIO transport in the official MCP SDKs for Python, TypeScript, Java and Rust passed configuration parameters to the host shell without sanitisation, with a large number of exposed instances estimated across the wider ecosystem. PromptHalo inventoried every MCP integration in Litmus and Septa, pinned and updated the affected SDK versions, and confirmed that the STDIO transport is not reachable from untrusted input in our deployment. No customer environment, customer data or credential was affected and no customer action is required."}
    ],
    cvdRecordIntro:"Every report accepted through our Coordinated Vulnerability Disclosure Policy is recorded here once it is remediated and the coordination window has closed \u2014 what was reported, how it was scored, when it was fixed, and who reported it. We publish the record whether or not a finding was ours to be proud of, because a disclosure page that only ever shows good news tells a reviewer nothing.",
    cvdRecord:[],
    trustEmail:"security@prompthalo.ai",
    securityEmail:"security@prompthalo.ai",
    dataDocs:["Privacy Notice","Cookie Policy","Privacy Policy","Data Classification Policy","Data Retention and Disposal Policy","Data Processing Addendum"],
    reliabilityDocs:["Business Continuity and Disaster Recovery Policy","Incident Response Policy","Change Management Policy"],
    docs:[
      {n:"AI Statement", s:"Public statement on how Generative AI is used, governed and monitored", gate:"Public", href:"policies/ai-statement.html", grp:"policy"},
      {n:"Cookie Policy", s:"Strictly necessary cookies only", gate:"Public", href:"policies/cookie-policy.html", grp:"policy"},
      {n:"Coordinated Vulnerability Disclosure Policy", s:"Scope, safe harbour, timelines", gate:"Public", href:"policies/vulnerability-disclosure.html", grp:"policy"},
      {n:"Privacy Notice", s:"External notice \u00b7 collection, use, rights", gate:"Public", href:"policies/privacy-notice.html", grp:"policy"},
      {n:"Acceptable Use Policy", s:"Permitted use of Company systems by personnel", gate:"NDA", grp:"policy"},
      {n:"Access Control Policy", s:"Least privilege, MFA, access reviews, joiners and leavers", gate:"NDA", grp:"policy"},
      {n:"AI Governance Policy", s:"AI governance, model providers, agents and release controls · available under NDA", gate:"NDA", grp:"policy"},
      {n:"Business Continuity and Disaster Recovery Policy", s:"Backup, recovery objectives, restore testing", gate:"NDA", grp:"policy"},
      {n:"Change Management Policy", s:"Review, approval and release of change", gate:"NDA", grp:"policy"},
      {n:"Data Classification Policy", s:"How data is labelled, handled and distributed", gate:"NDA", grp:"policy"},
      {n:"Data Retention and Disposal Policy", s:"Retention periods, legal hold and destruction", gate:"NDA", grp:"policy"},
      {n:"Encryption Policy", s:"Algorithms, key handling, transit and rest", gate:"NDA", grp:"policy"},
      {n:"Incident Response Policy", s:"Detection, escalation, customer notification", gate:"NDA", grp:"policy"},
      {n:"Information Security Policy", s:"The governing policy for the programme", gate:"NDA", grp:"policy"},
      {n:"Logging and Monitoring Policy", s:"What is logged, retained and alerted on", gate:"NDA", grp:"policy"},
      {n:"Privacy Policy", s:"Private policy · available under NDA", gate:"NDA", grp:"policy"},
      {n:"Secure SDLC Policy", s:"Design, review, testing and release", gate:"NDA", grp:"policy"},
      {n:"Vendor Management Policy", s:"Subprocessor review and re-review", gate:"NDA", grp:"policy"},
      {n:"Vulnerability and Patch Management Policy", s:"Scanning, severity, patch windows", gate:"NDA", grp:"policy"},
      {n:"Security Overview", s:"Control summary and document availability", gate:"Public", href:"policies/security-overview.html", grp:"assurance"},
      {n:"Business associate agreement", s:"For engagements involving protected health information", gate:"NDA", grp:"assurance"},
      {n:"Data Processing Addendum", s:"Processor terms for customers who require them", gate:"NDA", grp:"assurance"},
      {n:"ISO/IEC 27001 control mapping", s:"Controls mapped to the Annex A set", gate:"NDA", grp:"assurance"},
      {n:"Penetration test summary", s:"Most recent executive summary", gate:"NDA", grp:"assurance"},
      {n:"SOC 2 report", s:"Available under NDA on request", gate:"NDA", grp:"assurance"},
      {n:"Subprocessor list", s:"Current subprocessors, purpose and region", gate:"NDA", grp:"assurance"},
    ],
    faq:[
      {q:"Where is customer data stored?", a:"In access-controlled, encrypted cloud infrastructure on AWS. Data is encrypted in transit using TLS 1.2 or better and at rest using AES-256. The security overview, published on this Trust Center, describes the control set; region detail for a specific engagement is confirmed in the engagement agreement."},
      {q:"Do you use customer data to train AI models?", a:"No. Customer data is never used to train or fine-tune any model, our own or a provider's. Where a commercial AI service is used in delivery, it runs under business or enterprise terms that exclude submissions from provider training. This is stated in the AI Statement, published here, and in the AI Governance Policy, available under NDA."},
      {q:"Which AI providers do you use, and are they subprocessors?", a:"Any model provider that processes customer content in delivery is a subprocessor and appears on the subprocessor list, which is released under NDA on request. Customers are notified before a new subprocessor begins processing their data, on the terms of the engagement agreement."},
      {q:"Do your agents take actions autonomously?", a:"No decision producing legal or similarly significant effects is made about an individual by automated means alone. A named person is accountable for any output acted upon. Agent behaviour, tool access and pre-ship checks are governed by the AI Governance Policy, available under NDA, and summarised in the published AI Statement."},
      {q:"How do we delete our data?", a:"Request deletion through your account contact or the security desk. Deletion completes within 30 days. Backups are overwritten on their own cycle, so a deleted record may persist in a backup for a short period afterwards; it is not restored to active use."},
      {q:"Do you use cookies or track visitors?", a:"We set strictly necessary cookies only , session, CSRF and load balancing. No analytics, no advertising or retargeting pixels, no session replay, no cross-site tracking and no fingerprinting. Because nothing we set requires consent, there is no cookie banner. Every cookie we set is named in the Cookie Policy."},
      {q:"Do you sell or share personal data?", a:"No. We do not sell personal data and do not share it for cross-context behavioral advertising as US state privacy law defines those terms. Personal data is disclosed only to service providers acting on our documented instructions under written contract."},
      {q:"Are you a controller or a processor?", a:"Both, in different contexts. For our own personnel and for visitors to this site we are the controller. For data we handle while delivering services to a customer, the customer is the controller and we are the processor , we act only on documented instructions and use the data for no purpose of our own."},
      {q:"Does GDPR apply to you? Do you have an EU representative?", a:"Two separate things. Whether the Regulation applies to us is a legal question: we have assessed that the Article 3 tests are not currently met , no EU or UK establishment, no targeting of either market, no behavioural tracking , so no Article 27 representative is appointed today. Separately, and as a matter of policy, we extend GDPR-grade rights to everyone regardless of where they are, and we use Standard Contractual Clauses where data moves. The assessment is documented, reviewed annually, and reopened before any EU or UK expansion rather than after it. If your engagement changes the analysis, tell us and we will reassess and appoint a representative before processing begins."},
      {q:"Do you sign a DPA?", a:"Processor terms are available for customers who require them. Request the Data Processing Addendum through the document request form on this page."},
      {q:"How would we be told about a breach?", a:"Personal data breaches are handled as incidents under the Incident Response Policy, which sets a notification matrix governing who is told and by when. Where we act as a processor, we notify the controller without undue delay. Where a breach is likely to result in a high risk to an individual's rights, affected people are told directly."},
      {q:"How is access to systems controlled?", a:"Access is denied by default and granted on least privilege to a named individual identity; shared logins are not used. Authentication runs through Google Workspace SSO with multi-factor authentication enforced. Privileged access is approved separately, break-glass credentials sit behind hardware MFA and alert on use, and access is revoked within one business day of departure."},
      {q:"How often is access reviewed?", a:"Quarterly on a fixed cadence, with removals actioned and recorded. Non-human identities , service accounts, automations, agents , are inventoried with a named human owner and reviewed alongside people. Standing access inside a client environment is reviewed monthly rather than quarterly."},
      {q:"What encryption do you use?", a:"TLS 1.2 or better in transit and AES-256 at rest. Restricted information is not transmitted over unencrypted channels. The Encryption Policy sets the standard and is available under NDA."},
      {q:"Do you run penetration tests?", a:"The most recent executive summary is available under NDA. Request it through the document request form."},
      {q:"How do you handle vulnerabilities?", a:"Internally found issues are tracked and remediated under the Vulnerability and Patch Management Policy. Externally reported issues follow our published Coordinated Vulnerability Disclosure Policy, which sets safe harbour for good-faith research and remediation timelines by severity."},
      {q:"How do I report a vulnerability?", a:"Email the security desk. A person responds within two business days, and safe harbour applies from the moment good-faith research begins. The full policy is published on this Trust Center."},
      {q:"Are you SOC 2 certified?", a:"The security program is aligned to the SOC 2 Trust Services Criteria for Security. Alignment to a framework is not certification, and we state the current status plainly in the compliance ledger on this page rather than implying more. The report will be available under NDA once issued."},
      {q:"Are you ISO 27001 or ISO 42001 certified?", a:"No. Controls are mapped to the ISO/IEC 27001 Annex A set and that mapping is available under NDA, but PromptHalo is not certified to either standard and does not claim to be."},
      {q:"Is the Privacy category in scope for your SOC 2?", a:"No. That is a recorded scoping decision, not an oversight , it sits in the risk register with a review date and is revisited when a customer agreement requires the category, or when we begin acting as a controller for material volumes of personal data."},
      {q:"Which documents can I read without an NDA?", a:"Five are published in full: the Privacy Notice, Cookie Policy, Coordinated Vulnerability Disclosure Policy, AI Statement and the Security Overview. The Privacy Policy, AI Governance Policy and other private materials are available under NDA on request."},
      {q:"Why are some policies only available under NDA?", a:"Classification and distribution are recorded as two separate fields. Documents that describe operational specifics , patch windows, logging retention, recovery objectives , are classified Internal and released under NDA rather than published, so the detail reaches customers who need it without becoming a public map. The scheme is defined in the Data Classification Policy."},
      {q:"How current are these documents?", a:"Every document carries an owner, a version, an effective date and an annual review date in its header, plus a change history. Policies are reviewed annually or on material change."},
      {q:"Who do we contact?", a:"One address handles everything: security questions, document requests, vulnerability reports and privacy requests. A person replies within two business days."},
    ],
    contacts:[
      ["Security, trust desk and privacy","security@prompthalo.ai","Responses within 2 business days \u00b7 privacy requests honored within 30 days"]
    ]
  },
};

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- Untrusted value handling ----------
   Content on this page is rendered from a config object that an admin can edit
   in the browser and import from a file. Treat that config as untrusted input:
   escape every string into the DOM, restrict every URL to a safe scheme, and
   allow only inline emphasis markup in the one field that accepts HTML. */
const SAFE_SCHEMES = ["http:", "https:", "mailto:"];
function safeHref(u){
  const raw = String(u == null ? "" : u).trim();
  if (!raw) return "#";
  if (raw.startsWith("#") || raw.startsWith("/")) return esc(raw);
  let parsed;
  try { parsed = new URL(raw, document.baseURI); } catch(e){ return "#"; }
  if (!SAFE_SCHEMES.includes(parsed.protocol)) return "#";
  return esc(raw);
}
/* Permits b, strong, i, em, span and br only, with no attributes. */
function safeInline(html){
  const allowed = new Set(["B","STRONG","I","EM","SPAN","BR"]);
  const tpl = document.createElement("template");
  tpl.innerHTML = String(html == null ? "" : html);
  const walk = node => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 1){
        if (!allowed.has(child.tagName)){
          child.replaceWith(...Array.from(child.childNodes));
          return;
        }
        Array.from(child.attributes).forEach(a => child.removeAttribute(a.name));
        walk(child);
      } else if (child.nodeType !== 3){
        child.remove();
      }
    });
  };
  walk(tpl.content);
  return tpl.innerHTML;
}
const viewKey = "ph";
const CFG_VERSION = 4;
/* Keys whose shape changed in v2. A config saved before then would silently
   override the shipped copy , that is how documents lost their group and the
   ledger lost its rows. Stale copies are backed up, not merged. */
const CFG_STALE_KEYS = ["docs","ledger","pillars","regs","frameworksIntro","subs","heroMeta"];

function getConfig(k){
  try {
    const raw = localStorage.getItem("tc.cfg." + k);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.cfgVersion !== CFG_VERSION) {
        try { localStorage.setItem("tc.cfg." + k + ".v1bak", raw); } catch(e){}
        CFG_STALE_KEYS.forEach(key => { delete saved[key]; });
        saved.cfgVersion = CFG_VERSION;
        try { localStorage.setItem("tc.cfg." + k, JSON.stringify(saved)); } catch(e){}
      }
      return Object.assign({}, DEFAULTS[k], saved);
    }
  } catch(e){}
  return DEFAULTS[k];
}
/* ---------- Published feeds ----------
   Two files, loaded independently so a problem with one never blanks the other:
     prompthalo/advisories.json   advisories + the coordinated disclosure record
     prompthalo/incidents.json    third-party incidents we have assessed
   Publishing is a commit to the relevant file. The write path is whatever
   protects the repository, not a secret shipped to the browser.

   Both feeds are untrusted input: every field is type-checked, length-capped
   and escaped on render. If a fetch fails or a file is malformed, that section
   falls back to the copy embedded below, so a bad edit degrades to
   stale-but-correct rather than to a blank section. */
/* Both feeds are served from beside this page. Same origin means no CORS, no
   CSP exception, and no third party able to influence what the Trust Center
   publishes. */
const ADVISORIES_URL = "prompthalo/advisories.json";
const INCIDENTS_URL  = "prompthalo/incidents.json";
const DISCLOSURE_URL = "prompthalo/disclosure-record.json";
const FEED_MAX_ROWS = 200;
const FEED_MAX_LEN = 2000;
const SEVERITIES = ["Critical","High","Medium","Low","Informational"];
const ORDERS = ["First-order","Second-order","Third-order","Ecosystem"];
let FEED = {};
let FEED_STATE = {adv:"loading", inc:"loading", cvd:"loading"};

function feedStr(v, max){
  if (typeof v !== "string") return "";
  return v.slice(0, max || FEED_MAX_LEN);
}
/* Arbitrary label/value pairs a record may carry in "fields". This is the
   supported way to extend the feed format: new keys can be published without
   changing this file. Unknown TOP-LEVEL keys are still ignored on purpose,
   because rendering unvalidated keys is how layout breaks and injection gets in. */
const FEED_MAX_EXTRA = 8;
function feedExtras(raw){
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, FEED_MAX_EXTRA)
    .map(f => (f && typeof f === "object")
      ? {label: feedStr(f.label, 40), value: feedStr(f.value, 300)}
      : {label:"", value:""})
    .filter(f => f.label && f.value);
}
function feedRows(raw, fields){
  if (!Array.isArray(raw)) return null;
  return raw.slice(0, FEED_MAX_ROWS).map(row => {
    const out = {};
    if (row && typeof row === "object") fields.forEach(f => { out[f] = feedStr(row[f]); });
    else fields.forEach(f => { out[f] = ""; });
    out.fields = feedExtras(row && row.fields);
    if (out.severity && !SEVERITIES.includes(out.severity)) out.severity = "";
    if (out.order && !ORDERS.includes(out.order)) out.order = "";
    return out;
  });
}
const ADV_FIELDS = ["id","title","severity","status","date","order","why","impact","detail","url","affected","fixedIn","patched","cvss","remediation"];
const INC_FIELDS = ["id","source","title","date","order","why","impact","detail","url","affected","fixedIn","patched","cvss","remediation"];

function parseAdvisories(data){
  if (!data || typeof data !== "object") throw new Error("advisories feed is not an object");
  const advisories = feedRows(data.advisories, ADV_FIELDS);
  if (!advisories) throw new Error("advisories feed has no advisories array");
  return {advisoriesPublished: feedStr(data.published, 40), advisories: advisories};
}
function parseDisclosure(data){
  if (!data || typeof data !== "object") throw new Error("disclosure record feed is not an object");
  const cvdRecord = feedRows(data.cvdRecord, ["ref","title","severity","resolved","reported","credit"]);
  if (!cvdRecord) throw new Error("disclosure record feed has no cvdRecord array");
  const out = {cvdPublished: feedStr(data.published, 40), cvdRecord: cvdRecord};
  if (data.cvdRecordIntro) out.cvdRecordIntro = feedStr(data.cvdRecordIntro);
  return out;
}
function parseIncidents(data){
  if (!data || typeof data !== "object") throw new Error("incidents feed is not an object");
  const incidents = feedRows(data.incidents, INC_FIELDS);
  if (!incidents) throw new Error("incidents feed has no incidents array");
  const out = {incidentsPublished: feedStr(data.published, 40), incidents: incidents};
  if (data.incidentsIntro) out.incidentsIntro = feedStr(data.incidentsIntro);
  return out;
}
function loadFeeds(){
  if (!window.fetch || location.protocol === "file:"){
    FEED_STATE = {adv:"unavailable", inc:"unavailable", cvd:"unavailable"};
    render();
    return;
  }
  const one = (url, parse, key) =>
    fetch(url, {cache:"no-cache", credentials:"omit"})
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => { Object.assign(FEED, parse(data)); FEED_STATE[key] = "ok"; })
      .catch(err => { FEED_STATE[key] = "unavailable"; console.warn(url + " unavailable:", err.message); });
  Promise.all([
    one(ADVISORIES_URL, parseAdvisories, "adv"),
    one(INCIDENTS_URL, parseIncidents, "inc"),
    one(DISCLOSURE_URL, parseDisclosure, "cvd")
  ]).then(() => render());
}

/* ---------- Collapsible published records ----------
   Advisories and third-party incidents share one row shape: a summary carrying
   the impact-order badge, severity and customer impact, and a body holding why
   the entry is listed, the assessment, and a link to the original publication.
   Links go through safeHref like every other config-driven URL. */
function recordRow(list, i, r, live, opts){
  const ordClass = (r.order || "").split("-")[0].toLowerCase();
  const badges =
    (r.order ? `<span class="ord ord-${esc(ordClass)}" data-path="${list}.${i}.order">${esc(r.order)}</span>` : "") +
    (opts.severity && r.severity ? `<span class="sev s-${esc((r.severity||"").toLowerCase())}" data-path="${list}.${i}.severity">${esc(r.severity)}</span>` : "") +
    (r.impact ? `<span class="impact${/^no /i.test(r.impact) ? " clear" : ""}" data-path="${list}.${i}.impact">${esc(r.impact)}</span>` : "");
  const meta = [r.id, r.source, r.date, r.status, r.fixedIn ? "Fixed in " + r.fixedIn : ""].filter(Boolean).map(esc).join(" \u00b7 ");
  const why = r.why
    ? `<p class="why"><b>Why this is listed.</b> <span data-path="${list}.${i}.why">${esc(r.why)}</span></p>` : "";
  const specs = [
    ["Affected", r.affected], ["Fixed in", r.fixedIn], ["Patched", r.patched],
    ["CVSS", r.cvss], ["Remediation", r.remediation]
  ].concat((r.fields || []).map(f => [f.label, f.value]))
   .filter(x => x[1]);
  const specGrid = specs.length
    ? `<dl class="spec">` + specs.map(x =>
        `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join("") + `</dl>`
    : "";
  const link = r.url
    ? `<a class="prac-link" href="${safeHref(r.url)}" target="_blank" rel="noopener noreferrer">${esc(opts.linkLabel)} &rarr;</a>`
    : "";
  return `<details class="reg-item rec" data-item="${list}.${i}">
    <summary>
      <span class="reg-name"><span data-path="${list}.${i}.title">${esc(r.title||"")}</span><span class="sub">${meta}</span></span>
      ${badges}<span class="reg-chev" aria-hidden="true">&#9662;</span>
    </summary>
    <div class="reg-body">${why}<p data-path="${list}.${i}.detail">${esc(r.detail||"")}</p>${specGrid}${link}${live?"":delBtn(list,i)}</div>
  </details>`;
}

function feedNote(kind){
  if (FEED_STATE[kind] !== "ok") return "";
  const when = kind === "adv" ? FEED.advisoriesPublished
             : kind === "inc" ? FEED.incidentsPublished
             : FEED.cvdPublished;
  return `<div class="feed-note ok">Published feed loaded${when ? " \u00b7 " + esc(when) : ""}</div>`;
}

function saveConfig(k, cfg){ try { cfg.cfgVersion = CFG_VERSION; localStorage.setItem("tc.cfg." + k, JSON.stringify(cfg)); } catch(e){} }

/* Compact synchronous SHA-256 */
function sha256(ascii){
  function rr(v,a){return (v>>>a)|(v<<(32-a));}
  var mF=Math.pow,mC=mF(2,32),j,r='',words=[],aLen=ascii.length*8;
  var h=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],pC=k.length,iH={};
  for(var c=2;pC<64;c++){if(!iH[c]){for(j=0;j<313;j+=c)iH[j]=c;h[pC]=(mF(c,.5)*mC)|0;k[pC++]=(mF(c,1/3)*mC)|0;}}
  ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';
  for(j=0;j<ascii.length;j++){var cc=ascii.charCodeAt(j);if(cc>>8)return'';words[j>>2]|=cc<<((3-j)%4)*8;}
  words[words.length]=(aLen/mC)|0;words[words.length]=aLen;
  for(j=0;j<words.length;){var w=words.slice(j,j+=16),oH=h.slice(0,8);
    for(var i=0;i<64;i++){var w15=w[i-15],w2=w[i-2];
      var a=h[0],e=h[4];
      var t1=h[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&h[5])^(~e&h[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
      var t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&h[1])^(a&h[2])^(h[1]&h[2]));
      h=[(t1+t2)|0].concat(h);h[4]=(h[4]+t1)|0;}
    for(i=0;i<8;i++)h[i]=(h[i]+oH[i])|0;}
  for(i=0;i<8;i++)for(j=3;j+1;j--){var b=(h[i]>>(j*8))&255;r+=((b<16)?0:'')+b.toString(16);}
  return r;
}

const SEAL = (status) => {
  const colors = {ok:"#2e7d5b", progress:"#b07d2a", align:"#3d6b8f", plan:"#6d8092"};
  const c = colors[status] || "#1b4965";
  const glyph = status === "progress"
    ? `<circle cx="19" cy="19" r="6.2" fill="none" stroke="${c}" stroke-width="2"/><line x1="19" y1="19" x2="19" y2="14.6" stroke="${c}" stroke-width="2" stroke-linecap="round"/><line x1="19" y1="19" x2="22" y2="20.8" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`
    : (status === "align" || status === "plan")
    ? `<line x1="13.5" y1="19" x2="24.5" y2="19" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><line x1="13.5" y1="14.5" x2="24.5" y2="14.5" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity=".45"/><line x1="13.5" y1="23.5" x2="24.5" y2="23.5" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>`
    : `<path d="M13 19.5 L17.2 23.5 L25 14.5" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="19" r="17" fill="none" stroke="${c}" stroke-width="1.4" stroke-dasharray="2.6 3.1"/><circle cx="19" cy="19" r="12.5" fill="none" stroke="${c}" stroke-width="1.6"/>${glyph}</svg>`;
};

/* ---------- Header menus ---------- */
function closeMenus(except){
  document.querySelectorAll(".menu").forEach(m => {
    if (m !== except){
      m.querySelector(":scope > button").setAttribute("aria-expanded","false");
      m.querySelector(".menu-list").classList.remove("open");
    }
  });
}
document.querySelectorAll(".menu > button").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const menu = btn.parentElement, list = menu.querySelector(".menu-list");
    const willOpen = !list.classList.contains("open");
    closeMenus(menu);
    list.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", String(willOpen));
  });
});
document.addEventListener("click", () => closeMenus());
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenus(); });
document.querySelectorAll("[data-setview]").forEach(b =>
  b.addEventListener("click", () => { closeMenus(); setView(b.dataset.setview); }));

const SECTION_LIST = [
  ["#overview","Overview"],["https://www.prompthalo.ai/compliance/","Compliance"],["#security","Security"],
  ["#advisories","Advisories & CVEs"],["#incidents","Security incidents"],["#cvd-record","Disclosure record"],["#disclosure","Responsible disclosure"],
  ["#privacy","Privacy"],["#reliability","Reliability"],["#subprocessors","Subprocessors"],
  ["#documents","Document requests"],["#faq","FAQ"],["#contact","Contact"]
];

function buildSectionsMenu(){
  const items = SECTION_LIST;
  $("sectionsMenu").innerHTML = items.map(i => `<a role="menuitem" href="${safeHref(i[0])}">${esc(i[1])}</a>`).join("");
  $("sectionsMenu").querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    closeMenus();
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#")) return;
    revealTarget(href);
  }));
}

/* ---------- Trust Center search ----------
   Replaces per-section nav tabs, which do not scale as sections are added. The
   index is rebuilt from the rendered config and feed on every render, so newly
   published advisories and incidents are searchable without any extra step.
   Selecting a result opens the owning panel and the individual record. */
let SEARCH_INDEX = [];
let searchSel = -1;

function buildSearchIndex(b, advisories, incidents){
  const idx = [];
  const add = (label, sub, hash, section, item, extra) =>
    idx.push({label:String(label||""), sub:String(sub||""), hash:hash, section:section, item:item||"",
              hay:(label + " " + (sub||"") + " " + (extra||"") + " " + section).toLowerCase()});

  [["Overview","#overview"],["Security practices","#security"],
   ["Security advisories & CVEs","#advisories"],["Security incidents","#incidents"],
   ["Coordinated disclosure record","#cvd-record"],["Responsible disclosure","#disclosure"],
   ["Data & privacy","#privacy"],["Availability & resilience","#reliability"],
   ["Subprocessors","#subprocessors"],["Documents & Policies","#documents"],
   ["FAQ","#faq"],["Contact","#contact"]
  ].forEach(x => add(x[0], "Section", x[1], "Section"));

  (advisories||[]).forEach((a,i) => add(a.title, [a.id,a.severity,a.impact].filter(Boolean).join(" \u00b7 "), "#advisories", "Advisory", "advisories."+i, a.detail));
  (incidents||[]).forEach((n,i) => add(n.title, [n.id,n.source,n.impact].filter(Boolean).join(" \u00b7 "), "#incidents", "Security incident", "incidents."+i, n.detail));
  (b.practices||[]).forEach((x,i) => add(x.t, "Security practice", "#security", "Security practice", "practices."+i, x.d));
  (b.docs||[]).forEach((d,i) => add(d.n, d.gate === "Public" ? "Public document" : "Available under NDA", "#documents", "Document", "docs."+i, d.s));
  (b.faq||[]).forEach((f,i) => add(f.q, "FAQ", "#faq", "FAQ", "faq."+i, f.a));
  (b.ledger||[]).forEach((l,i) => add(l.name, l.scope, "#overview", "Compliance", "ledger."+i, l.label));
  (b.subs||[]).forEach(r => add(r[0], "Subprocessor", "#subprocessors", "Subprocessor", "", r[1]));
  SEARCH_INDEX = idx;
}

function searchQuery(q){
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return SEARCH_INDEX
    .map(e => {
      if (!terms.every(t => e.hay.includes(t))) return null;
      const label = e.label.toLowerCase();
      return {e: e, score: terms.every(t => label.includes(t)) ? (label.startsWith(terms[0]) ? 0 : 1) : 2};
    })
    .filter(Boolean)
    .sort((a,b) => a.score - b.score)
    .slice(0, 8)
    .map(x => x.e);
}

function renderSearch(results){
  const box = $("searchResults");
  if (!results.length){
    const q = $("searchInput").value.trim();
    box.innerHTML = q ? `<div class="sr-none">No matches for ${esc(q)}</div>` : "";
    box.classList.toggle("open", !!q);
    $("searchInput").setAttribute("aria-expanded", String(!!q));
    return;
  }
  box.innerHTML = results.map((r,i) =>
    `<button class="sr-item${i === searchSel ? " sel" : ""}" role="option" data-i="${i}">
       <span class="sr-label">${esc(r.label)}</span>
       <span class="sr-meta"><span class="sr-tag">${esc(r.section)}</span>${r.sub ? esc(r.sub) : ""}</span>
     </button>`).join("");
  box.classList.add("open");
  $("searchInput").setAttribute("aria-expanded","true");
}

function closeSearch(){
  $("searchResults").classList.remove("open");
  $("searchInput").setAttribute("aria-expanded","false");
  searchSel = -1;
}

function gotoResult(r){
  if (!r) return;
  closeSearch();
  $("searchInput").blur();
  const panel = revealTarget(r.hash);
  let target = panel;
  if (r.item){
    const el = document.querySelector(`[data-item="${r.item.replace(/"/g,"")}"]`);
    if (el){
      if (el.tagName === "DETAILS") el.open = true;
      let up = el.parentElement;
      while (up){ if (up.tagName === "DETAILS") up.open = true; up = up.parentElement; }
      target = el;
    }
  }
  if (target && target.scrollIntoView) target.scrollIntoView({behavior:"smooth", block:"start"});
}

(function wireSearch(){
  const input = $("searchInput"), box = $("searchResults");
  if (!input) return;
  let current = [];
  const refresh = () => { current = searchQuery(input.value.trim()); renderSearch(current); };
  input.addEventListener("input", () => { searchSel = -1; refresh(); });
  input.addEventListener("focus", () => { if (input.value.trim()) refresh(); });
  input.addEventListener("keydown", e => {
    if (e.key === "Escape"){ closeSearch(); input.value = ""; return; }
    if (!current.length) return;
    if (e.key === "ArrowDown"){ e.preventDefault(); searchSel = (searchSel + 1) % current.length; renderSearch(current); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); searchSel = (searchSel - 1 + current.length) % current.length; renderSearch(current); }
    else if (e.key === "Enter"){ e.preventDefault(); gotoResult(current[searchSel >= 0 ? searchSel : 0]); input.value = ""; }
  });
  box.addEventListener("click", e => {
    const btn = e.target.closest(".sr-item");
    if (!btn) return;
    gotoResult(current[Number(btn.dataset.i)]);
    input.value = "";
  });
  document.addEventListener("click", e => { if (!e.target.closest("#siteSearch")) closeSearch(); });
})();

/* ---------- Render ---------- */
/* ---------- Cross-references to the document register ----------
   Sections point at the governing documents by name and resolve against the
   same docs list the Documents & Policies panel renders, so a document that is
   renamed, published or moved behind NDA stays consistent in both places
   instead of drifting. Public documents link straight to the page; anything
   under NDA reuses the existing request flow. */
function renderDocRefs(elId, names, docs){
  const el = $(elId);
  if (!el) return;
  const rows = (names || []).map(n => {
    const d = (docs || []).find(x => x.n === n);
    if (!d) return "";
    const pub = d.gate === "Public" && d.href;
    return pub
      ? `<a class="docref" href="${safeHref(d.href)}"><span class="dr-name">${esc(d.n)}</span><span class="dr-tag open">Read online</span></a>`
      : `<a class="docref" href="#documents" data-doc="${esc(d.n)}"><span class="dr-name">${esc(d.n)}</span><span class="dr-tag">Under NDA</span></a>`;
  }).join("");
  el.innerHTML = rows
    ? `<div class="dr-label">Governing documents</div><div class="dr-list">${rows}</div>`
    : "";
}

function renderBrand(){
  const b = getConfig(viewKey);
  /* Feed wins over the embedded copy for the two published-record sections. */
  const liveAdv = FEED_STATE.adv === "ok";
  const liveInc = FEED_STATE.inc === "ok";
  const liveCvd = FEED_STATE.cvd === "ok";
  const advisories = liveAdv && FEED.advisories ? FEED.advisories : (b.advisories || []);
  const cvdRecord  = liveCvd && FEED.cvdRecord  ? FEED.cvdRecord  : (b.cvdRecord  || []);
  const incidents  = liveInc && FEED.incidents  ? FEED.incidents  : (b.incidents  || []);
  const cvdIntro   = liveCvd && FEED.cvdRecordIntro ? FEED.cvdRecordIntro : b.cvdRecordIntro;
  const incIntro   = liveInc && FEED.incidentsIntro ? FEED.incidentsIntro : b.incidentsIntro;
  $("brandLockup").innerHTML = LOGOS[viewKey] +
    `<div class="brand-text"><span class="brand-name">${esc(b.name)}</span><span class="brand-sub">${esc(b.sub)}</span></div>`;
  bindText("heroTitle", b.heroTitle, "heroTitle");
  bindText("heroLede", b.heroLede, "heroLede");
  $("heroMeta").innerHTML = safeInline(b.heroMeta || "");
  $("ledgerStamp").textContent = "Updated " + LAST_UPDATED;
  $("pillars").innerHTML = (b.pillars||[]).map((p,i) =>
    `<a class="pillar" href="${safeHref(p.href)}"><div class="p-ico">${PILLAR_ICONS[p.icon]||""}</div><h3 data-path="pillars.${i}.t">${esc(p.t)}</h3><p data-path="pillars.${i}.d">${esc(p.d)}</p></a>`).join("");
  $("ledgerGrid").innerHTML = b.ledger.map((l,i) =>
    `<div class="seal-cell" data-item="ledger.${i}">${SEAL(l.status)}<div style="min-width:0">
      <div class="seal-name" data-path="ledger.${i}.name">${l.href?`<a href="${safeHref(l.href)}">${esc(l.name)}</a>`:esc(l.name)}</div>
      <div class="seal-scope" data-path="ledger.${i}.scope">${esc(l.scope)}</div>
      <span class="seal-status st-${l.status}" data-path="ledger.${i}.label">${esc(l.label)}</span>
      <button class="cyc" data-cycle="ledger.${i}.status" title="Cycle status">${esc(l.status)}</button>
      <div class="seal-date" data-path="ledger.${i}.date">${esc(l.date)}</div>${l.doc?`<button class="seal-link seal-req" data-doc="${esc(l.doc)}">Request under NDA &rarr;</button>`:""}</div>${delBtn("ledger",i)}</div>`).join("")
    + addBtn("ledger","compliance item");
  bindText("practicesIntro", b.practicesIntro, "practicesIntro");
  $("practiceGrid").innerHTML = b.practices.map((p,i) =>
    `<details class="practice" data-item="practices.${i}"><summary><h3><span class="dot"></span><span data-path="practices.${i}.t">${esc(p.t)}</span></h3><span class="prac-chev" aria-hidden="true">&#9662;</span></summary><div class="prac-body"><p data-path="practices.${i}.d">${esc(p.d)}</p>${p.href?`<a class="prac-link" href="${safeHref(p.href)}">Read the full policy &rarr;</a>`:""}${delBtn("practices",i)}</div></details>`).join("")
    + addBtn("practices","practice","practice-add");
  bindText("dataIntro", b.dataIntro, "dataIntro");
  $("dataTable").innerHTML = b.data.map((r,i) => `<tr data-item="data.${i}"><td data-path="data.${i}.0">${esc(r[0])}</td><td data-path="data.${i}.1">${esc(r[1])}${delBtn("data",i)}</td></tr>`).join("")
    + rowAdd("data", 2);
  bindText("reliabilityIntro", b.reliabilityIntro || "", "reliabilityIntro");
  $("reliabilityTable").innerHTML = (b.reliability||[]).map((r,i) => `<tr data-item="reliability.${i}"><td data-path="reliability.${i}.0">${esc(r[0])}</td><td data-path="reliability.${i}.1">${esc(r[1])}${delBtn("reliability",i)}</td></tr>`).join("")
    + rowAdd("reliability", 2);
  const docRow = (d,i) =>
    `<div class="doc-row" data-item="docs.${i}"><div class="doc-name"><span data-path="docs.${i}.n">${esc(d.n)}</span><span class="sub" data-path="docs.${i}.s">${esc(d.s)}</span></div>
     <span class="gate ${d.gate==="Public"?"open":""}">${d.gate==="Public"?(d.href?"Read online":"Available on request"):"Under NDA"}</span>
     <button class="cyc" data-cycle="docs.${i}.gate" title="Toggle access">${esc(d.gate)}</button>
     ${d.href?`<a class="btn ghost" href="${safeHref(d.href)}">Read</a>`:`<button class="btn ghost" data-doc="${esc(d.n)}">Request</button>`}${delBtn("docs",i)}</div>`;
  const ASSURANCE_DOCS = new Set(["Security Overview","Data Processing Addendum",
    "SOC 2 report","ISO/IEC 27001 control mapping","Business associate agreement",
    "Penetration test summary"]);
  const groupOf = (d) => d.grp || (ASSURANCE_DOCS.has(d.n) ? "assurance" : "policy");
  const docsByGroup = (g) => b.docs.map((d,i) => [d,i]).filter(([d]) => groupOf(d) === g);
  const pol = docsByGroup("policy"), asr = docsByGroup("assurance");
  $("docListPolicy").innerHTML = pol.map(([d,i]) => docRow(d,i)).join("") + addBtn("docs","document");
  $("docListAssurance").innerHTML = asr.map(([d,i]) => docRow(d,i)).join("");
  $("docCountPolicy").textContent = pol.length;
  $("docCountAssurance").textContent = asr.length;
  $("reqDoc").innerHTML = b.docs.map(d => `<option>${esc(d.n)}</option>`).join("");
  $("faqList").innerHTML = b.faq.map((f,i) =>
    `<details class="faq" data-item="faq.${i}"><summary><span data-path="faq.${i}.q">${esc(f.q)}</span>${delBtn("faq",i)}</summary><div class="a" data-path="faq.${i}.a">${esc(f.a)}</div></details>`).join("")
    + addBtn("faq","question");
  $("contactTable").innerHTML = b.contacts.map((c,i) =>
    `<tr data-item="contacts.${i}"><td style="width:260px" data-path="contacts.${i}.0">${esc(c[0])}</td><td><a href="${safeHref("mailto:" + c[1])}" data-path="contacts.${i}.1">${esc(c[1])}</a><span class="sub" data-path="contacts.${i}.2">${esc(c[2])}</span>${delBtn("contacts",i)}</td></tr>`).join("")
    + rowAdd("contacts", 3);
  bindText("incidentsIntro", incIntro || "", "incidentsIntro");
  bindText("cvdRecordIntro", cvdIntro, "cvdRecordIntro");
  $("cvdList").innerHTML = feedNote("cvd") + ((cvdRecord.length
    ? `<div class="tbl"><table aria-label="Coordinated disclosure record"><thead><tr><th style="width:130px">Reference</th><th>Finding</th><th style="width:110px">Severity</th><th style="width:150px">Resolved</th></tr></thead><tbody>`
      + cvdRecord.map((c,i) =>
        `<tr data-item="cvdRecord.${i}"><td><span data-path="cvdRecord.${i}.ref">${esc(c.ref||"")}</span><span class="sub" data-path="cvdRecord.${i}.reported">${esc(c.reported||"")}</span></td>
         <td><span data-path="cvdRecord.${i}.title">${esc(c.title||"")}</span><span class="sub" data-path="cvdRecord.${i}.credit">${esc(c.credit||"")}</span></td>
         <td><span class="sev s-${(c.severity||"").toLowerCase()}" data-path="cvdRecord.${i}.severity">${esc(c.severity||"")}</span></td>
         <td><span data-path="cvdRecord.${i}.resolved">${esc(c.resolved||"")}</span>${liveCvd?"":delBtn("cvdRecord",i)}</td></tr>`).join("")
      + `</tbody></table></div>`
    : `<div class="empty-note">No coordinated disclosures have been published yet. This table will be updated as reports are received, remediated and released , an empty record here means no report has completed the process, not that reports are unwelcome. See the <a href="policies/vulnerability-disclosure.html">Coordinated Vulnerability Disclosure Policy</a> for scope, safe harbour and our response commitments.</div>`)
    + (liveCvd ? "" : addBtn("cvdRecord","disclosure")));
  $("advList").innerHTML = feedNote("adv") + (advisories.length
    ? `<div class="reg-list">` + advisories.map((a,i) => recordRow("advisories", i, a, liveAdv, {severity:true, linkLabel:"Read the advisory"})).join("") + `</div>`
    : `<div class="empty-note">No advisories are currently published for this product. Vulnerabilities reported through the disclosure process are published here once remediated.</div>`)
    + (liveAdv ? "" : addBtn("advisories","advisory"));
  $("incList").innerHTML = feedNote("inc") + (incidents.length
    ? `<div class="reg-list">` + incidents.map((n,i) => recordRow("incidents", i, n, liveInc, {severity:false, linkLabel:"Read the disclosure"})).join("") + `</div>`
    : `<div class="empty-note">No third-party incidents are currently being tracked.</div>`)
    + (liveInc ? "" : addBtn("incidents","incident"));
  $("footBrand").textContent = `© ${new Date().getFullYear()} ${b.name} · Trust Center`;
  $("footLogo").innerHTML = LOGOS[viewKey];
  $("footTag").textContent = (b.heroLede.split(". ")[0] || b.name) + ".";
  $("footContacts").innerHTML = b.contacts.map(c => `<a href="${safeHref("mailto:" + c[1])}">${esc(c[0])}</a>`).join("");
  document.title = `Trust Center , ${b.name}`;
  renderDocRefs("dataDocs", b.dataDocs, b.docs);
  renderDocRefs("reliabilityDocs", b.reliabilityDocs, b.docs);
  buildSearchIndex(b, advisories, incidents);
  renderOutbox(); renderVbox();
}

function render(){
  const theme = getConfig(viewKey);
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--accent-tint", theme.accentTint);
  document.documentElement.style.setProperty("--accent-deep", theme.accentDeep || theme.accent);
  $("footStamp").textContent = `Page version ${LAST_UPDATED} · Served statically; requests logged locally only`;
  buildSectionsMenu();
  renderBrand();
  if (adminOpen) buildAdmin();
  if (editing) document.querySelectorAll("[data-path]").forEach(el => {
    el.setAttribute("contenteditable","true"); el.setAttribute("spellcheck","false");
  });
}
$("footTop").addEventListener("click", e => { e.preventDefault(); window.scrollTo({top:0,behavior:"smooth"}); });
$("ctaReport").addEventListener("click", () => {
  const p = $("disclosure"); if (p) p.open = true;
  setTimeout(() => { const f = $("vdpForm"); if (f) f.scrollIntoView({behavior:"smooth", block:"start"}); }, 60);
});

/* ===== Inline editing engine ===== */
let editing = false;
function pathParts(p){ return p.split(".").map(k => /^\d+$/.test(k) ? Number(k) : k); }
function getByPath(o,p){ return pathParts(p).reduce((a,k) => (a==null?a:a[k]), o); }
function setByPath(o,p,v){
  const ks = pathParts(p), last = ks.pop();
  let cur = o; ks.forEach(k => { cur = cur[k]; });
  cur[last] = v;
}
function cloneCfg(){ return JSON.parse(JSON.stringify(getConfig(viewKey))); }
function commit(cfg){ saveConfig(viewKey, cfg); render(); }
function bindText(id, value, path){
  const el = $(id);
  el.textContent = value;
  el.setAttribute("data-path", path);
}
const delBtn = (list,i) => `<button class="delbtn" data-del="${list}.${i}" title="Delete">×</button>`;
const addBtn = (list,label,cls) => `<button class="rowbtn ${cls||""}" data-add="${list}">+ Add ${label}</button>`;
const rowAdd = (list,cols) => `<tr class="addrow"><td colspan="${cols}"><button class="rowbtn" data-add="${list}">+ Add row</button></td></tr>`;

const BLANKS = {
  ledger:{name:"New item",scope:"Scope",status:"plan",label:"Planned",date:"Date",doc:""},
  practices:{t:"Practice",d:"Describe the control."},
  docs:{n:"Document",s:"Description",gate:"NDA",grp:"policy"},
  faq:{q:"New question?",a:"Answer."},
  pillars:{icon:"security",t:"Pillar",d:"Short blurb.",href:"#security"},
  cvdRecord:{ref:"PH-CVD-0000",title:"Summary of the finding",severity:"Medium",resolved:"",reported:"",credit:"Reported by \u2014"},
  incidents:{id:"Incident",source:"Source",title:"Summary",date:"",order:"Second-order",why:"Why this is listed and how far it sits from us.",impact:"No customer impact",url:"",detail:"Assessment and whether customers were affected."},
  advisories:{id:"CVE-0000-0000",title:"Summary",severity:"Medium",status:"Under investigation",date:"",order:"Second-order",why:"Why this is listed and how far it sits from us.",impact:"No customer impact",url:"",detail:"Assessment and remediation status."},
  data:["Category","Handling"],
  reliability:["Area","Commitment"],
  subs:["Vendor","Purpose","Region","Safeguards"],
  contacts:["Channel","security@prompthalo.ai","Note"]
};
const CYCLES = { status:["ok","progress","align","plan"], gate:["NDA","Public"] };

function setEditing(on){
  editing = on;
  document.body.classList.toggle("editing", on);
  $("editSite").textContent = getConfig(viewKey).name;
  document.querySelectorAll("[data-path]").forEach(el => {
    if (on){ el.setAttribute("contenteditable","true"); el.setAttribute("spellcheck","false"); }
    else el.removeAttribute("contenteditable");
  });
  if (on) toast("Inline editing on , changes save as you click away");
}
document.addEventListener("focusout", e => {
  const el = e.target.closest && e.target.closest("[data-path]");
  if (!el || !editing) return;
  const path = el.getAttribute("data-path");
  const val = el.textContent.trim();
  if (val === String(getByPath(getConfig(viewKey), path) ?? "")) return;
  const cfg = cloneCfg();
  setByPath(cfg, path, val);
  saveConfig(viewKey, cfg);
  render();
  setEditing(true);
  toast("Saved");
});
document.addEventListener("keydown", e => {
  if (!editing) return;
  const el = e.target.closest && e.target.closest("[data-path]");
  if (el && e.key === "Enter" && !e.shiftKey && el.tagName !== "P" && el.tagName !== "TD"){ e.preventDefault(); el.blur(); }
  if (e.key === "Escape" && editing) setEditing(false);
});
document.addEventListener("click", e => {
  if (!editing) return;
  const cyc = e.target.closest("[data-cycle]");
  if (cyc){
    e.preventDefault(); e.stopPropagation();
    const p = cyc.getAttribute("data-cycle"), key = p.split(".").pop();
    const opts = CYCLES[key] || [];
    const cfg = cloneCfg();
    const cur = getByPath(cfg, p);
    setByPath(cfg, p, opts[(opts.indexOf(cur)+1) % opts.length]);
    commit(cfg); setEditing(true); return;
  }
  const del = e.target.closest("[data-del]");
  if (del){
    e.preventDefault(); e.stopPropagation();
    const [list, idx] = del.getAttribute("data-del").split(".");
    const cfg = cloneCfg();
    cfg[list].splice(Number(idx), 1);
    commit(cfg); setEditing(true); toast("Removed"); return;
  }
  const add = e.target.closest("[data-add]");
  if (add){
    e.preventDefault(); e.stopPropagation();
    const list = add.getAttribute("data-add");
    const cfg = cloneCfg();
    if (!Array.isArray(cfg[list])) cfg[list] = [];
    cfg[list].push(JSON.parse(JSON.stringify(BLANKS[list])));
    commit(cfg); setEditing(true); toast("Added , click the new text to edit"); return;
  }
}, true);
$("editDone").addEventListener("click", () => { setEditing(false); toast("Inline editing off"); });

/* ---------- Security Overview links ----------
   Open the document in a new tab and move the reader to it, so they keep their
   place on the Trust Center. Covers every entry point: the Assurance group's
   Read button, the nav tab, and the compliance ledger row.

   The feature string must NOT contain "noopener": per spec window.open returns
   null when it is passed, so there is no handle left to focus and the code
   cannot tell a blocked popup from a successful one. We null the opener on the
   handle instead, which gives the same protection and keeps the reference.

   If the popup really is refused (preview panes, sandboxed frames, blockers)
   we navigate in place, because a link that appears to do nothing is worse
   than one that leaves the page. The markup stays a plain link, so this still
   works with scripting disabled. */
document.addEventListener("click", e => {
  if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href$="security-overview.html"]');
  if (!a) return;
  const url = a.getAttribute("href");
  if (!url) return;
  e.preventDefault();
  let opened = null;
  try { opened = window.open(url, "_blank"); } catch(err){ opened = null; }
  if (opened){
    try { opened.opener = null; } catch(err){}
    try { opened.focus(); } catch(err){}   // bring the reader to the new tab
  } else {
    window.location.assign(url);
  }
});

/* ---------- In-page navigation ----------
   Opens the target panel, every collapsed ancestor above it, and any nested
   details inside it, so a link to #documents reveals the document lists and
   their sub-groups rather than landing on a closed panel. */
function revealTarget(hash){
  if (!hash || hash === "#" || hash === "#admin") return null;
  let t;
  try { t = document.querySelector(hash); } catch(e){ return null; }
  if (!t) return null;
  if (t.tagName === "DETAILS") t.open = true;
  let p = t.parentElement;
  while (p){
    if (p.tagName === "DETAILS") p.open = true;
    p = p.parentElement;
  }
  t.querySelectorAll("details.doc-group").forEach(d => { d.open = true; });
  return t;
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  revealTarget(a.getAttribute("href"));
});
window.addEventListener("hashchange", () => {
  const t = revealTarget(location.hash);
  if (t && t.scrollIntoView) t.scrollIntoView({behavior:"smooth", block:"start"});
});

/* Toast */
let toastTimer;
function toast(msg){
  const t = $("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* Document requests */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-doc]");
  if (!btn) return;
  const panel = revealTarget("#documents");
  const form = panel && panel.querySelector(".req-form");
  $("reqDoc").value = btn.dataset.doc;
  $("reqName").focus();
  if (form && form.scrollIntoView) form.scrollIntoView({behavior:"smooth", block:"center"});
});
function loadBox(key){ try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch(e){ return []; } }
function renderOutbox(){
  const items = loadBox("tc.outbox").filter(i => i.brand === viewKey);
  $("outboxEmpty").style.display = items.length ? "none" : "block";
  $("outboxList").innerHTML = items.slice(-8).reverse().map(i =>
    `<div class="outbox-item"><span class="when">${esc(i.when)}</span><span>${esc(i.doc)} , ${esc(i.company || "no company given")}</span></div>`).join("");
}
$("reqSend").addEventListener("click", () => {
  const b = getConfig(viewKey);
  const name = $("reqName").value.trim(), company = $("reqCompany").value.trim(),
        email = $("reqEmail").value.trim(), doc = $("reqDoc").value, note = $("reqNote").value.trim();
  if (!name || !email) { toast("Name and work email are needed to compose the request"); return; }
  const subject = encodeURIComponent(`[${b.name} Trust Center] Document request: ${doc}`);
  const body = encodeURIComponent(`Document requested: ${doc}\nRequester: ${name}\nCompany: ${company || ","}\nWork email: ${email}\n\nContext:\n${note || ","}\n\n(Composed from the ${b.name} Trust Center, ${LAST_UPDATED})`);
  const box = loadBox("tc.outbox");
  box.push({brand: viewKey, when: new Date().toISOString().slice(0,16).replace("T"," "), doc, company});
  try { localStorage.setItem("tc.outbox", JSON.stringify(box)); } catch(e){}
  renderOutbox();
  window.location.href = `mailto:${b.trustEmail || "security@prompthalo.ai"}?subject=${subject}&body=${body}`;
  toast("Request drafted in your mail client and logged locally");
});

/* Vulnerability reports */
function vdpRef(){
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replace(/-/g,"");
  const rand = Math.random().toString(36).slice(2,6).toUpperCase();
  return `VDP-${ymd}-${rand}`;
}
function renderVbox(){
  const items = loadBox("tc.vulnbox").filter(i => i.brand === viewKey);
  $("vboxEmpty").style.display = items.length ? "none" : "block";
  $("vboxList").innerHTML = items.slice(-8).reverse().map(i =>
    `<div class="outbox-item"><span class="when">${esc(i.when)}</span><span>${esc(i.ref)} · ${esc(i.sev)} · ${esc(i.asset || "asset not given")}</span></div>`).join("");
}
$("vSend").addEventListener("click", () => {
  const b = getConfig(viewKey);
  const name = $("vName").value.trim(), email = $("vEmail").value.trim(),
        asset = $("vAsset").value.trim(), sev = $("vSev").value, desc = $("vDesc").value.trim();
  if (!desc) { toast("Please describe what you found so the team can triage it"); return; }
  const ref = vdpRef();
  const subject = encodeURIComponent(`[${b.name} VDP] ${ref} , ${sev}: ${asset || "vulnerability report"}`);
  const body = encodeURIComponent(
    `Tracking reference: ${ref}\nProduct: ${b.name}\nReporter: ${name || "Anonymous"}\nContact: ${email || ","}\nAffected asset: ${asset || ","}\nReporter severity estimate: ${sev}\n\nReport:\n${desc}\n\n, Submitted via the ${b.name} Trust Center (${LAST_UPDATED}). Good-faith research is covered by the safe harbor stated on that page.`);
  const box = loadBox("tc.vulnbox");
  box.push({brand: viewKey, when: new Date().toISOString().slice(0,16).replace("T"," "), ref, sev, asset});
  try { localStorage.setItem("tc.vulnbox", JSON.stringify(box)); } catch(e){}
  renderVbox();
  window.location.href = `mailto:${b.securityEmail || "security@prompthalo.ai"}?subject=${subject}&body=${body}`;
  toast(`Report ${ref} drafted in your mail client`);
});

/* ---------- Admin (#admin) ---------- */
let adminOpen = false;
function adminHash(){ try { return localStorage.getItem("tc.adminhash") || ADMIN_HASH; } catch(e){ return ADMIN_HASH; } }
function isAdmin(){ try { return sessionStorage.getItem("tc.admin") === "1"; } catch(e){ return false; } }
function requestAdmin(){
  if (viewKey === "bp") setView("ph");
  if (isAdmin()) { openAdmin(); return; }
  $("gateErr").style.display = "none";
  $("gatePass").value = "";
  $("gateOverlay").classList.add("show");
  $("gatePass").focus();
}
function tryUnlock(){
  if (sha256($("gatePass").value) === adminHash()){
    try { sessionStorage.setItem("tc.admin","1"); } catch(e){}
    $("gateOverlay").classList.remove("show");
    openAdmin();
  } else { $("gateErr").style.display = "block"; }
}
$("gateGo").addEventListener("click", tryUnlock);
$("gatePass").addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
$("gateCancel").addEventListener("click", () => {
  $("gateOverlay").classList.remove("show");
  if (location.hash === "#admin") history.replaceState(null,"",location.pathname + location.search);
});
function openAdmin(){
  adminOpen = true;
  document.body.classList.add("admin");
  buildAdmin();
  $("adminDrawer").classList.add("open");
}
function closeAdmin(){
  adminOpen = false;
  document.body.classList.remove("admin");
  $("adminDrawer").classList.remove("open");
  if (location.hash === "#admin") history.replaceState(null,"",location.pathname + location.search);
}
$("adminClose").addEventListener("click", closeAdmin);
$("admInline").addEventListener("click", () => { setEditing(!editing); if (editing) closeAdmin(); });
$("adminLink").addEventListener("click", () => { if (adminOpen) closeAdmin(); else requestAdmin(); });
document.querySelectorAll("[data-admsite]").forEach(btn => btn.addEventListener("click", () => {
  if (viewKey !== btn.dataset.admsite) setView(btn.dataset.admsite);
}));
window.addEventListener("hashchange", () => { if (location.hash === "#admin") requestAdmin(); });
if (location.hash === "#admin") setTimeout(requestAdmin, 50);

/* Per-section Edit buttons (visible when admin) */
document.addEventListener("click", e => {
  const btn = e.target.closest(".adm-edit");
  if (!btn) return;
  e.preventDefault(); e.stopPropagation();
  if (!isAdmin()){ requestAdmin(); return; }
  if (!editing) setEditing(true);
  const panel = btn.closest("details.panel");
  if (panel){ panel.open = true; panel.scrollIntoView({behavior:"smooth", block:"start"}); }
  if (!adminOpen) openAdmin();
  const key = btn.dataset.edit;
  const target = key === "__fields" ? document.querySelector("details.adm[data-adm='__fields']")
                                    : document.querySelector(`details.adm[data-adm='${key}']`);
  document.querySelectorAll("details.adm").forEach(d => d.open = false);
  if (target){ target.open = true; target.scrollIntoView({behavior:"smooth", block:"start"}); }
});

const ADMIN_FIELDS = [
  {key:"name", label:"Site / product name", type:"input"},
  {key:"heroTitle", label:"Hero title", type:"input"},
  {key:"heroLede", label:"Hero paragraph", type:"textarea", rows:4},
  {key:"heroMeta", label:"Hero meta line (optional, HTML allowed; leave blank to hide)", type:"textarea", rows:2},
  {key:"accent", label:"Accent color (hex)", type:"input"},
  {key:"accentTint", label:"Accent tint (hex)", type:"input"},
  {key:"accentDeep", label:"Accent deep (banner gradient end, hex)", type:"input"},
  {key:"trustEmail", label:"Trust desk email (document requests)", type:"input"},
  {key:"securityEmail", label:"Security email (vulnerability reports)", type:"input"}
];
const ADMIN_JSON = [
  {key:"pillars", label:"Trust pillars", hint:'[{"icon":"security|compliance|privacy|reliability","t":"Title","d":"Blurb","href":"#security"}]'},
  {key:"ledger", label:"Compliance ledger", hint:'[{"name":"SOC 2","scope":"...","status":"ok|progress|align|plan","label":"...","date":"..."}]'},
  {key:"practices", label:"Security practices", hint:'[{"t":"Title","d":"Description"}]'},
  {key:"data", label:"Data & privacy rows", hint:'[["Category","Handling"], ...]'},
  {key:"reliability", label:"Reliability rows", hint:'[["Area","Commitment"], ...]'},
  {key:"subs", label:"Subprocessors", hint:'[["Vendor","Purpose","Region","Safeguards"], ...]'},
  {key:"docs", label:"Documents", hint:'[{"n":"Name","s":"Subtitle","gate":"NDA|Public"}]'},
  {key:"faq", label:"FAQ", hint:'[{"q":"Question","a":"Answer"}]'},
  {key:"contacts", label:"Contacts", hint:'[["Channel","email","Note"], ...]'},
  {key:"cvdRecordIntro", label:"Disclosure record intro", type:"textarea"},
  {key:"cvdRecord", label:"Coordinated disclosure record", hint:'[{"ref":"PH-CVD-0001","title":"...","severity":"High","resolved":"2026-09-01","reported":"2026-08-01","credit":"Reported by ..."}]'},
  {key:"dataDocs", label:"Data & privacy: governing documents", hint:'["Privacy Notice","Cookie Policy"] , names must match the document register'},
  {key:"reliabilityDocs", label:"Availability: governing documents", hint:'["Business Continuity and Disaster Recovery Policy"] , names must match the document register'},
  {key:"incidents", label:"Security incidents (third party)", hint:'[{"id":"...","source":"...","title":"...","date":"2026-04","order":"Second-order","why":"...","impact":"No customer impact","url":"https://...","detail":"..."}]'},
  {key:"advisories", label:"Security advisories / CVEs", hint:'[{"id":"CVE-2026-0001","title":"...","severity":"Critical|High|Medium|Low","status":"Fixed in 2.1","date":"2026-07-01","order":"First-order","why":"...","impact":"No customer impact","url":"https://...","detail":"..."}]'},
  {key:"intros", label:"Section intros", multi:["practicesIntro","dataIntro","reliabilityIntro","incidentsIntro"], hint:'{"practicesIntro":"...","dataIntro":"...","reliabilityIntro":"..."}'}
];
function buildAdmin(){
  const cfg = getConfig(viewKey);
  $("adminSiteTag").textContent = cfg.name;
  $("admSitePH")?.classList.toggle("on", viewKey === "ph");
  $("admSiteJF")?.classList.toggle("on", viewKey === "jf");
  let html = `<details class="adm" data-adm="__fields" open><summary>Site settings</summary><div class="adm-body">`;
  ADMIN_FIELDS.forEach(f => {
    const v = cfg[f.key] || "";
    html += `<div class="adm-field"><label for="af_${f.key}">${esc(f.label)}</label>` +
      (f.type === "textarea"
        ? `<textarea id="af_${f.key}" style="min-height:${(f.rows||3)*24}px">${esc(v)}</textarea>`
        : `<input id="af_${f.key}" value="${esc(v)}">`) + `</div>`;
  });
  html += `<div class="adm-apply"><button class="btn" id="applyFields">Apply site settings</button><span class="adm-msg" id="msg_fields"></span></div></div></details>`;
  ADMIN_JSON.forEach(sec => {
    let value;
    if (sec.multi){ value = {}; sec.multi.forEach(k => value[k] = cfg[k] || ""); }
    else value = cfg[sec.key];
    html += `<details class="adm" data-adm="${sec.key}"><summary>${esc(sec.label)}</summary><div class="adm-body">
      <div class="adm-field"><label for="aj_${sec.key}">JSON</label>
      <textarea id="aj_${sec.key}">${esc(JSON.stringify(value, null, 2))}</textarea></div>
      <div class="adm-hint">Shape: ${esc(sec.hint)}</div>
      <div class="adm-apply"><button class="btn" data-applyjson="${sec.key}">Apply</button><span class="adm-msg" id="msg_${sec.key}"></span></div>
    </div></details>`;
  });
  $("adminSections").innerHTML = html;
  $("applyFields").addEventListener("click", () => {
    const cfg2 = Object.assign({}, getConfig(viewKey));
    ADMIN_FIELDS.forEach(f => { cfg2[f.key] = $("af_" + f.key).value; });
    saveConfig(viewKey, cfg2);
    render();
    const m = $("msg_fields"); m.textContent = "Saved"; m.className = "adm-msg ok";
  });
  document.querySelectorAll("[data-applyjson]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.applyjson;
      const sec = ADMIN_JSON.find(s => s.key === key);
      const m = $("msg_" + key);
      try {
        const parsed = JSON.parse($("aj_" + key).value);
        const cfg2 = Object.assign({}, getConfig(viewKey));
        if (sec.multi){ sec.multi.forEach(k => { if (parsed[k] !== undefined) cfg2[k] = parsed[k]; }); }
        else cfg2[key] = parsed;
        saveConfig(viewKey, cfg2);
        render();
        m.textContent = "Saved"; m.className = "adm-msg ok";
      } catch(err){ m.textContent = "Invalid JSON: " + err.message; m.className = "adm-msg err"; }
    });
  });
}
function downloadJson(name, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
$("admFeedAdv").addEventListener("click", () => {
  const cfg = getConfig(viewKey), live = FEED_STATE.adv === "ok";
  downloadJson("advisories.json", {
    schema: 4,
    published: new Date().toISOString().slice(0,10),
    advisories: (live && FEED.advisories) || cfg.advisories || []
  });
  toast("advisories.json exported, commit it to trustcenter/prompthalo/");
});
$("admFeedInc").addEventListener("click", () => {
  const cfg = getConfig(viewKey), live = FEED_STATE.inc === "ok";
  downloadJson("incidents.json", {
    schema: 4,
    published: new Date().toISOString().slice(0,10),
    incidentsIntro: (live && FEED.incidentsIntro) || cfg.incidentsIntro || "",
    incidents: (live && FEED.incidents) || cfg.incidents || []
  });
  toast("incidents.json exported, commit it to trustcenter/prompthalo/");
});
$("admFeedCvd").addEventListener("click", () => {
  const cfg = getConfig(viewKey), live = FEED_STATE.cvd === "ok";
  downloadJson("disclosure-record.json", {
    schema: 4,
    published: new Date().toISOString().slice(0,10),
    cvdRecordIntro: (live && FEED.cvdRecordIntro) || cfg.cvdRecordIntro || "",
    cvdRecord: (live && FEED.cvdRecord) || cfg.cvdRecord || []
  });
  toast("disclosure-record.json exported, commit it to trustcenter/prompthalo/");
});
$("admExport").addEventListener("click", () => {
  const out = { ph: getConfig("ph"), exported: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "trust-center-config.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Config exported");
});
$("admImport").addEventListener("click", () => {
  const raw = prompt("Paste the exported config JSON:");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.ph) saveConfig("ph", Object.assign({}, DEFAULTS.ph, parsed.ph));
    if (parsed.jf) saveConfig("jf", Object.assign({}, DEFAULTS.jf, parsed.jf));
    render(); buildAdmin();
    toast("Config imported");
  } catch(err){ toast("Import failed: invalid JSON"); }
});
$("admPass").addEventListener("click", () => {
  const np = prompt("New admin passphrase (applies to this browser):");
  if (!np) return;
  try { localStorage.setItem("tc.adminhash", sha256(np)); toast("Passphrase updated on this browser"); } catch(e){}
});
$("admReset").addEventListener("click", () => {
  if (!confirm(`Reset ${getConfig(viewKey).name} to shipped defaults on this browser?`)) return;
  try { localStorage.removeItem("tc.cfg." + viewKey); } catch(e){}
  render(); buildAdmin();
  toast("Site reset to defaults");
});

render();
loadFeeds();

/* A deep link such as /trustcenter/#documents must arrive with the panel and
   its sub-groups already open. */
if (location.hash && location.hash !== "#admin"){
  const landing = revealTarget(location.hash);
  if (landing && landing.scrollIntoView) setTimeout(() => landing.scrollIntoView({block:"start"}), 0);
}
