/**
 * Renders Racik product imagery to design/out/ with headless Chrome.
 *   <handle>-pouch.png   stand-up pouch, transparent (sits on the tonic's colour tile)
 *   <handle>-glass.png   the drink, on a tinted background
 *   <handle>-sticks.png  a fan of stick packs with the botanicals
 *   ritual-glass.png     accessory, transparent
 *   hero-racik.png       homepage composition
 * Usage: node design/build.mjs
 */
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = new URL('..', import.meta.url);
const out = fileURLToPath(new URL('design/out/', root));
const font = pathToFileURL(fileURLToPath(new URL('theme/assets/bricolage-var.woff2', root))).href;
const catalog = JSON.parse(await readFile(new URL('scripts/catalog.json', root), 'utf8'));
const ingColor = Object.fromEntries(catalog.ingredients.map((i) => [i.handle, i.color]));

const INK = '#17261C';
const PAPER = '#FBFAF6';

const mix = (hex, other, t) => {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(other.slice(1), 16);
  const ch = (n, s) => (n >> s) & 255;
  const c = [16, 8, 0].map((s) => Math.round(ch(a, s) * (1 - t) + ch(b, s) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/* ---------- botanicals: simple ink-and-colour drawings, ~200×200 box ---------- */
const S = `stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
const BOTANICALS = {
  turmeric: (c) => `
    <g transform="rotate(-18 100 100)">
      <rect x="30" y="80" width="120" height="44" rx="22" fill="${c}" ${S}/>
      <rect x="62" y="44" width="34" height="62" rx="17" fill="${c}" ${S}/>
      <rect x="112" y="98" width="30" height="58" rx="15" fill="${c}" ${S}/>
      <path d="M50 96v12M84 92v14M126 96v10" ${S}/>
    </g>
    <circle cx="150" cy="58" r="30" fill="#F6C24A" ${S}/><circle cx="150" cy="58" r="16" fill="#E8901A"/>`,
  tamarind: (c) => `
    <path d="M28 132c20-60 70-90 140-84-6 22-30 30-44 40 10 6 18 20 8 34-30 10-70 22-104 10z" fill="${c}" ${S}/>
    <path d="M52 120c26-6 56-18 92-48" ${S} fill="none" opacity=".5"/>`,
  rice: (c) => Array.from({ length: 11 }, (_, i) => {
    const x = 40 + (i % 4) * 36 + (i > 3 ? 18 : 0);
    const y = 50 + Math.floor(i / 4) * 44;
    return `<ellipse cx="${x}" cy="${y}" rx="12" ry="22" transform="rotate(${(i * 37) % 70 - 35} ${x} ${y})" fill="${c}" ${S}/>`;
  }).join(''),
  'aromatic-ginger': (c) => `
    <ellipse cx="78" cy="112" rx="46" ry="36" fill="${c}" ${S}/>
    <ellipse cx="128" cy="96" rx="36" ry="28" fill="${c}" ${S}/>
    <path d="M60 110h20M112 96h18" ${S}/>
    <path d="M128 70c6-26 24-40 44-44-2 22-16 38-44 44z" fill="#6E9B4E" ${S}/>`,
  'javanese-turmeric': (c) => `
    <ellipse cx="100" cy="118" rx="62" ry="42" fill="${c}" ${S}/>
    <circle cx="100" cy="118" r="22" fill="#F2B233" ${S}/>
    <path d="M100 76V30M100 46c-20-10-30-4-40 4M100 40c18-12 32-8 42 0" ${S} fill="none"/>`,
  'red-ginger': (c) => `
    <g transform="rotate(12 100 100)">
      <rect x="34" y="88" width="112" height="40" rx="20" fill="${c}" ${S}/>
      <rect x="54" y="52" width="30" height="54" rx="15" fill="${c}" ${S}/>
      <rect x="100" y="56" width="30" height="50" rx="15" fill="${c}" ${S}/>
    </g>
    <path d="M150 150c10-8 20-8 30 0" ${S} fill="none"/>`,
  lemongrass: (c) => `
    <path d="M70 180c4-60 6-110 20-160M100 180c0-60 2-110-6-160M130 180c-6-56-10-100 6-150" ${S} fill="none"/>
    <path d="M62 180h80l-6-34H68z" fill="${c}" ${S}/>`,
  'butterfly-pea': (c) => `
    <path d="M100 30c50 10 72 54 60 94-10 34-40 50-60 50s-50-16-60-50c-12-40 10-84 60-94z" fill="${c}" ${S}/>
    <path d="M100 66c18 6 26 26 20 44-6 16-14 22-20 22s-14-6-20-22c-6-18 2-38 20-44z" fill="${PAPER}" ${S}/>
    <path d="M100 96c4 2 6 8 4 12" stroke="#F2B233" stroke-width="8" stroke-linecap="round"/>`,
  moringa: (c) => `
    <path d="M40 170C80 130 120 80 170 30" ${S} fill="none"/>
    ${[0, 1, 2, 3, 4].map((i) => {
      const x = 60 + i * 24;
      const y = 150 - i * 26;
      return `<ellipse cx="${x - 16}" cy="${y - 14}" rx="14" ry="9" transform="rotate(-50 ${x - 16} ${y - 14})" fill="${c}" ${S}/>
              <ellipse cx="${x + 14}" cy="${y + 10}" rx="14" ry="9" transform="rotate(-50 ${x + 14} ${y + 10})" fill="${c}" ${S}/>`;
    }).join('')}`,
  pandan: (c) => `
    <path d="M100 180C80 120 50 70 24 40c40 14 66 50 82 96M100 180c10-70 30-120 70-150-8 50-30 96-56 150M100 180c-4-60 0-110 4-160 12 50 8 110-4 160z" fill="${c}" ${S}/>`,
};
const botanical = (handle, x, y, size) =>
  `<g transform="translate(${x} ${y}) scale(${size / 200})">${(BOTANICALS[handle] || BOTANICALS.turmeric)(ingColor[handle] || '#C9A23A')}</g>`;

/* ---------- product drawings ---------- */
function pouch(t, { x = 0, y = 0, w = 600 } = {}) {
  const s = w / 600;
  const [a, b] = t.ingredients;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="300" cy="868" rx="250" ry="26" fill="${INK}" opacity=".18"/>
    <path d="M70 70h460l18 790H52z" fill="${PAPER}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M70 70h460v58H70z" fill="${mix(PAPER, INK, 0.06)}" stroke="${INK}" stroke-width="6"/>
    <path d="M90 99h420" stroke="${INK}" stroke-width="3" stroke-dasharray="10 9" opacity=".35"/>
    <circle cx="510" cy="160" r="9" fill="${INK}" opacity=".5"/>
    <text x="300" y="196" text-anchor="middle" style="font: 780 40px Bricolage; letter-spacing: -2px" fill="${INK}">racik<tspan fill="#2E5B39">.</tspan></text>
    <circle cx="300" cy="400" r="170" fill="${t.color}" stroke="${INK}" stroke-width="6"/>
    ${botanical(a, 168, 268, 170)}
    ${botanical(b, 286, 330, 150)}
    <text x="300" y="672" text-anchor="middle" style="font: 760 92px Bricolage; letter-spacing: -4px" fill="${INK}">${t.title}</text>
    <text x="300" y="722" text-anchor="middle" style="font: 560 30px Bricolage" fill="${INK}" opacity=".7">${t.local}</text>
    <rect x="186" y="760" width="228" height="46" rx="23" fill="${t.color}" stroke="${INK}" stroke-width="4"/>
    <text x="300" y="792" text-anchor="middle" style="font: 650 22px Bricolage" fill="${INK}">30 sticks · 3 g each</text>
  </g>`;
}

function stick(color, label, { x, y, angle = 0, w = 70 }) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">
    <rect x="${-w / 2}" y="-260" width="${w}" height="520" rx="12" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
    <rect x="${-w / 2}" y="-260" width="${w}" height="70" rx="12" fill="${color}" stroke="${INK}" stroke-width="5"/>
    <path d="M${-w / 2 + 8} -175h${w - 16}" stroke="${INK}" stroke-width="3" stroke-dasharray="7 7" opacity=".4"/>
    <text transform="rotate(-90)" x="-40" y="10" text-anchor="middle" style="font: 740 34px Bricolage; letter-spacing: -1px" fill="${INK}">${label}</text>
  </g>`;
}

function glass(liquid, { x, y, w = 420, empty = false }) {
  const s = w / 420;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="210" cy="560" rx="190" ry="22" fill="${INK}" opacity=".16"/>
    <path d="M40 40h340l-34 500H74z" fill="rgba(255,255,255,.55)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    ${empty ? '' : `<path d="M56 190h308l-24 340H80z" fill="${liquid}"/>
    <ellipse cx="210" cy="190" rx="154" ry="16" fill="${mix(liquid, '#FFFFFF', 0.25)}"/>
    <rect x="120" y="230" width="62" height="62" rx="10" fill="rgba(255,255,255,.45)" transform="rotate(14 151 261)"/>
    <rect x="214" y="300" width="56" height="56" rx="10" fill="rgba(255,255,255,.38)" transform="rotate(-10 242 328)"/>`}
    <path d="M86 70l-6 90M100 70" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
    <path d="M74 540h272" stroke="${INK}" stroke-width="6"/>
    <path d="M40 40h340" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  </g>`;
}

const svg = (w, h, body, bg = null) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>`;

/* ---------- scenes ---------- */
const jobs = {};
for (const t of catalog.tonics) {
  const tint = mix(t.color, '#FFFFFF', 0.55);
  jobs[`${t.handle}-pouch`] = { svg: svg(1000, 1000, pouch(t, { x: 200, y: 40, w: 600 })), transparent: true };
  jobs[`${t.handle}-glass`] = {
    svg: svg(1000, 1000, `
      <circle cx="760" cy="230" r="120" fill="${t.color}" opacity=".35"/>
      ${botanical(t.ingredients[0], 90, 640, 230)}
      ${botanical(t.ingredients[1], 690, 660, 210)}
      ${glass(t.color, { x: 290, y: 250, w: 420 })}
      ${stick(t.color, t.title, { x: 830, y: 470, angle: 18, w: 64 })}`, tint),
  };
  jobs[`${t.handle}-sticks`] = {
    svg: svg(1000, 1000, `
      ${[-24, -12, 0, 12, 24].map((a, i) => stick(t.color, t.title, { x: 500 + (i - 2) * 30, y: 560, angle: a, w: 72 })).join('')}
      ${botanical(t.ingredients[0], 70, 90, 200)}
      ${botanical(t.ingredients[1], 730, 120, 190)}`, tint),
  };
}
for (const ing of catalog.ingredients) {
  jobs[`ingredient-${ing.handle}`] = { svg: svg(600, 600, `<circle cx="300" cy="300" r="270" fill="${mix(ing.color, '#FFFFFF', 0.72)}"/>${botanical(ing.handle, 110, 110, 380)}`), transparent: true };
}
jobs['ritual-glass'] = { svg: svg(1000, 1000, glass('#000', { x: 290, y: 200, w: 420, empty: true })), transparent: true };

const byHandle = Object.fromEntries(catalog.tonics.map((t) => [t.handle, t]));
jobs['hero-racik'] = {
  svg: svg(1600, 1760, `
    <circle cx="1240" cy="360" r="300" fill="#F6C860"/>
    ${pouch(byHandle.focus, { x: 70, y: 380, w: 560 })}
    ${pouch(byHandle.glow, { x: 520, y: 250, w: 640 })}
    ${glass(byHandle.focus.color, { x: 1080, y: 860, w: 420 })}
    ${stick(byHandle.warmth.color, 'Warmth', { x: 1300, y: 600, angle: 24, w: 66 })}
    ${stick(byHandle.energy.color, 'Energy', { x: 1400, y: 640, angle: 34, w: 66 })}
    ${botanical('turmeric', 120, 1420, 260)}
    ${botanical('butterfly-pea', 640, 1440, 230)}`, '#F2B233'),
};

await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
const tmp = `${out}_render.html`;
for (const [name, { svg: markup, transparent }] of Object.entries(jobs)) {
  const [, w, h] = markup.match(/viewBox="0 0 (\d+) (\d+)"/);
  await writeFile(tmp, `<!doctype html><html><head><style>
    @font-face { font-family: Bricolage; src: url('${font}') format('woff2'); font-weight: 200 800; }
    html, body { margin: 0; background: transparent; } svg { display: block; }
  </style></head><body>${markup}</body></html>`);
  await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1.4 });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}${name}.png`, omitBackground: Boolean(transparent), clip: { x: 0, y: 0, width: Number(w), height: Number(h) } });
  process.stdout.write('.');
}
await rm(tmp);
await browser.close();
console.log(`\n${Object.keys(jobs).length} images → design/out/`);
