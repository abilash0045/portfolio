import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { RESOLVED_COLOURS } from "@/lib/site";

/*
 * The tab icon. It used to be create-next-app's favicon.ico, Vercel's white
 * triangle, on every tab and bookmark of this site. This is the navbar's "A"
 * on the accent instead, drawn the same way as the link preview card.
 *
 * 96px because search engines want a multiple of 48 for the icon they show
 * beside a result; browsers scale it down for the tab.
 */
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

const geistSemiBold = await readFile(join(process.cwd(), "assets", "Geist-SemiBold.ttf"));

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: RESOLVED_COLOURS.accent,
          color: RESOLVED_COLOURS.paper,
          fontFamily: "Geist",
          fontSize: 62,
          fontWeight: 600,
          letterSpacing: -2,
        }}
      >
        A
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Geist", data: geistSemiBold, style: "normal", weight: 600 }],
    },
  );
}
