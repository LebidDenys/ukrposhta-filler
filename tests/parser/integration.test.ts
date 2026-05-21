import { describe, it, expect } from "vitest";
import { parse } from "../../src/parser/parse.js";

describe("parse — integration", () => {
  it("parses the canonical example with email + phone", () => {
    const input = `john doe
2726 12th street
moline, illinois 61265
Country: US
john.doe@example.com
(309) 555-1234`;
    const { values, warnings } = parse(input);
    expect(values.name).toBe("John Doe");
    expect(values.street).toBe("2726 12th Street");
    expect(values.city).toBe("Moline");
    expect(values.region).toBe("Illinois");
    expect(values.postcode).toBe("61265");
    expect(values.country).toBe("US");
    expect(values.email).toBe("john.doe@example.com");
    expect(values.phoneDialCode).toBe("+1");
    expect(values.phone).toBe("(309) 555-1234");
    expect(warnings.length).toBe(0);
  });

  it("emits country.notDetected warning when country missing", () => {
    const input = "john doe\n2726 12th street\nmoline 61265";
    const { warnings } = parse(input);
    const codes = warnings.map((w) => w.code);
    expect(codes).toContain("country.notDetected");
  });

  it("parses address with mixed-case state abbreviation on separate line from city (Luz Ospina)", () => {
    const input = `Luz ospina
249 nw 6th street Apt 1336
Miami,
Fl 33136
Country: United States

+1 (786) 227-2101`;
    const { values, warnings } = parse(input);
    expect(values.name).toBe("Luz Ospina");
    expect(values.street).toBe("249 Nw 6th Street Apt 1336");
    expect(values.city).toBe("Miami");
    expect(values.region).toBe("Florida");
    expect(values.postcode).toBe("33136");
    expect(values.country).toBe("US");
    const codes = warnings.map((w) => w.code);
    expect(codes).not.toContain("city.notDetected");
    expect(codes).not.toContain("street.notDetected");
  });

  it("extracts city when city/state/zip line has no comma", () => {
    const input = `john doe
2726 12th street
moline illinois 61265
Country: US
john.doe@example.com
(309) 555-1234`;
    const { values } = parse(input);
    expect(values.name).toBe("John Doe");
    expect(values.city).toBe("Moline");
    expect(values.region).toBe("Illinois");
    expect(values.postcode).toBe("61265");
    expect(values.country).toBe("US");
  });
});
