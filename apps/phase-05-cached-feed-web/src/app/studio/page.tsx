"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  Button,
  Field,
  Input,
  PageShell,
  Panel,
  TextArea,
} from "@backend-journey/ui";
import {
  clearSession,
  createPost,
  getUser,
  listMine,
  login,
  publishPost,
  type Post,
  type User,
} from "../../lib/api";

export default function StudioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refreshMine() {
    const result = await listMine();
    setPosts(result.data);
  }

  useEffect(() => {
    const current = getUser();
    if (!current) return;
    setUser(current);
    refreshMine().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    });
  }, []);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const next = await login(
        String(form.get("email") ?? ""),
        String(form.get("password") ?? ""),
      );
      setUser(next);
      await refreshMine();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await createPost({
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
        published: form.get("published") === "on",
      });
      event.currentTarget.reset();
      await refreshMine();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  if (!user) {
    return (
      <PageShell brand="Cached Feed" title="Publisher studio">
        <Panel style={{ maxWidth: 420 }}>
          <form onSubmit={onLogin} style={{ display: "grid", gap: "1rem" }}>
            <Field label="Email">
              <Input
                name="email"
                type="email"
                required
                defaultValue="writer@example.com"
              />
            </Field>
            <Field label="Password">
              <Input
                name="password"
                type="password"
                required
                defaultValue="Password123!"
              />
            </Field>
            {error ? (
              <p style={{ color: "var(--bj-danger)", margin: 0 }}>{error}</p>
            ) : null}
            <Button type="submit">Sign in</Button>
          </form>
          <p style={{ color: "var(--bj-muted)" }}>
            <Link href="/">Back to public feed</Link>
          </p>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      brand="Cached Feed"
      title={`Studio — ${user.name}`}
      actions={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/">
            <Button type="button" variant="ghost">
              Public feed
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              clearSession();
              setUser(null);
              setPosts([]);
            }}
          >
            Log out
          </Button>
        </div>
      }
    >
      {error ? <p style={{ color: "var(--bj-danger)" }}>{error}</p> : null}

      <div style={{ display: "grid", gap: "1.25rem" }}>
        <Panel>
          <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
            New post
          </h2>
          <form onSubmit={onCreate} style={{ display: "grid", gap: "0.85rem" }}>
            <Field label="Title">
              <Input name="title" required />
            </Field>
            <Field label="Body">
              <TextArea name="body" required />
            </Field>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="checkbox" name="published" />
              Publish immediately (invalidates feed cache)
            </label>
            <Button type="submit">Create</Button>
          </form>
        </Panel>

        <Panel>
          <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
            Your posts
          </h2>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {posts.map((post) => (
              <article
                key={post.id}
                style={{
                  borderTop: "1px solid var(--bj-border)",
                  paddingTop: "0.75rem",
                }}
              >
                <h3 style={{ margin: "0 0 0.35rem" }}>{post.title}</h3>
                <p style={{ margin: 0, color: "var(--bj-muted)" }}>{post.body}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--bj-muted)" }}>
                  {post.published ? "Published" : "Draft"}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    publishPost(post.id, !post.published)
                      .then(() => refreshMine())
                      .catch((err: unknown) => {
                        setError(
                          err instanceof Error ? err.message : "Update failed",
                        );
                      });
                  }}
                >
                  {post.published ? "Unpublish" : "Publish"}
                </Button>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
