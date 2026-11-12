"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, PageShell, Panel } from "@backend-journey/ui";
import {
  clearSession,
  getUser,
  listProjects,
  listWorkspaces,
  type Project,
  type User,
  type Workspace,
} from "../../lib/api";

export default function WorkspacesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projectsByWs, setProjectsByWs] = useState<Record<string, Project[]>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = getUser();
    if (!current) {
      router.replace("/login");
      return;
    }
    setUser(current);
    listWorkspaces()
      .then(async (res) => {
        setWorkspaces(res.data);
        const map: Record<string, Project[]> = {};
        for (const ws of res.data) {
          const projects = await listProjects(ws.id);
          map[ws.id] = projects.data;
        }
        setProjectsByWs(map);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load");
      });
  }, [router]);

  if (!user) return null;

  return (
    <PageShell
      brand="ForgeBoard"
      title={`Hi ${user.name}`}
      actions={
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearSession();
            router.replace("/login");
          }}
        >
          Log out
        </Button>
      }
    >
      {error ? <p style={{ color: "var(--bj-danger)" }}>{error}</p> : null}
      <div style={{ display: "grid", gap: "1rem" }}>
        {workspaces.map((ws) => (
          <Panel key={ws.id}>
            <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
              {ws.name}{" "}
              <span style={{ color: "var(--bj-muted)", fontSize: "0.9rem" }}>
                /{ws.slug} · {ws.role}
              </span>
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {(projectsByWs[ws.id] ?? []).map((project) => (
                <li key={project.id} style={{ marginBottom: "0.5rem" }}>
                  <Link href={`/projects/${project.id}`}>
                    <strong>{project.key}</strong> — {project.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
