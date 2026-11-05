import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const apiBaseUrl = String(process.env.ENTERSEED_API_URL || "").trim().replace(/\/+$/, "");

if (!apiBaseUrl) throw new Error("Set ENTERSEED_API_URL to the deployed HTTPS backend origin before building GitHub Pages.");

let apiOrigin;
try {
  apiOrigin = new URL(apiBaseUrl);
} catch (error) {
  throw new Error("ENTERSEED_API_URL must be a valid HTTPS backend origin.", { cause: error });
}
if (apiOrigin.protocol !== "https:" || apiOrigin.pathname !== "/" || apiOrigin.search || apiOrigin.hash) {
  throw new Error("ENTERSEED_API_URL must be an HTTPS origin without a path, query, or fragment.");
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
for (const entry of await readdir(projectRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith(".html")) {
    await cp(path.join(projectRoot, entry.name), path.join(outputDirectory, entry.name));
  }
}
for (const directory of ["css", "js", "locales", "logos"]) {
  await cp(path.join(projectRoot, directory), path.join(outputDirectory, directory), { recursive: true });
}
await mkdir(path.join(outputDirectory, "js"), { recursive: true });
await writeFile(
  path.join(outputDirectory, "js", "deployment-config.js"),
  `window.EnterseedDeployment = Object.freeze({ apiBaseUrl: ${JSON.stringify(apiBaseUrl)} });\n`
);
