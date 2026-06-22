import { expect, test } from "@playwright/test";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

async function installReducedMotionController(page) {
  await page.addInitScript((query) => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    let prefersReducedMotion = false;
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
  }, reducedMotionQuery);
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
