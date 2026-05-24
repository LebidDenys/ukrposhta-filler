export const STREET_WORDS: ReadonlyArray<string> = [
  "street",
  "st",
  "avenue",
  "ave",
  "road",
  "rd",
  "boulevard",
  "blvd",
  "drive",
  "dr",
  "lane",
  "ln",
  "court",
  "ct",
  "way",
  "highway",
  "hwy",
  "parkway",
  "pkwy",
  "place",
  "pl",
  "terrace",
  "ter",
  "circle",
  "cir",
  "square",
  "sq",
  "trail",
  "trl",
  // Malay / Singaporean / Malaysian street types
  "jalan",
  "lorong",
  "taman",
  "persiaran",
  "lebuh",
  "lebuhraya",
  "lengkok",
  "lintang",
  "simpang",
  "kampung",
  // Thai
  "thanon",
  "soi",
  // Japanese (romanised)
  "dori",
  "cho",
  // Korean (romanised)
  "ro",
  "gil",
];

const STREET_WORDS_SET = new Set(STREET_WORDS.map((w) => w.toLowerCase()));

export function isStreetWord(token: string): boolean {
  return STREET_WORDS_SET.has(token.toLowerCase().replace(/\.+$/, ""));
}

// Street type appears at the end: "342 Oak Street", "2726 12th Ave"
const STREET_LINE_RE_SUFFIX =
  /^\s*\d+\s*[\w'\-./# ]*\b(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct|way|highway|hwy|parkway|pkwy|place|pl|terrace|ter|circle|cir|square|sq|trail|trl)\b\.?/i;

// Street type appears right after the number: "22 Jalan Kakatua"
const STREET_LINE_RE_PREFIX =
  /^\s*\d+[a-z]?\s+(jalan|lorong|taman|persiaran|lebuh|lebuhraya|lengkok|lintang|simpang|kampung)\b/i;

// No explicit street type: "342 S Barkley", "10 Downing", "1600 Pennsylvania"
// Matches: <house-number> [optional 1-2 letter directional] <word of ≥2 letters>
const STREET_LINE_RE_BARE =
  /^\s*\d{1,5}[a-z]?\s+(?:[NSEW]{1,2}\.?\s+)?[a-z]{2,}/i;

export function looksLikeStreetLine(line: string): boolean {
  return (
    STREET_LINE_RE_SUFFIX.test(line) ||
    STREET_LINE_RE_PREFIX.test(line) ||
    STREET_LINE_RE_BARE.test(line)
  );
}
