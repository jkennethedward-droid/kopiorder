import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// Generates a simple 1200x630 PNG with a solid background.
// Note: rendering text requires extra dependencies; replace `public/og-image.png`
// with a designed version (dark bg + amber "KopiOrder") before launch.

const width = 1200;
const height = 630;
const outPath = path.join(process.cwd(), "public", "og-image.png");

// #0f0e0c
const r = 0x0f;
const g = 0x0e;
const b = 0x0c;

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & (-(c & 1)));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Raw scanlines: each row = filter byte 0 + RGBRGB...
const stride = 1 + width * 3;
const raw = Buffer.alloc(stride * height);
for (let y = 0; y < height; y++) {
  const rowStart = y * stride;
  raw[rowStart] = 0; // filter = None
  for (let x = 0; x < width; x++) {
    const p = rowStart + 1 + x * 3;
    raw[p] = r;
    raw[p + 1] = g;
    raw[p + 2] = b;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const idatData = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  signature,
  chunk("IHDR", ihdr),
  chunk("IDAT", idatData),
  chunk("IEND", Buffer.alloc(0)),
]);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, png);

console.log(`Wrote ${outPath} (${width}x${height})`);

