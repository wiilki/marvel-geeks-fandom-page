# Marvel Geeks — Fan Archive (2026 rebuild)

A complete, no-build rewrite of the original Marvel Geeks project. Explore a curated Marvel universe through character profiles, landmark comics, cinematic entries and the connections among them.

**Live site (after GitHub Pages is enabled):** https://wiilki.github.io/marvel-geeks-fandom-page/

## What it does

- Search a built-in editorial collection of 24 characters, 24 comics and 18 movies; works without API keys or an internet connection (after loading the site).
- Switch between content types, filter by character team/comic era/film phase and sort results.
- Open detailed character, comic and film panels; navigate through related characters and stories.
- Save favorites locally on your browser (no account), view your saved list and share search links.
- Search additional Wikipedia references when connected to the internet (clearly labeled as external search results).
- Mobile-first design, keyboard shortcuts, reduced-motion support and semantic, accessible dialogs.

**Important distinction from the 2022–2024 version:** The old site called the official Marvel and RapidAPI movie APIs from the browser, using private keys in client-side variables. That cannot be done securely on public static hosting: build-time frontend "secrets" are still visible to visitors. This rebuild replaces those unstable/dependent lookups with a working, curated collection and separate Wikipedia reading results. It does not claim to be a complete or live official Marvel catalog. An official live Marvel/IMDb integration would require a separate server-side proxy and API arrangements.

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

Files: index.html (semantic page), styles.css (visual system), src/app.js (search, favorites, dialog and Wikipedia lookup), src/catalog.js (content), tests/ (automated checks).

## Privacy, attribution and scope

- Favorites are stored **only in the visitor's browser** through localStorage.
- No analytics, ads, accounts or tracking are installed.
- Wikipedia search sends search terms to the public MediaWiki API when the visitor types at least 3 characters. It is optional enrichment; local catalog search never depends on it.
- Visual cover graphics are original CSS compositions; no third-party comic artwork is hotlinked.
- Marvel-related characters, titles and marks belong to their respective owners. This is an **unofficial fan project**, not endorsed by Marvel or Disney.
- Historical source code remains available in the repository's Git history and original main commit, even though the old source files are replaced.

## Future ideas

If you want a truly comprehensive live catalog, add a separately deployed serverless API proxy after verifying the data provider's terms, rate limits, image rights and secret storage. Never bundle private keys in browser JavaScript.
