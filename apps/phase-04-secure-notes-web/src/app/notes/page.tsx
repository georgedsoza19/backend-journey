"use client";

import { useRouter } from "next/navigation";
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
  createNote,
  deleteNote,
  listNotes,
  logout,
  updateNote,
} from "../../lib/api";
import { getUser, type StoredUser } from "../../lib/auth-storage";

type Note = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string;
  author: { id: string; email: string; name: string };
};

export default function NotesPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);

  const refresh = useCallback(async (nextScope: "mine" | "all") => {
    const result = await listNotes(nextScope);
    setNotes(result.data);
  }, []);

  useEffect(() => {
    const current = getUser();
    if (!current) {
      router.replace("/login");
      return;
    }
    setUser(current);
    refresh("mine").catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    });
  }, [refresh, router]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await createNote({
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
        published: form.get("published") === "on",
      });
      event.currentTarget.reset();
      await refresh(scope);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function onSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    try {
      await updateNote(editing.id, {
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
        published: form.get("published") === "on",
      });
      setEditing(null);
      await refresh(scope);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteNote(id);
      await refresh(scope);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  if (!user) {
    return null;
  }

  return (
    <PageShell
      brand="Secure Notes"
      title={`Signed in as ${user.name} (${user.role})`}
      actions={
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {user.role === "ADMIN" ? (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                const next = scope === "mine" ? "all" : "mine";
                setScope(next);
                refresh(next).catch((err: unknown) => {
                  setError(err instanceof Error ? err.message : "Load failed");
                });
              }}
            >
              Scope: {scope}
            </Button>
          ) : null}
          <Button variant="ghost" type="button" onClick={onLogout}>
            Log out
          </Button>
        </div>
      }
    >
      {error ? (
        <p style={{ color: "var(--bj-danger)" }}>{error}</p>
      ) : null}

      <div style={{ display: "grid", gap: "1.25rem" }}>
        <Panel>
          <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
            {editing ? "Edit note" : "New note"}
          </h2>
          <form
            key={editing?.id ?? "create"}
            onSubmit={editing ? onSaveEdit : onCreate}
            style={{ display: "grid", gap: "0.85rem" }}
          >
            <Field label="Title">
              <Input
                name="title"
                required
                defaultValue={editing?.title ?? ""}
              />
            </Field>
            <Field label="Body">
              <TextArea name="body" required defaultValue={editing?.body ?? ""} />
            </Field>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                name="published"
                defaultChecked={editing?.published ?? false}
              />
              Published
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
              {editing ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Panel>

        <Panel>
          <h2 style={{ fontFamily: "var(--bj-font-display)", marginTop: 0 }}>
            Notes ({notes.length})
          </h2>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {notes.map((note) => (
              <article
                key={note.id}
                style={{
                  borderTop: "1px solid var(--bj-border)",
                  paddingTop: "0.85rem",
                }}
              >
                <h3 style={{ margin: "0 0 0.35rem" }}>{note.title}</h3>
                <p style={{ margin: 0, color: "var(--bj-muted)" }}>{note.body}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--bj-muted)" }}>
                  by {note.author.name}
                  {note.published ? " · published" : " · private"}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditing(note)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDelete(note.id)}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
            {notes.length === 0 ? (
              <p style={{ color: "var(--bj-muted)" }}>No notes yet.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
