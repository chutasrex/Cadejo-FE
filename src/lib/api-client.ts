const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.warn('EXPO_PUBLIC_API_URL is not set — API calls will fail.');
} else {
  console.log(`Using API base URL: ${API_BASE_URL}`);
}

let getToken: () => Promise<string | null> | string | null = () => null;

export function configureApiAuthToken(getter: typeof getToken) {
  getToken = getter;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  console.log('API request:', {
    method: options.method ?? 'GET',
    url: `${API_BASE_URL}${path}`,
    hasToken: !!token,
    body: options.body,
  });

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { auth: token } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(body || response.statusText, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  console.log('API response:', {
    status: response.status,
    body: await response.clone().text().catch(() => ''),
  });

  return response.json();
}

export const apiClient = {
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'DELETE',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};