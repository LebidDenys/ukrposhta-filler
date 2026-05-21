import { STRINGS } from "../i18n/uk.js";
import type {
  ParsedRecipient,
  ParseResult,
  ParseWarning,
  RecipientFieldKey,
} from "./types.js";
import { emailStage } from "./stages/email.js";
import { phoneStage } from "./stages/phone.js";
import { countryStage } from "./stages/country.js";
import { postcodeStage } from "./stages/postcode.js";
import { stateStage } from "./stages/state.js";
import {
  streetCityStageWithOriginal,
  unpackStreetCityValue,
} from "./stages/streetCity.js";
import { nameStage } from "./stages/name.js";
import { splitPhoneDialCode } from "./stages/phoneDialCode.js";

export function parse(input: string): ParseResult {
  const warnings: ParseWarning[] = [];
  const normalizedInput = input.replace(/\r\n/g, "\n").trim();
  let work = normalizedInput;
  const values: ParsedRecipient = {};

  const emailOut = emailStage(work, values);
  if (emailOut.value) values.email = emailOut.value;
  work = emailOut.restText;

  const phoneOut = phoneStage(work, values);
  if (phoneOut.value) values.phone = phoneOut.value;
  work = phoneOut.restText;

  const countryOut = countryStage(work, values);
  if (countryOut.value) values.country = countryOut.value;
  else warnings.push(makeWarning("country", "country.notDetected"));
  work = countryOut.restText;

  const postcodeOut = postcodeStage(work, values);
  if (postcodeOut.value) values.postcode = postcodeOut.value;
  else warnings.push(makeWarning("postcode", "postcode.notDetected"));
  work = postcodeOut.restText;

  const stateOut = stateStage(work, values);
  if (stateOut.value) values.region = stateOut.value;
  work = stateOut.restText;

  const streetCityOut = streetCityStageWithOriginal(work, values, normalizedInput);
  const sc = unpackStreetCityValue(streetCityOut.value);
  if (sc.street) values.street = sc.street;
  else warnings.push(makeWarning("street", "street.notDetected"));
  if (sc.city) values.city = sc.city;
  else warnings.push(makeWarning("city", "city.notDetected"));
  work = streetCityOut.restText;

  const nameOut = nameStage(work, values);
  if (nameOut.value) values.name = nameOut.value;
  else warnings.push(makeWarning("name", "name.notDetected"));
  work = nameOut.restText;

  const withDial = splitPhoneDialCode(values);
  if (withDial.phone !== undefined) values.phone = withDial.phone;
  if (withDial.phoneDialCode) values.phoneDialCode = withDial.phoneDialCode;

  const leftover = work.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");

  return { values, warnings, leftover };
}

function makeWarning(fieldKey: RecipientFieldKey, code: string): ParseWarning {
  const messageUk = warningMessage(fieldKey, code);
  return { code, fieldKey, messageUk };
}

function warningMessage(fieldKey: RecipientFieldKey, _code: string): string {
  switch (fieldKey) {
    case "country":
      return STRINGS.parser.countryNotDetected;
    case "name":
      return STRINGS.parser.nameNotDetected;
    case "street":
      return STRINGS.parser.streetNotDetected;
    case "city":
      return STRINGS.parser.cityNotDetected;
    case "postcode":
      return STRINGS.parser.postcodeNotDetected;
    default:
      return STRINGS.parser.valueAbsent;
  }
}

export type { ParsedRecipient, ParseResult, ParseWarning, RecipientFieldKey };
