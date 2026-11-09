// schema.org structured data builders (JSON-LD)
import { site, business, absUrl } from './index'

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    '@id': absUrl('/#business'),
    name: site.siteName,
    url: absUrl('/'),
    image: absUrl(site.defaultOgImage),
    telephone: business.phoneTel,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.street,
      addressLocality: business.city,
      addressRegion: business.region,
      postalCode: business.postalCode,
      addressCountry: business.country,
    },
    areaServed: (business.areaServed || []).map((name) => ({ '@type': 'Place', name })),
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: business.opens,
      closes: business.closes,
    }],
    hasMap: business.reviewsUrl,
    priceRange: '₹₹',
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: absUrl(path),
    })),
  }
}

export function articleSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: absUrl(post.cover || site.defaultOgImage),
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { '@type': 'Organization', name: post.author || site.blogAuthor },
    publisher: { '@id': absUrl('/#business') },
    mainEntityOfPage: absUrl(`/blog/${post.slug}`),
    keywords: (post.tags || []).join(', ') || undefined,
  }
}

export function faqSchema(faq) {
  if (!faq?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
