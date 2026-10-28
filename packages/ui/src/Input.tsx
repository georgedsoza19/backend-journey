import type { InputHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: "0.4rem" }}>
      <span style={{ color: "var(--bj-muted)", fontSize: "0.9rem" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "0.7rem 0.85rem",
        borderRadius: "var(--bj-radius)",
        border: "1px solid var(--bj-border)",
        background: "var(--bj-bg)",
        color: "var(--bj-text)",
        fontFamily: "var(--bj-font-body)",
        fontSize: "1rem",
        ...props.style,
      }}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight: "120px",
        padding: "0.7rem 0.85rem",
        borderRadius: "var(--bj-radius)",
        border: "1px solid var(--bj-border)",
        background: "var(--bj-bg)",
        color: "var(--bj-text)",
        fontFamily: "var(--bj-font-body)",
        fontSize: "1rem",
        resize: "vertical",
        ...props.style,
      }}
    />
  );
}
