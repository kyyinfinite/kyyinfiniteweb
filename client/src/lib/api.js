const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, { method = 'GET', body, token, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const parts = [data && data.message, data && data.error, data && data.hint].filter(Boolean);
    throw new Error(parts.length ? parts.join(' — ') : 'Request failed');
  }

  return data;
}

function uploadWithProgress(path, formData, token, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${path}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (parseError) {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const parts = [data && data.message, data && data.error, data && data.hint].filter(Boolean);
        reject(new Error(parts.length ? parts.join(' — ') : `Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));

    xhr.send(formData);
    uploadWithProgress.activeXhr = xhr;
  });
}

export const api = {
  listAssets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assets${query ? `?${query}` : ''}`);
  },
  downloadAsset: (id, licenseKey) =>
    request(`/assets/${id}/download`, { method: 'POST', body: licenseKey ? { licenseKey } : undefined }),
  listAssetsAdmin: (token) => request('/assets/admin/all', { token }),
  createAssetWithFile: (token, formData, onProgress) =>
    uploadWithProgress('/assets', formData, token, onProgress),
  updateAsset: (token, id, body) => request(`/assets/${id}`, { method: 'PUT', body, token }),
  deleteAsset: (token, id) => request(`/assets/${id}`, { method: 'DELETE', token }),
  getAsset: (id) => request(`/assets/${id}`),
  getAssetBySlug: (slug) => request(`/assets/slug/${slug}`),
  addChangelogEntryWithFile: (token, id, formData, onProgress) =>
    uploadWithProgress(`/assets/${id}/changelog`, formData, token, onProgress),
  downloadChangelogVersion: (id, changelogId) =>
    request(`/assets/${id}/changelog/${changelogId}/download`, { method: 'POST' }),

  listProducts: () => request('/products'),
  listProductsAdmin: (token) => request('/products/admin/all', { token }),
  createProduct: (token, body) => request('/products', { method: 'POST', body, token }),
  updateProduct: (token, id, body) => request(`/products/${id}`, { method: 'PUT', body, token }),

  createOrder: (body) => request('/payments/order', { method: 'POST', body }),
  getOrderStatus: (orderId) => request(`/payments/order/${orderId}`),

  getMetrics: (token) => request('/admin/metrics', { token }),
  listOrders: (token) => request('/admin/orders', { token }),
  listPanels: (token) => request('/admin/panels', { token }),

  listLicenseKeys: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/license-keys${query ? `?${query}` : ''}`, { token });
  },
  revokeLicenseKey: (token, id) => request(`/admin/license-keys/${id}/revoke`, { method: 'PATCH', token }),
  resetLicenseActivations: (token, id) =>
    request(`/admin/license-keys/${id}/reset-activations`, { method: 'POST', token }),

  listChangelog: () => request('/changelog'),
  createChangelog: (token, body) => request('/changelog', { method: 'POST', body, token }),

  listSnippets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/snippets${query ? `?${query}` : ''}`);
  },
  getSnippet: (id) => request(`/snippets/${id}`),
  listSnippetsAdmin: (token) => request('/snippets/admin/all', { token }),
  createSnippet: (token, body) => request('/snippets', { method: 'POST', body, token }),
  updateSnippet: (token, id, body) => request(`/snippets/${id}`, { method: 'PUT', body, token }),
  deleteSnippet: (token, id) => request(`/snippets/${id}`, { method: 'DELETE', token }),

  listApiKeys: (token) => request('/admin/api-keys', { token }),
  createApiKey: (token, body) => request('/admin/api-keys', { method: 'POST', body, token }),
  revokeApiKey: (token, id) => request(`/admin/api-keys/${id}/revoke`, { method: 'PATCH', token }),
  updateApiKey: (token, id, body) => request(`/admin/api-keys/${id}`, { method: 'PATCH', body, token }),
  deleteApiKey: (token, id) => request(`/admin/api-keys/${id}`, { method: 'DELETE', token }),

  listApiEndpoints: () => request('/v1/_meta/endpoints'),
};

export async function runPlaygroundRequest(path, params, apiKey) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null))
  ).toString();
  const url = `${API_BASE}/v1${path}${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
  });

  const rateLimit = {
    limit: response.headers.get('X-RateLimit-Limit'),
    remaining: response.headers.get('X-RateLimit-Remaining'),
    reset: response.headers.get('X-RateLimit-Reset'),
  };

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return { ok: response.ok, status: response.status, kind: 'json', data, rateLimit };
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  return { ok: response.ok, status: response.status, kind: 'binary', contentType, blobUrl, rateLimit };
}

export function cancelActiveUpload() {
  if (uploadWithProgress.activeXhr) {
    uploadWithProgress.activeXhr.abort();
  }
}
