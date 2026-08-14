import { expect, test } from "@playwright/test";

const projects = [
  {
    title: "Threat Intelligence Research Workspace",
    name: "SentrySearch",
    slug: "sentrysearch",
    evidenceHref: "/projects/sentrysearch/llm-evaluation/",
    evidenceExternal: false,
  },
  {
    title: "Analyst-Ready Security Briefings",
    name: "SentryDigest",
    slug: "sentrydigest",
    evidenceHref: "https://ricomanifesto.github.io/SentryDigest/archive/",
    evidenceExternal: true,
  },
  {
    title: "Exploitation Intelligence Reports",
    name: "SentryInsight",
    slug: "sentryinsight",
    evidenceHref: "https://ricomanifesto.github.io/SentryInsight/reports/",
    evidenceExternal: true,
  },
  {
    title: "Audit-Ready GRC Intelligence",
    name: "GRCInsight",
    slug: "grcinsight",
    evidenceHref: "https://ricomanifesto.github.io/GRCInsight/publication-history.json",
    evidenceExternal: true,
  },
];

test("changes Experience with pointer input and the complete keyboard map", async ({ page }) => {
  await page.goto("/");

  const sentinelOne = page.getByRole("tab", { name: "SENTINELONE" });
  const uber = page.getByRole("tab", { name: "UBER" });
  const dellSecureworks = page.getByRole("tab", { name: "DELL SECUREWORKS" });

  await uber.click();
  await expect(uber).toHaveAttribute("aria-selected", "true");
  await expect(uber).toHaveAttribute("tabindex", "0");
  await expect(sentinelOne).toHaveAttribute("tabindex", "-1");
  await expect(page.getByRole("tabpanel", { name: "UBER" })).toContainText(
    "Threat Detection Engineer II",
  );

  await uber.focus();
  await page.keyboard.press("ArrowRight");
  await expect(dellSecureworks).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(sentinelOne).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(dellSecureworks).toBeFocused();
  await page.keyboard.press("Home");
  await expect(sentinelOne).toBeFocused();
  await page.keyboard.press("End");
  await expect(dellSecureworks).toBeFocused();
  await expect(dellSecureworks).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "DELL SECUREWORKS" })).toContainText(
    "Information Security Researcher",
  );
});

test("shows all project case studies in a two-by-two desktop collection", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const collection = page.getByTestId("project-collection");
  const cards = collection.getByRole("article");
  await expect(cards).toHaveCount(4);

  for (const project of projects) {
    await expect(collection.getByRole("heading", { name: project.title })).toBeVisible();
    await expect(
      collection.getByRole("link", { name: `Read ${project.name} case study` }),
    ).toHaveAttribute("href", `/projects/${project.slug}/`);
    const evidenceLink = collection.getByRole("link", {
      name: `Inspect ${project.name} evidence`,
    });
    await expect(evidenceLink).toHaveAttribute("href", project.evidenceHref);
    if (project.evidenceExternal) {
      await expect(evidenceLink).toHaveAttribute("target", "_blank");
      await expect(evidenceLink).toHaveAttribute("rel", "noopener noreferrer");
    } else {
      await expect(evidenceLink).not.toHaveAttribute("target", "_blank");
    }
  }

  const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
    const { left, top, width } = element.getBoundingClientRect();
    return { left, top, width };
  }));

  expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThan(2);
  expect(Math.abs(boxes[2].top - boxes[3].top)).toBeLessThan(2);
  expect(boxes[2].top).toBeGreaterThan(boxes[0].top + 100);
  expect(boxes[1].left).toBeGreaterThan(boxes[0].left + boxes[0].width - 2);
  expect(Math.abs(boxes[0].left - boxes[2].left)).toBeLessThan(2);
});

test("uses user-controlled project scroll snapping on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  await page.goto("/");

  const collection = page.getByTestId("project-collection");
  const cards = collection.getByRole("article");
  await expect(cards).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Previous project" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next project" })).toHaveCount(0);

  const before = await cards.evaluateAll((elements) => elements.map((element) => {
    const { left, top } = element.getBoundingClientRect();
    return { left, top };
  }));
  const metrics = await collection.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      overflowX: style.overflowX,
      scrollSnapType: style.scrollSnapType,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
  expect(metrics.overflowX).toBe("auto");
  expect(metrics.scrollSnapType).toContain("x");
  expect(metrics.documentScrollWidth).toBe(metrics.documentClientWidth);

  await page.clock.fastForward(15_000);
  const after = await cards.evaluateAll((elements) => elements.map((element) => {
    const { left, top } = element.getBoundingClientRect();
    return { left, top };
  }));
  expect(after).toEqual(before);
});

