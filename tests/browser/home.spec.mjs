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

  for (const linkName of ["Home", "About", "Experience", "Projects", "Contact"]) {
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
  await expect(desktopNav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#intro");
  await expect(desktopNav.getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
  await expect(desktopNav.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "#experience");
  await expect(desktopNav.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "#projects");
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

  const heading = page.getByRole("heading", { name: "Hi, I'm Rico" });
  const subtitle = page.getByText("I build things when inspiration strikes.");
  const body = page.getByText("I'm a Staff Threat Hunter from Chicago, Illinois.");
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
  expect(layout.heading.top).toBeGreaterThanOrEqual(0);
  expect(layout.heading.bottom).toBeLessThan(layout.subtitle.top);
  expect(layout.subtitle.bottom).toBeLessThan(layout.body.top);
  expect(layout.body.bottom).toBeLessThan(layout.contactLink.top);
  expect(layout.contactLink.bottom).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.contactLink.bottom).toBeLessThanOrEqual(layout.aboutSection.top);
});

test("exposes about technologies as a semantic list", async ({ page }) => {
  await page.goto("/");

  const technologies = page.getByRole("list", { name: "Technologies" });
  await expect(technologies).toBeVisible();
  await expect(technologies.getByRole("listitem")).toHaveCount(6);
  await expect(technologies.getByRole("listitem")).toHaveText([
    "Python",
    "Next.js",
    "FastAPI",
    "Go",
    "scikit-learn",
    "LangGraph",
  ]);

  for (const technology of ["Python", "Next.js", "FastAPI", "Go", "scikit-learn", "LangGraph"]) {
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

  for (const linkName of ["Home", "About", "Experience", "Projects", "Contact"]) {
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
    page.locator('[aria-label="AI-Powered Threat Intelligence Platform, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(
    page.locator('[aria-label="Cybersecurity News Aggregator, project slide 2 of 4"]'),
  ).toHaveAttribute("aria-hidden", "true");

  await page.getByRole("link", { name: "View AI-Powered Threat Intelligence Platform repository" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Open AI-Powered Threat Intelligence Platform demo" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Previous project" })).toBeFocused();

  await page.getByRole("button", { name: "Next project" }).click();
  await expect(
    page.locator('[aria-label="AI-Powered Threat Intelligence Platform, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "true");
  await expect(
    page.locator('[aria-label="Cybersecurity News Aggregator, project slide 2 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(
    page.locator('a[aria-label="View AI-Powered Threat Intelligence Platform repository"]'),
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
    page.getByRole("link", { name: "View Cybersecurity News Aggregator repository" }),
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
    page.getByRole("link", { name: "View Cybersecurity News Aggregator repository" }),
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
    page.getByRole("link", { name: "View Cybersecurity News Aggregator repository" }),
  ).toBeFocused();
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

test("names project carousel slides by project title", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(
    page.getByRole("group", {
      name: "AI-Powered Threat Intelligence Platform, project slide 1 of 4",
    }),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(
    page.getByRole("group", {
      name: "Cybersecurity News Aggregator, project slide 2 of 4",
      includeHidden: true,
    }),
  ).toHaveAttribute("aria-hidden", "true");
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

test("keeps active project action links easy to tap", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installReducedMotionController(page, true);
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();

  for (const linkName of [
    "View AI-Powered Threat Intelligence Platform repository",
    "Open AI-Powered Threat Intelligence Platform demo",
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
  const firstDot = page.getByRole("button", { name: "Show AI-Powered Threat Intelligence Platform" });
  const secondDot = page.getByRole("button", { name: "Show Cybersecurity News Aggregator" });
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
  const firstDot = page.getByRole("button", { name: "Show AI-Powered Threat Intelligence Platform" });
  const secondDot = page.getByRole("button", { name: "Show Cybersecurity News Aggregator" });
  const thirdDot = page.getByRole("button", { name: "Show Cybersecurity Exploit Reporter" });

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

  await expect(
    page.locator('[aria-label="AI-Powered Threat Intelligence Platform, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
  await expect(page.getByRole("link", { name: "View AI-Powered Threat Intelligence Platform repository" })).toBeFocused();
});

test("pauses project auto-rotation while carousel is hovered", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Projects" }).click();
  await page.locator('[aria-label="AI-Powered Threat Intelligence Platform, project slide 1 of 4"]').hover();
  await page.waitForTimeout(10500);

  await expect(
    page.locator('[aria-label="AI-Powered Threat Intelligence Platform, project slide 1 of 4"]'),
  ).toHaveAttribute("aria-hidden", "false");
});
