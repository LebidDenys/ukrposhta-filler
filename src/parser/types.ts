export type RecipientFieldKey =
  | "name"
  | "street"
  | "city"
  | "region"
  | "postcode"
  | "country"
  | "email"
  | "phoneDialCode"
  | "phone";

export interface ParsedRecipient {
  name?: string;
  street?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phoneDialCode?: string;
  phone?: string;
}

export interface ParseWarning {
  code: string;
  fieldKey: RecipientFieldKey;
  messageUk: string;
}

export interface ParseResult {
  values: ParsedRecipient;
  warnings: ParseWarning[];
  leftover: string;
}

export interface StageOutcome {
  match?: string;
  value?: string;
  restText: string;
}

export type Stage = (text: string, soFar: ParsedRecipient) => StageOutcome;
