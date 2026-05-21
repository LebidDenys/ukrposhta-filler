import type { Stage } from "../types.js";
import {
  findCountry,
  getCountryByCode,
  getCountryByName,
} from "../../data/iso3166.js";

const COUNTRY_LABEL_RE =
  /^\s*(?:country|країна|кра[ії]на|страна)\s*[:\-—]\s*(.+?)\s*$/im;

const ALPHA2_RE = /^[A-Za-z]{2}$/;

export const countryStage: Stage = (text) => {
  const labeled = text.match(COUNTRY_LABEL_RE);
  if (labeled && labeled[1]) {
    const raw = labeled[1].trim();
    const byCode = ALPHA2_RE.test(raw) ? getCountryByCode(raw) : undefined;
    const country = byCode ?? getCountryByName(raw);
    if (country) {
      const restText = text.replace(labeled[0], "").trim();
      return { match: labeled[0], value: country.code, restText };
    }
    const inner = findCountry(raw);
    if (inner) {
      const restText = text.replace(labeled[0], "").trim();
      return { match: labeled[0], value: inner.country.code, restText };
    }
  }
  const m = findCountry(text);
  if (m) {
    const restText = text.replace(m.matchedText, "").replace(/[ \t]{2,}/g, " ").trim();
    return { match: m.matchedText, value: m.country.code, restText };
  }
  return { restText: text };
};
