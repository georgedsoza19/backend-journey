"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Button,
  Field,
  PageShell,
  Panel,
  TextArea,
} from "@backend-journey/ui";
import {
  addComment,
  getIssue,
  getUser,
  updateIssue,
  type Issue,
} from "../../../lib/api";

export default function IssueDetailPage() {
  const params = useParams<{ issueId: string }>();
  const router = useRouter();
  const issueId = params.issueId;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await getIssue(issueId);
    setIssue(result.data);
  }, [issueId]);

  useEffect(() => {
    if (!getUser()) {
      router.replace("/login");
      return;
    }
    refresh().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load issue");
    });
  }, [refresh, router]);

  async function onStatus(status: string) {
    try {
      await updateIssue(issueId, { status });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function onComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await addComment(issueId, String(form.get("body") ?? ""));
      event.currentTarget.reset();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comment failed");
    }
  }

  if (!issue) {
    return (
      <PageShell brand="ForgeBoard" title="Issue">
        {error ? <p style={{ color: "var(--bj-danger)" }}>{error}</p> : <p>Loading…</p>}
      </PageShell>
    );
  }

  return (
    <PageShell
      brand="ForgeBoard"
      title={`${issue.key ?? `#${issue.number}`} · ${issue.title}`}
      actions={
        <Link href={`/projects/${issue.projectId}`}>
          <Button type="button" variant="ghost">
            Back to board
          </Button>
        </Link>
      }
    >
      {error ? <p style={{ color: "var(--bj-danger)" }}>{error}</p> : null}

      <div style={{ display: "grid", gap: "1.25rem" }}>
        <Panel>
          <p style={{ color: "var(--bj-muted)", marginTop: 0 }}>
            {issue.status} · {issue.priority} · reporter {issue.reporter.name}
            {issue.assignee ? ` · assignee ${issue.assignee.name}` : ""}
          </p>
          <p>{issue.body || "No description."}</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
              <Button
                key={status}
                type="button"
                variant={issue.status === status ? "primary" : "ghost"}
                onClick={() => void onStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
            Comments
          </h2>
          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
            {(issue.comments ?? []).map((comment) => (
              <article key={comment.id}>
                <strong>{comment.author.name}</strong>
                <p style={{ margin: "0.25rem 0" }}>{comment.body}</p>
              </article>
            ))}
          </div>
          <form onSubmit={onComment} style={{ display: "grid", gap: "0.75rem" }}>
            <Field label="Add comment">
              <TextArea name="body" required />
            </Field>
            <Button type="submit">Comment</Button>
          </form>
        </Panel>
      </div>
    </PageShell>
  );
}
