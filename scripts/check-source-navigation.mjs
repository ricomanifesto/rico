import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const navigation = read("src/content/navigation.ts");
const header = read("src/components/Header.tsx");
const headerNavLink = read("src/components/HeaderNavLink.tsx");
const socialLink = read("src/components/SocialLink.tsx");
const home = read("src/Home.tsx");
const failures = [];

// Navigation checks own route/data integrity and semantic composition. Layout,
// breakpoint reachability, focus, and target size are rendered Playwright tests.
const expectedNavItems = [
  ["Home", "/#intro"],
  ["About", "/#about"],
  ["Experience", "/#experience"],
  ["Projects", "/#projects"],
  ["Writing", "/writing/"],
];

for (const [label, href] of expectedNavItems) {
  if (!navigation.includes(`{ label: "${label}", href: "${href}" }`)) {
    failures.push(`Navigation is missing ${label}: ${href}`);
  }
}

for (const [, href] of expectedNavItems.filter(([, href]) => href.startsWith("/#"))) {
  const id = href.slice(2);
  const sectionSources = [
    read("src/components/IntroSection.tsx"),
    read("src/components/AboutMe.tsx"),
    read("src/components/Experience.tsx"),
    read("src/components/ProjectsSection.tsx"),
  ];

  if (!sectionSources.some((source) => source.includes(`id=\"${id}\"`))) {
    failures.push(`Navigation target #${id} has no matching section`);
  }
}

for (const required of [
  'label: "Rico Manifesto"',
  'href: "/"',
  "readonly label: string",
  "readonly href: string",
  "readonly external: boolean",
]) {
  if (!navigation.includes(required)) {
    failures.push(`Navigation data is missing typed contract: ${required}`);
  }
}

for (const required of [
  "<HeaderNavLink",
  "<SocialLink",
  'aria-label="Primary"',
  'aria-label="Mobile primary"',
  'aria-label="Social links"',
  '<ul role="list"',
  '<li key={link.href} role="listitem"',
  'window.addEventListener("scroll", handleScroll, headerNavigationBehavior.scrollListenerOptions)',
]) {
  if (!header.includes(required)) {
    failures.push(`Header is missing semantic navigation behavior: ${required}`);
  }
}

if (!navigation.includes("scrollListenerOptions: { passive: true }")) {
  failures.push("Header scroll behavior is not passive");
}

if (!home.includes("<Header />")) {
  failures.push("Home does not render the shared Header");
}

if (!headerNavLink.includes("export default function HeaderNavLink")) {
  failures.push("Header navigation does not use its shared link component");
}

if (!socialLink.includes("export default function SocialLink")) {
  failures.push("Social navigation does not use its shared link component");
}

for (const [label, source] of [
  ["HeaderNavLink", headerNavLink],
  ["SocialLink", socialLink],
]) {
  if (/onMouseEnter|onMouseLeave/.test(source)) {
    failures.push(`${label} implements hover with pointer event state`);
  }
}

if (failures.length > 0) {
  console.error("Source navigation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Source navigation check passed.");
