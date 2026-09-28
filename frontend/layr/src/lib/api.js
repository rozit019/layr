const API_ROOT = '/api';

export async function apiRequest(path, { token, method = 'GET', body, headers = {}, ...options } = {}) {
  const requestHeaders = { Accept: 'application/json', ...headers };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  let requestBody = body;
  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export function normalizeTemplate(template) {
  const category = template.category;
  return {
    ...template,
    title: template.title || template.name,
    category,
    tagline: template.tagline || template.description || 'A thoughtful template, ready to make your own.',
    previewStyle: template.previewStyle || category,
    coverImage: template.coverImage || template.previewImageUrl || template.previewImage || '',
    currency: template.currency || 'NPR',
    price: Number(template.price || 0),
    featured: Boolean(template.featured || template.isFeatured),
    demoOnly: Boolean(template.demoOnly),
  };
}
