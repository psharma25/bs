/**
 * thebitsense.com/hair — the whole prototype in one Cloudflare Worker.
 *
 * Serves the page AND the API. The page is embedded below (gzipped), so there
 * is nothing else to host: no GitHub Pages, no S3, no Codespace to keep awake.
 *
 *   thebitsense.com/hair              the page
 *   thebitsense.com/hair/api/health   what is configured
 *   thebitsense.com/hair/api/gen      forwards to Google; meters per client
 *   thebitsense.com/hair/api/save     saves a look to R2, with a retention date
 *   thebitsense.com/hair/api/saves    lists saved looks, purging expired ones
 *   thebitsense.com/hair/api/delete   deletes one saved look
 *   thebitsense.com/hair/api/usage    per-client images, cost and overage
 *   thebitsense.com/hair/saves/...    serves a saved file (R2 stays private)
 *
 * Bindings:
 *   GEMINI_API_KEY  secret  — set by CI from your GitHub Actions secret
 *   SAVES           R2      — optional; without it the page downloads instead
 */

const PREFIX = "/hair";
const GOOGLE = "https://generativelanguage.googleapis.com/v1beta/models/";
const PRICES = { "gemini-3.1-flash-image": 0.067, "gemini-2.5-flash-image": 0.039 };
const DEFAULT_PRICE = 0.067;
const USAGE_KEY = "usage/usage.json";

const PAGE_GZ_B64 = 
  "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" +
  "/V9R5BzzC8QAAA==";

let pageCache = null;
async function pageHtml() {
  if (pageCache) return pageCache;
  const raw = Uint8Array.from(atob(PAGE_GZ_B64), (c) => c.charCodeAt(0));
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("gzip"));
  pageCache = await new Response(stream).text();
  return pageCache;
}

const json = (status, payload) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const slugify = (t) =>
  String(t || "").trim().toLowerCase().replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") ||
  "client";

function dataUrlBytes(url) {
  const [head, payload] = String(url || "").split(",");
  if (!payload) throw new Error("not a data url");
  const png = head.includes("png");
  const bin = atob(payload);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { ext: png ? "png" : "jpg", bytes, type: png ? "image/png" : "image/jpeg" };
}

async function readJson(env, key, fallback) {
  if (!env.SAVES) return fallback;
  const obj = await env.SAVES.get(key);
  if (!obj) return fallback;
  try {
    return JSON.parse(await obj.text());
  } catch {
    return fallback;
  }
}

const writeJson = (env, key, obj) =>
  env.SAVES.put(key, JSON.stringify(obj, null, 2), {
    httpMetadata: { contentType: "application/json" },
  });

/* ---------------- usage ---------------- */
async function recordUsage(env, label, model) {
  if (!env.SAVES) return;
  const month = new Date().toISOString().slice(0, 7);
  const data = await readJson(env, USAGE_KEY, {});
  data[month] = data[month] || {};
  const who = (data[month][label || "(unassigned)"] = data[month][label || "(unassigned)"] || {});
  who[model] = (who[model] || 0) + 1;
  await writeJson(env, USAGE_KEY, data);
}

async function usageSummary(env, allowance, month) {
  month = month || new Date().toISOString().slice(0, 7);
  const data = (await readJson(env, USAGE_KEY, {}))[month] || {};
  const rows = [];
  let tImg = 0, tCost = 0, tOver = 0;
  for (const [customer, models] of Object.entries(data)) {
    const images = Object.values(models).reduce((a, b) => a + b, 0);
    const cost = Object.entries(models).reduce(
      (a, [m, n]) => a + (PRICES[m] ?? DEFAULT_PRICE) * n, 0);
    const over = allowance ? Math.max(0, images - allowance) : 0;
    rows.push({
      customer, images,
      cost: Math.round(cost * 10000) / 10000,
      over,
      overCost: images && over ? Math.round(cost * (over / images) * 10000) / 10000 : 0,
      models,
    });
    tImg += images; tCost += cost; tOver += over;
  }
  rows.sort((a, b) => b.cost - a.cost);
  return {
    month, allowance, rows,
    totals: { images: tImg, cost: Math.round(tCost * 10000) / 10000, over: tOver },
  };
}

/* ---------------- saved looks ---------------- */
async function listSlugs(env) {
  if (!env.SAVES) return [];
  const listing = await env.SAVES.list({ prefix: "saves/", delimiter: "/" });
  return (listing.delimitedPrefixes || []).map((p) => p.split("/")[1]).filter(Boolean);
}

async function deleteSlug(env, slug) {
  const listing = await env.SAVES.list({ prefix: `saves/${slug}/` });
  for (const o of listing.objects || []) await env.SAVES.delete(o.key);
}

async function purgeExpired(env) {
  const now = new Date().toISOString();
  for (const slug of await listSlugs(env)) {
    const meta = await readJson(env, `saves/${slug}/details.json`, null);
    if (meta?.expiresAt && meta.expiresAt < now) await deleteSlug(env, slug);
  }
}

