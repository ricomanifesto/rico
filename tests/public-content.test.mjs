import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const markers = [
  "[Virtual Event]",
  "[ vIrTuAl \n\t EvEnT ]",
  "&#91;Virtual&nbsp;Event&#93;",
  "&lbrack;Virtual&NewLine;Event&rbrack;",
  String.raw`\[Virtual Event\]`,
  String.raw`\&#91;Virtual&#160;Event\&#93;`,
  "[<strong>Virtual</strong> <em>Event</em>]",
  "[Vir<strong>tual</strong> Event]",
  "[Vir<!-- tracking -->tual Ev<!-- tracking -->ent]",
  "[Vir<span>tual</span> Ev<em>ent</em>]",
  "[Virtual<br>Event]",
  "[Vir<span hidden>decoy</span>tual Event]",
  "[Vir<span HIDDEN=\"false\">decoy</span>tual Ev<span hidden=\"until-found\">decoy</span>ent]",
  "[Vir<span hidden=\"\"><b>nested decoy</b></span>tual Event]",
];

test("plain text recognizes bracketed markers without interpreting markup", async () => {
  const { containsTextMarker } = await import("../scripts/check-public-content.mjs");
  for (const marker of [markers[0], markers[1], markers[4]]) assert.equal(containsTextMarker(marker), true, marker);
  for (const article of [
    "Security events reveal malware activity.",
    "A virtual event discussed threat detection.",
    "[Event] Incident response and threat analysis",
    "[Virtual Events] Threat detection notes",
    "[Vir<div>tual</div> Event]",
    "[VirtualEvent]",
    "[Vir<span aria-hidden=\"true\">decoy</span>tual Event]",
    "[Vir<span inert>decoy</span>tual Event]",
  ]) assert.equal(containsTextMarker(article), false, article);
});

