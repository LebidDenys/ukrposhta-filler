import { describe, it, expect } from "vitest";
import { phoneStage } from "../../src/parser/stages/phone.js";

describe("phoneStage", () => {
  it("matches US-style with parens", () => {
    const out = phoneStage("call (309) 555-1234 daytime", {});
    expect(out.value).toBe("(309) 555-1234");
  });

  it("matches E.164 with +", () => {
    const out = phoneStage("Phone: +380 67 123 45 67", {});
    expect(out.value).toMatch(/\+380/);
  });

  it("matches dash-separated", () => {
    const out = phoneStage("309-555-1234", {});
    expect(out.value).toBe("309-555-1234");
  });

  it("matches dot-separated", () => {
    const out = phoneStage("309.555.1234", {});
    expect(out.value).toBe("309.555.1234");
  });

  it("does not mistake a 5-digit ZIP for a phone", () => {
    const out = phoneStage("moline, illinois 61265", {});
    expect(out.value).toBeUndefined();
  });

  it("does not match a bare short digit run", () => {
    const out = phoneStage("123 main\n12345", {});
    expect(out.value).toBeUndefined();
  });
});