async function doSave(env, body) {
  if (!env.SAVES) {
    return json(501, { error: { message: "No R2 bucket bound, so nothing was stored." } });
  }
  const ref = body.ref || {};
  const label = ref.id || ref.nickname || ref.name;
  if (!label) return json(400, { error: { message: "Need an ID, a nickname or a name." } });

  const keepDays = parseInt(body.keepDays, 10) || 0;
  const now = new Date();
  const slug = `${slugify(label)}-${now.toISOString().replace(/[-:T]/g, "").slice(0, 14)}`;
  const written = [];

  const put = async (name, img) => {
    await env.SAVES.put(`saves/${slug}/${name}`, img.bytes,
      { httpMetadata: { contentType: img.type } });
    written.push(name);
  };

  try {
    if (body.original) {
      const img = dataUrlBytes(body.original);
      await put(`original.${img.ext}`, img);
    }
    for (const style of body.styles || []) {
      const sname = slugify(style.style);
      for (const im of style.images || []) {
        const img = dataUrlBytes(im.dataUrl);
        await put(`${sname}-${slugify(im.view)}.${img.ext}`, img);
      }
    }
  } catch (err) {
    return json(400, { error: { message: "Could not decode an image: " + err.message } });
  }

  await writeJson(env, `saves/${slug}/details.json`, {
    slug, ref, label, set: body.set, length: body.length,
    chosenStyle: body.chosenStyle,
    styles: (body.styles || []).map((st) => ({
      style: st.style, chosen: !!st.chosen, views: (st.images || []).map((i) => i.view),
    })),
    when: body.when || now.toISOString(),
    keepDays,
    expiresAt: keepDays ? new Date(now.getTime() + keepDays * 864e5).toISOString() : null,
    files: written,
  });

  return json(200, { ok: true, slug, files: written });
}

async function doList(env) {
  await purgeExpired(env);
  const slugs = (await listSlugs(env)).sort().reverse().slice(0, 60);
  const items = [];
  for (const slug of slugs) {
    const meta = await readJson(env, `saves/${slug}/details.json`, null);
    if (!meta) continue;
    let daysLeft = null;
    if (meta.expiresAt) {
      daysLeft = Math.max(0, Math.ceil((new Date(meta.expiresAt) - new Date()) / 864e5));
    }
    const thumb = (meta.files || []).find((f) => f.startsWith("original."));
    items.push({
      slug, label: meta.label || slug, set: meta.set, chosenStyle: meta.chosenStyle,
      when: meta.when, keepDays: meta.keepDays, expiresAt: meta.expiresAt, daysLeft,
      path: `/saves/${slug}/details.json`,
      thumb: thumb ? `/saves/${slug}/${thumb}` : null,
    });
  }
  return json(200, { items });
}

async function serveSaved(env, path) {
  if (!env.SAVES) return json(404, { error: { message: "No bucket." } });
  const obj = await env.SAVES.get(path.replace(/^\//, ""));
  if (!obj) return json(404, { error: { message: "Not found." } });
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}

/* ---------------- generation ---------------- */
async function doGen(env, body) {
  // a key typed into the page's test panel wins for this request only
  const key = (body.key || "").trim() || env.GEMINI_API_KEY;
  if (!key) {
    return json(400, { error: { message: "No API key on the server, and none supplied." } });
  }
  const model = body.model || "gemini-3.1-flash-image";
  const ref = body.ref || {};
  const label = ref.id || ref.nickname || ref.name || "";

  const upstream = await fetch(GOOGLE + model + ":generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body.payload || {}),
  });
  const text = await upstream.text();

  if (upstream.ok) await recordUsage(env, label, model);  // count only what came back

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* ---------------- routing ---------------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // works at thebitsense.com/hair and at the bare workers.dev URL alike
    let path = url.pathname;
    if (path === PREFIX) path = "/";
    else if (path.startsWith(PREFIX + "/")) path = path.slice(PREFIX.length);
    path = path.replace(/\/$/, "") || "/";

    if (request.method === "OPTIONS") return json(200, { ok: true });

    if (path === "/" || path === "/index.html") {
      return new Response(await pageHtml(), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (path === "/api/health") {
      const html = await pageHtml();
      const m = /name="build" content="([^"]+)"/.exec(html);
      return json(200, {
        ok: true, key: !!env.GEMINI_API_KEY, saves: !!env.SAVES,
        build: m ? m[1] : "unstamped", bytes: html.length, where: "cloudflare-worker",
      });
    }

    if (path === "/api/saves") return doList(env);

    if (path === "/api/usage") {
      const allowance = parseInt(url.searchParams.get("allowance"), 10) || 0;
      return json(200, await usageSummary(env, allowance, url.searchParams.get("month")));
    }

    if (path.startsWith("/saves/")) return serveSaved(env, path);

    if (request.method !== "POST") return json(404, { error: { message: "Unknown endpoint." } });

    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: { message: "Bad JSON." } });
    }

    if (path === "/api/gen") return doGen(env, body);
    if (path === "/api/save") return doSave(env, body);
    if (path === "/api/delete") {
      const slug = body.slug || "";
      if (!slug || slug.includes("/") || slug.includes("..")) {
        return json(400, { error: { message: "Bad slug." } });
      }
      await deleteSlug(env, slug);
      return json(200, { ok: true, slug });
    }
    return json(404, { error: { message: "Unknown endpoint." } });
  },
};
