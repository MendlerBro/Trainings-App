/**
 * Generates placeholder app icons (no external deps — hand-rolled PNG encoder).
 * Produces a simple flat "dumbbell" mark on a dark background:
 *  - assets/icon.png            1024x1024 opaque (App Store icon)
 *  - assets/splash-icon.png     1024x1024 transparent mark (expo-splash-screen)
 *  - assets/android-icon-foreground.png  1024x1024 transparent mark (adaptive icon)
 *  - assets/android-icon-background.png  1024x1024 solid background (adaptive icon)
 *  - assets/android-icon-monochrome.png  1024x1024 white mark on transparent (adaptive icon)
 *  - assets/favicon.png         48x48 opaque (web fallback)
 *
 * Replace these with real designed artwork before submitting to the App Store.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BG = [0x12, 0x13, 0x1a]; // near-black navy
const ACCENT = [0xb8, 0xff, 0x5a]; // lime accent

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/**
 * Writes an RGBA raster (4 bytes/px) to a PNG file. Pass `opaque: true` to drop the
 * alpha channel entirely (color type 2 / RGB) — required for the App Store marketing
 * icon, which must not carry an alpha channel at all.
 */
function writePng(filePath, width, height, rgba, { opaque = false } = {}) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const bytesPerPx = opaque ? 3 : 4;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = opaque ? 2 : 6; // color type: 2 = RGB, 6 = RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  // raw scanlines: filter byte 0 + width*bytesPerPx bytes per row
  const raw = Buffer.alloc((width * bytesPerPx + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      raw[o++] = rgba[i];
      raw[o++] = rgba[i + 1];
      raw[o++] = rgba[i + 2];
      if (!opaque) raw[o++] = rgba[i + 3];
    }
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idat = chunk('IDAT', idatData);
  const iend = chunk('IEND', Buffer.alloc(0));

  fs.writeFileSync(filePath, Buffer.concat([sig, ihdr, idat, iend]));
}

/** Creates a WxH RGBA buffer filled with a solid color (or transparent if color is null). */
function makeCanvas(size, color) {
  const buf = Buffer.alloc(size * size * 4);
  if (color) {
    for (let i = 0; i < buf.length; i += 4) {
      buf[i] = color[0];
      buf[i + 1] = color[1];
      buf[i + 2] = color[2];
      buf[i + 3] = 255;
    }
  }
  return buf;
}

function setPx(buf, size, x, y, color, alpha = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  buf[i] = color[0];
  buf[i + 1] = color[1];
  buf[i + 2] = color[2];
  buf[i + 3] = alpha;
}

function fillRoundedRect(buf, size, x0, y0, x1, y1, radius, color, ss = 3) {
  const minX = Math.max(0, Math.floor(x0));
  const maxX = Math.min(size - 1, Math.ceil(x1));
  const minY = Math.max(0, Math.floor(y0));
  const maxY = Math.min(size - 1, Math.ceil(y1));
  const cx0 = x0 + radius;
  const cx1 = x1 - radius;
  const cy0 = y0 + radius;
  const cy1 = y1 - radius;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let covered = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = x + (sx + 0.5) / ss;
          const py = y + (sy + 0.5) / ss;
          let inside = px >= x0 && px <= x1 && py >= y0 && py <= y1;
          if (inside && radius > 0) {
            // check corners
            if (px < cx0 && py < cy0) inside = Math.hypot(px - cx0, py - cy0) <= radius;
            else if (px > cx1 && py < cy0) inside = Math.hypot(px - cx1, py - cy0) <= radius;
            else if (px < cx0 && py > cy1) inside = Math.hypot(px - cx0, py - cy1) <= radius;
            else if (px > cx1 && py > cy1) inside = Math.hypot(px - cx1, py - cy1) <= radius;
          }
          if (inside) covered++;
        }
      }
      if (covered > 0) {
        const alpha = Math.round((covered / (ss * ss)) * 255);
        const i = (y * size + x) * 4;
        if (buf[i + 3] === 0 && alpha < 255) {
          // blend onto transparent: just set with partial alpha
          buf[i] = color[0];
          buf[i + 1] = color[1];
          buf[i + 2] = color[2];
          buf[i + 3] = alpha;
        } else {
          // blend onto existing opaque background
          const a = alpha / 255;
          buf[i] = Math.round(color[0] * a + buf[i] * (1 - a));
          buf[i + 1] = Math.round(color[1] * a + buf[i + 1] * (1 - a));
          buf[i + 2] = Math.round(color[2] * a + buf[i + 2] * (1 - a));
          buf[i + 3] = Math.max(buf[i + 3], alpha);
        }
      }
    }
  }
}

/** Draws the dumbbell glyph centered in a `size`x`size` canvas at the given scale (0-1 of canvas). */
function drawDumbbell(buf, size, scale, color) {
  const cx = size / 2;
  const cy = size / 2;
  const barW = size * scale * 0.86;
  const barH = size * scale * 0.16;
  const weightW = size * scale * 0.22;
  const weightH = size * scale * 0.62;
  const r = barH / 2;

  // bar
  fillRoundedRect(buf, size, cx - barW / 2, cy - barH / 2, cx + barW / 2, cy + barH / 2, r, color);
  // left weight
  fillRoundedRect(
    buf,
    size,
    cx - barW / 2 - weightW * 0.55,
    cy - weightH / 2,
    cx - barW / 2 + weightW * 0.45,
    cy + weightH / 2,
    weightW * 0.28,
    color
  );
  // right weight
  fillRoundedRect(
    buf,
    size,
    cx + barW / 2 - weightW * 0.45,
    cy - weightH / 2,
    cx + barW / 2 + weightW * 0.55,
    cy + weightH / 2,
    weightW * 0.28,
    color
  );
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// 1. App icon (opaque, full bleed, no transparency)
{
  const size = 1024;
  const buf = makeCanvas(size, BG);
  drawDumbbell(buf, size, 0.5, ACCENT);
  writePng(path.join(assetsDir, 'icon.png'), size, size, buf, { opaque: true });
}

// 2. Splash icon (transparent bg, mark only — composited over splash backgroundColor)
{
  const size = 1024;
  const buf = makeCanvas(size, null);
  drawDumbbell(buf, size, 0.42, ACCENT);
  writePng(path.join(assetsDir, 'splash-icon.png'), size, size, buf);
}

// 3. Android adaptive icon foreground (transparent bg, mark within safe zone)
{
  const size = 1024;
  const buf = makeCanvas(size, null);
  drawDumbbell(buf, size, 0.34, ACCENT);
  writePng(path.join(assetsDir, 'android-icon-foreground.png'), size, size, buf);
}

// 4. Android adaptive icon background (solid)
{
  const size = 1024;
  const buf = makeCanvas(size, BG);
  writePng(path.join(assetsDir, 'android-icon-background.png'), size, size, buf, { opaque: true });
}

// 5. Android monochrome icon (white mark, transparent bg)
{
  const size = 1024;
  const buf = makeCanvas(size, null);
  drawDumbbell(buf, size, 0.34, [255, 255, 255]);
  writePng(path.join(assetsDir, 'android-icon-monochrome.png'), size, size, buf);
}

// 6. Favicon (small, opaque)
{
  const size = 48;
  const buf = makeCanvas(size, BG);
  drawDumbbell(buf, size, 0.5, ACCENT);
  writePng(path.join(assetsDir, 'favicon.png'), size, size, buf, { opaque: true });
}

console.log('Icons generated in', assetsDir);
