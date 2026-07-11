const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const parts = [data && data.message, data && data.error, data && data.hint].filter(Boolean);
    throw new Error(parts.length ? parts.join(' — ') : 'Request failed');
  }

  return data;
}

export const api = {
  // --- ASSETS ---
  listAssets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assets${query ? `?${query}` : ''}`);
  },
  getAsset: (id) => request(`/assets/${id}`),
  getAssetBySlug: (slug) => request(`/assets/slug/${slug}`),
  downloadAsset: (id) => request(`/assets/${id}/download`, { method: 'POST' }),
  listAssetsAdmin: (token) => request('/assets/admin/all', { token }),
  getUploadUrl: (token, body) => request('/assets/upload-url', { method: 'POST', body, token }),
  createAsset: (token, body) => request('/assets', { method: 'POST', body, token }),
  updateAsset: (token, id, body) => request(`/assets/${id}`, { method: 'PUT', body, token }),
  deleteAsset: (token, id) => request(`/assets/${id}`, { method: 'DELETE', token }),
  addChangelogEntry: (token, id, body) => request(`/assets/${id}/changelog`, { method: 'POST', body, token }),
  downloadChangelogVersion: (id, changelogId) => request(`/assets/${id}/changelog/${changelogId}/download`, { method: 'POST' }),

  // --- PRODUCTS ---
  listProducts: () => request('/products'),
  listProductsAdmin: (token) => request('/products/admin/all', { token }),
  createProduct: (token, body) => request('/products', { method: 'POST', body, token }),
  updateProduct: (token, id, body) => request(`/products/${id}`, { method: 'PUT', body, token }),

  // --- PAYMENTS & ORDERS ---
  createOrder: (body) => request('/payments/order', { method: 'POST', body }),
  getOrderStatus: (orderId) => request(`/payments/order/${orderId}`),

  // --- ADMIN METRICS & PANELS ---
  getMetrics: (token) => request('/admin/metrics', { token }),
  listOrders: (token) => request('/admin/orders', { token }),
  listPanels: (token) => request('/admin/panels', { token }),

  // --- CHANGELOG ---
  listChangelog: () => request('/changelog'),
  createChangelog: (token, body) => request('/changelog', { method: 'POST', body, token }),

  // --- SNIPPETS ---
  listSnippets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/snippets${query ? `?${query}` : ''}`);
  },
  getSnippet: (id) => request(`/snippets/${id}`),
  listSnippetsAdmin: (token) => request('/snippets/admin/all', { token }),
  createSnippet: (token, body) => request('/snippets', { method: 'POST', body, token }),
  updateSnippet: (token, id, body) => request(`/snippets/${id}`, { method: 'PUT', body, token }),
  deleteSnippet: (token, id) => request(`/snippets/${id}`, { method: 'DELETE', token }),
};
