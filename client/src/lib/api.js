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
    throw new Error((data && data.message) || 'Request failed');
  }

  return data;
}

export const api = {
  listAssets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assets${query ? `?${query}` : ''}`);
  },
  downloadAsset: (id) => request(`/assets/${id}/download`, { method: 'POST' }),
  listAssetsAdmin: (token) => request('/assets/admin/all', { token }),
  getUploadUrl: (token, body) => request('/assets/upload-url', { method: 'POST', body, token }),
  createAsset: (token, body) => request('/assets', { method: 'POST', body, token }),
  updateAsset: (token, id, body) => request(`/assets/${id}`, { method: 'PUT', body, token }),
  deleteAsset: (token, id) => request(`/assets/${id}`, { method: 'DELETE', token }),

  listProducts: () => request('/products'),
  createProduct: (token, body) => request('/products', { method: 'POST', body, token }),

  createOrder: (body) => request('/payments/order', { method: 'POST', body }),
  getOrderStatus: (orderId) => request(`/payments/order/${orderId}`),

  getMetrics: (token) => request('/admin/metrics', { token }),
  listOrders: (token) => request('/admin/orders', { token }),
  listPanels: (token) => request('/admin/panels', { token }),
};

api.listChangelog = () => request('/changelog');
api.createChangelog = (token, body) => request('/changelog', { method: 'POST', body, token });

api.listSnippets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/snippets${query ? `?${query}` : ''}`);
};
api.getSnippet = (id) => request(`/snippets/${id}`);
api.listSnippetsAdmin = (token) => request('/snippets/admin/all', { token });
api.createSnippet = (token, body) => request('/snippets', { method: 'POST', body, token });
api.updateSnippet = (token, id, body) => request(`/snippets/${id}`, { method: 'PUT', body, token });
api.deleteSnippet = (token, id) => request(`/snippets/${id}`, { method: 'DELETE', token });

api.getAsset = (id) => request(`/assets/${id}`);
