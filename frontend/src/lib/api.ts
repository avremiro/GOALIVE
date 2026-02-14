const API_BASE_URL =
  import.meta.env.VITE_API_URL?.toString() ?? "http://localhost:5000/api/v1";

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
