import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight, IconPlugin, IconServer, IconScript } from '../lib/icons.jsx';

const highlights = [
  {
    icon: IconScript,
    title: 'Script and Plugin CDN',
    description: 'Instant public downloads served directly from Firebase Storage, indexed and tracked in MongoDB.',
  },
  {
    icon: IconServer,
    title: 'Automated Provisioning',
    description: 'Guest checkout via Midtrans QRIS instantly provisions a live Pterodactyl panel server.',
  },
  {
    icon: IconPlugin,
    title: 'No Login Required',
    description: 'Every visitor browses, downloads, and purchases without creating an account.',
  },
];

export default function Landing() {
  return (
    <main>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-accent-teal font-medium tracking-wide uppercase text-xs mb-4">kyyinfinite.my.id</p>
        <h1 className="text-4xl md:text-6xl font-semibold text-text-charcoal dark:text-white leading-tight">
          Personal Portfolio, CDN and
          <br />
          <span className="text-accent-teal">Automated Marketplace</span>
        </h1>
        <p className="mt-6 text-text-muted max-w-2xl mx-auto text-base md:text-lg">
          Explore published plugins and scripts, download instantly, and deploy your own Pterodactyl
          panel server through a fully automated guest checkout.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link to="/showcase" className="btn-primary flex items-center gap-2">
            Browse Showcase <IconArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/marketplace" className="btn-outline">
            Open Marketplace
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((item) => (
          <div key={item.title} className="card-surface p-6">
            <div className="w-11 h-11 rounded-xl bg-accent-teal-glow flex items-center justify-center text-accent-teal-dark mb-4">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="text-text-charcoal dark:text-white font-semibold mb-2">{item.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
