import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {movies,comics} from "../src/catalog.js";
import {curatedMoviePosters,curatedComicCovers,storyImageUrls} from "../src/story-images.js";
import {safeImageUrl} from "../src/universe-api.js";
import {coverImageUrl} from "../src/marvel-api.js";

test("all 18 original movies are mapped to same-year MCUAPI posters",()=>{
  assert.equal(movies.length,18);
  assert.deepEqual(Object.keys(curatedMoviePosters).sort(),movies.map(x=>x.id).sort());
  for(const item of movies) {
    const map=curatedMoviePosters[item.id],url=storyImageUrls({...item,type:"movies"});
    assert.ok(Number.isSafeInteger(map.mcuId)&&map.mcuId>0);
    assert.equal(map.year,item.year,"wrong poster year for "+item.title);
    assert.equal(url.length,1,"missing poster "+item.title);
    assert.equal(safeImageUrl(url[0]),url[0]);
    assert.ok(url[0].startsWith("https://res.cloudinary.com/augustomarcelo/"));
  }
});
test("all 24 original comics are mapped to real Marvel Metadata API issue covers",()=>{
  assert.equal(comics.length,24);
  assert.deepEqual(Object.keys(curatedComicCovers).sort(),comics.map(x=>x.id).sort());
  const seen=new Set();
  for(const item of comics) {
    const map=curatedComicCovers[item.id];
    assert.equal(map.year,item.year,"wrong cover year "+item.title);
    assert.ok(Number.isSafeInteger(map.apiId)&&map.apiId>0);
    assert.ok(!seen.has(map.apiId),"duplicate issue assigned");seen.add(map.apiId);
    assert.ok(map.apiTitle && /#\d+/.test(map.apiTitle),"issue metadata not identified");
    const url=storyImageUrls({...item,type:"comics"});
    assert.equal(url.length,1,"missing cover "+item.title);
    assert.equal(coverImageUrl(map.cover),url[0]);
    assert.ok(url[0].startsWith("https://i.annihil.us/"));
  }
});
test("story images fail closed on mismatched year or unrecognized type",()=>{
  assert.deepEqual(storyImageUrls({type:"movies",id:"iron-man-2008",year:1999}),[]);
  assert.deepEqual(storyImageUrls({type:"comics",id:"amazing-fantasy-15",year:2023}),[]);
  assert.deepEqual(storyImageUrls({type:"characters",id:"iron-man",year:2008}),[]);
});
test("original and expanded comic art is integrated with a broken-image fallback",()=>{
  const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");
  const styles=readFileSync(new URL("../styles.css",import.meta.url),"utf8");
  const live=readFileSync(new URL("../src/live-comics.js",import.meta.url),"utf8");
  const liveStyle=readFileSync(new URL("../styles-live.css",import.meta.url),"utf8");
  assert.ok(app.includes('import { storyImageUrls }'));
  assert.ok(app.includes('cover-art--poster'));
  assert.ok(app.includes('data-image-fallback'));
  assert.ok(app.includes('document.addEventListener("error"'));
  assert.ok(styles.includes(".cover-art--poster"));
  assert.ok(live.includes("curatedComicCovers"));
  assert.ok(live.includes("IntersectionObserver"));
  assert.ok(live.includes("COVER_LIMIT_PER_MINUTE = 24"));
  assert.ok(liveStyle.includes(".api-cover-photo"));
  assert.ok(live.includes("api-detail-cover-placeholder"));
});
