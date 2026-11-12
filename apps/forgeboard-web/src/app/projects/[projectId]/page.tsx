"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Button,
  Field,
  Input,
  PageShell,
  Panel,
  TextArea,
} from "@backend-journey/ui";
import {
  createIssue,
  getUser,
  listIssues,
  type Issue,
} from "../../../lib/api";

export default function ProjectIssuesPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;
  const [issues, setIssues] = useState<Issue[]>([]);
  const [cache, setCache] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await listIssues(projectId);
    setIssues(result.data);
    setCache(result.meta.cache);
  }, [projectId]);

  useEffect(() => {
    if (!getUser()) {
      router.replace("/login");
      return;
    }
    refresh().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load issues");
    });
  }, [refresh, router]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await createIssue(projectId, {
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
        priority: String(form.get("priority") ?? "MEDIUM"),
      });
      event.currentTarget.reset();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  return (
    <PageShell
      brand="ForgeBoard"
      title="Project issues"
      actions={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button type="button" variant="ghost" onClick={() => void refresh()}>
            Refresh
          </Button>
          <Link href="/workspaces">
            <Button type="button" variant="ghost">
              Workspaces
            </Button>
          </Link>
        </div>
      }
    >
      {cache ? (
        <p style={{ color: "var(--bj-muted)" }}>
          List cache: <strong>{cache}</strong>
        </p>
      ) : null}
      {error ? <p style={{ color: "var(--bj-danger)" }}>{error}</p> : null}

      <div style={{ display: "grid", gap: "1.25rem" }}>
        <Panel>
          <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
            New issue
          </h2>
          <form onSubmit={onCreate} style={{ display: "grid", gap: "0.75rem" }}>
            <Field label="Title">
              <Input name="title" required />
            </Field>
            <Field label="Body">
              <TextArea name="body" />
            </Field>
            <Field label="Priority">
              <select
                name="priority"
                defaultValue="MEDIUM"
                style={{
                  padding: "0.6rem",
                  borderRadius: "var(--bj-radius)",
                  background: "var(--bj-bg)",
                  color: "var(--bj-text)",
                  border: "1px solid var(--bj-border)",
                }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </Field>
            <Button type="submit">Create</Button>
          </form>
        </Panel>

        <Panel>
          <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
            Issues ({issues.length})
          </h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {issues.map((issue) => (
              <article
                key={issue.id}
                style={{
                  borderTop: "1px solid var(--bj-border)",
                  paddingTop: "0.75rem",
                }}
              >
                <Link href={`/issues/${issue.id}`}>
                  <strong>{issue.key ?? `#${issue.number}`}</strong> —{" "}
                  {issue.title}
                </Link>
                <p style={{ margin: "0.25rem 0 0", color: "var(--bj-muted)" }}>
                  {issue.status} · {issue.priority}
                  {issue.assignee ? ` · ${issue.assignee.name}` : ""}
                </p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
