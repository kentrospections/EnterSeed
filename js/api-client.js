/** Route API calls to the configured backend and attach a short-lived session token. */
const deployment = window.EnterseedDeployment || { apiBaseUrl: "" };
const configuredApiBaseUrl = String(deployment.apiBaseUrl || "").replace(/\/+$/, "");
const sessionStorageKey = "enterseed-api-session";

function readSessionToken() {
  try {
    return localStorage.getItem(sessionStorageKey) || window.sessionStorage.getItem(sessionStorageKey) || "";
  } catch (error) {
    console.warn("The account session could not be read from this browser.", error);
    return "";
  }
}

function saveSessionToken(token, rememberMe = false) {
  if (!token) {
    if (configuredApiBaseUrl && new URL(configuredApiBaseUrl).origin !== location.origin) {
      throw new Error("The account service did not return a sign-in token for this website. Check its allowed website origins.");
    }
    return;
  }
  try {
    localStorage.removeItem(sessionStorageKey);
    sessionStorage.removeItem(sessionStorageKey);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(sessionStorageKey, token);
  } catch (error) {
    console.error("The account session could not be saved in this browser.", error);
    throw new Error("Your browser could not save the sign-in session. Check its storage settings and try again.");
  }
}

function clearSessionToken() {
  try {
    localStorage.removeItem(sessionStorageKey);
    sessionStorage.removeItem(sessionStorageKey);
  } catch (error) {
    console.warn("The account session could not be cleared from this browser.", error);
  }
}

function apiUrl(path) {
  const apiPath = String(path);
  if (!apiPath.startsWith("/api/")) throw new Error("API requests must use an /api/ path.");
  return configuredApiBaseUrl ? `${configuredApiBaseUrl}${apiPath}` : apiPath;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = readSessionToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  const isCrossOrigin = Boolean(configuredApiBaseUrl)
    && new URL(configuredApiBaseUrl).origin !== location.origin;
  return fetch(apiUrl(path), {
    ...options,
    headers,
    ...(isCrossOrigin ? { credentials: "omit" } : {})
  });
}

window.EnterseedApi = Object.freeze({
  apiUrl,
  clearSessionToken,
  request,
  saveSessionToken
});
