import { expect, test } from "@playwright/test";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

async function installReducedMotionController(page, initialPrefersReducedMotion = false) {
  await page.addInitScript(({ query, initialPrefersReducedMotion }) => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    let prefersReducedMotion = initialPrefersReducedMotion;
    const listeners = new Set();
    const mediaQueryLists = new Set();

    function notifyListeners() {
      const event = { matches: prefersReducedMotion, media: query };
      for (const mediaQueryList of mediaQueryLists) {
        mediaQueryList.matches = prefersReducedMotion;
        mediaQueryList.onchange?.(event);
      }
      for (const listener of listeners) {
        listener(event);
      }
    }

    window.__setReducedMotionForTest = (value) => {
      prefersReducedMotion = value;
      notifyListeners();
    };

    window.matchMedia = (requestedQuery) => {
      if (requestedQuery !== query) {
        return nativeMatchMedia(requestedQuery);
      }

      const mediaQueryList = {
        matches: prefersReducedMotion,
        media: query,
        onchange: null,
        addEventListener: (eventName, listener) => {
          if (eventName === "change") {
            listeners.add(listener);
          }
        },
        removeEventListener: (eventName, listener) => {
          if (eventName === "change") {
            listeners.delete(listener);
          }
        },
        addListener: (listener) => listeners.add(listener),
        removeListener: (listener) => listeners.delete(listener),
        dispatchEvent: () => true,
      };

      mediaQueryLists.add(mediaQueryList);
      return mediaQueryList;
    };
  }, { query: reducedMotionQuery, initialPrefersReducedMotion });
}

test("stops decorative motion when reduced motion is enabled after resize", async ({ page }) => {
  await installReducedMotionController(page);
  await page.goto("/");

  await expect(page.locator("#nodes-container .node")).toHaveCount(15);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("resize"));
    window.__setReducedMotionForTest(true);
  });

  await page.waitForTimeout(350);
  await expect(page.locator("#nodes-container .node")).toHaveCount(0);
  await expect(page.locator("#nodes-container .connection")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Hi, I'm Rico" })).toBeVisible();
});

test("exposes mobile primary navigation from shared section links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("list")).toBeVisible();
  await expect(mobileNav.getByRole("listitem")).toHaveCount(5);
  await expect(mobileNav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#intro");
  await expect(mobileNav.getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
  await expect(mobileNav.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "#experience");
  await expect(mobileNav.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "#projects");
});

test("supports keyboard navigation across experience tabs", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Experience" }).click();
  await expect(page.getByRole("tablist", { name: "Experience companies" })).toHaveAttribute(
    "aria-orientation",
    "vertical",
  );
  const sentinelOne = page.getByRole("tab", { name: "SENTINELONE" });
  const uber = page.getByRole("tab", { name: "UBER" });
  const dellSecureworks = page.getByRole("tab", { name: "DELL SECUREWORKS" });
  const tabs = [sentinelOne, uber, dellSecureworks];

  await expect(page.locator('[role="tabpanel"]')).toHaveCount(3);

  for (const tab of tabs) {
    const panelId = await tab.getAttribute("aria-controls");

    await expect(page.locator(`#${panelId}`)).toHaveCount(1);
  }

  await expect(sentinelOne).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#experience-panel-1")).toBeHidden();
  await expect(page.getByRole("tabpanel", { name: "SENTINELONE" })).toContainText("Staff Threat Hunter");

  await sentinelOne.focus();
  await page.keyboard.press("ArrowDown");
  await expect(uber).toBeFocused();
  await expect(uber).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "UBER" })).toContainText("Threat Detection Engineer II");

  await page.keyboard.press("End");
  await expect(dellSecureworks).toBeFocused();
  await expect(dellSecureworks).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "DELL SECUREWORKS" })).toContainText("Information Security Researcher");
});

test("renders visible focus for keyboard navigation controls", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();

  await page.keyboard.press("Tab");
  const brandLink = page.getByRole("link", { name: "rico" });
  await expect(brandLink).toBeFocused();
  await expect(brandLink).toHaveCSS("outline-style", "solid");

  const sayHiLink = page.getByRole("link", { name: "Say hi!" });
  for (let index = 0; index < 30; index++) {
    if (await sayHiLink.evaluate((element) => document.activeElement === element).catch(() => false)) {
      break;
    }

    await page.keyboard.press("Tab");
  }

  await expect(sayHiLink).toBeFocused();
  await expect(sayHiLink).toHaveCSS("outline-style", "solid");

  await page.getByRole("link", { name: "Projects" }).click();
  const nextProjectButton = page.getByRole("button", { name: "Next project" });
  for (let index = 0; index < 30; index++) {
    if (await nextProjectButton.evaluate((element) => document.activeElement === element).catch(() => false)) {
      break;
    }

    await page.keyboard.press("Tab");
  }

  await expect(nextProjectButton).toBeFocused();
  await expect(nextProjectButton).toHaveCSS("outline-style", "solid");
});

