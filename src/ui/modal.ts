import { STRINGS } from "../i18n/uk.js";
import type { Defaults, ParcelFillMode } from "../config/types.js";
import { saveDefaults } from "../config/defaults.js";
import {
  scrapeCategoryOptions,
  scrapeCurrencyOptions,
  scrapeCountryOfOriginOptions,
  type ScrapedOption,
} from "./scrapeOptions.js";
import { logError } from "./consoleLog.js";

export interface ModalDeps {
  getCurrentDefaults: () => Defaults;
  onSaved: (next: Defaults) => void;
}

export function openConfigModal(deps: ModalDeps): void {
  const existing = document.getElementById("upx-modal-backdrop");
  if (existing) existing.remove();

  const current = deps.getCurrentDefaults();
  const categoryScrape = scrapeCategoryOptions();
  const currencyScrape = scrapeCurrencyOptions();
  const countryOfOriginScrape = scrapeCountryOfOriginOptions();

  const backdrop = document.createElement("div");
  backdrop.id = "upx-modal-backdrop";
  backdrop.className = "upx-modal-backdrop";

  const modal = document.createElement("div");
  modal.className = "upx-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", (e) => e.stopPropagation());

  const header = document.createElement("div");
  header.className = "upx-modal-header";
  const title = document.createElement("div");
  title.className = "upx-modal-title";
  title.textContent = STRINGS.modal.title;
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "upx-modal-close";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", STRINGS.modal.closeAria);
  closeBtn.onclick = close;
  header.appendChild(title);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const body = document.createElement("div");
  body.className = "upx-modal-body";

  if (categoryScrape.fellBack || currencyScrape.fellBack || countryOfOriginScrape.fellBack) {
    const warn = document.createElement("div");
    warn.className = "upx-modal-warning";
    warn.textContent = STRINGS.modal.nativeOptionsMissingWarning;
    body.appendChild(warn);
  }

  const categorySelect = makeSelect(
    STRINGS.modal.categoryLabel,
    categoryScrape.options,
    current.categoryType,
    true,
  );
  body.appendChild(categorySelect.row);

  const valueInput = makeNumberInput(
    STRINGS.modal.valueLabel,
    current.value,
    "0",
    "0.01",
  );
  body.appendChild(valueInput.row);

  const currencySelect = makeSelect(
    STRINGS.modal.currencyLabel,
    currencyScrape.options,
    current.currencyCode,
    false,
  );
  body.appendChild(currencySelect.row);

  const quantityInput = makeNumberInput(
    STRINGS.modal.quantityLabel,
    current.quantity,
    "1",
    "1",
  );
  body.appendChild(quantityInput.row);

  const hsRow = document.createElement("div");
  hsRow.className = "upx-modal-row";
  const hsLabel = document.createElement("label");
  hsLabel.className = "upx-modal-label";
  hsLabel.textContent = STRINGS.modal.hsCodeLabel;
  const hsInput = document.createElement("input");
  hsInput.type = "text";
  hsInput.className = "upx-modal-input";
  hsInput.value = current.hsCode ?? "";
  hsLabel.htmlFor = "upx-modal-hsCode";
  hsInput.id = "upx-modal-hsCode";
  hsRow.appendChild(hsLabel);
  hsRow.appendChild(hsInput);
  body.appendChild(hsRow);

  const itemWeightInput = makeNumberInput(
    STRINGS.modal.itemWeightLabel,
    current.itemWeight ?? "",
    "0",
    "1",
  );
  body.appendChild(itemWeightInput.row);

  const countryOfOriginSelect = makeSelect(
    STRINGS.modal.countryOfOriginLabel,
    countryOfOriginScrape.options,
    current.countryOfOrigin ?? "",
    true,
  );
  body.appendChild(countryOfOriginSelect.row);

  const fillModeRow = document.createElement("div");
  fillModeRow.className = "upx-modal-row";
  const fmLabel = document.createElement("div");
  fmLabel.className = "upx-modal-label";
  fmLabel.textContent = STRINGS.modal.parcelFillModeLabel;
  fillModeRow.appendChild(fmLabel);
  const fmGroup = document.createElement("div");
  fmGroup.className = "upx-radio-group";
  const fmRadios: Record<ParcelFillMode, HTMLInputElement> = {
    FIRST_ONLY: makeRadio("upx-fill-mode", "FIRST_ONLY", STRINGS.modal.parcelFillModeFirstOnly, current.parcelFillMode === "FIRST_ONLY", fmGroup),
    ALL_ROWS: makeRadio("upx-fill-mode", "ALL_ROWS", STRINGS.modal.parcelFillModeAllRows, current.parcelFillMode === "ALL_ROWS", fmGroup),
  };
  fillModeRow.appendChild(fmGroup);
  body.appendChild(fillModeRow);

  const dimSection = document.createElement("div");
  dimSection.className = "upx-modal-section";
  const dimTitle = document.createElement("div");
  dimTitle.className = "upx-modal-section-title";
  dimTitle.textContent = STRINGS.modal.dimensionsSectionTitle;
  dimSection.appendChild(dimTitle);

  const weightInput = makeNumberInput(STRINGS.modal.weightLabel, current.weight ?? "", "1", "1");
  weightInput.input.max = "2000";
  dimSection.appendChild(weightInput.row);

  const dimGrid = document.createElement("div");
  dimGrid.className = "upx-modal-grid-3";

  const widthInput = makeNumberInput(STRINGS.modal.widthLabel, current.width ?? "", "0", "0.01");
  widthInput.input.max = "60";
  dimGrid.appendChild(widthInput.row);

  const lengthInput = makeNumberInput(STRINGS.modal.lengthLabel, current.length ?? "", "0", "0.01");
  lengthInput.input.max = "60";
  dimGrid.appendChild(lengthInput.row);

  const heightInput = makeNumberInput(STRINGS.modal.heightLabel, current.height ?? "", "0", "0.01");
  heightInput.input.max = "60";
  dimGrid.appendChild(heightInput.row);

  dimSection.appendChild(dimGrid);
  body.appendChild(dimSection);

  modal.appendChild(body);

  const footer = document.createElement("div");
  footer.className = "upx-modal-footer";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "upx-btn upx-btn-secondary";
  cancelBtn.textContent = STRINGS.modal.cancelButton;
  cancelBtn.onclick = close;
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "upx-btn upx-btn-primary";
  saveBtn.textContent = STRINGS.modal.saveButton;
  saveBtn.onclick = async () => {
    const next: Defaults = {
      ...current,
      categoryType: (categorySelect.select.value as Defaults["categoryType"]) || "",
      currencyCode: (currencySelect.select.value as Defaults["currencyCode"]) || "UAH",
      value: valueInput.input.value.trim(),
      quantity: quantityInput.input.value.trim(),
      hsCode: hsInput.value.trim(),
      itemWeight: itemWeightInput.input.value.trim(),
      countryOfOrigin: countryOfOriginSelect.select.value || "",
      parcelFillMode: fmRadios.FIRST_ONLY.checked ? "FIRST_ONLY" : "ALL_ROWS",
      weight: weightInput.input.value.trim(),
      width: widthInput.input.value.trim(),
      length: lengthInput.input.value.trim(),
      height: heightInput.input.value.trim(),
      schemaVersion: current.schemaVersion ?? 1,
    };
    try {
      await saveDefaults(next);
      deps.onSaved(next);
      close();
    } catch (e) {
      logError("Failed to save defaults", e);
      const warn = document.createElement("div");
      warn.className = "upx-modal-warning";
      warn.textContent = (e as Error).message ?? String(e);
      body.prepend(warn);
    }
  };
  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
  modal.appendChild(footer);

  backdrop.appendChild(modal);

  function close(): void {
    document.removeEventListener("keydown", onKey);
    backdrop.remove();
  }
  function onKey(e: KeyboardEvent): void {
    if (e.key === "Escape") close();
  }
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", onKey);

  document.body.appendChild(backdrop);
  categorySelect.select.focus();
}

