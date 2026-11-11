import test from "node:test";
import assert from "node:assert/strict";
import {characters,comics,movies,allItems,byKey,featuredIds,findCharacter} from "../src/catalog.js";

test("catalog includes each major content type", () => {
  assert.ok(characters.length >= 20);
  assert.ok(comics.length >= 20);
  assert.ok(movies.length >= 15);
  assert.equal(allItems.length, characters.length + comics.length + movies.length);
});
test("every item has a unique nonempty id and readable editorial copy", () => {
  const keys = allItems.map(item => item.type + ":" + item.id);
  assert.equal(new Set(keys).size,keys.length);
  for (const item of allItems) {
    assert.ok(item.title && item.summary && item.subtitle);
    assert.equal(byKey.get(item.type + ":" + item.id)?.title,item.title);
    assert.ok(!/<script/i.test(item.summary));
  }
});
test("all comics and films point to known characters", () => {
  for (const item of [...comics,...movies]) {
    assert.ok(item.cast.length > 0,item.id + " needs a cast");
    for (const id of item.cast) assert.ok(findCharacter(id),item.id + " references unknown " + id);
  }
});
test("featured heroes resolve and have visual palette metadata", () => {
  for (const id of featuredIds) {
    const character = findCharacter(id);
    assert.ok(character,"missing featured character " + id);
    assert.match(character.color,/^#[a-fA-F0-9]{6}$/);
    assert.ok(character.mark);
  }
});
test("all catalog years are plausible past dates", () => {
  for (const item of [...comics,...movies])
    assert.ok(item.year >= 1939 && item.year <= 2026,item.title);
});
