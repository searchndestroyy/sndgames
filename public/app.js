/* ── SVG Icons ── */
const IC = {
  gamepad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  compass: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  maximize: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  chevL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
};

/* ── Categories ── */
const CATEGORIES = [
  { id: "all", label: "All Games" },
  { id: "editors-choice", label: "Editor's Choice" },
  { id: "arcade", label: "Arcade" },
  { id: "puzzle", label: "Puzzle" },
  { id: "car", label: "Car" },
  { id: "bike", label: "Bike" },
  { id: "multiplayer", label: "Multiplayer" },
  { id: "io", label: "IO" },
  { id: "html", label: "HTML" },
  { id: "od", label: "Classic" },
];

/* ── State ── */
let state = {
  tab: "home",
  search: "",
  category: "all",
  page: 1,
  featuredIdx: 0,
  playing: null,
};
let GAMES = [];
let loading = true;
const PER_PAGE = 18,
  FEAT_COUNT = 6;
let featTimer = null;

/* ── Helpers ── */
const $ = (s) => document.querySelector(s);
const catLabel = (id) =>
  (CATEGORIES.find((c) => c.id === id) || {}).label || id;
function hue(t) {
  let h = 0;
  for (let i = 0; i < t.length; i++) h += t.charCodeAt(i);
  return h % 360;
}

async function checkImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/* ── Load Games from Data ── */
async function loadGames() {
  loading = true;
  render();

  const games = [];
  const seenUrls = new Set();

  console.log("[v0] Loading games from GAMES_DATA:", GAMES_DATA.length);

  for (const [title, url, category] of GAMES_DATA) {
    // Dedupe by URL
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    games.push({
      title: title,
      url: url,
      category: category || "html",
      folder: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      thumbnail: null, // No custom thumbnails for data-driven games
    });
  }

  console.log("[v0] Total games loaded:", games.length);
  console.log(
    "[v0] Games by category:",
    games.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {}),
  );

  GAMES = games;
  loading = false;
  render();
}

/* ── Thumbnail HTML ── */
function thumbHTML(game, size = "card") {
  // If custom thumbnail exists, use it
  if (game.thumbnail) {
    return `<img src="${game.thumbnail}" alt="${game.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="width:100%;height:100%;object-fit:cover;">
      <div class="fallback" style="display:none;background:linear-gradient(135deg,hsl(${hue(game.title)},60%,15%),hsl(${hue(game.title)},50%,25%))">${IC.gamepad}</div>`;
  }

  // Try CrazyGames thumbnail
  const cgMatch = game.url.match(/crazygames\.com\/embed\/([^/?]+)/);
  if (cgMatch) {
    const src = `https://images.crazygames.com/games/${cgMatch[1]}/cover-1702289187142.png?auto=format%2Ccompress&q=45&cs=strip&ch=DPR&w=${size === "featured" ? "400" : "200"}`;
    return `<img src="${src}" alt="${game.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="width:100%;height:100%;object-fit:cover;">
      <div class="fallback" style="display:none;background:linear-gradient(135deg,hsl(${hue(game.title)},60%,15%),hsl(${hue(game.title)},50%,25%))">${IC.gamepad}</div>`;
  }

  // Fallback gradient
  const h = hue(game.title);
  return `<div class="fallback" style="background:linear-gradient(135deg,hsl(${h},60%,15%),hsl(${h},50%,25%))">${IC.gamepad}</div>`;
}

function filtered() {
  let list = GAMES;
  if (state.category !== "all")
    list = list.filter((g) => g.category === state.category);
  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    list = list.filter((g) => g.title.toLowerCase().includes(q));
  }
  return list;
}

