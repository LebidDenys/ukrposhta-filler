import { describe, it, expect } from "vitest";
import { RECIPIENT_SELECTORS } from "../../src/filler/selectors.js";

describe("RECIPIENT_SELECTORS", () => {
  it("contains phoneDialCode before phone", () => {
    const keys = RECIPIENT_SELECTORS.map((s) => s.key);
    const dialIdx = keys.indexOf("phoneDialCode");
    const phoneIdx = keys.indexOf("phone");
    expect(dialIdx).toBeGreaterThan(-1);
    expect(phoneIdx).toBeGreaterThan(-1);
    expect(dialIdx).toBeLessThan(phoneIdx);
  });

  it("has country as the first entry", () => {
    expect(RECIPIENT_SELECTORS[0].key).toBe("country");
  });
});
