const IDENTITY_BASE = 'https://identitytoolkit.googleapis.com/v1';
const SECURE_TOKEN_BASE = 'https://securetoken.googleapis.com/v1';

/**
 * Signs in with email/password against Firebase's REST Identity Toolkit API.
 * This is the same mechanism the website itself uses under the hood — the
 * Firebase Web API key is not a secret (it's already public in the site's
 * client bundle), so it's safe to pass in here.
 */
export async function signInWithPassword(firebaseApiKey, email, password) {
  const response = await fetch(`${IDENTITY_BASE}/accounts:signInWithPassword?key=${firebaseApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Sign-in failed');
  }
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    uid: data.localId,
    expiresIn: Number(data.expiresIn) * 1000,
  };
}

/** Exchanges a long-lived refresh token for a fresh (short-lived) ID token. */
export async function refreshIdToken(firebaseApiKey, refreshToken) {
  const response = await fetch(`${SECURE_TOKEN_BASE}/token?key=${firebaseApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }).toString(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Token refresh failed');
  }
  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    uid: data.user_id,
    expiresIn: Number(data.expires_in) * 1000,
  };
}
