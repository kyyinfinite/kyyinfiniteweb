import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Landing from './components/Landing.jsx';
import ShowcaseHub from './components/ShowcaseHub.jsx';
import Marketplace from './components/Marketplace.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral dark:bg-text-charcoal text-text-charcoal dark:text-white transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/showcase" element={<ShowcaseHub />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}
