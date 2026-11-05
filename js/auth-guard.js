/** Keep the portal UI behind the same-origin authenticated session. */
async function guardAuthenticatedPage() {
  try {
    const response = await window.EnterseedApi.request("/api/auth/me", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    if (response.status === 401) {
      const returnTo = `${location.pathname.split("/").pop() || "dashboard.html"}${location.search}${location.hash}`;
      location.replace(`login.html?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (!response.ok) throw new Error("Session verification is temporarily unavailable.");
    const { user } = await response.json();
    window.EnterseedAccount = Object.freeze(user);
    if (["en", "fil", "hil"].includes(user.preferredLanguage)) {
      try {
        await window.EnterseedI18n.ready;
        localStorage.setItem("enterseed-language-preference", user.preferredLanguage);
        localStorage.setItem("enterseed-language", user.preferredLanguage === "fil" ? "fil" : "en");
        if (window.EnterseedI18n.current !== user.preferredLanguage) {
          await window.EnterseedI18n.setLocale(user.preferredLanguage);
        }
      } catch (error) {
        console.error("Saved language preference could not be applied.", error);
      }
    }
    window.EnterseedAppShell.mount(user);
    document.documentElement.classList.remove("auth-pending");
    return true;
  } catch (error) {
    console.error("Authentication check failed.", error);
    document.body.replaceChildren();
    document.body.classList.add("auth-error-body");
    const notice = document.createElement("main");
    notice.className = "auth-error-panel";
    const heading = document.createElement("h1");
    heading.textContent = "We couldn’t verify your session";
    const message = document.createElement("p");
    message.textContent = "Please check your connection and sign in again to continue.";
    const link = document.createElement("a");
    link.className = "button button-dark";
    link.href = "login.html";
    link.textContent = "Go to log in";
    notice.append(heading, message, link);
    document.body.append(notice);
    document.documentElement.classList.remove("auth-pending");
    return false;
  }
}

window.EnterseedAuthReady = guardAuthenticatedPage();
