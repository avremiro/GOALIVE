const resolveApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_URL?.toString();
  if (fromEnv && fromEnv.length > 0) return fromEnv;

  // In production, prefer same-origin API path when env var is missing.
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/v1`;
  }

  return "http://localhost:5000/api/v1";
};

const API_BASE_URL = resolveApiBaseUrl();

type HttpMethod = "GET" | "POST";

const request = async <T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data as T;
};

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, "GET", undefined, token),
  post: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, "POST", body, token)
};
