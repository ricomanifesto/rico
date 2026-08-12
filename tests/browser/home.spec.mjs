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

test("keeps a resolved signal visible when reduced motion is enabled", async ({ page }) => {
  await installReducedMotionController(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const signal = page.getByTestId("signal-graphic");
  await expect(signal).toHaveAttribute("data-motion", "animated");
  await expect(page.getByTestId("signal-particle")).toHaveCount(12);
  await expect(page.getByTestId("signal-line")).toHaveCount(1);

  await page.evaluate(() => {
    window.__setReducedMotionForTest(true);
  });

  await expect(signal).toHaveAttribute("data-motion", "reduced");
  await expect(page.getByTestId("signal-particle")).toHaveCount(12);
  await expect(page.getByTestId("hero-visual")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hi, I'm Michael Rico" })).toBeVisible();
});

test("exposes mobile primary navigation from shared section links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("list")).toBeVisible();
  await expect(mobileNav.getByRole("listitem")).toHaveCount(6);
  await expect(mobileNav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/#intro");
  await expect(mobileNav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/#about");
  await expect(mobileNav.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "/#experience");
  await expect(mobileNav.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/#projects");
  await expect(mobileNav.getByRole("link", { name: "Writing" })).toHaveAttribute("href", "/writing/");

  for (const linkName of ["Home", "About", "Experience", "Projects", "Writing", "Contact"]) {
    const box = await mobileNav.getByRole("link", { name: linkName }).boundingBox();

    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await mobileNav.getByRole("link", { name: "Home" }).click();
  const introPositions = await page.evaluate(() => {
    const header = document.querySelector("header");
    const introHeading = document.querySelector("#intro h1");

    return {
      headerBottom: header?.getBoundingClientRect().bottom ?? 0,
      headingTop: introHeading?.getBoundingClientRect().top ?? 0,
    };
  });
  expect(introPositions.headingTop).toBeGreaterThanOrEqual(introPositions.headerBottom - 1);

  for (const { linkName, sectionId } of [
    { linkName: "About", sectionId: "about" },
    { linkName: "Experience", sectionId: "experience" },
    { linkName: "Projects", sectionId: "projects" },
  ]) {
    await mobileNav.getByRole("link", { name: linkName }).click();

    const positions = await page.evaluate((sectionId) => {
      const header = document.querySelector("header");
      const section = document.getElementById(sectionId);

      return {
        headerBottom: header?.getBoundingClientRect().bottom ?? 0,
        sectionTop: section?.getBoundingClientRect().top ?? 0,
      };
    }, sectionId);

    expect(positions.sectionTop).toBeGreaterThanOrEqual(positions.headerBottom - 1);
  }
});

test("exposes desktop primary navigation with an accessible name", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");

  const desktopNav = page.getByRole("navigation", { name: "Primary" });
  await expect(desktopNav).toBeVisible();
  await expect(desktopNav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/#intro");
  await expect(desktopNav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/#about");
  await expect(desktopNav.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "/#experience");
  await expect(desktopNav.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/#projects");
  await expect(desktopNav.getByRole("link", { name: "Writing" })).toHaveAttribute("href", "/writing/");
  await expect(desktopNav.getByRole("link", { name: "Contact" })).toHaveAttribute(
    "href",
    "mailto:michaelrico124@gmail.com",
  );
});

test("marks the active desktop section in primary navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");

  const desktopNav = page.getByRole("navigation", { name: "Primary" });
  const homeLink = desktopNav.getByRole("link", { name: "Home" });
  const aboutLink = desktopNav.getByRole("link", { name: "About" });
  const experienceLink = desktopNav.getByRole("link", { name: "Experience" });

  await expect(homeLink).toHaveAttribute("aria-current", "location");
  await expect(aboutLink).not.toHaveAttribute("aria-current", "location");

  await aboutLink.click();
  await expect(aboutLink).toHaveAttribute("aria-current", "location");
  await expect(homeLink).not.toHaveAttribute("aria-current", "location");

  await experienceLink.click();
  await expect(experienceLink).toHaveAttribute("aria-current", "location");
  await expect(aboutLink).not.toHaveAttribute("aria-current", "location");
  await expect(experienceLink).toHaveCSS("font-weight", "600");
});

test("marks the active mobile section in primary navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  const homeLink = mobileNav.getByRole("link", { name: "Home" });
  const aboutLink = mobileNav.getByRole("link", { name: "About" });

  await expect(homeLink).toHaveAttribute("aria-current", "location");
  await expect(aboutLink).not.toHaveAttribute("aria-current", "location");

  await aboutLink.click();
  await expect(aboutLink).toHaveAttribute("aria-current", "location");
  await expect(homeLink).not.toHaveAttribute("aria-current", "location");
  await expect(aboutLink).toHaveCSS("font-weight", "600");
});

test("marks direct section links as active after page load", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/#about");

  const desktopNav = page.getByRole("navigation", { name: "Primary" });
  const homeLink = desktopNav.getByRole("link", { name: "Home" });
  const aboutLink = desktopNav.getByRole("link", { name: "About" });

  await expect(aboutLink).toHaveAttribute("aria-current", "location");
  await expect(homeLink).not.toHaveAttribute("aria-current", "location");
});

test("ignores malformed section fragments without crashing the header", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/#foo%5D");

  await expect(page.getByRole("banner")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("keeps hero contact CTA accessible and easy to tap", async ({ page }) => {
  await page.goto("/");

  const contactLink = page.getByRole("link", { name: "Say hi!" });
  await expect(contactLink).toBeVisible();
  await expect(contactLink).toHaveAttribute("href", "mailto:michaelrico124@gmail.com");

  const box = await contactLink.boundingBox();

  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test("keeps mobile hero content visible before the next section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heading = page.getByRole("heading", { name: "Hi, I'm Michael Rico" });
  const subtitle = page.getByText("I build security systems that turn noisy signals into clear, inspectable decisions.");
  const body = page.getByText("I'm a Staff Threat Hunter focused on threat intelligence, incident readiness, and detection engineering.");
  const contactLink = page.getByRole("link", { name: "Say hi!" });

  await expect(heading).toBeVisible();
  await expect(subtitle).toBeVisible();
  await expect(body).toBeVisible();
  await expect(contactLink).toBeVisible();
  await expect(body).toHaveCSS("opacity", "1");

  const layout = await page.evaluate(() => {
    const heading = document.querySelector("#intro h1");
    const paragraphs = Array.from(document.querySelectorAll("#intro p"));
    const contactLink = document.querySelector("#intro a[href^='mailto:']");
    const aboutSection = document.getElementById("about");

    const toBox = (element) => {
      const rect = element?.getBoundingClientRect();

      return rect
        ? {
          top: rect.top,
          bottom: rect.bottom,
        }
        : null;
    };

    return {
      viewportHeight: window.innerHeight,
      heading: toBox(heading),
      subtitle: toBox(paragraphs[0]),
      body: toBox(paragraphs[1]),
      contactLink: toBox(contactLink),
      aboutSection: toBox(aboutSection),
    };
  });

  expect(layout.heading).not.toBeNull();
  expect(layout.subtitle).not.toBeNull();
  expect(layout.body).not.toBeNull();
  expect(layout.contactLink).not.toBeNull();
  expect(layout.aboutSection).not.toBeNull();
  expect(layout.heading.top).toBeGreaterThanOrEqual(96);
  expect(layout.heading.bottom).toBeLessThan(layout.subtitle.top);
  expect(layout.subtitle.bottom).toBeLessThan(layout.body.top);
  expect(layout.body.bottom).toBeLessThan(layout.contactLink.top);
  expect(layout.contactLink.bottom).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.contactLink.bottom).toBeLessThanOrEqual(layout.aboutSection.top);
});

test("uses a split hero composition on desktop without crowding short mobile viewports", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByTestId("hero-visual")).toBeVisible();

  const desktopLayout = await page.evaluate(() => {
    const visual = document.querySelector("[data-testid='hero-visual']");
    const signal = document.querySelector("[data-testid='signal-graphic']");
    const copy = document.querySelector("[data-testid='hero-copy']");

    const toBox = (element) => {
      const rect = element?.getBoundingClientRect();

      return rect
        ? {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
        }
        : null;
    };

    return {
      visual: toBox(visual),
      signal: toBox(signal),
      copy: toBox(copy),
    };
  });

  expect(desktopLayout.visual).not.toBeNull();
  expect(desktopLayout.signal).not.toBeNull();
  expect(desktopLayout.copy).not.toBeNull();
  expect(desktopLayout.visual.right).toBeLessThan(desktopLayout.copy.left);
  expect(desktopLayout.visual.width).toBeGreaterThan(560);
  expect(desktopLayout.signal.width).toBeGreaterThan(560);
  expect(desktopLayout.copy.left).toBeGreaterThan(600);

  await page.setViewportSize({ width: 390, height: 667 });
  await page.reload();

  const mobileLayout = await page.evaluate(() => {
    const visual = document.querySelector("[data-testid='hero-visual']");
    const copy = document.querySelector("[data-testid='hero-copy']");
    const contactLink = document.querySelector("#intro a[href^='mailto:']");

    const toBox = (element) => {
      const rect = element?.getBoundingClientRect();

      return rect
        ? {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        }
        : null;
    };

    return {
      visual: toBox(visual),
      copy: toBox(copy),
      contactLink: toBox(contactLink),
      viewportHeight: window.innerHeight,
      visualDisplay: visual ? window.getComputedStyle(visual).display : null,
    };
  });

  expect(mobileLayout.copy).not.toBeNull();
  expect(mobileLayout.contactLink).not.toBeNull();
  expect(mobileLayout.visual).toBeNull();
  expect(mobileLayout.visualDisplay).toBeNull();
  expect(mobileLayout.copy.top).toBeGreaterThanOrEqual(0);
  expect(mobileLayout.copy.right).toBeLessThanOrEqual(390);
  expect(mobileLayout.contactLink.bottom).toBeLessThanOrEqual(mobileLayout.viewportHeight);

  await page.setViewportSize({ width: 844, height: 390 });
  await page.reload();

  const landscapeLayout = await page.evaluate(() => {
    const header = document.querySelector("header");
    const visual = document.querySelector("[data-testid='hero-visual']");
    const copy = document.querySelector("[data-testid='hero-copy']");
    const heading = document.querySelector("#intro h1");
    const contactLink = document.querySelector("#intro a[href^='mailto:']");

    const toBox = (element) => {
      const rect = element?.getBoundingClientRect();

      return rect
        ? {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        }
        : null;
    };

    return {
      header: toBox(header),
      visual: toBox(visual),
      copy: toBox(copy),
      heading: toBox(heading),
      contactLink: toBox(contactLink),
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });

  expect(landscapeLayout.visual).toBeNull();
  expect(landscapeLayout.header).not.toBeNull();
  expect(landscapeLayout.copy).not.toBeNull();
  expect(landscapeLayout.heading).not.toBeNull();
  expect(landscapeLayout.contactLink).not.toBeNull();
  expect(landscapeLayout.heading.top).toBeGreaterThanOrEqual(landscapeLayout.header.bottom);
  expect(landscapeLayout.copy.left).toBeGreaterThanOrEqual(0);
  expect(landscapeLayout.copy.right).toBeLessThanOrEqual(landscapeLayout.viewportWidth);
  expect(landscapeLayout.contactLink.bottom).toBeLessThanOrEqual(landscapeLayout.viewportHeight);
});

test("pairs the navbar wordmark with the personal mark", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const brandLink = page.getByRole("link", { name: "Rico Manifesto", exact: true });
  const brandMark = brandLink.locator("img.header-brand-mark");
  const brandLabel = brandLink.locator("span");

  await expect(brandLink).toBeVisible();
  await expect(brandMark).toBeVisible();
  await expect(brandMark).toHaveAttribute("src", "/favicon.svg");
  await expect(brandMark).toHaveAttribute("alt", "");
  await expect(brandMark).toHaveAttribute("aria-hidden", "true");
  await expect(brandLink).toHaveCSS("white-space", "nowrap");
  expect((await brandLabel.boundingBox())?.height).toBeLessThanOrEqual(24);
});

test("shows the static desktop signal when reduced motion is enabled", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const layout = await page.evaluate(() => {
    const visual = document.querySelector("[data-testid='hero-visual']");
    const signal = document.querySelector("[data-testid='signal-graphic']");
    const copy = document.querySelector("[data-testid='hero-copy']");
    const contactLink = document.querySelector("#intro a[href^='mailto:']");

    const toBox = (element) => {
      const rect = element?.getBoundingClientRect();

      return rect
        ? {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
        }
        : null;
    };

    return {
      visualExists: Boolean(visual),
      signalMotion: signal?.getAttribute("data-motion") ?? null,
      visual: toBox(visual),
      copy: toBox(copy),
      contactLink: toBox(contactLink),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  expect(layout.visualExists).toBe(true);
  expect(layout.signalMotion).toBe("reduced");
  expect(layout.visual).not.toBeNull();
  expect(layout.copy).not.toBeNull();
  expect(layout.contactLink).not.toBeNull();
  expect(layout.visual.left).toBeGreaterThanOrEqual(0);
  expect(layout.copy.right).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.contactLink.bottom).toBeLessThan(layout.viewportHeight);
});

test("exposes about technologies as a semantic list", async ({ page }) => {
  await page.goto("/");

  const technologies = page.getByRole("list", { name: "Technologies" });
  await expect(technologies).toBeVisible();
  await expect(technologies.getByRole("listitem")).toHaveCount(6);
  await expect(technologies.getByRole("listitem")).toHaveText([
    "Python",
    "TypeScript",
    "Next.js",
    "FastAPI",
    "Go",
    "LangGraph",
  ]);

  for (const technology of ["Python", "TypeScript", "Next.js", "FastAPI", "Go", "LangGraph"]) {
    await expect(technologies.getByText(technology, { exact: true })).toBeVisible();
  }

  const itemBoxes = await technologies.getByRole("listitem").evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();

      return { left: box.left, top: box.top };
    }),
  );

  expect(itemBoxes[0].left).toBeCloseTo(itemBoxes[1].left, 0);
  expect(itemBoxes[1].left).toBeCloseTo(itemBoxes[2].left, 0);
  expect(itemBoxes[3].left).toBeGreaterThan(itemBoxes[0].left);
  expect(itemBoxes[4].left).toBeCloseTo(itemBoxes[3].left, 0);
  expect(itemBoxes[5].left).toBeCloseTo(itemBoxes[3].left, 0);
  expect(itemBoxes[1].top).toBeGreaterThan(itemBoxes[0].top);
  expect(itemBoxes[2].top).toBeGreaterThan(itemBoxes[1].top);
});

test("names main portfolio sections from their visible headings", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("region", { name: "/ about me" })).toBeVisible();
  await expect(page.getByRole("region", { name: "/ experience" })).toBeVisible();
  await expect(page.getByRole("region", { name: "/ projects" })).toBeVisible();
});

