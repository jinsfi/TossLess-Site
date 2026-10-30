# TossLess Website — Build & Growth Plan

Last updated: 2026-10-30

This file is the single source of truth for the TossLess marketing website: what to build, how to build it, what to write, and how to grow it. It is written for two readers:

- **Claude Code**, which builds and maintains the site (sections 1–8).
- **Me, the owner**, who handles accounts, writing review, promotion, measurement and launch (sections 9–13).

---

## How to use this file with Claude Code

Put this file in the root of an empty folder (or the site repo) and start Claude Code there.

**Rules for Claude Code**

1. Read this whole file before doing anything.
2. If any value in section 0 is still `TODO`, ask me for it before using it. Never invent a domain, app ID, form code or token.
3. Work one phase at a time (section 5). Stop at the end of each phase, run `npm run build`, check every acceptance criterion, then tick its boxes in this file and commit.
4. Astro and Cloudflare APIs change. Before writing config or using an integration, check the current official docs (docs.astro.build, developers.cloudflare.com) rather than relying on memory.
5. Keep dependencies minimal. No UI framework (React, Vue, etc.), no CSS framework, no database, no CMS.
6. Follow the content rules in section 7 for anything involving food storage times. Never invent them.

**Example prompts**

- "Read TOSSLESS_SITE_PLAN.md, ask me for the section 0 values, then do Phase 1 and stop."
- "Do Phase 3. Show me the build output and which acceptance criteria pass."
- "Draft topic #2 from the content calendar, following section 7. Keep it as a draft."
- "Add these foods to the shelf-life data using this official source: [URL]."

---

## 0. Settings to fill in first

| Setting | Value | Notes |
| --- | --- | --- |
| Site language | `en` | `en` or `fr`. One language only to start: the main language of the App Store listing. |
| Domain | `tosslessapp.com` | e.g. tosslessapp.com or gettossless.com. Bought on Cloudflare Registrar. |
| Site name | TossLess | |
| Tagline | Know what to eat first. Add food in seconds, get one reminder a day, and stop throwing food and money away. | One sentence: what the app does for people. |
| Byline | The TossLess team | Shown on every article. No personal name or photo anywhere on the site. |
| Contact email | `contact@tosslessapp.com` | For the press kit and privacy page. |
| Brand colors | See `design/tokens.ts` in the app repo (primary `#2E7D4F`, background `#FAF7F2`) | Primary, accent, background, text. Taken from the app. |
| App icon + screenshots | `TODO` | Exported from the app; go in `public/press/`. |
| Kit form | `TODO` | Form embed code or form action URL from the Kit dashboard. |
| Cloudflare Web Analytics token | `TODO` | From the Cloudflare dashboard. |
| App Store ID and URL | *(empty until approval)* | Numeric Apple ID, filled on launch day. |
| `app.launched` | `false` | Flipped to `true` on launch day (Phase 8). |

---

## 1. Goal and strategy

**Goal:** a small, free-to-run site that brings people searching about food storage and food waste to TossLess, collects a waitlist before launch, and sends visitors to the App Store after launch.

**Budget:** about $10–15 a year for the domain. Everything else runs on free plans.

**The 2026 search reality.** Google now answers simple informational questions ("how long does rice last") in an AI Overview above the results. In Pew Research Center's panel study, people clicked a regular result 8% of the time when an AI Overview appeared, versus 15% without one. AI Overviews show up far less on tool and calculator searches (25%) than on informational ones (70%) in one 2026 study. So the site mixes three kinds of pages:

| Page type | Example | Why it still earns clicks |
| --- | --- | --- |
| App-intent pages | Best apps to track food expiration dates | The reader already wants an app |
| Free tools and printables | Fridge and freezer storage chart (PDF), shelf-life lookup | People click through to download or use them |
| Specific, situational answers | Cooked rice left out overnight: is it safe? | Narrow questions where a small site can rank or be the cited source |

Every article answers its question in the first 2–3 sentences (answer-first pages are what AI Overviews pick to cite) and then adds what an AI summary can't: original photos, small tests and hands-on experience.

**Timeline:** expect almost no search traffic for the first 2 months. Judge topics after 3 months, not 3 weeks.

---

