// All CMS-managed content flows through this file.
// Edited at /admin; stored in /content as Markdown and JSON.
import site from '../../content/settings/site.json'
import business from '../../content/settings/business.json'
import home from '../../content/pages/home.json'
import services from '../../content/pages/services.json'
import contact from '../../content/pages/contact.json'
import blog from '../../content/pages/blog.json'

export { site, business }
export const pages = { home, services, contact, blog }

// Frontmatter of every post (small), keyed by file path
const metaModules = import.meta.glob('../../content/blog/*.md', { eager: true, import: 'data' })
// Rendered bodies
const htmlModules = import.meta.glob('../../content/blog/*.md', { eager: true, import: 'html' })

const slugOf = (path) => path.split('/').pop().replace(/\.md$/, '')

const isLive = (p) => !p.draft

const allPosts = Object.entries(metaModules)
  .map(([path, data]) => ({ ...data, slug: slugOf(path), tags: data.tags || [], faq: data.faq || [], _path: path }))
  .filter(isLive)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))

export function getPosts() {
  return allPosts
}

export function getPost(slug) {
  const post = allPosts.find((p) => p.slug === slug)
  if (!post) return null
  return { ...post, html: htmlModules[post._path] }
}

// Absolute URL helpers for canonical/OG tags
export const absUrl = (path = '/') => {
  if (/^https?:\/\//.test(path)) return path
  return site.siteUrl.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path)
}

export const formatDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
