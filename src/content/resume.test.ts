import { describe, expect, it } from "vitest";
import {
  EDUCATION,
  EMPLOYER,
  PARTS,
  RECOGNITION,
  SIDE_PROJECTS,
  SUMMARY,
  TOOLBOX,
  monthLabel,
} from "./resume";

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe("the resume data", () => {
  // <time dateTime> needs a valid month, and monthLabel reads nothing else.
  it("gives every date as YYYY-MM", () => {
    const dates = [
      EMPLOYER.start,
      ...PARTS.flatMap((part) => (part.end ? [part.start, part.end] : [part.start])),
      ...SIDE_PROJECTS.map((project) => project.when),
    ];
    for (const date of dates) expect(date).toMatch(MONTH);
  });

  // A second, earlier job once sat on the page that never existed. There is
  // one employer, from May 2023, and nothing under it starts sooner.
  it("starts nothing before the first job, and ends nothing before it starts", () => {
    for (const part of PARTS) {
      expect(part.start >= EMPLOYER.start, `${part.name} starts before ${EMPLOYER.start}`).toBe(true);
      if (part.end) expect(part.end >= part.start, `${part.name} ends before it starts`).toBe(true);
    }
    expect(SUMMARY).toContain(`since ${monthLabel(EMPLOYER.start)}`);
  });

  it("bolds only words the lead actually contains", () => {
    for (const part of PARTS) {
      if (part.highlight) expect(part.lead, part.name).toContain(part.highlight);
    }
  });

  it("labels months the way people read them", () => {
    expect(monthLabel("2023-05")).toBe("May 2023");
    expect(monthLabel("2026-12")).toBe("Dec 2026");
  });

  // The phone number is on the resume he sends, not on a public page.
  it("carries no phone number", () => {
    const everything = JSON.stringify({ SUMMARY, EMPLOYER, PARTS, SIDE_PROJECTS, EDUCATION, RECOGNITION, TOOLBOX });
    expect(everything).not.toMatch(/\+?\d[\d\s-]{9,}\d/);
  });
});

describe("the fixed employer wording", () => {
  const texts = [SUMMARY, ...PARTS.flatMap((part) => [part.lead, ...part.points])];
  const sentences = texts.flatMap((text) => text.split(/(?<=\.)\s+/));

  // 60% to 98% was the EFS root cause and pod-local staging. Autoscaling had
  // nothing to do with it.
  it("ties 60% to 98% to the EFS fix and never to KEDA", () => {
    const reliability = sentences.filter((sentence) => sentence.includes("98%"));
    expect(reliability.length).toBeGreaterThan(0);
    expect(reliability.some((sentence) => sentence.includes("EFS"))).toBe(true);
    for (const sentence of reliability) expect(sentence).not.toMatch(/KEDA|autoscal/i);
  });

  // The cache and scale-to-zero cuts are independent and never one ~40% story.
  it("never states ~40% without both cuts beside it", () => {
    for (const text of texts.filter((t) => t.includes("~40%"))) {
      expect(text).toContain("~30%");
      expect(text).toContain("~10%");
    }
  });
});
