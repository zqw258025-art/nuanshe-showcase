import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const outputDir = path.join(rootDir, "test-results");
const baseUrl = process.env.SHOWCASE_URL || "http://127.0.0.1:4173/";
const edgePath =
  process.env.EDGE_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "ipad", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

function collectErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => {
    errors.push(`request: ${request.url()} (${request.failure()?.errorText || "failed"})`);
  });
  return errors;
}

async function assertPageHealth(page, name) {
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((image) => {
      image.loading = "eager";
    });
    const step = Math.max(480, window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 35));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");

  const health = await page.evaluate(() => {
    const root = document.documentElement;
    const brokenImages = [...document.images]
      .filter((image) => image.offsetParent !== null)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src);
    return {
      overflow: root.scrollWidth - root.clientWidth,
      brokenImages,
    };
  });

  if (health.overflow > 1) {
    throw new Error(`${name}: horizontal overflow ${health.overflow}px`);
  }
  if (health.brokenImages.length) {
    throw new Error(`${name}: broken images ${health.brokenImages.join(", ")}`);
  }
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.name === "mobile",
    hasTouch: viewport.name === "mobile" || viewport.name === "ipad",
  });
  const page = await context.newPage();
  const errors = collectErrors(page);

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await assertPageHealth(page, `${viewport.name}-landing`);
  await page.screenshot({
    path: path.join(outputDir, `${viewport.name}-landing.png`),
    fullPage: true,
  });

  await page.goto(`${baseUrl}#workspace`, { waitUntil: "networkidle" });
  await page.waitForSelector("#workspace:not([hidden])");
  await page.setInputFiles("#file-input", path.join(rootDir, "public/images/sample-input.jpg"));
  await page.waitForFunction(() => document.querySelector("#local-preview")?.src.startsWith("blob:"));
  await page.locator('input[name="design-style"][value="cream"]').evaluate((input) => {
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.locator("#people-toggle").evaluate((input) => {
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.locator("#generate-button").click();
  await page.waitForSelector("#results-section:not([hidden])", { timeout: 10000 });
  await page.waitForFunction(
    () => document.querySelectorAll("#stage-list li.is-complete").length >= 4,
  );

  await page.locator("#compare-range").evaluate((input) => {
    input.value = "68";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator('[data-compare-mode="side"]').click();
  await page.locator('[data-result-id="people"]').click();
  await assertPageHealth(page, `${viewport.name}-workspace`);

  const state = await page.evaluate(() => ({
    title: document.querySelector("#result-preview-title")?.textContent,
    resultCount: document.querySelectorAll(".result-card").length,
    uploadIsBlob: document.querySelector("#local-preview")?.src.startsWith("blob:"),
    completedStages: document.querySelectorAll("#stage-list li.is-complete").length,
    compareClip: document.querySelector("#compare-overlay")?.style.clipPath,
    compareSideVisible: !document.querySelector("#compare-side")?.hidden,
  }));

  await page.screenshot({
    path: path.join(outputDir, `${viewport.name}-workspace.png`),
    fullPage: true,
  });

  await context.close();
  return { viewport: viewport.name, state, errors };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: edgePath,
  });
  const results = [];

  try {
    for (const viewport of viewports) {
      results.push(await runViewport(browser, viewport));
    }
  } finally {
    await browser.close();
  }

  const failures = results.flatMap((result) =>
    result.errors.map((error) => `${result.viewport}: ${error}`),
  );
  console.log(JSON.stringify(results, null, 2));
  if (failures.length) {
    throw new Error(`Browser verification failed:\n${failures.join("\n")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
