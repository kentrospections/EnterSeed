/** Language selector and compatibility layer for existing English-text pages. */
const originalText = new WeakMap();
const languageStorageKey = "enterseed-language";
const originalTitle = document.title;
let activeLanguage = "en";

const languageToggle = document.createElement("button");
languageToggle.className = "language-toggle";
languageToggle.type = "button";
languageToggle.setAttribute("aria-expanded", "false");
languageToggle.setAttribute("aria-haspopup", "listbox");
languageToggle.setAttribute("aria-label", "Select language");
const languageCurrent = document.createElement("span");
languageCurrent.className = "language-current";
languageToggle.append(languageCurrent, document.createTextNode("⌄"));

const languageMenu = document.createElement("div");
languageMenu.className = "language-menu";
languageMenu.setAttribute("role", "listbox");
languageMenu.setAttribute("aria-label", "Language");
languageMenu.hidden = true;

const languagePicker = document.createElement("div");
languagePicker.className = "language-picker";
languagePicker.dataset.noTranslate = "true";
languagePicker.append(languageToggle, languageMenu);
const languageStatus = document.createElement("span");
languageStatus.className = "sr-only";
languageStatus.setAttribute("role", "status");
languageStatus.setAttribute("aria-live", "polite");
languagePicker.append(languageStatus);

for (const [code, key] of [["en", "english"], ["fil", "filipino"], ["hil", "hiligaynon"]]) {
  const option = document.createElement("button");
  option.className = "language-option";
  option.type = "button";
  option.dataset.language = code;
  option.dataset.i18n = `common.${key}`;
  option.setAttribute("role", "option");
  languageMenu.append(option);
}

const languageHeaderInner = document.querySelector(".site-header .header-inner");
function attachLanguagePicker(container) {
  if (!container) return;
  const existingPicker = container.querySelector(".language-picker");
  if (existingPicker && existingPicker !== languagePicker) existingPicker.remove();
  if (languagePicker.parentElement !== container) container.append(languagePicker);
  updateLanguageUi();
}

if (languageHeaderInner && !languageHeaderInner.querySelector(".language-picker")) {
  const actions = languageHeaderInner.querySelector(":scope > .header-actions");
  const headerCta = languageHeaderInner.querySelector(":scope > .header-cta");
  const insertionPoint = actions || headerCta;
  if (insertionPoint) languageHeaderInner.insertBefore(languagePicker, insertionPoint);
  else languageHeaderInner.append(languagePicker);
}

function translateLegacyText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("[data-no-translate],[data-i18n],script,style,noscript")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while ((node = walker.nextNode())) {
    const english = originalText.get(node) ?? node.data;
    if (!originalText.has(node)) originalText.set(node, english);
    const leading = english.match(/^\s*/)?.[0] ?? "";
    const trailing = english.match(/\s*$/)?.[0] ?? "";
    const text = english.trim();
    node.data = `${leading}${window.EnterseedI18n.legacy(text)}${trailing}`;
  }
}

function translateLegacyAttributes(root) {
  const elements = [];
  if (root instanceof HTMLElement) elements.push(root);
  elements.push(...root.querySelectorAll("[placeholder],[aria-label],[title]"));
  for (const element of elements) {
    if (element.closest("[data-no-translate],[data-i18n]")) continue;
    for (const attribute of ["placeholder", "aria-label", "title"]) {
      const value = element.getAttribute(attribute);
      if (value === null) continue;
      const originalAttribute = `data-language-original-${attribute}`;
      if (!element.hasAttribute(originalAttribute)) element.setAttribute(originalAttribute, value);
      element.setAttribute(originalAttribute, element.getAttribute(originalAttribute));
      element.setAttribute(attribute, window.EnterseedI18n.legacy(element.getAttribute(originalAttribute)));
    }
  }
}

function updateLanguageUi() {
  languageCurrent.textContent = activeLanguage.toUpperCase();
  languageToggle.setAttribute("aria-label", activeLanguage === "fil" ? "Pumili ng wika" : activeLanguage === "hil" ? "Magpili sang lenguahe" : "Select language");
  languageMenu.setAttribute("aria-label", activeLanguage === "fil" ? "Wika" : activeLanguage === "hil" ? "Lenguahe" : "Language");
  languageMenu.querySelectorAll("[role=option]").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.language === activeLanguage));
  });
}

async function setLanguage(language) {
  languageStatus.textContent = "";
  activeLanguage = await window.EnterseedI18n.setLocale(language);
  window.EnterseedI18n.apply();
  translateLegacyText(document.body);
  translateLegacyAttributes(document.body);
  document.title = window.EnterseedI18n.legacy(originalTitle);
  updateLanguageUi();
  try {
    localStorage.setItem(languageStorageKey, activeLanguage === "fil" ? "fil" : "en");
    localStorage.setItem("enterseed-language-preference", activeLanguage);
  } catch (error) {
    console.warn("Language preference could not be saved.", error);
  }
  if (window.EnterseedAccount) {
    try {
      const response = await fetch("/api/auth/language", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ language: activeLanguage })
      });
      if (!response.ok) throw new Error("The language preference could not be saved to your account.");
    } catch (error) {
      console.error("Language preference update failed.", error);
      languageStatus.textContent = "The language changed on this device but could not be saved to your account.";
    }
  }
}

languageToggle.addEventListener("click", () => {
  const expanded = languageToggle.getAttribute("aria-expanded") === "true";
  languageToggle.setAttribute("aria-expanded", String(!expanded));
  languageMenu.hidden = expanded;
});

languageMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-language]");
  if (!option) return;
  languageMenu.hidden = true;
  languageToggle.setAttribute("aria-expanded", "false");
  void setLanguage(option.dataset.language);
  languageToggle.focus();
});

document.addEventListener("pointerdown", (event) => {
  if (!languagePicker.contains(event.target)) {
    languageMenu.hidden = true;
    languageToggle.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !languageMenu.hidden) {
    languageMenu.hidden = true;
    languageToggle.setAttribute("aria-expanded", "false");
    languageToggle.focus();
  }
});

const languageObserver = new MutationObserver((records) => {
  for (const record of records) {
    if (record.type === "childList") {
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement || node instanceof DocumentFragment) {
          translateLegacyText(node);
          translateLegacyAttributes(node);
        } else if (node instanceof Text && activeLanguage !== "en") {
          const english = node.data;
          const trimmed = english.trim();
          const translation = window.EnterseedI18n.legacy(trimmed);
          if (translation !== trimmed) {
            originalText.set(node, english);
            node.data = `${english.match(/^\s*/)?.[0] ?? ""}${translation}${english.match(/\s*$/)?.[0] ?? ""}`;
          }
        }
      });
    }
  }
});

window.EnterseedI18n.ready.then(() => {
  activeLanguage = window.EnterseedI18n.current;
  window.EnterseedI18n.apply();
  translateLegacyText(document.body);
  translateLegacyAttributes(document.body);
  document.title = window.EnterseedI18n.legacy(originalTitle);
  updateLanguageUi();
  languageObserver.observe(document.body, { childList: true, subtree: true });
});

document.addEventListener("enterseed:languagechange", (event) => {
  activeLanguage = event.detail.language;
  window.EnterseedI18n.apply();
  translateLegacyText(document.body);
  translateLegacyAttributes(document.body);
  document.title = window.EnterseedI18n.legacy(originalTitle);
  updateLanguageUi();
});

window.EnterseedLanguage = Object.freeze({
  get current() { return activeLanguage; },
  set: setLanguage,
  attachTo: attachLanguagePicker
});
