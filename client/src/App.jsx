import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
import PageTransition from './components/PageTransition.jsx';
import Landing from './components/Landing.jsx';
import ShowcaseHub from './components/ShowcaseHub.jsx';
import SnippetsHub from './components/SnippetsHub.jsx';
import SnippetDetail from './components/SnippetDetail.jsx';
import Marketplace from './components/Marketplace.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ChangelogsPage from './pages/ChangelogsPage.jsx';
import NotFound from './pages/NotFound.jsx';
import ServerError from './pages/ServerError.jsx';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen text-zinc-100 transition-colors duration-300 pb-20 md:pb-0">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/showcase" element={<PageTransition><ShowcaseHub /></PageTransition>} />
          <Route path="/product/:slug" element={<PageTransition><ChangelogsPage /></PageTransition>} />
          <Route path="/snippets" element={<PageTransition><SnippetsHub /></PageTransition>} />
          <Route path="/snippets/:id" element={<PageTransition><SnippetDetail /></PageTransition>} />
          <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/500" element={<PageTransition><ServerError /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
