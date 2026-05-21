import { STRINGS } from "../i18n/uk.js";
import type { Defaults } from "../config/types.js";
import { parse } from "../parser/parse.js";
import { fillAll } from "../filler/fillAll.js";
import { fillCategory, fillParcelItems, fillShipmentDimensions } from "../filler/fillParcelItems.js";
import { renderBanner } from "./banner.js";
import { openConfigModal } from "./modal.js";
import { logError } from "./consoleLog.js";
import { scrapeCategoryOptions, scrapeCountryOfOriginOptions } from "./scrapeOptions.js";

export interface PanelDeps {
  getDefaults: () => Defaults;
  saveDefaults: (next: Defaults) => void;
}

export interface PanelHandle {
  root: HTMLElement;
  refreshSummary: () => void;
}

export function mountPanel(deps: PanelDeps): PanelHandle {
  const existing = document.getElementById("upx-filler-panel");
  if (existing) existing.remove();

  const root = document.createElement("div");
  root.id = "upx-filler-panel";

  const header = document.createElement("div");
  header.className = "upx-panel-header";
  const titleEl = document.createElement("div");
  titleEl.className = "upx-panel-title";
  titleEl.textContent = STRINGS.panel.title;
  const chevron = document.createElement("button");
  chevron.type = "button";
  chevron.className = "upx-chevron";
  chevron.textContent = "▾";
  chevron.setAttribute("aria-label", STRINGS.panel.collapseAria);
  header.appendChild(titleEl);
  header.appendChild(chevron);
  header.onclick = (e) => {
    if (e.target === chevron) return;
    toggleCollapse();
  };
  chevron.onclick = (e) => {
    e.stopPropagation();
    toggleCollapse();
  };
  function toggleCollapse(): void {
    root.classList.toggle("upx-collapsed");
    const collapsed = root.classList.contains("upx-collapsed");
    chevron.textContent = collapsed ? "▸" : "▾";
    chevron.setAttribute(
      "aria-label",
      collapsed ? STRINGS.panel.expandAria : STRINGS.panel.collapseAria,
    );
  }
  root.appendChild(header);

  const body = document.createElement("div");
  body.className = "upx-panel-body";

  const textarea = document.createElement("textarea");
  textarea.className = "upx-textarea";
  textarea.placeholder = STRINGS.panel.textareaPlaceholder;
  textarea.spellcheck = false;
  body.appendChild(textarea);

  const summary = document.createElement("div");
  summary.className = "upx-summary";
  const summaryHeading = document.createElement("div");
  summaryHeading.className = "upx-summary-heading";
  summaryHeading.textContent = STRINGS.panel.currentSettingsHeading;
  summary.appendChild(summaryHeading);
  const chips = document.createElement("div");
  chips.className = "upx-chips";
  summary.appendChild(chips);
  body.appendChild(summary);

  const buttons = document.createElement("div");
  buttons.className = "upx-buttons";
  const fillBtn = document.createElement("button");
  fillBtn.type = "button";
  fillBtn.className = "upx-btn upx-btn-primary";
  fillBtn.textContent = STRINGS.panel.fillButton;
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "upx-btn upx-btn-secondary";
  editBtn.textContent = STRINGS.panel.editConfigButton;
  buttons.appendChild(fillBtn);
  buttons.appendChild(editBtn);
  body.appendChild(buttons);

  const banner = document.createElement("div");
  banner.className = "upx-banner";
  body.appendChild(banner);

  root.appendChild(body);
  document.body.appendChild(root);

  function chip(labelKey: string, value: string): HTMLElement {
    const el = document.createElement("div");
    el.className = "upx-chip";
    const lbl = document.createElement("span");
    lbl.className = "upx-chip-label";
    lbl.textContent = labelKey + ":";
    el.appendChild(lbl);
    el.appendChild(document.createTextNode(" " + value));
    return el;
  }

  function categoryLabel(code: string): string {
    if (!code) return STRINGS.panel.summary.empty;
    const { options } = scrapeCategoryOptions();
    const match = options.find((o) => o.value === code);
    return match?.label ?? code;
  }

  function countryOfOriginLabel(code: string): string {
    if (!code) return STRINGS.panel.summary.empty;
    const { options } = scrapeCountryOfOriginOptions();
    const match = options.find((o) => o.value === code);
    return match?.label ?? code;
  }

  function refreshSummary(): void {
    chips.innerHTML = "";
    const d = deps.getDefaults();
    const s = STRINGS.panel.summary;
    chips.appendChild(chip(s.category, categoryLabel(d.categoryType)));
    chips.appendChild(
      chip(s.value, (d.value || s.empty) + (d.value ? ` ${d.currencyCode || ""}` : "")),
    );
    chips.appendChild(chip(s.quantity, d.quantity || s.empty));
    chips.appendChild(chip(s.hsCode, d.hsCode || s.empty));
    const fillMode = d.parcelFillMode === "FIRST_ONLY"
      ? s.fillModeFirstOnly
      : s.fillModeAllRows;
    const modeChip = document.createElement("div");
    modeChip.className = "upx-chip";
    modeChip.textContent = fillMode;
    chips.appendChild(modeChip);
    chips.appendChild(chip(s.itemWeight, d.itemWeight ? `${d.itemWeight} г` : s.empty));
    chips.appendChild(chip(s.countryOfOrigin, countryOfOriginLabel(d.countryOfOrigin ?? "")));
    chips.appendChild(chip(s.weight, d.weight ? `${d.weight} г` : s.empty));
    chips.appendChild(chip(s.width, d.width ? `${d.width} см` : s.empty));
    chips.appendChild(chip(s.length, d.length ? `${d.length} см` : s.empty));
    chips.appendChild(chip(s.height, d.height ? `${d.height} см` : s.empty));
  }

  refreshSummary();

  fillBtn.onclick = async () => {
    fillBtn.disabled = true;
    try {
      const text = textarea.value;
      const defaults = deps.getDefaults();
      if (!text.trim()) {
        const fields = [fillCategory(defaults), ...(await fillParcelItems(defaults)), ...fillShipmentDimensions(defaults)];
        renderBanner(banner, fields, [], {
          noteUk: STRINGS.banner.configOnlyNote,
          emptyOkMessageUk: STRINGS.banner.configOnlyAllFilledMessage,
        });
        return;
      }
      const parsed = parse(text);
      const result = await fillAll(parsed.values, defaults);
      renderBanner(banner, result.fields, parsed.warnings);
    } catch (e) {
      logError("Fill threw", e);
      renderBanner(
        banner,
        [
          {
            key: "name",
            status: "failed",
            reasonUk: (e as Error).message ?? String(e),
          },
        ],
        [],
      );
    } finally {
      fillBtn.disabled = false;
    }
  };

  editBtn.onclick = () => {
    openConfigModal({
      getCurrentDefaults: deps.getDefaults,
      onSaved: (next) => {
        deps.saveDefaults(next);
        refreshSummary();
      },
    });
  };

  return { root, refreshSummary };
}
