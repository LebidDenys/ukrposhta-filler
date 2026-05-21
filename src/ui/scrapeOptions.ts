export interface ScrapedOption {
  value: string;
  label: string;
}

const CATEGORY_FALLBACK: ScrapedOption[] = [
  { value: "GIFT", label: "Подарунок" },
  { value: "SALE_OF_GOODS", label: "Продаж товарів" },
  { value: "COMMERCIAL_SAMPLE", label: "Комерційний зразок" },
  { value: "RETURNING_GOODS", label: "Повернення товару" },
  { value: "DOCUMENTS", label: "Документи" },
];

const CURRENCY_FALLBACK: ScrapedOption[] = [
  { value: "UAH", label: "UAH" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

function readSelectOptions(selector: string): ScrapedOption[] | null {
  const el = document.querySelector<HTMLSelectElement>(selector);
  if (!el) return null;
  const opts: ScrapedOption[] = [];
  for (const o of Array.from(el.options)) {
    if (!o.value) continue;
    opts.push({ value: o.value, label: (o.text || o.value).trim() });
  }
  return opts.length > 0 ? opts : null;
}

export function scrapeCategoryOptions(): {
  options: ScrapedOption[];
  fellBack: boolean;
} {
  const live = readSelectOptions(
    `[data-ng-model="shipment.internationalData.categoryType"]`,
  );
  if (live) return { options: live, fellBack: false };
  return { options: CATEGORY_FALLBACK, fellBack: true };
}

export function scrapeCurrencyOptions(): {
  options: ScrapedOption[];
  fellBack: boolean;
} {
  const live = readSelectOptions(
    `[data-ng-model="parcelItems[0].currencyCode"]`,
  ) ?? readSelectOptions(`[data-ng-model^="parcelItems"][data-ng-model$=".currencyCode"]`);
  if (live) return { options: live, fellBack: false };
  return { options: CURRENCY_FALLBACK, fellBack: true };
}

const COUNTRY_OF_ORIGIN_FALLBACK: ScrapedOption[] = [
  { value: "UA", label: "Україна" },
  { value: "CN", label: "Китай" },
  { value: "US", label: "США" },
  { value: "DE", label: "Німеччина" },
  { value: "PL", label: "Польща" },
  { value: "GB", label: "Велика Британія" },
  { value: "FR", label: "Франція" },
  { value: "IT", label: "Італія" },
];

export function scrapeCountryOfOriginOptions(): {
  options: ScrapedOption[];
  fellBack: boolean;
} {
  const live = readSelectOptions(
    `[data-ng-model="parcelItems[key].countryOfOrigin"]`,
  ) ?? readSelectOptions(`[data-ng-model^="parcelItems"][data-ng-model$=".countryOfOrigin"]`);
  if (live) return { options: live, fellBack: false };
  return { options: COUNTRY_OF_ORIGIN_FALLBACK, fellBack: true };
}
