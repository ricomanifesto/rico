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
];

test("normalizes only the bracketed promotion marker", async () => {
  const { containsVirtualEventMarker } = await import("../scripts/check-public-content.mjs");
  for (const marker of markers) assert.equal(containsVirtualEventMarker(marker), true, marker);
  for (const article of [
    "Security events reveal malware activity.",
    "A virtual event discussed threat detection.",
    "[Event] Incident response and threat analysis",
    "[Virtual Events] Threat detection notes",
    "[Vir<div>tual</div> Event]",
    "[VirtualEvent]",
  ]) assert.equal(containsVirtualEventMarker(article), false, article);
});

test("source guard checks writing and public content, not code or fixture markers", (t) => {
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
  for (const marker of markers) {
    writeFileSync(article, `---\ntitle: Briefing\n---\n${marker} Register now`);
    const result = check();
    assert.equal(result.status, 1, marker);
    assert.match(result.stderr, /virtual-event promotion/i);
  }
  writeFileSync(article, "Security event analysis");
  writeFileSync(join(root, "public", "promotion.html"), "<p>[Virtual Event] Register now</p>");
  assert.equal(check().status, 1);
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
    ["promotion.xml", "<rss><channel><item><title><![CDATA[[Virtual Event] Briefing]]></title></item></channel></rss>"],
    ["promotion.xml", "<rss><channel><item><description>&lt;p&gt;&amp;#91;Virtual&amp;nbsp;Event&amp;#93;&lt;/p&gt;</description></item></channel></rss>"],
    ["promotion.xml", "<rss><channel><item><description>&lt;p&gt;[Vir&lt;strong&gt;tual&lt;/strong&gt; Ev&lt;!-- tracking --&gt;ent]&lt;/p&gt;</description></item></channel></rss>"],
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
