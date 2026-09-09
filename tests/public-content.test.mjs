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
