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
