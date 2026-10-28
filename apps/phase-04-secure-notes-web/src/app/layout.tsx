import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "@backend-journey/ui/styles.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Secure Notes",
  description: "Phase 4 — JWT-authenticated notes client",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body
        style={
          {
            ["--bj-font-display" as string]: "var(--font-display), Georgia, serif",
            ["--bj-font-body" as string]: "var(--font-body), sans-serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
