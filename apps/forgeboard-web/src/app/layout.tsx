import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "@backend-journey/ui/styles.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "ForgeBoard",
  description: "Team issue tracker — backend journey capstone",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const bodyStyle = {
    ["--bj-font-display"]: "var(--font-display), Georgia, serif",
    ["--bj-font-body"]: "var(--font-body), sans-serif",
  } as CSSProperties;

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body style={bodyStyle}>{children}</body>
    </html>
  );
}
