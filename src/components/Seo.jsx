import { useLocation } from 'react-router-dom'
import { site, absUrl } from '../content'

// Per-page <head> tags. React 19 hoists <title>/<meta>/<link> into <head>,
// and the build-time prerender writes them into each page's static HTML.
export default function Seo({
  title,               // full title as it should appear in the tab
  description,
  image,               // path or absolute URL
  type = 'website',
  canonical,           // override; defaults to the current path
  noindex = false,
  publishedTime,
  modifiedTime,
  jsonLd = [],         // array of schema.org objects
}) {
  const { pathname } = useLocation()
  const url = canonical || absUrl(pathname === '/' ? '/' : pathname.replace(/\/$/, ''))
  const img = absUrl(image || site.defaultOgImage)

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <meta property="og:site_name" content={site.siteName} />
      <meta property="og:locale" content={site.locale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {jsonLd.filter(Boolean).map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Escape "<" so content can't close the script tag
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}
