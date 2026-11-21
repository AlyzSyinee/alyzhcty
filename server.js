const express = require("express");
const helmet = require("helmet");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const EMBED_BASE = "https://www.hentaicity.com/embed/";
const ID_RE = /^[a-zA-Z0-9_-]{3,80}$/;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'", "https://www.hentaicity.com"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", "https:", "blob:"]
    }
  }
}));
app.use(express.static(path.join(__dirname, "public")));

function meta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i")
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  }
  return "";
}

// Metadata is fetched only from the fixed embed host; IDs are strictly validated.
app.get("/api/metadata/:id", async (req, res) => {
  const id = req.params.id;
  if (!ID_RE.test(id)) return res.status(400).json({ error: "Invalid video ID" });
  try {
    const response = await fetch(EMBED_BASE + encodeURIComponent(id), {
      headers: { "User-Agent": "AlyzDev-Metadata/1.0" },
      signal: AbortSignal.timeout(7000)
    });
    if (!response.ok) return res.json({ id, title: `Video ${id}`, thumbnail: "" });
    const html = (await response.text()).slice(0, 1_500_000);
    const title = meta(html, "og:title") || meta(html, "twitter:title") || `Video ${id}`;
    const thumbnail = meta(html, "og:image") || meta(html, "twitter:image") || "";
    res.set("Cache-Control", "public, max-age=1800");
    res.json({ id, title, thumbnail });
  } catch {
    res.json({ id, title: `Video ${id}`, thumbnail: "" });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`AlyzDev: http://localhost:${PORT}`));