test("keeps header social links easy to tap on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  for (const linkName of ["Email", "GitHub", "LinkedIn", "Medium"]) {
    const link = page.getByRole("link", { name: linkName });
    const box = await link.boundingBox();

    await expect(link).toBeVisible();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("exposes header social links as semantic navigation", async ({ page }) => {
  await page.goto("/");

  const socialNav = page.getByRole("navigation", { name: "Social links" });
  await expect(socialNav).toBeVisible();
  await expect(socialNav.getByRole("list")).toBeVisible();
  await expect(socialNav.getByRole("listitem")).toHaveCount(4);
  await expect(socialNav.getByRole("link", { name: "Email" })).toHaveAttribute(
    "href",
    "mailto:michaelrico124@gmail.com",
  );
  await expect(socialNav.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/ricomanifesto",
  );
  await expect(socialNav.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/michael-rico-19600314a",
  );
  await expect(socialNav.getByRole("link", { name: "Medium" })).toHaveAttribute(
    "href",
    "https://medium.com/@ricomanifesto",
  );
});

test("opens external portfolio links with safe new-tab attributes", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  for (const linkName of ["GitHub", "LinkedIn", "Medium"]) {
    const link = page.getByRole("link", { name: linkName });

    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }

  await page.getByRole("link", { name: "Projects" }).click();

  for (const linkName of [
    "View Threat Intelligence Research Workspace repository",
    "Open Threat Intelligence Research Workspace demo",
  ]) {
    const link = page.getByRole("link", { name: linkName });

    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

test("exposes footer copyright year as machine-readable time", async ({ page }) => {
  await page.goto("/");

  const currentYear = String(new Date().getFullYear());
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText(`© ${currentYear} Rico. All rights reserved.`);
  await expect(footer.locator("time")).toHaveAttribute("dateTime", currentYear);
  await expect(footer.locator("time")).toHaveText(currentYear);
});

test("keeps the mobile header inside narrow viewports", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");

  const viewportMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewportMetrics.scrollWidth).toBe(viewportMetrics.clientWidth);

  for (const linkName of ["Email", "GitHub", "LinkedIn", "Medium"]) {
    const box = await page.getByRole("link", { name: linkName }).boundingBox();

    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportMetrics.clientWidth + 0.5);
  }
});

