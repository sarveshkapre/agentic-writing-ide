import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}/`;
const OUTPUT_DIR = join(process.cwd(), "output", "playwright");

const waitForServer = async (url, timeoutMs = 20_000) => {
  const start = Date.now();
  // Node 20 has global fetch.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) return;
    } catch {
      // ignore until timeout
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for preview server at ${url}`);
    }
    await delay(250);
  }
};

const startPreviewServer = () => {
  const child = spawn(
    "npm",
    [
      "run",
      "preview",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(PREVIEW_PORT),
      "--strictPort"
    ],
    {
      stdio: "inherit",
      env: { ...process.env, BROWSER: "none" }
    }
  );
  return child;
};

const main = async () => {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const preview = startPreviewServer();
  let browser;

  try {
    await waitForServer(PREVIEW_URL);

    browser = await chromium.launch();
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    await page.goto(PREVIEW_URL, { waitUntil: "domcontentloaded" });
    await page.getByText("Agentic Writing IDE").waitFor();

    const editor = page.getByLabel("Markdown editor");
    const initialValue = await editor.inputValue();
    const committedLine = "E2E smoke: committed line";
    await editor.fill(`${initialValue}\n\n${committedLine}\n`);
    await page.getByRole("button", { name: "Commit changes" }).click();
    await page.getByText("Manual edit commit").waitFor();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export JSON" }).click()
    ]);

    const downloadPath = join(OUTPUT_DIR, "agentic-writing-ide.json");
    await download.saveAs(downloadPath);

    const exported = JSON.parse(readFileSync(downloadPath, "utf8"));
    if (exported?.version !== 2) {
      throw new Error("Exported JSON did not contain expected v2 app state.");
    }

    const stashedLine = "E2E smoke: stashed line";
    const afterCommitValue = await editor.inputValue();
    await editor.fill(`${afterCommitValue}\n${stashedLine}\n`);

    // Trigger the uncommitted-change confirm dialog by selecting an older revision.
    const history = page.locator(".panel.history");
    await history.getByText("Initial draft").click();
    await page.getByRole("dialog").getByText("You have uncommitted changes").waitFor();
    await page.getByRole("button", { name: "Stash & continue" }).click();

    // Navigate back to head and ensure stashed content is restored.
    await history.getByText("Manual edit commit").click();
    await page.getByLabel("Markdown editor").waitFor();
    const restored = await editor.inputValue();
    if (!restored.includes(stashedLine)) {
      throw new Error("Expected stashed edits to be restored after navigation.");
    }

    await context.close();
  } catch (error) {
    try {
      if (browser) {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(PREVIEW_URL, { waitUntil: "domcontentloaded" });
        await page.screenshot({ path: join(OUTPUT_DIR, "smoke-failure.png"), fullPage: true });
        await ctx.close();
      }
    } catch {
      // ignore secondary failures
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    preview.kill("SIGTERM");
  }
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
