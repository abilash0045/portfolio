import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SHARED_OPEN_GRAPH, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { applyInitialTheme, THEME_KEY } from "@/lib/theme";
import "./globals.css";

/** Runs during parsing, before first paint. See applyInitialTheme. */
const THEME_SCRIPT = `(${applyInitialTheme.toString()})(${JSON.stringify(THEME_KEY)})`;

// One sans for everything from body copy to the hero, one mono for labels and
// data, and one serif used only in italic, for the odd word a headline leans on.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif",
  display: "swap",
});

const TITLE = "Abilash S L, Backend Engineer";

export const metadata: Metadata = {
  title: TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
