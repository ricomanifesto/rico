import { expect, test } from "@playwright/test";

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
  expect(visibleText).toBe("I build security systems that show their work.");
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
  await expect(page.getByRole("link", { name: "Email", exact: true })).toHaveAttribute(
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
  await expect(experienceLink).toHaveCSS("font-weight", "700");
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
  await expect(aboutLink).toHaveCSS("font-weight", "700");
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

  const contactLink = page.getByRole("link", { name: "Email me" });
  await expect(contactLink).toBeVisible();
  await expect(contactLink).toHaveAttribute("href", "mailto:michaelrico124@gmail.com");

  const box = await contactLink.boundingBox();

  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test("links to Michael Rico's GitHub profile from the About section", async ({ page }) => {
  await page.goto("/");

  const aboutSection = page.getByRole("region", { name: "About" });
  const githubProfileLink = aboutSection.getByRole("link", { name: "Michael Rico on GitHub" });

  await expect(githubProfileLink).toBeVisible();
  await expect(githubProfileLink).toHaveAttribute("href", "https://github.com/ricomanifesto");
  await expect(githubProfileLink).toHaveAttribute("target", "_blank");
  await expect(githubProfileLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("keeps mobile hero content visible before the next section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heading = page.getByRole("heading", { name: "I build security systems that show their work." });
  const subtitle = page.getByText("I'm Michael Rico, a Staff Threat Hunter focused on threat intelligence, incident readiness, and detection engineering.");
  const body = page.getByText("My projects turn noisy signals into clear decisions, with the evidence, failure modes, and history left visible.");
  const contactLink = page.getByRole("link", { name: "Email me" });

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

test("uses an authored editorial hero without decorative dashboard motifs", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await expect(page.getByTestId("hero-copy")).toBeVisible();
  await expect(page.getByRole("heading", {
    name: "I build security systems that show their work.",
  })).toBeVisible();
  await expect(page.locator(".network-grid, .signal-graphic, [data-testid='hero-visual']")).toHaveCount(0);

  const visualContract = await page.evaluate(() => {
    const hero = document.querySelector("#intro");
    const heading = document.querySelector("#intro h1");
    const about = document.getElementById("about");
    const headingStyle = heading ? getComputedStyle(heading) : null;
    const heroBox = hero?.getBoundingClientRect();
    const aboutBox = about?.getBoundingClientRect();

    return {
      heroHeight: heroBox?.height ?? 0,
      aboutTop: aboutBox?.top ?? 0,
      viewportHeight: innerHeight,
      headingFamily: headingStyle?.fontFamily ?? "",
      headingShadow: headingStyle?.textShadow ?? "",
      headingAnimation: headingStyle?.animationName ?? "",
    };
  });

  expect(visualContract.heroHeight).toBeGreaterThanOrEqual(visualContract.viewportHeight - 1);
  expect(visualContract.aboutTop).toBeGreaterThanOrEqual(visualContract.viewportHeight - 1);
  expect(visualContract.headingFamily).toContain("Roboto Slab");
  expect(visualContract.headingShadow).toBe("none");
  expect(visualContract.headingAnimation).toBe("none");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(mobileOverflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("link", { name: "Email me" })).toBeVisible();
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

test("exposes about technologies as a semantic list", async ({ page }) => {
  await page.goto("/");

  const technologies = page.getByRole("list", { name: "Technologies" });
  await expect(technologies).toBeVisible();
  await expect(technologies.getByRole("listitem")).toHaveCount(6);
  await expect(technologies.getByRole("listitem")).toHaveText([
    "Python",
    "Go",
    "TypeScript",
    "PostgreSQL",
    "AWS",
    "LangGraph",
  ]);

  for (const technology of ["Python", "Go", "TypeScript", "PostgreSQL", "AWS", "LangGraph"]) {
    await expect(technologies.getByText(technology, { exact: true })).toBeVisible();
  }

  await expect(technologies).toHaveCSS("display", "flex");
  await expect(technologies.getByRole("listitem").first()).toHaveCSS("font-family", /Open Sans/);
});

test("names main portfolio sections from their visible headings", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("region", { name: "About" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Experience" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Selected work" })).toBeVisible();
});

test("uses restrained light screenshot mattes and a deliberate project type scale", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/#projects");

  const mediaFrames = page.locator(".project-card-media");
  await expect(mediaFrames).toHaveCount(4);

  for (const frame of await mediaFrames.all()) {
    const contract = await frame.evaluate((element) => {
      const image = element.querySelector(".project-card-image");
      const frameBox = element.getBoundingClientRect();
      const imageBox = image?.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        background: style.backgroundColor,
        borderWidth: parseFloat(style.borderTopWidth),
        inset: imageBox ? imageBox.left - frameBox.left : 0,
        padding: parseFloat(style.paddingTop),
        shadow: style.boxShadow,
      };
    });

    expect(contract.background).toBe("rgb(9, 12, 16)");
    expect(contract.borderWidth).toBe(0);
    expect(contract.padding).toBeGreaterThanOrEqual(4);
    expect(contract.padding).toBeLessThanOrEqual(12);
    expect(contract.inset).toBeGreaterThanOrEqual(contract.padding);
    expect(contract.shadow).toBe("none");
  }

  const projectTypeScale = await page.locator("#projects").evaluate((section) => {
    const textElements = Array.from(section.querySelectorAll("*"))
      .filter((element) => element.children.length === 0 && element.textContent?.trim());

    return Array.from(new Set(
      textElements.map((element) => getComputedStyle(element).fontSize),
    )).sort((first, second) => parseFloat(first) - parseFloat(second));
  });

  expect(projectTypeScale).toEqual(["15px", "16px", "38.4px", "64px"]);
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
  await page.goto("/");
  const socialNav = page.getByRole("navigation", { name: "Social links" });

  for (const linkName of ["GitHub", "LinkedIn", "Medium"]) {
    const link = socialNav.getByRole("link", { name: linkName, exact: true });

    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }

  await page.getByRole("link", { name: "Projects" }).click();

  for (const linkName of [
    "Repository for Threat Intelligence Research Workspace",
    "Live site for Threat Intelligence Research Workspace",
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

test("shows the complete chronological experience without interaction", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Experience" }).click();
  const experience = page.getByRole("region", { name: "Experience" });
  const roles = experience.getByRole("article");
  await expect(roles).toHaveCount(3);
  await expect(roles.nth(0)).toContainText("SentinelOne");
  await expect(roles.nth(0)).toContainText("Staff Threat Hunter");
  await expect(roles.nth(1)).toContainText("Uber");
  await expect(roles.nth(1)).toContainText("Threat Detection Engineer II");
  await expect(roles.nth(2)).toContainText("Dell Secureworks");
  await expect(roles.nth(2)).toContainText("Information Security Researcher");
  await expect(page.locator("#experience [role='tab'], #experience [role='tabpanel']")).toHaveCount(0);
});

test("renders visible focus for keyboard navigation controls", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveCSS("background-color", "rgb(5, 7, 10)");
  await expect(skipLink).toHaveCSS("outline-color", "rgb(185, 217, 245)");
  await expect(skipLink).toHaveCSS("outline-offset", "4px");

  await page.keyboard.press("Tab");
  const brandLink = page.getByRole("link", { name: "Rico Manifesto", exact: true });
  await expect(brandLink).toBeFocused();
  await expect(brandLink).toHaveCSS("outline-style", "solid");

  const emailLink = page.getByRole("link", { name: "Email me" });
  await emailLink.focus();
  await expect(emailLink).toBeFocused();
  await expect(emailLink).toHaveCSS("outline-style", "solid");

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

  const writingSection = page.getByRole("region", { name: "Writing" });
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
