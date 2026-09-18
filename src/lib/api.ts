/**
 * Thin client for the Yes Dhobi backend (https://github.com/Karthik0809/yesdhobi-backend).
 * Base URL comes from VITE_API_URL (default http://localhost:4000/api/v1).
 * Handles bearer tokens, silent refresh on 401 and error extraction.
 */

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:4000/api/v1';

/** Origin of the API (used for Socket.IO), e.g. http://localhost:4000 */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, '');

const ACCESS_KEY = 'yd_admin_access_token';
const REFRESH_KEY = 'yd_admin_refresh_token';
const USER_KEY = 'yd_admin_user';

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
}

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  get user(): AdminUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  },
  set(tokens: { accessToken: string; refreshToken: string; user?: AdminUser }) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    if (tokens.user) localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        tokenStore.set(data);
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function request<T>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.access;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'NETWORK', `Cannot reach the API at ${API_BASE_URL}. Is the backend running?`);
  }

  if (res.status === 401 && retry && tokenStore.refresh && !path.startsWith('/auth/')) {
    if (await refreshTokens()) return request<T>(method, path, body, false);
    tokenStore.clear();
    window.dispatchEvent(new Event('yd:logout'));
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) {
    const err = (data.error as { code?: string; message?: string; details?: unknown } | undefined) ?? {};
    throw new ApiError(res.status, err.code ?? 'ERROR', (data.message as string) ?? err.message ?? res.statusText, err.details);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** Fetch every page of a list endpoint (the panel renders full tables client-side). */
export async function getAll<T>(path: string, limit = 200): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const first = await api.get<Paginated<T>>(`${path}${sep}page=1&limit=${limit}`);
  const out = [...first.data];
  for (let page = 2; page <= first.pagination.totalPages; page++) {
    const next = await api.get<Paginated<T>>(`${path}${sep}page=${page}&limit=${limit}`);
    out.push(...next.data);
  }
  return out;
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const data = await api.post<{ accessToken: string; refreshToken: string; user: AdminUser }>('/auth/admin/login', { email, password });
  tokenStore.set(data);
  return data.user;
}

export async function logoutAdmin(): Promise<void> {
  const refreshToken = tokenStore.refresh;
  tokenStore.clear();
  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
    } catch {
      // ignore
    }
  }
}

/** Encode an id that may contain '#', e.g. "#YD-100001". */
export const enc = (id: string) => encodeURIComponent(id.replace(/^#/, ''));
