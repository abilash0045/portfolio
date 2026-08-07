import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { caseStudies } from "./case-studies";

const design = readFileSync(join(process.cwd(), "docs/DESIGN.md"), "utf8");

describe("the dartboard case study", () => {
  const study = caseStudies.find((c) => c.slug === "dartboard");

  // It was written once, then quietly replaced by another entry, which left
  // the site embedding the dartboard without ever saying why it exists.
  it("exists", () => {
    expect(study, "the dartboard case study went missing again").toBeDefined();
  });

  it("points at the thing it describes", () => {
    expect(study!.inPageAnchor).toBe("#dartboard-embedded-section");
  });

  // Every figure it quotes has to be one that was actually measured. If the
  // measurements in DESIGN.md are ever redone, this fails until the prose is
  // brought along with them.
  it("quotes only numbers that appear in the measured section of DESIGN.md", () => {
    const prose = [study!.problem, study!.architecture, study!.challenges, study!.results].join(" ");

    for (const figure of ["0.39s", "0.93s", "0.88s", "504", "429"]) {
      expect(prose, `${figure} is not in the case study`).toContain(figure);
      expect(design, `${figure} is quoted but not in DESIGN.md`).toContain(figure);
    }

    expect(design).toContain("2026-08-05");
    expect(prose).toContain("2026-08-05");
  });

  it("does not claim business impact for a toy", () => {
    const results = study!.results.toLowerCase();
    for (const word of ["revenue", "users", "customers", "adoption", "growth"]) {
      expect(results, `results claims ${word}`).not.toContain(word);
    }
  });
});

describe("every case study", () => {
  it("fills every field it promises", () => {
    for (const study of caseStudies) {
      for (const [field, value] of Object.entries(study)) {
        if (typeof value !== "string") continue;
        expect(value.trim().length, `${study.slug}.${field} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the two cost wins apart", () => {
    const cost = caseStudies.find((c) => c.slug === "cloud-cost")!;
    // ~30% from segment caching and ~10% from scale-to-zero are independent.
    // They happen to sum; the page must not let them read as one number.
    expect(cost.results).toContain("~30%");
    expect(cost.results).toContain("~10%");
  });

  it("never attributes the reliability win to autoscaling", () => {
    const render = caseStudies.find((c) => c.slug === "render-reliability")!;
    const text = Object.values(render).join(" ").toLowerCase();
    expect(text).toContain("efs");
    expect(text, "60 to 98% is the EFS atom fix, never KEDA").not.toContain("keda");
  });
});
