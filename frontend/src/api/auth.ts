import { apiFetch } from "../lib/api";

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  created_at?: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface ProfileResponse {
  message: string;
  user: AuthUser;
}

export function registerUser(payload: RegisterPayload) {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  return apiFetch<ProfileResponse>("/auth/profile", {
    method: "GET",
  });
}