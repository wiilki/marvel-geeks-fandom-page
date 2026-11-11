import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url),"utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url),"utf8");
const app = readFileSync(new URL("../src/app.js", import.meta.url),"utf8");

test("entry page includes all interactive mount points", () => {
  for (const id of ["searchInput","featuredGrid","resultsGrid","resultsHeading","facetBar","detailDialog","detailBody","liveResults","favoritesToggle","favoritesCount","emptyState","clearSearch"])
    assert.ok(html.includes('id="' + id + '"'),"missing DOM element " + id);
});
test("all static assets are present and linked by relative URL", () => {
  for (const filename of ["src/app.js","src/catalog.js","styles.css","assets/favicon.svg","manifest.webmanifest",".nojekyll"])
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
