import { describe, it, expect } from "vitest";
import { postcodeStage } from "../../src/parser/stages/postcode.js";

describe("postcodeStage", () => {
  it("matches US 5-digit ZIP when country is US", () => {
    const out = postcodeStage("moline, illinois 61265", { country: "US" });
    expect(out.value).toBe("61265");
  });

  it("matches US ZIP+4 when country is US", () => {
    const out = postcodeStage("Springfield, IL 12345-6789", { country: "US" });
    expect(out.value).toBe("12345-6789");
  });

  it("matches UK alphanumeric when country is GB", () => {
    const out = postcodeStage("10 Downing St, London SW1A 2AA", { country: "GB" });
    expect(out.value?.toUpperCase()).toBe("SW1A 2AA");
  });

  it("falls back to generic digit-run when country is unknown", () => {
    const out = postcodeStage("city 1234567", {});
    expect(out.value).toBe("1234567");
  });
});
