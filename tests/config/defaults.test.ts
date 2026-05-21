import { describe, it, expect, beforeEach, vi } from "vitest";

type Store = Map<string, unknown>;

function makeArea(store: Store, opts: { failSet?: boolean } = {}) {
  return {
    get: vi.fn(async (key: string | string[] | null) => {
      if (key === null) {
        return Object.fromEntries(store);
      }
      const keys = Array.isArray(key) ? key : [key];
      const out: Record<string, unknown> = {};
      for (const k of keys) if (store.has(k)) out[k] = store.get(k);
      return out;
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      if (opts.failSet) throw new Error("QUOTA_BYTES_PER_ITEM");
      for (const [k, v] of Object.entries(items)) store.set(k, v);
    }),
  };
}

const KEY = "ukrposhtaIntlDefaults";

describe("defaults config", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns first-run defaults when storage is empty", async () => {
    const syncStore: Store = new Map();
    const localStore: Store = new Map();
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: {
        sync: makeArea(syncStore),
        local: makeArea(localStore),
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
      },
    };
    const { getDefaults } = await import("../../src/config/defaults.js");
    const d = await getDefaults();
    expect(d.categoryType).toBe("");
    expect(d.currencyCode).toBe("UAH");
    expect(d.quantity).toBe("1");
    expect(d.parcelFillMode).toBe("ALL_ROWS");
    expect(d.schemaVersion).toBe(1);
  });

  it("backfills missing parcelFillMode on legacy records", async () => {
    const syncStore: Store = new Map([
      [
        KEY,
        {
          categoryType: "GIFT",
          currencyCode: "USD",
          value: "25",
          quantity: "2",
          hsCode: "6109",
          schemaVersion: 1,
        },
      ],
    ]);
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: {
        sync: makeArea(syncStore),
        local: makeArea(new Map()),
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
      },
    };
    const { getDefaults } = await import("../../src/config/defaults.js");
    const d = await getDefaults();
    expect(d.parcelFillMode).toBe("ALL_ROWS");
    expect(d.categoryType).toBe("GIFT");
    expect(d.hsCode).toBe("6109");
  });

  it("preserves unknown extra keys on read", async () => {
    const syncStore: Store = new Map([
      [
        KEY,
        {
          ...{
            categoryType: "",
            currencyCode: "UAH",
            value: "",
            quantity: "1",
            hsCode: "",
            parcelFillMode: "ALL_ROWS",
            schemaVersion: 99,
          },
          futureFeatureFlag: true,
        },
      ],
    ]);
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: {
        sync: makeArea(syncStore),
        local: makeArea(new Map()),
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
      },
    };
    const { getDefaults } = await import("../../src/config/defaults.js");
    const d = await getDefaults();
    expect(d["futureFeatureFlag"]).toBe(true);
    expect(d.schemaVersion).toBe(99);
  });

  it("falls back to local when sync set fails", async () => {
    const syncStore: Store = new Map();
    const localStore: Store = new Map();
    const syncArea = makeArea(syncStore, { failSet: true });
    const localArea = makeArea(localStore);
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: {
        sync: syncArea,
        local: localArea,
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
      },
    };
    const { saveDefaults } = await import("../../src/config/defaults.js");
    await saveDefaults({
      categoryType: "GIFT",
      currencyCode: "USD",
      value: "25",
      quantity: "2",
      hsCode: "6109",
      parcelFillMode: "FIRST_ONLY",
      schemaVersion: 1,
    });
    expect(syncArea.set).toHaveBeenCalledOnce();
    expect(localArea.set).toHaveBeenCalledOnce();
    expect(localStore.get(KEY)).toBeDefined();
  });

  it("onDefaultsChanged returns an unsubscribe function", async () => {
    const onChanged = { addListener: vi.fn(), removeListener: vi.fn() };
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: { sync: makeArea(new Map()), local: makeArea(new Map()), onChanged },
    };
    const { onDefaultsChanged } = await import("../../src/config/defaults.js");
    const unsub = onDefaultsChanged(() => {});
    expect(onChanged.addListener).toHaveBeenCalledOnce();
    unsub();
    expect(onChanged.removeListener).toHaveBeenCalledOnce();
  });
});