test("keeps every project action tappable and project copy at readable contrast", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const cards = page.getByTestId("project-collection").getByRole("article");

  for (let index = 0; index < await cards.count(); index += 1) {
    const card = cards.nth(index);
    await card.scrollIntoViewIfNeeded();

    for (const link of await card.getByRole("link").all()) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }

  const contrastRatios = await cards.evaluateAll((elements) => {
    const parseRgb = (value) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const luminance = (rgb) => rgb
      .map((channel) => channel / 255)
      .map((channel) => channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const contrast = (foreground, background) => {
      const light = Math.max(luminance(parseRgb(foreground)), luminance(parseRgb(background)));
      const dark = Math.min(luminance(parseRgb(foreground)), luminance(parseRgb(background)));
      return (light + 0.05) / (dark + 0.05);
    };

    return elements.flatMap((card) => {
      const background = getComputedStyle(card).backgroundColor;
      return Array.from(card.querySelectorAll([
        ".project-card-name",
        ".project-card-title",
        ".project-card-description",
        ".project-card-tech-stack",
        ".project-case-study-link",
        ".project-evidence-link",
      ].join(","))).map((element) => ({
        ratio: contrast(getComputedStyle(element).color, background),
        text: element.textContent?.trim(),
      }));
    });
  });

  for (const result of contrastRatios) {
    expect(result.ratio, result.text).toBeGreaterThanOrEqual(4.5);
  }
});

test("keeps meaningful homepage content available before it enters the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const hiddenContent = await page.evaluate(() => {
    const selectors = [
      "#about .section-title",
      "#about .about-body-copy",
      "#about .about-technology-item",
      "#experience .section-title",
      "#experience [role='tab']",
      "#experience [role='tabpanel']:not([hidden]) li",
      "#projects .section-title",
      "#projects h3",
      "#writing .section-title",
      "footer .footer-copy",
    ];

    return selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)))
      .filter((element) => getComputedStyle(element).opacity !== "1")
      .map((element) => ({
        opacity: getComputedStyle(element).opacity,
        text: element.textContent?.trim().slice(0, 80),
      }));
  });

  expect(hiddenContent).toEqual([]);
});

test("links every project sitemap route from visible project navigation", async ({ page, request }) => {
  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  const projectPaths = Array.from(sitemap.matchAll(
    /<loc>https:\/\/ricomanifesto\.com(\/projects\/[^<]+)<\/loc>/g,
  )).map((match) => match[1]);

  await page.goto("/");
  const homepagePaths = await page.locator("#projects a[href^='/projects/']").evaluateAll(
    (links) => links.map((link) => link.getAttribute("href")),
  );

  expect(projectPaths).toHaveLength(5);
  expect(new Set(homepagePaths)).toEqual(new Set(projectPaths));
});

for (const project of projects) {
  test(`keeps the ${project.name} case study inside the shared site shell`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/projects/${project.slug}/`);

    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeAttached();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: "Rico Manifesto", exact: true })).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: project.title })).toBeVisible();
    const evidenceLink = page.getByRole("link", { name: `Inspect ${project.name} evidence` });
    await expect(evidenceLink).toHaveAttribute("href", project.evidenceHref);
    if (project.evidenceExternal) {
      await expect(evidenceLink).toHaveAttribute("target", "_blank");
      await expect(evidenceLink).toHaveAttribute("rel", "noopener noreferrer");
    }
    await expect(page.getByRole("contentinfo")).toContainText("Rico Manifesto");
  });
}

test("keeps the nested LLM evaluation inside the shared site shell", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects/sentrysearch/llm-evaluation/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("heading", {
    level: 1,
    name: "LLM Evaluation for Threat-Intelligence Workflows",
  })).toBeVisible();
  await expect(page.getByRole("link", { name: "SentrySearch case study" })).toHaveAttribute(
    "href",
    "/projects/sentrysearch/",
  );
  await expect(page.getByRole("contentinfo")).toContainText("Rico Manifesto");

  const evidenceLinks = page.locator(".project-evidence-list a");
  await expect(evidenceLinks).toHaveCount(4);
  for (const link of await evidenceLinks.all()) {
    await expect(link).toHaveAttribute(
      "href",
      /https:\/\/github\.com\/ricomanifesto\/SentrySearch\/blob\/[0-9a-f]{40}\/src\/core\//,
    );
    await expect(link).not.toHaveAttribute("href", /\/blob\/(?:main|master)\//);
  }
});

test("keeps project evidence usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const response = await page.goto("http://127.0.0.1:5173/#projects");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("region", { name: "/ projects" })).toBeVisible();
  for (const project of projects) {
    await expect(page.getByRole("link", {
      name: `Inspect ${project.name} evidence`,
    })).toHaveAttribute("href", project.evidenceHref);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await context.close();
});

test("uses the full Rico Manifesto identity and tighter first-note copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toContainText(/© \d{4} Rico Manifesto\. All rights reserved\./);

  await page.goto("/writing/i-thought-i-was-reading-a-repo/");
  await expect(page.locator(".writing-prose")).not.toContainText("i.e.");
});
