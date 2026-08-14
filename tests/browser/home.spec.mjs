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

test("renders the complete personal heading in initial HTML", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  const visibleText = heading
    .replace(/<[^>]*aria-hidden=["']true["'][^>]*>[\s\S]*?<\/[^>]+>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  expect(response.ok()).toBe(true);
  expect(visibleText).toBe("Hi, I'm Michael Rico");
});

test("exposes mobile primary navigation from shared section links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("list")).toBeVisible();
  await expect(mobileNav.getByRole("listitem")).toHaveCount(5);
  await expect(mobileNav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/#intro");
  await expect(mobileNav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/#about");
  await expect(mobileNav.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "/#experience");
  await expect(mobileNav.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/#projects");
  await expect(mobileNav.getByRole("link", { name: "Writing" })).toHaveAttribute("href", "/writing/");

  for (const linkName of ["Home", "About", "Experience", "Projects", "Writing"]) {
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
  await expect(page.getByRole("link", { name: "Email" })).toHaveAttribute(
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

test("links to Michael Rico's GitHub profile from the About section", async ({ page }) => {
  await page.goto("/");

  const aboutSection = page.getByRole("region", { name: "/ about me" });
  const githubProfileLink = aboutSection.getByRole("link", { name: "Michael Rico on GitHub" });

  await expect(githubProfileLink).toBeVisible();
  await expect(githubProfileLink).toHaveAttribute("href", "https://github.com/ricomanifesto");
  await expect(githubProfileLink).toHaveAttribute("target", "_blank");
  await expect(githubProfileLink).toHaveAttribute("rel", "noopener noreferrer");
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
  await expect(page.locator("#intro .hero-subtitle")).toHaveClass(/hero-copy-compact/);

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
  await expect(page.getByTestId("hero-visual")).toBeVisible();
  await expect(page.getByTestId("signal-graphic")).toHaveAttribute("data-motion", "reduced");

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
  const socialNav = page.getByRole("navigation", { name: "Social links" });

  for (const linkName of ["Email", "GitHub", "LinkedIn", "Medium"]) {
    const link = socialNav.getByRole("link", { name: linkName, exact: true });
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
    "https://www.linkedin.com/in/ricomanifesto",
  );
  await expect(socialNav.getByRole("link", { name: "Medium" })).toHaveAttribute(
    "href",
    "https://medium.com/@ricomanifesto",
  );
});

test("opens external portfolio links with safe new-tab attributes", async ({ page }) => {
  await installReducedMotionController(page, true);
  await page.goto("/");
  const socialNav = page.getByRole("navigation", { name: "Social links" });

  for (const linkName of ["GitHub", "LinkedIn", "Medium"]) {
    const link = socialNav.getByRole("link", { name: linkName, exact: true });

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
  await expect(footer).toContainText(`© ${currentYear} Rico Manifesto. All rights reserved.`);
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
  const socialNav = page.getByRole("navigation", { name: "Social links" });

  for (const linkName of ["Email", "GitHub", "LinkedIn", "Medium"]) {
    const box = await socialNav.getByRole("link", { name: linkName, exact: true }).boundingBox();

    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportMetrics.clientWidth + 0.5);
  }
});

test("keeps the mobile header through tablet widths", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toBeHidden();

  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const socialNav = page.getByRole("navigation", { name: "Social links" });
  for (const linkName of ["Email", "GitHub", "LinkedIn", "Medium"]) {
    const box = await socialNav.getByRole("link", { name: linkName, exact: true }).boundingBox();

    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(clientWidth + 0.5);
  }

  await page.getByRole("navigation", { name: "Mobile primary" }).getByRole("link", { name: "About" }).click();
  const tabletSectionPositions = await page.evaluate(() => ({
    headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
    aboutTop: document.querySelector("#about")?.getBoundingClientRect().top ?? 0,
  }));
  expect(tabletSectionPositions.aboutTop).toBeGreaterThanOrEqual(tabletSectionPositions.headerBottom - 1);
});

test("keeps every mobile nav rail item reachable without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");

  const mobileNav = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(mobileNav).toBeVisible();

  for (const linkName of ["Home", "About", "Experience", "Projects", "Writing"]) {
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
  const brandLink = page.getByRole("link", { name: "Rico Manifesto", exact: true });
  await expect(brandLink).toBeFocused();
  await expect(brandLink).toHaveCSS("outline-style", "solid");

  const sayHiLink = page.getByRole("link", { name: "Say hi!" });
  await sayHiLink.focus();
  await expect(sayHiLink).toBeFocused();
  await expect(sayHiLink).toHaveCSS("outline-style", "solid");

  await page.getByRole("link", { name: "Projects" }).click();
  await page.keyboard.press("Tab");
  const firstProjectLink = page.getByRole("link", { name: "Read SentrySearch case study" });
  await firstProjectLink.focus();
  await expect(firstProjectLink).toBeFocused();
  await expect(firstProjectLink).toHaveCSS("outline-style", "solid");
});

test("moves focus to main content when the skip link is activated", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("main#main-content")).toBeFocused();
});

test("links the homepage to the remaining first-party article", async ({ page }) => {
  await page.goto("/");

  const writingSection = page.getByRole("region", { name: "/ writing" });
  await expect(writingSection).toBeVisible();
  await expect(
    writingSection.getByRole("heading", { level: 3, name: "I Thought I Was Reading a Repo" }),
  ).toBeVisible();
  await expect(
    writingSection.getByRole("link", { name: "Read I Thought I Was Reading a Repo" }),
  ).toHaveAttribute("href", "/writing/i-thought-i-was-reading-a-repo/");

  const structuredData = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent(),
  );
  const blogPosting = structuredData["@graph"].find(
    (entry) => entry["@id"] === "https://ricomanifesto.com/writing/i-thought-i-was-reading-a-repo/#article",
  );
  expect(blogPosting).toMatchObject({
    url: "https://ricomanifesto.com/writing/i-thought-i-was-reading-a-repo/",
    headline: "I Thought I Was Reading a Repo",
    image: "https://ricomanifesto.com/images/writing/i-thought-i-was-reading-a-repo.png",
    datePublished: "2026-08-11",
  });
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

test("exposes the Writing hierarchy as visible and structured breadcrumbs", async ({ page }) => {
  for (const { href, currentName, expectedItems } of [
    { href: "/writing/", currentName: "Writing", expectedItems: 2 },
    {
      href: "/writing/i-thought-i-was-reading-a-repo/",
      currentName: "I Thought I Was Reading a Repo",
      expectedItems: 3,
    },
  ]) {
    await page.goto(href);

    const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(breadcrumbs.getByText(currentName, { exact: true })).toHaveAttribute("aria-current", "page");

    const structuredData = JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent(),
    );
    const graph = structuredData["@graph"] ?? [structuredData];
    const breadcrumbList = graph.find((entry) => entry["@type"] === "BreadcrumbList");
    expect(breadcrumbList.itemListElement).toHaveLength(expectedItems);
  }
});

test("renders Writing routes without client hydration", async ({ page }) => {
  for (const href of [
    "/writing/",
    "/writing/i-thought-i-was-reading-a-repo/",
  ]) {
    const response = await page.goto(href);

    expect(response?.status()).toBe(200);
    await expect(page.locator("astro-island")).toHaveCount(0);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  }
});

test("keeps Writing content below the tablet header", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });

  for (const { href, selector } of [
    { href: "/writing/", selector: ".writing-eyebrow" },
    {
      href: "/writing/i-thought-i-was-reading-a-repo/",
      selector: ".writing-article",
    },
  ]) {
    await page.goto(href);
    await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();

    const positions = await page.evaluate((contentSelector) => {
      const header = document.querySelector(".header-shell");
      const content = document.querySelector(contentSelector);

      return {
        headerBottom: header?.getBoundingClientRect().bottom ?? 0,
        contentTop: content?.getBoundingClientRect().top ?? 0,
      };
    }, selector);

    expect(positions.contentTop).toBeGreaterThanOrEqual(positions.headerBottom);
  }
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
  await expect(page.locator('meta[property="article:author"]')).toHaveAttribute(
    "content",
    "https://ricomanifesto.com/",
  );
  await expect(page.locator('meta[property="article:tag"]')).toHaveCount(3);
  expect(await page.locator('meta[property="article:tag"]').evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("content")),
  )).toEqual([
    "AI agents",
    "Observability",
    "Cybersecurity",
  ]);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://ricomanifesto.com/images/writing/i-thought-i-was-reading-a-repo.png",
  );
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    "Signal paths converging into a clear execution trace for I Thought I Was Reading a Repo.",
  );
  const structuredData = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent(),
  );
  const blogPosting = structuredData["@graph"].find((entry) => entry["@type"] === "BlogPosting");
  expect(blogPosting.image).toBe(
    "https://ricomanifesto.com/images/writing/i-thought-i-was-reading-a-repo.png",
  );
  await expect(page.getByRole("link", { name: "Michael Rico", exact: true })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Michael Rico", exact: true })).toHaveAttribute("rel", "author");
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

test("does not publish the removed writing article or its assets", async ({ request }) => {
  for (const path of [
    "/writing/the-deploy-wasnt-the-proof/",
    "/images/writing/the-deploy-wasnt-the-proof.png",
    "/brand/writing/the-deploy-wasnt-the-proof.svg",
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
  }
});

test("publishes only the remaining article in the writing RSS feed", async ({ request }) => {
  const response = await request.get("/rss.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  const body = await response.text();
  expect(body).toMatch(/<\?xml-stylesheet (?=[^?]*href="\/rss\.xsl")(?=[^?]*type="text\/xsl")[^?]*\?>/);
  expect(body).toContain("I Thought I Was Reading a Repo");
  expect(body).toContain("https://ricomanifesto.com/writing/i-thought-i-was-reading-a-repo/");
  expect(body).not.toContain("The Deploy Wasn’t the Proof");
  expect(body).not.toContain("https://ricomanifesto.com/writing/the-deploy-wasnt-the-proof/");

  const stylesheetResponse = await request.get("/rss.xsl");
  expect(stylesheetResponse.status()).toBe(200);
  const stylesheet = await stylesheetResponse.text();
  expect(stylesheet).toContain("<h1>Subscribe to");
  expect(stylesheet).toContain('select="rss/channel/title"');
});

test("publishes content-backed modification dates for Writing routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");

  expect(response.status()).toBe(200);
  const body = await response.text();
  for (const [url, lastModified] of [
    ["https://ricomanifesto.com/writing/", "2026-08-11"],
    ["https://ricomanifesto.com/writing/i-thought-i-was-reading-a-repo/", "2026-08-11"],
  ]) {
    const entry = Array.from(body.matchAll(/<url>[\s\S]*?<\/url>/g), ([match]) => match)
      .find((candidate) => candidate.includes(`<loc>${url}</loc>`));
    expect(entry).toContain(`<lastmod>${lastModified}</lastmod>`);
  }
  expect(body).not.toContain("https://ricomanifesto.com/writing/the-deploy-wasnt-the-proof/");
});

test("renders the RSS feed as an understandable subscription page", async ({ page }) => {
  const response = await page.goto("/rss.xml");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Subscribe to Rico Manifesto Writing" })).toBeVisible();
  await expect(page.getByText("11 Aug 2026", { exact: true })).toBeVisible();
  await expect(page.getByText("13 Aug 2026", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "The Deploy Wasn’t the Proof" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "I Thought I Was Reading a Repo" })).toHaveAttribute(
    "href",
    "https://ricomanifesto.com/writing/i-thought-i-was-reading-a-repo/",
  );
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
    await expect(page.getByRole("navigation", { name: "Project navigation" })).toBeVisible();

    const structuredData = JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent(),
    );
    const projectSchema = structuredData["@graph"].find(
      (entry) => entry["@type"] === "SoftwareSourceCode",
    );
    expect(projectSchema.author).toMatchObject({
      "@type": "Person",
      "@id": "https://ricomanifesto.com/#michael-rico",
      name: "Michael Rico",
      url: "https://ricomanifesto.com/",
    });

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
  const evidenceRevision = "39c86789bdca5ca0ada2161624c1831f425049c7";
  const evidenceVintage = page.locator(".project-evidence-vintage");
  await expect(evidenceVintage).toHaveText("Evidence pinned at 39c86789");
  await expect(evidenceVintage.getByRole("link", {
    name: "View SentrySearch evidence revision 39c86789",
  })).toHaveAttribute(
    "href",
    `https://github.com/ricomanifesto/SentrySearch/commit/${evidenceRevision}`,
  );
  const evidenceLinks = page.locator(".project-evidence-list a");
  await expect(evidenceLinks).toHaveCount(4);
  const evidenceHrefs = await evidenceLinks.evaluateAll((links) => (
    links.map((link) => link.getAttribute("href"))
  ));
  expect(evidenceHrefs.every((href) => (
    /^https:\/\/github\.com\/ricomanifesto\/SentrySearch\/blob\/[0-9a-f]{40}\/src\/core\//.test(href)
  ))).toBe(true);
  expect(evidenceHrefs.some((href) => /\/blob\/(?:main|master)\//.test(href))).toBe(false);

  const structuredData = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent(),
  );
  const articleSchema = structuredData["@graph"].find((entry) => entry["@type"] === "Article");
  expect(articleSchema.about.version).toBe(evidenceRevision);
  expect(articleSchema.author).toMatchObject({
    "@type": "Person",
    "@id": "https://ricomanifesto.com/#michael-rico",
    name: "Michael Rico",
    url: "https://ricomanifesto.com/",
  });

  const mainBox = await page.locator("main").boundingBox();
  expect(mainBox).not.toBeNull();
  expect(mainBox.x).toBeGreaterThanOrEqual(-0.5);
  expect(mainBox.x + mainBox.width).toBeLessThanOrEqual(390.5);
});

test("describes SentryDigest with its scheduled three-hour cadence", async ({ page }) => {
  await page.goto("/");

  const digestCard = page.getByTestId("project-collection").getByRole("article").filter({
    has: page.getByText("SentryDigest", { exact: true }),
  });
  await expect(digestCard).toContainText("scheduled three-hour briefing");
  await expect(digestCard).not.toContainText("daily analyst-ready briefing");

  await page.goto("/projects/sentrydigest/");
  await expect(page.locator(".project-detail-description")).toContainText(
    "scheduled three-hour briefing",
  );
  await expect(page.locator(".project-detail-description")).not.toContainText(
    "daily analyst-ready briefing",
  );
});
