/** Shared site interactions: active navigation, responsive menu, and page routing. */
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

const siteNavItems = [
  { href: "index.html", label: "Home" },
  { href: "boss-nana.html", label: "Boss Narra" },
  { href: "efiling.html", label: "Business tools" },
  { href: "suppliers.html", label: "Supplier Hub" },
  { href: "pricing.html", label: "Pricing" },
  { href: "about.html", label: "About Us" }
];

if (primaryNav) {
  const navLinks = siteNavItems.map(({ href, label }) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    link.dataset.pageLink = "true";
    return link;
  });
  primaryNav.replaceChildren(...navLinks);
}

const headerInner = document.querySelector(".site-header .header-inner");
if (headerInner) {
  const existingCta = headerInner.querySelector(":scope > .header-cta");
  if (existingCta) existingCta.remove();
  if (!headerInner.querySelector(".header-actions")) {
    const headerActions = document.createElement("div");
    headerActions.className = "header-actions";
    headerActions.innerHTML = `
      <a class="button button-outline header-cta" href="login.html"><span class="header-cta-label">Log in</span></a>
      <a class="button button-dark header-cta" href="register.html"><span class="header-cta-label">Create account</span></a>
    `;
    headerInner.appendChild(headerActions);
  }
}

/** Update the mobile menu state and its accessible label. */
/** Toggle the responsive navigation and synchronize its expanded state. */
menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  const language = window.EnterseedLanguage?.current;
  menuToggle.setAttribute("aria-label", language === "fil"
    ? (isOpen ? "Buksan ang nabigasyon" : "Isara ang nabigasyon")
    : (isOpen ? "Open navigation" : "Close navigation"));
  primaryNav.classList.toggle("is-open", !isOpen);
});

/** Close the mobile menu after navigation to another page. */
/** Close the mobile navigation after selecting a page. */
primaryNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  primaryNav.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", window.EnterseedLanguage?.current === "fil" ? "Buksan ang nabigasyon" : "Open navigation");
}));

/** Mark the link for the current HTML page as the active page. */
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("[data-page-link]").forEach((link) => {
  const isCurrent = link.getAttribute("href") === currentPage;
  if (isCurrent) link.setAttribute("aria-current", "page");
});

/** Provide one consistent page-navigation helper for forms and recommendation links. */
window.Enterseed = Object.freeze({
  navigateToPage(page, parameters = {}) {
    const url = new URL(page, location.href);
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    }
    location.assign(url);
  }
});

/** Keep copyright years current on every page. */
document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

/** Surface assessment context on its destination without adding contact details to the URL. */
const recommendationBanner = document.querySelector("#recommendation-banner");
if (recommendationBanner) {
  const parameters = new URLSearchParams(location.search);
  if (parameters.has("recommendation")) {
    const recommendation = parameters.get("recommendation").split(",").filter(Boolean);
    const locationName = parameters.get("location");
    const renderRecommendation = (language) => {
      if (language === "fil") {
        const labels = { efiling: "gabay sa pagpaparehistro", feasibility: "burador ng feasibility study", suppliers: "paghahanap ng lokal na supplier" };
        const focus = recommendation.map((item) => labels[item]).filter(Boolean).join(" at ") || "susunod mong hakbang sa negosyo";
        recommendationBanner.textContent = `Batay sa pagsusuri mo, inirerekomenda ang ${focus}${locationName ? ` malapit sa ${locationName}` : ""}. Nananatili sa browser demo na ito ang mga sagot mo.`;
        return;
      }
      const labels = { efiling: "registration guidance", feasibility: "a feasibility-study draft", suppliers: "local supplier discovery" };
      const focus = recommendation.map((item) => labels[item]).filter(Boolean).join(" and ") || "your next business step";
      recommendationBanner.textContent = `Your assessment suggested ${focus}${locationName ? ` near ${locationName}` : ""}. Your answers remain in this browser demo.`;
    };
    renderRecommendation(window.EnterseedLanguage?.current ?? "en");
    document.addEventListener("enterseed:languagechange", (event) => renderRecommendation(event.detail.language));
    recommendationBanner.hidden = false;
  }
}