import type { ParsedRecipient } from "../types.js";
import { getDialCode, DIAL_CODES } from "../../data/dialCodes.js";

// Sorted longest-first so e.g. "+1268" is matched before "+1"
const SORTED_DIAL_CODES: string[] = Object.values(DIAL_CODES).sort(
  (a, b) => b.length - a.length,
);

export function splitPhoneDialCode(parsed: ParsedRecipient): ParsedRecipient {
  if (!parsed.phone) return parsed;

  const trimmed = parsed.phone.trim();

  if (trimmed.startsWith("+")) {
    for (const code of SORTED_DIAL_CODES) {
      if (trimmed.startsWith(code)) {
        const localPart = trimmed.slice(code.length).trim();
        return { ...parsed, phone: localPart, phoneDialCode: code };
      }
    }
    return parsed;
  }

  if (parsed.country) {
    const dial = getDialCode(parsed.country);
    if (dial) {
      return { ...parsed, phoneDialCode: dial };
    }
  }

  return parsed;
}
