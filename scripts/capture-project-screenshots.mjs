import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = process.cwd();
const outputRoot = path.join(root, "public/images");
const showcaseFrame = { width: 2048, height: 1280 };

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
    viewport: { width: 1280, height: 1280 },
    frame: showcaseFrame,
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

const requestedCaptures = new Set(process.argv.slice(2));
const selectedCaptures = requestedCaptures.size
  ? captures.filter(({ name }) => requestedCaptures.has(name))
  : captures;

const unknownCaptures = [...requestedCaptures].filter(
  (name) => !captures.some((capture) => capture.name === name),
);

if (unknownCaptures.length) {
  throw new Error(`Unknown capture name${unknownCaptures.length === 1 ? "" : "s"}: ${unknownCaptures.join(", ")}`);
}

const browser = await chromium.launch();

try {
  for (const capture of selectedCaptures) {
    const viewport = capture.viewport ?? showcaseFrame;
    const context = await browser.newContext({
      colorScheme: "light",
      deviceScaleFactor: 1,
      viewport,
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
    if (capture.frame && capture.frame.width !== viewport.width) {
      const horizontalGutter = (capture.frame.width - viewport.width) / 2;

      if (!Number.isInteger(horizontalGutter) || capture.frame.height !== viewport.height) {
        throw new Error(`${capture.name} frame must add equal horizontal gutters only`);
      }

      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
      });

      await sharp(screenshot)
        .extend({
          left: horizontalGutter,
          right: horizontalGutter,
          top: 0,
          bottom: 0,
          extendWith: "copy",
        })
        .jpeg({ quality: 82 })
        .toFile(outputPath);
    } else {
      await page.screenshot({
        path: outputPath,
        type: "jpeg",
        quality: 82,
        fullPage: false,
      });
    }
    console.log(`Captured ${capture.name} at ${outputPath}`);

    await context.close();
  }
} finally {
  await browser.close();
}
