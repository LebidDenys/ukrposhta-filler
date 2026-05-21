import { STRINGS } from "../i18n/uk.js";
import type { FieldResult } from "../filler/types.js";
import type { ParseWarning } from "../parser/types.js";
import { logError, logWarn } from "./consoleLog.js";
import { RECIPIENT_LABELS, DIMENSION_LABELS } from "../filler/selectors.js";
import {
  scrapeCategoryOptions,
  scrapeCountryOfOriginOptions,
} from "./scrapeOptions.js";

function resolveDisplayValue(key: string, value: string): string {
  if (key === "category") {
    const { options } = scrapeCategoryOptions();
    return options.find((o) => o.value === value)?.label ?? value;
  }
  if (key === "parcel.countryOfOrigin") {
    const { options } = scrapeCountryOfOriginOptions();
    return options.find((o) => o.value === value)?.label ?? value;
  }
  return value;
}

function fieldLabel(key: string): string {
  if (key in RECIPIENT_LABELS) return RECIPIENT_LABELS[key]!;
  if (key in DIMENSION_LABELS) return DIMENSION_LABELS[key]!;
  switch (key) {
    case "category":
      return STRINGS.fieldLabels.category;
    case "parcel.value":
      return STRINGS.fieldLabels.parcelValue;
    case "parcel.quantity":
      return STRINGS.fieldLabels.parcelQuantity;
    case "parcel.hsCode":
      return STRINGS.fieldLabels.parcelHsCode;
    case "parcel.currencyCode":
      return STRINGS.fieldLabels.parcelCurrency;
    case "parcel.itemWeight":
      return STRINGS.fieldLabels.parcelItemWeight;
    case "parcel.countryOfOrigin":
      return STRINGS.fieldLabels.parcelCountryOfOrigin;
    default:
      return key;
  }
}

export interface BannerOptions {
  noteUk?: string;
  emptyOkMessageUk?: string;
}

export function renderBanner(
  host: HTMLElement,
  fields: FieldResult[],
  parseWarnings: ParseWarning[] = [],
  options: BannerOptions = {},
): void {
  host.innerHTML = "";
  host.classList.add("upx-banner-visible");

  const filled = fields.filter((f) => f.status === "filled" && !f.silent);
  const skipped = fields.filter((f) => f.status === "skipped" && !f.silent);
  const failed = fields.filter((f) => f.status === "failed" && !f.silent);

  host.classList.remove("upx-banner-ok", "upx-banner-warn", "upx-banner-err");
  if (failed.length > 0) host.classList.add("upx-banner-err");
  else if (skipped.length > 0 || parseWarnings.length > 0)
    host.classList.add("upx-banner-warn");
  else host.classList.add("upx-banner-ok");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "upx-banner-close";
  closeBtn.setAttribute("aria-label", STRINGS.banner.dismissAria);
  closeBtn.textContent = "×";
  closeBtn.onclick = () => {
    host.classList.remove("upx-banner-visible");
    host.innerHTML = "";
  };
  host.appendChild(closeBtn);

  if (options.noteUk) {
    const note = document.createElement("div");
    note.className = "upx-banner-section";
    note.textContent = options.noteUk;
    host.appendChild(note);
  }

  if (failed.length === 0 && skipped.length === 0 && parseWarnings.length === 0) {
    const ok = document.createElement("div");
    ok.className = "upx-banner-section";
    ok.textContent = options.emptyOkMessageUk ?? STRINGS.banner.allFilledMessage;
    host.appendChild(ok);
    return;
  }

  if (filled.length > 0) {
    host.appendChild(
      makeSection(STRINGS.banner.filledHeading, filled.map((f) => {
        const lbl = fieldLabel(f.key);
        const row = f.rowIndex !== undefined ? ` [рядок ${f.rowIndex + 1}]` : "";
        const v = f.valueWritten
          ? `: ${resolveDisplayValue(f.key, f.valueWritten)}`
          : "";
        return `${lbl}${row}${v}`;
      })),
    );
  }

  if (skipped.length > 0 || parseWarnings.length > 0) {
    const items: string[] = [];
    for (const w of parseWarnings) items.push(`${fieldLabel(w.fieldKey)}: ${w.messageUk}`);
    for (const f of skipped) {
      const lbl = fieldLabel(f.key);
      const row = f.rowIndex !== undefined ? ` [рядок ${f.rowIndex + 1}]` : "";
      items.push(`${lbl}${row}: ${f.reasonUk ?? STRINGS.errors.valueAbsent}`);
    }
    host.appendChild(makeSection(STRINGS.banner.skippedHeading, items));
    for (const w of parseWarnings) {
      logWarn(`${fieldLabel(w.fieldKey)} ${w.code}`, { field: w.fieldKey, code: w.code });
    }
    for (const f of skipped) {
      logWarn(`${fieldLabel(f.key)} skipped`, { field: f.key, rowIndex: f.rowIndex });
    }
  }

  if (failed.length > 0) {
    host.appendChild(
      makeSection(STRINGS.banner.failedHeading, failed.map((f) => {
        const lbl = fieldLabel(f.key);
        const row = f.rowIndex !== undefined ? ` [рядок ${f.rowIndex + 1}]` : "";
        return `${lbl}${row}: ${f.reasonUk ?? ""}`;
      })),
    );
    for (const f of failed) {
      logError(`${fieldLabel(f.key)} failed`, { field: f.key, reasonUk: f.reasonUk });
    }
  }
}

function makeSection(heading: string, items: string[]): HTMLElement {
  const section = document.createElement("div");
  section.className = "upx-banner-section";
  const h = document.createElement("div");
  h.className = "upx-banner-heading";
  h.textContent = heading;
  section.appendChild(h);
  const ul = document.createElement("ul");
  ul.className = "upx-banner-list";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  }
  section.appendChild(ul);
  return section;
}
