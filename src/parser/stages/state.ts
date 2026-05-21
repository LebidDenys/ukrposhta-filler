import type { Stage } from "../types.js";
import { findUsState } from "../../data/usStates.js";

export const stateStage: Stage = (text, soFar) => {
  if (soFar.country !== "US") return { restText: text };
  const m = findUsState(text);
  if (m) {
    const restText = text
      .replace(new RegExp(`\\b${escapeRe(m.matchedText)}\\b`, "i"), "")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/,\s*,/g, ",")
      .replace(/^\s+|\s+$/g, "");
    return { match: m.matchedText, value: m.state.name, restText };
  }
  return { restText: text };
};

function escapeRe(s: string): string {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}
