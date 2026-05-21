export type FieldKey =
  | "country"
  | "name"
  | "street"
  | "city"
  | "region"
  | "postcode"
  | "email"
  | "phoneDialCode"
  | "phone"
  | "category"
  | "parcel.value"
  | "parcel.quantity"
  | "parcel.hsCode"
  | "parcel.currencyCode"
  | "parcel.itemWeight"
  | "parcel.countryOfOrigin"
  | "shipment.weight"
  | "shipment.width"
  | "shipment.length"
  | "shipment.height";

export type FieldStatus = "filled" | "skipped" | "failed";

export interface FieldResult {
  key: FieldKey;
  rowIndex?: number;
  status: FieldStatus;
  reasonUk?: string;
  valueWritten?: string;
  /** When true, the result is not shown in the banner (used for auto-handled optional fields). */
  silent?: boolean;
}

export interface FillResult {
  fields: FieldResult[];
  durationMs: number;
}
