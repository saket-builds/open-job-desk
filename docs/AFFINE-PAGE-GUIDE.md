# Job Desk — Visual Guide

Open-source personal job desk for Applied AI roles.  
**GitHub:** https://github.com/wlddrick/open-job-desk  
**Slide walkthrough (optional):** https://wlddrick.github.io/open-job-desk/guide-assets/present.html

---

## What this is

Job Desk helps you:

1. Discover Greenhouse / Ashby / Lever AI jobs  
2. Approve roles on your desk  
3. Apply on the company site yourself  

You always click **Submit** yourself. Nothing is auto-submitted.

> ✅ **Do:** You click Submit on the employer site  
> ⛔ **Don’t:** LinkedIn scrape · auto-submit

**Flow:** Discover → Approve → Fill → You Submit → Track

Supports: Greenhouse · Ashby · Lever

---

## Install in 5 minutes

**Need:** Node 20+ and Chrome

```bash
git clone https://github.com/wlddrick/open-job-desk.git
cd open-job-desk
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

![Terminal — npm run dev](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/terminal-dev.png)

---

## Your details

Replace the demo **Jordan Lee** packet with your facts.

1. Open **Your details**  
2. Replace the demo packet (name, email, phone, work history, CTC text)  
3. Save → copy your **fill token**  
4. Download **job-desk-fill-helper.zip**

> 💡 **Tip:** The fill token unlocks your facts — it does **not** submit forms.

![Your details — Jordan Lee demo](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/desk-your-details.png)

---

## Chrome fill helper

1. Chrome → `chrome://extensions` → Developer mode ON → **Load unpacked**  
2. Paste Job desk URL + fill token → **Save**  
3. Open a Greenhouse apply page  
4. Dark bar → **Fill from résumé**  
5. Attach your résumé PDF yourself  
6. Answer custom / EEO questions yourself  
7. **You** click Submit on the company site  

> ⚠️ **Warning:** Bar flashes then gone? Use extension **v1.0.1+** (the bar re-mounts after React hydration).

![Fill helper bar](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/ext-bar.png)

![Extension popup](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/ext-popup.png)

---

## Daily loop

```text
Find new jobs → To review → Approve → Open posting → Fill → I submitted → Track
```

Paste a Greenhouse / Ashby / Lever URL anytime with **Add this job** (no LinkedIn links).

![To review lane](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/desk-to-review.png)

---

## How it works

```text
Portals → Scan + filters → Lanes → Packet → Chrome helper → Greenhouse form
```

> ✅ **Keep:** India + open remote  
> ⛔ **Drop:** Onsite-abroad + US/UK/EU residency rules  

Remote roles without India mentioned stay **unclear** — confirm they hire India-based employees before applying.

---

## Stuck? Fix it

| Problem | Fix |
| --- | --- |
| Invalid fill token | Recopy from Your details → Save in extension |
| No dark bar | Must be `job-boards.greenhouse.io` / `boards.greenhouse.io` |
| Bar vanishes | Reload fill helper **v1.0.1+** |
| Filled 0 fields | Scroll to the form → Fill again |
| Empty To review | Tap Find new jobs; check portal boards still resolve |

---

## Full visual slides (1–8)

Use these as a Present-style walkthrough inside the page, or open the live Present player above.

### 01 — Start here

![Frame 01](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-01.png)

### 02 — Install

![Frame 02](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-02.png)

### 03 — Your details

![Frame 03](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-03.png)

### 04 — Chrome fill

![Frame 04](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-04.png)

### 05 — Daily loop

![Frame 05](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-05.png)

### 06 — Architecture

![Frame 06](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-06.png)

### 07 — Troubleshoot

![Frame 07](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-07.png)

### 08 — Links + credits

![Frame 08](https://raw.githubusercontent.com/wlddrick/open-job-desk/master/docs/guide-assets/frames/frame-08.png)

---

## Deploy on Vercel (optional)

1. Import the repo into Vercel  
2. Set env: `PROFILE_JSON`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, optional `RESUME_URL`  
3. Deploy  
4. Point the Chrome extension desk URL at your deployment  
5. Cron routes: `/api/cron/scan` and `/api/cron/prepare` (see `vercel.json`)

---

## Ethics

Use this for **your own** applications. Respect employer and ATS terms. Do not spam or automate Submit.

---

## Credits

- License: MIT — see `LICENSE`  
- Credits: `CREDITS.md`  
- Demo packet is fictional **Jordan Lee** — replace with your own details  

### Instagram DM template

```text
Here's Job Desk — an open-source personal job desk (scan AI roles, approve, fill Greenhouse facts; you always submit yourself).

Guide: <THIS_AFFINE_SHARE_URL>
GitHub: https://github.com/wlddrick/open-job-desk
```
