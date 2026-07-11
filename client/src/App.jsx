import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
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
  return (
    <div className="min-h-screen text-zinc-100 transition-colors duration-300 pb-20 md:pb-0">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/showcase" element={<ShowcaseHub />} />
        <Route path="/product/:slug" element={<ChangelogsPage />} />
        <Route path="/snippets" element={<SnippetsHub />} />
        <Route path="/snippets/:id" element={<SnippetDetail />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
