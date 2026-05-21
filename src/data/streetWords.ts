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
];

const STREET_WORDS_SET = new Set(STREET_WORDS.map((w) => w.toLowerCase()));

export function isStreetWord(token: string): boolean {
  return STREET_WORDS_SET.has(token.toLowerCase().replace(/\.+$/, ""));
}

const STREET_LINE_RE =
  /^\s*\d+\s*[\w'\-./# ]*\b(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct|way|highway|hwy|parkway|pkwy|place|pl|terrace|ter|circle|cir|square|sq|trail|trl)\b\.?/i;

export function looksLikeStreetLine(line: string): boolean {
  return STREET_LINE_RE.test(line);
}
