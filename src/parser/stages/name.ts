import type { Stage } from "../types.js";
import { titleCase } from "../casing.js";

const NAME_LINE_RE = /^[\p{L}][\p{L}\s'.\-]{1,80}$/u;

export const nameStage: Stage = (text) => {
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const candidates = lines.filter((line) => NAME_LINE_RE.test(line));
  if (candidates.length === 0) return { restText: text };

  candidates.sort((a, b) => b.length - a.length);
  const best = candidates[0]!;
  const restText = text
    .split("\n")
    .filter((l) => l.trim() !== best)
    .join("\n")
    .trim();

  return {
    match: best,
    value: titleCase(best),
    restText,
  };
};
