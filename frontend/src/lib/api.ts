export const getBaseApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith('http')) {
    if (envUrl.includes('certificados-backend.onrender.com')) {
      return 'https://certificados-backend-sxz8.onrender.com/api/v1';
    }
    return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api/v1`;
  }
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com')) {
    return 'https://certificados-backend-sxz8.onrender.com/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getBaseApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_session_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
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
