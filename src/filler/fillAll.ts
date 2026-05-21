import type { ParsedRecipient } from "../parser/types.js";
import type { Defaults } from "../config/types.js";
import { fillRecipient } from "./fillRecipient.js";
import { fillCategory, fillParcelItems, fillShipmentDimensions } from "./fillParcelItems.js";
import type { FillResult } from "./types.js";

const rafTick = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export async function fillAll(
  parsed: ParsedRecipient,
  defaults: Defaults,
): Promise<FillResult> {
  const t0 = performance.now();
  const recipientResults = await fillRecipient(parsed);
  await rafTick();
  const categoryResult = fillCategory(defaults);
  const parcelResults = await fillParcelItems(defaults);
  const dimensionResults = fillShipmentDimensions(defaults);
  const durationMs = performance.now() - t0;
  return {
    fields: [...recipientResults, categoryResult, ...parcelResults, ...dimensionResults],
    durationMs,
  };
}
