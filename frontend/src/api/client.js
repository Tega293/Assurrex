const ACCOUNT_KEY = 'assurex_account_id';
const AUTH_EVENT = 'assurex_auth_event';

function announceAccount(id) {
  localStorage.setItem(
    AUTH_EVENT,
    JSON.stringify({ id, time: Date.now() })
  );
}

async function request(path, options = {}) {
  const accountId = sessionStorage.getItem(ACCOUNT_KEY);
  const headers = new Headers(options.headers || {});

  if (accountId) {
    headers.set('X-Account-ID', accountId);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (accountId && accountId !== sessionStorage.getItem(ACCOUNT_KEY)) {
    throw new Error('The account changed while this request was loading.');
  }

  if (!response.ok) {
    const error = new Error(
      data?.error || `Request failed (${response.status}). Is Flask running?`
    );
    error.status = response.status;

    const protectedPath =
      path.startsWith('/api/claims') ||
      path.startsWith('/api/profile') ||
      path.startsWith('/api/documents');

    if (protectedPath && (response.status === 401 || response.status === 409)) {
      window.dispatchEvent(new Event('assurex:account-changed'));
    }

    throw error;
  }

  return data;
}

const json = value => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(value),
});

export const getSession = async () => {
  const data = await request('/api/auth/session');
  const oldId = sessionStorage.getItem(ACCOUNT_KEY);

  if (oldId && oldId !== String(data.id)) {
    sessionStorage.removeItem(ACCOUNT_KEY);
    throw new Error('The account changed in another tab. Sign in again.');
  }

  sessionStorage.setItem(ACCOUNT_KEY, String(data.id));
  return data;
};

export const login = async (username, password) => {
  const data = await request('/api/auth/login', {
    method: 'POST',
    ...json({ username, password }),
  });

  sessionStorage.setItem(ACCOUNT_KEY, String(data.id));
  announceAccount(data.id);
  return data;
};

export const register = (display_name, username, password) =>
  request('/api/auth/register', {
    method: 'POST',
    ...json({ display_name, username, password }),
  });

export const logout = async () => {
  try {
    return await request('/api/auth/logout', { method: 'POST' });
  } finally {
    sessionStorage.removeItem(ACCOUNT_KEY);
    announceAccount(null);
  }
};

export const getProfile = () => request('/api/profile');

export const editProfile = details =>
  request('/api/profile', {
    method: 'PATCH',
    ...json(details),
  });

export const changePassword = details =>
  request('/api/profile/password', {
    method: 'PUT',
    ...json(details),
  });

export const getClaims = () => request('/api/claims');

export const getClaim = id =>
  request(`/api/claims/${encodeURIComponent(id)}`);

export const getPolicies = () => request('/api/policies');

export const analyzeClaim = claim =>
  request('/api/claims/analyze', {
    method: 'POST',
    ...json(claim),
  });

export const scanReceipt = file => {
  const body = new FormData();
  body.append('file', file);

  return request('/api/documents/scan', {
    method: 'POST',
    body,
  });
};

export const reviewClaim = (id, decision, note) =>
  request(`/api/claims/${encodeURIComponent(id)}/review`, {
    method: 'POST',
    ...json({ decision, note }),
  });

export const saveGtmResult = (id, probabilities) =>
  request(`/api/claims/${encodeURIComponent(id)}/gtm-result`, {
    method: 'POST',
    ...json({ probabilities, model_version: 'gtm-v1' }),
  });