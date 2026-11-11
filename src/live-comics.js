import {
  fetchIssues,searchIssues,fetchIssueDetail,fetchSeriesIssues,fetchCreatorIssues,
  API_ORIGIN
} from "./marvel-api.js";

/**
 * UI for the optional, independent live comic metadata index.
 * It never replaces the site's original offline editorial collection.
 */
const $ = selector => document.querySelector(selector);
const box = $("#marvelLiveSection");
const heading = $("#apiResultsHeading");
const subheading = $("#apiSourceDescription");
const status = $("#apiStatus");
const grid = $("#apiResults");
const more = $("#apiLoadMore");
const savedToggle = $("#apiSavedToggle");
const savedCount = $("#apiSavedCount");
const back = $("#apiBack");
const dialog = $("#detailDialog");
const detailBody = $("#detailBody");
const FAVORITES_KEY = "marvel-geeks-unofficial-comics-v1";
const BOOKMARK_LIMIT = 200;
let context = { query:"", type:"all", savedOnly:false };
let currentKey = "";
let currentList = [];
let savedMode = false;
let currentPage = 0;
let hasMore = false;
let currentView = null;
let requestTimer = null;
let active = null;
let serial = 0;
let detailSerial = 0;
let priorFocus = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}
function readBookmarks() {
  try {
    const rows = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    if (!Array.isArray(rows)) return new Map();
    return new Map(rows.slice(0,BOOKMARK_LIMIT).filter(row =>
      Number.isSafeInteger(row?.id) && row.id > 0 && typeof row.title === "string" &&
      row.title.length > 0 && row.title.length <= 240).map(row => [row.id,row]));
  } catch { return new Map(); }
}
const bookmarks = readBookmarks();
function persist() {
  try { localStorage.setItem(FAVORITES_KEY,JSON.stringify([...bookmarks.values()])); } catch {}
}
function bookmarkIssue(issue) {
  if (!issue || !Number.isSafeInteger(issue.id)) return;
  if (bookmarks.has(issue.id)) bookmarks.delete(issue.id);
  else {
    if (bookmarks.size >= BOOKMARK_LIMIT) bookmarks.delete(bookmarks.keys().next().value);
    bookmarks.set(issue.id,{
      id:issue.id,title:String(issue.title).slice(0,240),
      year:issue.year || null,seriesName:String(issue.seriesName || "").slice(0,180)
    });
  }
  persist();
  renderCards();
  updateBookmarkLabel();
  if (dialog.open && detailBody.dataset.apiId === String(issue.id)) {
    const button = detailBody.querySelector("[data-api-bookmark]");
    if (button) {
      button.textContent = bookmarks.has(issue.id) ? "♥ Saved issue" : "♡ Save issue";
      button.setAttribute("aria-pressed",String(bookmarks.has(issue.id)));
    }
  }
}
function updateBookmarkLabel() {
  savedCount.textContent = bookmarks.size;
  savedToggle.setAttribute("aria-pressed",String(savedMode));
  savedToggle.classList.toggle("active",savedMode);
}
function renderCards() {
  const unique = new Set();
  const items = currentList.filter(issue => {
    if (!issue || !Number.isSafeInteger(issue.id) || unique.has(issue.id)) return false;
    unique.add(issue.id);
    return true;
  });
  grid.innerHTML = items.map(issue => {
    const issueId = issue.id;
    const favorited = bookmarks.has(issueId);
    const year = issue.year ? String(issue.year) : "Year unknown";
    return '<article class="api-issue-card">' +
      '<button type="button" class="api-issue-open" data-api-open="' + issueId +
      '" aria-label="Open comic ' + escapeHtml(issue.title) + '">' +
      '<div class="api-issue-cover" aria-hidden="true"><span>MARVEL</span><strong>COMICS</strong>' +
      '<small>ISSUE #' + escapeHtml(issue.issueNumber || String(issueId)) + '</small></div>' +
      '<div class="api-issue-text"><span class="eyebrow">COMIC METADATA · ' + escapeHtml(year) + '</span>' +
      '<strong>' + escapeHtml(issue.title) + '</strong><p>' +
      escapeHtml(issue.seriesName || "Marvel Comics issue") +
      '</p><span class="api-more-link">ISSUE DETAILS ↗</span></div></button>' +
      '<button type="button" class="api-issue-save' + (favorited ? ' is-saved' : '') +
      '" data-api-bookmark="' + issueId + '" aria-pressed="' + favorited +
      '" aria-label="' + (favorited ? "Remove" : "Save") + " " + escapeHtml(issue.title) + '">♥</button></article>';
  }).join("");
  grid.hidden = items.length === 0;
  $("#apiEmpty").hidden = items.length > 0;
  if (!items.length) $("#apiEmptyText").textContent = savedMode ?
    "No saved comics yet. Browse the index and use ♥ to bookmark an issue." :
    "No matching comic issues were returned by this source.";
  more.hidden = !hasMore || savedMode || Boolean(currentView);
  updateBookmarkLabel();
}
function setLoading(message) {
  status.textContent = message;
  grid.hidden = true;
  $("#apiEmpty").hidden = true;
  more.hidden = true;
  box.setAttribute("aria-busy","true");
}
function finishLoading() { box.removeAttribute("aria-busy"); }
function cancelRequest() {
  if (requestTimer) clearTimeout(requestTimer);
  requestTimer = null;
  active?.abort();
  active = null;
  serial++;
}
function friendlyError(error) {
  const message = String(error?.message || "");
  if (/rate.limit/i.test(message)) return message;
  if (/timed out/i.test(message)) return message;
  if (/HTTP 5\d\d/i.test(message)) return "The community API is temporarily unavailable.";
  if (/HTTP 4\d\d/i.test(message)) return "The community API could not process this request.";
  return "Could not reach the community comics API. Your built-in Marvel archive is still available.";
}
function listKey() {
  if (savedMode) return "saved";
  if (currentView) return currentView.kind + ":" + currentView.id;
  return context.query.trim().length >= 2 ? "q:" + context.query.trim().toLowerCase() : "browse";
}
function setViewHeading() {
  if (savedMode) {
    heading.textContent = "Your bookmarked comics";
    subheading.textContent = "Saved in this browser; no account needed.";
  } else if (currentView) {
    heading.textContent = currentView.title;
    subheading.textContent = "Related comics from the community metadata API.";
  } else if (context.query.trim().length >= 2) {
    heading.textContent = "Comic issues matching “" + context.query.trim() + "”";
    subheading.textContent = "Live comic issue titles, separate from the starter collection above.";
  } else {
    heading.textContent = "Explore the comic index";
    subheading.textContent = "Browse the third-party issue catalog. Select a title for more details.";
  }
  back.hidden = !currentView;
}
export function syncComicsBrowser(nextContext) {
  context = {
    query:String(nextContext?.query || "").slice(0,120),
    type:nextContext?.type || "all",
    savedOnly: Boolean(nextContext?.savedOnly)
  };
  const show = (context.type === "all" || context.type === "comics") && !context.savedOnly;
  box.hidden = !show;
  if (!show) { cancelRequest(); currentKey = ""; return; }
  if (currentView && currentView.parentQuery !== context.query.trim()) currentView = null;
  // Typing a new query leaves the bookmark-only view automatically.
  if (savedMode && context.query.trim().length >= 2) savedMode = false;
  const key = listKey();
  if (key === currentKey) return;
  currentKey = key;
  cancelRequest();
  currentList = [];
  currentPage = 0;
  hasMore = false;
  setViewHeading();
  if (savedMode) {
    currentList = [...bookmarks.values()].reverse();
    status.textContent = currentList.length + " saved " + (currentList.length === 1 ? "issue" : "issues") + ".";
    finishLoading();renderCards();return;
  }
  setLoading("Loading comic issue metadata…");
  requestTimer = setTimeout(() => loadFirstPage(),context.query.trim().length >= 2 ? 700 : 0);
}
async function loadFirstPage() {
  const token = ++serial;
  const controller = new AbortController();
  active = controller;
  try {
    const result = currentView?.kind === "series" ?
      await fetchSeriesIssues(currentView.id,{signal:controller.signal}) :
      currentView?.kind === "creator" ?
      await fetchCreatorIssues(currentView.id,{signal:controller.signal}) :
      context.query.trim().length >= 2 ?
      await searchIssues(context.query.trim(),{signal:controller.signal}) :
      await fetchIssues({offset:0,signal:controller.signal});
    if (token !== serial || controller.signal.aborted || box.hidden) return;
    currentList = result.items;
    currentPage = result.items.length;
    hasMore = !currentView && context.query.trim().length < 2 && result.hasNext;
    status.textContent = result.items.length ?
      (currentView ? "Showing " + result.items.length + " related issues." :
       context.query.trim().length >= 2 ?
       "Found " + result.items.length + " matching issues (up to 60 per search)." :
       "Showing " + result.items.length + " issues" +
        (result.total !== null ? " of " + result.total.toLocaleString() : "") + ".") :
      "No matching issues were found.";
    renderCards();
  } catch(error) {
    if (token !== serial || controller.signal.aborted || box.hidden) return;
    currentList = [];
    hasMore = false;
    grid.hidden = true;
    $("#apiEmpty").hidden = false;
    $("#apiEmptyText").textContent = friendlyError(error);
    $("#apiRetry").hidden = false;
    more.hidden = true;
    status.textContent = "Community API unavailable";
  } finally {
    if (token === serial) {finishLoading();active = null;}
  }
}
async function loadNextPage() {
  if (active || !hasMore || box.hidden || currentView || savedMode) return;
  const token = ++serial, controller = new AbortController();
  active = controller;
  more.disabled = true;
  more.textContent = "LOADING…";
  try {
    const result = await fetchIssues({offset:currentPage,signal:controller.signal});
    if (token !== serial || controller.signal.aborted) return;
    currentPage += result.items.length;
    currentList.push(...result.items);
    hasMore = result.hasNext && result.items.length > 0;
    status.textContent = "Showing " + currentList.length + " issues" +
      (result.total !== null ? " of " + result.total.toLocaleString() : "") + ".";
    renderCards();
  } catch(error) {
    if (token === serial && !controller.signal.aborted) status.textContent = friendlyError(error);
  } finally {
    if (token === serial) {active = null;more.disabled = false;more.textContent = "LOAD MORE COMICS"; }
  }
}
function getIssue(id) {
  return currentList.find(issue => issue.id === Number(id)) || bookmarks.get(Number(id)) || null;
}
function formatDate(value) {
  if (!/^\d{4}-\d\d-\d\d$/.test(value || "")) return "";
  return value;
}
function showDetail(issue) {
  detailBody.dataset.apiId = String(issue.id);
  const official = issue.url ? '<a class="button button--primary" target="_blank" rel="noopener noreferrer" href="' +
    escapeHtml(issue.url) + '">VIEW ON MARVEL.COM ↗</a>' : "";
  const creatorMarkup = issue.creators.length ? '<div class="detail-section"><h3>COMIC CREATORS</h3><div class="api-creator-list">' +
    issue.creators.slice(0,20).map(person => '<button type="button" data-api-creator="' + person.id +
    '" data-api-label="' + escapeHtml(person.name) + '">' + escapeHtml(person.name) + ' <span> ' +
    escapeHtml(person.role) + ' ↗</span></button>').join("") + '</div></div>' : "";
  const seriesMarkup = issue.seriesId ? '<div class="detail-section"><h3>RELATED SERIES</h3>' +
    '<button type="button" class="api-series-link" data-api-series="' + issue.seriesId + '" data-api-label="' +
    escapeHtml(issue.seriesName || "Series " + issue.seriesId) + '">Browse ' +
    escapeHtml(issue.seriesName || "this series") + ' →</button></div>' : "";
  const picture = issue.image ? '<img class="api-detail-cover" alt="Cover of ' + escapeHtml(issue.title) +
    '" src="' + escapeHtml(issue.image) + '" loading="lazy" referrerpolicy="no-referrer">' :
    '<div class="api-detail-cover-placeholder" aria-hidden="true"><span>MARVEL</span><strong>COMICS</strong></div>';
  detailBody.innerHTML = '<div class="detail-layout api-detail-layout"><div class="api-detail-art">' +
    picture + '</div><div class="detail-copy"><span class="eyebrow">UNOFFICIAL COMICS METADATA / ISSUE #' + issue.id +
    '</span><h2 id="detailTitle">' + escapeHtml(issue.title) + '</h2><p class="detail-lede">' +
    escapeHtml(issue.description || "No description was supplied for this comic issue.") + '</p>' +
    '<dl class="fact-grid">' +
    '<div><dt>ISSUE NUMBER</dt><dd>' + escapeHtml(issue.issueNumber || "Not listed") + '</dd></div>' +
    '<div><dt>YEAR</dt><dd>' + escapeHtml(issue.year || "Not listed") + '</dd></div>' +
    '<div><dt>ON SALE</dt><dd>' + escapeHtml(formatDate(issue.date) || "Not listed") + '</dd></div>' +
    '<div><dt>PAGES</dt><dd>' + escapeHtml(issue.pageCount || "Not listed") + '</dd></div>' +
    '</dl>' + seriesMarkup + creatorMarkup +
    '<div class="detail-actions"><button type="button" class="button button--outline" data-api-bookmark="' +
    issue.id + '" aria-pressed="' + bookmarks.has(issue.id) + '">' +
    (bookmarks.has(issue.id) ? "♥ Saved issue" : "♡ Save issue") + '</button>' + official + '</div>' +
    '<p class="api-attribution">Source: Marvel Metadata API, an independent fan project. Cover and issue information are owned by their respective rights holders.</p></div></div>';
}
async function openIssue(id) {
  const issueId = Number(id);
  if (!Number.isSafeInteger(issueId) || issueId < 1) return;
  const token = ++detailSerial;
  const summary = getIssue(issueId);
  if (!dialog.open) {
    priorFocus = document.activeElement;
    dialog.showModal();
  }
  detailBody.dataset.apiId = String(issueId);
  detailBody.innerHTML = '<div class="api-detail-loading" role="status">Loading issue details…</div>';
  if (summary) showDetail(summary);
  try {
    const detail = await fetchIssueDetail(issueId);
    if (token !== detailSerial || !dialog.open || detailBody.dataset.apiId !== String(issueId)) return;
    showDetail(detail);
  } catch(error) {
    if (token !== detailSerial || !dialog.open) return;
    if (!summary) detailBody.innerHTML = '<div class="api-detail-loading">' +
      escapeHtml(friendlyError(error)) + '</div>';
  }
}
function enterRelation(kind,id,label) {
  const num = Number(id);
  if (!Number.isSafeInteger(num) || num < 1) return;
  const baseQuery = context.query.trim();
  currentView = {kind,id:num,title:label || (kind === "series" ? "Series issues" : "Creator issues"),parentQuery:baseQuery};
  savedMode = false;
  currentKey = "";
  dialog.close();
  syncComicsBrowser(context);
  box.scrollIntoView({behavior:"smooth",block:"start"});
}

document.addEventListener("click",event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.apiOpen) {openIssue(button.dataset.apiOpen);return;}
  if (button.dataset.apiBookmark) {
    const issue = getIssue(button.dataset.apiBookmark);
    if (issue) bookmarkIssue(issue);
    return;
  }
  if (button.dataset.apiSeries) {enterRelation("series",button.dataset.apiSeries,button.dataset.apiLabel);return;}
  if (button.dataset.apiCreator) {enterRelation("creator",button.dataset.apiCreator,button.dataset.apiLabel);return;}
});
savedToggle.addEventListener("click",() => {
  savedMode = !savedMode;currentView = null;currentKey = "";syncComicsBrowser(context);
});
back.addEventListener("click",() => {
  currentView = null;currentKey = "";syncComicsBrowser(context);
});
$("#apiRetry").addEventListener("click",() => {
  $("#apiRetry").hidden = true;currentKey = "";syncComicsBrowser(context);
});
more.addEventListener("click",loadNextPage);
dialog.addEventListener("close",() => {
  detailSerial++;
  delete detailBody.dataset.apiId;
  priorFocus?.focus?.();
  priorFocus = null;
});
updateBookmarkLabel();
box.dataset.source = API_ORIGIN;
