/** Shared authenticated layout for every workspace route. */
const appNavigation = [
  { href: "dashboard.html", route: "/dashboard", key: "dashboard", icon: "⌂" },
  { href: "finance.html", route: "/finance", key: "finance", icon: "₱" },
  { href: "marketing.html", route: "/marketing", key: "marketing", icon: "◎" },
  { href: "documents.html", route: "/documents", key: "documents", icon: "▤" }
];

const appRouteDetails = {
  "/dashboard": { section: "dashboard", breadcrumb: null },
  "/finance": { section: "finance", breadcrumb: "appShell.financeBreadcrumb" },
  "/marketing": { section: "marketing", breadcrumb: "appShell.marketingBreadcrumb" },
  "/documents": { section: "documents", breadcrumb: "appShell.documentsBreadcrumb" },
  "/boss-nana": { section: "bossNana", breadcrumb: "appShell.assistantBreadcrumb" }
};

function currentAppRoute() {
  const page = location.pathname.split("/").pop()?.replace(/\.html$/, "") || "dashboard";
  const route = `/${page}`;
  return appRouteDetails[route] ? route : "/dashboard";
}

function createNavigationLink(item, isMobile = false) {
  const link = document.createElement("a");
  link.className = isMobile ? "app-bottom-link" : "app-nav-link";
  link.href = item.href;
  const icon = document.createElement("span");
  icon.className = "app-nav-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = item.icon;
  const label = document.createElement("span");
  label.dataset.i18n = `appShell.${item.key}`;
  label.textContent = item.key[0].toUpperCase() + item.key.slice(1);
  link.append(icon, label);
  if (currentAppRoute() === item.route) {
    link.setAttribute("aria-current", "page");
  }
  return link;
}