/* ── Render ── */
function render() {
  const app = $("#app");

  if (loading) {
    app.innerHTML = `
    <div class="ambient"><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Loading games...</p>
    </div>`;
    return;
  }

  const f = filtered();
  const totalPages = Math.ceil(f.length / PER_PAGE);
  const pageGames = f.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
  const featured = GAMES.slice(0, FEAT_COUNT);

  app.innerHTML = `
  <div class="ambient"><div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div></div>

  <!-- Header -->
  <header class="site-header">
    <div class="header-inner">
      <div class="logo">
        <div class="logo-icon">${IC.gamepad}</div>
        <div><div class="logo-title">KQG - Premium Gaming</div><div class="logo-sub">Game Hub</div></div>
      </div>
      <nav class="nav-tabs">
        <button class="nav-btn ${state.tab === "home" ? "active" : ""}" data-tab="home">
          ${IC.home}<span class="nav-label">Home</span>
        </button>
        <button class="nav-btn ${state.tab === "explore" ? "active" : ""}" data-tab="explore">
          ${IC.compass}<span class="nav-label">Explore</span>
        </button>
      </nav>
      <div class="search-wrap">
        <span class="search-icon">${IC.search}</span>
        <input class="search-input" type="text" placeholder="Search games..." value="${state.search}" id="searchInput">
        ${state.search ? `<button class="search-clear" id="clearSearch">${IC.x}</button>` : ""}
      </div>
    </div>
  </header>

  <!-- Content -->
  <main class="main-content">
    ${state.tab === "home" ? renderHome(featured) : ""}
    ${state.tab === "explore" ? renderExplore(f, pageGames, totalPages) : ""}
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-copy">&copy; 2025 NoxDev. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Credits</a>
      </div>
      <p class="footer-brand">synapseGames</p>
    </div>
  </footer>

  <!-- Player Modal -->
  <div class="player-modal ${state.playing ? "" : "hidden"}" id="playerModal">
    ${
      state.playing
        ? `
    <div class="player-header">
      <div class="player-header-left">
        <button class="player-close" id="closePlayer">${IC.x}</button>
        <span class="player-title">${state.playing.title}</span>
      </div>
      <button class="player-fs" id="fullscreenBtn">
        ${IC.maximize}<span class="player-fs-label">Fullscreen</span>
      </button>
    </div>
    <div class="player-body">
      <iframe src="${state.playing.url}" title="${state.playing.title}" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms" id="gameIframe"></iframe>
    </div>`
        : ""
    }
  </div>`;
  bind();
}

function renderHome(featured) {
  if (!featured.length)
    return `<div class="section-pad"><p>No games loaded yet.</p></div>`;
  const g = featured[state.featuredIdx] || featured[0];
  return `<div class="section-pad">
    <!-- Featured -->
    <section>
      <div class="featured-card" data-play="${state.featuredIdx}">
        <div class="featured-thumb">
          ${thumbHTML(g, "featured")}
          <div class="featured-gradient"></div>
          <div class="featured-highlight"></div>
          <div class="featured-info">
            <span class="featured-badge">Featured</span>
            <h2 class="featured-title">${g.title}</h2>
            <p class="featured-sub">Click to play now</p>
          </div>
          <div class="featured-play"><div class="play-circle">${IC.arrow}</div></div>
        </div>
      </div>
      <div class="dots">
        ${featured.map((_, i) => `<button class="dot ${i === state.featuredIdx ? "active" : "inactive"}" data-dot="${i}"></button>`).join("")}
      </div>
    </section>

    <!-- Stats -->
    <div class="glass stats-strip">
      <div class="stat">
        <div class="stat-icon" style="background:rgba(251,146,60,0.08)"><span style="color:#fb923c">${IC.flame}</span></div>
        <div><div class="stat-value">${GAMES.length}</div><div class="stat-label">Total Games</div></div>
      </div>
      <div class="stat">
        <div class="stat-icon" style="background:rgba(56,189,248,0.08)"><span style="color:#38bdf8">${IC.globe}</span></div>
        <div><div class="stat-value">${CATEGORIES.length - 1}</div><div class="stat-label">Categories</div></div>
      </div>
      <div class="stat">
        <div class="stat-icon" style="background:rgba(52,211,153,0.08)"><span style="color:#34d399">${IC.gamepad}</span></div>
        <div><div class="stat-value">100%</div><div class="stat-label">Free to Play</div></div>
      </div>
    </div>

    <!-- Category Links -->
    <div class="section-divider"><div class="line"></div><span>Browse Categories</span><div class="line right"></div></div>
    <div class="cat-pills" style="margin-bottom:24px">
      ${CATEGORIES.filter((c) => c.id !== "all")
        .map(
          (c) =>
            `<button class="cat-pill" data-cat="${c.id}">${c.label}</button>`,
        )
        .join("")}
    </div>

    <!-- Popular Games -->
    <div class="section-divider"><div class="line"></div><span>Popular Games</span><div class="line right"></div></div>
    <div class="games-grid">
      ${GAMES.slice(0, 12)
        .map((g, i) => gameCardHTML(g))
        .join("")}
    </div>
    <button class="explore-btn" id="goExplore">${IC.compass} Explore All Games</button>
  </div>`;
}

function renderExplore(f, pageGames, totalPages) {
  return `<div class="section-pad">
    <div class="filter-bar">
      ${CATEGORIES.map((c) => `<button class="cat-pill ${state.category === c.id ? "active" : ""}" data-filter="${c.id}">${c.label}</button>`).join("")}
      <span class="filter-count">${f.length} game${f.length !== 1 ? "s" : ""}</span>
    </div>
    ${
      pageGames.length > 0
        ? `
    <div class="games-grid">${pageGames.map((g) => gameCardHTML(g)).join("")}</div>
    ${paginationHTML(state.page, totalPages)}`
        : `
    <div class="glass no-results">
      ${IC.gamepad}
      <p>No games found</p>
      <button id="clearFilters">Clear filters</button>
    </div>`
    }
  </div>`;
}

