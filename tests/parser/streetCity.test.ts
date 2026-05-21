import { describe, it, expect } from "vitest";
import {
  streetCityStageWithOriginal,
  unpackStreetCityValue,
} from "../../src/parser/stages/streetCity.js";

describe("streetCityStageWithOriginal", () => {
  it("extracts single-line street and Title Cases it", () => {
    const out = streetCityStageWithOriginal(
      "2726 12th street\nmoline 61265",
      { country: "US", postcode: "61265" },
      "2726 12th street\nmoline 61265",
    );
    const sc = unpackStreetCityValue(out.value);
    expect(sc.street).toBe("2726 12th Street");
  });

  it("joins multi-line streets with Apt", () => {
    const out = streetCityStageWithOriginal(
      "2726 12th street\nApt 5\nmoline 61265",
      { country: "US", postcode: "61265" },
      "2726 12th street\nApt 5\nmoline 61265",
    );
    const sc = unpackStreetCityValue(out.value);
    expect(sc.street).toBe("2726 12th Street, Apt 5");
  });

  it("extracts city from postcode line", () => {
    const out = streetCityStageWithOriginal(
      "2726 12th street\nmoline 61265",
      { country: "US", postcode: "61265" },
      "2726 12th street\nmoline 61265",
    );
    const sc = unpackStreetCityValue(out.value);
    expect(sc.city).toBe("Moline");
  });

  it("handles 'City, IL 61265' style", () => {
    const out = streetCityStageWithOriginal(
      "2726 12th street\nmoline, 61265",
      { country: "US", postcode: "61265" },
      "2726 12th street\nmoline, IL 61265",
    );
    const sc = unpackStreetCityValue(out.value);
    expect(sc.city).toBe("Moline");
  });

  it("extracts city from 'moline illinois 61265' (no comma)", () => {
    const out = streetCityStageWithOriginal(
      "2726 12th street\nmoline",
      { country: "US", postcode: "61265", region: "Illinois" },
      "2726 12th street\nmoline illinois 61265",
    );
    const sc = unpackStreetCityValue(out.value);
    expect(sc.city).toBe("Moline");
  });

  it("extracts city from 'moline, illinois 61265' (comma)", () => {
    const out = streetCityStageWithOriginal(
      "2726 12th street\nmoline,",
      { country: "US", postcode: "61265", region: "Illinois" },
      "2726 12th street\nmoline, illinois 61265",
    );
    const sc = unpackStreetCityValue(out.value);
    expect(sc.city).toBe("Moline");
  });
});
