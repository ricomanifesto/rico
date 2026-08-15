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

function readIcoImages(bytes) {
  if (bytes.length < 6 || bytes.readUInt16LE(0) !== 0 || bytes.readUInt16LE(2) !== 1) {
    return [];
  }

  const count = bytes.readUInt16LE(4);
  if (bytes.length < 6 + (count * 16)) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const entryOffset = 6 + (index * 16);
    const encodedWidth = bytes.readUInt8(entryOffset);
    const imageSize = bytes.readUInt32LE(entryOffset + 8);
    const imageOffset = bytes.readUInt32LE(entryOffset + 12);
    return {
      size: encodedWidth === 0 ? 256 : encodedWidth,
      bytes: bytes.subarray(imageOffset, imageOffset + imageSize),
    };
  });
}

async function compareRasterPixels(actual, expected) {
  try {
    const [actualImage, expectedImage] = await Promise.all([
      sharp(actual).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(expected).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ]);
    const sameShape = actualImage.info.width === expectedImage.info.width
      && actualImage.info.height === expectedImage.info.height
      && actualImage.info.channels === expectedImage.info.channels;

    if (!sameShape || actualImage.data.length !== expectedImage.data.length) {
      return false;
    }

    let totalDelta = 0;
    let significantPixels = 0;
    const channels = actualImage.info.channels;
    const pixelCount = actualImage.info.width * actualImage.info.height;

    for (let offset = 0; offset < actualImage.data.length; offset += channels) {
      let pixelDelta = 0;
      for (let channel = 0; channel < channels; channel += 1) {
        const delta = Math.abs(actualImage.data[offset + channel] - expectedImage.data[offset + channel]);
        totalDelta += delta;
        pixelDelta = Math.max(pixelDelta, delta);
      }
      if (pixelDelta > 12) {
        significantPixels += 1;
      }
    }

    const meanChannelDelta = totalDelta / actualImage.data.length;
    const significantPixelRatio = significantPixels / pixelCount;
    return meanChannelDelta <= 4 && significantPixelRatio <= 0.08;
  } catch {
    return false;
  }
}

async function compareIcoImages(actual, expectedImages) {
  const actualImages = readIcoImages(actual);
  if (actualImages.length !== expectedImages.length) {
    return false;
  }

  for (const expectedImage of expectedImages) {
    const actualImage = actualImages.find(({ size }) => size === expectedImage.size);
    if (!actualImage || !await compareRasterPixels(actualImage.bytes, expectedImage.bytes)) {
      return false;
    }
  }

  return true;
}

const svg = faviconSvg();
const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({
  size,
  bytes: await rasterize(svg, size),
})));
const outputs = [
  { relativePath: "public/favicon.svg", expected: Buffer.from(svg), comparison: "exact" },
  { relativePath: "public/safari-pinned-tab.svg", expected: Buffer.from(pinnedTabSvg()), comparison: "exact" },
  { relativePath: "public/favicon.ico", expected: createIco(icoImages), comparison: "ico" },
  { relativePath: "public/apple-touch-icon.png", expected: await rasterize(svg, 180), comparison: "raster" },
  { relativePath: "public/icons/icon-192.png", expected: await rasterize(svg, 192), comparison: "raster" },
  { relativePath: "public/icons/icon-512.png", expected: await rasterize(svg, 512), comparison: "raster" },
  { relativePath: "public/icons/icon-512-maskable.png", expected: await rasterize(maskableSvg(), 512), comparison: "raster" },
];

const drift = [];
for (const { relativePath, expected, comparison } of outputs) {
  const outputPath = path.join(root, relativePath);
  if (checkOnly) {
    if (!fs.existsSync(outputPath)) {
      drift.push(relativePath);
      continue;
    }

    const actual = fs.readFileSync(outputPath);
    const matches = comparison === "exact"
      ? actual.equals(expected)
      : comparison === "ico"
        ? await compareIcoImages(actual, icoImages)
        : await compareRasterPixels(actual, expected);
    if (!matches) {
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
