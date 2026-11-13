// Build step 3 of 3 (see "build" in package.json).
// Renders every route to static HTML so search engines and link previews get
// full content and meta tags without running JavaScript, then writes
// sitemap.xml, robots.txt and an RSS feed.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js')

const { render, posts, site } = await import(pathToFileURL(ssrEntry).href)
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const siteUrl = site.siteUrl.replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/services', priority: '0.9', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
]
// Ad landing pages: prerendered for speed, kept out of the sitemap (they're noindex)
const adRoutes = [{ url: '/book' }]
const postRoutes = posts.map((p) => ({
  url: `/blog/${p.slug}`, priority: '0.7', changefreq: 'monthly',
  lastmod: p.updated || p.date, noindex: p.noindex,
}))

// React 19 emits hoisted <title>/<meta>/<link> at the start of the string
const HEAD_TAGS = /^(?:<title\b[^>]*>[\s\S]*?<\/title>|<(?:meta|link)\b[^>]*>)+/

function page(url) {
  const html = render(url)
  const head = (html.match(HEAD_TAGS) || [''])[0]
  const body = html.slice(head.length)
  // Tag them so main.jsx can remove them before React takes over the head
  const marked = head.replace(/<(title|meta|link)\b/g, '<$1 data-prerender=""')
  return template
    .replace('</head>', `${marked}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

function write(file, contents) {
  const out = path.join(dist, file)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, contents)
}

// "/" -> index.html, "/blog/x" -> blog/x.html (served at /blog/x via cleanUrls)
for (const r of [...staticRoutes, ...adRoutes, ...postRoutes]) {
  write(r.url === '/' ? 'index.html' : `${r.url.slice(1)}.html`, page(r.url))
}
write('404.html', page('/__not-found__'))

// sitemap.xml
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const latestPost = postRoutes.map((r) => r.lastmod).sort().pop() || today
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...postRoutes]
  .filter((r) => !r.noindex)
  .map((r) => `  <url>
    <loc>${siteUrl}${r.url === '/' ? '/' : r.url}</loc>
${r.lastmod || r.url === '/blog' ? `    <lastmod>${r.lastmod || latestPost}</lastmod>
` : ''}    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
write('sitemap.xml', sitemap)

// robots.txt
write('robots.txt', `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml
`)

// RSS feed (/rss.xml)
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(site.siteName)} Blog</title>
  <link>${siteUrl}/blog</link>
  <description>${esc(site.siteName)}: AC and refrigeration tips</description>
  <language>en-in</language>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${posts.filter((p) => !p.noindex).map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${siteUrl}/blog/${p.slug}</link>
    <guid>${siteUrl}/blog/${p.slug}</guid>
    <pubDate>${new Date(p.date + 'T00:00:00Z').toUTCString()}</pubDate>
    <description>${esc(p.description)}</description>
  </item>`).join('\n')}
</channel>
</rss>
`
write('rss.xml', rss)

// The server bundle was only needed for this step
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })

console.log(`Prerendered ${staticRoutes.length + adRoutes.length + postRoutes.length} pages + 404, sitemap.xml, robots.txt, rss.xml`)
