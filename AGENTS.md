# AGENTS.md — AI context for ukrposhta-intl-filler

This file is read by AI agents (Cursor, etc.) working in this repo. It describes the architecture, conventions, and common task patterns so the agent can contribute without asking the same orientation questions every session.

---

## What this project is

A Chrome MV3 content-script extension that injects a floating panel into the Ukrposhta international-shipment "add" form (`ok.ukrposhta.ua/.../international/add/`). The panel lets an operator paste a free-form recipient text block and click **«Заповнити»** — the extension parses the text, resolves fields, and writes values into the AngularJS-driven native form without submitting it.

The user always clicks Ukrposhta's own submit button themselves.

---

## Repo layout

```
extension/                  ← git root (this folder)
├── src/
│   ├── content/            ← MV3 entry point (content/index.ts)
│   ├── parser/             ← free-form text → ParsedRecipient
│   │   └── stages/         ← one file per parsing stage
│   ├── filler/             ← DOM writer: fills AngularJS inputs
│   ├── config/             ← chrome.storage API (types + defaults.ts)
│   ├── ui/                 ← panel, modal, banner, mountManager, scrapeOptions
│   ├── i18n/               ← uk.ts — ALL user-visible Ukrainian strings
│   └── data/               ← bundled static data (ISO-3166, US states, dial codes, …)
├── tests/
│   ├── parser/             ← Vitest specs for every parser stage + integration
│   ├── config/             ← Storage layer tests (chrome mock)
│   └── filler/             ← DOM writer tests (happy-dom)
├── _locales/uk/            ← Chrome extension locale (messages.json)
├── manifest.json           ← MV3 manifest (version lives here AND in package.json)
├── vite.config.ts          ← build config (@crxjs/vite-plugin)
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

The workspace parent (`../`) contains:
- `openspec/` — change proposals, specs, design docs, task lists (not bundled)
- `Міжнародні відправлення додати _ УКРПОШТА.html` — saved page snapshot used as dev fixture (read-only, never modified by build steps)

---

## Build & dev

```bash
npm install          # once
npm run build        # production build → dist/
npm run dev          # watch mode (rebuilds dist/ on save)
npm test             # run all Vitest specs
npm run typecheck    # tsc --noEmit
```

Load unpacked: Chrome → `chrome://extensions/` → Developer mode → Load unpacked → select `dist/`.

---

## Architecture walkthrough

### 1. Bootstrap (`content/index.ts`)

1. Guards on URL regex — exits immediately if not on a matching page.
2. `waitForForm()` — polls `#recv-fullname, #country-native` via `MutationObserver` (max 30 s).
3. `installMount()` — mounts the panel and sets up a `MutationObserver` to re-mount if the panel node is removed by Angular's DOM rewriting.
4. `getDefaults()` — loads saved settings from `chrome.storage.sync` (with local fallback).
5. `onDefaultsChanged()` — subscribes to cross-tab live sync; refreshes the panel summary chip row on every change.

### 2. Parser pipeline (`parser/`)

`parse(input)` runs stages **in order** — each stage consumes what it recognises from a `work` string and returns the remainder:

| File | What it extracts |
|---|---|
| `stages/email.ts` | `xxx@yyy.zz` |
| `stages/phone.ts` | phone number (various formats) |
| `stages/country.ts` | `Country:` label / bare alpha-2 / country name (ISO-3166 dict) |
| `stages/postcode.ts` | postal code matched against per-country regex |
| `stages/state.ts` | US state (full name or 2-letter abbrev) |
| `stages/streetCity.ts` | street line (house number + street-type word) + optional apt line + city from postcode line |
| `stages/name.ts` | remaining letters-only token(s) |
| `stages/phoneDialCode.ts` | post-parse: prepend dial code if phone has no `+` and country is known |

`casing.ts` / `titleCase()` — handles Mc…, Mac…, O'…, hyphenated names, and `de/la/van/von/…` prefixes.

