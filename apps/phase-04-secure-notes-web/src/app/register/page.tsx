"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Input, PageShell, Panel } from "@backend-journey/ui";
import { register } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await register({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      router.push("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell brand="Secure Notes" title="Create an account">
      <Panel style={{ maxWidth: 420 }}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "1rem" }}>
          <Field label="Name">
            <Input name="name" required />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" minLength={8} required />
          </Field>
          {error ? (
            <p style={{ color: "var(--bj-danger)", margin: 0 }}>{error}</p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p style={{ color: "var(--bj-muted)", marginTop: "1rem" }}>
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </Panel>
    </PageShell>
  );
}
