// Used only at build time by scripts/prerender.js to render each route to HTML.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import { getPosts, site } from './content'

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}

export const posts = getPosts().map(({ slug, date, updated, noindex, title, description }) => ({
  slug, date, updated, noindex, title, description,
}))

export { site }
