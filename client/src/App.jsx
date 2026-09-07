import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import DevelopersPage from './pages/DevelopersPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Support from './pages/Support.jsx';
import SupportTicketDetail from './pages/SupportTicketDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import ServerError from './pages/ServerError.jsx';

// The visual redesign is rolling out page by page. Pages that have been
// migrated to the new light "soft modern digital studio" system supply their
// own background; everything else still expects the old dark canvas. This
// wrapper keeps the two from bleeding into each other while both exist.
// Remove once every route below is migrated.
function LegacyDarkShell({ children }) {
  return <div className="min-h-screen bg-zinc-950 text-zinc-100">{children}</div>;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen transition-colors duration-300 pb-20 md:pb-0">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/showcase" element={<PageTransition><ShowcaseHub /></PageTransition>} />
          <Route path="/product/:slug" element={<PageTransition><LegacyDarkShell><ChangelogsPage /></LegacyDarkShell></PageTransition>} />
          <Route path="/snippets" element={<PageTransition><SnippetsHub /></PageTransition>} />
          <Route path="/snippets/:id" element={<PageTransition><SnippetDetail /></PageTransition>} />
          <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
          <Route path="/developers" element={<PageTransition><DevelopersPage /></PageTransition>} />
          <Route path="/developers/request-key" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/support" element={<PageTransition><LegacyDarkShell><Support /></LegacyDarkShell></PageTransition>} />
          <Route path="/support/:id" element={<PageTransition><LegacyDarkShell><SupportTicketDetail /></LegacyDarkShell></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><LegacyDarkShell><AdminDashboard /></LegacyDarkShell></PageTransition>} />
          <Route path="/500" element={<PageTransition><ServerError /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
