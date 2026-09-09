import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { containsVirtualEventMarker } from "../../scripts/check-public-content.mjs";

async function hasRenderedPromotion(page) {
  return containsVirtualEventMarker(await page.locator("body").innerText());
}

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : path.endsWith(".html") ? [path] : [];
  });
}

for (const width of [390, 1280]) {
  test(`built pages exclude rendered promotions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const dist = fileURLToPath(new URL("../../dist/", import.meta.url));
    const files = htmlFiles(dist);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const route = `/${relative(dist, file).replace(/index\.html$/, "")}`;
      const response = await page.goto(route);
      expect(response?.ok(), route).toBe(true);
      expect(await hasRenderedPromotion(page), route).toBe(false);
    }
  });
}

test("rendered text resolves hidden descendants and CSS without an HTML approximation", async ({ page }) => {
  const excluded = [
    '[Vir<span hidden>decoy</span>tual Event]',
    '[Vir<span HIDDEN="false">decoy</span>tual Event]',
    '[Vir<span hidden=""><b>nested decoy</b></span>tual Event]',
    '[Vir<span style="display:none">decoy</span>tual Event]',
    '[Vir<span style="visibility:hidden">decoy</span>tual Event]',
    '<style>.decoy { display:none }</style>[Vir<span class="decoy">decoy</span>tual Event]',
    '[Vir<!-- decoy -->tual <b>Ev</b>ent]',
  ];
  for (const html of excluded) {
    await page.setContent(html);
    expect(await hasRenderedPromotion(page), html).toBe(true);
  }
  const allowed = [
    '[Vir<span aria-hidden="true">decoy</span>tual Event]',
    '[Vir<span inert>decoy</span>tual Event]',
    '[Vir<div>tual</div> Event]',
    '[VirtualEvent]',
    'Security events and virtual event coverage without a bracketed marker',
    '<style>[hidden] { display:inline }</style>[Vir<span hidden>decoy</span>tual Event]',
  ];
  for (const html of allowed) {
    await page.setContent(html);
    expect(await hasRenderedPromotion(page), html).toBe(false);
  }
  const responsive = '<style>@media(max-width:600px) { .decoy { display:none } }</style>[Vir<span class="decoy">decoy</span>tual Event]';
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(responsive);
    expect(await hasRenderedPromotion(page)).toBe(width === 390);
  }
});
