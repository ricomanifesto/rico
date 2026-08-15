import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const ink = "#11151b";
const paper = "#f1eee7";
const accent = "#8db7df";
const letterPath = [
  "M10 11H31",
  "C41 11 47 17 47 27",
  "C47 34 43 39 36 41",
  "L47 52H37L29 42H22V47H28V53H10V47H15V17H10Z",
  "M22 17V36H30",
  "C37 36 40 33 40 27",
  "C40 20 37 17 30 17Z",
].join("");

function markMarkup({ monochrome = false } = {}) {
  const foreground = monochrome ? "#000" : paper;
  const period = monochrome ? "#000" : accent;

  return [
    `<g data-mark="editorial-r-period">`,
    `<path fill="${foreground}" fill-rule="evenodd" d="${letterPath}"/>`,
    `<circle cx="53" cy="49" r="3.5" fill="${period}"/>`,
    "</g>",
  ].join("");
}

function faviconSvg() {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Michael Rico R period mark">',
    `<rect width="64" height="64" rx="14" fill="${ink}"/>`,
    markMarkup(),
    "</svg>",
    "",
  ].join("\n");
}

function pinnedTabSvg() {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
    markMarkup({ monochrome: true }),
    "</svg>",
    "",
  ].join("\n");
}

function maskableSvg() {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
    `<rect width="64" height="64" fill="${ink}"/>`,
    '<g transform="translate(5.76 5.76) scale(.82)">',
    markMarkup(),
    "</g>",
    "</svg>",
  ].join("\n");
}

async function rasterize(svg, size) {
  return sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9, palette: true, quality: 100 })
    .toBuffer();
}

function createIco(images) {
  const directorySize = 6 + (images.length * 16);
  const directory = Buffer.alloc(directorySize);
  directory.writeUInt16LE(0, 0);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(images.length, 4);

  let offset = directorySize;
  images.forEach(({ size, bytes }, index) => {
    const entryOffset = 6 + (index * 16);
    directory.writeUInt8(size === 256 ? 0 : size, entryOffset);
    directory.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    directory.writeUInt8(0, entryOffset + 2);
    directory.writeUInt8(0, entryOffset + 3);
    directory.writeUInt16LE(1, entryOffset + 4);
    directory.writeUInt16LE(32, entryOffset + 6);
    directory.writeUInt32LE(bytes.length, entryOffset + 8);
    directory.writeUInt32LE(offset, entryOffset + 12);
    offset += bytes.length;
  });

  return Buffer.concat([directory, ...images.map(({ bytes }) => bytes)]);
}

const svg = faviconSvg();
const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({
  size,
  bytes: await rasterize(svg, size),
})));
const outputs = [
  ["public/favicon.svg", Buffer.from(svg)],
  ["public/safari-pinned-tab.svg", Buffer.from(pinnedTabSvg())],
  ["public/favicon.ico", createIco(icoImages)],
  ["public/apple-touch-icon.png", await rasterize(svg, 180)],
  ["public/icons/icon-192.png", await rasterize(svg, 192)],
  ["public/icons/icon-512.png", await rasterize(svg, 512)],
  ["public/icons/icon-512-maskable.png", await rasterize(maskableSvg(), 512)],
];

const drift = [];
for (const [relativePath, expected] of outputs) {
  const outputPath = path.join(root, relativePath);
  if (checkOnly) {
    if (!fs.existsSync(outputPath) || !fs.readFileSync(outputPath).equals(expected)) {
      drift.push(relativePath);
    }
    continue;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, expected);
}

if (drift.length > 0) {
  console.error("Generated brand icons are out of date:");
  for (const relativePath of drift) {
    console.error(`- ${relativePath}`);
  }
  console.error("Run `npm run brand:icons` and commit the generated files.");
  process.exit(1);
}

console.log(checkOnly ? "Generated brand icons match their source." : "Generated brand icons updated.");
