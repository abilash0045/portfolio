import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Every page a person would land on. The API routes are not pages. */
const PAGES = ["/", "/resume", "/dartboard"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