**Adding a new parser stage**: create `stages/newField.ts` exporting a `Stage` function, import and call it in `parse.ts`, add the field key to `RecipientFieldKey` in `parser/types.ts`.

### 3. DOM filler (`filler/`)

The form is rendered by AngularJS 1.x. React-style `value=` assignment does **not** trigger Angular's `$watch`. The correct pattern is in `setValue.ts` → `setNativeValue()`:

```typescript
// Correct — triggers Angular reactivity
Object.getOwnPropertyDescriptor(el.__proto__, 'value')?.set?.call(el, value);
el.dispatchEvent(new Event('input', { bubbles: true }));
el.dispatchEvent(new Event('change', { bubbles: true }));
```

**`fillRecipient(parsed)`** — iterates `RECIPIENT_SELECTORS` (in `selectors.ts`), finds the first visible element for each selector, calls `setNativeValue`.

**`fillCategory(defaults)`** — fills the category `<select>`.

**`fillParcelItems(defaults)`** — iterates parcel item rows found by `findParcelRows()`. Respects `parcelFillMode: "FIRST_ONLY" | "ALL_ROWS"`. Includes HS-code auto-select: after writing the text it dispatches `keyup` and waits up to 4 s for `[ng-click*="selectHsCode"]` to appear, then clicks the first item.

**`fillShipmentDimensions(defaults)`** — fills weight / width / length / height from `DIMENSION_SELECTORS`.

**`firstVisible(selector)`** — among all elements matching a selector, returns the first one that is not `hidden` and has a non-null `offsetParent` (i.e., is rendered and visible).

**Adding a new fillable recipient field**:
1. Add the key to `FieldKey` in `filler/types.ts` and `RecipientFieldKey` in `parser/types.ts`.
2. Add a selector entry to `RECIPIENT_SELECTORS` in `selectors.ts`.
3. Add a label to `STRINGS.fieldLabels` in `i18n/uk.ts`.
4. Add a parser stage or extend an existing one.

**Adding a new parcel-item field**:
1. Add the field name to `ParcelItemField` in `filler/parcelRows.ts` and its CSS selector to `FIELD_SELECTORS`.
2. Add the field name to `FieldKey` in `filler/types.ts`.
3. Add the field to `Defaults` and `FIRST_RUN_DEFAULTS` in `config/types.ts`.
4. Add a `FIELD_MAP` entry and include it in `PARCEL_FIELD_ORDER` in `fillParcelItems.ts`.
5. Add a label string to `STRINGS.fieldLabels` in `i18n/uk.ts`.
6. Add the UI input to the modal in `ui/modal.ts` (read the value in the `saveBtn.onclick` handler).
7. Add a summary chip to `refreshSummary()` in `ui/panel.ts`.

**Adding a new shipment dimension**:
1. Add the key to `DimensionSelector` union in `selectors.ts` and add an entry to `DIMENSION_SELECTORS`.
2. Add the field to `Defaults` + `FIRST_RUN_DEFAULTS` in `config/types.ts`.
3. Add an entry to `DIMENSION_DEFAULTS_MAP` in `fillParcelItems.ts`.
4. Mirror the UI changes in the modal dimensions section and `refreshSummary()`.

### 4. Config / storage (`config/`)

`getDefaults()` tries `chrome.storage.sync` first, falls back to `chrome.storage.local`. Values are stored under the key `"ukrposhtaIntlDefaults"`.

`normalize()` merges persisted data with `FIRST_RUN_DEFAULTS` so new fields added in later versions get their defaults automatically. When adding a new `Defaults` field, always add it to `FIRST_RUN_DEFAULTS` with a sensible default value.

`onDefaultsChanged()` attaches a `chrome.storage.onChanged` listener and calls the handler whenever settings change in any tab — enabling live sync without reload.

### 5. UI (`ui/`)

