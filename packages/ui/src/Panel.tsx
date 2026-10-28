import type { CSSProperties, ReactNode } from "react";

export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: "color-mix(in srgb, var(--bj-bg-elevated) 88%, transparent)",
        border: "1px solid var(--bj-border)",
        borderRadius: "calc(var(--bj-radius) + 4px)",
        padding: "1.25rem",
        backdropFilter: "blur(8px)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function PageShell({
  brand,
  title,
  actions,
  children,
}: {
  brand: string;
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: "920px",
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--bj-font-display)",
              fontSize: "1.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            {brand}
          </p>
          {title ? (
            <p style={{ margin: "0.25rem 0 0", color: "var(--bj-muted)" }}>
              {title}
            </p>
          ) : null}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}
