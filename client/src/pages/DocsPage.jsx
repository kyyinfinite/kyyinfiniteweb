import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import { SCOPE_INFO } from '../lib/scopes.js';
import { IconBook, IconArrowRight } from '../lib/icons.jsx';

const BASE_URL = 'https://kyyinfinite.my.id/api/v1';

const scopeTable = Object.entries(SCOPE_INFO)
  .map(([scope, info]) => `| \`${scope}\` | ${info.label} | ${info.description} |`)
  .join('\n');

const SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting started',
    content: `
All endpoints are served from a single base URL:

\`\`\`
${BASE_URL}
\`\`\`

Every request needs an API key. You can create a free key from your [profile page](/profile), or check the [API playground](/developers) to browse and test every endpoint interactively.

A minimal request looks like this:

\`\`\`bash
curl "${BASE_URL}/ai/chatgpt?text=halo" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

Responses are JSON by default, except for a few image/media endpoints that return binary data directly (these are marked in the playground).
`,
  },
  {
    id: 'authentication',
    title: 'Authentication',
    content: `
Send your key as a Bearer token in the \`Authorization\` header:

\`\`\`
Authorization: Bearer kyy_xxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

Alternatively, you can pass it as an \`x-api-key\` header instead:

\`\`\`
x-api-key: kyy_xxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

Keys look like \`kyy_<keyId>_<secret>\`. Never share your key publicly or commit it to a public repo — treat it like a password. You can view or copy your key again anytime from your [profile page](/profile).

Each key is scoped: it only works on endpoints whose scope matches one it was created with. Trying to call an endpoint outside your key's scopes returns a \`403\`.
`,
  },
  {
    id: 'scopes',
    title: 'Scopes',
    content: `
When you create a key, you choose one or more scopes. Each scope unlocks a category of endpoints:

| Scope | Category | Covers |
|---|---|---|
${scopeTable}

You can select multiple scopes for a single key. The [playground](/developers) groups endpoints by category so you can see exactly which scope each one needs.
`,
  },
  {
    id: 'requests',
    title: 'Making requests',
    content: `
All endpoints are called with \`GET\` and take query-string parameters. Here's the same request in a few languages:

\`\`\`bash
curl "${BASE_URL}/info/countryinfo?name=Indonesia" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

\`\`\`javascript
const response = await fetch(
  "${BASE_URL}/info/countryinfo?name=Indonesia",
  { headers: { Authorization: "Bearer YOUR_API_KEY" } }
);
const data = await response.json();
\`\`\`

\`\`\`python
import requests

response = requests.get(
    "${BASE_URL}/info/countryinfo",
    params={"name": "Indonesia"},
    headers={"Authorization": "Bearer YOUR_API_KEY"},
)
data = response.json()
\`\`\`

Binary-response endpoints (image makers, some downloaders) work the same way — just handle the response as a buffer/blob instead of JSON.
`,
  },
  {
    id: 'rate-limits',
    title: 'Rate limits & plans',
    content: `
Every response includes rate-limit headers:

\`\`\`
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 27
X-RateLimit-Reset: 2026-09-09T12:01:00.000Z
\`\`\`

**Per-minute rate limit:**
- Free keys: 30 requests/minute
- Premium keys: 120 requests/minute

**Lifetime request quota:**
- Free keys: 40 requests total, and you can create up to 2 free keys per account (ever — revoking a key doesn't free up a new slot)
- Premium keys: 1,000 / 10,000 / unlimited requests total, depending on the plan you buy from your [profile page](/profile)

Once a key's lifetime quota runs out, it keeps returning \`403\` until you get a new one — it doesn't reset.
`,
  },
  {
    id: 'errors',
    title: 'Errors',
    content: `
Errors come back as JSON with a consistent shape:

\`\`\`json
{
  "status": false,
  "creator": "KyyInfinite",
  "message": "Invalid API key"
}
\`\`\`

Common status codes:

| Code | Meaning |
|---|---|
| \`400\` | Missing or invalid parameter |
| \`401\` | Missing, malformed, invalid, or expired API key |
| \`403\` | Key doesn't have the required scope, or its lifetime quota is used up |
| \`404\` | Endpoint or resource not found |
| \`429\` | You've hit the per-minute rate limit — slow down and retry after \`X-RateLimit-Reset\` |
| \`500\` | Something broke upstream or on our side |

Successful JSON responses use the shape \`{ "status": true, "creator": "KyyInfinite", "result": ... }\`.
`,
  },
  {
    id: 'reference',
    title: 'Endpoint reference',
    content: `
The full, always up-to-date list of endpoints — with live request testing right in your browser — lives in the [API playground](/developers). Search by name, filter by category, and copy a ready-to-run \`curl\` command for anything you find there.
`,
  },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const active = SECTIONS.find((section) => section.id === activeId) || SECTIONS[0];

  return (
    <main className="theme-light max-w-4xl mx-auto px-6 py-14 min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo">
          <IconBook className="w-4.5 h-4.5" />
        </div>
        <h1 className="text-2xl font-semibold text-ink font-display">Documentation</h1>
      </div>
      <p className="text-slate text-sm mb-8">
        Everything you need to authenticate and start calling the API.{' '}
        <Link to="/developers" className="text-indigo hover:underline inline-flex items-center gap-1">
          Try it live in the playground <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>

      <div className="md:hidden mb-6 -mx-6 px-6 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors duration-200 ${
                activeId === section.id
                  ? 'bg-indigo text-white border-indigo font-medium'
                  : 'border-line text-slate hover:border-indigo/40 hover:text-indigo'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-10 items-start">
        <nav className="hidden md:block w-48 shrink-0 sticky top-24 space-y-1">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors duration-200 ${
                activeId === section.id
                  ? 'bg-indigo-soft text-indigo-dark font-medium'
                  : 'text-slate hover:text-ink hover:bg-paper-soft'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 card-surface p-6">
          <MarkdownRenderer content={active.content} />
        </div>
      </div>
    </main>
  );
}
