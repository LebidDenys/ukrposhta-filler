import type { ParsedRecipient } from "../types.js";
import { looksLikeStreetLine } from "../../data/streetWords.js";
import { titleCase } from "../casing.js";
import { findUsState } from "../../data/usStates.js";

const APT_RE =
  /^\s*(?:apt|apartment|suite|ste|unit|building|bldg|кв|кварт)\b[\s.#:]*\S/i;

export interface StreetCityOutcome {
  match?: string;
  value?: string;
  restText: string;
}

export function streetCityStageWithOriginal(
  text: string,
  soFar: ParsedRecipient,
  originalText: string,
): StreetCityOutcome {
  const lines = text
    .split(/\n/)
    .map((l) => l.replace(/\s+$/g, ""))
    .filter((l) => l.trim().length > 0);

  let streetLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (looksLikeStreetLine(lines[i]!)) {
      streetLineIdx = i;
      break;
    }
  }

  const out: ParsedRecipient = {};
  const used = new Set<number>();

  if (streetLineIdx >= 0) {
    const collected: string[] = [lines[streetLineIdx]!.trim()];
    used.add(streetLineIdx);
    for (let j = streetLineIdx + 1; j < lines.length; j++) {
      if (APT_RE.test(lines[j]!)) {
        collected.push(lines[j]!.trim());
        used.add(j);
      } else {
        break;
      }
    }
    out.street = titleCase(collected.join(", "));
  }

  const cityFromOriginal = extractCityFromOriginal(originalText, soFar);
  let cityExtracted = false;
  if (cityFromOriginal) {
    out.city = titleCase(cityFromOriginal);
    cityExtracted = true;
  }

  if (!cityExtracted && soFar.postcode) {
    const postcodeLineIdx = lines.findIndex(
      (l, i) => !used.has(i) && l.includes(soFar.postcode!),
    );
    if (postcodeLineIdx >= 0) {
      const line = lines[postcodeLineIdx]!;
      const withoutPostcode = line.replace(soFar.postcode, "").trim();
      const cleaned = withoutPostcode.replace(/,\s*$/, "").trim();
      if (cleaned.length > 0) {
        const cityPart = cleaned.split(",")[0]!.trim();
        if (cityPart) {
          out.city = titleCase(cityPart);
          cityExtracted = true;
        }
      }
      used.add(postcodeLineIdx);
    }
  }
  if (!cityExtracted) {
    const cityLineIdx = lines.findIndex(
      (l, i) => !used.has(i) && /,/.test(l) && !/\d/.test(l.split(",")[0]!),
    );
    if (cityLineIdx >= 0) {
      const cityPart = lines[cityLineIdx]!.split(",")[0]!.trim();
      if (cityPart) {
        out.city = titleCase(cityPart);
        used.add(cityLineIdx);
      }
    }
  }

  if (out.city) {
    const cityLower = out.city.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (used.has(i)) continue;
      if (lines[i]!.toLowerCase().includes(cityLower)) {
        used.add(i);
        break;
      }
    }
  }

  const restLines = lines.filter((_, i) => !used.has(i));
  const restText = restLines.join("\n");

  let firstValue: string | undefined;
  if (out.street !== undefined) firstValue = out.street;
  else if (out.city !== undefined) firstValue = out.city;

  return {
    match: firstValue,
    value: JSON.stringify(out),
    restText,
  };
}

function extractCityFromOriginal(
  originalText: string,
  soFar: ParsedRecipient,
): string | undefined {
  if (!soFar.postcode) return undefined;
  const lines = originalText.split(/\n/).map((l) => l.replace(/\s+$/g, ""));
  const pcLine = lines.find((l) => l.includes(soFar.postcode!));
  if (!pcLine) return undefined;
  let work = pcLine.replace(soFar.postcode, "");
  if (soFar.country === "US") {
    const m = findUsState(work);
    if (m) {
      work = work.replace(new RegExp(`\\b${escapeRe(m.matchedText)}\\b`, "i"), "");
    }
  }
  work = work
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s*,\s*$/g, "")
    .replace(/^\s*,\s*/g, "")
    .trim();
  if (!work) return undefined;
  const cityCandidate = work.split(",")[0]!.trim();
  return cityCandidate || undefined;
}

function escapeRe(s: string): string {
  return s.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

export function unpackStreetCityValue(value: string | undefined): ParsedRecipient {
  if (!value) return {};
  try {
    return JSON.parse(value) as ParsedRecipient;
  } catch {
    return {};
  }
}
