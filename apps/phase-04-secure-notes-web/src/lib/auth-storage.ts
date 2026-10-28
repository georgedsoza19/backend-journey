"use client";

const ACCESS = "sn_access";
const REFRESH = "sn_refresh";
const USER = "sn_user";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

export function saveSession(input: {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
}): void {
  localStorage.setItem(ACCESS, input.accessToken);
  localStorage.setItem(REFRESH, input.refreshToken);
  localStorage.setItem(USER, JSON.stringify(input.user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(USER);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH);
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
