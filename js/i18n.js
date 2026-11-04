/** Shared JSON locale loader with per-key English fallback. */
const supportedLocales = new Set(["en", "fil", "hil"]);
const localeCache = new Map();
const localeStorageKey = "enterseed-language-preference";

function readPreferredLocale() {
  try {
    const stored = localStorage.getItem(localeStorageKey) || localStorage.getItem("enterseed-language");
    return supportedLocales.has(stored) ? stored : "en";
  } catch (error) {
    console.warn("Language preference could not be loaded.", error);
    return "en";
  }
}

async function loadLocale(locale) {
  if (!localeCache.has(locale)) {
    const request = fetch(`locales/${locale}.json`, { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${locale} locale (${response.status}).`);
        return response.json();
      })
      .then((catalog) => {
        if (catalog.locale !== locale || typeof catalog.messages !== "object") {
          throw new Error(`Invalid ${locale} locale catalog.`);
        }
        return catalog;
      });
    localeCache.set(locale, request);
  }
  return localeCache.get(locale);
}

function findMessage(catalog, key) {
  return key.split(".").reduce((value, part) => value?.[part], catalog?.messages);
}

let activeLocale = readPreferredLocale();
let activeCatalog = null;
let englishCatalog = null;

function translate(key, values = {}) {
  const message = findMessage(activeCatalog, key) ?? findMessage(englishCatalog, key) ?? key;
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    message
  );
}

function translateLegacy(englishText) {
  return activeCatalog?.legacy?.[englishText]
    ?? englishCatalog?.legacy?.[englishText]
    ?? englishText;
}

function applyTranslations(root = document) {
  const elements = [];
  if (root instanceof Element && root.matches("[data-i18n],[data-i18n-placeholder],[data-i18n-label]")) {
    elements.push(root);
  }
  if (root.querySelectorAll) {
    elements.push(...root.querySelectorAll("[data-i18n],[data-i18n-placeholder],[data-i18n-label]"));
  }
  for (const element of elements) {
    if (element.dataset.i18n) element.textContent = translate(element.dataset.i18n);
    if (element.dataset.i18nPlaceholder) element.setAttribute("placeholder", translate(element.dataset.i18nPlaceholder));
    if (element.dataset.i18nLabel) element.setAttribute("aria-label", translate(element.dataset.i18nLabel));
  }
}

async function setLocale(locale) {
  const requestedLocale = supportedLocales.has(locale) ? locale : "en";
  try {
    if (!englishCatalog) englishCatalog = await loadLocale("en");
    activeCatalog = requestedLocale === "en" ? englishCatalog : await loadLocale(requestedLocale);
    activeLocale = requestedLocale;
  } catch (error) {
    console.error("Locale catalog could not be loaded; using English fallback.", error);
    if (!englishCatalog) englishCatalog = await loadLocale("en");
    activeCatalog = englishCatalog;
    activeLocale = "en";
  }
  document.documentElement.lang = activeLocale === "fil" ? "fil" : activeLocale;
  applyTranslations();
  document.dispatchEvent(new CustomEvent("enterseed:languagechange", { detail: { language: activeLocale } }));
  return activeLocale;
}

const ready = setLocale(activeLocale);

window.EnterseedI18n = Object.freeze({
  get current() { return activeLocale; },
  ready,
  t: translate,
  legacy: translateLegacy,
  apply: applyTranslations,
  setLocale
});

document.addEventListener("enterseed:languagechange", () => applyTranslations());
