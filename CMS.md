# Content management & SEO

The site has a Git-based CMS ([Sveltia CMS](https://github.com/sveltia/sveltia-cms)) at **`/admin`**.
There is no database: every save in the CMS is a commit to `master`, Vercel rebuilds, and the change is live in about a minute.

## What you can edit

| CMS section | File(s) | Used for |
|---|---|---|
| Blog posts | `content/blog/*.md` | `/blog` and `/blog/<slug>` pages, sitemap, RSS |
| Page SEO | `content/pages/*.json` | Title, meta description, share image for Home, Services, Contact, Blog |
| Settings → Site & SEO defaults | `content/settings/site.json` | Site URL, title suffix, default share image, default author |
| Settings → Business details | `content/settings/business.json` | Phone, WhatsApp, rating, address, opening hours (used site-wide and in Google structured data) |

Uploaded images go to `public/uploads/`.

## One-time setup

### Option A: Sign in with GitHub (recommended for editors)
1. GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
   - Homepage URL: your site URL
   - Authorization callback URL: `https://<your-domain>/api/callback`
2. Copy the **Client ID**, generate a **Client secret**.
3. Vercel → Project → Settings → Environment Variables (Production):
   - `GITHUB_CLIENT_ID` = client ID
   - `GITHUB_CLIENT_SECRET` = client secret
4. Redeploy. Editors open `https://<your-domain>/admin` → **Sign In with GitHub**.
   Each editor needs write access to the GitHub repository.

### Option B: Access token (no setup)
GitHub → Settings → Developer settings → Fine-grained tokens → access to this repository only, **Contents: Read and write**.
At `/admin` choose **Sign In Using Access Token** and paste it.

### Working locally
`npm run dev`, open `http://localhost:5173/admin/index.html` in Chrome or Edge, and choose **Work with Local Repository** (pick this project folder). Edits are written straight to your files; commit them yourself.

## Writing a post that ranks
- **Title** (H1): the main keyword, 50–65 characters. Use **SEO title** only if the Google title should differ.
- **Meta description**: 120–160 characters. The CMS warns outside 50–170.
- **Body**: start sections with *Heading 2*; never add another H1.
- **Cover image**: 1200×630, with alt text. It is also the WhatsApp/social preview.
- **FAQs**: optional, rendered at the end of the post and sent to Google as `FAQPage` data.
- **Last updated**: set it when you make a real update.
- **Draft**: drafts are not built, listed or added to the sitemap.

## What the build does for SEO
`npm run build` runs three steps:
1. `vite build`: the normal client bundle.
2. `vite build --ssr src/entry-server.jsx`: a server bundle of the same app.
3. `node scripts/prerender.js`: renders every route to static HTML (`dist/*.html`, `dist/blog/*.html`, `dist/404.html`) with its title, description, canonical, Open Graph/Twitter tags and JSON-LD already in the HTML, then writes `sitemap.xml`, `robots.txt` and `rss.xml`.

The browser then hydrates the prerendered HTML (`src/main.jsx`), so crawlers and link previews see full content without running JavaScript.

Structured data (`src/content/schema.js`):
- `HVACBusiness` (local business: address, phone, hours, areas served) on Home and Contact
- `BlogPosting`, `BreadcrumbList` and `FAQPage` on posts
- `BreadcrumbList` on Blog and Contact

Per-page tags come from `src/components/Seo.jsx`. To add a new page, render `<Seo … />` in it and add its path to `staticRoutes` in `scripts/prerender.js`.

## After the first deploy
1. Google Search Console → Sitemaps → submit `https://<your-domain>/sitemap.xml`.
2. Check a post with the Rich Results Test (FAQ and Breadcrumb should be detected).
3. `/admin` sends `noindex` and is blocked in `robots.txt`.

## Updating the CMS
The CMS version is pinned in `public/admin/index.html` (`@sveltia/cms@x.y.z`). Bump it there to upgrade.
