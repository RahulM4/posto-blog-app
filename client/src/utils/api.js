const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value) => (value.startsWith('/') ? value : `/${value}`);

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

const resolveBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) return envBaseUrl;

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin) return `${origin}/api`;
  }

  return DEFAULT_API_BASE_URL;
};

const rawBaseUrl = resolveBaseUrl();
const API_BASE_URL = trimTrailingSlash(rawBaseUrl);

let API_ORIGIN = '';
try {
  const parsed = new URL(API_BASE_URL);
  API_ORIGIN = parsed.origin;
} catch {
  API_ORIGIN = '';
}

const buildUrl = (endpoint, params) => {
  const path = ensureLeadingSlash(endpoint);
  const query = params ? new URLSearchParams(params) : null;
  return `${API_BASE_URL}${path}${query && query.toString() ? `?${query.toString()}` : ''}`;
};

const parseJson = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return { success: false, message: text };
};

const request = async (endpoint, { params, headers = {}, ...options } = {}) => {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    ...options
  });

  const payload = await parseJson(response);
  if (!response.ok || payload.success === false) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload;
};

const uploadForm = async (endpoint, formData, { params, headers = {}, method = 'POST' } = {}) => {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    credentials: 'include',
    method,
    body: formData,
    headers: {
      Accept: 'application/json',
      ...headers
    }
  });

  const payload = await parseJson(response);
  if (!response.ok || payload.success === false) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload;
};

export const api = {
  getPublicPosts: (params, options) => request('/public/posts', { params, ...options }),
  getPublicPost: (slug, options) => request(`/public/posts/${slug}`, options),
  getPublicCategories: (params, options) => request('/public/categories', { params, ...options }),
  adminGetCategories: (params, options) => request('/categories', { params, ...options }),
  adminCreateCategory: (payload, options) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  getPublicProducts: (params, options) => request('/public/products', { params, ...options }),
  getPublicProduct: (slug, options) => request(`/public/products/${slug}`, options),
  submitPost: (payload, options) =>
    request('/posts/user-submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  updateMyPost: (postId, payload, options) =>
    request(`/posts/user-submissions/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      ...options
    }),
  getMyPost: (postId, options) => request(`/posts/user-submissions/${postId}`, { ...options }),
  getCurrentUser: (options) => request('/auth/me', { ...options }),
  login: (payload, options) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  register: (payload, options) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  logout: (options) =>
    request('/auth/logout', {
      method: 'POST',
      ...options
    }),
  verifyEmail: (payload, options) =>
    request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  bootstrapAdmin: (payload, options) =>
    request('/auth/bootstrap-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  adminGetUsers: (params, options) => request('/users', { params, ...options }),
  adminSetUserStatus: (userId, status, options) =>
    request(`/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
      ...options
    }),
  adminSetUserApproval: (userId, approvalStatus, note, options) =>
    request(`/users/${userId}/approval`, {
      method: 'POST',
      body: JSON.stringify(note ? { approvalStatus, note } : { approvalStatus }),
      ...options
    }),
  adminUploadMedia: (formData, options) => uploadForm('/media', formData, { ...(options || {}) }),
  adminCreatePost: (payload, options) =>
    request('/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  getMyPosts: (params, options) => request('/posts/mine', { params, ...options }),
  adminGetPosts: (params, options) => request('/posts', { params, ...options }),
  adminGetPost: (postId, options) => request(`/posts/${postId}`, { ...options }),
  adminApprovePost: (postId, options) =>
    request(`/posts/${postId}/approve`, {
      method: 'POST',
      ...options
    }),
  adminUpdatePost: (postId, payload, options) =>
    request(`/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      ...options
    }),
  adminDeletePost: (postId, options) =>
    request(`/posts/${postId}`, {
      method: 'DELETE',
      ...options
    }),
  adminCreateProduct: (payload, options) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
      ...options
    }),
  adminGetProducts: (params, options) => request('/products', { params, ...options }),
  adminGetProduct: (productId, options) => request(`/products/${productId}`, { ...options }),
  adminUpdateProduct: (productId, payload, options) =>
    request(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      ...options
    }),
  adminSoftDeleteProduct: (productId, options) =>
    request(`/products/${productId}`, {
      method: 'DELETE',
      ...options
    }),
  adminRestoreProduct: (productId, options) =>
    request(`/products/${productId}/restore`, {
      method: 'POST',
      ...options
    }),
  search: (params, options) => request('/search', { params, ...options })
};

export const resolveMediaUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (!API_ORIGIN) return value;
  return `${API_ORIGIN}${ensureLeadingSlash(value)}`;
};

export const apiConfig = {
  API_BASE_URL,
  API_ORIGIN
};
