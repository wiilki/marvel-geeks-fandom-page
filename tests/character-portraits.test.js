import test from "node:test";
import assert from "node:assert/strict";
import {characters} from "../src/catalog.js";
import {characterPortraits,portraitUrlsForCharacter} from "../src/character-images.js";
import {safeImageUrl} from "../src/universe-api.js";

test("all 24 original character profiles have an explicit source portrait",()=>{
  assert.equal(characters.length,24);
  assert.deepEqual(Object.keys(characterPortraits).sort(),characters.map(x=>x.id).sort());
  for(const item of characters){
    const urls=portraitUrlsForCharacter(item.id);
    assert.ok(urls.length>=1,item.name+" missing portrait");
    assert.equal(new Set(urls).size,urls.length,item.name+" has duplicate URLs");
    for(const url of urls){
      assert.equal(safeImageUrl(url),url,item.name+" URL outside safe hosts");
      assert.ok(url.startsWith("https://"));
    }
  }
});
test("do not confuse MCU actors and comic versions of characters",()=>{
  assert.ok(portraitUrlsForCharacter("wasp")[0].includes("image.tmdb.org"),
    "Hope van Dyne should not show the comic Janet van Dyne");
  assert.ok(portraitUrlsForCharacter("ant-man")[0].includes("image.tmdb.org"),
    "Scott Lang should not show a different Ant-Man");
  assert.ok(portraitUrlsForCharacter("captain-marvel")[0].includes("image.tmdb.org"),
    "Carol Danvers should not be replaced with Maria Rambeau");
  assert.ok(portraitUrlsForCharacter("spider-man")[0].includes("akabab/superhero-api"),
    "Comic Spider-Man illustration should be preferred");
  assert.deepEqual(portraitUrlsForCharacter("unknown-character"),[]);
});
