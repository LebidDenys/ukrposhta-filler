# Заповнювач Укрпошти (Міжнародні відправлення)

> **UA** Chrome-розширення (Manifest V3) для сторінки «Міжнародні відправлення → додати» в особистому кабінеті Укрпошти. Дозволяє вставити дані одержувача одним блоком тексту в довільній формі, налаштувати персональні значення для метаданих посилки (категорія, валюта, вартість, кількість, код ТНЗЕД, режим заповнення рядків) — і заповнити нативну форму одним натисканням. **Користувач завжди натискає «Submit» вручну.**
>
> **EN** Chrome MV3 extension for the Ukrposhta international-shipment "add" page. Paste a free-form recipient block, set persistent parcel defaults once, fill the native form with one click. The user always clicks Ukrposhta's native submit button themselves.

## URLs the extension works on

- `https://ok.ukrposhta.ua/ua/lk/international/add/*`
- `https://ok.ukrposhta.ua/ua/lk_old/international/add/*`

The extension does NOT activate on any other Ukrposhta page.

## Install (developer)

All commands below run **from the `extension/` directory** (this is the extension project root; the parent directory holds OpenSpec docs and the dev fixture):

```bash
cd extension
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions/`.
2. Toggle **Developer mode** ON (top right).
3. Click **Load unpacked**.
4. Select the `extension/dist/` folder produced by `npm run build`.
5. Open one of the matching URLs above — the panel appears in the top-right corner of the page.

Watch mode for development: `npm run dev` (Vite rebuilds `extension/dist/` on every save; click "Reload" on the extension card in `chrome://extensions/` to pick up changes).

## Quick start

1. Click **«Редагувати налаштування»** on the panel.
2. Fill in your usual values: category, declared value + currency, quantity, HS code, parcel fill mode (`«Перший рядок»` / `«Усі рядки»`).
3. Click **«Зберегти»**. Values persist across reloads and devices (via `chrome.storage.sync`).
4. Paste a recipient block into the main textarea. Example:

   ```
   john doe
   2726 12th street
   moline, illinois 61265
   Country: US
   ```

5. Click **«Заповнити»**. The native Ukrposhta inputs are filled. Review, then click Ukrposhta's submit button.

## Forgiving text parser — what it accepts

The parser is order-agnostic and label-agnostic. It extracts in stages:

| Stage | What it looks for |
|---|---|
| Email | `xxx@yyy.zz` anywhere in the text |
| Phone | `+`-prefixed, parens-style `(123) 456-7890`, dash/dot-separated; ≥7 digits when stripped |
| Country | `Country: US`, `Country - United States`, `Країна: …`, bare alpha-2 token, or any country name from the bundled ISO-3166 dictionary |
| Postal code | Country-aware regex (US `\d{5}(-\d{4})?`, UK alphanumeric, …) with `\b\d{4,10}\b` fallback |
| US state | Full state name OR 2-letter abbreviation; normalised to canonical full name (`il` / `IL` / `illinois` → `Illinois`) |
| Street | Line with leading number + street-type word (`street`, `ave`, `blvd`, …); multi-line streets joined with `, ` |
| City | Left of the first comma on the postcode line |
| Name | Remaining letters-only block, Title Cased (handles `O'Brien`, `McDonald`, prefixes `De/La/Van/Von`) |
| Dial code prefixing | If country is known and phone has no `+`, prepend the dial code (`+1`, `+44`, …) |

If a field can't be detected, the result banner shows a yellow warning explaining what was missed. The country field is never guessed.

## Dev fixture

The workspace contains a saved snapshot of the live page **one level up** from `extension/`:

- `../Міжнародні відправлення додати _ УКРПОШТА.html`
- `../Міжнародні відправлення додати _ УКРПОШТА_files/`

These are read-only development references — never modified by any build step, never bundled into `dist/`. The selectors used by the form filler were derived from this file.

## Project layout

Workspace (one level up from this README):

```
skup/
  extension/                  # ← extension project root (this folder)
  openspec/                   # change proposal + spec + design + tasks
  Міжнародні відправлення додати _ УКРПОШТА.html       # dev fixture (read-only)
  Міжнародні відправлення додати _ УКРПОШТА_files/     # dev fixture assets (read-only)
```

Inside `extension/`:

```
src/
  content/    # MV3 content-script entry + bootstrap
  parser/     # Free-form text → ParsedRecipient (stages + orchestrator)
  filler/     # AngularJS-safe DOM writer + selector map
  config/     # chrome.storage.sync (+ local fallback) defaults API
  ui/         # Panel, edit-config modal, result banner, styles
  i18n/       # Ukrainian strings dictionary (uk.ts)
  data/       # Bundled ISO-3166, US states, dial codes, postal regex, street words
tests/
  parser/     # Vitest specs for every parser stage + integration
  config/     # Storage layer (chrome mock)
  filler/     # DOM writer (happy-dom)
manifest.json
vite.config.ts
vitest.config.ts
tsconfig.json
package.json
_locales/uk/messages.json
```

## Known caveats

- **HS Code typeahead**: the native HS-code input is an autocomplete that fires `searchHsCode()` on every keystroke. The extension fills the text and dispatches `input`; it does NOT auto-pick from the dropdown. If Ukrposhta's backend rejects the value because it wasn't selected from the suggestion list, click the suggestion manually after the fill.
- **Phone dial code on country typo**: if the country line is wrong (e.g. you typed `Country: GB` for a US number with no `+`), the extension will prepend `+44`. The banner shows what was written so you can spot mistakes before submitting. To bypass dial-code prefixing, write the phone with a `+` prefix yourself.
- **No background service worker**: all logic lives in the content script + `chrome.storage`. Permissions requested are limited to `storage`; no `host_permissions` beyond the two URL matches.
- **SPA `pushState` navigation**: if you arrive on the form via a client-side route change (not a full page load), the content script may not be injected — reload the page in that case.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Persist parcel defaults across reloads and devices |
| `host_permissions` for the two URL matches | Only via `content_scripts.matches` — no broader site access |

No `tabs`, `webRequest`, `scripting`, or background permissions.

## What the extension does NOT do

- It never submits the form for you.
- It never reads or persists recipient PII (name, address, email, phone) — that text lives only in the panel textarea for the page's lifetime.
- It never auto-picks an HS code suggestion (text only — see caveats).
- It does not touch any Ukrposhta page other than the two `international/add/*` paths.
