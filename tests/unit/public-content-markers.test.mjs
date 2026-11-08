import assert from "node:assert/strict";
import { test } from "node:test";

import { findExcludedMarkers } from "../../scripts/public-content-markers.mjs";

const excluded = [
  ["plain title", "<h2>[Virtual Event] Cloud Security Summit</h2>"],
  ["case and spacing", "<p>[ virtual   EVENT ] Register now</p>"],
  ["line break inside marker", "<p>[Virtual\nEvent]</p>"],
  ["split by inline markup", "<p>[Vir<strong>tual</strong> Event]</p>"],
  ["split by a comment", "<p>[Virtual<!-- x --> Event]</p>"],
  ["numeric entities", "<p>&#91;Virtual Event&#93; webinar</p>"],
  ["hex entities", "<p>&#x5B;Virtual Event&#x5D;</p>"],
  ["encoded feed description", "<description>&lt;p&gt;[Virtual Event] Webinar&lt;/p&gt;</description>"],
  ["double-encoded feed entity", "<title>&amp;#91;Virtual Event&amp;#93;</title>"],
  ["attribute text", '<meta property="og:title" content="[Virtual Event] Summit">'],
];

const eligible = [
  ["ordinary security reporting", "<h2>Exploited VPN flaw</h2><p>Attackers used a virtual appliance.</p>"],
  ["words without the bracketed tag", "<p>The virtual event log showed a failed login.</p>"],
  ["different bracketed tag", "<p>[Event] Patch Tuesday</p>"],
];

for (const [name, artifact] of excluded) {
  test(`rejects ${name}`, () => {
    assert.deepEqual(findExcludedMarkers(artifact), ["virtual-event promotion"]);
  });
}

for (const [name, artifact] of eligible) {
  test(`accepts ${name}`, () => {
    assert.deepEqual(findExcludedMarkers(artifact), []);
  });
}
