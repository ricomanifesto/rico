// Markers for entries that must never be published, such as virtual-event
// promotions picked up from security feeds. Checks run against the text a
// reader would see, so tags, comments and HTML entities are normalized first.

const excludedMarkers = [
  { label: "virtual-event promotion", pattern: /\[\s*virtual\s+event\s*\]/i },
];

const namedEntities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entity, body) => {
    const name = body.toLowerCase();
    if (name.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(name.slice(2), 16));
    }
    if (name.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(name.slice(1), 10));
    }
    return namedEntities[name] ?? entity;
  });
}

function stripMarkup(text) {
  // Inline tags join without a separator, so a marker split across inline
  // elements is still detected.
  return text.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "");
}

// Representations a published artifact can take: raw text, rendered HTML text,
// and feed payloads whose HTML is entity-encoded once more. Checking the decoded
// feed form errs toward rejection when an escaped code sample happens to form
// the marker.
export function textRepresentations(artifact) {
  const rendered = decodeEntities(stripMarkup(artifact));
  const feedPayload = decodeEntities(stripMarkup(rendered));
  return [artifact, rendered, feedPayload].map((text) => text.replace(/\s+/g, " "));
}

export function findExcludedMarkers(artifact) {
  const representations = textRepresentations(artifact);
  return excludedMarkers
    .filter(({ pattern }) => representations.some((text) => pattern.test(text)))
    .map(({ label }) => label);
}