function mountAppShell(user) {
  const body = document.body;
  const page = body.querySelector("main");
  if (!page) throw new Error("The authenticated page is missing its main content.");

  const skipLink = body.querySelector(".skip-link");
  const oldHeader = body.querySelector(".site-header");
  const portalContent = page.querySelector(".portal-main");
  page.querySelector(".sidebar-panel")?.remove();
  if (portalContent) page.replaceChildren(...portalContent.childNodes);
  page.classList.remove("container", "portal-shell");
  page.classList.add("app-content-root");
  oldHeader?.remove();

  const route = currentAppRoute();
  const details = appRouteDetails[route];
  const frame = document.createElement("div");
  frame.className = "app-shell";

  const sidebar = document.createElement("aside");
  sidebar.className = "app-sidebar";
  sidebar.setAttribute("aria-label", window.EnterseedI18n.t("appShell.primaryNavigation"));
  const brand = document.createElement("a");
  brand.className = "app-brand";
  brand.href = "dashboard.html";
  brand.setAttribute("aria-label", "Enterseed dashboard");
  const logo = document.createElement("img");
  logo.src = "logos/Icon White.png";
  logo.alt = "";
  const brandName = document.createElement("span");
  brandName.textContent = "Enterseed";
  brand.append(logo, brandName);
  const nav = document.createElement("nav");
  nav.className = "app-sidebar-nav";
  nav.setAttribute("aria-label", window.EnterseedI18n.t("appShell.primaryNavigation"));
  appNavigation.forEach((item) => nav.append(createNavigationLink(item)));
  const sidebarNote = document.createElement("p");
  sidebarNote.className = "app-sidebar-note";
  sidebarNote.dataset.i18n = "appShell.sidebarNote";
  sidebarNote.textContent = window.EnterseedI18n.t("appShell.sidebarNote");
  sidebar.append(brand, nav, sidebarNote);

  const workspace = document.createElement("div");
  workspace.className = "app-workspace";
  const topbar = document.createElement("header");
  topbar.className = "app-topbar";
  const sectionHeading = document.createElement("div");
  sectionHeading.className = "app-section-heading";
  const mobileBrand = brand.cloneNode(true);
  mobileBrand.className = "app-mobile-brand";
  mobileBrand.querySelector("img").src = "logos/Icon.png";
  const breadcrumbs = document.createElement("nav");
  breadcrumbs.className = "app-breadcrumbs";
  breadcrumbs.setAttribute("aria-label", window.EnterseedI18n.t("appShell.breadcrumbs"));
  const sectionCrumb = document.createElement("a");
  sectionCrumb.href = `${route.slice(1)}.html`;
  sectionCrumb.dataset.i18n = `appShell.${details.section}`;
  sectionCrumb.textContent = window.EnterseedI18n.t(`appShell.${details.section}`);
  if (!details.breadcrumb) sectionCrumb.setAttribute("aria-current", "page");
  const separator = document.createElement("span");
  separator.setAttribute("aria-hidden", "true");
  separator.textContent = "›";
  const currentCrumb = document.createElement("span");
  currentCrumb.dataset.i18n = details.breadcrumb || "appShell.dashboard";
  currentCrumb.setAttribute("aria-current", "page");
  currentCrumb.textContent = window.EnterseedI18n.t(details.breadcrumb || "appShell.dashboard");
  breadcrumbs.append(sectionCrumb);
  if (details.breadcrumb) breadcrumbs.append(separator, currentCrumb);
  const mobileTitle = document.createElement("strong");
  mobileTitle.className = "app-mobile-title";
  mobileTitle.dataset.i18n = `appShell.${details.section}`;
  mobileTitle.textContent = window.EnterseedI18n.t(`appShell.${details.section}`);
  sectionHeading.append(mobileBrand, breadcrumbs, mobileTitle);

  const utility = document.createElement("div");
  utility.className = "app-utilities";
  const languageMount = document.createElement("div");
  languageMount.className = "app-language-mount";
  const chatOpen = document.createElement("button");
  chatOpen.type = "button";
  chatOpen.className = "app-chat-open";
  chatOpen.dataset.openBossNana = "";
  chatOpen.dataset.i18n = "appShell.askBossNana";
  chatOpen.textContent = window.EnterseedI18n.t("appShell.askBossNana");

  const profile = document.createElement("details");
  profile.className = "app-profile";
  profile.id = "app-profile-menu";
  const summary = document.createElement("summary");
  const initials = document.createElement("span");
  initials.className = "app-profile-initials";
  initials.setAttribute("aria-hidden", "true");
  initials.textContent = String(user.firstName || user.email || "U").slice(0, 1).toUpperCase();
  const profileName = document.createElement("span");
  profileName.className = "app-profile-name";
  profileName.textContent = user.firstName || window.EnterseedI18n.t("appShell.profile");
  summary.append(initials, profileName);
  const profileMenu = document.createElement("div");
  profileMenu.className = "app-profile-menu";
  const email = document.createElement("span");
  email.className = "app-profile-email";
  email.textContent = user.email || "";
  const logoutStatus = document.createElement("span");
  logoutStatus.className = "app-logout-status";
  logoutStatus.setAttribute("role", "status");
  const logout = document.createElement("button");
  logout.type = "button";
  logout.className = "app-logout";
  logout.dataset.i18n = "appShell.logout";
  logout.textContent = window.EnterseedI18n.t("appShell.logout");
  logout.addEventListener("click", async () => {
    logout.disabled = true;
    logoutStatus.textContent = "";
    try {
      const response = await window.EnterseedApi.request("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok && response.status !== 204) throw new Error("Could not end the session.");
      window.EnterseedApi.clearSessionToken();
      location.replace("login.html");
    } catch (error) {
      console.error("Logout failed.", error);
      logout.disabled = false;
      logoutStatus.textContent = window.EnterseedI18n.t("appShell.logoutError");
    }
  });
  profileMenu.append(email, logoutStatus, logout);
  profile.append(summary, profileMenu);

  const mobileChat = document.createElement("button");
  mobileChat.type = "button";
  mobileChat.className = "app-mobile-chat";
  mobileChat.dataset.openBossNana = "";
  mobileChat.dataset.i18nLabel = "appShell.askBossNana";
  mobileChat.setAttribute("aria-label", window.EnterseedI18n.t("appShell.askBossNana"));
  mobileChat.textContent = "BN";

  utility.append(languageMount, chatOpen, profile);
  topbar.append(sectionHeading, mobileChat, utility);
  workspace.append(topbar, page);

  const bottomNav = document.createElement("nav");
  bottomNav.className = "app-bottom-nav";
  bottomNav.setAttribute("aria-label", window.EnterseedI18n.t("appShell.mobileNavigation"));
  appNavigation.forEach((item) => bottomNav.append(createNavigationLink(item, true)));
  const profileLink = document.createElement("button");
  profileLink.type = "button";
  profileLink.className = "app-bottom-link";
  profileLink.dataset.openProfile = "";
  const profileIcon = document.createElement("span");
  profileIcon.className = "app-nav-icon";
  profileIcon.setAttribute("aria-hidden", "true");
  profileIcon.textContent = "●";
  const profileLabel = document.createElement("span");
  profileLabel.dataset.i18n = "appShell.profile";
  profileLabel.textContent = "Profile";
  profileLink.append(profileIcon, profileLabel);
  bottomNav.append(profileLink);
  profileLink.addEventListener("click", () => {
    profile.open = true;
    summary.focus();
  });

  frame.append(sidebar, workspace, bottomNav);
  const remaining = [...body.childNodes].filter((node) =>
    node !== skipLink && node !== page && node !== oldHeader
  );
  body.replaceChildren(...(skipLink ? [skipLink] : []), frame, ...remaining);
  window.EnterseedLanguage?.attachTo(languageMount);
  window.EnterseedI18n.apply(frame);
}

window.EnterseedAppShell = Object.freeze({ mount: mountAppShell });
