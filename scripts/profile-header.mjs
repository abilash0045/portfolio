// Draws the header for the GitHub profile README (github.com/abilash0045) in
// the site's type and colours: the hero's headline and the three figures the
// link card leads with. Transparent, so it sits on GitHub's own page, and drawn
// at twice the size GitHub shows it so it stays sharp on dense screens.
//
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/profile-header.mjs <output dir>
//
// The warning it silences is Node noting that src/lib/site.ts has no module
// type; it parses fine.
//
// Four files: a wide and a narrow layout, each in both themes. The README's
// <picture> picks by prefers-color-scheme and by width, because the wide one
// shrunk onto a phone takes its small type down to about 5px.

import { createElement as h, Fragment } from "react";
// next/og has no exports map, so plain Node needs the file name.
import { ImageResponse } from "next/og.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  CARD_FIGURES,
  RESOLVED_COLOURS,
  RESOLVED_COLOURS_LIGHT,
  SITE_NAME,
  SITE_ROLE,
} from "../src/lib/site.ts";

const outDir = process.argv[2];
if (!outDir) {
  console.error("Say where to write the images: node scripts/profile-header.mjs <output dir>");
  process.exit(1);
}

const S = 2;

const asset = (name) => readFile(join(import.meta.dirname, "..", "assets", name));
const fonts = [
  { name: "Geist", data: await asset("Geist-SemiBold.ttf"), weight: 600, style: "normal" },
  { name: "Geist Mono", data: await asset("GeistMono-Medium.ttf"), weight: 500, style: "normal" },
  {
    name: "Instrument Serif",
    data: await asset("InstrumentSerif-Italic.ttf"),
    weight: 400,
    style: "italic",
  },
];

const row = (style, ...children) => h("div", { style: { display: "flex", ...style } }, ...children);
const text = (value) => h("span", null, value);

/** The two words the headline leans on, in the serif, as on the page. */
const serif = (value) =>
  h("span", { style: { fontFamily: "Instrument Serif", fontWeight: 400, letterSpacing: -2 * S } }, value);

/** A figure with its arrow in the accent, as on the page. */
const figure = (value, accent) =>
  row(
    {},
    ...value.split("→").map((part, index) =>
      h(
        Fragment,
        { key: index },
        index > 0 && h("span", { style: { color: accent, fontWeight: 400, margin: `0 ${10 * S}px` } }, "→"),
        text(part.trim()),
      ),
    ),
  );

const mono = (c, size) => ({
  color: c.muted,
  fontFamily: "Geist Mono",
  fontSize: size * S,
  letterSpacing: (size / 10) * S,
  textTransform: "uppercase",
});

const dot = (c) => row({ width: 8 * S, height: 8 * S, borderRadius: 8 * S, background: c.accent });

// Satori has no inline flow, so every line break is set by hand, and a line
// that mixes the two families spaces its words with gaps.
const headline = (size, lines) =>
  row(
    {
      flexDirection: "column",
      fontSize: size * S,
      fontWeight: 600,
      lineHeight: 0.95,
      letterSpacing: -(size / 22) * S,
    },
    ...lines.map((words) => row({ gap: size * 0.2 * S }, ...words)),
  );

const standingUp = row({}, serif("standing up"), text("."));

const LAYOUTS = {
  // The three lines the page shows at desktop width, over the figures in a row.
  wide: {
    width: 900,
    height: 452,
    draw: (c) =>
      row(
        { width: "100%", height: "100%", flexDirection: "column", color: c.ink, fontFamily: "Geist" },
        row({ alignItems: "center", gap: 12 * S, ...mono(c, 14) }, dot(c), `${SITE_NAME} / ${SITE_ROLE}`),
        row(
          { marginTop: 26 * S },
          headline(88, [
            [text("I keep a 25,000-")],
            [text("render-a-day pipeline")],
            [serif("cheap"), text("and"), standingUp],
          ]),
        ),
        row(
          { marginTop: 40 * S, paddingTop: 22 * S, gap: 56 * S, borderTop: `${S}px solid ${c.rule}` },
          ...CARD_FIGURES.map((fact) =>
            row(
              { flexDirection: "column", gap: 8 * S },
              row({ fontSize: 32 * S, letterSpacing: -1.2 * S }, figure(fact.value, c.accent)),
              row({ ...mono(c, 12), color: c.neutral }, fact.label),
            ),
          ),
        ),
      ),
  },
  // For a phone: four lines, the eyebrow on two, and the figures stacked with
  // their labels beside them, all big enough to read at 340px across.
  narrow: {
    width: 480,
    height: 520,
    draw: (c) =>
      row(
        { width: "100%", height: "100%", flexDirection: "column", color: c.ink, fontFamily: "Geist" },
        row(
          { flexDirection: "column", gap: 6 * S, ...mono(c, 15) },
          row({ alignItems: "center", gap: 12 * S }, dot(c), SITE_NAME),
          text(SITE_ROLE),
        ),
        row(
          { marginTop: 24 * S },
          headline(64, [
            [text("I keep a 25,000-")],
            [text("render-a-day")],
            [text("pipeline"), serif("cheap")],
            [text("and"), standingUp],
          ]),
        ),
        row(
          {
            flexDirection: "column",
            gap: 12 * S,
            marginTop: 30 * S,
            paddingTop: 20 * S,
            borderTop: `${S}px solid ${c.rule}`,
          },
          ...CARD_FIGURES.map((fact) =>
            row(
              { alignItems: "center" },
              row({ width: 210 * S, fontSize: 30 * S, letterSpacing: -1.1 * S }, figure(fact.value, c.accent)),
              row({ ...mono(c, 14), color: c.neutral }, fact.label),
            ),
          ),
        ),
      ),
  },
};

await mkdir(outDir, { recursive: true });
for (const [layout, { width, height, draw }] of Object.entries(LAYOUTS)) {
  for (const [theme, colours] of [
    ["dark", RESOLVED_COLOURS],
    ["light", RESOLVED_COLOURS_LIGHT],
  ]) {
    const image = new ImageResponse(draw(colours), { width: width * S, height: height * S, fonts });
    const name = layout === "wide" ? `header-${theme}.png` : `header-${layout}-${theme}.png`;
    await writeFile(join(outDir, name), Buffer.from(await image.arrayBuffer()));
    console.log(`wrote ${join(outDir, name)}`);
  }
}
