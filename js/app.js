/* ============================================================
   New Mom Recos — app.js
   ============================================================ */

// --- State ---
const state = {
  config: null,
  allRecs: [],
  activeType: null,       // set to first type key after config loads
  activeCategory: 'all',  // 'all' = no category filter
  activeView: 'grid',
  requiredOnly: false,
};

// Image fetch cache: link url → Promise<string|null>
const imageFetches = {};

// --- Init ---
async function init() {
  try {
    const [configRes, recsRes] = await Promise.all([
      fetch('data/config.json'),
      fetch('data/recommendations.json'),
    ]);
    if (!configRes.ok) throw new Error('Failed to load config.json');
    if (!recsRes.ok)   throw new Error('Failed to load recommendations.json');

    state.config   = await configRes.json();
    state.allRecs  = (await recsRes.json()).recommendations;
    state.activeType = Object.keys(state.config.types)[0];

    populateHero();
    buildTypeTabs();
    buildCategoryPills();
    renderCards();
    populateFooter();
  } catch (err) {
    document.getElementById('card-grid').innerHTML =
      `<div class="empty-state"><p>Could not load recommendations. ${err.message}</p></div>`;
    console.error(err);
  }
}

// --- Hero ---
function populateHero() {
  const { site } = state.config;
  document.getElementById('site-title').textContent   = site.title;
  document.title                                      = site.title;
  document.getElementById('hero-tagline').textContent = site.tagline;
  document.getElementById('hero-bio').textContent     = site.curator_bio;
}

// --- Footer ---
function populateFooter() {
  const { site } = state.config;
  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  document.getElementById('footer-text').textContent =
    `Curated by ${site.curator_name} · Last updated ${updated}`;
}

// --- Type Tabs (no "All" tab) ---
function buildTypeTabs() {
  const { types } = state.config;
  const container = document.getElementById('type-tabs');

  container.innerHTML = Object.entries(types).map(([key, def]) => {
    const isActive = key === state.activeType;
    const iconHTML = def.icon ? `<span class="type-tab-icon">${getIcon(def.icon)}</span>` : '';
    return `<button
      class="type-tab${isActive ? ' active' : ''}"
      role="tab"
      aria-selected="${isActive}"
      data-type="${key}"
    >${iconHTML}${def.label}</button>`;
  }).join('');

  container.addEventListener('click', e => {
    const btn = e.target.closest('.type-tab');
    if (!btn || btn.dataset.type === state.activeType) return;
    state.activeType     = btn.dataset.type;
    state.activeCategory = 'all';
    container.querySelectorAll('.type-tab').forEach(t => {
      t.classList.toggle('active', t === btn);
      t.setAttribute('aria-selected', t === btn ? 'true' : 'false');
    });
    buildCategoryPills();
    renderCards();
  });
}

