import { signInWithPassword, refreshIdToken } from './auth.js';

const DEFAULT_BASE_URL = 'https://kyyinfinite.my.id/api';

class KyyInfiniteError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'KyyInfiniteError';
    this.status = status;
  }
}

export class KyyInfinite {
  /**
   * @param {object} options
   * @param {string} [options.baseUrl] - defaults to the production API
   * @param {string} [options.apiKey] - a `kyy_...` key, for calling public tool endpoints (/v1/...)
   * @param {string} [options.idToken] - a Firebase ID token, for user-scoped actions (snippets, API key management)
   * @param {string} [options.refreshToken] - a Firebase refresh token, so the SDK can silently mint new ID tokens
   * @param {string} [options.firebaseApiKey] - required alongside refreshToken (or for auth.loginWithEmail) — the same public value used as VITE_FIREBASE_API_KEY on the website
   */
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.origin = this.baseUrl.replace(/\/api\/?$/, '');
    this.apiKey = options.apiKey || null;
    this._idToken = options.idToken || null;
    this._refreshToken = options.refreshToken || null;
    this._firebaseApiKey = options.firebaseApiKey || null;

    this.auth = {
      loginWithEmail: async (email, password) => {
        if (!this._firebaseApiKey) {
          throw new KyyInfiniteError('firebaseApiKey is required to log in (see README)');
        }
        const session = await signInWithPassword(this._firebaseApiKey, email, password);
        this._idToken = session.idToken;
        this._refreshToken = session.refreshToken;
        this._uid = session.uid;
        return session;
      },
      setIdToken: (idToken) => {
        this._idToken = idToken;
      },
      setSession: ({ idToken, refreshToken, firebaseApiKey } = {}) => {
        if (idToken) this._idToken = idToken;
        if (refreshToken) this._refreshToken = refreshToken;
        if (firebaseApiKey) this._firebaseApiKey = firebaseApiKey;
      },
      refresh: async () => {
        if (!this._refreshToken || !this._firebaseApiKey) {
          throw new KyyInfiniteError('No refreshToken/firebaseApiKey on hand to refresh the session');
        }
        const session = await refreshIdToken(this._firebaseApiKey, this._refreshToken);
        this._idToken = session.idToken;
        this._refreshToken = session.refreshToken;
        this._uid = session.uid;
        return session;
      },
      get idToken() {
        return this._idToken;
      },
    };

    this.snippets = {
      list: (params = {}) => this._request(`/snippets${toQuery(params)}`),
      get: (id) => this._request(`/snippets/${id}`),
      getRaw: async (id) => {
        const response = await fetch(`${this.origin}/raw/${id}`);
        if (!response.ok) throw new KyyInfiniteError('Snippet not found', response.status);
        return response.text();
      },
      // Prefers a Firebase user session when you have one; otherwise falls
      // back to the API key. Either way, the key needs the `snippets:write`
      // scope — this is the path a bot/script/CLI is meant to use, no
      // Firebase login required.
      submit: (data) =>
        this._idToken
          ? this._request('/user/snippets', { method: 'POST', body: data, auth: 'user' })
          : this._request('/v1/account/snippets', { method: 'POST', body: data, auth: 'apiKey' }),
      listMine: () =>
        this._idToken
          ? this._request('/user/snippets', { auth: 'user' })
          : this._request('/v1/account/snippets', { auth: 'apiKey' }),
      withdraw: (id) =>
        this._idToken
          ? this._request(`/user/snippets/${id}`, { method: 'DELETE', auth: 'user' })
          : this._request(`/v1/account/snippets/${id}`, { method: 'DELETE', auth: 'apiKey' }),
    };

    this.apiKeys = {
      listMine: () => this._request('/user/api-keys', { auth: 'user' }),
      createFree: (data) => this._request('/user/api-keys', { method: 'POST', body: data, auth: 'user' }),
      revoke: (id) => this._request(`/user/api-keys/${id}/revoke`, { method: 'PATCH', auth: 'user' }),
    };

    this.products = {
      list: (params = {}) => this._request(`/assets${toQuery(params)}`),
      get: (id) => this._request(`/assets/${id}`),
      getBySlug: (slug) => this._request(`/assets/slug/${slug}`),
    };

    this.contributors = {
      get: (uid) => this._request(`/public/contributors/${uid}`),
    };

    this.status = {
      health: () => this._request('/health'),
      incidents: () => this._request('/status/incidents'),
    };
  }

  /** Call any `/api/v1/...` tool endpoint using an API key (Authorization: Bearer). */
  async call(endpointPath, params = {}) {
    if (!this.apiKey) {
      throw new KyyInfiniteError('apiKey is required to call /v1 endpoints');
    }
    const path = endpointPath.startsWith('/v1') ? endpointPath : `/v1${endpointPath}`;
    return this._request(`${path}${toQuery(params)}`, { auth: 'apiKey' });
  }

  async _request(path, { method = 'GET', body, auth } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    if (auth === 'user') {
      if (!this._idToken) throw new KyyInfiniteError('Not logged in — call auth.loginWithEmail() or auth.setIdToken() first');
      headers.Authorization = `Bearer ${this._idToken}`;
    } else if (auth === 'apiKey') {
      if (!this.apiKey) throw new KyyInfiniteError('apiKey is required for this call');
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const doFetch = () =>
      fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

    let response = await doFetch();

    // One silent retry after a refresh if a user-scoped call got a stale token.
    if (response.status === 401 && auth === 'user' && this._refreshToken && this._firebaseApiKey) {
      await this.auth.refresh();
      headers.Authorization = `Bearer ${this._idToken}`;
      response = await doFetch();
    }

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'string' ? payload : payload?.message || 'Request failed';
      throw new KyyInfiniteError(message, response.status);
    }
    return payload;
  }
}

function toQuery(params) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

export { KyyInfiniteError };
export default KyyInfinite;
