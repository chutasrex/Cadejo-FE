const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.warn('EXPO_PUBLIC_API_URL is not set — API calls will fail.');
}

// Decoupled from any specific auth implementation. Call `configureApiAuthToken`
// once from your auth provider/context whenever the token changes.
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  return response.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
};