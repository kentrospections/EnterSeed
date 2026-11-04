/** Authenticated floating Boss Narra assistant; no business data is sent implicitly. */
function initializeBossNanaWidget() {
const widgetHost = document.createElement("aside");
widgetHost.className = "boss-nana-widget";
widgetHost.dataset.noTranslate = "true";
widgetHost.setAttribute("aria-label", "Boss Narra assistant");

const launcher = document.createElement("button");
launcher.className = "boss-nana-launcher";
launcher.type = "button";
launcher.setAttribute("aria-expanded", "false");
launcher.setAttribute("aria-controls", "boss-nana-panel");
launcher.dataset.i18nLabel = "chatbot.label";
const launcherAvatar = document.createElement("span");
launcherAvatar.className = "boss-nana-avatar";
launcherAvatar.setAttribute("aria-hidden", "true");
launcherAvatar.textContent = "BN";
launcher.append(launcherAvatar);

const panel = document.createElement("section");
panel.className = "boss-nana-panel";
panel.id = "boss-nana-panel";
panel.hidden = true;
panel.setAttribute("aria-labelledby", "boss-nana-name");

const header = document.createElement("header");
header.className = "boss-nana-panel-header";
const identity = document.createElement("div");
identity.className = "boss-nana-identity";
const headerAvatar = launcherAvatar.cloneNode(true);
const identityText = document.createElement("div");
const name = document.createElement("strong");
name.id = "boss-nana-name";
name.dataset.i18n = "chatbot.name";
const status = document.createElement("span");
status.dataset.i18n = "chatbot.status";
identityText.append(name, status);
identity.append(headerAvatar, identityText);
const close = document.createElement("button");
close.className = "boss-nana-close";
close.type = "button";
close.dataset.i18nLabel = "chatbot.close";
close.textContent = "×";
close.textContent = "×";
header.append(identity, close);

const messages = document.createElement("div");
messages.className = "boss-nana-messages";
messages.setAttribute("aria-live", "polite");
messages.setAttribute("aria-relevant", "additions text");
const disclaimer = document.createElement("p");
disclaimer.className = "boss-nana-disclaimer";
disclaimer.dataset.i18n = "chatbot.disclaimer";
const form = document.createElement("form");
form.className = "boss-nana-form";
const input = document.createElement("input");
input.type = "text";
input.name = "question";
input.maxLength = 1200;
input.autocomplete = "off";
input.required = true;
input.dataset.i18nPlaceholder = "chatbot.placeholder";
const send = document.createElement("button");
send.className = "boss-nana-send";
send.type = "submit";
send.dataset.i18n = "chatbot.send";
form.append(input, send);
panel.append(header, messages, disclaimer, form);
widgetHost.append(launcher, panel);
document.body.append(widgetHost);
window.EnterseedI18n.apply(widgetHost);

const conversation = [];
const languageToAssistant = { en: "en", fil: "fil", hil: "hil" };

function appendMessage(text, sender) {
  const message = document.createElement("article");
  message.className = `boss-nana-message ${sender === "user" ? "is-user" : "is-assistant"}`;
  const bubble = document.createElement("p");
  bubble.textContent = text;
  message.append(bubble);
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function appendSources(sources = []) {
  if (!sources.length) return;
  const sourceGroup = document.createElement("div");
  sourceGroup.className = "boss-nana-sources";
  const heading = document.createElement("strong");
  heading.textContent = window.EnterseedI18n.t("chatbot.sources");
  sourceGroup.append(heading);
  sources.forEach((source) => {
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.label;
    sourceGroup.append(link);
  });
  messages.append(sourceGroup);
  messages.scrollTop = messages.scrollHeight;
}

function openWidget() {
  panel.hidden = false;
  launcher.setAttribute("aria-expanded", "true");
  if (!messages.childElementCount) {
    appendMessage(window.EnterseedI18n.t("chatbot.welcome"), "assistant");
    input.focus();
  }
}

function closeWidget() {
  panel.hidden = true;
  launcher.setAttribute("aria-expanded", "false");
  launcher.focus();
}

launcher.addEventListener("click", () => panel.hidden ? openWidget() : closeWidget());
close.addEventListener("click", closeWidget);
document.querySelectorAll("[data-open-boss-nana]").forEach((button) => {
  button.addEventListener("click", openWidget);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const question = input.value.trim();
  if (!question) return;
  const language = languageToAssistant[window.EnterseedI18n.current] || "en";
  appendMessage(question, "user");
  conversation.push({ role: "user", text: question });
  const history = conversation.slice(0, -1).slice(-8);
  input.value = "";
  input.disabled = true;
  send.disabled = true;
  const waiting = appendMessage(window.EnterseedI18n.t("chatbot.waiting"), "assistant");
  try {
    const response = await fetch("/api/boss-nana", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ question, history, language }),
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || window.EnterseedI18n.t("chatbot.unavailable"));
    waiting.querySelector("p").textContent = result.answer;
    conversation.push({ role: "model", text: result.answer });
    appendSources(result.sources);
  } catch (error) {
    waiting.querySelector("p").textContent = error.name === "TimeoutError"
      ? window.EnterseedI18n.t("chatbot.unavailable")
      : error.message || window.EnterseedI18n.t("chatbot.unavailable");
  } finally {
    input.disabled = false;
    send.disabled = false;
    input.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panel.hidden) closeWidget();
});
}

window.EnterseedAuthReady?.then((isAuthenticated) => {
  if (isAuthenticated) initializeBossNanaWidget();
});
