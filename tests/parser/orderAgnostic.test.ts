import { describe, it, expect } from "vitest";
import { parse } from "../../src/parser/parse.js";

const canonical = `john doe
2726 12th street
moline, illinois 61265
Country: US`;

const reversed = `Country: US
moline, illinois 61265
2726 12th street
john doe`;

describe("parse — order agnostic", () => {
  it("produces the same values for canonical and reversed input", () => {
    const a = parse(canonical).values;
    const b = parse(reversed).values;
    expect(a).toEqual(b);
  });

  it("contains all 6 recipient fields for canonical input", () => {
    const v = parse(canonical).values;
    expect(v.name).toBe("John Doe");
    expect(v.street).toBe("2726 12th Street");
    expect(v.city).toBe("Moline");
    expect(v.region).toBe("Illinois");
    expect(v.postcode).toBe("61265");
    expect(v.country).toBe("US");
  });
});
