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

### Uploading from a bot (no Firebase login needed)

If you just want a bot or script to upload snippets without ever logging in
as a user, create an API key with the **`snippets:write`** scope from your
profile, then use it directly — the SDK routes snippet actions through the
API key automatically whenever there's no Firebase session:

```js
const client = new KyyInfinite({ apiKey: 'kyy_xxxxxxxxxxxxxxxxxxxx' });

const { snippet } = await client.snippets.submit({
  title: 'debounce helper',
  description: 'small dependency-free debounce for input handlers',
  language: 'javascript',
  code: `export function debounce(fn, delay = 300) { ... }`,
  tags: ['utility'],
});

const mine = await client.snippets.listMine();
await client.snippets.withdraw(snippet._id);
```

This is the same account attribution as logging in — the key already knows
which account it belongs to, so uploads land on your profile and go through
the same review flow (or skip it, if you're a verified contributor).

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
- `client.snippets.submit(data)` / `.listMine()` / `.withdraw(id)` — needs a user session **or** an API key with `snippets:write`
- `client.apiKeys.listMine()` / `.createFree({ label, scopes })` / `.revoke(id)` — needs a user session
- `client.products.list(params)` / `.get(id)` / `.getBySlug(slug)`
- `client.contributors.get(uid)` — public contributor profile
- `client.status.health()` / `.incidents()`

## Not using JS? Raw REST (curl / Python)

The SDK is a thin wrapper — you can hit the same endpoint directly from
anything that can make an HTTPS request. This is the endpoint your bot needs:
`POST https://kyyinfinite.my.id/api/v1/account/snippets`, authenticated with
`Authorization: Bearer <your kyy_... key>`. The key needs the
`snippets:write` scope.

**curl**

```bash
curl -X POST "https://kyyinfinite.my.id/api/v1/account/snippets" \
  -H "Authorization: Bearer kyy_xxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "debounce helper",
    "description": "small dependency-free debounce for input handlers",
    "language": "javascript",
    "code": "export function debounce(fn, delay=300){...}",
    "tags": ["utility"]
  }'
```

**Python**

```python
import requests

API_KEY = "kyy_xxxxxxxxxxxxxxxxxxxx"

response = requests.post(
    "https://kyyinfinite.my.id/api/v1/account/snippets",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "title": "debounce helper",
        "description": "small dependency-free debounce for input handlers",
        "language": "javascript",
        "code": "export function debounce(fn, delay=300):\n    ...",
        "tags": ["utility"],
    },
)
response.raise_for_status()
print(response.json())
```

Same pattern for listing (`GET`) and withdrawing (`DELETE
/api/v1/account/snippets/<id>`) your own submissions. Downloading doesn't
need auth at all — `GET /api/snippets/<id>` or the plain-text
`GET /raw/<id>` both work with no key.

## Using the CLI

```bash
# Bot/script path — no login, just a key with the snippets:write scope
kyyinfinite use-key kyy_xxxxxxxxxxxxxxxxxxxx

# Or: sign in as a user (asks for your Firebase Web API key once, then caches it)
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
