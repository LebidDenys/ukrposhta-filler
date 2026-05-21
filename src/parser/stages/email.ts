import type { Stage } from "../types.js";

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const LABELED_EMAIL_RE =
  /^\s*(?:e[-\s]?mail|email|пошта|електронна\s+пошта)\s*[:\-—]\s*(.+)$/im;

export const emailStage: Stage = (text) => {
  const labeled = text.match(LABELED_EMAIL_RE);
  if (labeled && labeled[1]) {
    const m = labeled[1].match(EMAIL_RE);
    if (m) {
      const restText = text.replace(labeled[0], "").trim();
      return { match: labeled[0], value: m[0].toLowerCase(), restText };
    }
  }
  const m = text.match(EMAIL_RE);
  if (m) {
    const restText = text.replace(m[0], "").replace(/[ \t]{2,}/g, " ").trim();
    return { match: m[0], value: m[0].toLowerCase(), restText };
  }
  return { restText: text };
};
