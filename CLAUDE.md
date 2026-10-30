# Samba Street – project notes

Background for anyone (or any new chat) working on this project. See [README.md](README.md) for how to run, edit and deploy the site.

## The project

Samba Street is a charity football academy.

- It will partner with **one school**. No school has been chosen yet; we are still looking.
- **Boys only**: boys aged 9–12 from that school can sign up, and we **select 20 of them**. The school gives permission for its pupils to sign up; Samba Street organises the whole sign-up and selection. How players are selected is still open (to be discussed with the school).
- We provide **training twice a week**, enter **tournaments now and then**, and provide **the gear the kids need**.
- Everything is **completely free** for the kids, their parents and the school.

The website's current job is to **explain the project and build trust** with possible partner schools, parents and sponsors.

## Decisions made so far

- **Language:** English only.
- **Tech:** Astro static site, plain CSS (no Tailwind), no JavaScript framework.
- **No interactive features yet:** no forms, sign-ups or similar. These come later, once a partner school is found. Contact is only a `mailto:` email link.
- **Branding:** there was no existing logo or colours, so we designed our own (see below).
- **Structure:** one main page plus the **Journal** (news and blog, added Oct 2026, hidden until the first post, see below). The first version had Home, Program and About pages. The user asked to cut it down to one page; keep the information on the homepage.

## Design direction (user feedback)

- The user likes **minimal, clean and typography-led** design. The first version was rejected because it "looked very AI generated". Avoid:
  - emoji icons
  - rounded cards with shadows
  - gradient placeholder blocks
  - pill-shaped buttons
  - heavy display fonts
  - gimmicky animations, like the spinning ball we removed
- The user wants **lots of pictures and visuals**. People engage more when they can see things, and the page should make people want to read to the end. Be creative with where images and other visuals go.
- Current style:
  - off-white background `#f7f5f0`, near-black text
  - one font, **Inter Tight** (Google Fonts)
  - logo green `#004b3b` as a small accent and logo yellow `#f5c400` used sparingly (these are the official logo colours)
  - thin lines and spacing give the page its structure
  - all tokens are at the top of `src/styles/global.css`
