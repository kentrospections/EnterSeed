/** Submit credentials to the same-origin auth API and collect the first-login language. */
const authForms = document.querySelectorAll("form[data-auth-mode]");
const languageModal = document.querySelector("#language-modal");
const languageOptions = [...document.querySelectorAll("[data-auth-language]")];
let selectedLanguage = "en";

function showAuthStatus(form, message, type = "error") {
  const status = document.getElementById(form.dataset.statusId);
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("is-error", type === "error");
  status.classList.toggle("is-success", type === "success");
}

async function submitJson(url, method, data) {
  let response;
  try {
    response = await fetch(url, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error("Authentication request could not reach the server.", error);
    throw new Error("Could not reach the account service. Make sure the Enterseed server is running, then try again.");
  }

  const body = await response.text();
  if (!body.trim()) {
    throw new Error(`The account service returned an empty response (HTTP ${response.status}). Please restart the Enterseed server and try again.`);
  }
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`The account service returned an unexpected response (HTTP ${response.status}). Open the site through the Enterseed server, not a static file preview.`);
  }

  let result;
  try {
    result = JSON.parse(body);
  } catch (error) {
    console.error("Authentication service returned malformed JSON.", error);
    throw new Error("The account service returned invalid data. Please restart the Enterseed server and try again.");
  }
  if (!response.ok) throw new Error(result.error || `The account request failed (HTTP ${response.status}).`);
  return result;
}

function openLanguagePrompt(form) {
  if (!languageModal) {
    showAuthStatus(form, "Your account is signed in, but language setup is unavailable on this page.");
    return;
  }
  selectedLanguage = "en";
  languageOptions.forEach((option) => {
    const isSelected = option.dataset.authLanguage === selectedLanguage;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });
  languageModal.hidden = false;
  document.body.classList.add("modal-open");
  languageModal.querySelector("[data-save-language]")?.focus();
}

function goToDashboard() {
  const requestedPage = new URLSearchParams(location.search).get("next") || "/dashboard";
  const target = new URL(requestedPage, location.origin);
  const allowedRoutes = new Set([
    "/dashboard", "/dashboard.html",
    "/finance", "/finance.html",
    "/marketing", "/marketing.html",
    "/documents", "/documents.html",
    "/boss-nana", "/boss-nana.html"
  ]);
  const safePath = target.origin === location.origin && allowedRoutes.has(target.pathname)
    ? `${target.pathname}${target.search}${target.hash}`
    : "/dashboard";
  window.location.assign(safePath);
}

languageOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedLanguage = option.dataset.authLanguage;
    languageOptions.forEach((candidate) => {
      const isSelected = candidate === option;
      candidate.classList.toggle("is-selected", isSelected);
      candidate.setAttribute("aria-pressed", String(isSelected));
    });
  });
});

languageModal?.querySelector("[data-save-language]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await submitJson("/api/auth/language", "PATCH", { language: selectedLanguage });
    try {
      localStorage.setItem("enterseed-language", selectedLanguage === "fil" ? "fil" : "en");
      localStorage.setItem("enterseed-language-preference", selectedLanguage);
    } catch (error) {
      console.warn("Language preference could not be saved in this browser.", error);
    }
    if (selectedLanguage === "hil") {
      const note = languageModal.querySelector("[data-language-note]");
      if (note) note.textContent = "Hiligaynon is saved as your preference. Some screens are currently available in English.";
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
    }
    goToDashboard();
  } catch (error) {
    const note = languageModal.querySelector("[data-language-note]");
    if (note) note.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

authForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const isRegistration = form.dataset.authMode === "register";
    const endpoint = isRegistration ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegistration
      ? {
          firstName: String(formData.get("firstName") || "").trim(),
          lastName: String(formData.get("lastName") || "").trim(),
          business: String(formData.get("business") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          password: String(formData.get("password") || ""),
          agree: formData.get("agree") === "on"
        }
      : {
          email: String(formData.get("email") || "").trim(),
          password: String(formData.get("password") || "")
        };
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showAuthStatus(form, isRegistration ? "Creating your account…" : "Signing you in…", "success");

    try {
      const result = await submitJson(endpoint, "POST", payload);
      if (result.needsLanguageSelection) {
        openLanguagePrompt(form);
        return;
      }
      try {
        if (result.user?.preferredLanguage) {
          localStorage.setItem("enterseed-language", result.user.preferredLanguage === "fil" ? "fil" : "en");
          localStorage.setItem("enterseed-language-preference", result.user.preferredLanguage);
        }
      } catch (error) {
        console.warn("Language preference could not be loaded in this browser.", error);
      }
      goToDashboard();
    } catch (error) {
      showAuthStatus(form, error.message);
    } finally {
      submitButton.disabled = false;
    }
  });
});
