import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import ServicesPreview from '../components/ServicesPreview'
import WhyUs from '../components/WhyUs'
import Testimonials from '../components/Testimonials'
import CTABanner from '../components/CTABanner'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesPreview />
      <WhyUs />
      <Testimonials />
      <CTABanner />
    </>
  )
}