"use client";

import { apiFetch } from "@backend-journey/api-client";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
  type StoredUser,
} from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3004";

type AuthPayload = {
  data: {
    user: StoredUser;
    accessToken: string;
    refreshToken: string;
  };
};

type NotesPayload = {
  data: Array<{
    id: string;
    title: string;
    body: string;
    published: boolean;
    createdAt: string;
    author: { id: string; email: string; name: string };
  }>;
  meta: { page: number; limit: number; total: number; totalPages: number };
};

async function withAuth<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await apiFetch<T>(API_URL, path, {
      ...init,
      accessToken: getAccessToken(),
    });
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status !== 401) throw error;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      throw error;
    }

    const refreshed = await apiFetch<AuthPayload>(API_URL, "/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    saveSession(refreshed.data);

    return apiFetch<T>(API_URL, path, {
      ...init,
      accessToken: refreshed.data.accessToken,
    });
  }
}

export async function register(input: {
  email: string;
  name: string;
  password: string;
}) {
  const result = await apiFetch<AuthPayload>(API_URL, "/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  saveSession(result.data);
  return result.data.user;
}

export async function login(input: { email: string; password: string }) {
  const result = await apiFetch<AuthPayload>(API_URL, "/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  saveSession(result.data);
  return result.data.user;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiFetch(API_URL, "/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore network errors on logout
    }
  }
  clearSession();
}

export async function listNotes(scope: "mine" | "all" = "mine") {
  return withAuth<NotesPayload>(`/notes?scope=${scope}&limit=50`);
}

export async function createNote(input: {
  title: string;
  body: string;
  published?: boolean;
}) {
  return withAuth<{ data: NotesPayload["data"][number] }>("/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateNote(
  id: string,
  input: { title?: string; body?: string; published?: boolean },
) {
  return withAuth<{ data: NotesPayload["data"][number] }>(`/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteNote(id: string) {
  return withAuth<void>(`/notes/${id}`, { method: "DELETE" });
}
