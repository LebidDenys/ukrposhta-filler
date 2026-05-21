export type CategoryType =
  | "GIFT"
  | "SALE_OF_GOODS"
  | "COMMERCIAL_SAMPLE"
  | "RETURNING_GOODS"
  | "DOCUMENTS";

export type CurrencyCode = "UAH" | "USD" | "EUR" | "GBP";

export type ParcelFillMode = "FIRST_ONLY" | "ALL_ROWS";

export const DEFAULTS_SCHEMA_VERSION = 1;

export interface Defaults {
  categoryType: CategoryType | "";
  currencyCode: CurrencyCode | "";
  value: string;
  quantity: string;
  hsCode: string;
  parcelFillMode: ParcelFillMode;
  weight: string;
  width: string;
  length: string;
  height: string;
  itemWeight: string;
  countryOfOrigin: string;
  schemaVersion: number;
  [extraKey: string]: unknown;
}

export const FIRST_RUN_DEFAULTS: Defaults = {
  categoryType: "",
  currencyCode: "UAH",
  value: "",
  quantity: "1",
  hsCode: "",
  parcelFillMode: "ALL_ROWS",
  weight: "",
  width: "",
  length: "",
  height: "",
  itemWeight: "",
  countryOfOrigin: "",
  schemaVersion: DEFAULTS_SCHEMA_VERSION,
};

export class StorageError extends Error {
  override readonly name = "StorageError";
  public override readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}
