# Job Desk — Simple Guide

Job Desk is a **personal job-hunt board** for any kind of work — teaching, nursing, design, sales, software, and more.

It helps you:

1. Find roles from company career pages  
2. Decide which ones to apply to  
3. Fill your saved details faster on company sites  

**You always click Submit yourself.** Job Desk never sends an application for you.

**Get the app:** https://github.com/saket-builds/open-job-desk

---

## Who this is for

You do **not** need to be a programmer to use Job Desk day to day.

- **Most people:** run it on your own laptop (recommended).  
- **Optional:** put it online with a free Vercel account so you can open it from any browser.  
- If a step says “ask a technical friend,” that part is usually a **one-time setup** — after that, everything is clicks.

The demo person in the app is fictional **Jordan Lee**. Replace that with **your** details before you apply anywhere.

---

## In plain words

1. Job Desk looks at company career boards (Greenhouse, Ashby, Lever).  
2. You review roles on three tabs: **To review** → **Applying now** → **History**.  
3. Colored **pills** on each role show skill matches (see below).  
4. On Greenhouse apply pages, a small Chrome helper can type your saved facts.  
5. You attach your résumé, answer extra questions, and click **Submit**.  
6. Back on Job Desk you mark **I submitted** and track replies.

> ✅ **You do:** Click Submit on the employer’s site  
> ⛔ **Job Desk never:** Scrapes LinkedIn or auto-submits forms

---

## Before you start

You’ll need:

