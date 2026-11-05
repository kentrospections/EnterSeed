/** Boss Narra page language modal backed by the shared locale catalogs. */
const languageModal = document.querySelector("#language-modal");
const openLanguageButton = document.querySelector("#open-language-modal");
const continueLanguageButton = document.querySelector("#continue-language");
const languageChoices = document.querySelectorAll(".language-choice");
const storageKey = "boss-nana-language";
const modalSeenKey = "boss-nana-language-modal-seen";
let selectedLanguage = "en";

function readStorage(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch (error) {
    console.warn("Language preference could not be loaded.", error);
    return fallback;
  }
}

function showLanguageModal() {
  if (!languageModal) return;
  languageModal.hidden = false;
  languageModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  languageModal.querySelector(".language-choice.is-selected")?.focus();
}

function hideLanguageModal() {
  if (!languageModal) return;
  languageModal.hidden = true;
  languageModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function setSelectedLanguage(language) {
  selectedLanguage = ["en", "fil", "hil"].includes(language) ? language : "en";
  languageChoices.forEach((choice) => {
    const isSelected = choice.dataset.language === selectedLanguage;
    choice.classList.toggle("is-selected", isSelected);
    choice.setAttribute("aria-pressed", String(isSelected));
  });
  void window.EnterseedI18n.setLocale(selectedLanguage);
}

openLanguageButton?.addEventListener("click", showLanguageModal);

continueLanguageButton?.addEventListener("click", async () => {
  continueLanguageButton.disabled = true;
  const status = languageModal.querySelector("#language-status");
  try {
    await window.EnterseedI18n.setLocale(selectedLanguage);
    if (window.EnterseedAccount) {
      const response = await window.EnterseedApi.request("/api/auth/language", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ language: selectedLanguage })
      });
      if (!response.ok) throw new Error("The language preference could not be saved to your account.");
    }
    try {
      localStorage.setItem(storageKey, selectedLanguage);
      localStorage.setItem(modalSeenKey, "true");
      localStorage.setItem("enterseed-language-preference", selectedLanguage);
      localStorage.setItem("enterseed-language", selectedLanguage === "fil" ? "fil" : "en");
    } catch (error) {
      console.warn("Language preference could not be saved in this browser.", error);
    }
    hideLanguageModal();
  } catch (error) {
    if (status) status.textContent = error.message;
  } finally {
    continueLanguageButton.disabled = false;
  }
});

languageChoices.forEach((choice) => {
  choice.addEventListener("click", () => setSelectedLanguage(choice.dataset.language));
});

languageModal?.addEventListener("click", (event) => {
  if (event.target === languageModal) hideLanguageModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && languageModal && !languageModal.hidden) hideLanguageModal();
});

window.EnterseedI18n.ready.then(() => {
  selectedLanguage = window.EnterseedI18n.current;
  languageChoices.forEach((choice) => {
    const selected = choice.dataset.language === selectedLanguage;
    choice.classList.toggle("is-selected", selected);
    choice.setAttribute("aria-pressed", String(selected));
  });
  window.EnterseedI18n.apply();
  if (!readStorage(modalSeenKey, "")) showLanguageModal();
});

document.addEventListener("enterseed:languagechange", (event) => {
  selectedLanguage = event.detail.language;
  languageChoices.forEach((choice) => {
    const selected = choice.dataset.language === selectedLanguage;
    choice.classList.toggle("is-selected", selected);
    choice.setAttribute("aria-pressed", String(selected));
  });
});
