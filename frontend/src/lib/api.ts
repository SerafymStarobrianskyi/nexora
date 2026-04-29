import { getToken, removeToken } from "./auth-token";

const API_BASE_URL = "http://localhost:3000";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  
  if(res.status===401){
    removeToken();
    window.location.href = "/login";
  }

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}