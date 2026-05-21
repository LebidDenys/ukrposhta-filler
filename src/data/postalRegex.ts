const COUNTRY_POSTAL: Record<string, RegExp> = {
  US: /\b\d{5}(?:-\d{4})?\b/,
  CA: /\b[A-CEGHJ-NPRSTVXY]\d[A-CEGHJ-NPRSTV-Z][ -]?\d[A-CEGHJ-NPRSTV-Z]\d\b/i,
  GB: /\b(?:GIR ?0AA|[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i,
  DE: /\b\d{5}\b/,
  FR: /\b\d{5}\b/,
  IT: /\b\d{5}\b/,
  ES: /\b\d{5}\b/,
  PL: /\b\d{2}-\d{3}\b/,
  NL: /\b\d{4}\s?[A-Z]{2}\b/i,
  AU: /\b\d{4}\b/,
  JP: /\b\d{3}-\d{4}\b/,
  UA: /\b\d{5}\b/,
  CN: /\b\d{6}\b/,
  IN: /\b\d{6}\b/,
  BR: /\b\d{5}-\d{3}\b/,
  MX: /\b\d{5}\b/,
};

const FALLBACK = /\b\d{4,10}\b/;

export function getPostalRegex(countryCode: string | undefined): RegExp {
  if (!countryCode) return FALLBACK;
  return COUNTRY_POSTAL[countryCode.toUpperCase()] ?? FALLBACK;
}