function gameCardHTML(g) {
  const cl = catLabel(g.category);
  return `<div class="game-card" data-url="${g.url}" data-title="${g.title.replace(/"/g, "&quot;")}">
    <div class="card-thumb">
      ${thumbHTML(g)}
      <div class="card-gradient"></div>
      <span class="card-category">${cl}</span>
      <div class="card-play"><div class="card-play-btn">${IC.arrow}</div></div>
    </div>
    <div class="card-info"><div class="card-title">${g.title}</div></div>
  </div>`;
}

function paginationHTML(page, total) {
  if (total <= 1) return "";
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const range = pages.filter(
    (p) => p === 1 || p === total || Math.abs(p - page) <= 2,
  );
  let html = `<div class="pagination">
    <button class="page-btn" data-page="${Math.max(1, page - 1)}" ${page === 1 ? "disabled" : ""}>${IC.chevL}</button>`;
  range.forEach((p, i) => {
    const prev = range[i - 1];
    if (prev && p - prev > 1) html += `<span class="page-dots">...</span>`;
    html += `<button class="page-btn ${p === page ? "active" : ""}" data-page="${p}">${p}</button>`;
  });
  html += `<button class="page-btn" data-page="${Math.min(total, page + 1)}" ${page === total ? "disabled" : ""}>${IC.chevR}</button></div>`;
  return html;
}

/* ── Event Binding ── */
function bind() {
  // Nav tabs
  document.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      state.page = 1;
      render();
    }),
  );
  // Search
  const si = $("#searchInput");
  if (si) {
    si.addEventListener("input", (e) => {
      state.search = e.target.value;
      state.page = 1;
      if (e.target.value) state.tab = "explore";
      render();
      const ni = $("#searchInput");
      if (ni) {
        ni.focus();
        ni.selectionStart = ni.selectionEnd = ni.value.length;
      }
    });
  }
  const cs = $("#clearSearch");
  if (cs)
    cs.addEventListener("click", () => {
      state.search = "";
      render();
    });
  // Featured card play
  document.querySelectorAll(".featured-card[data-play]").forEach((c) =>
    c.addEventListener("click", () => {
      state.playing = GAMES[parseInt(c.dataset.play)];
      render();
    }),
  );
  // Carousel dots
  document.querySelectorAll("[data-dot]").forEach((d) =>
    d.addEventListener("click", () => {
      state.featuredIdx = parseInt(d.dataset.dot);
      render();
    }),
  );
  // Category pills (home)
  document.querySelectorAll(".cat-pills [data-cat]").forEach((b) =>
    b.addEventListener("click", () => {
      state.category = b.dataset.cat;
      state.page = 1;
      state.tab = "explore";
      render();
    }),
  );
  // Category filters (explore)
  document.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      state.category = b.dataset.filter;
      state.page = 1;
      render();
    }),
  );
  // Game cards
  document.querySelectorAll(".game-card[data-url]").forEach((c) =>
    c.addEventListener("click", () => {
      state.playing = { title: c.dataset.title, url: c.dataset.url };
      render();
    }),
  );
  // Explore button
  const ge = $("#goExplore");
  if (ge)
    ge.addEventListener("click", () => {
      state.tab = "explore";
      state.page = 1;
      render();
    });
  // Clear filters
  const cf = $("#clearFilters");
  if (cf)
    cf.addEventListener("click", () => {
      state.search = "";
      state.category = "all";
      render();
    });
  // Pagination
  document.querySelectorAll("[data-page]").forEach((b) => {
    if (!b.disabled)
      b.addEventListener("click", () => {
        state.page = parseInt(b.dataset.page);
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  });
  // Player close
  const cp = $("#closePlayer");
  if (cp)
    cp.addEventListener("click", () => {
      state.playing = null;
      render();
    });
  // Fullscreen
  const fb = $("#fullscreenBtn");
  if (fb)
    fb.addEventListener("click", () => {
      const f = $("#gameIframe");
      if (f) f.requestFullscreen?.();
    });
}

/* ── Keyboard ── */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.playing) {
    state.playing = null;
    render();
  }
});

/* ── Featured Rotation ── */
function startFeaturedRotation() {
  if (featTimer) clearInterval(featTimer);
  featTimer = setInterval(() => {
    if (state.tab === "home" && !state.playing && GAMES.length > 0) {
      state.featuredIdx =
        (state.featuredIdx + 1) % Math.min(FEAT_COUNT, GAMES.length);
      render();
    }
  }, 5000);
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "[v0] Categories available:",
    CATEGORIES.map((c) => c.label),
  );
  console.log(
    "[v0] GAMES_DATA:",
    typeof GAMES_DATA !== "undefined" ? GAMES_DATA.length : "NOT DEFINED",
  );
  loadGames();
  startFeaturedRotation();
});
