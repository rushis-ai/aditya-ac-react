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
import Hub from './pages/Hub'
import { hubs, getHub, hubBookUrl } from './content'
import './App.css'

// One page_view per route change, sent after render so the new <title> is in place
function PageViews() {
  const { pathname } = useLocation()
  // New page starts at the top (in-app links otherwise keep the old scroll position)
  useEffect(() => { window.scrollTo(0, 0); trackPageView() }, [pathname])
  return null
}

// The router itself is supplied by main.jsx (browser) or entry-server.jsx (prerender)
// Ad landing pages: no menu, footer, floating button or popup, so the form is the one action
const BARE = ['/book']

function App() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/$/, '')
  const bare = BARE.includes(path)
  // Hub pages keep one action: the menu button books instead of calling, no floating button or popup
  const hub = getHub(path.slice(1))
  return (
    <>
      <PageViews />
      {!bare && <Navbar cta={hub ? { to: hubBookUrl(hub), label: hub.cta } : null} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/book" element={<Landing />} />
        {hubs.map((h) => <Route key={h.slug} path={`/${h.slug}`} element={<Hub hub={h} />} />)}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!bare && (
        <>
          <Footer />
          {!hub && <WhatsAppButton />}
          {!hub && <PopupForm />}
        </>
      )}
    </>
  )
}

export default App
