import { STRINGS } from "../i18n/uk.js";

const PREFIX = STRINGS.console.prefix;

export function logWarn(message: string, payload?: unknown): void {
  if (payload !== undefined) console.warn(PREFIX, message, payload);
  else console.warn(PREFIX, message);
}

export function logError(message: string, payload?: unknown): void {
  if (payload !== undefined) console.error(PREFIX, message, payload);
  else console.error(PREFIX, message);
}

export function logInfo(message: string, payload?: unknown): void {
  if (payload !== undefined) console.info(PREFIX, message, payload);
  else console.info(PREFIX, message);
}
