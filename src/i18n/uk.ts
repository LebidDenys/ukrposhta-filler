export const STRINGS = {
  panel: {
    title: "Заповнювач Укрпошти",
    textareaPlaceholder:
      "Вставте дані одержувача (ім'я, адреса, місто, штат, індекс, країна, e-mail, телефон) у будь-якому порядку…",
    currentSettingsHeading: "Поточні налаштування",
    fillButton: "Заповнити",
    editConfigButton: "Редагувати налаштування",
    collapseAria: "Згорнути панель",
    expandAria: "Розгорнути панель",
    summary: {
      category: "Категорія",
      value: "Вартість",
      currency: "Валюта",
      quantity: "Кількість",
      hsCode: "Код ТНЗЕД",
      fillMode: "Рядки",
      fillModeFirstOnly: "Рядки: перший",
      fillModeAllRows: "Рядки: усі",
      weight: "Вага",
      width: "Ширина",
      length: "Довжина",
      height: "Висота",
      itemWeight: "Вага вкладання",
      countryOfOrigin: "Країна походження",
      empty: "—",
    },
  },
  modal: {
    title: "Редагувати налаштування",
    categoryLabel: "Категорія відправлення",
    valueLabel: "Вартість вкладення",
    currencyLabel: "Валюта",
    quantityLabel: "Кількість одиниць, шт",
    hsCodeLabel: "Код ТНЗЕД або назва товару",
    parcelFillModeLabel: "Заповнювати рядки вкладень",
    parcelFillModeFirstOnly: "Перший рядок",
    parcelFillModeAllRows: "Усі рядки",
    dimensionsSectionTitle: "Розміри та вага посилки",
    weightLabel: "Вага, г",
    widthLabel: "Ширина, см",
    lengthLabel: "Довжина, см",
    heightLabel: "Висота, см",
    itemWeightLabel: "Вага вкладання без упаковки, г",
    countryOfOriginLabel: "Країна походження вкладання",
    saveButton: "Зберегти",
    cancelButton: "Скасувати",
    closeAria: "Закрити",
    nativeOptionsMissingWarning:
      "Не вдалося прочитати список опцій зі сторінки — використовуються стандартні значення.",
    emptyOption: "— не вибрано —",
  },
  banner: {
    filledHeading: "Заповнено",
    skippedHeading: "Пропущено",
    failedHeading: "Помилка",
    allFilledMessage: "Усі поля заповнено успішно.",
    dismissAria: "Закрити повідомлення",
    configOnlyNote:
      "Поле введення порожнє — заповнено лише налаштування з конфігурації (категорія та параметри вкладень).",
    configOnlyAllFilledMessage:
      "Налаштування з конфігурації заповнено успішно (поля одержувача пропущено, бо поле введення порожнє).",
  },
  errors: {
    selectorMissing: (fieldLabel: string) =>
      `Поле «${fieldLabel}» не знайдено на сторінці.`,
    selectorMissingOptional: (fieldLabel: string) =>
      `Поле «${fieldLabel}» відсутнє на сторінці — заповнюється автоматично.`,
    writeThrew: (fieldLabel: string, cause: string) =>
      `Не вдалося записати поле «${fieldLabel}»: ${cause}`,
    parcelItemsNoRows:
      "На сторінці не знайдено жодного рядка вкладень (parcelItems). Сторінку, можливо, ще не повністю завантажено.",
    formNotFound: "Форму не знайдено за 30 секунд. Розширення припиняє спроби.",
    storageWriteFailed: (cause: string) =>
      `Не вдалося зберегти налаштування: ${cause}`,
    storageReadFailed: (cause: string) =>
      `Не вдалося прочитати налаштування: ${cause}`,
    skippedByFirstOnly: "Пропущено через режим «Перший рядок».",
    valueAbsent: "Не знайдено у вставленому тексті.",
    valueAbsentInConfig: "Не задано в налаштуваннях.",
    countryNotSupported: (code: string) =>
      `Країну «${code}» не підтримується на цій формі (відсутня в нативному селекторі).`,
  },
  parser: {
    countryNotDetected:
      "Країна: не вдалося визначити країну з тексту (немає мітки «Country:» / «Країна:» і не знайдено назву країни).",
    nameNotDetected:
      "Ім'я: не вдалося визначити ім'я одержувача в тексті.",
    streetNotDetected:
      "Адреса: не вдалося визначити вулицю (рядок із номером будинку + словом street/ave/blvd…).",
    cityNotDetected:
      "Місто: не вдалося визначити місто з рядка з індексом.",
    postcodeNotDetected:
      "Індекс: не вдалося визначити поштовий індекс.",
    valueAbsent: "Не знайдено у вставленому тексті.",
  },
  fieldLabels: {
    country: "Країна",
    name: "Прізвище та Ім'я",
    street: "Адреса",
    city: "Населений пункт",
    region: "Регіон/Штат",
    postcode: "Індекс",
    email: "E-mail",
    phoneDialCode: "Код країни (телефон)",
    phone: "Телефон",
    category: "Категорія відправлення",
    parcelValue: "Вартість вкладення",
    parcelQuantity: "Кількість одиниць",
    parcelCurrency: "Валюта",
    parcelHsCode: "Код ТНЗЕД",
    weight: "Вага, г",
    width: "Ширина, см",
    length: "Довжина, см",
    height: "Висота, см",
    parcelItemWeight: "Вага вкладання без упаковки, г",
    parcelCountryOfOrigin: "Країна походження вкладання",
  },
  console: {
    prefix: "[Укрпошта Filler]",
  },
} as const;

export type Strings = typeof STRINGS;
