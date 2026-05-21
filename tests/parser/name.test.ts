import { describe, it, expect } from "vitest";
import { nameStage } from "../../src/parser/stages/name.js";

describe("nameStage", () => {
  it("title-cases a plain two-word lowercase name", () => {
    const out = nameStage("john doe", {});
    expect(out.value).toBe("John Doe");
  });

  it("title-cases an all-caps name", () => {
    const out = nameStage("JOHN DOE", {});
    expect(out.value).toBe("John Doe");
  });

  it("preserves hyphens in compound names", () => {
    const out = nameStage("anne-marie smith-jones", {});
    expect(out.value).toBe("Anne-Marie Smith-Jones");
  });

  it("handles 'MARIA DE LA CRUZ'", () => {
    const out = nameStage("MARIA DE LA CRUZ", {});
    expect(out.value).toBe("Maria De La Cruz");
  });

  it("handles O'Brien prefix", () => {
    const out = nameStage("kevin o'brien", {});
    expect(out.value).toBe("Kevin O'Brien");
  });

  it("handles McDonald prefix", () => {
    const out = nameStage("ronald mcdonald", {});
    expect(out.value).toBe("Ronald McDonald");
  });

  it("returns undefined when no name-shaped block exists", () => {
    const out = nameStage("12345\n9999", {});
    expect(out.value).toBeUndefined();
  });
});