// --- Category Pills (no "All" pill; click active pill to deselect) ---
function buildCategoryPills() {
  const { types } = state.config;
  const row       = document.getElementById('category-pills-row');
  const container = document.getElementById('category-pills');

  const categories = types[state.activeType]?.categories || [];

  if (categories.length === 0) {
    row.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  row.classList.remove('hidden');

  container.innerHTML = categories.map(cat => {
    const isActive = cat === state.activeCategory;
    return `<button class="category-pill${isActive ? ' active' : ''}" data-cat="${cat}">${cat}</button>`;
  }).join('');
}

// --- Filtering (pure) ---
function getFilteredRecs() {
  return state.allRecs.filter(rec => {
    const typeMatch = rec.type === state.activeType;
    const catMatch  = state.activeCategory === 'all' || rec.category === state.activeCategory;
    const reqMatch  = !state.requiredOnly || rec.priority === 'required';
    return typeMatch && catMatch && reqMatch;
  });
}

// --- Group by category (preserves config order) ---
function groupByCategory(recs) {
  const categoryOrder = state.config.types[state.activeType]?.categories || [];

  const map = new Map();
  for (const rec of recs) {
    if (!map.has(rec.category)) map.set(rec.category, []);
    map.get(rec.category).push(rec);
  }

  const result = [];
  for (const cat of categoryOrder) {
    if (map.has(cat)) result.push({ category: cat, items: map.get(cat) });
  }
  // Fallback for any categories not in config
  for (const [cat, items] of map) {
    if (!categoryOrder.includes(cat)) result.push({ category: cat, items });
  }
  return result;
}

// --- Render Cards ---
function renderCards() {
  const grid    = document.getElementById('card-grid');
  const results = getFilteredRecs();

  document.getElementById('results-count').textContent =
    `${results.length} recommendation${results.length !== 1 ? 's' : ''}`;

  if (results.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No recommendations found.</p></div>`;
    return;
  }

  const groups      = groupByCategory(results);
  const showHeaders = groups.length > 1;

  grid.innerHTML = groups.map(({ category, items }) => {
    const header = showHeaders ? `
      <div class="section-header">
        <h2 class="section-title">${escapeHTML(category)}</h2>
        <span class="section-count">${items.length} item${items.length !== 1 ? 's' : ''}</span>
        <div class="section-line"></div>
      </div>` : '';

    const content = state.activeView === 'list'
      ? `<div class="list-rows">${items.map(buildListRowHTML).join('')}</div>`
      : `<div class="cards-in-section">${items.map(buildCardHTML).join('')}</div>`;

    return `<div class="category-section">${header}${content}</div>`;
  }).join('');

  loadImages();
  updateExpandButtons();
}

// --- Build Card HTML ---
function buildCardHTML(item) {
  const accent        = item.color_accent || '#D2D2D7';
  const priorityClass = item.priority === 'required' ? 'priority-required' : 'priority-nice';
  const priorityLabel = item.priority === 'required' ? 'Required' : 'Nice to Have';

  const linkHTML = item.link
    ? `<a href="${escapeAttr(item.link)}" target="_blank" rel="noopener noreferrer" class="card-link-icon" title="View ${escapeHTML(item.name)}">↗</a>`
    : '';

  const imageHTML = item.link
    ? `<div class="card-image-wrap">
         <img class="card-image" data-link="${escapeAttr(item.link)}" alt="${escapeHTML(item.name)}" />
       </div>`
    : '';

  const noteHTML = item.curator_note
    ? `<p class="card-note">"${escapeHTML(item.curator_note)}"</p>`
    : '';

  const tagsHTML = item.tags && item.tags.length > 0
    ? `<div class="card-tags">${item.tags.map(t => `<span class="card-tag">${escapeHTML(t)}</span>`).join('')}</div>`
    : '';

  return `
    <article class="card">
      <div class="card-accent" style="background:${escapeAttr(accent)};"></div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-top-text">
            <p class="card-category">${escapeHTML(item.category)}</p>
            <div class="card-name-row">
              <span class="card-name">${escapeHTML(item.name)}</span>
              ${linkHTML}
            </div>
            <span class="card-priority ${priorityClass}">${priorityLabel}</span>
          </div>
          ${imageHTML}
        </div>
        ${noteHTML}
        ${tagsHTML}
      </div>
    </article>
  `;
}

// --- Build List Row HTML ---
function buildListRowHTML(item) {
  const accent        = item.color_accent || '#D2D2D7';
  const priorityClass = item.priority === 'required' ? 'priority-required' : 'priority-nice';
  const priorityLabel = item.priority === 'required' ? 'Required' : 'Nice to Have';

  const linkHTML = item.link
    ? `<a href="${escapeAttr(item.link)}" target="_blank" rel="noopener noreferrer" class="list-link" title="View ${escapeHTML(item.name)}">↗</a>`
    : `<span class="list-link-empty">—</span>`;

  const noteHTML = item.curator_note
    ? `<div class="list-note-wrap">
         <p class="list-row-note">${escapeHTML(item.curator_note)}</p>
         <button class="list-expand-btn">more</button>
       </div>`
    : '';

  return `
    <article class="list-row">
      <div class="list-row-accent" style="background:${escapeAttr(accent)};"></div>
      <div class="list-row-body">
        <div class="list-row-top">
          <span class="list-row-name">${escapeHTML(item.name)}</span>
          <div class="list-row-meta">
            <span class="card-priority ${priorityClass}">${priorityLabel}</span>
            ${linkHTML}
          </div>
        </div>
        ${noteHTML}
      </div>
    </article>
  `;
}

// --- Hide expand button when note fits on one line ---
function updateExpandButtons() {
  document.querySelectorAll('.list-note-wrap').forEach(wrap => {
    const note = wrap.querySelector('.list-row-note');
    const btn  = wrap.querySelector('.list-expand-btn');
    if (!note || !btn) return;
    // scrollHeight > clientHeight means the text is actually clamped
    if (note.scrollHeight <= note.clientHeight + 2) {
      btn.style.display = 'none';
    }
  });
}

// --- OG Image Loading (via Microlink) ---
function fetchOGImage(url) {
  if (!imageFetches[url]) {
    imageFetches[url] = fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(d => d?.data?.image?.url || null)
      .catch(() => null);
  }
  return imageFetches[url];
}

function loadImages() {
  document.querySelectorAll('img[data-link]').forEach(async img => {
    const imageUrl = await fetchOGImage(img.dataset.link);
    if (!imageUrl) return;
    img.onload = () => {
      img.classList.add('loaded');
      img.closest('.card-image-wrap, .list-image-wrap')?.classList.add('has-image');
    };
    img.onerror = () => {};
    img.src = imageUrl;
  });
}

// --- CSV Download ---
function downloadCSV() {
  const headers = ['type', 'category', 'name', 'priority', 'link', 'tags', 'curator_note'];
  const rows = state.allRecs.map(rec => headers.map(col => {
    let val = rec[col] ?? '';
    if (Array.isArray(val)) val = val.join(', ');
    val = String(val);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      val = '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  }));

  const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'new-mom-recos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Icons ---
function getIcon(name) {
  const icons = { bag: '🛍', phone: '📱', star: '⭐' };
  return icons[name] || '';
}

// --- Escape helpers ---
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- Event: category pills (click active pill = deselect) ---
document.getElementById('category-pills').addEventListener('click', e => {
  const btn = e.target.closest('.category-pill');
  if (!btn) return;
  const cat = btn.dataset.cat;
  state.activeCategory = (cat === state.activeCategory) ? 'all' : cat;
  document.querySelectorAll('.category-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.cat === state.activeCategory);
  });
  renderCards();
});

// --- Event: view toggle ---
document.getElementById('view-toggle').addEventListener('click', e => {
  const btn = e.target.closest('.view-btn');
  if (!btn || btn.dataset.view === state.activeView) return;
  state.activeView = btn.dataset.view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));
  renderCards();
});

// --- Event: required only toggle ---
document.getElementById('btn-required-only').addEventListener('click', () => {
  state.requiredOnly = !state.requiredOnly;
  document.getElementById('btn-required-only').classList.toggle('active', state.requiredOnly);
  renderCards();
});

// --- Event: list row expand/collapse ---
document.getElementById('card-grid').addEventListener('click', e => {
  const btn = e.target.closest('.list-expand-btn');
  if (!btn) return;
  e.stopPropagation();
  const wrap      = btn.closest('.list-note-wrap');
  const expanded  = wrap.classList.toggle('expanded');
  btn.textContent = expanded ? 'less' : 'more';
});

// --- Boot ---
init();