function makeSelect(
  labelText: string,
  options: ScrapedOption[],
  value: string,
  includeEmpty: boolean,
): { row: HTMLElement; select: HTMLSelectElement } {
  const row = document.createElement("div");
  row.className = "upx-modal-row";
  const label = document.createElement("label");
  label.className = "upx-modal-label";
  label.textContent = labelText;
  const select = document.createElement("select");
  select.className = "upx-modal-select";
  if (includeEmpty) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = STRINGS.modal.emptyOption;
    select.appendChild(opt);
  }
  for (const o of options) {
    const opt = document.createElement("option");
    opt.value = o.value;
    opt.textContent = o.label;
    select.appendChild(opt);
  }
  select.value = value;
  if (value && !Array.from(select.options).some((o) => o.value === value)) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.insertBefore(opt, select.firstChild);
    select.value = value;
  }
  row.appendChild(label);
  row.appendChild(select);
  return { row, select };
}

function makeNumberInput(
  labelText: string,
  value: string,
  min: string,
  step: string,
): { row: HTMLElement; input: HTMLInputElement } {
  const row = document.createElement("div");
  row.className = "upx-modal-row";
  const label = document.createElement("label");
  label.className = "upx-modal-label";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "number";
  input.className = "upx-modal-input";
  input.value = value;
  input.min = min;
  input.step = step;
  row.appendChild(label);
  row.appendChild(input);
  return { row, input };
}

function makeRadio(
  name: string,
  value: string,
  labelText: string,
  checked: boolean,
  parent: HTMLElement,
): HTMLInputElement {
  const label = document.createElement("label");
  label.className = "upx-radio";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = name;
  input.value = value;
  input.checked = checked;
  label.appendChild(input);
  label.appendChild(document.createTextNode(" " + labelText));
  parent.appendChild(label);
  return input;
}
