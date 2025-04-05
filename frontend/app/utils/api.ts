/**
 * API utility functions for making requests to the backend
 */

export const API_BASE_URL = "http://0.0.0.0:8000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: Record<string, unknown> | unknown[];
};

/**
 * Custom fetch function that automatically calls our backend API
 * @param endpoint - The API endpoint (without the base URL)
 * @param options - Request options (method, headers, body)
 * @returns The fetch response
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const requestOptions: RequestInit = {
    method: options.method || "GET",
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export function apiGet<T = unknown>(
  endpoint: string,
  headers?: Record<string, string>
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET", headers });
}

export function apiPost<T = unknown>(
  endpoint: string,
  body: Record<string, unknown> | unknown[],
  headers?: Record<string, string>
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", body, headers });
}

export function apiPut<T = unknown>(
  endpoint: string,
  body: Record<string, unknown> | unknown[],
  headers?: Record<string, string>
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PUT", body, headers });
}

export function apiDelete<T = unknown>(
  endpoint: string,
  headers?: Record<string, string>
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE", headers });
}
