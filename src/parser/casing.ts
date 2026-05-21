const SMALL_PREFIXES = ["mc", "mac", "o'", "de", "la", "van", "von", "del", "der", "di", "du", "le"];

export function titleCaseWord(word: string): string {
  if (!word) return word;
  const lower = word.toLowerCase();

  if (lower.startsWith("mc") && lower.length > 2) {
    return "Mc" + capitalizeFirst(lower.slice(2));
  }
  if (lower.startsWith("mac") && lower.length > 3) {
    return "Mac" + capitalizeFirst(lower.slice(3));
  }
  if (lower.startsWith("o'") && lower.length > 2) {
    return "O'" + capitalizeFirst(lower.slice(2));
  }
  if (lower.includes("-")) {
    return lower
      .split("-")
      .map((p) => titleCaseWord(p))
      .join("-");
  }
  return capitalizeFirst(lower);
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s[0]!.toUpperCase() + s.slice(1);
}

export function titleCase(input: string): string {
  return input
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      if (SMALL_PREFIXES.includes(token.toLowerCase())) {
        return capitalizeFirst(token.toLowerCase());
      }
      return titleCaseWord(token);
    })
    .join("");
}
