import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const outputRoot = path.join(root, "public/images");

const captures = [
  {
    name: "SentrySearch",
    url: "https://sentry-search.vercel.app/",
    output: "SentrySearch.jpg",
    async selectLightTheme(page) {
      const lightThemeButton = page.locator('button[aria-label="Switch to light theme"]:visible');
      if (await lightThemeButton.count()) {
        await lightThemeButton.first().click();
      }
    },
  },
  {
    name: "SentryDigest",
    url: "https://ricomanifesto.github.io/SentryDigest/",
    output: "SentryDigest.jpg",
    async selectLightTheme(page) {
      const background = await page.locator("body").evaluate(
        (body) => getComputedStyle(body).backgroundColor,
      );
      if (background === "rgb(11, 16, 32)") {
        await page.getByRole("button", { name: "Toggle theme" }).click();
      }
    },
  },
  {
    name: "SentryInsight",
    url: "https://ricomanifesto.github.io/SentryInsight/",
    output: "SentryInsight.jpg",
    async selectLightTheme(page) {
      const lightThemeButton = page.getByRole("button", { name: "Light theme" });
      if (await lightThemeButton.count()) {
        await lightThemeButton.click();
      }
    },
  },
  {
    name: "GRCInsight",
    url: "https://ricomanifesto.github.io/GRCInsight/",
    output: "GRCInsight.jpg",
    async selectLightTheme(page) {
      const lightThemeButton = page.getByRole("button", { name: "Switch to light theme" });
      if (await lightThemeButton.count()) {
        await lightThemeButton.click();
      }
    },
  },
];

const browser = await chromium.launch();

try {
  for (const capture of captures) {
    const context = await browser.newContext({
      colorScheme: "light",
      deviceScaleFactor: 1,
      viewport: { width: 2048, height: 1280 },
    });
    const page = await context.newPage();

    await page.goto(capture.url, { waitUntil: "networkidle" });
    await capture.selectLightTheme(page);
    await page.evaluate(async () => {
      await document.fonts.ready;
      window.scrollTo(0, 0);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

    const outputPath = path.join(outputRoot, capture.output);
    await page.screenshot({
      path: outputPath,
      type: "jpeg",
      quality: 82,
      fullPage: false,
    });
    console.log(`Captured ${capture.name} at ${outputPath}`);

    await context.close();
  }
} finally {
  await browser.close();
}
