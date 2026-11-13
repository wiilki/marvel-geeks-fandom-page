/**
 * First-party dossier layout. Offline editorial context is always immediate;
 * optional public API enrichments appear in a secondary section after opening.
 * Neither a Wikipedia visit nor an API is required to understand a card.
 */
import {getDossierNote,dossierFacts,dossierConnections} from "./dossier-data.js";
import {curatedMoviePosters,curatedComicCovers} from "./story-images.js";
import {loadUniverse} from "./universe-api.js";
import {fetchIssueDetail} from "./marvel-api.js";

function escapeHtml(raw) {
  return String(raw ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}
const limit = (value,n=1200) => typeof value==="string" ? value.trim().slice(0,n) : "";
const fact = (name,value) =>
  '<div><dt>'+escapeHtml(name)+'</dt><dd>'+escapeHtml(value)+'</dd></div>';
const normalizeArray = array => Array.isArray(array)?array:[];
function related(item) {
  const groups=dossierConnections(item);
  const parts=[
    ["Characters in this story","characters",groups.characters],
    ["Explore related comics","comics",groups.comics],
    ["Explore related films","movies",groups.movies]
  ];
  return parts.filter(([, ,rows])=>rows.length).map(([title,kind,rows])=>
    '<section class="detail-section dossier-related-section"><h3>'+escapeHtml(title)+'</h3>'+
    '<div class="related-list">'+rows.slice(0,9).map(row=>
      '<button type="button" class="related-link" data-open="'+escapeHtml(kind+":"+row.id)+'">'+
      '<span>'+escapeHtml(row.title||row.name)+'</span><span aria-hidden="true">›</span></button>'
    ).join("")+'</div></section>'
  ).join("");
}
function highlight(item) {
  if (item.type==="characters") return item.alias && item.alias!==item.title ?
    "The person behind the mantle: "+item.alias : "Character profile & origin";
  if (item.type==="comics")return item.era+" · "+item.year;
  return item.phase+" · "+item.year;
}

/** Returns safe static markup; only authored strings and escaped catalog data. */
export function buildCuratedDossier(item,{saved=false,art}={}) {
  if (!item || !["characters","movies","comics"].includes(item.type) || typeof art!=="function")
    throw new Error("Invalid curated dossier.");
  const key=item.type+":"+item.id;
  const facts=dossierFacts(item);
  const abilities=normalizeArray(item.powers);
  const notes=getDossierNote(item);
  const abilitiesHtml=abilities.length ?
    '<section class="detail-section"><h3>Abilities and defining traits</h3><div class="detail-tags">'+
    abilities.map(value=>'<span>'+escapeHtml(value)+'</span>').join("")+'</div></section>' : "";
  const wikipedia="https://en.wikipedia.org/w/index.php?search="+encodeURIComponent(item.title+" Marvel");
  const back='<button class="dossier-back" type="button" data-dossier-back hidden aria-label="Return to previous dossier">← BACK TO PREVIOUS</button>';
  return '<div class="detail-layout dossier-layout">'+art(item,"cover-art--detail")+
    '<div class="detail-copy dossier-copy"><div class="dossier-nav">'+back+
    '<span class="eyebrow">MARVEL GEEKS / '+escapeHtml(item.type==="movies"?"FILM":item.type==="comics"?"COMIC":"CHARACTER")+' DOSSIER</span></div>'+
    '<h2 id="detailTitle">'+escapeHtml(item.title)+'</h2>'+
    '<p class="dossier-subtitle">'+escapeHtml(highlight(item))+'</p>'+
    '<p class="detail-lede">'+escapeHtml(item.summary)+'</p>'+
    '<section class="dossier-story" aria-label="Explore this story"><h3>THE STORY SO FAR</h3>'+
    '<p>'+escapeHtml(notes||item.summary)+'</p></section>'+
    '<dl class="fact-grid dossier-facts">'+facts.map(([name,value])=>fact(name,value)).join("")+'</dl>'+
    abilitiesHtml+related(item)+
    (item.type==="characters" ? "" :
      '<section class="detail-section dossier-metadata"><h3>'+
      (item.type==="movies"?"MORE FILM DETAILS":"MORE ISSUE DETAILS")+'</h3>'+
      '<div data-dossier-enrichment role="status" aria-live="polite">Checking additional independent source details…</div></section>')+
    '<div class="detail-actions"><button type="button" class="button button--primary" data-favorite="'+escapeHtml(key)+
    '">'+(saved?"♥ Saved to favorites":"♡ Save to favorites")+'</button></div>'+
    '<details class="dossier-sources"><summary>External reference (optional)</summary>'+
    '<p>Prefer to continue reading here? Use the connected comics and films above. Encyclopedia results are an external, independently edited resource.</p>'+
    '<a href="'+escapeHtml(wikipedia)+'" target="_blank" rel="noopener noreferrer">Search Wikipedia for '+escapeHtml(item.title)+' ↗</a>'+
    '</details></div></div>';
}

function enrichedMovieDetails(movie) {
  const facts=[
    ["Original release date",movie.date],
    ["Runtime",movie.runtime ? movie.runtime+" minutes":null],
    ["Saga",movie.saga],
    ["Film phase",movie.phase ? "Phase "+movie.phase:null],
    ["Studio",movie.studio],
    ["Continuity",movie.continuity],
    ["Directed by",movie.director]
  ].filter(([,value])=>value!==null && value!=="");
  const description=limit(movie.description,1300);
  return '<p class="dossier-metadata-source">From MCUAPI · fan-maintained film data</p>'+
    (description?'<p class="dossier-metadata-overview">'+escapeHtml(description)+'</p>':"")+
    '<dl class="fact-grid dossier-extra-facts">'+facts.map(([n,v])=>fact(n,v)).join("")+'</dl>'+
    (movie.link?'<p><a href="'+escapeHtml(movie.link)+
      '" rel="noopener noreferrer" target="_blank">Film record on IMDb ↗</a></p>':"");
}
function enrichedComicDetails(issue) {
  const facts=[
    ["Official issue title",issue.title],
    ["Issue number",issue.issueNumber],
    ["Series",issue.seriesName],
    ["On sale",issue.date],
    ["Page count",issue.pageCount]
  ].filter(([,value])=>value!==null && value!=="");
  const description=limit(issue.description,1300);
  const creatorList=normalizeArray(issue.creators).slice(0,8)
    .map(person=>escapeHtml(person.name)+(person.role?" · "+escapeHtml(person.role):""));
  return '<p class="dossier-metadata-source">From the unofficial Marvel Metadata API · community-maintained issue data</p>'+
    (description?'<p class="dossier-metadata-overview">'+escapeHtml(description)+'</p>':"")+
    '<dl class="fact-grid dossier-extra-facts">'+facts.map(([n,v])=>fact(n,v)).join("")+'</dl>'+
    (creatorList.length?'<div class="dossier-credit-list"><h4>Creator credits</h4><ul>'+
      creatorList.map(name=>'<li>'+name+'</li>').join("")+'</ul></div>':"")+
    (issue.url?'<p><a href="'+escapeHtml(issue.url)+
      '" rel="noopener noreferrer" target="_blank">Official Marvel issue page ↗</a></p>':"");
}

/**
 * Load external metadata after rendering the local dossier. A stable key guard
 * prevents stale network results from overwriting another selected character,
 * movie or comic within the shared detailDialog.
 */
export async function enrichCuratedDossier(item,{detailBody,fetchMovieData=loadUniverse,fetchComicData=fetchIssueDetail}={}) {
  if (!item || !detailBody || !["comics","movies"].includes(item.type))return;
  const key=item.type+":"+item.id;
  const box=detailBody.querySelector("[data-dossier-enrichment]");
  if (!box || detailBody.dataset.curatedKey!==key)return;
  try {
    let markup="";
    if (item.type==="movies") {
      const mapping=curatedMoviePosters[item.id];
      if (!mapping || mapping.year!==item.year)throw new Error("No verified film mapping");
      const result=await fetchMovieData("movies");
      const movie=result?.items?.find(x=>x.id===mapping.mcuId && x.year===item.year);
      if (!movie)throw new Error("Film record not found in current provider data");
      markup=enrichedMovieDetails(movie);
    } else {
      const mapping=curatedComicCovers[item.id];
      if (!mapping || mapping.year!==item.year)throw new Error("No verified issue mapping");
      const issue=await fetchComicData(mapping.apiId);
      if (!issue || issue.id!==mapping.apiId || issue.year!==item.year)
        throw new Error("Issue identity could not be independently verified");
      markup=enrichedComicDetails(issue);
    }
    if (detailBody.dataset.curatedKey===key && detailBody.querySelector("[data-dossier-enrichment]")===box)
      box.innerHTML=markup;
  } catch {
    // The offline editorial story, facts and links remain usable.
    if (detailBody.dataset.curatedKey===key && detailBody.querySelector("[data-dossier-enrichment]")===box)
      box.textContent="Additional metadata is unavailable right now. The editorial profile and related entries above still work.";
  }
}
