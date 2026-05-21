import { STRINGS } from "../i18n/uk.js";
import type { FieldKey } from "./types.js";

export interface RecipientSelector {
  key: FieldKey;
  selector: string;
  labelUk: string;
  /** When true, a missing element produces "skipped" instead of "failed". */
  optional?: boolean;
}

export const RECIPIENT_SELECTORS: ReadonlyArray<RecipientSelector> = [
  {
    key: "country",
    selector: `#country-native, [data-ng-model="shipment.recipient.address.country"]`,
    labelUk: STRINGS.fieldLabels.country,
  },
  {
    key: "name",
    selector: `#recv-fullname, [data-ng-model="shipment.recipient.latinName"]`,
    labelUk: STRINGS.fieldLabels.name,
  },
  {
    key: "street",
    selector: `#street, [data-ng-model="shipment.recipient.address.foreignStreetHouseApartment"]`,
    labelUk: STRINGS.fieldLabels.street,
  },
  {
    key: "city",
    selector: `#city, [data-ng-model="shipment.recipient.address.city"]`,
    labelUk: STRINGS.fieldLabels.city,
  },
  {
    key: "region",
    selector: `#region, [data-ng-model="shipment.recipient.address.region"]`,
    labelUk: STRINGS.fieldLabels.region,
  },
  {
    key: "postcode",
    selector: `#zip-code, [data-ng-model="shipment.recipient.address.postcode"]`,
    labelUk: STRINGS.fieldLabels.postcode,
  },
  {
    key: "email",
    selector: `#recv-email, [data-ng-model="shipment.recipientEmail"]`,
    labelUk: STRINGS.fieldLabels.email,
  },
  {
    key: "phoneDialCode",
    selector: `[data-ng-model="shipment.recipient.phoneCode"]`,
    labelUk: STRINGS.fieldLabels.phoneDialCode,
    optional: true,
  },
  {
    key: "phone",
    selector: `[data-ng-model="shipment.recipient.phoneNumber"]`,
    labelUk: STRINGS.fieldLabels.phone,
  },
] as const;

export const CATEGORY_SELECTOR = `[data-ng-model="shipment.internationalData.categoryType"]`;

export interface DimensionSelector {
  key: "shipment.weight" | "shipment.width" | "shipment.length" | "shipment.height";
  selector: string;
  labelUk: string;
}

export const DIMENSION_SELECTORS: ReadonlyArray<DimensionSelector> = [
  {
    key: "shipment.weight",
    selector: `#weight, [data-ng-model="shipment.parcels.weight"]`,
    labelUk: STRINGS.fieldLabels.weight,
  },
  {
    key: "shipment.width",
    selector: `#width, [data-ng-model="shipment.parcels.width"]`,
    labelUk: STRINGS.fieldLabels.width,
  },
  {
    key: "shipment.length",
    selector: `#length, [data-ng-model="shipment.parcels.length"]`,
    labelUk: STRINGS.fieldLabels.length,
  },
  {
    key: "shipment.height",
    selector: `#height, [data-ng-model="shipment.parcels.height"]`,
    labelUk: STRINGS.fieldLabels.height,
  },
] as const;

export interface RecipientLabelMap {
  [k: string]: string;
}

export const RECIPIENT_LABELS: RecipientLabelMap = Object.fromEntries(
  RECIPIENT_SELECTORS.map((s) => [s.key, s.labelUk]),
);

export const DIMENSION_LABELS: RecipientLabelMap = Object.fromEntries(
  DIMENSION_SELECTORS.map((s) => [s.key, s.labelUk]),
);

export function firstVisible<T extends HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T | null {
  const els = root.querySelectorAll<T>(selector);
  for (const el of els) {
    if (el.hasAttribute("hidden")) continue;
    if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") {
      continue;
    }
    return el;
  }
  return els[0] ?? null;
}
