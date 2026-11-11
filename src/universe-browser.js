import {loadUniverse,filterUniverse,loadUniverseRelations,safeImageUrl,safeImdbUrl} from "./universe-api.js";

/** Expanded MCU movie/character search and Marvel Comics character archive. */
const $ = selector => document.querySelector(selector);
const section = $("#universeSection");
const grid = $("#universeResults");
const status = $("#universeStatus");
const heading = $("#universeHeading");
const scopeSelect = $("#universeScope");
const sortSelect = $("#universeSort");
const savedButton = $("#universeSaved");
const moreButton = $("#universeMore");
const retryButton = $("#universeRetry");
const dialog = $("#detailDialog");
const detailBody = $("#detailBody");
const FAVORITES_KEY = "marvel-geeks-expanded-favorites-v1";
const PAGE_SIZE = 24;
const KINDS = new Set(["movies","screen","comics"]);
let context = {query:"",type:"all",savedOnly:false};
let kind = "movies",scope = "all",sort = "featured",savedOnly = false;
let loaded = null,loadedKind = null;
let filtered = [];
let shown = PAGE_SIZE;
let serial = 0, relationSerial = 0;
const relationMap = new Map();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}
function compactItem(item) {
  return {
    key:item.key,id:item.id,kind:item.kind,title:item.title,subtitle:item.subtitle,
    description:item.description || "",image:safeImageUrl(item.image),
    year:item.year || null,phase:item.phase || null,saga:item.saga || "",
    actor:item.actor || "",alias:item.alias || "",director:item.director || "",
    link:safeImdbUrl(item.link?.match(/tt\d+/)?.[0]),first:item.first || "",
    stats:Object.fromEntries(Object.entries(item.stats || {}).filter(([name,value])=>
      ["intelligence","strength","speed","durability","power","combat"].includes(name) &&
      Number.isFinite(value) && value>=0 && value<=100)),
    publisher:item.publisher || "",alignment:item.alignment || "",
    continuity:item.continuity || "",designation:item.designation || "",
    date:item.date || null,runtime:item.runtime || null,studio:item.studio || "",postCredits:item.postCredits ?? null,
    isMcu:item.isMcu===true
  };
}
function readSaved() {
  try {
    const rows=JSON.parse(localStorage.getItem(FAVORITES_KEY)||"[]");
    if (!Array.isArray(rows)) return new Map();
    const map=new Map();
    for (const row of rows.slice(0,120)) {
      if (!row || !KINDS.has(row.kind) || !Number.isSafeInteger(row.id) || row.id<1 ||
          row.key!==row.kind+":"+row.id || typeof row.title!=="string" ||
          row.title.length===0 || row.title.length>200) continue;
      map.set(row.key,compactItem(row));
    }
    return map;
  } catch {return new Map();}
}
const saved = readSaved();
function persist() {
  try {localStorage.setItem(FAVORITES_KEY,JSON.stringify([...saved.values()]));} catch {}
}
function availableKinds() {
  return context.type==="movies" ? ["movies"] : context.type==="characters" ? ["screen","comics"] :
    ["movies","screen","comics"];
}
function modeName(value) {
  return ({movies:"Marvel films",screen:"MCU screen characters",comics:"Comic-book heroes & villains"})[value];
}
function updateTabs() {
  for (const button of section.querySelectorAll("[data-u-kind]")) {
    const available=availableKinds().includes(button.dataset.uKind);
    button.hidden=!available;
    const selected=button.dataset.uKind===kind;
    button.classList.toggle("active",selected);
    button.setAttribute("aria-pressed",String(selected));
  }
}
function updateScope() {
  const options=kind==="movies" ?
    [["all","All Marvel films"],["mcu","MCU only"]] :
    kind==="comics" ?
    [["all","All Marvel characters"],["heroes","Heroes"],["villains","Villains"]] :
    [["all","All continuities"]];
  if (!options.some(entry=>entry[0]===scope)) scope="all";
  scopeSelect.innerHTML=options.map(([value,label])=>'<option value="'+value+'">'+escapeHtml(label)+'</option>').join("");
  scopeSelect.value=scope;
}
function refreshText() {
  heading.textContent=(savedOnly ? "Saved " : "") + modeName(kind);
  savedButton.setAttribute("aria-pressed",String(savedOnly));
  savedButton.classList.toggle("active",savedOnly);
  $("#universeSavedCount").textContent=saved.size;
  sortSelect.value=sort;
}
function sortedResults() {
  const rows=savedOnly ? [...saved.values()].filter(item=>item.kind===kind) : (loaded?.items || []);
  return filterUniverse(rows,context.query,sort,scope);
}
function card(item) {
  const favorited=saved.has(item.key);
  const detail=item.kind==="movies" ?
    (item.year || "Date TBA") + (item.phase ? " · Phase " + item.phase : "") :
    item.kind==="screen" ? (item.actor || item.subtitle) :
    (item.subtitle || "Marvel Comics");
  const thumb=item.image ?
    '<img src="'+escapeHtml(item.image)+'" alt="" loading="lazy" referrerpolicy="no-referrer">' :
    '<span class="universe-art-mark" aria-hidden="true">'+escapeHtml(item.title.slice(0,2).toUpperCase())+'</span>';
  return '<article class="universe-card"><button type="button" class="universe-open" data-u-open="'+escapeHtml(item.key)+
    '" aria-label="View '+escapeHtml(item.title)+' details"><div class="universe-art">'+thumb+
    '<span class="universe-art-label">'+(item.kind==="movies"?"FILM":item.kind==="screen"?"ON SCREEN":"COMICS")+
    '</span></div><div class="universe-card-copy"><span class="eyebrow">'+escapeHtml(detail)+
    '</span><strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml((item.description || item.subtitle || "Open for more information.").slice(0,175))+
    '</p><span class="universe-card-link">EXPLORE DOSSIER ↗</span></div></button>'+
    '<button type="button" class="universe-heart'+(favorited?" is-saved":"")+
    '" data-u-save="'+escapeHtml(item.key)+'" aria-pressed="'+favorited+
    '" aria-label="'+(favorited?"Remove ":"Save ")+escapeHtml(item.title)+(favorited?" from":" to")+' expanded favorites">♥</button></article>';
}
function render() {
  refreshText();
  updateTabs();
  filtered=sortedResults();
  grid.innerHTML=filtered.slice(0,shown).map(card).join("");
  grid.hidden=filtered.length===0;
  const hasRows=filtered.length>0;
  $("#universeEmpty").hidden=hasRows;
  if (!hasRows) $("#universeEmptyCopy").textContent=savedOnly ?
    "No saved matches in this category. Open an entry and save it with the heart." :
    context.query.trim() ? "No matching entries from this source. Try another title or name." :
    "No entries returned for these filters.";
  moreButton.hidden=shown>=filtered.length;
  moreButton.textContent="SHOW MORE ("+Math.max(0,filtered.length-shown)+" LEFT)";
  status.textContent=filtered.length+" "+(filtered.length===1?"entry":"entries")+" in "+modeName(kind)+
    (savedOnly?" · saved on this device":loaded ? " · "+loaded.source:"")+".";
}
function setError(error) {
  grid.hidden=true;
  moreButton.hidden=true;
  $("#universeEmpty").hidden=false;
  $("#universeEmptyCopy").textContent="This third-party service is unavailable. Your built-in Marvel archive above still works. You can retry or select another category.";
  retryButton.hidden=false;
  status.textContent="Unable to load "+modeName(kind)+" · "+String(error?.message||"network error").slice(0,160);
  section.removeAttribute("aria-busy");
}
async function refreshData() {
  const token=++serial;
  refreshText();updateTabs();updateScope();
  shown=PAGE_SIZE;
  if (savedOnly) {
    loaded=null;loadedKind=null;
    section.removeAttribute("aria-busy");
    retryButton.hidden=true;
    render();return;
  }
  if (loadedKind===kind && loaded) {render();return;}
  loaded=null;loadedKind=null;
  grid.hidden=true;
  $("#universeEmpty").hidden=true;
  moreButton.hidden=true;
  retryButton.hidden=true;
  status.textContent="Loading "+modeName(kind)+" from a public data provider…";
  section.setAttribute("aria-busy","true");
  try {
    const result=await loadUniverse(kind);
    if (token!==serial || section.hidden) return;
    loaded=result;loadedKind=kind;
    section.removeAttribute("aria-busy");
    render();
  } catch(error) {
    if (token===serial && !section.hidden) setError(error);
  }
}
/** Called whenever the existing global archive search or category changes. */
export function syncUniverseBrowser(nextContext) {
  const oldType=context.type;
  context={
    query:String(nextContext?.query||"").slice(0,120),
    type:nextContext?.type||"all",savedOnly:Boolean(nextContext?.savedOnly)
  };
  const visible=context.type!=="comics" && !context.savedOnly;
  section.hidden=!visible;
  if (!visible) {++serial;return;}
  const choices=availableKinds();
  if (!choices.includes(kind)) {
    kind=choices[0];scope="all";loaded=null;loadedKind=null;
  } else if (oldType!==context.type && context.type==="movies") {
    kind="movies";scope="all";loaded=null;loadedKind=null;
  }
  if (savedOnly) {
    refreshText();render();return;
  }
  if (loaded && loadedKind===kind) {
    shown=PAGE_SIZE;render();return;
  }
  // Reuses an in-flight fetch when typing quickly (loadUniverse caches promises).
  if (section.getAttribute("aria-busy")==="true" && loadedKind===null) {
    // A pending operation may be under the wrong kind; token ensures only latest wins.
    refreshData();return;
  }
  refreshData();
}
function lookup(key) {
  return (loaded?.items || []).find(item=>item.key===key) ||
    relationMap.get(key) || saved.get(key) || null;
}
function setSavedButton(key) {
  const button=detailBody.querySelector("[data-u-save]");
  if (button) {
    button.textContent=saved.has(key)?"♥ Saved":"♡ Save favorite";
    button.setAttribute("aria-pressed",String(saved.has(key)));
  }
}
function toggleSaved(key) {
  const item=lookup(key);
  if (!item)return;
  if (saved.has(key))saved.delete(key);
  else {
    if (saved.size>=120)saved.delete(saved.keys().next().value);
    saved.set(key,compactItem(item));
  }
  persist();
  render();
  if (dialog.open && detailBody.dataset.universeKey===key) setSavedButton(key);
}
function fact(name,value) {
  return value===undefined || value===null || value==="" ? "" :
    '<div><dt>'+escapeHtml(name)+'</dt><dd>'+escapeHtml(value)+'</dd></div>';
}
function statsMarkup(item) {
  if (item.kind!=="comics")return "";
  const stats=Object.entries(item.stats||{});
  if (!stats.length)return "";
  return '<div class="detail-section"><h3>COMMUNITY POWER RATINGS</h3><div class="universe-stats">'+
    stats.map(([label,value])=>'<div class="universe-stat"><span>'+escapeHtml(label)+'</span>'+
      '<div class="universe-stat-track"><span style="width:'+value+'%"></span></div><strong>'+value+'</strong></div>').join("")+
    '</div><p class="universe-fineprint">These ratings are subjective, fan-maintained estimates, not official measurements.</p></div>';
}
function showDetail(item) {
  detailBody.dataset.universeKey=item.key;
  const kindTitle=modeName(item.kind);
  const picture=item.image ?
    '<img src="'+escapeHtml(item.image)+'" alt="" referrerpolicy="no-referrer">' :
    '<span class="universe-detail-placeholder">'+escapeHtml(item.title.slice(0,2).toUpperCase())+'</span>';
  const facts=item.kind==="movies" ?
    fact("Release",item.date || item.year || "Unannounced")+
    fact("Director",item.director)+fact("Runtime",item.runtime ? item.runtime+" minutes":null)+
    fact("Phase",item.phase ? "Phase "+item.phase:null)+fact("Saga",item.saga)+
    fact("Continuity",item.continuity)+fact("Studio",item.studio) :
    item.kind==="screen" ?
    fact("Identity",item.subtitle)+fact("Played by",item.actor)+fact("Continuity",item.continuity)+
    fact("Universe",item.designation) :
    fact("Full name",item.subtitle)+fact("First appearance",item.first)+
    fact("Alignment",item.alignment)+fact("Publisher",item.publisher);
  const external=item.kind==="movies"&&item.link ?
    '<a class="button button--outline" href="'+escapeHtml(item.link)+'" target="_blank" rel="noopener noreferrer">IMDb ENTRY ↗</a>' : "";
  const related=item.kind!=="comics" ?
    '<div class="detail-section"><h3>CONNECTIONS</h3><button type="button" class="button button--outline" data-u-relate="'+
    escapeHtml(item.key)+'">SHOW '+(item.kind==="movies"?"APPEARING CHARACTERS":"RELATED FILMS")+
    ' ↗</button><div id="universeRelations" class="universe-relations" role="status"></div></div>' : "";
  detailBody.innerHTML='<div class="detail-layout universe-detail"><div class="universe-detail-art">'+picture+
    '</div><div class="detail-copy"><span class="eyebrow">EXPANDED UNIVERSE / '+
    escapeHtml(kindTitle.toUpperCase())+'</span><h2 id="detailTitle">'+escapeHtml(item.title)+
    '</h2><p class="detail-lede">'+escapeHtml(item.description || item.subtitle || "No summary provided by the data source.")+
    '</p><dl class="fact-grid">'+facts+'</dl>'+statsMarkup(item)+related+
    '<div class="detail-actions"><button type="button" class="button button--primary" data-u-save="'+escapeHtml(item.key)+
    '" aria-pressed="'+saved.has(item.key)+'">'+(saved.has(item.key)?"♥ Saved":"♡ Save favorite")+
    '</button>'+external+'</div><p class="universe-fineprint">Third-party fan metadata, not official Marvel or Disney data. Images and related marks remain the property of their owners.</p></div></div>';
}
function openDetail(key) {
  const item=lookup(key);
  if (!item)return;
  ++relationSerial;
  showDetail(item);
  if(!dialog.open)dialog.showModal();
}
async function showRelations(key) {
  const item=lookup(key);
  if (!item || !["movies","screen"].includes(item.kind))return;
  const container=$("#universeRelations");
  if (!container)return;
  const token=++relationSerial;
  container.textContent="Loading connections from MCUAPI…";
  try {
    const rows=await loadUniverseRelations(item);
    if (token!==relationSerial || !dialog.open || detailBody.dataset.universeKey!==key)return;
    container.innerHTML=rows.length ?
      rows.slice(0,36).map(row=>{
        relationMap.set(row.key,row);
        return '<button type="button" class="universe-relation-link" data-u-open="'+escapeHtml(row.key)+
          '">'+escapeHtml(row.title)+' <span>↗</span></button>';
      }).join("") : '<p>No connections listed by this source.</p>';
  } catch {
    if (token===relationSerial && container) container.textContent=
      "Live connections are temporarily unavailable. Other archive features still work.";
  }
}
document.addEventListener("click",event=>{
  const button=event.target.closest("button");
  if(!button)return;
  if(button.dataset.uKind){
    if(!KINDS.has(button.dataset.uKind))return;
    kind=button.dataset.uKind;scope="all";savedOnly=false;loaded=null;loadedKind=null;
    refreshData();return;
  }
  if(button.dataset.uOpen){openDetail(button.dataset.uOpen);return;}
  if(button.dataset.uSave){toggleSaved(button.dataset.uSave);return;}
  if(button.dataset.uRelate){showRelations(button.dataset.uRelate);return;}
});
scopeSelect.addEventListener("change",()=>{
  scope=scopeSelect.value;shown=PAGE_SIZE;render();
});
sortSelect.addEventListener("change",()=>{sort=sortSelect.value;shown=PAGE_SIZE;render();});
savedButton.addEventListener("click",()=>{savedOnly=!savedOnly;loaded=null;loadedKind=null;refreshData();});
moreButton.addEventListener("click",()=>{shown+=PAGE_SIZE;render();});
retryButton.addEventListener("click",()=>{loaded=null;loadedKind=null;refreshData();});
dialog.addEventListener("close",()=>{++relationSerial;delete detailBody.dataset.universeKey;});
refreshText();
