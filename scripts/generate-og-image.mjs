import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// Generates simple PNG assets with a solid background + accent shapes.
// Note: rendering real text requires extra dependencies; this uses high-contrast
// brand accents so link previews aren't a blank black card.

const BG = { r: 0x0f, g: 0x0e, b: 0x0c }; // #0f0e0c
const ACCENT = { r: 0xf2, g: 0xb7, b: 0x48 }; // warm amber

function writePng({ width, height, outPath, paint }) {
  // Raw scanlines: each row = filter byte 0 + RGBRGB...
  const stride = 1 + width * 3;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) raw[y * stride] = 0; // filter = None

  function setPixel(x, y, r, g, b) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * stride + 1 + x * 3;
    raw[p] = r;
    raw[p + 1] = g;
    raw[p + 2] = b;
  }

  function fillRect(x0, y0, w, h, { r, g, b }) {
    const x1 = Math.min(width, x0 + w);
    const y1 = Math.min(height, y0 + h);
    for (let y = Math.max(0, y0); y < y1; y++) {
      for (let x = Math.max(0, x0); x < x1; x++) setPixel(x, y, r, g, b);
    }
  }

  function fillCircle(cx, cy, radius, { r, g, b }) {
    const r2 = radius * radius;
    const xMin = Math.max(0, Math.floor(cx - radius));
    const xMax = Math.min(width - 1, Math.ceil(cx + radius));
    const yMin = Math.max(0, Math.floor(cy - radius));
    const yMax = Math.min(height - 1, Math.ceil(cy + radius));
    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) setPixel(x, y, r, g, b);
      }
    }
  }

  // Background
  fillRect(0, 0, width, height, BG);
  // Custom accents per target image
  paint({ fillRect, fillCircle, width, height, BG, ACCENT, setPixel });

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
}

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

function drawText5x7({ setPixel, x, y, text, scale, color }) {
  const FONT = {
    A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
    D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
    E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
    I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
    K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
    O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
    P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
    R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
    _: [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
  };

  const upper = text.toUpperCase().replace(/ /g, "_");
  let cx = x;
  for (const ch of upper) {
    const glyph = FONT[ch] ?? FONT["_"];
    for (let row = 0; row < 7; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col++) {
        const on = (bits >> (4 - col)) & 1;
        if (!on) continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            setPixel(cx + col * scale + sx, y + row * scale + sy, color.r, color.g, color.b);
          }
        }
      }
    }
    cx += 6 * scale; // 5px glyph + 1px spacing
  }
}

writePng({
  width: 1200,
  height: 630,
  outPath: path.join(process.cwd(), "public", "og-image-v3.png"),
  paint: ({ fillRect, width, height, ACCENT, setPixel }) => {
    // Top accent bar
    fillRect(0, 0, width, 26, ACCENT);
    // Bottom accent bar
    fillRect(0, height - 18, width, 18, ACCENT);
    // Left accent stripe
    fillRect(0, 0, 14, height, ACCENT);
    // Simple "tile" blocks (evokes the app UI)
    const cardW = 300;
    const cardH = 92;
    const gap = 24;
    const startX = 90;
    const startY = 210;
    for (let i = 0; i < 3; i++) {
      fillRect(startX + i * (cardW + gap), startY, cardW, cardH, ACCENT);
    }

    // "KopiOrder" text in amber (5x7 bitmap, scaled)
    const label = "KopiOrder";
    const scale = 10;
    const textW = label.length * 6 * scale;
    const x = Math.round((width - textW) / 2);
    const y = 90;
    drawText5x7({ setPixel, x, y, text: label, scale, color: ACCENT });
  },
});

writePng({
  width: 1200,
  height: 630,
  outPath: path.join(process.cwd(), "public", "og-image-v4.png"),
  paint: ({ width, height, ACCENT, setPixel }) => {
    // Centered title only (clean share card)
    const label = "KopiOrder";
    const scale = 14;
    const textW = label.length * 6 * scale;
    const x = Math.round((width - textW) / 2);
    const y = Math.round((height - 7 * scale) / 2);
    drawText5x7({ setPixel, x, y, text: label, scale, color: ACCENT });
  },
});

writePng({
  width: 512,
  height: 512,
  outPath: path.join(process.cwd(), "public", "favicon.png"),
  paint: ({ fillCircle, fillRect, width, height, ACCENT }) => {
    // Simple cup-ish mark: circle + base
    fillCircle(width / 2, height / 2 - 10, 130, ACCENT);
    fillRect(width / 2 - 140, height / 2 + 120, 280, 40, ACCENT);
  },
});

