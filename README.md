# Samba Street website

Website for Samba Street, a free football academy for 20 kids aged 9–12. Built with [Astro](https://astro.build) as a static site.

## Run it locally

```sh
npm install
npm run dev      # open http://localhost:4321
npm run build    # builds the site into dist/
npm run preview  # preview the built site
```

## Where to edit things

| What | File |
| --- | --- |
| Contact email, site description | `src/site.ts` |
| Colors and font | top of `src/styles/global.css` |
| All page text | `src/pages/index.astro` |
| Journal posts | In the browser via Pages CMS (see [Journal](#journal) below). Files: `src/content/journal/` (text), `src/assets/journal/` (photos) |
| Journal pages and design | `src/pages/journal/` (list and post pages), the green strip in `src/pages/index.astro` |
| Header and footer | `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro` |
| Logo and icons | `brand/samba-street-logo.png` (full-size original), `public/images/logo.png`, `public/images/logo-128.png` (header), `public/favicon.png`, `public/apple-touch-icon.png` |

## Photos

The photos in `public/images/` are placeholders until the academy has its own photos. Replace them by keeping the same file names. Only use photos of children with written permission from their parents.

| File | Used for | Source | License |
| --- | --- | --- | --- |
| `hero.jpg` | Top of the page | Thato Moiketsi, Pexels | Pexels License (free) |
| `khayelitsha-centre.jpg` | About | Andrea Grips, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Khayelitsha_Football_for_Hope_Centre.jpg) | CC BY-SA 3.0 – credit required |
| `portrait.jpg` | About | Pexels (photo 40134497) | Pexels License (free) |
| `khayelitsha-pitch.jpg` | How it works | Ed Suter, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Young_girl_practices_her_soccer_skills,_Khayelitsha,_Cape_Town.jpg) | CC BY-SA 4.0 – credit required |
| `training.jpg` | Training tile | [Pexels (photo 28735311)](https://www.pexels.com/photo/28735311/) | Pexels License (free) |
| `tournament.jpg` | Tournaments tile | Pexels (photo 38717055) | Pexels License (free) |
| `gear.jpg` | Gear tile | [Pexels (photo 11326785)](https://www.pexels.com/photo/11326785/) | Pexels License (free) |
| `street-sunset.jpg` | Partner school section | Rea Mapelele, Pexels | Pexels License (free) |

The two Wikimedia photos need a credit, which is in the page footer. Remove that footer line once those photos are replaced.

## Journal

News and stories live at **https://sambastreet.charity/journal**. Posts are written in the browser with [Pages CMS](https://pagescms.org), a free editor that saves straight into this GitHub repo. No code needed.

The **Journal** link in the header and the green "Latest from the journal" block on the homepage appear automatically once the first post is published. Until then, /journal shows "First entry coming soon."

### One-time setup

1. Go to https://app.pagescms.org and sign in with the GitHub account that owns the repo.
2. When asked, install the Pages CMS app on the `samba-street` repository (only that repo is needed).
3. Open **samba-street**. You will see **Journal** in the menu.

### Write a post

1. Open **Journal → Add an entry**.
2. Fill in:
   - **Title**: also becomes the web address, for example `/journal/week-one-of-training/`. Changing the title later doesn't change the address.
   - **Date**: today by default. Posts are sorted newest first.
   - **Summary**: one or two sentences for the list and for link previews (WhatsApp, Facebook and so on).
   - **Cover photo**: the big photo at the top of the post. A landscape photo works best.
   - **Cover photo description**: a few words on what the photo shows, for people who can't see it.
   - **Text**: the post itself. To add a photo between paragraphs, type `/` and choose **Image**.
3. Click **Save**. The site is updated within 1–2 minutes.

To save a post without showing it yet, turn on **Draft**. Turn it off and save again to publish. Editing or deleting a post works the same way: open it, change it and save.

### Photos

- Use JPG or PNG. iPhone HEIC photos don't work. Most phones convert to JPG automatically when you upload from the browser.
- No need to make photos smaller first: the website automatically makes small versions for phones. The original upload is kept in the repo.
- Only use photos of kids with written permission from their parents.
- **Turn off location tagging** on the phone you use for academy photos (iPhone: Settings → Privacy & Security → Location Services → Camera → Never; Android: camera settings → Location tags off). Phone photos often contain where they were taken, and the original files are visible in the public GitHub repo. The photos shown on the website don't contain this.

Videos are a later step: they will most likely be embedded from YouTube rather than uploaded.

### How it works (for developers)

- Settings for the editor: `.pages.yml`. Fields must match the schema in `src/content.config.ts`.
- Posts are Markdown files in `src/content/journal/`. Photos are in `src/assets/journal/` and are referenced with relative paths (`../../assets/journal/…`), so Astro resizes them. A small plugin in `astro.config.mjs` gives photos inside the text several sizes.
- Drafts are filtered out in `src/journal.ts`.
- The empty `.gitkeep` files in `src/content/journal/` and `src/assets/journal/` keep those folders on GitHub while they're empty. Don't delete them: without the photo folder, Pages CMS can't upload photos.
- If you delete the last post locally, run `npx astro build --force` once to clear Astro's cache. GitHub always builds from scratch.

## Finance dashboard (private)

A dashboard of all money in and out lives at **http://localhost:4321/dashboard** while `npm run dev` is running. It is **not** part of `npm run build`, so it never goes online by accident.

- **Add a transaction:** add a row to the Google Sheet [Dashboard](https://docs.google.com/spreadsheets/d/1jW_o8oaL0nrQw0lfJrCPp-zSpwBL1B76VVl7PGaWoM4/edit) and refresh the dashboard.
- **Columns:** `date`, `type` (`in` or `out`), `amount`, `category`, `description`.
- **Categories:** money in is `Individual donation` or `Fundraising event`. Money out is `Training` or `Gear`. Change them in `src/dashboard/config.ts`.
- Rows with mistakes are listed at the top of the dashboard and left out of the totals until fixed.

### One-time setup: let the dashboard read the sheet

The sheet stays private. The dashboard logs in with a Google "service account", a robot account that you give read-only access to this one sheet.

1. Go to https://console.cloud.google.com and create a project (e.g. "Samba Street").
2. In that project, open **APIs & Services → Library**, search for **Google Sheets API** and click **Enable**.
3. Open **IAM & Admin → Service Accounts → Create service account**. Name it e.g. "finance-dashboard" and skip the optional role steps.
4. Click the new service account, open the **Keys** tab, choose **Add key → Create new key → JSON**. A file downloads.
5. Rename that file to `google-service-account.json` and put it in this project folder, next to `package.json`. **Never share this file or put it online.** It is already in `.gitignore`.
6. Copy the service account's email (ends in `.iam.gserviceaccount.com`). In the Google Sheet, click **Share**, paste it and give it **Viewer** access. Untick "Notify people".
7. Refresh the dashboard.

If step 4 says key creation is blocked, your Google Workspace has a security policy that blocks service account keys. Either create the Cloud project with a personal Gmail account instead (sharing the sheet with the service account still works), or ask your Workspace admin to allow keys.

To go back to a local CSV file, set `SHEET_ID = ""` in `src/dashboard/config.ts`. The dashboard then reads `data/finances.csv`.

Later, donors will be able to log in and see this page. That needs a host with login protection; the switch is in `astro.config.mjs`.

## Online

The site is live at **https://sambastreet.charity**, hosted for free on GitHub Pages.

- **Publish a change:** commit and push to `main`. GitHub builds and publishes the site in about a minute (see the Actions tab of the repo).
- **Repo:** https://github.com/GodsPlan027/samba-street (public, so never commit secrets).
- **Domain:** bought at Namecheap. DNS (Advanced DNS tab): four `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`, and a `CNAME` record `www` pointing to `godsplan027.github.io.`
- The file `public/CNAME` tells GitHub Pages which domain to use. Don't delete it.

## Still to fill in

- Partner school name, training days and location (once known)
