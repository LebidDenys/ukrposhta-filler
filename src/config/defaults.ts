import {
  type Defaults,
  type ParcelFillMode,
  FIRST_RUN_DEFAULTS,
  StorageError,
} from "./types.js";
import { STRINGS } from "../i18n/uk.js";

const STORAGE_KEY = "ukrposhtaIntlDefaults";

type ChromeStorageArea = {
  get: (keys: string | string[] | null) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
};

interface ChromeShim {
  storage?: {
    sync?: ChromeStorageArea;
    local?: ChromeStorageArea;
    onChanged?: {
      addListener: (
        cb: (
          changes: Record<string, chrome.storage.StorageChange>,
          areaName: chrome.storage.AreaName,
        ) => void,
      ) => void;
      removeListener: (
        cb: (
          changes: Record<string, chrome.storage.StorageChange>,
          areaName: chrome.storage.AreaName,
        ) => void,
      ) => void;
    };
  };
}

declare const chrome: ChromeShim;

function pickArea(): { primary: ChromeStorageArea; fallback?: ChromeStorageArea } {
  if (chrome?.storage?.sync && chrome.storage.local) {
    return { primary: chrome.storage.sync, fallback: chrome.storage.local };
  }
  if (chrome?.storage?.sync) return { primary: chrome.storage.sync };
  if (chrome?.storage?.local) return { primary: chrome.storage.local };
  throw new StorageError(
    "chrome.storage is unavailable — extension cannot persist defaults.",
  );
}

function normalize(raw: unknown): Defaults {
  if (!raw || typeof raw !== "object") {
    return { ...FIRST_RUN_DEFAULTS };
  }
  const incoming = raw as Record<string, unknown>;
  const merged: Defaults = {
    ...FIRST_RUN_DEFAULTS,
    ...incoming,
  } as Defaults;
  if (
    merged.parcelFillMode !== "FIRST_ONLY" &&
    merged.parcelFillMode !== "ALL_ROWS"
  ) {
    merged.parcelFillMode = "ALL_ROWS" satisfies ParcelFillMode;
  }
  return merged;
}

export async function getDefaults(): Promise<Defaults> {
  let areas: { primary: ChromeStorageArea; fallback?: ChromeStorageArea };
  try {
    areas = pickArea();
  } catch (e) {
    throw new StorageError(
      STRINGS.errors.storageReadFailed((e as Error).message ?? String(e)),
      e,
    );
  }
  try {
    const result = await areas.primary.get(STORAGE_KEY);
    if (result && STORAGE_KEY in result && result[STORAGE_KEY] !== undefined) {
      return normalize(result[STORAGE_KEY]);
    }
    if (areas.fallback) {
      const fb = await areas.fallback.get(STORAGE_KEY);
      if (fb && STORAGE_KEY in fb && fb[STORAGE_KEY] !== undefined) {
        return normalize(fb[STORAGE_KEY]);
      }
    }
    return { ...FIRST_RUN_DEFAULTS };
  } catch (e) {
    throw new StorageError(
      STRINGS.errors.storageReadFailed((e as Error).message ?? String(e)),
      e,
    );
  }
}

export async function saveDefaults(next: Defaults): Promise<void> {
  const areas = pickArea();
  const payload = { [STORAGE_KEY]: { ...next, schemaVersion: next.schemaVersion ?? 1 } };
  try {
    await areas.primary.set(payload);
    return;
  } catch (e) {
    console.warn(
      `${STRINGS.console.prefix} sync storage write failed, falling back to local:`,
      e,
    );
    if (areas.fallback) {
      try {
        await areas.fallback.set(payload);
        return;
      } catch (e2) {
        throw new StorageError(
          STRINGS.errors.storageWriteFailed(
            (e2 as Error).message ?? String(e2),
          ),
          e2,
        );
      }
    }
    throw new StorageError(
      STRINGS.errors.storageWriteFailed((e as Error).message ?? String(e)),
      e,
    );
  }
}

export type DefaultsChangedHandler = (next: Defaults) => void;

export function onDefaultsChanged(
  handler: DefaultsChangedHandler,
): () => void {
  const onChanged = chrome?.storage?.onChanged;
  if (!onChanged) {
    return () => {};
  }
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    _areaName: chrome.storage.AreaName,
  ) => {
    const change = changes[STORAGE_KEY];
    if (!change) return;
    if (change.newValue !== undefined) {
      try {
        handler(normalize(change.newValue));
      } catch (e) {
        console.error(`${STRINGS.console.prefix} onDefaultsChanged handler threw`, e);
      }
    }
  };
  onChanged.addListener(listener);
  return () => onChanged.removeListener(listener);
}
