import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import matter from 'gray-matter'
import { marked } from 'marked'

// Turns content/**/*.md (written in the CMS) into JS modules at build time:
//   export const data = { ...frontmatter }   (small, used by lists)
//   export const html = '<p>...</p>'          (the rendered body)
// Parsing happens in Node, so no Markdown/YAML parser ships to the browser.
function markdownContent() {
  return {
    name: 'markdown-content',
    transform(code, id) {
      if (!id.endsWith('.md') || !id.replace(/\\/g, '/').includes('/content/')) return null
      const { data, content } = matter(code)
      for (const [k, v] of Object.entries(data)) {
        if (v instanceof Date) data[k] = v.toISOString().slice(0, 10)
      }
      const words = content.split(/\s+/).filter(Boolean).length
      data.readingMinutes = Math.max(1, Math.round(words / 200))
      const html = marked.parse(content, { gfm: true })
      return {
        code: `export const data = ${JSON.stringify(data)};\nexport const html = ${JSON.stringify(html)};\n`,
        map: null,
      }
    },
  }
}

// Serve the CMS at /admin in `npm run dev` and `npm run preview`
// (otherwise the React app's 404 page answers that URL)
function adminRoute() {
  const rewrite = (req, _res, next) => {
    if (/^\/admin\/?(\?.*)?$/.test(req.url)) req.url = '/admin/index.html'
    next()
  }
  return {
    name: 'admin-route',
    configureServer(server) { server.middlewares.use(rewrite) },
    configurePreviewServer(server) { server.middlewares.use(rewrite) },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [adminRoute(), markdownContent(), react()],
})
