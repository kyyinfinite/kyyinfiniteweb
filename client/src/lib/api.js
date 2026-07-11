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
  downloadAsset: (id) => request(`/assets/${id}/download`, { method: 'POST' }),
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
};

export function cancelActiveUpload() {
  if (uploadWithProgress.activeXhr) {
    uploadWithProgress.activeXhr.abort();
  }
}
