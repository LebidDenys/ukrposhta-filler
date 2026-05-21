import { describe, it, expect } from "vitest";
import { emailStage } from "../../src/parser/stages/email.js";

describe("emailStage", () => {
  it("extracts a labeled email", () => {
    const out = emailStage("Email: John.Doe@example.com", {});
    expect(out.value).toBe("john.doe@example.com");
    expect(out.restText).not.toMatch(/john\.doe/i);
  });

  it("extracts an embedded email and lowercases it", () => {
    const out = emailStage("contact me at jane+orders@shop.co.uk anytime", {});
    expect(out.value).toBe("jane+orders@shop.co.uk");
    expect(out.restText).toBe("contact me at anytime");
  });

  it("returns undefined value when no email", () => {
    const out = emailStage("john doe\n2726 12th street", {});
    expect(out.value).toBeUndefined();
    expect(out.restText).toBe("john doe\n2726 12th street");
  });

  it("removes the matched substring from restText", () => {
    const out = emailStage("ann@x.io\n2726 12th street", {});
    expect(out.restText).not.toMatch(/ann@x\.io/);
    expect(out.restText).toMatch(/2726 12th street/);
  });
});
