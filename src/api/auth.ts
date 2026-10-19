import { apiJSON } from "./http";

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export function register(username: string, password: string) {
  return apiJSON<AuthUser>("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function login(username: string, password: string) {
  return apiJSON<AuthUser>("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return apiJSON<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" });
}

export function me() {
  return apiJSON<AuthUser>("/api/v1/auth/me");
}
