# Samba Street – project notes

Background for anyone (or any new chat) working on this project. See [README.md](README.md) for how to run, edit and deploy the site.

## The project

Samba Street is a charity football academy.

- It will partner with **one school**. No school has been chosen yet; we are still looking.
- Kids from that school can sign up. We **select 20 kids aged 9–12**.
- We provide **training twice a week**, enter **tournaments now and then**, and provide **the gear the kids need**.
- Everything is **completely free** for the kids, their parents and the school.

The website's current job is to **explain the project and build trust** with possible partner schools, parents and sponsors.

## Decisions made so far

- **Language:** English only.
- **Tech:** Astro static site, plain CSS (no Tailwind), no JavaScript framework.
- **No interactive features yet:** no forms, sign-ups or similar. These come later, once a partner school is found. Contact is only a `mailto:` email link.
- **Branding:** there was no existing logo or colours, so we designed our own (see below).
- **Structure:** a **single page** for now. The first version had Home, Program and About pages. The user asked to cut it down to one page.

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
- Logo: a round green-and-yellow badge with a celebrating player with dreadlocks (inspired by Tshabalala's 2010 goal) and "SAMBA STREET" around it. Made with ChatGPT; for now it's a PNG in `public/images/logo.png` (also `logo-128.png`, `favicon.png`, `apple-touch-icon.png`). A clean vector version is still to come.
- Sections fade in as you scroll (`.reveal`). This only happens when JS runs: the layout adds a `js` class to `<html>`, so the content still shows without JS.

## Current page (src/pages/index.astro), top to bottom

1. A full-width hero photo with the headline "Free football for kids who love the game."
2. Key facts: 20 players · 9–12 years old · 2× training a week · €0 cost.
3. About, with two photos (Khayelitsha football centre and a portrait).
4. How it works: 4 steps (partner school → kids sign up → 20 selected → train and play), next to a pitch photo.
5. What we provide: training, tournaments and gear, as photo tiles (swipeable on phones).
6. Callout: "Now looking for a partner school." with the email link, over a street photo.
7. Footer: "Non-profit football academy · Khayelitsha, Cape Town" and the photo credits.

## Photos

Temporary stock photos in `public/images/`, until we have our own. The up-to-date list with sources and licences is in the **Photos table in README.md**. Two of the photos come from Wikimedia (CC BY-SA) and **need a credit**, which is in the page footer. Remove that credit once those photos are replaced. Only use photos of children with written permission from their parents.

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
