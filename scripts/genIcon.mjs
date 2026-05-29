// Generates assets/icon.png (256x256) with no external dependencies, using
// Node's built-in zlib. Produces the NeuralPath mark: a dark base with a blue
// diagonal neural-net motif. Run with: node scripts/genIcon.mjs
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SIZE = 256;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Palette (matches the app design tokens).
const BG = [13, 15, 20];        // --bg-base
const ACCENT = [79, 142, 247];  // --accent
const GREEN = [62, 207, 142];   // --accent-green

// Node positions (in a 24x24 logical grid, like the sidebar SVG) scaled to 256.
const nodes = [
  { x: 5, y: 6, c: ACCENT },
  { x: 5, y: 18, c: ACCENT },
  { x: 12, y: 12, c: GREEN },
  { x: 19, y: 7, c: ACCENT },
  { x: 19, y: 17, c: ACCENT },
].map((n) => ({ x: (n.x / 24) * SIZE, y: (n.y / 24) * SIZE, c: n.c }));

const edges = [
  [0, 2], [1, 2], [2, 3], [2, 4],
];

function dist(px, py, x, y) {
  return Math.hypot(px - x, py - y);
}

// Distance from point P to segment AB.
function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, ax + t * dx, ay + t * dy);
}

function pixel(x, y) {
  // edges first (thin lines)
  for (const [a, b] of edges) {
    if (distToSeg(x, y, nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y) < 2.2) {
      return [60, 70, 100];
    }
  }
  // nodes (filled circles with soft edge)
  for (const n of nodes) {
    const d = dist(x, y, n.x, n.y);
    if (d < 14) return n.c;
    if (d < 17) {
      const t = (17 - d) / 3;
      return n.c.map((v, i) => Math.round(v * t + BG[i] * (1 - t)));
    }
  }
  return BG;
}

// Build raw RGBA scanlines with PNG filter byte 0 per row.
const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
let o = 0;
for (let y = 0; y < SIZE; y++) {
  raw[o++] = 0; // filter: none
  for (let x = 0; x < SIZE; x++) {
    const [r, g, b] = pixel(x, y);
    raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = 255;
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC32 (PNG polynomial).
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // color type RGBA
// 10,11,12 = compression, filter, interlace = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const outDir = path.join(__dirname, "..", "assets");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "icon.png");
fs.writeFileSync(outPath, png);
console.log("wrote", outPath, `(${png.length} bytes)`);

// Also write a Windows .ico (Vista+ style: ICONDIR + 1 entry pointing at the
// PNG payload). NSIS / electron-builder need a real .ico for installer icons.
const icoHeader = Buffer.alloc(6 + 16);
// ICONDIR
icoHeader.writeUInt16LE(0, 0);          // reserved
icoHeader.writeUInt16LE(1, 2);          // type = icon
icoHeader.writeUInt16LE(1, 4);          // count = 1
// ICONDIRENTRY
icoHeader.writeUInt8(0, 6);             // width  (0 = 256)
icoHeader.writeUInt8(0, 7);             // height (0 = 256)
icoHeader.writeUInt8(0, 8);             // colors
icoHeader.writeUInt8(0, 9);             // reserved
icoHeader.writeUInt16LE(1, 10);         // color planes
icoHeader.writeUInt16LE(32, 12);        // bits per pixel
icoHeader.writeUInt32LE(png.length, 14);// image size
icoHeader.writeUInt32LE(22, 18);        // offset to image data
const ico = Buffer.concat([icoHeader, png]);
const icoPath = path.join(outDir, "icon.ico");
fs.writeFileSync(icoPath, ico);
console.log("wrote", icoPath, `(${ico.length} bytes)`);
