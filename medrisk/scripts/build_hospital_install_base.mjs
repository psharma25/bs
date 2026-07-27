import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const candidates = [
  process.argv[2],
  path.resolve(root, "..", "static", "hospital_tracker_source.html"),
  "/Users/psharma/Desktop/Programs/Hospital Tracker/Hospital Tracker/hospital_tracker_source.html",
].filter(Boolean);
const source = candidates.find((candidate) => fs.existsSync(candidate));
if (!source) throw new Error("Hospital tracker source was not found.");

const html = fs.readFileSync(source, "utf8");
const match = html.match(/const SEED=(\[[\s\S]*?\]);\n/);
if (!match) throw new Error("Could not locate the hospital tracker SEED array.");
const hospitals = vm.runInNewContext(match[1], Object.create(null));

// Deliberately narrow rules: a tracker tag must name the product or a documented
// predecessor/family. Ambiguous category tags remain explicitly inferred.
const rules = [
  { productId: "bd-alaris", pattern: /\bBD Alaris System\b/i, basis: "exact product-family tag" },
  { productId: "baxter-spectrum", pattern: /\bBaxter Spectrum IQ\b/i, basis: "exact product-family tag" },
  { productId: "philips-intellivue", pattern: /Patient monitors:\s*Philips\/GE/i, basis: "ambiguous Philips/GE monitor category" },
  { productId: "minimed-780g", pattern: /\bMedtronic 670G insulin pump\b/i, basis: "documented predecessor-family signal" },
];

function confidence(tag) {
  if (/confirmed-fleet/i.test(tag)) return "confirmed-fleet";
  if (/confirmed-research/i.test(tag)) return "confirmed-research";
  if (/low confidence/i.test(tag)) return "inferred-low";
  return "inferred";
}

const products = {};
for (const rule of rules) {
  const sites = [];
  for (const hospital of hospitals) {
    for (const tag of hospital.vendors || []) {
      if (!rule.pattern.test(tag)) continue;
      sites.push({
        name: hospital.name,
        city: hospital.city,
        state: hospital.state,
        system: hospital.system,
        beds: hospital.beds,
        confidence: confidence(tag),
        tracker_tag: tag,
        inference_basis: rule.basis,
      });
    }
  }
  if (sites.length) products[rule.productId] = sites;
}

const payload = {
  generated_at: new Date().toISOString(),
  source: "BitSense Hospital Tracker SEED",
  methodology: "Named sites are hypotheses unless marked confirmed-fleet. Product-family and ambiguous category mappings are labeled and must be verified against hospital inventory.",
  products,
};
const output = `window.HOSPITAL_INSTALL_BASE=${JSON.stringify(payload)};\n`;
fs.writeFileSync(path.join(root, "data", "hospital-install-base.js"), output);
console.log(JSON.stringify(Object.fromEntries(Object.entries(products).map(([id, sites]) => [id, sites.length]))));
