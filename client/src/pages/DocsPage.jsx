import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IconKey, IconScript, IconServer, IconTicket, IconArrowRight, IconBook, IconCheck, IconClock } from '../lib/icons.jsx';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'quotas', label: 'Quotas & Rate Limits' },
  { id: 'snippets', label: 'Snippets & Raw URLs' },
  { id: 'submitting', label: 'Submitting a Snippet' },
  { id: 'remote-upload', label: 'Remote Upload (Bot/CLI)' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'hosting', label: 'Hosting' },
  { id: 'support', label: 'Support' },
];

function CodeBlock({ language = 'bash', children }) {
  return (
    <div className="rounded-xl overflow-hidden border border-line my-4">
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{ margin: 0, background: '#FBFAF7', padding: 16, fontSize: 12.5 }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 mb-14">
      <h2 className="font-display text-xl font-semibold text-ink mb-4">{title}</h2>
      <div className="space-y-4 text-slate leading-relaxed">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <main className="theme-light max-w-6xl mx-auto px-6 py-14 md:flex md:gap-12">
      {/* Sidebar — desktop only, mobile relies on Navbar/BottomNav + in-page links */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-24">
          <p className="text-xs font-semibold text-mist uppercase tracking-wider mb-3">On this page</p>
          <nav className="space-y-1">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className={`block text-sm px-3 py-2 rounded-lg transition-colors duration-200 ${
                  activeSection === section.id
                    ? 'bg-indigo-soft text-indigo-dark font-medium'
                    : 'text-slate hover:text-ink hover:bg-paper-soft'
                }`}
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo">
            <IconBook className="w-5 h-5" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">Documentation</h1>
        </div>
        <p className="text-slate mb-4 max-w-2xl">
          Everything you need to use the KyyInfinite API, browse and submit code snippets, and deploy
          hosting — one growing ecosystem, not just a single curated catalog.
        </p>

        {/* Mobile section jump list */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-6 -mx-6 px-6">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-line text-slate whitespace-nowrap"
            >
              {section.label}
            </a>
          ))}
        </div>

        <Section id="getting-started" title="Getting Started">
          <p>
            KyyInfinite is a small ecosystem: a REST API for downloader/maker/utility tools, a library of
            reusable code snippets (now open to community submissions), and one-click Pterodactyl panel
            hosting. Start with an API key from your{' '}
            <Link to="/profile" className="text-indigo hover:underline">profile</Link>, or browse what's
            already built in <Link to="/showcase" className="text-indigo hover:underline">Products</Link>{' '}
            and <Link to="/snippets" className="text-indigo hover:underline">Snippets</Link>.
          </p>
        </Section>

        <Section id="authentication" title="Authentication">
          <p>
            Every API request needs a key, sent as a bearer token. Free keys come with a lifetime request
            quota and can be created from your profile once you're signed in.
          </p>
          <CodeBlock language="bash">
            {`curl https://kyyinfinite.my.id/api/v1/downloader/tiktok \\\n  -H "Authorization: Bearer kyy_xxxxxxxxxxxxxxxxxxxx" \\\n  -G --data-urlencode "url=https://tiktok.com/..."`}
          </CodeBlock>
          <p>
            You can also test any endpoint without writing code from the{' '}
            <Link to="/developers" className="text-indigo hover:underline">API playground</Link>.
          </p>
        </Section>

        <Section id="quotas" title="Quotas & Rate Limits">
          <p>These are two different things, and it's worth knowing the difference:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-ink">Lifetime quota</strong> — the total number of requests a key can ever make (e.g. 1,000 total). Shown as a progress bar on your key.</li>
            <li><strong className="text-ink">Rate limit</strong> — how many requests per minute a key can make (30/min on the free tier, 120/min on premium). Resets every minute regardless of your lifetime quota.</li>
          </ul>
          <p>A key can hit its rate limit long before it runs out of lifetime quota, and vice versa — both are enforced independently.</p>
        </Section>

        <Section id="snippets" title="Snippets & Raw URLs">
          <p>
            Every snippet page has a <strong className="text-ink">Raw</strong> link — a plain-text URL you
            can fetch directly, with no HTML around it, similar to a Pastebin raw link:
          </p>
          <CodeBlock language="bash">{`curl https://kyyinfinite.my.id/raw/<snippet-id>`}</CodeBlock>
          <p>That makes it easy to pull a snippet straight into a script without opening a browser or copy-pasting.</p>
        </Section>

        <Section id="submitting" title="Submitting a Snippet">
          <p>
            KyyInfinite isn't just admin-curated anymore — anyone signed in can submit a snippet from{' '}
            <Link to="/snippets/new" className="text-indigo hover:underline">Snippets → Submit a snippet</Link>,
            including forks of existing snippets. New submissions are reviewed before they go public, so
            there may be a short wait between submitting and seeing it listed — unless you're a{' '}
            <strong className="text-ink">verified contributor</strong>, in which case submissions go live
            immediately. You can track the status of your submissions from your profile.
          </p>
        </Section>

        <Section id="remote-upload" title="Remote Upload (Bot/CLI)">
          <p>
            You don't need to open the website to upload a snippet — a bot, script, or CLI can do it with
            just an API key. Create one with the <strong className="text-ink">Remote Snippet Upload</strong>{' '}
            scope from your <Link to="/profile" className="text-indigo hover:underline">profile</Link>, then
            POST to:
          </p>
          <CodeBlock language="bash">
            {`curl -X POST "https://kyyinfinite.my.id/api/v1/account/snippets" \\\n  -H "Authorization: Bearer kyy_xxxxxxxxxxxxxxxxxxxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"title":"debounce helper","description":"...","language":"javascript","code":"...","tags":["utility"]}'`}
          </CodeBlock>
          <p>Same thing in Python:</p>
          <CodeBlock language="python">
            {`import requests\n\nrequests.post(\n    "https://kyyinfinite.my.id/api/v1/account/snippets",\n    headers={"Authorization": "Bearer kyy_xxxxxxxxxxxxxxxxxxxx"},\n    json={\n        "title": "debounce helper",\n        "description": "...",\n        "language": "javascript",\n        "code": "...",\n        "tags": ["utility"],\n    },\n).raise_for_status()`}
          </CodeBlock>
          <p>
            Or from JavaScript using the{' '}
            <a href="https://www.npmjs.com/package/@kyyinfinite/sdk" target="_blank" rel="noreferrer" className="text-indigo hover:underline">
              @kyyinfinite/sdk
            </a>{' '}
            package — it picks the API-key path automatically when there's no logged-in session:
          </p>
          <CodeBlock language="javascript">
            {`import { KyyInfinite } from '@kyyinfinite/sdk';\n\nconst client = new KyyInfinite({ apiKey: 'kyy_xxxxxxxxxxxxxxxxxxxx' });\nconst { snippet } = await client.snippets.submit({\n  title: 'debounce helper',\n  language: 'javascript',\n  code: '...',\n});`}
          </CodeBlock>
          <p>
            The key's owner is looked up automatically, so the upload lands on your account and goes
            through the same review flow as submitting from the website — instantly, if you're a{' '}
            <strong className="text-ink">verified contributor</strong>. Listing (<code className="text-indigo-dark">GET</code>) and
            withdrawing (<code className="text-indigo-dark">DELETE /api/v1/account/snippets/&lt;id&gt;</code>) your own submissions
            work the same way. Downloading needs no auth at all — that's what{' '}
            <Link to="/snippets" className="text-indigo hover:underline">browsing snippets</Link> and their raw
            links are for.
          </p>
        </Section>

        <Section id="webhooks" title="Webhooks">
          <p>
            Register a URL from your{' '}
            <Link to="/profile" className="text-indigo hover:underline">profile</Link> to get notified when
            something happens, instead of polling the API:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><code className="text-indigo-dark">snippet.approved</code> / <code className="text-indigo-dark">snippet.rejected</code> — one of your submissions was reviewed</li>
            <li><code className="text-indigo-dark">apikey.quota_warning</code> — one of your keys crossed 80% of its lifetime quota</li>
            <li><code className="text-indigo-dark">incident.created</code> — a new status incident was opened</li>
          </ul>
          <p>
            Each delivery is a POST with a JSON body (<code className="text-indigo-dark">{'{ event, data, timestamp }'}</code>) and an{' '}
            <code className="text-indigo-dark">X-KyyInfinite-Signature</code> header — an HMAC-SHA256 of the
            raw body, signed with the secret shown once when you create the webhook. Verify it before
            trusting the payload.
          </p>
        </Section>

        <Section id="hosting" title="Hosting">
          <p>
            The <Link to="/marketplace" className="text-indigo hover:underline">marketplace</Link> lets you
            deploy a Pterodactyl panel server instantly after payment — no manual provisioning wait.
          </p>
        </Section>

        <Section id="support" title="Support">
          <p>
            Something not covered here? <Link to="/support" className="text-indigo hover:underline">Open a support ticket</Link>{' '}
            and it'll go straight to the team.
          </p>
        </Section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[
            { to: '/developers', label: 'API Playground', icon: IconKey },
            { to: '/snippets', label: 'Browse Snippets', icon: IconScript },
            { to: '/marketplace', label: 'Hosting', icon: IconServer },
            { to: '/support', label: 'Support', icon: IconTicket },
            { to: '/status', label: 'System Status', icon: IconCheck },
            { to: '/changelog', label: 'Changelog', icon: IconClock },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="card-surface p-4 flex items-center justify-between gap-3 hover:border-indigo/30">
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-indigo-soft flex items-center justify-center text-indigo shrink-0">
                  <item.icon className="w-4 h-4" />
                </span>
                <span className="text-ink text-sm font-medium">{item.label}</span>
              </span>
              <IconArrowRight className="w-4 h-4 text-mist shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
