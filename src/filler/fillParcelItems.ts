import type { Defaults } from "../config/types.js";
import { STRINGS } from "../i18n/uk.js";
import {
  CATEGORY_SELECTOR,
  DIMENSION_SELECTORS,
  firstVisible,
} from "./selectors.js";
import { findParcelRows, type ParcelItemField } from "./parcelRows.js";
import { setNativeValue, isSelectOptionAvailable } from "./setValue.js";
import type { FieldKey, FieldResult } from "./types.js";

function waitForHsCodeDropdownItem(
  combo: Element,
  timeoutMs: number,
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const find = (): HTMLElement | null =>
      combo.querySelector<HTMLElement>(
        '[ng-click*="selectHsCode"], [data-ng-click*="selectHsCode"]',
      );

    const existing = find();
    if (existing) {
      resolve(existing);
      return;
    }

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);

    const observer = new MutationObserver(() => {
      const item = find();
      if (item) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(item);
      }
    });

    observer.observe(combo, { childList: true, subtree: true });
  });
}

async function autoSelectHsCodeDropdown(
  el: HTMLInputElement,
): Promise<boolean> {
  const combo = el.closest(".tzed-combo");
  if (!combo) return false;

  el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));

  const firstItem = await waitForHsCodeDropdownItem(combo, 4000);
  if (!firstItem) return false;

  firstItem.click();
  return true;
}

const FIELD_MAP: Record<
  ParcelItemField,
  { key: FieldKey; labelUk: string; from: (d: Defaults) => string }
> = {
  value: {
    key: "parcel.value",
    labelUk: STRINGS.fieldLabels.parcelValue,
    from: (d) => d.value,
  },
  quantity: {
    key: "parcel.quantity",
    labelUk: STRINGS.fieldLabels.parcelQuantity,
    from: (d) => d.quantity,
  },
  hsCode: {
    key: "parcel.hsCode",
    labelUk: STRINGS.fieldLabels.parcelHsCode,
    from: (d) => d.hsCode,
  },
  currencyCode: {
    key: "parcel.currencyCode",
    labelUk: STRINGS.fieldLabels.parcelCurrency,
    from: (d) => d.currencyCode,
  },
  itemWeight: {
    key: "parcel.itemWeight",
    labelUk: STRINGS.fieldLabels.parcelItemWeight,
    from: (d) => d.itemWeight,
  },
  countryOfOrigin: {
    key: "parcel.countryOfOrigin",
    labelUk: STRINGS.fieldLabels.parcelCountryOfOrigin,
    from: (d) => d.countryOfOrigin,
  },
};

const PARCEL_FIELD_ORDER: ParcelItemField[] = [
  "value",
  "quantity",
  "hsCode",
  "currencyCode",
  "itemWeight",
  "countryOfOrigin",
];

export function fillCategory(defaults: Defaults): FieldResult {
  const value = defaults.categoryType;
  const label = STRINGS.fieldLabels.category;
  if (!value) {
    return { key: "category", status: "skipped", reasonUk: STRINGS.errors.valueAbsentInConfig };
  }
  const el = firstVisible<HTMLSelectElement | HTMLInputElement>(CATEGORY_SELECTOR);
  if (!el) {
    return { key: "category", status: "failed", reasonUk: STRINGS.errors.selectorMissing(label) };
  }
  if (el instanceof HTMLSelectElement && !isSelectOptionAvailable(el, value)) {
    return {
      key: "category",
      status: "failed",
      reasonUk: STRINGS.errors.selectorMissing(label),
    };
  }
  try {
    setNativeValue(el, value);
    return { key: "category", status: "filled", valueWritten: value };
  } catch (e) {
    return {
      key: "category",
      status: "failed",
      reasonUk: STRINGS.errors.writeThrew(label, (e as Error).message ?? String(e)),
    };
  }
}

const DIMENSION_DEFAULTS_MAP: Record<
  "shipment.weight" | "shipment.width" | "shipment.length" | "shipment.height",
  (d: Defaults) => string
> = {
  "shipment.weight": (d) => d.weight,
  "shipment.width": (d) => d.width,
  "shipment.length": (d) => d.length,
  "shipment.height": (d) => d.height,
};

export function fillShipmentDimensions(defaults: Defaults): FieldResult[] {
  const results: FieldResult[] = [];
  for (const dim of DIMENSION_SELECTORS) {
    const value = DIMENSION_DEFAULTS_MAP[dim.key](defaults);
    if (!value) {
      results.push({ key: dim.key, status: "skipped", reasonUk: STRINGS.errors.valueAbsentInConfig });
      continue;
    }
    const el = firstVisible<HTMLInputElement>(dim.selector);
    if (!el) {
      results.push({ key: dim.key, status: "failed", reasonUk: STRINGS.errors.selectorMissing(dim.labelUk) });
      continue;
    }
    try {
      setNativeValue(el, value);
      results.push({ key: dim.key, status: "filled", valueWritten: value });
    } catch (e) {
      results.push({
        key: dim.key,
        status: "failed",
        reasonUk: STRINGS.errors.writeThrew(dim.labelUk, (e as Error).message ?? String(e)),
      });
    }
  }
  return results;
}

export async function fillParcelItems(
  defaults: Defaults,
  root: ParentNode = document,
): Promise<FieldResult[]> {
  const results: FieldResult[] = [];
  const rows = findParcelRows(root);
  if (rows.length === 0) {
    results.push({
      key: "parcel.value",
      status: "failed",
      reasonUk: STRINGS.errors.parcelItemsNoRows,
    });
    return results;
  }

  const targetIndices =
    defaults.parcelFillMode === "FIRST_ONLY"
      ? [rows[0]!.index]
      : rows.map((r) => r.index);

  for (const row of rows) {
    const isTarget = targetIndices.includes(row.index);
    for (const field of PARCEL_FIELD_ORDER) {
      const mapping = FIELD_MAP[field];
      const el = row.fields[field];
      if (!isTarget) {
        results.push({
          key: mapping.key,
          rowIndex: row.index,
          status: "skipped",
          reasonUk: STRINGS.errors.skippedByFirstOnly,
        });
        continue;
      }
      if (!el) {
        results.push({
          key: mapping.key,
          rowIndex: row.index,
          status: "failed",
          reasonUk: STRINGS.errors.selectorMissing(mapping.labelUk),
        });
        continue;
      }
      const value = mapping.from(defaults);
      if (value === undefined || value === "") {
        results.push({
          key: mapping.key,
          rowIndex: row.index,
          status: "skipped",
          reasonUk: STRINGS.errors.valueAbsentInConfig,
        });
        continue;
      }
      if (el instanceof HTMLSelectElement && !isSelectOptionAvailable(el, value)) {
        results.push({
          key: mapping.key,
          rowIndex: row.index,
          status: "failed",
          reasonUk: STRINGS.errors.selectorMissing(mapping.labelUk),
        });
        continue;
      }
      try {
        setNativeValue(el, value);
        if (field === "hsCode" && el instanceof HTMLInputElement) {
          await autoSelectHsCodeDropdown(el);
        }
        results.push({
          key: mapping.key,
          rowIndex: row.index,
          status: "filled",
          valueWritten: value,
        });
      } catch (e) {
        results.push({
          key: mapping.key,
          rowIndex: row.index,
          status: "failed",
          reasonUk: STRINGS.errors.writeThrew(
            mapping.labelUk,
            (e as Error).message ?? String(e),
          ),
        });
      }
    }
  }

  return results;
}
