(() => {
  const IDS = Array.isArray(window.ALYZ_VIDEOS) ? window.ALYZ_VIDEOS : [];
  const EMBED_BASE = "https://www.hentaicity.com/embed/";
  const $ = id => document.getElementById(id);
  const key = "alyzdev-favorites";
  let favorites = new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  let current = null;
  const metadata = new Map();

  const validId = id => /^[a-zA-Z0-9_-]{3,80}$/.test(id);
  const videoUrl = id => EMBED_BASE + encodeURIComponent(id);

  async function getMeta(id) {
    if (metadata.has(id)) return metadata.get(id);
    const fallback = { id, title: `Video ${id}`, thumbnail: "" };
    try {
      const r = await fetch(`/api/metadata/${encodeURIComponent(id)}`);
      if (r.ok) Object.assign(fallback, await r.json());
    } catch {}
    metadata.set(id, fallback);
    return fallback;
  }
  function showView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
    document.querySelectorAll(".nav-item").forEach(v => v.classList.toggle("selected", v.dataset.view === id));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function makeCard(item) {
    const el = document.createElement("article");
    el.className = "video-card";
    el.innerHTML = `<div class="thumb-wrap"><div class="thumb-placeholder">ALYZ<span>DEV</span></div><img class="thumb" alt="" loading="lazy"><span class="duration">EMBED</span></div><div class="card-meta"><h3 class="card-title"></h3><span class="card-id"></span></div><div class="card-category">VIDEO COLLECTION</div>`;
    const img = el.querySelector("img");
    if (item.thumbnail) { img.src = item.thumbnail; img.hidden = false; }
    else img.hidden = true;
    el.querySelector(".thumb-placeholder").hidden = !!item.thumbnail;
    el.querySelector(".card-title").textContent = item.title;
    el.querySelector(".card-id").textContent = item.id;
    el.addEventListener("click", () => openVideo(item));
    return el;
  }
  async function loadItems() {
    const ids = [...new Set(IDS.filter(validId))];
    $("videoCount").textContent = `${String(ids.length).padStart(2,"0")} VIDEOS`;
    const items = await Promise.all(ids.map(getMeta));
    window.ALYZ_ITEMS = items;
    renderGrid("videoGrid", items);
    const hashId = new URLSearchParams(location.hash.slice(1)).get("video");
    if (hashId) { const item = items.find(x => x.id === hashId); if (item) openVideo(item); }
  }
  function renderGrid(target, items) {
    const root = $(target); root.replaceChildren();
    items.forEach(item => root.appendChild(makeCard(item)));
  }
  function renderFavorites() {
    const items = (window.ALYZ_ITEMS || []).filter(x => favorites.has(x.id));
    renderGrid("favoriteGrid", items);
    $("emptyFavorites").hidden = items.length > 0;
  }
  function openVideo(item) {
    current = item;
    $("playerTitle").textContent = item.title;
    $("playerId").textContent = item.id;
    $("playerDescription").textContent = "Diputar melalui embed: " + videoUrl(item.id);
    const frame = $("playerFrame");
    frame.replaceChildren();
    const iframe = document.createElement("iframe");
    iframe.src = videoUrl(item.id);
    iframe.title = item.title;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    frame.appendChild(iframe);
    $("favoriteBtn").textContent = favorites.has(item.id) ? "✓ Favorited" : "＋ Favorite";
    const related = (window.ALYZ_ITEMS || []).filter(x => x.id !== item.id).slice(0,8);
    $("relatedList").replaceChildren(...related.map(x => {
      const row = document.createElement("div"); row.className = "related-item";
      const pic = document.createElement("div"); pic.className = "related-thumb";
      if (x.thumbnail) { const img = document.createElement("img"); img.src = x.thumbnail; img.alt = ""; pic.appendChild(img); }
      const info = document.createElement("div"); const title = document.createElement("strong"); title.textContent = x.title;
      const id = document.createElement("small"); id.textContent = x.id;
      info.append(title,id); row.append(pic,info); row.addEventListener("click",()=>openVideo(x)); return row;
    }));
    showView("playerView");
  }
  $("scanBtn").addEventListener("click", () => {
    const btn = $("scanBtn"), bar = $("progressBar"), text = $("progressText");
    btn.disabled = true; let p = 0;
    const timer = setInterval(() => {
      p = Math.min(100, p + 2);
      bar.style.width = p + "%"; text.textContent = `CHECKING INTERFACE · ${p}%`;
      if (p === 100) {
        clearInterval(timer);
        $("gate").classList.add("hidden");
        $("ageGate").classList.remove("hidden");
      }
    }, 35);
  });
  $("yesAge").addEventListener("click", () => {
    $("ageGate").classList.add("hidden"); $("app").classList.remove("hidden"); loadItems();
  });
  $("noAge").addEventListener("click", () => {
    $("ageGate").classList.add("hidden"); $("gate").classList.remove("hidden");
    $("scanBtn").disabled = false; $("progressBar").style.width = "0%"; $("progressText").textContent = "READY · 0%";
  });
  document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => {
    showView(b.dataset.view); if (b.dataset.view === "favoriteView") renderFavorites();
  }));
  $("searchInput").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    renderGrid("videoGrid", (window.ALYZ_ITEMS || []).filter(x => `${x.title} ${x.id}`.toLowerCase().includes(q)));
  });
  $("backBtn").addEventListener("click", () => showView("videoView"));
  $("favoriteBtn").addEventListener("click", () => {
    if (!current) return;
    favorites.has(current.id) ? favorites.delete(current.id) : favorites.add(current.id);
    localStorage.setItem(key, JSON.stringify([...favorites]));
    $("favoriteBtn").textContent = favorites.has(current.id) ? "✓ Favorited" : "＋ Favorite";
  });
  $("shareBtn").addEventListener("click", async () => {
    if (!current) return;
    const url = `${location.origin}${location.pathname}#video=${encodeURIComponent(current.id)}`;
    try {
      if (navigator.share) await navigator.share({title:current.title,url});
      else { await navigator.clipboard.writeText(url); $("shareBtn").textContent = "✓ Copied"; }
    } catch {}
  });
})();