import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { trackPageView } from './utils/analytics'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import PopupForm from './components/PopupForm'
import Home from './pages/Home'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import NotFound from './pages/NotFound'
import './App.css'

// One page_view per route change, sent after render so the new <title> is in place
function PageViews() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView() }, [pathname])
  return null
}

// The router itself is supplied by main.jsx (browser) or entry-server.jsx (prerender)
function App() {
  return (
    <>
      <PageViews />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <PopupForm />
    </>
  )
}

export default App
