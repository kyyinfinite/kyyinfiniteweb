import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Landing from './components/Landing.jsx';
import ShowcaseHub from './components/ShowcaseHub.jsx';
import AssetDetail from './components/AssetDetail.jsx';
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
    <div className="relative min-h-screen bg-neutral dark:bg-text-charcoal text-text-charcoal dark:text-white transition-colors duration-300">
      
      {/* ============== GLOBAL BACKGROUND GRID ============== */}
      <div className="pointer-events-none fixed inset-0 z-[0] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_110%)]" />
      {/* ==================================================== */}

      {/* Konten Utama (Berada di lapisan atas background) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        {/* 
          Bungkus Routes dengan main flex-grow agar 
          layoutnya proporsional jika nanti kamu menambahkan Footer 
        */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/showcase" element={<ShowcaseHub />} />
            <Route path="/showcase/:id" element={<AssetDetail />} />
            <Route path="/products/:id/changelogs" element={<ChangelogsPage />} />
            <Route path="/snippets" element={<SnippetsHub />} />
            <Route path="/snippets/:id" element={<SnippetDetail />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      
    </div>
  );
}
