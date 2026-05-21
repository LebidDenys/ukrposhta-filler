export type ParcelItemField = "value" | "quantity" | "hsCode" | "currencyCode" | "itemWeight" | "countryOfOrigin";

export interface ParcelRow {
  index: number;
  container: Element;
  fields: Partial<Record<ParcelItemField, HTMLInputElement | HTMLSelectElement>>;
}

const FIELD_SELECTORS: Record<ParcelItemField, string> = {
  value: `[data-ng-model="parcelItems[key].value"]`,
  quantity: `[data-ng-model="parcelItems[key].quantity"]`,
  hsCode: `[data-ng-model="parcelItems[key].hsCode"]`,
  currencyCode: `[data-ng-model="parcelItems[key].currencyCode"]`,
  itemWeight: `[data-ng-model="parcelItems[key].weight"]`,
  countryOfOrigin: `[data-ng-model="parcelItems[key].countryOfOrigin"]`,
};

const ROW_CONTAINER_SELECTORS = [
  `[data-ng-repeat*="parcelItems"]`,
  `[ng-repeat*="parcelItems"]`,
];

export function findParcelRows(root: ParentNode = document): ParcelRow[] {
  const containerSet = new Set<Element>();
  for (const sel of ROW_CONTAINER_SELECTORS) {
    for (const el of root.querySelectorAll<Element>(sel)) {
      containerSet.add(el);
    }
  }

  if (containerSet.size === 0) return [];

  const containers = Array.from(containerSet);
  const rows: ParcelRow[] = [];
  containers.forEach((container, index) => {
    const fields: ParcelRow["fields"] = {};
    for (const [field, selector] of Object.entries(FIELD_SELECTORS) as Array<
      [ParcelItemField, string]
    >) {
      const el = container.querySelector<HTMLInputElement | HTMLSelectElement>(
        selector,
      );
      if (el) fields[field] = el;
    }
    if (Object.keys(fields).length > 0) {
      rows.push({ index, container, fields });
    }
  });

  return rows;
}
