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
| Favicon | `public/favicon.svg` |

## Photos

The photos in `public/images/` are placeholders until the academy has its own photos. Replace them by keeping the same file names. Only use photos of children with written permission from their parents.

| File | Used for | Source | License |
| --- | --- | --- | --- |
| `hero.jpg` | Top of the page | Thato Moiketsi, Pexels | Pexels License (free) |
| `khayelitsha-centre.jpg` | About | Andrea Grips, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Khayelitsha_Football_for_Hope_Centre.jpg) | CC BY-SA 3.0 – credit required |
| `portrait.jpg` | About | Pexels (photo 40134497) | Pexels License (free) |
| `khayelitsha-pitch.jpg` | How it works | Ed Suter, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Young_girl_practices_her_soccer_skills,_Khayelitsha,_Cape_Town.jpg) | CC BY-SA 4.0 – credit required |
| `training.jpg` | Training tile | Pexels (photo 34228180) | Pexels License (free) |
| `tournament.jpg` | Tournaments tile | Pexels (photo 38717055) | Pexels License (free) |
| `gear.jpg` | Gear tile | Pexels (photo 30100550) | Pexels License (free) |
| `street-sunset.jpg` | Partner school section | Rea Mapelele, Pexels | Pexels License (free) |

The two Wikimedia photos need a credit, which is in the page footer. Remove that footer line once those photos are replaced.

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
