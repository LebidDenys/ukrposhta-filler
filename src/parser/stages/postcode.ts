import type { Stage } from "../types.js";
import { getPostalRegex } from "../../data/postalRegex.js";

const LABELED_POSTCODE_RE =
  /^\s*(?:zip\s*code|zip|postal\s*code|postcode|індекс|поштовий\s+індекс)\s*[:\-—]?\s*(.+?)\s*$/im;

export const postcodeStage: Stage = (text, soFar) => {
  const re = getPostalRegex(soFar.country);
  const labeled = text.match(LABELED_POSTCODE_RE);
  if (labeled && labeled[1]) {
    const m = labeled[1].match(re);
    if (m) {
      const restText = text.replace(labeled[0], "").trim();
      return { match: labeled[0], value: m[0], restText };
    }
  }
  const m = text.match(re);
  if (m) {
    const restText = text.replace(m[0], "").replace(/[ \t]{2,}/g, " ").trim();
    return { match: m[0], value: m[0], restText };
  }
  return { restText: text };
};
