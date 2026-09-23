const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Create public directory
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Write the vector SVG (Scalable, Crisp, Perfect for High-DPI screens & UI)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <filter id="subtle-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Pentagon Shield Outer Border -->
  <polygon points="250,30 475,195 390,460 110,460 25,195" fill="#2B0946" />
  
  <!-- Pentagon Shield Inner Fill (Purple SAKA Pariwisata) -->
  <polygon points="250,46 458,198 379,444 121,444 42,198" fill="#995CE8" />

  <!-- Candi Prambanan Motif (Deep Indigo / Black) -->
  <g fill="#24073B">
    <!-- Puncak Stupa Mahkota Candi -->
    <circle cx="250" cy="72" r="5" />
    <path d="M246,75 L254,75 L254,92 L246,92 Z" />
    
    <!-- Tingkat 1 (Atas) -->
    <polygon points="242,92 258,92 263,105 237,105" />
    <rect x="240" y="105" width="20" height="10" />

    <!-- Tingkat 2 -->
    <polygon points="232,115 268,115 273,130 227,130" />
    <rect x="234" y="130" width="32" height="12" />
    <!-- Menara Sudut Tingkat 2 -->
    <polygon points="223,130 227,120 227,130" />
    <polygon points="277,130 273,120 273,130" />

    <!-- Tingkat 3 -->
    <polygon points="220,142 280,142 287,160 213,160" />
    <rect x="222" y="160" width="56" height="15" />
    <!-- Menara Sudut Tingkat 3 -->
    <polygon points="208,160 215,148 215,160" />
    <polygon points="292,160 285,148 285,160" />

    <!-- Tingkat 4 -->
    <polygon points="204,175 296,175 304,196 196,196" />
    <rect x="210" y="196" width="80" height="20" />
    <!-- Menara Sudut Tingkat 4 -->
    <polygon points="190,196 198,180 198,196" />
    <polygon points="310,196 302,180 302,196" />

    <!-- Tingkat 5 (Badan Utama Candi) -->
    <polygon points="186,216 314,216 324,242 176,242" />
    <rect x="194" y="242" width="112" height="26" />
    <!-- Menara Sudut Samping Tingkat 5 -->
    <polygon points="168,242 178,220 178,242" />
    <polygon points="332,242 322,220 322,242" />

    <!-- Tingkat 6 (Tubuh & Pintu Relung Candi) -->
    <polygon points="170,268 330,268 342,300 158,300" />
    <rect x="180" y="300" width="140" height="34" />
    <!-- Sayap Samping -->
    <polygon points="148,300 162,272 162,300" />
    <polygon points="352,300 338,272 338,300" />

    <!-- Tingkat 7 (Kaki / Pelataran Candi) -->
    <polygon points="152,334 348,334 358,368 142,368" />
    <rect x="156" y="368" width="188" height="20" />
    <polygon points="132,388 368,388 374,402 126,402" />
  </g>

  <!-- Sepasang Tunas Kelapa Putih Kembar (Silhouette) -->
  <g fill="#FFFFFF">
    <!-- Tunas Kelapa Kiri -->
    <!-- Buah Kelapa / Nyiyur Kiri -->
    <path d="M236,372 C216,380 194,374 194,350 C194,330 216,328 232,344 C239,352 242,364 236,372 Z" />
    <!-- Tunas Daun Cikal Kiri -->
    <path d="M225,342 C223,310 216,275 235,252 C238,274 241,304 239,332 C237,342 231,346 225,342 Z" />
    <path d="M228,328 C224,300 214,278 226,262 C228,280 232,305 232,330 Z" />

    <!-- Tunas Kelapa Kanan -->
    <!-- Buah Kelapa / Nyiyur Kanan -->
    <path d="M264,372 C284,380 306,374 306,350 C306,330 284,328 268,344 C261,352 258,364 264,372 Z" />
    <!-- Tunas Daun Cikal Kanan -->
    <path d="M275,342 C277,310 284,275 265,252 C262,274 259,304 261,332 C263,342 269,346 275,342 Z" />
    <path d="M272,328 C276,300 286,278 274,262 C272,280 268,305 268,330 Z" />
  </g>

  <!-- Pita / Tulisan SAKA PARIWISATA -->
  <text x="250" y="428" text-anchor="middle" font-family="'Inter', 'Arial Black', Arial, sans-serif" font-size="24" font-weight="900" fill="#24073B" letter-spacing="1">SAKA PARIWISATA</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent);