test("keeps every mobile nav rail item reachable without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");

  const mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav).toBeVisible();

  for (const linkName of ["Home", "About", "Experience", "Projects", "Writing", "Contact"]) {
    const link = mobileNav.getByRole("link", { name: linkName });

    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();

    const metrics = await link.evaluate((element) => {
      const documentElement = document.documentElement;
      const box = element.getBoundingClientRect();

      return {
        clientWidth: documentElement.clientWidth,
        scrollWidth: documentElement.scrollWidth,
        left: box.left,
        right: box.right,
      };
    });

    expect(metrics.scrollWidth).toBe(metrics.clientWidth);
    expect(metrics.left).toBeGreaterThanOrEqual(-0.5);
    expect(metrics.right).toBeLessThanOrEqual(metrics.clientWidth + 0.5);
  }
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
  const selectedPanel = page.getByRole("tabpanel", { name: "DELL SECUREWORKS" });
  await expect(selectedPanel).toContainText("Information Security Researcher");

  await selectedPanel.focus();
  await expect(selectedPanel).toBeFocused();
  await expect(selectedPanel).toHaveCSS("outline-style", "solid");
});

test("renders visible focus for experience tabs", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Experience" }).click();
  const firstTab = page.getByRole("tab", { name: "SENTINELONE" });

  for (let index = 0; index < 30; index++) {
    if (await firstTab.evaluate((element) => document.activeElement === element).catch(() => false)) {
      break;
    }

    await page.keyboard.press("Tab");
  }

  await expect(firstTab).toBeFocused();
  await expect(firstTab).toHaveCSS("outline-style", "solid");
});

