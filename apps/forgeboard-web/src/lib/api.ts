"use client";

import { apiFetch } from "@backend-journey/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3006";
const ACCESS = "fb_access";
const REFRESH = "fb_refresh";
const USER = "fb_user";

export type User = { id: string; email: string; name: string };

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export type Project = {
  id: string;
  name: string;
  key: string;
  workspaceId: string;
};

export type Issue = {
  id: string;
  key?: string;
  number: number;
  title: string;
  body: string;
  status: string;
  priority: string;
  projectId: string;
  assignee: User | null;
  reporter: User;
  labels: Array<{ id: string; name: string; color: string }>;
  comments?: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: User;
  }>;
};

export function saveSession(input: {
  accessToken: string;
  refreshToken: string;
  user: User;
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

export function getUser(): User | null {
  const raw = localStorage.getItem(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

async function withAuth<T>(path: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(API_URL, path, {
    ...init,
    accessToken: getAccessToken(),
  });
}

export async function login(email: string, password: string) {
  const result = await apiFetch<{
    data: { user: User; accessToken: string; refreshToken: string };
  }>(API_URL, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(result.data);
  return result.data.user;
}

export async function listWorkspaces() {
  return withAuth<{ data: Workspace[] }>("/workspaces");
}

export async function listProjects(workspaceId: string) {
  return withAuth<{ data: Project[] }>(
    `/workspaces/${workspaceId}/projects`,
  );
}

export async function listIssues(projectId: string) {
  return withAuth<{
    data: Issue[];
    meta: { cache: string; total: number };
  }>(`/projects/${projectId}/issues?limit=50`);
}

export async function createIssue(
  projectId: string,
  input: { title: string; body?: string; status?: string; priority?: string },
) {
  return withAuth<{ data: Issue }>(`/projects/${projectId}/issues`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getIssue(issueId: string) {
  return withAuth<{ data: Issue }>(`/issues/${issueId}`);
}

export async function updateIssue(
  issueId: string,
  input: { status?: string; title?: string; body?: string },
) {
  return withAuth<{ data: Issue }>(`/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function addComment(issueId: string, body: string) {
  return withAuth<{ data: { id: string; body: string } }>(
    `/issues/${issueId}/comments`,
    { method: "POST", body: JSON.stringify({ body }) },
  );
}
