import type { ParsedRecipient } from "../parser/types.js";
import { STRINGS } from "../i18n/uk.js";
import { RECIPIENT_SELECTORS, firstVisible } from "./selectors.js";
import { setNativeValue, isSelectOptionAvailable } from "./setValue.js";
import type { FieldResult, FieldKey } from "./types.js";

const rafTick = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function fillOne(
  key: FieldKey,
  selector: string,
  labelUk: string,
  value: string | undefined,
  optional = false,
): FieldResult {
  if (value === undefined || value === "") {
    return { key, status: "skipped", reasonUk: STRINGS.errors.valueAbsent };
  }
  const el = firstVisible<HTMLInputElement | HTMLSelectElement>(selector);
  if (!el) {
    if (optional) {
      return {
        key,
        status: "skipped",
        silent: true,
        reasonUk: STRINGS.errors.selectorMissingOptional(labelUk),
      };
    }
    return {
      key,
      status: "failed",
      reasonUk: STRINGS.errors.selectorMissing(labelUk),
    };
  }
  if (el instanceof HTMLSelectElement && key === "country") {
    if (!isSelectOptionAvailable(el, value)) {
      return {
        key,
        status: "failed",
        reasonUk: STRINGS.errors.countryNotSupported(value),
      };
    }
  }
  try {
    setNativeValue(el, value);
    return { key, status: "filled", valueWritten: value };
  } catch (e) {
    return {
      key,
      status: "failed",
      reasonUk: STRINGS.errors.writeThrew(
        labelUk,
        (e as Error).message ?? String(e),
      ),
    };
  }
}

export async function fillRecipient(
  parsed: ParsedRecipient,
): Promise<FieldResult[]> {
  const results: FieldResult[] = [];

  const country = RECIPIENT_SELECTORS.find((s) => s.key === "country")!;
  const countryResult = fillOne(
    country.key,
    country.selector,
    country.labelUk,
    parsed.country,
  );
  results.push(countryResult);

  if (countryResult.status === "filled") {
    await rafTick();
    await rafTick();
  }

  for (const spec of RECIPIENT_SELECTORS) {
    if (spec.key === "country") continue;
    const value = (parsed as Record<string, string | undefined>)[spec.key];
    results.push(fillOne(spec.key, spec.selector, spec.labelUk, value, spec.optional));
  }

  return results;
}
