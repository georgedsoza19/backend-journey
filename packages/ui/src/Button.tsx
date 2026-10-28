import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--bj-accent)",
    color: "#1a1208",
    border: "1px solid transparent",
  },
  ghost: {
    background: "transparent",
    color: "var(--bj-text)",
    border: "1px solid var(--bj-border)",
  },
  danger: {
    background: "transparent",
    color: "var(--bj-danger)",
    border: "1px solid var(--bj-danger)",
  },
};

export function Button({
  children,
  variant = "primary",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button
      {...props}
      style={{
        fontFamily: "var(--bj-font-body)",
        fontWeight: 600,
        fontSize: "0.95rem",
        padding: "0.65rem 1.1rem",
        borderRadius: "999px",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