test("renders visible focus for keyboard navigation controls", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveCSS("background-color", "rgb(2, 6, 23)");
  await expect(skipLink).toHaveCSS("outline-color", "rgb(102, 178, 255)");
  await expect(skipLink).toHaveCSS("outline-offset", "4px");

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

test("moves focus to main content when the skip link is activated", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("main#main-content")).toBeFocused();
});

test("keeps inactive project slide links out of keyboard order", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(
    page.locator('[aria-label="Threat Intelligence Research Workspace, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(
    page.locator('[aria-label="Analyst-Ready Security Briefings, project slide 2 of 4"]'),
  ).toHaveAttribute("aria-hidden", "true");

  await page.getByRole("link", { name: "View Threat Intelligence Research Workspace repository" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Open Threat Intelligence Research Workspace demo" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Previous project" })).toBeFocused();

  await page.getByRole("button", { name: "Next project" }).click();
  await expect(
    page.locator('[aria-label="Threat Intelligence Research Workspace, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "true");
  await expect(
    page.locator('[aria-label="Analyst-Ready Security Briefings, project slide 2 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(
    page.locator('a[aria-label="View Threat Intelligence Research Workspace repository"]'),
  ).toHaveAttribute("tabindex", "-1");
});

test("moves keyboard focus to the active project action after arrow navigation", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const nextProjectButton = page.getByRole("button", { name: "Next project" });

  await nextProjectButton.focus();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("link", { name: "View Analyst-Ready Security Briefings repository" }),
  ).toBeFocused();
});