console.log('Generated public/logo.svg');

// 2. Generate crisp 512x512 raster PNG
const width = 512;
const height = 512;
const png = new PNG({ width, height });

// Function to check if point (x, y) is inside a convex polygon
function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Polygon coordinates scaled to 512x512
const scale = 512 / 500;
const outerPoly = [
  [250 * scale, 30 * scale],
  [475 * scale, 195 * scale],
  [390 * scale, 460 * scale],
  [110 * scale, 460 * scale],
  [25 * scale, 195 * scale],
];
const innerPoly = [
  [250 * scale, 46 * scale],
  [458 * scale, 198 * scale],
  [379 * scale, 444 * scale],
  [121 * scale, 444 * scale],
  [42 * scale, 198 * scale],
];

// Colors
const colBorder = [0x2B, 0x09, 0x46, 255]; // Deep purple border
const colBg = [0x99, 0x5C, 0xE8, 255];     // SAKA purple
const colCandi = [0x24, 0x07, 0x3B, 255];  // Candi dark indigo
const colWhite = [0xFF, 0xFF, 0xFF, 255];  // Coconut white

// Candi boxes / segments for raster rendering
const candiBoxes = [
  { minX: 246, maxX: 254, minY: 72, maxY: 92 },
  { minX: 240, maxX: 260, minY: 92, maxY: 115 },
  { minX: 232, maxX: 268, minY: 115, maxY: 142 },
  { minX: 220, maxX: 280, minY: 142, maxY: 175 },
  { minX: 204, maxX: 296, minY: 175, maxY: 216 },
  { minX: 186, maxX: 314, minY: 216, maxY: 268 },
  { minX: 170, maxX: 330, minY: 268, maxY: 334 },
  { minX: 146, maxX: 354, minY: 334, maxY: 388 },
  { minX: 130, maxX: 370, minY: 388, maxY: 404 },
];

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const origX = x / scale;
    const origY = y / scale;

    if (pointInPolygon(x, y, outerPoly)) {
      if (pointInPolygon(x, y, innerPoly)) {
        // Inside inner purple field
        let color = colBg;

        // Check if inside Candi
        for (const box of candiBoxes) {
          if (origX >= box.minX && origX <= box.maxX && origY >= box.minY && origY <= box.maxY) {
            color = colCandi;
            break;
          }
        }

        // Tunas kelapa kiri (oval nut)
        const dxl = origX - 215;
        const dyl = origY - 355;
        if ((dxl * dxl) / 360 + (dyl * dyl) / 220 <= 1) {
          color = colWhite;
        }
        // Shoot kiri
        const dslX = origX - 230;
        const dslY = origY - 300;
        if ((dslX * dslX) / 45 + (dslY * dslY) / 1800 <= 1 && origY >= 252 && origY <= 350) {
          color = colWhite;
        }

        // Tunas kelapa kanan (oval nut)
        const dxr = origX - 285;
        const dyr = origY - 355;
        if ((dxr * dxr) / 360 + (dyr * dyr) / 220 <= 1) {
          color = colWhite;
        }
        // Shoot kanan
        const dsrX = origX - 270;
        const dsrY = origY - 300;
        if ((dsrX * dsrX) / 45 + (dsrY * dsrY) / 1800 <= 1 && origY >= 252 && origY <= 350) {
          color = colWhite;
        }

        png.data[idx] = color[0];
        png.data[idx + 1] = color[1];
        png.data[idx + 2] = color[2];
        png.data[idx + 3] = color[3];
      } else {
        // Border
        png.data[idx] = colBorder[0];
        png.data[idx + 1] = colBorder[1];
        png.data[idx + 2] = colBorder[2];
        png.data[idx + 3] = colBorder[3];
      }
    } else {
      // Transparent outside pentagon
      png.data[idx] = 0;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 0;
      png.data[idx + 3] = 0;
    }
  }
}

const buffer = PNG.sync.write(png);
fs.writeFileSync(path.join(publicDir, 'logo.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buffer);

// Also copy to root logo.png so direct file references resolve
fs.writeFileSync(path.join(__dirname, '..', 'logo.png'), buffer);

console.log('Successfully generated public/logo.png, public/favicon.ico, public/favicon.png, and logo.png');
