import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeMovie,normalizeScreenCharacter,normalizeComicHero,normalizeCollection,
  filterUniverse,safeImageUrl,safeImdbUrl,loadUniverse,loadUniverseRelations,
  clearUniverseCacheForTests,MCU_ORIGIN
} from "../src/universe-api.js";

const movie={id:1,title:"Iron Man",release_date:"2008-05-02",duration:126,
  cover_url:"https://res.cloudinary.com/augustomarcelo/image/upload/poster.jpg",
  imdb_id:"tt0371746",is_mcu:true,phase:1,overview:"A hero is born."};
const screen={id:1,name:"Tony Stark",alias:"Iron Man",played_by:"Robert Downey Jr.",
  image_url:"https://image.tmdb.org/t/p/w500/sample.jpg",description:"Armored Avenger"};
const hero={id:1,name:"Iron Man",biography:{publisher:"Marvel Comics",firstAppearance:"Tales of Suspense #39",fullName:"Tony Stark",alignment:"good"},
  powerstats:{intelligence:100,strength:86,speed:63,durability:85,power:100,combat:64},
  images:{md:"https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/1-iron-man.jpg"}};
test("normalizes MCU movies with safe poster and IMDb link",()=>{
 const x=normalizeMovie(movie);
 assert.equal(x.title,"Iron Man");assert.equal(x.year,2008);
 assert.equal(x.image,movie.cover_url);
 assert.equal(x.link,"https://www.imdb.com/title/tt0371746/");
 assert.equal(x.kind,"movies");assert.equal(x.isMcu,true);
});
test("normalizes screen characters separately from comic incarnations",()=>{
 const x=normalizeScreenCharacter(screen);assert.equal(x.title,"Iron Man");
 assert.equal(x.actor,"Robert Downey Jr.");
 assert.equal(x.key,"screen:1");
 const y=normalizeComicHero(hero);assert.equal(y.key,"comics:1");
 assert.equal(y.stats.intelligence,100);
 assert.equal(normalizeComicHero({...hero,biography:{publisher:"DC Comics"}}),null);
});
test("rejects malicious or untrusted image / outbound URLs",()=>{
 assert.equal(safeImageUrl("https://evil.com/foo.jpg"),null);
 assert.equal(safeImageUrl("javascript:alert(1)"),null);
 assert.equal(safeImageUrl("https://image.tmdb.org.evil.com/t/p/x.jpg"),null);
 assert.equal(safeImageUrl("http://image.tmdb.org/t/p/x.jpg"),null);
 assert.equal(safeImdbUrl("tt0371746"),"https://www.imdb.com/title/tt0371746/");
 assert.equal(safeImdbUrl("../evil"),null);
 assert.equal(normalizeMovie({id:"abc",title:"Bad"}),null);
});
test("deduplicates and filters search and sort safely",()=>{
 const rows=normalizeCollection("movies",[movie,movie,{...movie,id:2,title:"Avengers",release_date:"2012-01-02",is_mcu:false}]);
 assert.equal(rows.length,2);
 assert.deepEqual(filterUniverse(rows,"iron").map(x=>x.title),["Iron Man"]);
 assert.deepEqual(filterUniverse(rows,"", "az").map(x=>x.title),["Avengers","Iron Man"]);
 assert.equal(filterUniverse(rows,"", "featured","mcu").length,1);
 assert.throws(()=>normalizeCollection("movies",{}));
});
test("paginates movie API and normalizes all records",async()=>{
 clearUniverseCacheForTests();
 const urls=[];
 const stub=async (url,opts)=>{
   urls.push(url);
   assert.equal(opts.credentials,"omit");
   assert.equal(opts.mode,"cors");
   const next=new URL(url);
   const page=Number(next.searchParams.get("page"));
   const total=101;
   const count=page===1?100:1;
   return {ok:true,json:async()=>({data:Array.from({length:count},(_,i)=>({...movie,id:(page-1)*100+i+1})),total})};
 };
 const result=await loadUniverse("movies",{fetchImpl:stub});
 assert.equal(result.items.length,101);
 assert.equal(urls.length,2);
 assert.ok(urls[0].startsWith(MCU_ORIGIN));
});
test("falls back to CDN if the movie API is offline",async()=>{
 const paths=[];
 const stub=async (url,opts)=>{
   paths.push(url);
   if(url.startsWith(MCU_ORIGIN))throw Error("Network down");
   return {ok:true,json:async()=>[movie]};
 };
 const x=await loadUniverse("movies",{fetchImpl:stub});
 assert.equal(x.source,"MCUAPI CDN snapshot");
 assert.equal(x.items.length,1);
 assert.equal(paths.length,2);
});
test("Marvel superhero API is filtered to Marvel Comics",async()=>{
 const stub=async ()=>({ok:true,json:async()=>[hero,{...hero,id:2,biography:{publisher:"DC Comics"}}]});
 const x=await loadUniverse("comics",{fetchImpl:stub});
 assert.equal(x.items.length,1);
 assert.equal(x.items[0].title,"Iron Man");
});
test("related endpoints normalize correct kind",async()=>{
 const called=[];
 const stub=async (url)=>{called.push(url);return {ok:true,json:async()=>[screen]};};
 const result=await loadUniverseRelations(normalizeMovie(movie),{fetchImpl:stub});
 assert.equal(result[0].kind,"screen");
 assert.ok(called[0].endsWith("/characters/movie/1"));
});
