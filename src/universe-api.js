/**
 * Free third-party data clients for Marvel Geeks, no credentials.
 * - MCUAPI (https://github.com/AugustoMarcelo/mcuapi): movies + screen characters.
 * - Superhero API (https://github.com/akabab/superhero-api): comic characters.
 *
 * Both return data, not licensed rights to Marvel's underlying IP or imagery.
 * Keep sources distinct: comics characters and screen characters may differ.
 */
export const MCU_ORIGIN = "https://mcuapi.up.railway.app";
export const MCU_MIRROR = "https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data";
export const HERO_ORIGIN = "https://akabab.github.io/superhero-api/api";
export const HERO_MIRROR = "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api";
const TIMEOUT_MS = 11000;
const MAX_RECORDS = 1000;
const CACHE_MS = 15 * 60 * 1000;
const memory = new Map();
const inFlight = new Map();

const limitText = (value, max = 300) => typeof value === "string" ? value.trim().slice(0,max) : "";
const positiveId = value => Number.isSafeInteger(value) && value > 0 ? value : null;
const permittedTypes = new Set(["movies","screen","comics"]);

export function safeImageUrl(value) {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.hostname === "res.cloudinary.com" && url.pathname.startsWith("/augustomarcelo/")) return url.href;
    if (url.hostname === "image.tmdb.org" && url.pathname.startsWith("/t/p/")) return url.href;
    if (url.hostname === "cdn.jsdelivr.net" && url.pathname.startsWith("/gh/akabab/superhero-api@0.3.0/api/images/")) return url.href;
    return null;
  } catch { return null; }
}
export function safeImdbUrl(value) {
  return typeof value === "string" && /^tt\d{6,12}$/.test(value) ?
    "https://www.imdb.com/title/" + value + "/" : null;
}
export function normalizeMovie(row) {
  if (!row || typeof row !== "object" || !positiveId(row.id)) return null;
  const title = limitText(row.title,200);
  if (!title) return null;
  const date = /^\d{4}-\d\d-\d\d$/.test(row.release_date || "") ? row.release_date : null;
  const phase = Number.isInteger(row.phase) && row.phase > 0 && row.phase <= 20 ? row.phase : null;
  return {
    key:"movies:" + row.id, id:row.id,kind:"movies",title,
    subtitle:date ? date.slice(0,4) : "Date unannounced",
    description:limitText(row.overview,1800),date,year:date ? Number(date.slice(0,4)) : null,
    phase,saga:limitText(row.saga,100),studio:limitText(row.studio,100),
    continuity:limitText(row.continuity,100),designation:limitText(row.multiverse_designation,100),
    director:limitText(row.directed_by,160),runtime:Number.isInteger(row.duration) && row.duration > 0 ? row.duration : null,
    postCredits:Number.isInteger(row.post_credit_scenes) && row.post_credit_scenes >= 0 ? row.post_credit_scenes : null,
    image:safeImageUrl(row.cover_url),
    link:safeImdbUrl(row.imdb_id),isMcu:row.is_mcu === true
  };
}
export function normalizeScreenCharacter(row) {
  if (!row || typeof row !== "object" || !positiveId(row.id)) return null;
  const name = limitText(row.name,160);
  if (!name) return null;
  const alias = limitText(row.alias,160);
  return {
    key:"screen:" + row.id,id:row.id,kind:"screen",title:alias || name,
    subtitle:name,description:limitText(row.description,1800),alias,
    actor:limitText(row.played_by,200),continuity:limitText(row.continuity,100),
    designation:limitText(row.multiverse_designation,100),
    firstMovie:positiveId(row.first_appearance_movie_id),
    image:safeImageUrl(row.image_url),link:null
  };
}
export function normalizeComicHero(row) {
  if (!row || typeof row !== "object" || !positiveId(row.id)) return null;
  const publisher = limitText(row.biography?.publisher,100);
  if (publisher !== "Marvel Comics") return null;
  const name = limitText(row.name,160);
  if (!name) return null;
  const fullName = limitText(row.biography?.fullName,160);
  const stats = {};
  for (const key of ["intelligence","strength","speed","durability","power","combat"]) {
    const value = row.powerstats?.[key];
    if (Number.isFinite(value) && value >= 0 && value <= 100) stats[key] = value;
  }
  return {
    key:"comics:" + row.id,id:row.id,kind:"comics",title:name,
    subtitle:fullName || "Marvel Comics",description:limitText(row.connections?.groupAffiliation,900),
    first:limitText(row.biography?.firstAppearance,200),
    alignment:limitText(row.biography?.alignment,50),
    aliases:Array.isArray(row.biography?.aliases) ? row.biography.aliases.slice(0,10).map(x=>limitText(x,90)).filter(Boolean) : [],
    image:safeImageUrl(row.images?.md),stats, publisher,link:null
  };
}
const normalizer = {movies:normalizeMovie,screen:normalizeScreenCharacter,comics:normalizeComicHero};
export function normalizeCollection(kind,records) {
  if (!permittedTypes.has(kind) || !Array.isArray(records)) throw new Error("Unexpected character/movie response.");
  const seen = new Set();
  return records.slice(0,MAX_RECORDS).map(normalizer[kind]).filter(item=>{
    if (!item || seen.has(item.key)) return false;
    seen.add(item.key);return true;
  });
}
async function fetchJson(url,{fetchImpl=fetch}={}) {
  const ctrl = new AbortController();
  const timeout = setTimeout(()=>ctrl.abort(),TIMEOUT_MS);
  try {
    const response = await fetchImpl(url,{method:"GET",mode:"cors",credentials:"omit",headers:{Accept:"application/json"},signal:ctrl.signal});
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    return data;
  } finally {clearTimeout(timeout);}
}
async function loadMCU(kind,{fetchImpl=fetch}={}) {
  const endpoint = kind === "movies" ? "movies" : "characters";
  try {
    const first = await fetchJson(MCU_ORIGIN + "/api/v1/" + endpoint + "?page=1&limit=100",{fetchImpl});
    if (!Array.isArray(first.data) || !Number.isInteger(first.total) || first.total < 1 ||
      first.total > MAX_RECORDS) throw new Error("Unexpected MCU list response.");
    const pages = Math.ceil(first.total/100);
    const others = await Promise.all(Array.from({length:pages-1},(_,index)=>
      fetchJson(MCU_ORIGIN + "/api/v1/" + endpoint + "?page=" + (index+2) + "&limit=100",{fetchImpl})
    ));
    const raw = [...first.data,...others.flatMap(page=>{
      if (!Array.isArray(page.data)) throw new Error("Unexpected MCU page response.");
      return page.data;
    })];
    const items = normalizeCollection(kind,raw);
    if (items.length === 0 || raw.length < first.total) throw new Error("Incomplete MCU response.");
    return {items,source:"Live MCUAPI",asOf:null};
  } catch(liveError) {
    const snapshot = await fetchJson(MCU_MIRROR + "/" + endpoint + ".json",{fetchImpl});
    const items = normalizeCollection(kind,snapshot);
    if (!items.length) throw new Error("No valid MCU records found in the static mirror.");
    return {items,source:"MCUAPI CDN snapshot",asOf:null};
  }
}
async function loadComicHeroes({fetchImpl=fetch}={}) {
  let data;
  let source = "Superhero API";
  try {data = await fetchJson(HERO_ORIGIN + "/all.json",{fetchImpl});}
  catch {
    data = await fetchJson(HERO_MIRROR + "/all.json",{fetchImpl});
    source = "Superhero API CDN snapshot";
  }
  const items=normalizeCollection("comics",data);
  if (!items.length) throw new Error("No valid Marvel Comics character entries found.");
  return {items,source,asOf:null};
}
/** All entries in one category; in-memory cached so typing does not refetch. */
export async function loadUniverse(kind,{fetchImpl}={}) {
  if (!permittedTypes.has(kind)) throw new Error("Unknown category.");
  const cached=memory.get(kind);
  if (cached && Date.now()-cached.time<CACHE_MS) return cached.value;
  if (!fetchImpl && inFlight.has(kind)) return inFlight.get(kind);
  const promise=(kind==="comics" ? loadComicHeroes({fetchImpl}) : loadMCU(kind,{fetchImpl}))
    .then(value=>{if(!fetchImpl)memory.set(kind,{time:Date.now(),value});return value;})
    .finally(()=>{if(!fetchImpl)inFlight.delete(kind);});
  if (!fetchImpl)inFlight.set(kind,promise);
  return promise;
}
export function filterUniverse(items,query,sort="featured",scope="all") {
  const needle=limitText(query,120).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
  let filtered=items.filter(item => {
    if (scope==="mcu" && item.kind==="movies" && !item.isMcu) return false;
    if (scope==="heroes" && item.kind==="comics" && item.alignment!=="good") return false;
    if (scope==="villains" && item.kind==="comics" && item.alignment!=="bad") return false;
    return !needle || [item.title,item.subtitle,item.description,item.alias,item.actor,item.director,item.saga,item.studio,
      item.year,item.first,...(item.aliases||[])].filter(Boolean).join(" ").toLowerCase().normalize("NFKD")
      .replace(/[\u0300-\u036f]/g,"").includes(needle);
  });
  if (sort==="az") filtered.sort((a,b)=>a.title.localeCompare(b.title));
  if (sort==="new") filtered.sort((a,b)=>(b.year||0)-(a.year||0)||a.title.localeCompare(b.title));
  if (sort==="old") filtered.sort((a,b)=>(a.year||9999)-(b.year||9999)||a.title.localeCompare(b.title));
  return filtered;
}
/** Related MCU films or characters; optional when the live provider is down. */
export async function loadUniverseRelations(item,{fetchImpl}={}) {
  if (!item || !positiveId(item.id) || !["movies","screen"].includes(item.kind)) return [];
  const path = item.kind==="movies" ?
    "/api/v1/characters/movie/" + item.id :
    "/api/v1/characters/" + item.id + "/movies";
  const payload = await fetchJson(MCU_ORIGIN + path,{fetchImpl});
  // Relation endpoints return arrays (not paginated).
  return normalizeCollection(item.kind==="movies"?"screen":"movies",payload);
}
export function clearUniverseCacheForTests() {memory.clear();inFlight.clear();}