- Logo: a round green-and-yellow badge with a celebrating player with dreadlocks (inspired by Tshabalala's 2010 goal) and "SAMBA STREET" around it. Made with ChatGPT. The full-size original (1254×1254 PNG) is `brand/samba-street-logo.png`; the site uses `public/images/logo.png` (also `logo-128.png`, `favicon.png`, `apple-touch-icon.png`). A clean vector version is still to come.
- Sections fade in as you scroll (`.reveal`). This only happens when JS runs: the layout adds a `js` class to `<html>`, so the content still shows without JS.

## Current page (src/pages/index.astro), top to bottom

1. A full-width hero photo (the user rates it 10/10, keep it) with the logo badge top-left (Journal and Contact links top-right), the headline "Free football for kids who love the game." and a short intro that starts with "Samba Street is a non-profit football academy in Khayelitsha, Cape Town." A separate location line above the headline was tried (faded, yellow, green label) and removed: hard to read or "ugly".
2. Key facts: 20 players · 9–12 years old · 2× training a week · R0 cost (rand, not euro: the academy is in South Africa).
3. About, with two photos (Khayelitsha football centre and a portrait).
4. How it works: 3 titled steps (We partner → We build a team → We develop), each with a short grey text, next to a sticky pitch photo. Three redesigns were mocked up earlier (photo timeline, green block, "many to 20" dot grid) and the user chose to **keep this layout**. Don't redesign it unless asked.
5. What we provide: training, tournaments and gear, as photo tiles (swipeable on phones). No intro sentence under the heading, and no captions under photos anywhere.
6. Latest from the journal: green block with the newest post large and up to two smaller ones. Hidden until the first post is published.
7. Callout: "Now looking for a partner school." with the email link, over a street photo.
8. Footer: "Non-profit football academy · Khayelitsha, Cape Town" and the photo credits.

Header and footer are shared components (`src/components/SiteHeader.astro`, `SiteFooter.astro`). The Journal link only shows once there is a published post.

## Journal (added Oct 2026)

- **Why:** to keep partner schools, parents and sponsors up to date. Text and photos now; **videos are the next step** (probably a YouTube link field, not uploads).
- **Pages:** `/journal/` lists posts, alternating photo left/right (mockup option C). `/journal/<slug>/` opens with a full-width cover photo with the title on it, like the homepage hero (mockup option B). The user chose this mix from three mockups; don't redesign without asking.
- **Writing:** the user writes in **Pages CMS** (app.pagescms.org, logs in with GitHub). Config is `.pages.yml`; every save is a commit to `main`, which deploys. Fields: title, date, summary, cover, coverAlt, draft, body. They must match `src/content.config.ts`. Filename is `{primary}.md` (the slugified title) and becomes the URL.
- **Photos:** uploaded to `src/assets/journal/` and written into posts as `../../assets/journal/…`, so Astro resizes them. Photos inside the text get several sizes from a small rehype plugin in `astro.config.mjs`. Only JPG, PNG and WebP.
- **Drafts** (`draft: true`) are committed but never built; filtering is in `src/journal.ts`.
- **Empty `.gitkeep` files** keep `src/content/journal/` and `src/assets/journal/` on GitHub when they have no posts or photos. Don't delete them: if the photo folder is missing, Pages CMS shows "Media folder not found" and hides its upload button.
- **Off until the first post** (the user's choice, Oct 2026): with no published posts nothing of the Journal is built, not even `/journal/`, so the live site looks as it did before the Journal. The list page is a rest route (`src/pages/journal/[...list].astro`) so its `getStaticPaths` can return nothing. Publishing the first non-draft post switches everything on. The user tried it with a test post (since deleted) and said it "looks perfect".
- **No posts yet** (Oct 2026). With zero posts the build prints "collection journal does not exist or is empty" warnings; that's expected. After removing the last post locally, build with `npx astro build --force` (stale content cache). GitHub Actions builds from scratch.
- **Privacy:** original uploads are public in the repo, including any GPS data in phone photos. The README asks the user to turn off camera location tagging. The resized photos on the site have no metadata.
- **Upload size:** a 1.4 MB PNG uploaded fine in Pages CMS (Oct 2026 test). A full-size phone photo (often 3–8 MB) is still untested; check it with the user when the first real post is written.
- **Setup in Pages CMS:** after the first push the editor showed only Admin items (Actions, Collaborators, Configuration) and no Journal; a browser reload fixed it.

## Writing style (user feedback)

- Say **"kids"**, not "children".
- Name the place as **"Khayelitsha, Cape Town"**: schools know Khayelitsha, sponsors know Cape Town.
- Plain, specific sentences. Avoid stock charity lines ("more than a game", "beyond the pitch") and don't repeat "free" where the page already says it.
- The user wants critical feedback on their text before it goes in: point out improvements first, then implement.
- Keep the Wikimedia photo credit in the footer as it is (the user decided).

## Partnership details (confirmed Oct 2026)

- **Training:** twice a week, after school, on the partner school's own field. Days and times are agreed with the school.
- **Coaches:** every session is led by trained coaches (who exactly is not decided yet).
- **Tournaments:** occasional only. Never promise a fixed frequency (not "every month" or similar).
- **Kit:** every player gets a home and away kit plus the gear they need. The kit design is "City Life" (`brand/kits-city-life.png`): home is Cape Town yellow, away is Table Mountain green. The design shows an adidas logo; the user chose to keep it on the vision board.
- **What we ask of the school:** permission for its pupils to take part, one contact teacher, and use of the school field two afternoons a week.
- **Timing:** starts **March 2027** and runs until at least the end of the 2027 school year.
- **Contact:** email `hello@sambastreet.charity` plus a WhatsApp number (shown on the vision board, not on the website).
- **Website mismatch to fix later:** the site still says "kids" without "boys only", shows a girl in How it works, and doesn't mention trained coaches or the March 2027 start.

## Vision board for principals

- A local teacher from Khayelitsha is pitching Samba Street to principals there, using a vision board shown on a laptop or tablet (also exported as PDF).
- It lives on claude.ai as a Design canvas: https://claude.ai/artifact/TaHCbcK23SY9NH1NkfgxxA. Four 1600×900 screens in the brand-green style: 1 The vision, 2 The partnership (what we bring / what we ask / the kits / what the school gains), 3 How it will look (5 steps, example week, team sheet), 4 Who is behind Samba Street (the founder's photo and his own story, written by him: keep his wording).
- The user asked not to include the teacher on the board for now.

## Logo history

- Rejected: stick-figure dancers; NBA-style panels (split, diagonal stripe, crest) with a silhouette cut out of the 2010 broadcast. The user said these "weren't close" or "didn't like any of these layouts".
- Chosen: the round badge the user made with ChatGPT (see Design direction). It is a PNG; the user knows and wants a proper vector version later.
- **Next logo step:** redraw as vector with the exact colours `#004B3B` / `#F5C400` (the PNG's own colours are slightly off, about `#003018` and `#f8d808`), reset "SAMBA STREET" in a real font, and make a simplified version for small sizes and embroidery.
- Raise with the user before printing: purely AI-made art usually can't be copyright-protected (a designer redraw fixes that), and the figure evokes Siphiwe Tshabalala, so ask for his blessing.
- The rejected drafts (`logo-concepts/`) were deleted in Oct 2026; the ChatGPT badge is the logo. The screen recording of the celebration in the project root must **never be committed** (56 MB, copyrighted footage).

## How the user likes to work

- Show **options as pictures first** (rendered mockups, about 3 options) before building anything visual. Clean up the mockup files afterwards if they aren't used.
- Put the options **side by side in one comparison picture** (one column per option, one row per page or section; a separate picture for phone) and open it for the user with `open <file>`. File links alone weren't enough. The user likes to mix options (for example "C for these pages, B for that one").
- Feedback is short and direct. If something is "not even close", start over rather than tweaking.
- Prefers imagery that fits the real context (Khayelitsha, South Africa) over generic stock.

## Photos

Temporary stock photos in `public/images/`, until we have our own. The up-to-date list with sources and licences is in the **Photos table in README.md**. Two of the photos come from Wikimedia (CC BY-SA) and **need a credit**, which is in the page footer. Remove that credit once those photos are replaced. Only use photos of children with written permission from their parents.

Photo choices (Oct 2026): the user keeps the hero, the girl on the pitch in How it works, the About photos and the Tournaments goalkeeper photo. Training (team drill) and Gear (boy pulling up his socks) were replaced because the old ones didn't match the text.

Unsplash blocks scripted downloads from its website. Downloading straight from `https://images.unsplash.com/photo-<id>?w=<width>&q=72&fm=jpg` does work.

## Still open / to fill in

- **Contact email:** `hello@sambastreet.charity` (set in `src/site.ts`). It is a free Google Workspace alias of the user's own mailbox, not a separate account.
- **Partner school:** name, training days and location are unknown until a school is found.
- **Real photos** of our own kids and team, to replace the stock photos.
- **Team:** no names yet. The old About page had placeholder names, and it has been removed.
- **Don't promise things the user hasn't confirmed.** Earlier drafts invented details: specific kit items (boots, shin guards), "kit to keep", "transport is on us", paying tournament entry fees, and selection "on enthusiasm and attitude". These were removed. Gear is now described generally, as "everything needed to play". Check with the user before adding specifics like these.
- **Online** at https://sambastreet.charity via GitHub Pages (public repo `GodsPlan027/samba-street`). Every push to `main` deploys through `.github/workflows/deploy.yml`. Domain is at Namecheap; DNS details are in README.

## Finance dashboard

- **Why:** Samba Street wants to be fully open about money in and out. Later, donors will log in to see this dashboard. That goes live once a partner school is found and the academy has run for a month, and it is not built yet; it will need a host with login protection. For now the user uses it themselves.
- Private dashboard at `/dashboard`. **Dev only:** it is added in `astro.config.mjs` only when running `astro dev`, and the page lives in `src/dashboard/`, not `src/pages/`. It must never end up in `dist/`.
- **Data:** the Google Sheet **"Dashboard"** in the Samba Street Google Drive (ID in `src/dashboard/config.ts`, link in README). Columns: `date,type,amount,category,description`. It is read on every page load through the Sheets API. Rows without an amount are skipped, so the user can keep blank template rows. Invalid rows are listed at the top of the dashboard.
- **Login:** service account `finance-dashboard@vhb-501517.iam.gserviceaccount.com`, which has Viewer access to the sheet. Its key is `google-service-account.json` in the project root (gitignored, never commit, share or publish it). The Google Cloud project is on the user's **personal Gmail**, because their work account can't create Cloud projects. The login is done with `node:crypto`, with no Google library.
- An older sheet, "Samba Street – Finances", is no longer used. Setting `SHEET_ID = ""` makes the dashboard read `data/finances.csv` (headers only) instead.
- **Categories** (in `src/dashboard/config.ts`): income is Individual donation and Fundraising event; spending is Training and Gear. Category names in the sheet must match these (case doesn't matter).
- **Chart colours:** green `#0a7d55` for money in and amber `#d9a000` for money out. They were checked for colour-blind safety and are slightly brighter than the brand colours for that reason. Charts are plain HTML/CSS and SVG, with a small inline script for tooltips.
- The user was very happy with how clean the dashboard looks. Keep new features in the same style.

## Checking changes

- `npm run build` must pass.
- Check the page at desktop width and at phone width (375–390px), with no sideways scrolling.
- Headless Chrome won't render narrower than about 500px. For phone screenshots, use puppeteer-core with mobile emulation, or put the page in a 375px-wide iframe.
- The repo is **public**. Commit only the files you changed by name (no `git add -A`): the folder often holds the user's own work in progress, like screen recordings and logo drafts.
