#!/usr/bin/env node
/**
 * Generates placeholder PWA PNG icons for Pace.
 *
 * Why the manual PNG synthesis approach:
 *   - No ImageMagick / rsvg-convert available on this host.
 *   - `sharp` and `@vite-pwa/assets-generator` would require npm installs
 *     and native binaries. For S07 we only need valid PNGs referenced by
 *     the manifest so the Lighthouse PWA audit passes; actual branded
 *     icons are an open decision (brief s18).
 *   - Pure Node + zlib synthesises a solid-colour PNG deterministically.
 *
 * Output: solid #080809 fills at the sizes the manifest expects.
 * The favicon.svg and icons/source.svg (wordmark) are committed separately
 * so a future run with a real rasterizer can produce branded PNGs.
 */

import { createHash } from 'node:crypto';
import { deflateSync, crc32 } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'public', 'icons');

// Brand background colour.
const BG_R = 0x08;
const BG_G = 0x08;
const BG_B = 0x09;

/**
 * Build a PNG buffer of `size` × `size`, solid RGB fill.
 * @param {number} size
 * @returns {Buffer}
 */
function buildSolidPng(size) {
  const width = size;
  const height = size;

  // Scanlines: each starts with a filter byte (0 = None), then RGB triples.
  const bytesPerPixel = 3;
  const rowLength = 1 + width * bytesPerPixel;
  const raw = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowLength;
    raw[rowStart] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * bytesPerPixel;
      raw[pixelStart] = BG_R;
      raw[pixelStart + 1] = BG_G;
      raw[pixelStart + 2] = BG_B;
    }
  }

  const compressed = deflateSync(raw);

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolor RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const chunks = [
    signature,
    buildChunk('IHDR', ihdr),
    buildChunk('IDAT', compressed),
    buildChunk('IEND', Buffer.alloc(0)),
  ];

  return Buffer.concat(chunks);
}

/**
 * Build a single PNG chunk with CRC.
 * @param {string} type four-letter chunk type
 * @param {Buffer} data chunk payload
 * @returns {Buffer}
 */
function buildChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput) >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filename, size) {
  const outPath = resolve(OUT_DIR, filename);
  mkdirSync(dirname(outPath), { recursive: true });
  const buffer = buildSolidPng(size);
  writeFileSync(outPath, buffer);
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 8);
  // eslint-disable-next-line no-console
  console.log(`  wrote ${filename} (${size}×${size}, ${buffer.length} bytes, sha1:${hash})`);
}

// Generated set referenced by vite.config.ts manifest + index.html.
const ICONS = [
  { filename: 'icon-192.png', size: 192 },
  { filename: 'icon-512.png', size: 512 },
  { filename: 'icon-maskable-512.png', size: 512 },
  { filename: 'apple-touch-icon.png', size: 180 },
];

// eslint-disable-next-line no-console
console.log(`Generating placeholder PWA icons into ${OUT_DIR}`);
for (const icon of ICONS) {
  writePng(icon.filename, icon.size);
}
// eslint-disable-next-line no-console
console.log('Done.');
