import { describe, it, expect } from "vitest";
import { stateStage } from "../../src/parser/stages/state.js";

describe("stateStage", () => {
  it("normalizes full lowercase to canonical name", () => {
    const out = stateStage("moline, illinois", { country: "US" });
    expect(out.value).toBe("Illinois");
  });

  it("normalizes 2-letter abbreviation", () => {
    const out = stateStage("Moline, IL", { country: "US" });
    expect(out.value).toBe("Illinois");
  });

  it("normalizes mixed-case abbreviation (Fl → Florida)", () => {
    const out = stateStage("Moline, Fl 61265", { country: "US" });
    expect(out.value).toBe("Florida");
  });

  it("normalizes lowercase abbreviation (fl → Florida)", () => {
    const out = stateStage("Miami, fl 33136", { country: "US" });
    expect(out.value).toBe("Florida");
  });

  it("handles mixed case", () => {
    const out = stateStage("portland, OREgon 97201", { country: "US" });
    expect(out.value).toBe("Oregon");
  });

  it("is a no-op when country is not US", () => {
    const out = stateStage("Moline, IL", { country: "GB" });
    expect(out.value).toBeUndefined();
  });
});