## 2. Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Astro** (current major version), static output | Built for content sites; pages ship as plain HTML. Cloudflare acquired the Astro team in January 2026; Astro stays open-source. |
| Articles | **Markdown** files in an Astro content collection | One `.md` file per article, typed frontmatter. |
| Styling | Plain CSS with CSS variables, Astro scoped styles | System font stack. No Tailwind or CSS framework. |
| Interactivity | Vanilla JS, only on the shelf-life lookup page | Everything else ships zero JavaScript (except the analytics beacon and, if needed, the Kit form). |
| Code hosting | **GitHub** (free) | `main` auto-deploys. |
| Web hosting | **Cloudflare** (Workers static assets, or Pages) | Static sites are free with no bandwidth or request limits. Cloudflare currently recommends Workers for new projects; follow its current Astro guide. |
| Domain + DNS | **Cloudflare Registrar** | At-cost pricing, same dashboard as hosting. |
| Email waitlist | **Kit**, free plan | Free up to 10,000 subscribers. |
| Analytics | **Cloudflare Web Analytics** + **Google Search Console** + **Bing Webmaster Tools** | All free. |
| Printables | Figma, Canva or Keynote, exported to PDF | Stored in `public/printables/`. |

---

## 3. Site map and URLs

| URL | Page | Purpose |
| --- | --- | --- |
| `/` | Home | What TossLess does, screenshots, waitlist (pre-launch) or App Store badge (post-launch), latest articles |
| `/blog/` | Article index | All published articles, newest first, filterable by type |
| `/blog/<slug>/` | Article | One question per article |
| `/printables/` | Printables index | Storage chart, freezer inventory, fridge inventory (PDF downloads) |
| `/shelf-life/` | Shelf-life lookup | Search a food, see storage times with source links |
| `/about/` | About | Why TossLess exists and how articles are fact-checked (brand only: no personal name or photo) |
| `/press/` | Press kit | Icon, screenshots, 2-sentence pitch, contact |
| `/privacy/` | Privacy policy | The app's policy plus the website's (analytics, email signup) |
| `/rss.xml` | RSS feed | For readers and aggregators |
| `/404` | Not found | Links to home, blog and shelf-life |

Slugs: short, lowercase, hyphenated, the question's key words (e.g. `cooked-rice-left-out-overnight`). Never change a slug after publishing; if you must, add a redirect.

---

## 4. Project structure

```
/
├─ TOSSLESS_SITE_PLAN.md          this file
├─ astro.config.mjs               site URL, sitemap integration
├─ wrangler.jsonc                 only if deploying via Cloudflare Workers
├─ public/
│  ├─ robots.txt
│  ├─ favicon.svg
│  ├─ apple-touch-icon.png
│  ├─ og-default.png              1200×630 default share image
│  ├─ press/                      icon, screenshots
│  └─ printables/                 PDFs
├─ scripts/
│  └─ check-foods.mjs             validates src/data/foods.json
└─ src/
   ├─ config/site.ts              all settings from section 0
   ├─ content.config.ts           blog collection schema (check current Astro docs for file name and API)
   ├─ content/blog/*.md           articles
   ├─ data/foods.json             shelf-life lookup data
   ├─ components/
   │  ├─ BaseHead.astro           title, meta, canonical, OG, JSON-LD slot, analytics
   │  ├─ Header.astro
   │  ├─ Footer.astro
   │  ├─ AppCta.astro             waitlist before launch, App Store badge after
   │  ├─ WaitlistForm.astro       Kit form
   │  ├─ AppStoreBadge.astro      Apple's official badge, links to the App Store
   │  ├─ RelatedPosts.astro       3 articles of the same type
   │  ├─ ArticleJsonLd.astro      Article structured data
   │  └─ Breadcrumbs.astro        with BreadcrumbList structured data
   ├─ layouts/
   │  ├─ BaseLayout.astro
   │  └─ PostLayout.astro
   ├─ pages/
   │  ├─ index.astro
   │  ├─ blog/index.astro
   │  ├─ blog/[...slug].astro
   │  ├─ printables/index.astro
   │  ├─ shelf-life.astro
   │  ├─ about.astro
   │  ├─ press.astro
   │  ├─ privacy.astro
   │  ├─ 404.astro
   │  └─ rss.xml.ts
   └─ styles/global.css
```

`src/config/site.ts` (shape; values come from section 0):

