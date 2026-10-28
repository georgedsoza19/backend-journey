"use client";

import { apiFetch } from "@backend-journey/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3005";
const ACCESS = "cf_access";
const USER = "cf_user";

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type Post = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt: string | null;
  author: { id: string; email: string; name: string };
};

export function saveSession(accessToken: string, user: User): void {
  localStorage.setItem(ACCESS, accessToken);
  localStorage.setItem(USER, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(USER);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function fetchFeed() {
  return apiFetch<{
    data: Post[];
    meta: { cache: "HIT" | "MISS"; total: number };
  }>(API_URL, "/feed");
}

export async function login(email: string, password: string) {
  const result = await apiFetch<{
    data: { user: User; accessToken: string };
  }>(API_URL, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(result.data.accessToken, result.data.user);
  return result.data.user;
}

export async function listMine() {
  return apiFetch<{ data: Post[] }>(API_URL, "/posts", {
    accessToken: getAccessToken(),
  });
}

export async function createPost(input: {
  title: string;
  body: string;
  published: boolean;
}) {
  return apiFetch<{ data: Post }>(API_URL, "/posts", {
    method: "POST",
    accessToken: getAccessToken(),
    body: JSON.stringify(input),
  });
}

export async function publishPost(id: string, published: boolean) {
  return apiFetch<{ data: Post }>(API_URL, `/posts/${id}`, {
    method: "PATCH",
    accessToken: getAccessToken(),
    body: JSON.stringify({ published }),
  });
}