| File | Responsibility |
|---|---|
| `mountManager.ts` | `installMount()` — creates the panel, re-creates it if Angular removes it |
| `panel.ts` | The floating side-panel DOM (textarea, summary chips, Fill / Edit buttons, collapse chevron) |
| `modal.ts` | Settings edit dialog (category, value, currency, quantity, HS code, itemWeight, countryOfOrigin, parcelFillMode, dimensions) |
| `banner.ts` | Result banner (green/yellow/red, lists filled/skipped/failed fields) |
| `scrapeOptions.ts` | Reads live `<select>` options from the native form for category, currency, countryOfOrigin; falls back to hardcoded lists |
| `consoleLog.ts` | `logInfo / logWarn / logError` prefixed with `[Укрпошта Filler]` |
| `styles.css` | All extension UI styles — BEM-ish `upx-` prefix |

All CSS classes use the `upx-` prefix to avoid conflicts with the host page.

### 6. Strings (`i18n/uk.ts`)

**All user-visible strings live here.** Never hardcode Ukrainian text outside this file. Reference via `STRINGS.<section>.<key>`.

---

## Conventions

- **TypeScript strict** — `noImplicitAny`, `strictNullChecks`. No `as any`. Use typed narrowing.
- **No frameworks** — vanilla DOM only. No React, Vue, or Angular in the extension code.
- **No global side-effects at import time** — modules export pure functions; side-effects happen inside `main()` or explicit calls.
- **AngularJS DOM writes always go through `setNativeValue()`** — direct `.value =` assignment silently fails.
- **Version is tracked in two places** — `manifest.json` and `package.json`. Keep them in sync.
- **Strings in Ukrainian** — all user-facing text in `i18n/uk.ts`; English only in code comments and this file.
- **`FieldResult.silent = true`** — use when a field result should not appear in the banner (e.g., auto-resolved optional fields).

---

## Release process

1. Bump version in `manifest.json` and `package.json` (keep them identical).
2. Update `CHANGELOG` section in `release/ukrposhta-intl-filler-vX.Y.Z/README.md`.
3. `npm run build` — outputs to `dist/`.
4. Copy `dist/` to `release/ukrposhta-intl-filler-vX.Y.Z/`, remove `*.map` files, copy README.
5. `zip -r release/ukrposhta-intl-filler-vX.Y.Z.zip release/ukrposhta-intl-filler-vX.Y.Z/`
6. Send the zip to the user.

`release/` is in `.gitignore` — built artifacts are not committed.

---

## Key gotchas

- **AngularJS reactivity**: `setNativeValue` must dispatch both `input` and `change` events with `bubbles: true`. Missing either causes `$watch` not to fire and the field appears empty to the backend.
- **SPA navigation**: Ukrposhta uses AngularJS routing. Navigating to the form via the SPA menu (not a full reload) may not re-inject the content script. The user must reload the tab. `installMount`'s `MutationObserver` handles the panel being removed and re-added within the same page lifetime, but cannot re-run the content script.
- **HS Code typeahead**: the input calls `searchHsCode()` on keyup. The extension dispatches `keyup` after writing the value and waits 4 s for a `[ng-click*="selectHsCode"]` item to appear, then clicks it. If the API is slow or the search returns no results, the click is skipped — the user sees the text pre-filled but must select manually.
- **`firstVisible()`**: the page sometimes has duplicate hidden selectors for legacy/new form variants. Always use `firstVisible()` rather than `querySelector()` to avoid writing to hidden inputs.
- **`scrapeOptions`**: modal dropdowns (category, currency, countryOfOrigin) are populated by reading the live page `<select>` elements. If the page is not fully loaded when the modal opens, it falls back to hardcoded lists and shows a warning banner in the modal.
- **Storage quota**: `chrome.storage.sync` has a 100 KB total quota and 8 KB per-item limit. The `Defaults` object is tiny; this is not a concern in practice but keep fields small (strings/numbers, not large blobs).
