import { Fragment } from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { RESOLVED_COLOURS, SITE_CARD, SITE_NAME, SITE_ROLE } from "@/lib/site";

export const alt = SITE_CARD.alt;

export const size = { width: SITE_CARD.width, height: SITE_CARD.height };
export const contentType = SITE_CARD.type;

const asset = (name: string) => readFile(join(process.cwd(), "assets", name));

// The site's own three families, so the card someone sees before they click
// looks like the page they land on. Satori needs TTF or OTF, not the WOFF2
// next/font serves, hence the copies in assets/.
const [geistRegular, geistSemiBold, geistMono, instrumentItalic] = await Promise.all([
  asset("Geist-Regular.ttf"),
  asset("Geist-SemiBold.ttf"),
  asset("GeistMono-Medium.ttf"),
  asset("InstrumentSerif-Italic.ttf"),
]);

const { ink: INK, muted: MUTED, neutral: NEUTRAL, rule: RULE, accent: ACCENT, paper: PAPER } =
  RESOLVED_COLOURS;

/** The three numbers the site leads with, in the wording it uses. */
const FACTS = [
  { value: "25,000+", label: "Renders a day" },
  { value: "60% → 98%", label: "Render reliability" },
  { value: "3d → 1d", label: "Config approval" },
];

/** The two words the headline leans on, in the serif, as on the page. */
function Serif({ children }: { children: string }) {
  return (
    <span style={{ fontFamily: "Instrument Serif", fontWeight: 400, letterSpacing: -1 }}>
      {children}
    </span>
  );
}

/** A figure with its arrow in the accent, as on the page. */
function Figure({ value }: { value: string }) {
  return (
    <div style={{ display: "flex" }}>
      {value.split("→").map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span style={{ color: ACCENT, fontWeight: 400, margin: "0 12px" }}>→</span>
          )}
          <span>{part.trim()}</span>
        </Fragment>
      ))}
    </div>
  );
}

// Satori lays every block out as flex and has no inline flow, so the
// headline's line breaks are set by hand: the three lines the page shows at
// desktop width. The last line mixes two families, so its spaces are gaps.
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
          padding: "60px 72px 56px",
          background: PAPER,
          color: INK,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: MUTED,
              fontFamily: "Geist Mono",
              fontSize: 19,
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
            {`${SITE_NAME} / ${SITE_ROLE}`}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 40,
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 0.96,
              letterSpacing: -5,
            }}
          >
            <div style={{ display: "flex" }}>I keep a 25,000-</div>
            <div style={{ display: "flex" }}>render-a-day pipeline</div>
            <div style={{ display: "flex", gap: 22 }}>
              <Serif>cheap</Serif>
              <span>and</span>
              <div style={{ display: "flex" }}>
                <Serif>standing up</Serif>
                <span>.</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 72,
            paddingTop: 26,
            borderTop: `1px solid ${RULE}`,
          }}
        >
          {FACTS.map((fact) => (
            <div key={fact.value} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 600, letterSpacing: -1.5 }}>
                <Figure value={fact.value} />
              </div>
              <div
                style={{
                  display: "flex",
                  color: NEUTRAL,
                  fontFamily: "Geist Mono",
                  fontSize: 15,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                {fact.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, style: "normal", weight: 400 },
        { name: "Geist", data: geistSemiBold, style: "normal", weight: 600 },
        { name: "Geist Mono", data: geistMono, style: "normal", weight: 500 },
        { name: "Instrument Serif", data: instrumentItalic, style: "italic", weight: 400 },
      ],
    },
  );
}
