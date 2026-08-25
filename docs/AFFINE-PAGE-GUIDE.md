# Job Desk — Simple Guide

Job Desk is a personal board that helps you find Applied AI jobs, decide which ones to apply to, and fill in your details faster on company sites.

You always click **Submit** yourself. Job Desk never sends an application for you.

**Get the app:** https://github.com/saket-builds/open-job-desk

---

## In plain words

1. Job Desk finds roles from company career pages (Greenhouse, Ashby, Lever).  
2. You review them on your desk and approve the ones you want.  
3. On the company apply page, a small Chrome helper can fill your saved details.  
4. You attach your résumé, answer any extra questions, and click Submit.  
5. You mark the job as submitted on your desk so you can track it.

> ✅ **You do:** Click Submit on the employer’s site  
> ⛔ **Job Desk never:** Scrapes LinkedIn or auto-submits forms

---

## Before you start

You’ll need:

- A computer with **Chrome**
- **Node.js 20 or newer** (free — ask a friend who’s technical if you’re unsure how to install it)
- About 10 minutes for the first setup

---

## Step 1 — Open Job Desk on your computer

1. Download the project from GitHub (green **Code** button → **Download ZIP**, or clone if you know how).  
2. Open a terminal in that folder.  
3. Run these commands one by one:

```bash
npm install
cp .env.example .env.local
npm run dev
```

4. In Chrome, open: http://localhost:3000

You should see your Job Desk home screen.

![Desk running locally](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/terminal-dev.png)

> 💡 **Stuck on this step?** Ask someone technical to help install Node and run those three commands. The rest of this guide is click-through.

---

## Step 2 — Put in your details

The demo person is **Jordan Lee**. Replace that with *your* information.

1. Open **Your details**  
2. Fill in your name, email, phone, work history, and salary text  
3. Tap **Save**  
4. Copy your **fill token** (a private code that unlocks your saved facts)  
5. Download **job-desk-fill-helper.zip**

> 💡 **Tip:** The fill token only lets the helper read your facts. It does **not** submit any form.

![Your details screen](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/desk-your-details.png)

---

## Step 3 — Add the Chrome helper

This is a small add-on that shows a dark bar on Greenhouse apply pages.

1. Unzip **job-desk-fill-helper.zip** somewhere easy to find  
2. In Chrome, open `chrome://extensions`  
3. Turn **Developer mode** on (top right)  
4. Click **Load unpacked** and choose the unzipped folder  
5. Open the extension popup  
6. Paste your Job Desk address (usually `http://localhost:3000`) and your fill token  
7. Click **Save**

![Extension settings](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/ext-popup.png)

---

## Step 4 — Fill an application (you still submit)

1. From your desk, open a job you approved (or open a Greenhouse apply link)  
2. Look for the dark bar → click **Fill from résumé**  
3. Attach your résumé PDF yourself  
4. Answer company-specific or EEO questions yourself  
5. **You** click **Submit** on the company site  
6. Back on Job Desk, mark **I submitted**

![Fill helper bar on an apply page](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/ext-bar.png)

> ⚠️ **Bar appears then disappears?** Reload the fill helper (version **1.0.1** or newer) and refresh the page.

---

## Step 5 — Your everyday routine

1. Tap **Find new jobs**  
2. Look at the **To review** list  
3. **Approve** roles you like  
4. Open the posting → use Fill when it’s Greenhouse  
5. Submit yourself → mark **I submitted** → track replies

You can also paste a Greenhouse / Ashby / Lever job link with **Add this job**.  
(LinkedIn links are not supported.)

![To review list](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/desk-to-review.png)

---

## Which jobs stay, which get dropped

Job Desk prefers roles that fit India-based / open remote work.

> ✅ **Usually kept:** India-friendly or clearly open remote  
> ⛔ **Usually dropped:** Must move abroad, or US/UK/EU residency required  

If a remote job never mentions India, treat it as **unclear** — check the posting before you apply.

---

## If something goes wrong

**“Invalid fill token”**  
Copy the token again from **Your details**, paste it in the extension, and Save.

**No dark bar on the apply page**  
The helper mainly works on Greenhouse apply pages (`job-boards.greenhouse.io` or `boards.greenhouse.io`).

**Bar vanishes quickly**  
Use fill helper **v1.0.1+**, then refresh the page.

**Filled 0 fields**  
Scroll down to the form, then click Fill again.

**To review is empty**  
Tap **Find new jobs**. If it’s still empty, the career boards may be down — try again later.

---

## Putting Job Desk online (optional)

Want it on the internet instead of only on your computer? Ask a technical friend to deploy the GitHub project on **Vercel** and point the Chrome helper at that web address. You don’t need this for daily use on your own laptop.

---

## Please use it fairly

Use Job Desk for **your own** applications. Respect company rules. Don’t spam employers or try to auto-click Submit.

---

## Credits

- Open source (MIT)  
- Demo profile is fictional **Jordan Lee** — always replace with your own details  
- Project: https://github.com/saket-builds/open-job-desk  

### Short message you can share

```text
Here's Job Desk — a personal board to find AI roles, approve ones you like, and fill Greenhouse forms faster. You always submit yourself.

Guide: https://saket-affine.duckdns.org/guides/job-desk/
GitHub: https://github.com/saket-builds/open-job-desk
```