```ts
export const site = {
  name: 'TossLess',
  url: 'https://TODO',          // no trailing slash
  lang: 'TODO',                 // 'en' or 'fr'
  tagline: 'TODO',
  author: { name: 'The TossLess team', url: '/about/' },  // brand byline: no personal name or photo
  contactEmail: 'TODO',
  app: {
    launched: false,            // flip on launch day
    appStoreId: '',             // numeric Apple ID
    appStoreUrl: '',
  },
  kit: { formAction: 'TODO' },  // or embed code, per Kit's current docs
  analytics: { cloudflareToken: 'TODO' },
};
```

---

## 5. Build phases (Claude Code)

### Phase 1 — Scaffold and first deploy

- Create an Astro project (static output) using Cloudflare's or Astro's current setup command. Starting from Astro's official blog template is fine; strip anything not in this plan.
- Add `src/config/site.ts` with the section 0 values.
- Set `site` in `astro.config.mjs` to the domain.
- Deploy to Cloudflare from the GitHub repo so every push to `main` redeploys.

**Acceptance criteria**

- [x] `npm run build` succeeds with no warnings about missing `site`.
- [x] The site loads on a Cloudflare preview URL. (workers.dev URL is switched off; the site is served on the custom domain.)
- [x] Pushing to `main` triggers a new deploy.
- [x] The custom domain serves the site over HTTPS (once the owner has bought it).

### Phase 2 — Layout and core pages

- `BaseLayout` with Header (logo, Blog, Shelf-life, Printables, About) and Footer (Press, Privacy, contact email, © year).
- Pages: Home, Blog index, About, Press, Privacy, 404, Printables index (with placeholder cards until PDFs exist).
- Home: tagline, one-sentence explanation, 3–4 screenshots, `AppCta`, 6 latest articles.
- About: what TossLess is, why it exists, and a "How we check facts" section (anchor `#how-we-check`): official sources only, a last-checked date on every article, and an email for corrections. No personal name or photo anywhere on the site.
- Mobile-first responsive layout; readable line length (about 65–75 characters) for articles.
- Brand colors as CSS variables in `global.css`; light and dark themes via `prefers-color-scheme`.

**Acceptance criteria**

- [x] All pages in the site map exist (except shelf-life, Phase 7) and build.
- [x] No horizontal scrolling at 360 px width.
- [x] `<html lang>` matches `site.lang`.
- [x] Every image has meaningful `alt` text; screenshots use Astro's image optimization.

### Phase 3 — SEO plumbing

- `BaseHead.astro` on every page:
  - `<title>`: `Page title · TossLess` (home: `TossLess — {tagline}`)
  - meta description (from frontmatter or page props; max ~155 characters)
  - canonical URL
  - Open Graph: title, description, url, type, image (`og-default.png` unless the page sets one)
  - Twitter/X card: `summary_large_image`
  - `theme-color`, favicon, apple-touch-icon
- Structured data (JSON-LD):
  - Home: `WebSite` + `Organization` (name, url, logo)
  - Articles: `Article` (headline, description, image, datePublished, dateModified, author as an `Organization` named TossLess with URL to /about/, not a person)
  - Article pages: `BreadcrumbList` (Home › Blog › Article)
- Official Astro sitemap integration.
- `public/robots.txt`: allow all, plus `Sitemap: https://<domain>/sitemap-index.xml` (match the file name the sitemap integration actually generates).
- RSS feed at `/rss.xml` with published (non-draft) articles.
- Draft articles (`draft: true`) are excluded from pages, sitemap and RSS.

**Acceptance criteria**

- [ ] Every page has a unique title and description (no duplicates across the build).
- [ ] Canonical URLs are absolute and use the real domain.
- [ ] Article JSON-LD validates in Google's Rich Results Test (owner checks after deploy).
- [ ] Sitemap and RSS list only published articles.
- [ ] `robots.txt` points to the sitemap that exists.

### Phase 4 — Waitlist and call to action

- `WaitlistForm.astro`: email field, submit button, one line saying what they're signing up for ("One email when TossLess launches, then occasional food-saving tips. Unsubscribe anytime."). Prefer a plain HTML form posting to Kit over Kit's JavaScript embed, if Kit's current docs allow it, to keep the site light.
- `AppCta.astro`:
  - `site.app.launched === false` → heading + `WaitlistForm`
  - `site.app.launched === true` → heading + `AppStoreBadge` linking to `site.app.appStoreUrl`
