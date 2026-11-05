import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
let server;
let baseUrl;
let temporaryDirectory;
let serverOutput = "";

async function findAvailablePort() {
  const listener = createServer();
  await new Promise((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolve);
  });
  const { port } = listener.address();
  await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Server exited during startup: ${serverOutput}`);
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Server did not become ready: ${serverOutput}`);
}

beforeAll(async () => {
  temporaryDirectory = await mkdtemp(path.join(tmpdir(), "enterseed-navigation-tests-"));
  const port = await findAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["server/index.js"], {
    cwd: projectDirectory,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      DATABASE_PATH: path.join(temporaryDirectory, "test.sqlite"),
      GEMINI_API_KEY: "",
      ADMIN_API_KEY: "",
      FRONTEND_ORIGINS: "https://tdalog-cell.github.io"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });
  await waitForServer();
}, 20000);

afterAll(async () => {
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await exited;
  }
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
});

describe("website navigation and authentication", () => {
  it("serves the public entry points", async () => {
    for (const route of ["/", "/login", "/register", "/onboarding", "/about", "/efiling", "/pricing"]) {
      const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
      expect(response.status, route).toBe(200);
    }
    const removedSupplierPage = await fetch(`${baseUrl}/suppliers.html`, { redirect: "manual" });
    expect(removedSupplierPage.status).toBe(404);
  });

  it("redirects unauthenticated workspace routes to login with a return path", async () => {
    for (const route of ["/dashboard", "/finance", "/marketing", "/documents", "/boss-nana"]) {
      const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
      expect(response.status, route).toBe(302);
      expect(response.headers.get("location"), route).toBe(`/login?next=${encodeURIComponent(route)}`);
    }
  });

  it("allows the GitHub Pages origin to sign in and use bearer sessions", async () => {
    const origin = "https://tdalog-cell.github.io";
    const preflight = await fetch(`${baseUrl}/api/auth/me`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization"
      }
    });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe(origin);
    expect(preflight.headers.get("access-control-allow-headers")).toContain("Authorization");

    const email = `pages-${randomUUID()}@example.test`;
    const password = "temporary-test-passphrase";
    const registration = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        firstName: "Pages",
        lastName: "Test",
        business: "Pages Test Shop",
        email,
        password,
        agree: true
      })
    });
    expect(registration.status).toBe(201);
    expect(registration.headers.get("access-control-allow-origin")).toBe(origin);
    expect((await registration.json()).sessionToken).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    expect(login.status).toBe(200);
    expect(login.headers.get("access-control-allow-origin")).toBe(origin);
    const { sessionToken } = await login.json();
    expect(sessionToken).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const untrustedLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        Origin: "https://untrusted.example",
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    expect(untrustedLogin.headers.get("access-control-allow-origin")).toBeNull();
    expect((await untrustedLogin.json()).sessionToken).toBeUndefined();

    const account = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Origin: origin, Authorization: `Bearer ${sessionToken}` }
    });
    expect(account.status).toBe(200);
    expect((await account.json()).user.email).toContain("@example.test");

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: origin, Authorization: `Bearer ${sessionToken}` }
    });
    expect(logout.status).toBe(204);
    const revokedSession = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Origin: origin, Authorization: `Bearer ${sessionToken}` }
    });
    expect(revokedSession.status).toBe(401);
  });

  it("resolves every local HTML link without a missing or server-error destination", async () => {
    const htmlFiles = (await readdir(projectDirectory)).filter((file) => file.endsWith(".html"));
    const localTargets = new Set();
    for (const file of htmlFiles) {
      const html = await readFile(path.join(projectDirectory, file), "utf8");
      expect(html.match(/<h1(?:\s|>)/gi)?.length, `${file} primary heading`).toBe(1);
      for (const [, href] of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)) {
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) continue;
        const target = new URL(href, `${baseUrl}/${file}`);
        localTargets.add(`${target.pathname}${target.search}`);
      }
    }
    for (const target of localTargets) {
      const response = await fetch(`${baseUrl}${target}`, { redirect: "manual" });
      expect(response.status, target).toBeLessThan(400);
    }
  });

  it("restores access to a protected page after account setup and blocks it after logout", async () => {
    const registration = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        firstName: "Navigation",
        lastName: "Test",
        business: "Navigation Test Shop",
        email: `navigation-${randomUUID()}@example.test`,
        password: "temporary-test-passphrase",
        agree: true
      })
    });
    expect(registration.status).toBe(201);
    expect((await registration.json()).needsLanguageSelection).toBe(true);
    const cookie = registration.headers.get("set-cookie")?.split(";", 1)[0];
    expect(cookie).toBeTruthy();

    const language = await fetch(`${baseUrl}/api/auth/language`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ language: "en" })
    });
    expect(language.status).toBe(200);

    const workspace = await fetch(`${baseUrl}/finance`, { headers: { Cookie: cookie } });
    expect(workspace.status).toBe(200);
    expect(workspace.headers.get("cache-control")).toContain("no-store");
    const marketing = await fetch(`${baseUrl}/marketing`, { headers: { Cookie: cookie } });
    expect(marketing.status).toBe(200);
    const marketingHtml = await marketing.text();
    expect(marketingHtml).toContain('href="#partners">Find local partners</a>');
    for (const feature of ['id="supplier-search"', 'id="supplier-map"', 'id="map-search-form"', 'id="supplier-application-form"']) {
      expect(marketingHtml).toContain(feature);
    }
    const logout = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie } });
    expect(logout.status).toBe(204);
    const deniedWorkspace = await fetch(`${baseUrl}/finance`, { redirect: "manual" });
    expect(deniedWorkspace.status).toBe(302);
  });
});
