import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import ServicesPreview from '../components/ServicesPreview'
import WhyUs from '../components/WhyUs'
import Testimonials from '../components/Testimonials'
import CTABanner from '../components/CTABanner'
import Seo from '../components/Seo'
import { pages } from '../content'
import { localBusinessSchema } from '../content/schema'

export default function Home() {
  return (
    <>
      <Seo
        title={pages.home.title}
        description={pages.home.description}
        image={pages.home.ogImage}
        jsonLd={[localBusinessSchema()]}
      />
      <Hero />
      <TrustBar />
      <ServicesPreview />
      <WhyUs />
      <Testimonials />
      <CTABanner />
    </>
  )
}
