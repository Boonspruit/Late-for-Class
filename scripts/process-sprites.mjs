/**
 * Pre-processes AI-generated sprite PNGs to remove the fake checkered 
 * transparency pattern and save as PNGs with real alpha.
 * 
 * Run: node scripts/process-sprites.mjs
 */
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, '..', 'public', 'assets');

// Files to process: [input, output]
const SPRITES = [
  ['stair.png', 'stair-clean.png'],
  ['student-idle.png', 'student-idle-clean.png'],
  ['student-climb.png', 'student-climb-clean.png'],
  ['student-trip.png', 'student-trip-clean.png'],
];

function isBgGray(r, g, b, a) {
  if (a < 10) return true;
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC - minC;
  return sat < 25 && minC > 140;
}

async function processSprite(inputFile, outputFile) {
  const inputPath = join(ASSETS, inputFile);
  const outputPath = join(ASSETS, outputFile);

  console.log(`Processing ${inputFile}...`);
  const img = await loadImage(inputPath);
  const w = img.width, h = img.height;

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const getPixel = (x, y) => {
    const i = (y * w + x) * 4;
    return [data[i], data[i+1], data[i+2], data[i+3]];
  };
  const setAlpha = (x, y, a) => { data[(y * w + x) * 4 + 3] = a; };

  // Pass 1: Flood fill from edges
  const visited = new Uint8Array(w * h);

  function flood(sx, sy) {
    const p = getPixel(sx, sy);
    if (!isBgGray(p[0], p[1], p[2], p[3])) return;
    const stack = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      const idx = y * w + x;
      if (visited[idx]) continue;
      const px = getPixel(x, y);
      if (!isBgGray(px[0], px[1], px[2], px[3])) continue;
      visited[idx] = 1;
      setAlpha(x, y, 0);
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
      stack.push([x+1,y+1],[x-1,y-1],[x+1,y-1],[x-1,y+1]);
    }
  }

  for (let x = 0; x < w; x++) { flood(x, 0); flood(x, h-1); }
  for (let y = 0; y < h; y++) { flood(0, y); flood(w-1, y); }

  // Pass 2 & 3: cleanup stray bg pixels near transparent areas
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (visited[y * w + x]) continue;
        const p = getPixel(x, y);
        if (!isBgGray(p[0], p[1], p[2], p[3])) continue;
        let tn = 0;
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && visited[ny * w + nx]) tn++;
        }
        if (tn >= 2) { setAlpha(x, y, 0); visited[y * w + x] = 1; }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const buf = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buf);
  console.log(`  → Saved ${outputFile} (${w}x${h})`);
}

(async () => {
  for (const [inp, out] of SPRITES) {
    await processSprite(inp, out);
  }
  console.log('Done! All sprites processed.');
})();