- `AppStoreBadge.astro`: uses Apple's official "Download on the App Store" badge artwork from Apple's marketing resources. Do not recreate or restyle the badge.
- `AppCta` appears on Home, at the end of every article, and on the shelf-life page.
- Privacy page: add a section on the email signup (what's collected, why, Kit as processor, how to unsubscribe) and on analytics.

**Acceptance criteria**

- [ ] A test signup reaches the Kit list (owner checks).
- [ ] Switching `app.launched` to `true` swaps every CTA to the badge with no other code change.
- [ ] The form works without JavaScript enabled.

### Phase 5 — Content system

- Blog collection schema (frontmatter):

```yaml
title: "Cooked rice left out overnight: is it safe?"   # the question as people search it
description: "..."                                       # max ~155 characters
pubDate: 2026-11-30
updatedDate: 2026-12-10        # optional
lastChecked: 2026-11-30        # date facts were last verified against sources
type: fridge                   # app-intent | date-labels | fridge | freezer | habits | seasonal | resource | tool
heroImage: ./images/rice.jpg   # optional; the owner's own photo
heroAlt: "..."                 # required if heroImage is set
sources:                       # required for any article that states storage times
  - name: "Official food-safety agency page title"
    url: "https://..."
draft: true
```

- Schema validation fails the build if a non-draft article of type `fridge`, `freezer`, `date-labels` or `seasonal` has no `sources`.
- `PostLayout`: breadcrumbs, title, byline ("By the TossLess team" linking to /about/#how-we-check, published date, "Last checked" date), content, sources list, `AppCta`, `RelatedPosts`.
- `RelatedPosts`: up to 3 published articles of the same `type`, newest first; fill from other types if fewer than 3.
- Blog index: newest first, simple filter links by type.
- Add one example draft article from the template in section 7 to prove the pipeline (not published).

**Acceptance criteria**

- [ ] A non-draft fridge article without `sources` fails the build with a clear message.
- [ ] Byline shows author, published date and last-checked date.
- [ ] Sources render as a list of links at the end of the article.
- [ ] Related posts never include the current article.

### Phase 6 — Printables

- `/printables/` lists each PDF with a preview image, a one-line description, a download link, and `AppCta`.
- PDFs live in `public/printables/`. The owner designs them; Claude Code only builds the page and can generate a preview PNG from page 1 if useful.
- Each printable links to the related articles, and those articles link back.

**Acceptance criteria**

- [ ] Download links work and serve the correct file.
- [ ] Each printable card has a unique title and description for sharing.

### Phase 7 — Shelf-life lookup page

- `src/data/foods.json`, array of entries:

```json
{
  "id": "cooked-rice",
  "name": "Cooked rice",
  "aliases": ["leftover rice", "rice"],
  "category": "grains",
  "pantry": null,
  "fridge": "TODO-VERIFY",
  "freezer": "TODO-VERIFY",
  "notes": "",
  "source": { "name": "", "url": "" },
  "article": "/blog/cooked-rice-left-out-overnight/"
}
```

- `scripts/check-foods.mjs` runs before build (`prebuild` script) and:
  - excludes any entry whose storage fields contain `TODO-VERIFY` or whose `source.url` is empty, and prints a list of excluded entries;
  - fails the build on duplicate `id`s or malformed entries.
- `/shelf-life/`: a search box filtering by name and aliases, results showing pantry / fridge / freezer, notes, a source link, and a link to the full article when one exists. Small vanilla JS script, data inlined at build time. Works as a full list (no search) without JavaScript.
- Short intro paragraph and `AppCta` ("TossLess tracks this for you").
- Do not generate one page per food. One searchable page only; thin auto-generated pages risk being treated as low-value content.

**Acceptance criteria**

- [ ] Entries without a verified source never appear on the page.
- [ ] Search finds foods by aliases, ignoring case and accents.
- [ ] The page is usable at 360 px width and with JavaScript off.

### Phase 8 — Launch switch (run when Apple approves the app)

- Owner provides the App Store ID and URL; set `app.launched = true`.
- Add the Smart App Banner meta tag to `BaseHead` when launched: `<meta name="apple-itunes-app" content="app-id=APP_STORE_ID">`.
- Update the home hero copy from "Coming soon" to launch copy.
- Keep the waitlist form on the About page or footer for updates.

**Acceptance criteria**

- [ ] No page still says "coming soon".
- [ ] Every CTA shows the App Store badge with the correct link.
- [ ] Smart App Banner appears on iPhone Safari (owner checks).

### Phase 9 — Quality pass (run after Phase 7, then monthly)

- Lighthouse (mobile) ≥ 95 on Performance, Accessibility, Best Practices and SEO for Home, one article, and shelf-life.
- No broken internal links (add a link check to the build or a script).
- Total JavaScript on article pages: only the analytics beacon (and the Kit script if a plain form isn't possible).
- Cloudflare Web Analytics beacon on every page, using the token from config.

**Acceptance criteria**

- [ ] Lighthouse scores recorded here: Home ___ · Article ___ · Shelf-life ___
- [ ] Link check passes.

---

## 6. Content calendar

Week 1 starts Monday 2 November 2026. Two pieces a week, in this order. Swap any topic that fails the keep-or-skip test (section 10).

| # | Week | Dates | Topic | Type | Suggested slug | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 | Nov 9–15 | Best apps to track food expiration dates | app-intent | best-food-expiration-tracker-apps | Not started |
| 2 | 2 | Nov 9–15 | Use-by vs best-before: what's the difference? | date-labels | use-by-vs-best-before | Not started |
| 3 | 3 | Nov 16–22 | How to keep track of food expiration dates at home | app-intent | track-food-expiration-dates-at-home | Not started |
| 4 | 3 | Nov 16–22 | Holiday leftovers: how long they keep in the fridge | seasonal | holiday-leftovers-how-long | Not started |
| 5 | 4 | Nov 23–29 | Fridge and freezer storage chart (free printable PDF) | resource | fridge-freezer-storage-chart | Not started |
| 6 | 4 | Nov 23–29 | Can you eat food after the best-before date? | date-labels | eat-food-after-best-before-date | Not started |
| 7 | 5 | Nov 30–Dec 6 | Can you freeze cheese? Which kinds work | freezer | can-you-freeze-cheese | Not started |
| 8 | 5 | Nov 30–Dec 6 | Cooked rice left out overnight: is it safe? | fridge | cooked-rice-left-out-overnight | Not started |
| 9 | 6 | Dec 7–13 | How to organize your fridge so food lasts longer | habits | organize-fridge-food-lasts-longer | Not started |
| 10 | 6 | Dec 7–13 | How long does milk last once opened? | fridge | how-long-opened-milk-lasts | Not started |
| 11 | 7 | Dec 14–20 | Freezer inventory template (free printable) | resource | freezer-inventory-template | Not started |
| 12 | 7 | Dec 14–20 | How long cooked leftovers last, dish by dish | fridge | how-long-leftovers-last | Not started |
| 13 | 8 | Dec 21–27 | Can you refreeze food after thawing? | freezer | refreeze-food-after-thawing | Not started |
| 14 | 8 | Dec 21–27 | Opened jar of pasta sauce: how long in the fridge? | fridge | opened-pasta-sauce-fridge | Not started |
| 15 | 9 | Dec 28–Jan 3 | How long meat keeps in the freezer | freezer | how-long-meat-keeps-in-freezer | Not started |
| 16 | 9 | Dec 28–Jan 3 | 10 habits that stop you throwing away food | habits | habits-to-stop-wasting-food | Not started |
| 17 | 10 | Jan 4–10 | Shelf-life lookup page (search a food, see storage times) | tool | /shelf-life/ | Not started |
| 18 | 10 | Jan 4–10 | Hard-boiled eggs: how long they keep | fridge | hard-boiled-eggs-how-long | Not started |
| 19 | 11 | Jan 11–17 | Freezer burn: is the food still safe? | freezer | freezer-burn-safe-to-eat | Not started |
| 20 | 11 | Jan 11–17 | What to cook with food that's about to expire | habits | cook-food-about-to-expire | Not started |
| 21 | 12 | Jan 18–24 | Cooked chicken in the fridge: how many days? | fridge | cooked-chicken-fridge-how-long | Not started |
| 22 | 12 | Jan 18–24 | How much food a household throws away, and what it costs | habits | household-food-waste-cost | Not started |
| 23 | Later | | Can you freeze milk? | freezer | can-you-freeze-milk | Not started |
| 24 | Later | | Can you freeze bread? | freezer | can-you-freeze-bread | Not started |
| 25 | Later | | How long cut fruit lasts in the fridge | fridge | cut-fruit-fridge-how-long | Not started |
| 26 | Later | | Opened yogurt and cream: how long they last | fridge | opened-yogurt-cream-how-long | Not started |
| 27 | Later | | Meal planning around what's already in your fridge | habits | meal-planning-use-what-you-have | Not started |
| 28 | Later | | "Sell by" dates explained (English site only) | date-labels | sell-by-dates-explained | Not started |
| 29 | Later | | Fridge inventory template (free printable) | resource | fridge-inventory-template | Not started |
| 30 | Later | | TossLess vs other expiry apps (after launch) | app-intent | tossless-alternatives | Not started |

Slugs are suggestions: adjust them to the site language and the exact phrasing found in keyword research.

---

## 7. Content rules (for drafting with Claude Code)

### Accuracy (non-negotiable)

- **Never invent storage times, temperatures or safety claims.** Every number comes from an official food-safety agency page (for example the national food-safety authority of the readers' country) that I provide or that you fetch, and it is cited in `sources`.
- If you can't find an official source for a number, write `TODO-VERIFY` in its place and tell me.
- When sources disagree, use the more cautious figure and say so in the article.
- Every article starts as `draft: true`. I review and publish.

### Experience (what makes it worth clicking)

- Never fabricate first-hand experience. Leave clearly marked placeholders where my own material goes: `[OWNER PHOTO: ...]`, `[OWNER TEST: ...]`, `[OWNER NOTE: ...]`.
- Each article should have at least one of: a photo I took of the food or fridge (no face), a small test I ran, or a chart I made.
- Publishing large volumes of AI-written pages with no added value can hurt the whole site in Google. Fewer, better articles win.

### Structure

```markdown
# [The question, as people type it]

[Direct answer in 2–3 sentences, with the number and its source.]

## Quick answer
| Where | How long |
| --- | --- |
| Counter | ... |
| Fridge | ... |
| Freezer | ... |

## How to tell it's gone bad

## How to make it last longer

## Common questions
### [Situation 1, e.g. left out overnight?]
### [Situation 2, e.g. can you reheat it twice?]
### [Situation 3, e.g. can you freeze it?]

[OWNER PHOTO / OWNER TEST]

Related: [2–3 links to other articles]
```

(The CTA, byline, sources list and related posts come from `PostLayout`; don't repeat them in the Markdown.)

### Style

- Length: 600–1,200 words. Stop when the question is fully answered.
- Title = the question as people search it. Description = the answer in one sentence.
- Plain words, short sentences, short paragraphs. Use the reader's units (°C or °F) for the site language.
- No fear-mongering and no "when in doubt, it's probably fine" either: state what the source says.
- Link 2–3 related articles inline, and link back from older articles when a new one is published.
- App-intent pages are honest: list real alternatives fairly, explain where TossLess fits, don't make claims about competitors you can't back up.

---

## 8. Definition of done for any change

- [ ] `npm run build` passes (including food-data check and link check).
- [ ] No new client-side JavaScript unless this plan calls for it.
- [ ] New pages have a unique title, description, canonical and OG image.
- [ ] Changes are committed with a clear message; this file is updated if the plan changed.

---

## 9. Owner tasks (outside the code)

### Week 1 (Nov 2–8)

- [ ] Fill in every `TODO` in section 0.
- [ ] Create accounts: GitHub, Cloudflare, Kit.
- [ ] Buy the domain on Cloudflare Registrar and connect it to the site.
- [ ] Verify the domain in Google Search Console; submit the sitemap.
- [ ] Add the site to Bing Webmaster Tools (import from Search Console).
- [ ] Turn on Cloudflare Web Analytics and give Claude Code the token.
- [ ] If Cloudflare's AI-crawler blocking is on, check it still lets Googlebot and Bingbot through.
- [ ] Export app icon and screenshots into `public/press/`.
- [ ] Write the About page text: why TossLess exists and how articles are checked (no name or photo).
- [ ] Check that WHOIS privacy is on for the domain, so the registration doesn't show my name.
- [ ] Email tools, Kit included, show a postal address in every email footer because anti-spam laws require it. Use a P.O. box or virtual mailbox address, not my home.
- [ ] Make one test signup on the live waitlist form.

### Weekly routine (from week 2)

1. **Monday:** pick the next 2 topics from section 6 and run the keep-or-skip test (about 20 minutes).
2. **Tuesday–Thursday:** draft with Claude Code, add my own photo or test, check every number against its source, publish (set `draft: false`).
3. **Friday:** give each new article one push (section 11) and link it from 2 older articles.

### Monthly (first weekend)

Run the checks in section 12 (about 30 minutes) and update the Status column in section 6.

---

## 10. Keyword research (free method)

1. **Collect questions.** Type starters into Google and note autocomplete, "People also ask" and related searches: "how long does [food] last…", "can you freeze [food]", "[food] left out overnight", "is it safe to eat [food] after…", "app to track…", "how to keep track of food…".
2. **Borrow real wording.** Read cooking and food-safety threads on Reddit and forums; people's phrasing is often the exact search.
3. **Prefer long, specific questions** with a situation in them ("opened pasta sauce in the fridge for 10 days") over short ones ("pasta sauce shelf life").
4. **Keep-or-skip test.** Search the question:
   - **Keep** if page 1 shows Reddit, forums or small blogs, or the AI answer at the top is vague or hedged.
   - **Go narrower** if page 1 is all government sites and big food media and the AI answer covers it completely.
5. **Season.** Check Google Trends; publish 1–2 months before a topic peaks (holiday leftovers peak in December).
6. **From week 6:** Search Console shows searches you already appear for. Topics with impressions but few clicks are the best next articles.

---

## 11. Promotion (free)

AI answers lean heavily on Reddit, forums and YouTube when choosing what to cite, so showing up there helps twice.

- **Pinterest:** one pin per article, two or three per printable.
- **Reddit and forums:** answer questions about leftovers and storage fully in the thread; link only where the community allows it and the page adds something.
- **Short videos:** turn articles into 30-second clips (YouTube Shorts, TikTok, Reels) with the site in the profile.
- **Printables as link magnets:** offer the storage chart free to zero-waste bloggers, food-waste groups and newsletters; ask only for a credit link.
- **Listings:** add TossLess to app-alternative sites and indie maker communities now; save Product Hunt for launch day.

---

## 12. Measurement

| When | What to check | What to do with it |
| --- | --- | --- |
| Weekly, from week 3 | Search Console → Pages: are new articles indexed? | Not indexed after 2 weeks: request indexing, link to it from older posts |
| Monthly | Search Console → Performance: impressions, clicks, position by query and page | Impressions but few clicks: sharpen title and opening answer. Position 8–20: expand the article |
| Monthly | Search Console's AI performance report (AI Overviews, AI Mode appearances) | Pages that appear: keep them answer-first and current |
| Monthly | Ask ChatGPT, Gemini and Perplexity five topic questions; note whether TossLess is cited | Not cited anywhere: add own photos, tests or data to that page |
| Monthly | Kit signups (App Store clicks after launch) per article | Write more on topics that convert, not just ones that get visits |
| Monthly | Lighthouse on 3 key pages (Phase 9) | Fix any score under 95 |

Monthly log:

| Month | Published articles | Indexed | Impressions | Clicks | Signups / installs | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Nov 2026 | | | | | | |
| Dec 2026 | | | | | | |
| Jan 2027 | | | | | | |

---

## 13. Launch-day checklist (whenever Apple approves the app)

- [ ] Give Claude Code the App Store ID and URL; run Phase 8.
- [ ] Check the Smart App Banner on an iPhone.
- [ ] Email the Kit waitlist with the App Store link.
- [ ] Post on Product Hunt and in the communities I've been helping.
- [ ] Update listings on app-alternative sites with the App Store link.
- [ ] In the app: add a rating prompt after a happy moment (e.g. an item saved before expiry), shipped in the next update.

---

## Sources

- [AI Overviews Are Cutting Google Clicks in Half](https://beancount.io/blog/2026/08/14/ai-overviews-zero-click-search-small-business-guide) — Beancount.io, Aug 2026 (Pew click data, answer-first pages)
- [We Measured What Google's AI Overviews Did to Search](https://seosdinersclub.beehiiv.com/p/seos-diners-club-228-we-measured-what-google-s-ai-overviews-did-to-search-in-tu-rkiye-then-we-built-) — The SEOs Diners Club, Jul 2026 (AI Overview rates by query type, community citations)
- [Cloudflare Pages Free Tier Limits & Pricing 2026](https://temps.sh/blog/cloudflare-pages-free-tier-limits-2026) — Temps, updated Oct 2026
- [Astro is joining Cloudflare](https://blog.cloudflare.com/astro-joins-cloudflare/) — Cloudflare, Jan 2026
- [Cloudflare docs: Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Free Mailchimp Alternatives 2026](https://www.fastlancer.org/en/fastlancer-blog/free-mailchimp-alternatives/) — Kit free-plan limit, Aug 2026
