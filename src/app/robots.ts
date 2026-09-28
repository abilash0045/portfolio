import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /api/ proxies Nominatim and Overpass, which share one rate limit across
// every visitor. A crawler walking those routes would spend it for nothing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
