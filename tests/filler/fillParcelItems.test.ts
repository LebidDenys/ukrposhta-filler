import { describe, it, expect, beforeEach } from "vitest";
import { fillParcelItems } from "../../src/filler/fillParcelItems.js";
import type { Defaults } from "../../src/config/types.js";

function buildDom(rowCount: number): HTMLDivElement {
  const root = document.createElement("div");
  for (let i = 0; i < rowCount; i++) {
    const row = document.createElement("div");
    row.setAttribute("data-ng-repeat", "(key, value) in parcelItems");
    row.setAttribute("data-item", String(i + 1));

    const v = document.createElement("input");
    v.type = "number";
    v.setAttribute("data-ng-model", "parcelItems[key].value");
    row.appendChild(v);

    const q = document.createElement("input");
    q.type = "number";
    q.setAttribute("data-ng-model", "parcelItems[key].quantity");
    row.appendChild(q);

    const h = document.createElement("input");
    h.type = "text";
    h.setAttribute("data-ng-model", "parcelItems[key].hsCode");
    row.appendChild(h);

    const c = document.createElement("select");
    c.setAttribute("data-ng-model", "parcelItems[key].currencyCode");
    for (const cc of ["UAH", "USD", "EUR", "GBP"]) {
      const opt = document.createElement("option");
      opt.value = cc;
      opt.text = cc;
      c.appendChild(opt);
    }
    row.appendChild(c);

    root.appendChild(row);
  }
  document.body.appendChild(root);
  return root;
}

function baseDefaults(mode: Defaults["parcelFillMode"]): Defaults {
  return {
    categoryType: "GIFT",
    currencyCode: "USD",
    value: "25",
    quantity: "3",
    hsCode: "6109",
    parcelFillMode: mode,
    schemaVersion: 1,
  };
}

describe("fillParcelItems", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("ALL_ROWS fills every row", () => {
    const root = buildDom(2);
    const results = fillParcelItems(baseDefaults("ALL_ROWS"), root);
    const filled = results.filter((r) => r.status === "filled");
    expect(filled.length).toBe(8);
    const inputs = root.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      `[data-ng-model^="parcelItems"]`,
    );
    expect(inputs.length).toBe(8);
    expect(Array.from(inputs).every((el) => el.value !== "")).toBe(true);
  });

  it("FIRST_ONLY fills only first row and skips rest with reason", () => {
    const root = buildDom(2);
    const results = fillParcelItems(baseDefaults("FIRST_ONLY"), root);
    const filled = results.filter((r) => r.status === "filled");
    const skippedByMode = results.filter(
      (r) => r.status === "skipped" && r.reasonUk?.includes("Перший рядок"),
    );
    expect(filled.length).toBe(4);
    expect(skippedByMode.length).toBe(4);

    const rows = root.querySelectorAll<HTMLDivElement>(
      `[data-ng-repeat*="parcelItems"]`,
    );
    const row0Value = rows[0]!.querySelector<HTMLInputElement>(
      `[data-ng-model="parcelItems[key].value"]`,
    );
    const row1Value = rows[1]!.querySelector<HTMLInputElement>(
      `[data-ng-model="parcelItems[key].value"]`,
    );
    expect(row0Value?.value).toBe("25");
    expect(row1Value?.value).toBe("");
  });

  it("FIRST_ONLY with single row fills that row", () => {
    const root = buildDom(1);
    const results = fillParcelItems(baseDefaults("FIRST_ONLY"), root);
    const filled = results.filter((r) => r.status === "filled");
    const skippedByMode = results.filter(
      (r) => r.status === "skipped" && r.reasonUk?.includes("Перший рядок"),
    );
    expect(filled.length).toBe(4);
    expect(skippedByMode.length).toBe(0);
  });

  it("zero rows returns parcelItemsNoRows failure", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const results = fillParcelItems(baseDefaults("ALL_ROWS"), root);
    expect(results.length).toBe(1);
    expect(results[0]!.status).toBe("failed");
    expect(results[0]!.reasonUk).toContain("parcelItems");
  });
});