test("keeps repeated carousel Enter activation on the arrow control", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const nextProjectButton = page.getByRole("button", { name: "Next project" });

  await nextProjectButton.focus();
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");

  await expect(nextProjectButton).toBeFocused();

  await page.keyboard.up("Enter");
  await expect(
    page.getByRole("link", { name: "View Analyst-Ready Security Briefings repository" }),
  ).toBeFocused();
});

test("moves Space-activated carousel focus to the new active project action", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const nextProjectButton = page.getByRole("button", { name: "Next project" });

  await nextProjectButton.focus();
  await page.keyboard.press("Space");

  await expect(
    page.getByRole("link", { name: "View Analyst-Ready Security Briefings repository" }),
  ).toBeFocused();
  await expect(
    page.locator('a[aria-label="View Threat Intelligence Research Workspace repository"]'),
  ).toHaveAttribute("tabindex", "-1");
});

test("announces the active project slide after manual navigation", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const projectStatus = page.getByRole("status", { name: "Current project" });
  await expect(projectStatus).toHaveAttribute("aria-live", "off");
  await expect(projectStatus).toHaveText("Project 1 of 4: Threat Intelligence Research Workspace");

  await page.getByRole("button", { name: "Next project" }).click();
  await expect(projectStatus).toHaveAttribute("aria-live", "polite");
  await expect(projectStatus).toHaveText("Project 2 of 4: Analyst-Ready Security Briefings");
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

test("names project carousel slides by project title", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(
    page.getByRole("group", {
      name: "Threat Intelligence Research Workspace, project slide 1 of 4",
    }),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(
    page.getByRole("group", {
      name: "Analyst-Ready Security Briefings, project slide 2 of 4",
      includeHidden: true,
    }),
  ).toHaveAttribute("aria-hidden", "true");
});

test("treats project carousel background images as decorative", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const carousel = page.getByRole("region", { name: "Featured projects" });

  await expect(carousel.getByRole("img", { name: /Threat Intelligence Research Workspace/ })).toHaveCount(0);
  await expect(carousel.getByRole("heading", { name: "Threat Intelligence Research Workspace" })).toBeVisible();
  await expect(
    carousel.getByRole("link", { name: "View Threat Intelligence Research Workspace repository" }),
  ).toBeVisible();
});

