"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, PageShell, Panel } from "@backend-journey/ui";
import { fetchFeed, type Post } from "../lib/api";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cache, setCache] = useState<"HIT" | "MISS" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const result = await fetchFeed();
      setPosts(result.data);
      setCache(result.meta.cache);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <PageShell
      brand="Cached Feed"
      title="Public published posts (Redis-backed)"
      actions={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button type="button" variant="ghost" onClick={() => void load()}>
            Refresh
          </Button>
          <Link href="/studio">
            <Button type="button">Publisher studio</Button>
          </Link>
        </div>
      }
    >
      {cache ? (
        <p style={{ color: "var(--bj-muted)" }}>
          Last response cache: <strong>{cache}</strong> (check{" "}
          <code>X-Cache</code> header too)
        </p>
      ) : null}
      {error ? <p style={{ color: "var(--bj-danger)" }}>{error}</p> : null}

      <Panel>
        <div style={{ display: "grid", gap: "1rem" }}>
          {posts.map((post) => (
            <article
              key={post.id}
              style={{ borderTop: "1px solid var(--bj-border)", paddingTop: "0.85rem" }}
            >
              <h2
                style={{
                  margin: "0 0 0.35rem",
                  fontFamily: "var(--bj-font-display)",
                }}
              >
                {post.title}
              </h2>
              <p style={{ margin: 0 }}>{post.body}</p>
              <p style={{ color: "var(--bj-muted)", fontSize: "0.85rem" }}>
                by {post.author.name}
              </p>
            </article>
          ))}
          {posts.length === 0 ? (
            <p style={{ color: "var(--bj-muted)" }}>No published posts yet.</p>
          ) : null}
        </div>
      </Panel>
    </PageShell>
  );
}
