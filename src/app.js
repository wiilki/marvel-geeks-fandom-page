import { allItems, byKey, characters, comics, movies, featuredIds, findCharacter } from "./catalog.js";
import { syncComicsBrowser } from "./live-comics.js";
import { syncUniverseBrowser } from "./universe-browser.js";
import { portraitUrlsForCharacter } from "./character-images.js";
import { storyImageUrls } from "./story-images.js";
import { cardHighlights } from "./dossier-data.js";
import { buildCuratedDossier,enrichCuratedDossier } from "./dossier-view.js";

const $ = selector => document.querySelector(selector);
const storageKey = "marvel-geeks-favorites-v2";
const permittedTypes = new Set(["all", "characters", "comics", "movies"]);
const params = new URLSearchParams(location.search);
const initialType = params.get("type");
const state = {
  query: (params.get("q") || "").slice(0, 120),
  type: permittedTypes.has(initialType) ? initialType : "all",
  facet: "",
  sort: "featured",
  savedOnly: params.get("saved") === "1",
  favorites: readFavorites()
};
let lastFocused = null;
let lookupTimer = null;
let lookupAbort = null;
let lookupSerial = 0;
let externalRequestedQuery = "";
const dossierHistory = [];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}
function norm(value) {
  return String(value ?? "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
}
function keyFor(item) { return item.type + ":" + item.id; }
function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter(key => typeof key === "string" && byKey.has(key)) : []);
  } catch { return new Set(); }
}
function persistFavorites() {
  try { localStorage.setItem(storageKey, JSON.stringify([...state.favorites])); } catch {}
}
function setUrl() {
  const url = new URL(location.href);
  url.searchParams.delete("q");
  url.searchParams.delete("type");
  url.searchParams.delete("saved");
  if (state.query.trim()) url.searchParams.set("q", state.query.trim());
  if (state.type !== "all") url.searchParams.set("type", state.type);
  if (state.savedOnly) url.searchParams.set("saved", "1");
  history.replaceState(null, "", url.pathname + url.search + url.hash);
}
function searchableText(item) {
  const cast = (item.cast || []).map(id => findCharacter(id)?.name || id).join(" ");
  return norm([item.title,item.subtitle,item.summary,item.team,item.first,item.phase,item.era,item.year,
    ...(item.powers || []),cast].join(" "));
}
function currentItems() {
  let items = allItems.filter(item => {
    if (state.type !== "all" && item.type !== state.type) return false;
    if (state.savedOnly && !state.favorites.has(keyFor(item))) return false;
    if (state.facet && facetFor(item) !== state.facet) return false;
    if (state.query.trim() && !searchableText(item).includes(norm(state.query.trim()))) return false;
    return true;
  });
  if (state.sort === "az") items.sort((a,b) => a.title.localeCompare(b.title));
  if (state.sort === "new") items.sort((a,b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
  if (state.sort === "featured") items.sort((a,b) => {
    const left = featuredIds.indexOf(a.id), right = featuredIds.indexOf(b.id);
    if (left !== -1 || right !== -1) return (left === -1 ? 999 : left) - (right === -1 ? 999 : right);
    return 0;
  });
  return items;
}
function facetFor(item) {
  if (item.type === "characters") return item.team;
  if (item.type === "comics") return item.era;
  if (item.type === "movies") return item.phase;
  return "";
}
function art(item, size="") {
  const color = item.color || (item.type === "movies" ? "#d8a35c" : "#bd8bca");
  const tag = item.type === "characters" ? (item.mark || item.name.slice(0,2)) : item.type === "movies" ? "FILM" : "ISSUE";
  const label = item.type === "characters" ? item.name : (item.type === "movies" ? "MARVEL CINEMA" : "THE COMIC ARCHIVE");
  const images = item.type === "characters" ? portraitUrlsForCharacter(item.id) : storyImageUrls(item);
  const imageAlt = item.type === "characters" ? "Portrait of " + item.title :
    item.type === "movies" ? "Movie poster for " + item.title : "Comic cover for " + item.title;
  const image = images.length ?
    '<img class="cover-photo" src="' + escapeHtml(images[0]) +
    '" alt="' + (size === "cover-art--detail" ? escapeHtml(imageAlt) : "") +
    '" ' + (size === "cover-art--detail" ? 'fetchpriority="high"' : 'loading="lazy"') +
    ' decoding="async" referrerpolicy="no-referrer"' +
    (images[1] ? ' data-image-fallback="' + escapeHtml(images[1]) + '"' : '') + '>' : "";
  const isPoster = item.type !== "characters" && images.length;
  return '<div class="cover-art ' + escapeHtml(size) + (images.length ? ' cover-art--has-photo' : '') +
    (isPoster ? ' cover-art--poster' : '') + '" style="--cover:' + escapeHtml(color) + '">' +
    image + '<span class="cover-dots"></span><span class="cover-ring"></span><span class="cover-symbol">' +
    escapeHtml(tag) + '</span><span class="cover-kicker">' + escapeHtml(label) +
    '</span><span class="cover-slash" aria-hidden="true"></span></div>';
}
function icon(kind) {
  const paths = {
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    search:'<circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 5 5"/>'
  };
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + paths[kind] + '</svg>';
}
function itemCard(item,compact=false) {
  const key=keyFor(item),saved=state.favorites.has(key);
  const kind={characters:"Character",comics:"Comic",movies:"Film"}[item.type];
  const meta=item.type==="characters" ? item.team : item.year+" · "+kind;
  const highlights=cardHighlights(item).slice(0,compact?1:2);
  const quickfacts='<span class="card-quickfacts">'+highlights.map(text=>
    '<span class="card-quickfact">'+escapeHtml(text)+'</span>').join("")+'</span>';
  return '<article class="archive-card'+(compact?' archive-card--compact':'')+'">'+
    '<button class="card-open" type="button" data-open="'+escapeHtml(key)+'" aria-label="Explore the '+escapeHtml(kind.toLowerCase())+' dossier for '+escapeHtml(item.title)+'">'+
    art(item)+'<span class="card-body"><span class="eyebrow card-type">'+escapeHtml(kind)+
    ' <span class="tiny-dot"></span> '+escapeHtml(meta)+'</span><strong class="card-title">'+escapeHtml(item.title)+'</strong>'+
    '<span class="card-summary">'+escapeHtml(item.summary)+'</span>'+quickfacts+
    '<span class="card-explore">OPEN FULL DOSSIER '+icon("arrow")+'</span></span></button>'+
    '<button class="save-button'+(saved?' is-saved':'')+'" data-favorite="'+escapeHtml(key)+
    '" aria-pressed="'+saved+'" aria-label="'+(saved?"Remove ":"Save ")+escapeHtml(item.title)+(saved?" from":" to")+
    ' favorites" title="'+(saved?"Remove from":"Add to")+' favorites">'+icon("heart")+'</button></article>';
}
function renderFeatured() {
  $("#featuredGrid").innerHTML = featuredIds.map(id => characters.find(item => item.id === id)).filter(Boolean)
    .map(item => itemCard(byKey.get("characters:" + item.id),true)).join("");
}
function renderFacets() {
  const bar = $("#facetBar");
  if (state.type === "all") { bar.hidden = true; state.facet = ""; return; }
  bar.hidden = false;
  const values = [...new Set(allItems.filter(i => i.type === state.type).map(facetFor))].sort();
  if (state.facet && !values.includes(state.facet)) state.facet = "";
  bar.innerHTML = '<span class="facet-caption">REFINE</span><button class="facet-chip' + (!state.facet ? ' active' : '') +
    '" data-facet="" aria-pressed="' + (!state.facet) + '">All</button>' +
    values.map(value => '<button class="facet-chip' + (state.facet === value ? ' active' : '') +
    '" data-facet="' + escapeHtml(value) + '" aria-pressed="' + (state.facet === value) + '">' + escapeHtml(value) + '</button>').join("");
}
function render() {
  for (const btn of document.querySelectorAll("[data-type]")) {
    const active = btn.dataset.type === state.type;
    btn.classList.toggle("active",active);
    btn.setAttribute("aria-selected",String(active));
    btn.tabIndex = active ? 0 : -1;
  }
  renderFacets();
  const items = currentItems();
  $("#resultsGrid").innerHTML = items.map(item => itemCard(item)).join("");
  $("#resultsCount").textContent = items.length + " " + (items.length === 1 ? "result" : "results");
  const heading = state.savedOnly ? "Your saved archive" :
    state.query.trim() ? 'Results for “' + state.query.trim() + '”' :
    ({all:"The complete collection",characters:"Character dossiers",comics:"The comic archive",movies:"The cinematic universe"})[state.type];
  $("#resultsHeading").textContent = heading;
  $("#emptyState").hidden = items.length > 0;
  $("#resultsGrid").hidden = items.length === 0;
  $("#favoritesCount").textContent = state.favorites.size;
  $("#favoritesToggle").classList.toggle("active",state.savedOnly);
  $("#favoritesToggle").setAttribute("aria-pressed",String(state.savedOnly));
  $("#clearSearch").hidden = !state.query;
  $("#sortSelect").value = state.sort;
  setUrl();
  syncComicsBrowser({query:state.query,type:state.type,savedOnly:state.savedOnly});
  syncUniverseBrowser({query:state.query,type:state.type,savedOnly:state.savedOnly});
}
function openDetail(key,{fromHistory=false,refresh=false}={}) {
  const item=byKey.get(key);
  if (!item)return;
  const detailBody=$("#detailBody");
  const dialog=$("#detailDialog");
  const previous=detailBody.dataset.curatedKey;
  if (!refresh) {
    if (!fromHistory && dialog.open && previous && previous!==key) {
      dossierHistory.push(previous);
      if (dossierHistory.length>30)dossierHistory.shift();
    } else if (!dialog.open) dossierHistory.length=0;
  }
  // Mark the active entry *before* starting asynchronous metadata updates.
  detailBody.dataset.curatedKey=key;
  detailBody.innerHTML=buildCuratedDossier(item,{
    saved:state.favorites.has(key),art
  });
  const back=detailBody.querySelector("[data-dossier-back]");
  if (back)back.hidden=!dossierHistory.length;
  if (!dialog.open) {lastFocused=document.activeElement;dialog.showModal();}
  dialog.scrollTop=0;
  // The offline editorial narrative is already shown. Network enhancement is optional.
  void enrichCuratedDossier(item,{detailBody});
}
function backToDossier() {
  if (!dossierHistory.length)return;
  const key=dossierHistory.pop();
  openDetail(key,{fromHistory:true});
}
function closeDetail() { const dialog = $("#detailDialog"); if (dialog.open) dialog.close(); }
function toggleFavorite(key) {
  if (!byKey.has(key)) return;
  if (state.favorites.has(key)) state.favorites.delete(key); else state.favorites.add(key);
  persistFavorites();
  render();
  if ($("#detailDialog").open && $("#detailBody").dataset.curatedKey === key) openDetail(key,{refresh:true});
}
function keyForModal() {
  const button = $("#detailBody [data-favorite]");
  return button?.dataset.favorite || "";
}
function setType(type) {
  if (!permittedTypes.has(type)) return;
  state.type = type;
  state.facet = "";
  render();
}
function scheduleLiveLookup() {
  clearTimeout(lookupTimer);
  lookupAbort?.abort();
  const serial = ++lookupSerial;
  const term = state.query.trim();
  const box = $("#liveSection");
  $("#externalResearchSection").hidden = term.length < 3;
  if (term.length < 3 || externalRequestedQuery !== term) { box.hidden = true; return; }
  box.hidden = false;
  $("#liveStatus").textContent = "Checking Wikipedia for additional reading…";
  $("#liveResults").innerHTML = "";
  lookupTimer = setTimeout(async () => {
    lookupAbort = new AbortController();
    const endpoint = new URL("https://en.wikipedia.org/w/api.php");
    for (const [k,v] of Object.entries({
      action:"query",list:"search",srsearch:term + " Marvel",srnamespace:"0",srlimit:"5",format:"json",origin:"*"
    })) endpoint.searchParams.set(k,v);
    try {
      const res = await fetch(endpoint,{signal:lookupAbort.signal,credentials:"omit"});
      if (!res.ok) throw new Error("Lookup unavailable");
      const json = await res.json();
      if (serial !== lookupSerial) return;
      const results = Array.isArray(json?.query?.search) ? json.query.search : [];
      $("#liveStatus").textContent = results.length ? "Open encyclopedia references · External links" : "No encyclopedia matches found.";
      $("#liveResults").innerHTML = results.map(page => {
        const title = String(page.title || "");
        const url = "https://en.wikipedia.org/wiki/" + encodeURIComponent(title.replace(/ /g,"_"));
        return '<a class="wiki-result" href="' + url + '" target="_blank" rel="noopener noreferrer"><span>' +
          escapeHtml(title) + '</span><span>Wikipedia ↗</span></a>';
      }).join("");
    } catch (error) {
      if (error.name !== "AbortError" && serial === lookupSerial)
        $("#liveStatus").textContent = "Live references are unavailable. The built-in archive works offline.";
    }
  },600);
}

// External portraits may disappear. Try the other vetted API, then reveal the
// existing CSS artwork instead of leaving a broken-image icon.
document.addEventListener("error",event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const fallback = image.dataset.imageFallback;
  if (fallback && !image.dataset.fallbackTried) {
    image.dataset.fallbackTried = "true";
    image.removeAttribute("data-image-fallback");
    image.src = fallback;
    return;
  }
  image.hidden = true;
  image.closest(".cover-art--has-photo")?.classList.add("cover-art--image-failed");
},true);

document.addEventListener("click",event => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.open) { openDetail(target.dataset.open); return; }
  if (target.hasAttribute("data-dossier-back")) { backToDossier(); return; }
  if (target.dataset.favorite) { toggleFavorite(target.dataset.favorite); return; }
  if (target.dataset.type) { setType(target.dataset.type); return; }
  if (target.hasAttribute("data-facet")) { state.facet = target.dataset.facet; render(); return; }
  const action = target.dataset.action;
  if (action === "focus-search") { $("#searchInput").focus(); $("#discover").scrollIntoView({behavior:"smooth"}); }
  if (action === "lookup-external") { externalRequestedQuery = state.query.trim(); scheduleLiveLookup(); $("#liveSection").scrollIntoView({behavior:"smooth",block:"nearest"}); }
  if (action === "random") {
    const items = currentItems().length ? currentItems() : allItems;
    openDetail(keyFor(items[Math.floor(Math.random()*items.length)]));
  }
  if (action === "clear-search") {
    state.query = ""; $("#searchInput").value = ""; scheduleLiveLookup(); render(); $("#searchInput").focus();
  }
  if (action === "reset") {
    state.query = ""; state.type = "all"; state.facet = ""; state.savedOnly = false;
    $("#searchInput").value = ""; scheduleLiveLookup(); render();
  }
  if (action === "favorites") { state.savedOnly = !state.savedOnly; render(); $("#discover").scrollIntoView({behavior:"smooth"}); }
  if (action === "close-dialog") closeDetail();
});
$("#searchInput").addEventListener("input",event => {
  state.query = event.target.value.slice(0,120);
  if (event.target.value.length > 120) event.target.value = state.query;
  render();
  scheduleLiveLookup();
});
$("#sortSelect").addEventListener("change",event => { state.sort = event.target.value; render(); });
$("#detailDialog").addEventListener("click",event => {
  if (event.target === $("#detailDialog")) closeDetail();
});
$("#detailDialog").addEventListener("close",() => { dossierHistory.length=0;delete $("#detailBody").dataset.curatedKey;lastFocused?.focus?.();lastFocused=null; });
document.addEventListener("keydown",event => {
  if (event.key === "/" && !event.altKey && !event.ctrlKey && !event.metaKey &&
      !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "") && !$("#detailDialog").open) {
    event.preventDefault(); $("#searchInput").focus(); $("#discover").scrollIntoView({behavior:"smooth"});
  }
});
$("#searchInput").value = state.query;
$("#collectionCount").textContent = allItems.length;
renderFeatured();
render();
scheduleLiveLookup();
