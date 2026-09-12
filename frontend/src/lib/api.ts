const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE_URL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api/v1`;

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.body && options.body instanceof FormData) {
    // Delete Content-Type so browser handles multipart boundary
    delete (headers as any)['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // vital for HttpOnly admin_session cookie
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Error ${response.status}: Ha ocurrido un problema.`;
    const err = new Error(typeof errorMsg === 'string' ? errorMsg : errorMsg[0] || 'Error en servidor');
    (err as any).status = response.status;
    (err as any).data = data;
    throw err;
  }

  return data as T;
}
