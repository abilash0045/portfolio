import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abilash S L - Senior Backend Engineer",
  description:
    "Backend Engineer with 2+ years building event-driven microservices that power AI video generation at scale. Java, Spring Boot, Kafka, Kubernetes, AWS, Redis.",
  metadataBase: new URL("https://portfolio-abilash.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Abilash S L - Senior Backend Engineer",
    description:
      "Backend Engineer with 2+ years building event-driven microservices that power AI video generation at scale. 25,000+ daily renders across GKE and Cloud Run.",
    url: "https://portfolio-abilash.vercel.app",
    siteName: "Abilash S L Portfolio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abilash S L - Senior Backend Engineer",
    description:
      "Backend Engineer with 2+ years building event-driven microservices that power AI video generation at scale.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