test("source guard checks structured writing metadata and defers rendered bodies", (t) => {
  const root = mkdtempSync(join(tmpdir(), "rico-content-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ["src/content/writing", "public", "tests", "src/lib"]) {
    mkdirSync(join(root, directory), { recursive: true });
  }
  writeFileSync(join(root, "tests", "fixture.md"), "[Virtual Event]");
  writeFileSync(join(root, "src/lib", "example.ts"), 'const fixture = "[Virtual Event]";');
  const article = join(root, "src/content/writing", "article.md");
  writeFileSync(article, "---\ntitle: Security events\n---\nMalware detection notes.");
  const check = () => spawnSync(process.execPath, ["scripts/check-public-content.mjs"], {
    encoding: "utf8", env: { ...process.env, CONTENT_ROOT: root },
  });
  assert.equal(check().status, 0);
  for (const marker of [markers[0], markers[4]]) {
    writeFileSync(article, `---\ntitle: ${JSON.stringify(marker)}\n---\nRegister now`);
    const result = check();
    assert.equal(result.status, 1, marker);
    assert.match(result.stderr, /virtual-event promotion/i);
  }
  writeFileSync(article, "Security event analysis");
  writeFileSync(join(root, "public", "promotion.html"), "<p>[Virtual Event] Register now</p>");
  assert.equal(check().status, 0, "public HTML must use the mandatory rendered artifact guard");
});

test("existing build smoke rejects new HTML and encoded RSS promotion records", (t) => {
  const output = mkdtempSync(join(tmpdir(), "rico-build-test-"));
  t.after(() => rmSync(output, { recursive: true, force: true }));
  cpSync("dist", output, { recursive: true });
  const check = () => spawnSync(process.execPath, ["scripts/check-build-output.mjs"], {
    encoding: "utf8", env: { ...process.env, BUILD_OUTPUT_DIR: output },
  });
  assert.equal(check().status, 0, "clean built output must keep passing strict validation");
  for (const [filename, content] of [
    ["promotion.html", "<p>[Virtual Event] Register now</p>"],
    ["promotion.html", "<p>&#91;Virtual&nbsp;Event&#93; Register now</p>"],
    ["promotion.html", "<p>[Vir<strong>tual</strong> Ev<!-- tracking -->ent] Register now</p>"],
    ["promotion.html", "<p>[Vir<span hidden>decoy</span>tual Event] Register now</p>"],
    ["promotion.xml", "<rss><channel><item><title><![CDATA[[Virtual Event] Briefing]]></title></item></channel></rss>"],
    ["promotion.xml", "<rss><channel><item><description>&lt;p&gt;&amp;#91;Virtual&amp;nbsp;Event&amp;#93;&lt;/p&gt;</description></item></channel></rss>"],
    ["promotion.xml", "<rss><channel><item><description>&lt;p&gt;[Vir&lt;strong&gt;tual&lt;/strong&gt; Ev&lt;!-- tracking --&gt;ent]&lt;/p&gt;</description></item></channel></rss>"],
    ["promotion.xml", "<rss><channel><item><description>&lt;p&gt;[Vir&lt;span hidden&gt;decoy&lt;/span&gt;tual Event]&lt;/p&gt;</description></item></channel></rss>"],
  ]) {
    const path = join(output, filename);
    writeFileSync(path, filename.endsWith(".html")
      ? `${content}<script type="module" src="/analytics.js"></script>` : content);
    const result = check();
    rmSync(path);
    assert.equal(result.status, 1, filename);
    assert.match(result.stderr, /virtual-event promotion/i);
  }
});

test("actual artifact guard preserves CSS overrides and escaped markup", (t) => {
  const output = mkdtempSync(join(tmpdir(), "rico-representation-test-"));
  t.after(() => rmSync(output, { recursive: true, force: true }));
  cpSync("dist", output, { recursive: true });
  for (const html of [
    '<style>[hidden] { display:inline }</style>[Vir<span hidden>decoy</span>tual Event]',
    '[Vir&lt;span hidden&gt;decoy&lt;/span&gt;tual Event]',
    '[Vir&amp;lt;span hidden&amp;gt;decoy&amp;lt;/span&amp;gt;tual Event]',
  ]) {
    writeFileSync(join(output, "representation.html"), `${html}<script type="module" src="/analytics.js"></script>`);
    const result = spawnSync(process.execPath, ["scripts/check-build-output.mjs"], {
      encoding: "utf8", env: { ...process.env, BUILD_OUTPUT_DIR: output },
    });
    assert.equal(result.status, 0, result.stderr);
  }
});

test("rendered text is never decoded or reparsed as HTML", async () => {
  const { containsTextMarker } = await import("../scripts/check-public-content.mjs");
  assert.equal(containsTextMarker("[Vir<span hidden>decoy</span>tual Event]"), false);
  assert.equal(containsTextMarker("[Vir&lt;span hidden&gt;decoy&lt;/span&gt;tual Event]"), false);
  assert.equal(containsTextMarker("&#91;Virtual&nbsp;Event&#93;"), false);
  assert.equal(containsTextMarker("[Virtual\u00a0Event]"), true);
});

test("publication browser guard respects feed representations and fails closed", { timeout: 45000 }, async (t) => {
  const { chromium } = await import("@playwright/test");
  const { checkRenderedArtifacts } = await import("../scripts/check-rendered-content.mjs");
  const root = mkdtempSync(join(tmpdir(), "rico-rendered-test-"));
  const browser = await chromium.launch({ channel: process.env.PUBLIC_CONTENT_BROWSER_CHANNEL || undefined });
  t.after(async () => {
    await browser.close();
    rmSync(root, { recursive: true, force: true });
  });
  writeFileSync(join(root, "index.html"), "<p>Ordinary security event analysis</p>");
  const check = () => checkRenderedArtifacts(root, { browser });
  const feed = join(root, "feed.xml");
  for (const [html, blocked] of [
    ['[Vir<span HIDDEN="false">decoy</span>tual Event]', true],
    ['[Vir<span hidden=""><b>decoy</b></span>tual Event]', true],
    ['[Vir<span hidden="until-found">decoy</span>tual Event]', false],
    ['[Vir<span style="display:none">decoy</span>tual Event]', true],
    ['[Vir<span style="visibility:hidden">decoy</span>tual Event]', true],
    ['<style>@media(max-width:600px){.decoy{display:none}}</style>[Vir<span class="decoy">decoy</span>tual Event]', true],
    ['[Vir<span aria-hidden="true">decoy</span>tual Event]', false],
    ['[Vir<span inert>decoy</span>tual Event]', false],
    ['[Vir<div>tual</div> Event]', false],
    ['[Vir<!-- comment -->tual <b>Ev</b>ent]', true],
  ]) {
    writeFileSync(join(root, "index.html"), html);
    assert.equal((await check()).length > 0, blocked, html);
  }
  writeFileSync(join(root, "visibility.css"), ".decoy{display:none}");
  writeFileSync(join(root, "index.html"), '<link rel="stylesheet" href="/visibility.css">[Vir<span class="decoy">decoy</span>tual Event]');
  assert.match((await check()).join("\n"), /virtual-event promotion/);
  writeFileSync(join(root, "index.html"), "<p>Ordinary security event analysis</p>");
  for (const [xml, blocked] of [
    ['<rss><channel><item><title>[Vir<!-- split -->tual Event]</title></item></channel></rss>', true],
    ['<rss><channel><item><title>[Vir<![CDATA[tual]]> Event]</title></item></channel></rss>', true],
    ['<rss><channel><item><description>&lt;p&gt;[Vir&lt;span hidden&gt;decoy&lt;/span&gt;tual Event]&lt;/p&gt;</description></item></channel></rss>', true],
    ['<rss><channel><item><description><![CDATA[<style>[hidden]{display:inline}</style>[Vir<span hidden>decoy</span>tual Event]]]></description></item></channel></rss>', false],
    ['<rss><channel><item><description>&amp;lt;p&amp;gt;[Vir&amp;lt;span hidden&amp;gt;decoy&amp;lt;/span&amp;gt;tual Event]&amp;lt;/p&amp;gt;</description></item></channel></rss>', false],
    ['<rss><channel><item><title>[Vir&lt;span hidden&gt;decoy&lt;/span&gt;tual Event]</title></item></channel></rss>', false],
    ['<feed xmlns="http://www.w3.org/2005/Atom"><entry><content type="text">[Vir&lt;span hidden&gt;decoy&lt;/span&gt;tual Event]</content></entry></feed>', false],
    ['<feed xmlns="http://www.w3.org/2005/Atom"><entry><content type="html">[Vir&lt;span hidden&gt;decoy&lt;/span&gt;tual Event]</content></entry></feed>', true],
    ['<rss><channel><item><title>[Virtual&#160;Event]</title></item></channel></rss>', true],
  ]) {
    writeFileSync(feed, xml);
    assert.equal((await check()).length > 0, blocked, xml);
  }
  writeFileSync(feed, "<rss><broken></rss>");
  await assert.rejects(check(), /Invalid or unsupported publication XML/);
  rmSync(feed);
  writeFileSync(join(root, "index.html"), '<link rel="stylesheet" href="/missing.css"><p>Security events</p>');
  assert.match((await check()).join("\n"), /Missing publication resource/);
  writeFileSync(join(root, "index.html"), "<p>Ordinary security events</p>");
  await assert.rejects(checkRenderedArtifacts(root, { browser, timeoutMs: 1 }), /Publication verification timed out/);
});

test("publication guard checks only displayed form-control text", { timeout: 45000 }, async (t) => {
  const { chromium } = await import("@playwright/test");
  const { checkRenderedArtifacts } = await import("../scripts/check-rendered-content.mjs");
  const root = mkdtempSync(join(tmpdir(), "rico-control-test-"));
  const browser = await chromium.launch({ channel: process.env.PUBLIC_CONTENT_BROWSER_CHANNEL || undefined });
  t.after(async () => {
    await browser.close();
    rmSync(root, { recursive: true, force: true });
  });
  for (const [html, blocked] of [
    ['<input value="[Virtual Event]">', true],
    ['<input placeholder="[Virtual Event]">', true],
    ['<textarea placeholder="[Virtual Event]"></textarea>', true],
    ['<textarea id="review"></textarea><script>document.querySelector("textarea").value="[Virtual Event]"</script>', true],
    ['<input type="button" value="[Virtual Event]">', true],
    ['<input type="submit" value="[Virtual Event]">', true],
    ['<input type="reset" value="[Virtual Event]">', true],
    ['<input type="password" placeholder="[Virtual Event]">', true],
    ['<input value="Security events" placeholder="[Virtual Event]">', false],
    ['<textarea placeholder="[Virtual Event]">Security events</textarea>', false],
    ['<input type="hidden" value="[Virtual Event]" placeholder="[Virtual Event]">', false],
    ['<input type="password" value="[Virtual Event]" placeholder="[Virtual Event]">', false],
    ['<input type="checkbox" value="[Virtual Event]">', false],
    ['<input type="radio" value="[Virtual Event]">', false],
    ['<input type="number" value="[Virtual Event]">', false],
    ['<input hidden value="[Virtual Event]">', false],
    ['<div style="display:none"><input value="[Virtual Event]"></div>', false],
    ['<div style="visibility:hidden"><input placeholder="[Virtual Event]"></div>', false],
    ['<div style="opacity:0"><input value="[Virtual Event]"></div>', false],
    ['<style>[hidden]{display:inline}</style><input hidden value="[Virtual Event]">', true],
  ]) {
    writeFileSync(join(root, "index.html"), html);
    assert.equal((await checkRenderedArtifacts(root, { browser })).length > 0, blocked, html);
  }
});

test("source publication guard skips boolean drafts only", (t) => {
  const root = mkdtempSync(join(tmpdir(), "rico-draft-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "src/content/writing"), { recursive: true });
  for (const [draft, blocked] of [["true", false], ["false", true], ['"true"', true], [null, true]]) {
    writeFileSync(join(root, "src/content/writing/article.md"),
      `---\ntitle: "[Virtual Event]"\n${draft === null ? "" : `draft: ${draft}\n`}---\n[Virtual Event]`);
    const result = spawnSync(process.execPath, ["scripts/check-public-content.mjs"], {
      encoding: "utf8", env: { ...process.env, CONTENT_ROOT: root },
    });
    assert.equal(result.status !== 0, blocked, `draft: ${draft}`);
  }
});

test("ordered document projection includes controls at their rendered position", { timeout: 45000 }, async (t) => {
  const { chromium } = await import("@playwright/test");
  const { checkRenderedArtifacts } = await import("../scripts/check-rendered-content.mjs");
  const root = mkdtempSync(join(tmpdir(), "rico-ordered-test-"));
  const browser = await chromium.launch({ channel: process.env.PUBLIC_CONTENT_BROWSER_CHANNEL || undefined });
  t.after(async () => { await browser.close(); rmSync(root, { recursive: true, force: true }); });
  for (const [html, blocked] of [
    ['[Vir<input value="tual"> Event]', true],
    ['[Vir<input placeholder="tual"> Event]', true],
    ['[Vir<textarea>tual</textarea> Event]', true],
    ['[Vir<input type="button" value="tual"> Event]', true],
    ['[<input value="Virtual"> <input placeholder="Event">]', true],
    ['[Vir<input value="decoy" placeholder="tual"> Event]', false],
    ['[Vir<input type="password" value="tual"> Event]', false],
    ['[Virtual<input type="password" value="decoy"> Event]', false],
    ['[Virtual<input type="checkbox" value="decoy"> Event]', false],
    ['[Vir<input hidden value="decoy">tual Event]', true],
    ['<style>input{display:block}</style>[Vir<input value="tual"> Event]', false],
    ['<style>input{text-transform:uppercase}</style>[Vir<input value="tual"> Event]', true],
    ['<style>span{display:block!important}</style>[Vir<input value="tual"> Event]', true],
    ['<title>[Virtual</title><p>Event]</p>', false],
  ]) {
    writeFileSync(join(root, "index.html"), html);
    assert.equal((await checkRenderedArtifacts(root, { browser })).length > 0, blocked, html);
  }
});

test("document projection traverses bounded visible frames and fails closed", { timeout: 45000 }, async (t) => {
  const { chromium } = await import("@playwright/test");
  const { checkRenderedArtifacts } = await import("../scripts/check-rendered-content.mjs");
  const root = mkdtempSync(join(tmpdir(), "rico-frame-test-"));
  const browser = await chromium.launch({ channel: process.env.PUBLIC_CONTENT_BROWSER_CHANNEL || undefined });
  t.after(async () => { await browser.close(); rmSync(root, { recursive: true, force: true }); });
  const frame = (html, attrs = "") => `<iframe ${attrs} srcdoc="${html.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"></iframe>`;
  writeFileSync(join(root, "child.htm"), '[Vir<input value="tual"> Event]');
  for (const [html, failure] of [
    [frame("[Virtual Event]"), /virtual-event promotion/],
    [frame(frame('[Vir<input value="tual"> Event]')), /virtual-event promotion/],
    ['<iframe src="/child.htm"></iframe>', /virtual-event promotion/],
    [frame("[Virtual Event]", "hidden"), null],
    [frame(frame("[Virtual Event]"), 'style="display:none"'), null],
    [`<style>[hidden]{display:block}</style>${frame("[Virtual Event]", "hidden")}`, /virtual-event promotion/],
    [frame("Security events"), null],
    [`[Virtual${frame("Event]")}`, null],
    [`[Vir${frame("decoy")}tual Event]`, null],
    [frame('<title>[Virtual</title><p>Event]</p>'), null],
    [frame('<meta name="description" content="[Virtual Event]"><p>Security events</p>'), /virtual-event promotion/],
    [frame("Security events", "sandbox"), /unreadable|unsupported/i],
    ['<iframe src="https://unavailable.invalid/"></iframe>', /unreadable|unsupported/i],
    ['<object data="/child.htm"></object>', /unsupported/i],
    ['<embed src="/child.htm">', /unsupported/i],
    ['<iframe loading="lazy" style="position:absolute;top:100000px" src="/child.htm"></iframe>', /unfinished|unreadable/i],
    [Array.from({ length: 33 }, () => frame("Security events")).join(""), /limit/i],
    [Array.from({ length: 7 }).reduce((html) => frame(html), "Security events"), /limit/i],
  ]) {
    writeFileSync(join(root, "index.html"), html);
    const failures = await checkRenderedArtifacts(root, { browser });
    if (failure) assert.match(failures.join("\n"), failure, html);
    else assert.deepEqual(failures, [], html);
  }
});

test("ordered projection restores controls and frame documents on success and failure", { timeout: 45000 }, async (t) => {
  const { chromium } = await import("@playwright/test");
  const { assertRenderedPageAllowed } = await import("../scripts/check-rendered-content.mjs");
  const browser = await chromium.launch({ channel: process.env.PUBLIC_CONTENT_BROWSER_CHANNEL || undefined });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.setContent('<input style="color:red" value="Security events"><textarea>Old value</textarea><iframe srcdoc="Ordinary events"></iframe>');
  const before = await page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll("input, textarea, iframe"));
    controls[1].value = "Current value";
    window.originalControls = controls;
    window.originalFrameDocument = controls[2].contentDocument;
    return document.documentElement.outerHTML;
  });
  await assertRenderedPageAllowed(page);
  assert.deepEqual(await page.evaluate(() => [
    document.documentElement.outerHTML,
    window.originalControls.every((node, index) => node === document.querySelectorAll("input, textarea, iframe")[index]),
    window.originalControls[1].value,
    document.querySelector("iframe").contentDocument === window.originalFrameDocument,
  ]), [before, true, "Current value", true]);

  await page.evaluate(() => { document.querySelector("input").value = "[Virtual Event]"; });
  await assert.rejects(assertRenderedPageAllowed(page), /virtual-event promotion/);
  assert.equal(await page.evaluate(() => document.documentElement.outerHTML), before);

  await page.evaluate(() => Object.defineProperty(document.body, "innerText", {
    configurable: true, get() { throw new Error("projection read failure"); },
  }));
  await assert.rejects(assertRenderedPageAllowed(page), /projection read failure/);
  assert.equal(await page.evaluate(() => document.documentElement.outerHTML), before);
});
