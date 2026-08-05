import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abilash S L: Backend engineer",
  description:
    "Backend engineer working on a 25,000-renders-a-day video pipeline. Java, Spring Boot, Kafka, GCP.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
