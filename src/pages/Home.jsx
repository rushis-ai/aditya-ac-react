import { useEffect } from 'react'
import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import ServicesPreview from '../components/ServicesPreview'
import WhyUs from '../components/WhyUs'
import Testimonials from '../components/Testimonials'
import CTABanner from '../components/CTABanner'

// Same as index.html, restored when coming back from another page
const TITLE = 'Aditya AC & Refrigeration Services | Chandkheda, Ahmedabad'
const DESCRIPTION = 'Expert AC installation, repair & refrigeration services in Chandkheda, Ahmedabad. Top-rated on Google, open till 11:30 PM. Call now for same day service!'

export default function Home() {
  useEffect(() => {
    document.title = TITLE
    document.querySelector('meta[name="description"]')?.setAttribute('content', DESCRIPTION)
  }, [])

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