export interface UsState {
  readonly name: string;
  readonly abbr: string;
}

export const US_STATES: ReadonlyArray<UsState> = [
  { name: "Alabama", abbr: "AL" },
  { name: "Alaska", abbr: "AK" },
  { name: "Arizona", abbr: "AZ" },
  { name: "Arkansas", abbr: "AR" },
  { name: "California", abbr: "CA" },
  { name: "Colorado", abbr: "CO" },
  { name: "Connecticut", abbr: "CT" },
  { name: "Delaware", abbr: "DE" },
  { name: "District of Columbia", abbr: "DC" },
  { name: "Florida", abbr: "FL" },
  { name: "Georgia", abbr: "GA" },
  { name: "Hawaii", abbr: "HI" },
  { name: "Idaho", abbr: "ID" },
  { name: "Illinois", abbr: "IL" },
  { name: "Indiana", abbr: "IN" },
  { name: "Iowa", abbr: "IA" },
  { name: "Kansas", abbr: "KS" },
  { name: "Kentucky", abbr: "KY" },
  { name: "Louisiana", abbr: "LA" },
  { name: "Maine", abbr: "ME" },
  { name: "Maryland", abbr: "MD" },
  { name: "Massachusetts", abbr: "MA" },
  { name: "Michigan", abbr: "MI" },
  { name: "Minnesota", abbr: "MN" },
  { name: "Mississippi", abbr: "MS" },
  { name: "Missouri", abbr: "MO" },
  { name: "Montana", abbr: "MT" },
  { name: "Nebraska", abbr: "NE" },
  { name: "Nevada", abbr: "NV" },
  { name: "New Hampshire", abbr: "NH" },
  { name: "New Jersey", abbr: "NJ" },
  { name: "New Mexico", abbr: "NM" },
  { name: "New York", abbr: "NY" },
  { name: "North Carolina", abbr: "NC" },
  { name: "North Dakota", abbr: "ND" },
  { name: "Ohio", abbr: "OH" },
  { name: "Oklahoma", abbr: "OK" },
  { name: "Oregon", abbr: "OR" },
  { name: "Pennsylvania", abbr: "PA" },
  { name: "Rhode Island", abbr: "RI" },
  { name: "South Carolina", abbr: "SC" },
  { name: "South Dakota", abbr: "SD" },
  { name: "Tennessee", abbr: "TN" },
  { name: "Texas", abbr: "TX" },
  { name: "Utah", abbr: "UT" },
  { name: "Vermont", abbr: "VT" },
  { name: "Virginia", abbr: "VA" },
  { name: "Washington", abbr: "WA" },
  { name: "West Virginia", abbr: "WV" },
  { name: "Wisconsin", abbr: "WI" },
  { name: "Wyoming", abbr: "WY" },
];

const NAME_TO_STATE = new Map<string, UsState>(
  US_STATES.map((s) => [s.name.toLowerCase(), s]),
);
const ABBR_TO_STATE = new Map<string, UsState>(
  US_STATES.map((s) => [s.abbr.toLowerCase(), s]),
);

const FULL_NAME_RE = new RegExp(
  `\\b(${US_STATES.map((s) => s.name.replace(/ /g, "\\s+")).join("|")})\\b`,
  "i",
);
const ABBR_RE = new RegExp(
  `(?<![A-Za-z])(${US_STATES.map((s) => s.abbr).join("|")})(?![A-Za-z])`,
  "i",
);

export interface UsStateMatch {
  state: UsState;
  matchedText: string;
}

export function findUsState(text: string): UsStateMatch | undefined {
  const fullMatch = text.match(FULL_NAME_RE);
  if (fullMatch && fullMatch[1] !== undefined) {
    const key = fullMatch[1].toLowerCase().replace(/\s+/g, " ");
    const state = NAME_TO_STATE.get(key);
    if (state) return { state, matchedText: fullMatch[1] };
  }
  const abbrMatch = text.match(ABBR_RE);
  if (abbrMatch && abbrMatch[1] !== undefined) {
    const state = ABBR_TO_STATE.get(abbrMatch[1].toLowerCase());
    if (state) return { state, matchedText: abbrMatch[1] };
  }
  return undefined;
}
