# Job Desk

Open-source personal job-search desk: discover Applied AI roles from Greenhouse / Ashby / Lever boards, review and approve them yourself, then apply on the company site. A Chrome helper can fill résumé facts on Greenhouse forms — **it never clicks Submit**.

Built as a founder-led side project. The repo ships with a **fictional demo profile (Jordan Lee)** so you can fork and replace it with your own details.

## What it does

- Scans ~80 ATS boards for AI / GenAI / LLM / soft SWE titles with AI signals in the JD
- Keeps India / Bangalore and **open remote** roles; drops onsite-abroad and US/UK/EU residency requirements
- Three lanes: **To review** → **Applying now** → **History**
- Paste Greenhouse / Ashby / Lever URLs to import a single job
- Application packet + fill token for the Chrome extension
- Optional Vercel deploy with Blob storage and daily cron scan

## What it does **not** do

- No LinkedIn scraping
- No auto-submit on employer sites
- Fill helper targets **Greenhouse** apply forms today (Ashby / Lever: import + manual apply)

## Visual guide

Present walkthrough (8 slides, arrow keys): https://saket-builds.github.io/open-job-desk/guide-assets/present.html

## Quick start

```bash
git clone https://github.com/saket-builds/open-job-desk.git
cd open-job-desk
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. **Your details** — replace the demo packet with your facts; set targeting; upload a résumé PDF; copy the fill token
2. **Find new jobs** — or wait for the daily scan if you deploy with cron
3. Approve roles → open the posting → **Fill from résumé** in Chrome → attach PDF → you Submit
4. Mark **I submitted** on the desk

## Trust model (read this)

This is a **personal single-user desk**, not a multi-tenant SaaS. Profile, packet, résumé, and pipeline APIs have **no login**. Run it on localhost, or put auth / access control in front of any hosted URL before loading real PII. Do not point a public `*.vercel.app` desk at your real résumé unless you understand that anyone with the URL can read and change desk state.

## Chrome fill helper

1. Download `job-desk-fill-helper.zip` from Your details (or use `chrome-extension/` after `npm run pack:fill`)
2. Chrome → Extensions → Developer mode → Load unpacked
3. Set Job desk URL (default `http://localhost:3000`) and paste the fill token → Save
4. Open a Greenhouse apply page → tap **Fill from résumé** on the dark bar

If you deploy to Vercel, set the desk URL in the extension popup to your deployment. Host permissions include `https://*.vercel.app/*`.

## Environment

See [`.env.example`](.env.example).

**Required on Vercel**

- `BLOB_READ_WRITE_TOKEN` — persistent pipeline, profile, and résumé state
- `CRON_SECRET` — required in production; Vercel Cron sends it as `Authorization: Bearer …`

**Optional**

- `PROFILE_JSON` — seed targeting (or edit **Your details**; sample: [`docs/profile.sample.json`](docs/profile.sample.json))
- `RESUME_URL` — if you prefer env over in-app PDF upload

### Any job sector

Demo defaults are Applied AI + India/open-remote. On **Your details** you can:

1. Edit skills, role families, seniority, and locations  
2. Turn on **Open title matching** and set home-location regexes for another market  
3. Add ATS boards (`greenhouse:board:Name`) or replace the built-in list  
4. **Force add** a Greenhouse/Ashby/Lever URL that discovery would filter out  

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js |
| `npm run build` | Production build (+ packs fill helper) |
| `npm run test:discovery` | Location / title filter tests |
| `npm run test:fill` | Packet + fill-engine tests |
| `npm run pack:fill` | Rebuild `public/fill-helper` and zip |

## Credits

Third-party projects and APIs are listed in [CREDITS.md](CREDITS.md).

## License

[MIT](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

