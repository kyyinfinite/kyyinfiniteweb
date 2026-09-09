# @kyyinfinite/sdk

Official JS SDK and CLI for KyyInfinite. Call the API, browse or submit code
snippets, and manage your API keys from a script or terminal — not just from
the website.

## Install

```bash
npm install @kyyinfinite/sdk
```

The CLI comes with it:

```bash
npx kyyinfinite --help
```

## Using it as a library

```js
import { KyyInfinite } from '@kyyinfinite/sdk';

const client = new KyyInfinite({
  apiKey: 'kyy_xxxxxxxxxxxxxxxxxxxx', // for calling /v1 tool endpoints
});

// Call any tool endpoint
const result = await client.call('/downloader/tiktok', { url: 'https://tiktok.com/...' });

// Browse snippets and products — no auth needed
const snippets = await client.snippets.list({ search: 'debounce' });
const products = await client.products.list({ category: 'plugin' });
const code = await client.snippets.getRaw('64f...'); // plain text, same as /raw/<id>
```

### Authenticating as a user

Submitting a snippet or managing your own API keys needs a logged-in user
(the same account you'd sign in with on the website), not just an API key.
The SDK authenticates the same way the site does — Firebase email/password —
so you need your deployment's **Firebase Web API key** (the same public
value used as `VITE_FIREBASE_API_KEY` in the client). It isn't a secret; it's
already shipped in the site's own JS bundle.

```js
const client = new KyyInfinite({ firebaseApiKey: 'AIza...' });
await client.auth.loginWithEmail('you@example.com', 'yourpassword');

const { snippet } = await client.snippets.submit({
  title: 'debounce helper',
  description: 'small dependency-free debounce for input handlers',
  language: 'javascript',
  code: `export function debounce(fn, delay = 300) { ... }`,
  tags: ['utility'],
});
// snippet.status will be "pending" until an admin reviews it

const mine = await client.snippets.listMine();
await client.snippets.withdraw(snippet._id);
```

Already have a Firebase ID token (e.g. from your own backend)? Skip
`loginWithEmail` and just do `client.auth.setIdToken(idToken)`. If you also
pass a `refreshToken` and `firebaseApiKey`, the SDK will silently refresh an
expired token and retry once on a 401.

### API reference

- `client.call(path, params)` — GET a `/v1/...` tool endpoint using `apiKey`
- `client.snippets.list(params)` / `.get(id)` / `.getRaw(id)`
- `client.snippets.submit(data)` / `.listMine()` / `.withdraw(id)` — needs a user session
- `client.apiKeys.listMine()` / `.createFree({ label, scopes })` / `.revoke(id)` — needs a user session
- `client.products.list(params)` / `.get(id)` / `.getBySlug(slug)`
- `client.contributors.get(uid)` — public contributor profile
- `client.status.health()` / `.incidents()`

## Using the CLI

```bash
# First time: sign in (asks for your Firebase Web API key once, then caches it)
kyyinfinite login

kyyinfinite whoami

# Upload a local file as a snippet
kyyinfinite snippet upload ./debounce.js \
  --title "debounce helper" \
  --language javascript \
  --description "small dependency-free debounce" \
  --tags utility,performance

# Browse
kyyinfinite snippet list --search debounce
kyyinfinite snippet list --mine

# Print a snippet's raw code (pipeable)
kyyinfinite snippet raw <id> > debounce.js

# Check system status
kyyinfinite status

kyyinfinite logout
```

Login is stored in `~/.kyyinfinite/config.json` (a refresh token, not your
password) so you only need to log in once per machine.

## Notes

- Requires Node 18+ (uses the built-in `fetch`).
- `baseUrl` defaults to the production API (`https://kyyinfinite.my.id/api`).
  Point it at `http://localhost:4000/api` (or wherever your dev server runs)
  during local development.
- New snippet submissions are reviewed before they're public, same as
  submitting through the website — `status` will be `"pending"` until an
  admin approves it.
