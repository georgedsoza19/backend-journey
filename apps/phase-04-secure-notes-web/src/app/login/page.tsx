"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Input, PageShell, Panel } from "@backend-journey/ui";
import { login } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await login({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      router.push("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell brand="Secure Notes" title="Sign in to your vault">
      <Panel style={{ maxWidth: 420 }}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
          <Field label="Email">
            <Input name="email" type="email" required defaultValue="alice@example.com" />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" required defaultValue="Password123!" />
          </Field>
          {error ? (
            <p style={{ color: "var(--bj-danger)", margin: 0 }}>{error}</p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p style={{ color: "var(--bj-muted)", marginTop: "1rem" }}>
          No account? <Link href="/register">Register</Link>
        </p>
        <p style={{ color: "var(--bj-muted)", fontSize: "0.85rem" }}>
          Seed admin: admin@example.com / Password123!
        </p>
      </Panel>
    </PageShell>
  );
}
