# Marvel Geeks — Fan Archive (2026 rebuild)

A complete, no-build rewrite of the original Marvel Geeks project. Explore a curated Marvel universe through character profiles, landmark comics, cinematic entries and the connections among them.

**Live site (after GitHub Pages is enabled):** https://wiilki.github.io/marvel-geeks-fandom-page/

## What it does

- Search a built-in editorial collection of 24 characters, 24 comics and 18 movies; works without API keys or an internet connection (after loading the site).
- Switch between content types, filter by character team/comic era/film phase and sort results.
- Open detailed character, comic and film panels; navigate through related characters and stories.
- Save favorites locally on your browser (no account), view your saved list and share search links.
- Search additional Wikipedia references when connected to the internet (clearly labeled as external search results).
- **Browse thousands of Marvel comic issues through the independent [Marvel Metadata API](https://github.com/emreparker/marvel-comics)**. Browse paginated issues, search comic titles, inspect full issue metadata including creator credits and optional cover, navigate related series/creator issues and open the official Marvel comic page.
- Save remote comic issues as local bookmarks. Remote bookmarks are separate from the built-in editorial archive favorites.
- Browse MCU movies, screen portrayals and Marvel Comics superhero profiles through two additional no-key public APIs.
- Mobile-first design, keyboard shortcuts, reduced-motion support and semantic, accessible dialogs.

**Important distinction from the 2022–2024 version:** The old site called the official Marvel and RapidAPI movie APIs from the browser, using private keys in client-side variables. That cannot be done securely on public static hosting: build-time frontend "secrets" are still visible to visitors. This rebuild replaces those unstable/dependent lookups with a working, curated collection and separate Wikipedia reading results. It does not claim to be a complete or live official Marvel catalog. An official live Marvel/IMDb integration would require a separate server-side proxy and API arrangements. The new third-party comics API covers comics metadata, not movies or all characters.




### Movie posters and comic issue covers

The starter archive's **18 films** now use real movie poster URLs from MCUAPI's
public GitHub dataset, matched by exact MCUAPI record ID and release year.
Its **24 editorial comics** use real issue cover URLs from the community
[Marvel Metadata API](https://github.com/emreparker/marvel-comics).
Matching was checked against issue numbers, titles and original publication
years—including older series whose names changed and the 2008 **Old Man Logan**
storyline, which starts at **Wolverine (2003) #66**, not **Old Man Logan (2015) #1**.

These lookups are stored as a small, deterministic **URL/ID metadata mapping**
in src/story-images.js. No poster or cover binary is copied into GitHub, no
new API key is needed, and the site remains a static free GitHub Pages app.
Cards show the appropriate portrait-oriented poster/cover, and the larger
detail dialog shows the full image. If an image fails, the original graphic
fallback remains visible.

The expanded comics index also shows known editorial covers immediately. For
unmapped issue summaries, the comics API does not include cover images, so the
site requests details **only for cards near the viewport**, with at most 3
concurrent requests and 24 image lookups per minute. A card may show the
fallback until you scroll it into view, and may remain a placeholder if the
provider is unavailable or the safety budget is exhausted; opening a comic's
detail dialog always performs the normal detail lookup.

Artwork is externally hosted and remains subject to the copyright and usage
rules of its owners. The MIT licenses of any API code do **not** grant a license
to Marvel's copyrighted art or film poster images. This independent fan site
does not claim affiliation with Marvel or Disney.

### Character portraits

The original 24 curated character cards (including the Featured Heroes row and full
detail panels) now display source-verified public character portraits, instead of
only the CSS initials graphics. Portrait URLs are mapped deliberately by character
identity, using Marvel Comics character images from [Superhero API](https://github.com/akabab/superhero-api)
and MCU screen portraits from [MCUAPI](https://github.com/AugustoMarcelo/mcuapi).
For example, the Wasp in the original catalog is Hope van Dyne (not the comics'
Janet van Dyne), Ant-Man is Scott Lang and Captain Marvel is Carol Danvers.
Those use exact matching screen portrayals. The expanded movie and character
archive uses the same providers' own supplied image URLs.

Images are hotlinked from the providers' existing CDNs; **no copyrighted Marvel
pictures are checked into the repository**, nor is license to their artwork
implied by the API code's MIT license. External image hosts may block hotlinking
or remove images. On an image error, the app tries a second vetted source (when
available) and then restores its original graphic/initials fallback, instead of
showing a broken-image icon. GitHub Pages remains free and no API keys are needed.
The static mapping in src/character-images.js is source-verified and can be
extended when more curated heroes are added.

## Expanded movie and character APIs (2026)

**MCUAPI** — https://github.com/AugustoMarcelo/mcuapi — keyless REST metadata about Marvel cinematic titles and their on-screen characters.
- The provider's September 7, 2026 mirror reports **75 movies** and **375 on-screen characters**; these are provider counts, not guarantees of comprehensive or up-to-the-minute coverage.
- The site calls live GET /api/v1/movies and /api/v1/characters with bounded pagination, then uses the provider's published public jsDelivr JSON snapshot if its live API fails or rate limits.
- Movies show year, summary, director, phase, saga, and IMDb links where available. Screen characters show actor, alias and continuity information. Related film ↔ character connections are queried on demand from the live API.
- The provider allows no-key read-only calls, publishes a 100-request/minute cap, and may include non-core MCU films and multiverse variants. Film metadata and dates belong to the provider, not Marvel.

**Superhero API** — https://github.com/akabab/superhero-api — a publicly hosted, keyless superhero dataset spanning publishers. The publicly tested endpoint (November 11, 2026) returned **563 total characters**, including **269 Marvel Comics characters**; its documentation still advertises 731. We filter its biography publisher field to **Marvel Comics only**, so DC characters don't leak into the Marvel-only UI. Data includes name, full identity, appearance, affiliation, and community-rated powerstats, plus optional portraits. The superhero API is a static snapshot, not a source of current story continuity. The project has an MIT code license; that does **not** grant copyright ownership or a license to Marvel's underlying images or characters. A jsDelivr mirror provides fallback hosting.

**Site UX** — In Explore the Archive, select All, Movies or Characters, then scroll to Expanded Universe. Use the source tabs, filters, search field at the top, sort dropdown, and saved bookmarks. Saved items are kept locally in the visitor's browser. No signup, secrets, paid proxy or API plan is required.

**Safety and reliability** — Two distinct variants (MCU screen portrayals versus Marvel Comics characters) are deliberately separate, because combining them would misrepresent character identities. External metadata is escaped for HTML, image hosts are allowlisted, requests have timeouts and caching, results are paged on-screen, and the curated site stays functional even if these third-party providers become unavailable. The live API and CORS checks are a separate pull-request workflow, not a requirement of normal site publishing. External poster/portrait assets have separate rights from the API code.

## Unofficial Marvel Comics API integration

The site now integrates [emreparker/marvel-comics](https://github.com/emreparker/marvel-comics) (MIT-licensed API implementation), which documents **37,526 comics (1939–2025)**, 6,990 series and 4,341 creators. The published data is a third-party, historical metadata snapshot, **not** a complete official/live-updated Marvel character and movie feed. The site shows this source separately from the original 66-entry editorial collection.

- Public hosted service: https://marvel.emreparker.com
- Browser GET requests (no API key or paid provider) to /v1/issues, /v1/search/issues, /v1/issues/{id}, /v1/series/{id}/issues and /v1/creators/{id}/issues
- Cross-origin GET supported by the upstream project's FastAPI configuration; the server's current uptime and CORS are verified by a separate PR smoke check.
- Delayed search, request cancellation, small 18-issue pages, cached requests, 12-second timeouts, safe link/image host allowlisting, visible retry and fallback behavior.
- No API data or large database is copied to this repository. The user's own local bookmarks persist in the browser, and do not require an account.
- The third-party service is owned and operated by another maintainer, can become unavailable or enforce its 60 requests/minute limit, and cannot guarantee Marvel's rights to comic metadata or cover art. The UI credits the provider and links to official comic pages when available.
- If the external API is unavailable, the offline editorial catalog and other features remain functional.
- The upstream source's permissive MIT software license applies to **code**, not Marvel's underlying copyrighted content, artwork, trademarks or a guarantee of API availability.

Development and CI:
- npm run check executes the fully offline, dependency-free static/JavaScript tests.
- The API availability/CORS probe runs separately in .github/workflows/api-smoke.yml on relevant PR changes, or manually by workflow dispatch. It does not run on every normal push (so external downtime doesn't block ordinary site builds).

## Free publishing (GitHub Pages, recommended)

No npm install, server, database, credit card, Cloudflare, Heroku or API key is required.

1. Merge the rebuild/marvel-geeks-2026 pull request into main after checks pass.
2. Open **[this repository's Settings → Pages](https://github.com/wiilki/marvel-geeks-fandom-page/settings/pages)**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose **Branch: main** and **Folder: / (root)**, then press **Save**.
5. Wait for GitHub Pages to finish publishing. Open https://wiilki.github.io/marvel-geeks-fandom-page/ (or use the **Visit site** link in Pages settings).

Pages is free for public repositories on GitHub Free. This repository is public. The .nojekyll file tells Pages to serve this site directly. Each later push to main updates the site. Do not paste API private keys into the repo.

**Alternative:** Cloudflare Pages can import this repository. Framework preset: None; build command: leave blank; output directory: / (repository root). GitHub Pages is simpler for this project.

## Run on your computer

From Terminal on a Mac:

    git clone https://github.com/wiilki/marvel-geeks-fandom-page.git
    cd marvel-geeks-fandom-page
    python3 -m http.server 8000

Open http://localhost:8000 . Press **Control + C** to stop.

To run the dependency-free tests with Node 20+:

    npm run check

There is no build step and no dependency installation.

## Editing the collection

Add or edit data in src/catalog.js. characters, comics and movies are separate arrays. For comics and movies, cast contains character IDs from the characters array. Keep IDs unique; npm test checks references.

Files: index.html (semantic page), styles.css and styles-live.css (visual system), src/app.js (local archive and Wikipedia), src/catalog.js (built-in content), src/marvel-api.js (comics metadata client), src/live-comics.js (comic issue browser), src/universe-api.js (MCU + superhero clients), src/universe-browser.js (movie/character browser), styles-universe.css (expanded archive styling), tests/ (automated checks).

## Privacy, attribution and scope

- Favorites are stored **only in the visitor's browser** through localStorage.
- No analytics, ads, accounts or tracking are installed.
- Wikipedia search sends search terms to the public MediaWiki API when the visitor types at least 3 characters. It is optional enrichment; local catalog search never depends on it.
- Visual cover graphics are original CSS compositions; no third-party comic artwork is hotlinked.
- Marvel-related characters, titles and marks belong to their respective owners. This is an **unofficial fan project**, not endorsed by Marvel or Disney.
- Historical source code remains available in the repository's Git history and original main commit, even though the old source files are replaced.

## Future ideas

If you want a truly comprehensive live catalog, add a separately deployed serverless API proxy after verifying the data provider's terms, rate limits, image rights and secret storage. Never bundle private keys in browser JavaScript.
