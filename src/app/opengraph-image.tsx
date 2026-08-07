import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME, SITE_ROLE } from "@/lib/site";

export const alt =
  "Abilash S L, backend engineer. 25,000 renders a day, 60% to 98% render reliability, 3 days to 1 day config approval.";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (name: string) => readFile(join(process.cwd(), "assets", name));

const [interRegular, interBold, glass] = await Promise.all([
  asset("Inter-Regular.ttf"),
  asset("Inter-Bold.ttf"),
  asset("og-glass.jpg"),
]);

const background = `data:image/jpeg;base64,${glass.toString("base64")}`;

/** The site's own tokens, resolved. Satori does not read CSS variables. */
const INK = "#f2ebe9";
const MUTED = "#b0a9a8";
const ACCENT = "#e0554b";
const PAPER = "#17100f";

/** The three numbers the site leads with, in the wording it uses. */
const FACTS = [
  { value: "25,000+", label: "renders a day" },
  { value: "60% → 98%", label: "render reliability" },
  { value: "3d → 1d", label: "config approval" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: PAPER,
          backgroundImage: `url(${background})`,
          backgroundSize: "1200px 630px",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* The photograph is bright at the top left and dark at the bottom
            right, so a flat scrim would either wash out or crush half of it.
            This one leans on the light corner and lets the red breathe. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            display: "flex",
            background:
              "linear-gradient(100deg, rgba(20,14,13,0.96) 0%, rgba(20,14,13,0.92) 50%, rgba(20,14,13,0.62) 100%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: ACCENT,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                background: ACCENT,
                display: "flex",
              }}
            />
            {SITE_ROLE}
          </div>

          <div
            style={{
              marginTop: 30,
              color: INK,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 880,
              display: "flex",
            }}
          >
            I keep a 25,000-render-a-day pipeline cheap and standing up.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: 56 }}>
            {FACTS.map((fact) => (
              <div
                key={fact.value}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <div style={{ color: INK, fontSize: 34, fontWeight: 700 }}>
                  {fact.value}
                </div>
                <div style={{ color: MUTED, fontSize: 19 }}>{fact.label}</div>
              </div>
            ))}
          </div>

          <div style={{ color: INK, fontSize: 26, fontWeight: 700, display: "flex" }}>
            {SITE_NAME}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interRegular, style: "normal", weight: 400 },
        { name: "Inter", data: interBold, style: "normal", weight: 700 },
      ],
    },
  );
}