- A computer (Windows, Mac, or Linux)  
- **Google Chrome**  
- About **15–20 minutes** the first time  
- Your résumé as a **PDF**  
- Optional: a free [Vercel](https://vercel.com) account if you want Job Desk online  

For the laptop setup you’ll also need **Node.js 20+** (free). If that sounds scary, ask a friend for the install step only — the rest of this guide is click-through.

---

## Step 1 — Open Job Desk on your laptop (recommended)

1. Open the project page: https://github.com/saket-builds/open-job-desk  
2. Click the green **Code** button → **Download ZIP**.  
3. Unzip the folder somewhere easy to find (for example your Desktop).  
4. Ask a technical friend (or follow Node’s own install site) to install **Node.js 20 or newer**.  
5. Open a terminal / PowerShell **inside** the unzipped folder.  
6. Run these three lines, one at a time:

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, if `cp` fails, use:

```powershell
Copy-Item .env.example .env.local
```

7. In Chrome, open: http://localhost:3000  

You should see Job Desk with tabs like **To review**, **Applying now**, and **History**.

![Desk running locally](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/terminal-dev.png)

> 💡 **Stuck here?** Hand this Step 1 to someone technical. Once `http://localhost:3000` opens, you can finish everything else yourself.

---

## Step 2 — Make it *your* job hunt (any sector)

Open **Your details**. The demo is Jordan Lee — change it.

### A. Your facts

1. Edit name, email, phone, location, work authorization.  
2. Upload your résumé PDF (**Upload PDF**).  
3. Edit the **application packet** (work history, education, salary / CTC text).  
4. Tap **Save**, then copy your **fill token**.  
5. Download **job-desk-fill-helper.zip**.

### B. Your targeting (this is how non-AI careers work)

Still on **Your details**, find **Which jobs to find**:

1. Set **skills** (above) to words from *your* résumé.  
2. Under **Places you can work**, type city/country words — one per line (`bangalore`, `india`).  
3. Under **Job titles you want**, type normal title words (`nurse`, `teacher`, `product designer`) — **not** code.  
4. For most non-tech careers, turn on **Show almost any job title**.  
5. Save targeting.

> 💡 Ignore **Show advanced rules** unless a technical friend needs it. Regex is optional now.

![Your details screen](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/desk-your-details.png)

---

## Step 3 — Add the Chrome helper

This small add-on shows a dark bar on Greenhouse apply pages.

1. Unzip **job-desk-fill-helper.zip** somewhere easy to find.  
2. In Chrome, open `chrome://extensions`  
3. Turn **Developer mode** on (top right).  
4. Click **Load unpacked** → choose the unzipped folder.  
5. Open the extension popup.  
6. Job desk URL: `http://localhost:3000` (or your online URL later).  
7. Paste your **fill token** → **Save**.

![Extension settings](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/ext-popup.png)

> 💡 The fill token only lets the helper **read** your facts. It does **not** submit any form.

---

## Step 4 — Understand the new job board UI

On the home page you’ll see three tabs:

| Tab | Meaning |
| --- | --- |
| **To review** | New roles waiting for your yes / no |
| **Applying now** | Roles you approved — go apply on the company site |
| **History** | Roles you already submitted (track Interview / Offer / Closed) |

### Colored skill pills

On each role card:

- **Green pill** = that skill looks like it’s already on your résumé / skills list  
- **Amber (yellow) pill** = the job asks for it — **check** before you claim it on the form  

There’s also a **Fit** number (higher ≈ closer match to your targeting). Treat it as a hint, not a rule.

A **Before you apply** tip box reminds you to attach your PDF and confirm remote roles hire in your locations.

![To review list with pills](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/desk-to-review.png)

---

## Step 5 — Everyday job hunt

1. Tap **Find new jobs** (or wait for the daily search if you deploy online).  
2. Open **To review**.  
3. Read the pills and tips → **Yes, I want to apply** or **Skip this one**.  
4. Go to **Applying now** → open the posting.  
5. On Greenhouse: dark bar → **Fill from résumé**.  
6. Attach your PDF yourself → answer company questions yourself → **you** click Submit.  
7. Back on Job Desk → **I submitted** → later update **History** when you hear back.

### Found a job somewhere else?

Paste a Greenhouse / Ashby / Lever link in **Add this job**.

- Normal add: respects your discovery filters.  
- Check **Force add** if the job was filtered out but you still want it on the desk.  

LinkedIn links are **not** supported.

![Fill helper bar](https://raw.githubusercontent.com/saket-builds/open-job-desk/master/docs/guide-assets/ext-bar.png)

---

## Step 6 — Put Job Desk online (optional, free)

Use this if you want Job Desk on your phone or another computer. **Laptop-only is enough** for a normal search.

### Easiest path for non-technical people

Ask a technical friend for **about 20 minutes** to:

1. Create a free [Vercel](https://vercel.com) account  
2. Import **saket-builds/open-job-desk** (or your fork)  
3. Add two settings (env vars):  
   - `BLOB_READ_WRITE_TOKEN` (create a Blob store in Vercel — needed so your details and jobs don’t disappear)  
   - `CRON_SECRET` (any long random password — protects the daily auto-search)  
4. Deploy  
5. Tell you the `https://….vercel.app` link  

Then **you**:

1. Open that link in Chrome  
2. Fill **Your details** again (online storage is separate from your laptop)  
3. In the Chrome helper, change Job desk URL to the Vercel link and paste the fill token  

> ⚠️ **Privacy:** Job Desk has **no login**. Anyone with your live link can see and change your desk. Keep the URL private (bookmark it; don’t post it publicly) or put access control in front of it.

### Prefer to do Vercel yourself?

1. Sign up at vercel.com with GitHub.  
2. **Add New Project** → import `open-job-desk`.  
3. Create a **Blob** store and copy `BLOB_READ_WRITE_TOKEN` into Project → Settings → Environment Variables.  
4. Add `CRON_SECRET` (make one up; long and random).  
5. Deploy.  
6. Open the URL → complete **Your details** → update the Chrome helper URL.

---

## Which jobs stay or get dropped?

That depends on **your** targeting — not only on the demo defaults.

Demo defaults keep **India / Bangalore** and **open remote**, and look for Applied AI–style titles.

For another country or sector:

1. Change home-location rules on **Your details**  
2. Turn on **Open title matching** or edit title rules  
3. Use **Force add** for one-off roles  

If a remote job never mentions your market, treat it as **unclear** — read the posting before you apply.

---

## If something goes wrong

**“Invalid fill token”**  
Copy the token again from **Your details** → paste in the extension → Save.

**No dark bar on the apply page**  
The helper mainly works on Greenhouse (`job-boards.greenhouse.io` or `boards.greenhouse.io`). For Ashby / Lever, fill the form yourself.

**Bar vanishes quickly**  
Use fill helper **v1.0.1+**, reload the extension, refresh the page.

**Filled 0 fields**  
Scroll to the form, click Fill again.

**To review is empty**  
Tap **Find new jobs**. Check targeting (open titles / locations). Or **Force add** a URL you already have.

**npm / Node errors on Step 1**  
Ask a technical friend — this is the only “install tools” step.

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
Here's Job Desk — a personal board for any job sector. Find roles, approve the ones you like, and fill Greenhouse forms faster. You always submit yourself.

Guide: https://saket-affine.duckdns.org/guides/job-desk/
GitHub: https://github.com/saket-builds/open-job-desk
```
