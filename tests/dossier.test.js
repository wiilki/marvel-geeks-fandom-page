import test from "node:test";
import assert from "node:assert/strict";
import {characters,comics,movies,allItems} from "../src/catalog.js";
import {cardHighlights,dossierConnections,dossierFacts,dossierNotes,getDossierNote} from "../src/dossier-data.js";
import {buildCuratedDossier,enrichCuratedDossier} from "../src/dossier-view.js";
import {curatedComicCovers,curatedMoviePosters} from "../src/story-images.js";
import {readFileSync} from "node:fs";

const item=(type,id)=>allItems.find(x=>x.type===type && x.id===id);
const art=()=>'<div class="cover-art" aria-label="test artwork"></div>';
const scaffold=(key)=>{
  const slot={innerHTML:"",textContent:""};
  const detailBody={dataset:{curatedKey:key},querySelector(selector){
    return selector==="[data-dossier-enrichment]"?slot:null;
  }};
  return {slot,detailBody};
};
test("all 66 starter entries have distinct offline context and useful facts",()=>{
  assert.equal(characters.length,24);
  assert.equal(comics.length,24);
  assert.equal(movies.length,18);
  assert.equal(allItems.length,66);
  for(const type of ["characters","comics","movies"]){
    const rows=allItems.filter(x=>x.type===type);
    assert.deepEqual(Object.keys(dossierNotes[type]).sort(),rows.map(x=>x.id).sort());
    for(const row of rows) {
      assert.ok(getDossierNote(row).length>75,"missing substantial note for "+row.id);
      assert.ok(dossierFacts(row).length>=3,"missing facts for "+row.id);
      assert.ok(cardHighlights(row).length>=1,"missing card highlights for "+row.id);
    }
  }
});
test("each curated dossier stays on site and links to appropriate entries",()=>{
  const spider=buildCuratedDossier(item("characters","spider-man"),{saved:false,art});
  assert.ok(spider.includes("THE STORY SO FAR"));
  assert.ok(spider.includes("Abilities and defining traits"));
  assert.ok(spider.includes("Explore related comics"));
  assert.ok(spider.includes("Explore related films"));
  assert.ok(spider.includes('data-open="comics:amazing-fantasy-15"'));
  assert.ok(spider.includes('data-open="movies:homecoming"'));
  assert.ok(spider.includes('data-favorite="characters:spider-man"'));
  assert.ok(spider.includes("<details"));
  assert.ok(spider.includes("External reference (optional)"));
  assert.ok(spider.indexOf("THE STORY SO FAR")<spider.indexOf("Wikipedia"));
  assert.ok(!spider.includes(">Read more ↗</a>"));
  const civil=buildCuratedDossier(item("movies","civil-war-film"),{saved:true,art});
  assert.ok(civil.includes("MORE FILM DETAILS"));
  assert.ok(civil.includes("Captain America"));
  assert.ok(civil.includes("♥ Saved"));
  const comic=buildCuratedDossier(item("comics","old-man-logan"),{saved:false,art});
  assert.ok(comic.includes("MORE ISSUE DETAILS"));
  assert.ok(comic.includes("Wolverine (2003) #66"));
  assert.ok(comic.includes("Explore related films"));
});
test("cross-links are type-safe and never guess by title",()=>{
  const connections=dossierConnections(item("characters","spider-man"));
  assert.ok(connections.comics.length>=1);
  assert.ok(connections.movies.length>=1);
  assert.ok(connections.comics.every(x=>x.type==="comics"));
  assert.ok(connections.movies.every(x=>x.type==="movies"));
  const film=dossierConnections(item("movies","iron-man-2008"));
  assert.equal(film.characters[0].id,"iron-man");
  assert.ok(film.movies.every(x=>x.id!=="iron-man-2008"));
});
test("all editorial fields are HTML-escaped before rendering",()=>{
  const hostile={...item("movies","iron-man-2008"),title:'<img src=x onerror=alert(1)>',summary:'<script>alert(1)</script>',director:'"><iframe>'};
  const html=buildCuratedDossier(hostile,{art});
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<iframe>'));
  assert.ok(!html.includes('onerror=alert(1)>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;iframe&gt;'));
});
test("movie detail enriches from matching MCU source without losing local narrative",async()=>{
  const it=item("movies","iron-man-2008");
  const s=scaffold("movies:iron-man-2008");
  let requested;
  await enrichCuratedDossier(it,{detailBody:s.detailBody,fetchMovieData:async kind=>{
    requested=kind;
    return {items:[{id:curatedMoviePosters[it.id].mcuId,year:2008,
      date:"2008-05-02",runtime:126,description:"The origin of Tony Stark.",phase:1,
      saga:"Infinity Saga",studio:"Marvel Studios",continuity:"MCU",director:"Jon Favreau",
      link:"https://www.imdb.com/title/tt0371746/"}]};
  }});
  assert.equal(requested,"movies");
  assert.ok(s.slot.innerHTML.includes("126 minutes"));
  assert.ok(s.slot.innerHTML.includes("Infinity Saga"));
  assert.ok(s.slot.innerHTML.includes("The origin of Tony Stark."));
});
test("comic detail fetches exact issue by ID with credits and official link",async()=>{
  const it=item("comics","amazing-fantasy-15");
  const id=curatedComicCovers[it.id].apiId;
  const s=scaffold("comics:amazing-fantasy-15");
  let requested;
  await enrichCuratedDossier(it,{detailBody:s.detailBody,fetchComicData:async arg=>{
    requested=arg;
    return {id,year:1962,title:"Amazing Fantasy (1962) #15",issueNumber:"15",
      seriesName:"Amazing Fantasy",date:"1962-08-10",pageCount:32,
      description:"Spider-Man's origin.",creators:[{name:"Stan Lee",role:"writer"}],
      url:"https://www.marvel.com/comics/issue/16926"};
  }});
  assert.equal(requested,id);
  assert.ok(s.slot.innerHTML.includes("Stan Lee"));
  assert.ok(s.slot.innerHTML.includes("32"));
  assert.ok(s.slot.innerHTML.includes("Official Marvel issue page"));
});
test("a source failure or another modal never overwrites unrelated dossier",async()=>{
  const it=item("movies","iron-man-2008"),s=scaffold("movies:iron-man-2008");
  let release;
  const pending=new Promise(resolve=>release=resolve);
  const enrich=enrichCuratedDossier(it,{detailBody:s.detailBody,fetchMovieData:()=>pending});
  s.detailBody.dataset.curatedKey="movies:avengers-2012";
  release({items:[{id:curatedMoviePosters[it.id].mcuId,year:2008,description:"Stale"}]});
  await enrich;
  assert.equal(s.slot.innerHTML,"");
  const fail=scaffold("movies:iron-man-2008");
  await enrichCuratedDossier(it,{detailBody:fail.detailBody,fetchMovieData:async()=>{
    throw new Error("Network unavailable");
  }});
  assert.match(fail.slot.textContent,/editorial profile and related entries/i);
});
test("Wikipedia search is opt-in; on-site details and back navigation are primary",()=>{
  const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.ok(app.includes('externalRequestedQuery !== term'));
  assert.ok(app.includes('action === "lookup-external"'));
  assert.ok(app.includes('data-dossier-back'));
  assert.ok(app.includes('dialog.scrollTop=0'));
  assert.ok(html.includes('id="externalResearchSection"'));
  assert.ok(html.includes('data-action="lookup-external"'));
  assert.ok(html.includes("Explore our character, movie and comic dossiers above first."));
  assert.ok(!app.includes('>Read more ↗</a>'));
});
