import type { Stage } from "../types.js";

const PHONE_CANDIDATES = [
  /\+\d[\d\s().\-]{6,}\d/,
  /\(\d{1,4}\)\s*\d[\d\s.\-]{5,}\d/,
  /\d{2,4}[ .\-]\d{2,4}[ .\-]\d{2,4}(?:[ .\-]\d{2,5})?/,
];

const LABELED_PHONE_RE =
  /^\s*(?:phone|tel|telephone|mobile|cell|телефон|тел)\s*[:.\-—]?\s*(.+)$/im;

export const phoneStage: Stage = (text) => {
  const labeled = text.match(LABELED_PHONE_RE);
  if (labeled && labeled[1]) {
    for (const re of PHONE_CANDIDATES) {
      const m = labeled[1].match(re);
      if (m && countDigits(m[0]) >= 7) {
        const restText = text.replace(labeled[0], "").trim();
        return { match: labeled[0], value: m[0].trim(), restText };
      }
    }
  }
  for (const re of PHONE_CANDIDATES) {
    const m = text.match(re);
    if (m && countDigits(m[0]) >= 7) {
      const restText = text.replace(m[0], "").replace(/[ \t]{2,}/g, " ").trim();
      return { match: m[0], value: m[0].trim(), restText };
    }
  }
  return { restText: text };
};

function countDigits(s: string): number {
  let n = 0;
  for (const ch of s) if (ch >= "0" && ch <= "9") n++;
  return n;
}
