import { describe, it, expect } from "vitest";
import { countryStage } from "../../src/parser/stages/country.js";

describe("countryStage", () => {
  it("parses 'Country: US'", () => {
    const out = countryStage("Country: US", {});
    expect(out.value).toBe("US");
  });

  it("parses 'Country: United Kingdom' to GB", () => {
    const out = countryStage("Country: United Kingdom", {});
    expect(out.value).toBe("GB");
  });

  it("parses 'Країна: Україна' to UA", () => {
    const out = countryStage("Країна: Україна", {});
    expect(out.value).toBe("UA");
  });

  it("parses bare full name", () => {
    const out = countryStage("john doe\nFrance", {});
    expect(out.value).toBe("FR");
  });

  it("parses alias USA to US", () => {
    const out = countryStage("Country: USA", {});
    expect(out.value).toBe("US");
  });

  it("returns undefined when nothing matches", () => {
    const out = countryStage("john doe\n2726 12th street\nmoline, illinois 61265", {});
    expect(out.value).toBeUndefined();
  });
});