test("keeps active project action links easy to tap", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();

  for (const linkName of [
    "View Threat Intelligence Research Workspace repository",
    "Open Threat Intelligence Research Workspace demo",
  ]) {
    const link = page.getByRole("link", { name: linkName });
    const box = await link.boundingBox();

    await expect(link).toBeVisible();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("updates the current project dot after manual navigation", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const firstDot = page.getByRole("button", { name: "Show Threat Intelligence Research Workspace" });
  const secondDot = page.getByRole("button", { name: "Show Analyst-Ready Security Briefings" });
  await expect(firstDot).toHaveAttribute("aria-current", "true");
  await expect(secondDot).not.toHaveAttribute("aria-current", "true");

  await secondDot.click();
  await expect(firstDot).not.toHaveAttribute("aria-current", "true");
  await expect(secondDot).toHaveAttribute("aria-current", "true");
});

test("updates the current project dot after keyboard activation", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  const firstDot = page.getByRole("button", { name: "Show Threat Intelligence Research Workspace" });
  const secondDot = page.getByRole("button", { name: "Show Analyst-Ready Security Briefings" });
  const thirdDot = page.getByRole("button", { name: "Show Exploitation Intelligence Reports" });

  await secondDot.focus();
  await page.keyboard.press("Enter");
  await expect(firstDot).not.toHaveAttribute("aria-current", "true");
  await expect(secondDot).toHaveAttribute("aria-current", "true");
  await expect(secondDot).toBeFocused();

  await thirdDot.focus();
  await page.keyboard.press("Space");
  await expect(secondDot).not.toHaveAttribute("aria-current", "true");
  await expect(thirdDot).toHaveAttribute("aria-current", "true");
  await expect(thirdDot).toBeFocused();
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
    "Threat Intelligence Research Workspace",
    "Analyst-Ready Security Briefings",
    "Exploitation Intelligence Reports",
    "Audit-Ready GRC Intelligence",
  ]) {
    const dot = page.getByRole("button", { name: `Show ${projectName}` });
    const box = await dot.boundingBox();

    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("pauses project auto-rotation while carousel has keyboard focus", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await page.getByRole("link", { name: "View Threat Intelligence Research Workspace repository" }).focus();
  await page.clock.fastForward(10500);

  await expect(
    page.locator('[aria-label="Threat Intelligence Research Workspace, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(page.getByRole("link", { name: "View Threat Intelligence Research Workspace repository" })).toBeFocused();
});

test("pauses project auto-rotation while carousel is hovered", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await page.locator('[aria-label="Threat Intelligence Research Workspace, project slide 1 of 4"]').hover();
  await page.clock.fastForward(10500);

  await expect(
    page.locator('[aria-label="Threat Intelligence Research Workspace, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
});

test("links the homepage to the latest first-party article", async ({ page }) => {
  await page.goto("/");

  const writingSection = page.getByRole("region", { name: "Latest Writing" });
  await expect(writingSection).toBeVisible();
  await expect(
    writingSection.getByRole("heading", { level: 3, name: "I Thought I Was Reading a Repo" }),
  ).toBeVisible();
  await expect(
    writingSection.getByRole("link", { name: "Read I Thought I Was Reading a Repo" }),
  ).toHaveAttribute("href", "/writing/i-thought-i-was-reading-a-repo/");
});

test("serves the writing archive as crawlable HTML", async ({ page }) => {
  const response = await page.goto("/writing/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Writing" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ricomanifesto.com/writing/",
  );
  await expect(page.getByRole("link", { name: "Subscribe via RSS" })).toHaveAttribute("href", "/rss.xml");

  const desktopNav = page.getByRole("navigation", { name: "Primary" });
  await expect(desktopNav.getByRole("link", { name: "Writing" })).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("serves the first writing article with article metadata and source links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/writing/i-thought-i-was-reading-a-repo/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "I Thought I Was Reading a Repo" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ricomanifesto.com/writing/i-thought-i-was-reading-a-repo/",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    "content",
    "2026-08-11",
  );
  await expect(page.getByRole("link", { name: "Anthropic’s work on mechanistic interpretability" })).toHaveAttribute(
    "href",
    "https://www.anthropic.com/research/team/interpretability",
  );
  await expect(page.getByRole("link", { name: "Prime Agent" })).toHaveAttribute(
    "href",
    "https://github.com/PrimeIntellect-ai/prime-agent",
  );

  const viewportMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewportMetrics.scrollWidth).toBe(viewportMetrics.clientWidth);
});

test("publishes the first article in the writing RSS feed", async ({ request }) => {
  const response = await request.get("/rss.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  const body = await response.text();
  expect(body).toContain("I Thought I Was Reading a Repo");
  expect(body).toContain("https://ricomanifesto.com/writing/i-thought-i-was-reading-a-repo/");
});

for (const { slug, heading, repository } of [
  {
    slug: "sentrysearch",
    heading: "Threat Intelligence Research Workspace",
    repository: "https://github.com/ricomanifesto/SentrySearch",
  },
  {
    slug: "sentrydigest",
    heading: "Analyst-Ready Security Briefings",
    repository: "https://github.com/ricomanifesto/SentryDigest",
  },
  {
    slug: "sentryinsight",
    heading: "Exploitation Intelligence Reports",
    repository: "https://github.com/ricomanifesto/SentryInsight",
  },
  {
    slug: "grcinsight",
    heading: "Audit-Ready GRC Intelligence",
    repository: "https://github.com/ricomanifesto/GRCInsight",
  },
]) {
  test(`serves the ${slug} project route as crawlable HTML`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(`/projects/${slug}/index.html`);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://ricomanifesto.com/projects/${slug}/`,
    );
    await expect(page.getByRole("link", { name: "View repository" })).toHaveAttribute(
      "href",
      repository,
    );
    await expect(page.getByRole("navigation", { name: "Portfolio" })).toBeVisible();

    const mainBox = await page.locator("main").boundingBox();
    expect(mainBox).not.toBeNull();
    expect(mainBox.x).toBeGreaterThanOrEqual(-0.5);
    expect(mainBox.x + mainBox.width).toBeLessThanOrEqual(390.5);
  });
}

test("serves the SentrySearch LLM evaluation case study as crawlable HTML", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/projects/sentrysearch/llm-evaluation/index.html");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "LLM Evaluation for Threat-Intelligence Workflows" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "What this proves and what it does not" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ricomanifesto.com/projects/sentrysearch/llm-evaluation/",
  );
  await expect(page.getByRole("link", { name: "View SentrySearch repository" })).toHaveAttribute(
    "href",
    "https://github.com/ricomanifesto/SentrySearch",
  );

  const mainBox = await page.locator("main").boundingBox();
  expect(mainBox).not.toBeNull();
  expect(mainBox.x).toBeGreaterThanOrEqual(-0.5);
  expect(mainBox.x + mainBox.width).toBeLessThanOrEqual(390.5);
});
