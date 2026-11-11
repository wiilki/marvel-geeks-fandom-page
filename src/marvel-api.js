/**
 * Small, dependency-free client for the third-party Marvel Metadata API.
 * Source: https://github.com/emreparker/marvel-comics (MIT)
 *
 * This is a community-maintained comic ISSUE metadata API, not the official
 * Marvel developer API. No authentication, token or paid service is required.
 * It offers comic issues, series, creators, and official Marvel outbound links;
 * it does not supply movie listings or a full character directory.
 */
export const API_ORIGIN = "https://marvel.emreparker.com";
export const PAGE_SIZE = 18;
const MAX_RESULTS = 60;
const REQUEST_TIMEOUT_MS = 12000;
const cache = new Map();
const CACHE_TTL_MS = 4 * 60 * 1000;

function limitedText(raw, max = 2200) {
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}
function integerOrNull(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

/** A safe official Marvel comics destination, or null. */
export function officialComicUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "www.marvel.com" ||
        !url.pathname.startsWith("/comics/issue/")) return null;
    return url.href;
  } catch { return null; }
}

/** Only allow image URLs from the expected Marvel image CDN. */
export function coverImageUrl(cover) {
  if (!cover || typeof cover !== "object") return null;
  const path = limitedText(cover.path, 512).replace(/^http:\/\//, "https://");
  const ext = limitedText(cover.extension, 8).toLowerCase();
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) return null;
  try {
    const url = new URL(path + "." + ext);
    if (url.protocol !== "https:" || url.hostname !== "i.annihil.us") return null;
    return url.href;
  } catch { return null; }
}

/**
 * Normalization insulates the UI from malformed or evolving API response
 * shapes. API summaries use camelCase; detail has optional creators and cover.
 */
export function normalizeIssue(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = integerOrNull(raw.id);
  const title = limitedText(raw.title, 240);
  if (!id || !title) return null;
  const year = Number(raw.yearPage || (typeof raw.onSaleDate === "string" ? raw.onSaleDate.slice(0,4) : 0));
  return {
    id, title,
    issueNumber: limitedText(raw.issueNumber, 32),
    seriesName: limitedText(raw.seriesName || raw.series?.name, 180),
    seriesId: integerOrNull(raw.seriesId || raw.series?.id),
    year: Number.isInteger(year) && year >= 1939 && year <= 2100 ? year : null,
    date: limitedText(raw.onSaleDate || raw.dates?.on_sale, 12),
    description: limitedText(raw.description, 2500),
    pageCount: integerOrNull(raw.pageCount),
    url: officialComicUrl(raw.detailUrl || raw.detail_url),
    image: coverImageUrl(raw.cover),
    creators: Array.isArray(raw.creators) ? raw.creators.slice(0,60).map(entry => ({
      id: integerOrNull(entry?.id),
      name: limitedText(entry?.name, 90),
      role: limitedText(entry?.role, 60)
    })).filter(entry => entry.id && entry.name) : []
  };
}

function normalizedArray(value) {
  if (!Array.isArray(value)) throw new Error("The comics API returned an unexpected response.");
  const seen = new Set();
  return value.map(normalizeIssue).filter(item => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function normalizeIssueList(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid API response.");
  const items = normalizedArray(payload.items);
  return {
    items,
    total: Number.isFinite(payload.total) && payload.total >= 0 ? payload.total : null,
    count: items.length,
    hasNext: payload.has_next === true,
    offset: Number.isInteger(payload.offset) ? payload.offset : 0
  };
}
export function normalizeSearchResults(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid search response.");
  const items = normalizedArray(payload.items);
  return {items, count:items.length};
}

async function request(path, params = {}, {signal, fetchImpl = fetch} = {}) {
  const url = new URL(path, API_ORIGIN);
  for (const [key,value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key,String(value));
  }
  const cacheKey = url.href;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.data;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort",onAbort,{once:true});
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); },REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url.href, {
      method:"GET",
      mode:"cors",
      credentials:"omit",
      headers:{"Accept":"application/json"},
      signal:controller.signal
    });
    if (response.status === 429) throw new Error("The comics source is temporarily rate-limiting requests. Try again shortly.");
    if (!response.ok) throw new Error("The comics source returned HTTP " + response.status + ".");
    const data = await response.json();
    cache.set(cacheKey,{time:Date.now(),data});
    if (cache.size > 120) cache.delete(cache.keys().next().value);
    return data;
  } catch(error) {
    if (timedOut) throw new Error("The comics source timed out. You can still browse our offline archive.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort",onAbort);
  }
}

export async function fetchIssues({offset = 0, year = null, signal} = {}) {
  const safeOffset = Math.max(0,Math.trunc(offset)||0);
  const params = {limit:PAGE_SIZE,offset:safeOffset};
  if (Number.isInteger(year) && year >= 1939 && year <= 2100) params.year=year;
  return normalizeIssueList(await request("/v1/issues",params,{signal}));
}
export async function searchIssues(term,{signal}={}) {
  const query = limitedText(term,120);
  if (query.length < 2) return {items:[],count:0};
  return normalizeSearchResults(await request("/v1/search/issues",{q:query,limit:MAX_RESULTS},{signal}));
}
export async function fetchIssueDetail(id,{signal}={}) {
  const safeId = integerOrNull(id);
  if (!safeId) throw new Error("Invalid issue ID.");
  const issue = normalizeIssue(await request("/v1/issues/" + safeId,{}, {signal}));
  if (!issue) throw new Error("No comic metadata found for this issue.");
  return issue;
}
export async function fetchSeriesIssues(seriesId,{signal}={}) {
  const safeId = integerOrNull(seriesId);
  if (!safeId) throw new Error("Invalid series ID.");
  return normalizeIssueList(await request("/v1/series/" + safeId + "/issues",
    {limit:MAX_RESULTS,offset:0},{signal}));
}
export async function fetchCreatorIssues(creatorId,{signal}={}) {
  const safeId = integerOrNull(creatorId);
  if (!safeId) throw new Error("Invalid creator ID.");
  return normalizeIssueList(await request("/v1/creators/" + safeId + "/issues",
    {limit:MAX_RESULTS,offset:0},{signal}));
}
