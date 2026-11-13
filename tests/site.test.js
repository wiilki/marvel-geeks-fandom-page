import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url),"utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url),"utf8");
const app = readFileSync(new URL("../src/app.js", import.meta.url),"utf8");

test("entry page includes all interactive mount points", () => {
  for (const id of ["searchInput","featuredGrid","resultsGrid","resultsHeading","facetBar","detailDialog","detailBody","liveResults","marvelLiveSection","apiResults","apiStatus","apiSavedToggle","apiRetry","apiLoadMore","favoritesToggle","favoritesCount","emptyState","clearSearch"])
    assert.ok(html.includes('id="' + id + '"'),"missing DOM element " + id);
});
test("all static assets are present and linked by relative URL", () => {
  for (const filename of ["src/app.js","src/catalog.js","src/marvel-api.js","src/live-comics.js","src/universe-api.js","src/universe-browser.js","styles.css","styles-live.css","styles-universe.css","assets/favicon.svg","manifest.webmanifest",".nojekyll"])
    assert.ok(existsSync(new URL("../" + filename, import.meta.url)),filename + " missing");
  assert.ok(html.includes('src="./src/app.js"'));
  assert.ok(html.includes('href="./styles.css"'));
  assert.ok(html.includes('href="./assets/favicon.svg"'));
});
test("the public application does not include client-side API secrets", () => {
  const code = html + css + app;
  assert.doesNotMatch(code,/REACT_APP_MARVEL_PRIVATE_KEY|REACT_APP_IMDB_KEY|X-RapidAPI-Key|CryptoJS\.MD5/);
  assert.ok(html.includes("unofficial, independent fan project"));
});
test("site has important accessibility affordances", () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<dialog id="detailDialog"/);
  assert.match(html, /aria-label="Archive categories"/);
  assert.match(css, /prefers-reduced-motion/);
});

test("third-party comics use public API and remain visually separate", () => {
  assert.ok(html.includes('https://marvel.emreparker.com'));
  assert.ok(html.includes('href="./styles-live.css"'));
  assert.ok(html.includes('id="marvelLiveSection"'));
  assert.ok(app.includes('syncComicsBrowser'));
  assert.ok(html.includes('Data sourced from'));
});

test("movie and character explorer is wired and external endpoints are limited", () => {
  assert.ok(html.includes('id="universeSection"'));
  assert.ok(html.includes('href="./styles-universe.css"'));
  assert.ok(html.includes('https://mcuapi.up.railway.app'));
  assert.ok(html.includes('https://cdn.jsdelivr.net'));
  assert.ok(html.includes('https://akabab.github.io'));
  assert.ok(app.includes("syncUniverseBrowser"));
  assert.ok(html.includes("Superhero API"));
  assert.ok(html.includes("MCUAPI"));
});

test("curated and expanded character images have safe fallbacks",()=>{
  const photos=readFileSync(new URL("../src/character-images.js",import.meta.url),"utf8");
  const expanded=readFileSync(new URL("../src/universe-browser.js",import.meta.url),"utf8");
  assert.ok(app.includes('import { portraitUrlsForCharacter }'));
  assert.ok(app.includes('data-image-fallback'));
  assert.ok(app.includes('image.closest(".cover-art--has-photo")'));
  assert.ok(app.includes('document.addEventListener("error"'));
  assert.ok(css.includes('.cover-art--has-photo .cover-photo'));
  assert.ok(photos.includes('safeImageUrl'));
  assert.ok(expanded.includes('universe-detail-placeholder'));
});
