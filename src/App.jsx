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
import Landing from './pages/Landing'
import './App.css'

// One page_view per route change, sent after render so the new <title> is in place
function PageViews() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView() }, [pathname])
  return null
}

// The router itself is supplied by main.jsx (browser) or entry-server.jsx (prerender)
// Ad landing pages: no menu, footer, floating button or popup, so the form is the one action
const BARE = ['/book']

function App() {
  const { pathname } = useLocation()
  const bare = BARE.includes(pathname.replace(/\/$/, ''))
  return (
    <>
      <PageViews />
      {!bare && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/book" element={<Landing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!bare && (
        <>
          <Footer />
          <WhatsAppButton />
          <PopupForm />
        </>
      )}
    </>
  )
}

export default App