test("keeps inactive project slide links out of keyboard order", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page.locator('[aria-label="Project slide 1 of 4"]')).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator('[aria-label="Project slide 2 of 4"]')).toHaveAttribute("aria-hidden", "true");

  await page.getByRole("link", { name: "View AI-Powered Threat Intelligence Platform repository" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Open AI-Powered Threat Intelligence Platform demo" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Previous project" })).toBeFocused();

  await page.getByRole("button", { name: "Next project" }).click();
  await expect(page.locator('[aria-label="Project slide 1 of 4"]')).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator('[aria-label="Project slide 2 of 4"]')).toHaveAttribute("aria-hidden", "false");
  await expect(
    page.locator('a[aria-label="View AI-Powered Threat Intelligence Platform repository"]'),
  ).toHaveAttribute("tabindex", "-1");
});

test("announces the active project slide after manual navigation", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const projectStatus = page.getByRole("status", { name: "Current project" });
  await expect(projectStatus).toHaveAttribute("aria-live", "off");
  await expect(projectStatus).toHaveText("Project 1 of 4: AI-Powered Threat Intelligence Platform");

  await page.getByRole("button", { name: "Next project" }).click();
  await expect(projectStatus).toHaveAttribute("aria-live", "polite");
  await expect(projectStatus).toHaveText("Project 2 of 4: Cybersecurity News Aggregator");
});

test("exposes the project carousel as a named region", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const carousel = page.getByRole("region", { name: "Featured projects" });

  await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
  await expect(carousel.getByRole("status", { name: "Current project" })).toBeAttached();
  await expect(carousel.getByRole("button", { name: "Previous project" })).toBeVisible();
  await expect(carousel.getByRole("button", { name: "Next project" })).toBeVisible();
});

test("treats project carousel background images as decorative", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const carousel = page.getByRole("region", { name: "Featured projects" });

  await expect(carousel.getByRole("img", { name: /AI-Powered Threat Intelligence Platform/ })).toHaveCount(0);
  await expect(carousel.getByRole("heading", { name: "AI-Powered Threat Intelligence Platform" })).toBeVisible();
  await expect(
    carousel.getByRole("link", { name: "View AI-Powered Threat Intelligence Platform repository" }),
  ).toBeVisible();
});

test("updates the current project dot after manual navigation", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const firstDot = page.getByRole("button", { name: "Show AI-Powered Threat Intelligence Platform" });
  const secondDot = page.getByRole("button", { name: "Show Cybersecurity News Aggregator" });
  await expect(firstDot).toHaveAttribute("aria-current", "true");
  await expect(secondDot).not.toHaveAttribute("aria-current", "true");

  await secondDot.click();
  await expect(firstDot).not.toHaveAttribute("aria-current", "true");
  await expect(secondDot).toHaveAttribute("aria-current", "true");
});

test("keeps mobile project carousel arrows inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();

  for (const buttonName of ["Previous project", "Next project"]) {
    const button = page.getByRole("button", { name: buttonName });
    const box = await button.boundingBox();

    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(-0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(390.5);
  }
});

test("keeps mobile project carousel dots easy to tap", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();

  for (const projectName of [
    "AI-Powered Threat Intelligence Platform",
    "Cybersecurity News Aggregator",
    "Cybersecurity Exploit Reporter",
    "Cybersecurity GRC Reporter",
  ]) {
    const dot = page.getByRole("button", { name: `Show ${projectName}` });
    const box = await dot.boundingBox();

    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("pauses project auto-rotation while carousel has keyboard focus", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await page.getByRole("link", { name: "View AI-Powered Threat Intelligence Platform repository" }).focus();
  await page.waitForTimeout(10500);

  await expect(page.locator('[aria-label="Project slide 1 of 4"]')).toHaveAttribute("aria-hidden", "false");
  await expect(page.getByRole("link", { name: "View AI-Powered Threat Intelligence Platform repository" })).toBeFocused();
});

test("pauses project auto-rotation while carousel is hovered", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await page.locator('[aria-label="Project slide 1 of 4"]').hover();
  await page.waitForTimeout(10500);

  await expect(page.locator('[aria-label="Project slide 1 of 4"]')).toHaveAttribute("aria-hidden", "false");
});
