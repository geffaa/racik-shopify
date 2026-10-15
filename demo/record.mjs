/**
 * Scripted demo recording of the Racik storefront (via the offline preview).
 *   node preview/server.mjs &   then   node demo/record.mjs
 * Output: demo/out/racik-demo.mp4
 *
 * Each scene is recorded with Puppeteer's screencast (needs ffmpeg), then the
 * clips are joined and encoded to H.264 so the file plays everywhere.
 */
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:9494';
const OUT = new URL('./out/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const W = 1440;
const H = 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  defaultViewport: null,
  args: [`--window-size=${W},${H}`, '--hide-scrollbars'],
});

/* ---------- overlay helpers (cursor + caption), injected on every page ---------- */

const OVERLAY = `
  (() => {
    if (window.__demo) return;
    window.__demo = true;
    const css = document.createElement('style');
    css.textContent = \`
      #demo-cursor { position: fixed; z-index: 2147483647; width: 22px; height: 22px; margin: -3px 0 0 -3px; pointer-events: none;
        transition: transform 60ms linear; }
      #demo-cursor.down { transform: scale(.82); }
      #demo-cap { position: fixed; z-index: 2147483646; left: 50%; bottom: 28px; transform: translate(-50%, 12px); opacity: 0;
        background: #17261C; color: #FBFAF6; font: 600 15px/1.35 Bricolage, system-ui, sans-serif; border-radius: 999px;
        letter-spacing: .01em; padding: 12px 18px 11px; max-width: 760px; text-align: center; pointer-events: none;
        transition: opacity 240ms ease, transform 240ms ease; box-shadow: 0 0 0 1px rgba(238,235,228,.12); }
      #demo-cap.on { opacity: 1; transform: translate(-50%, 0); }
      #demo-cap b { color: #F2B233; font-weight: 700; }
    \`;
    const add = () => {
      document.head.appendChild(css);
      const c = document.createElement('div');
      c.id = 'demo-cursor';
      c.innerHTML = '<svg viewBox="0 0 22 22" width="22" height="22"><path d="M3 2l15 9-7 1.6L7.5 20z" fill="#17261C" stroke="#FBFAF6" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      const cap = document.createElement('div');
      cap.id = 'demo-cap';
      document.body.append(c, cap);
      const pos = JSON.parse(sessionStorage.getItem('demo-pos') || '[720,450]');
      c.style.left = pos[0] + 'px'; c.style.top = pos[1] + 'px';
      addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; sessionStorage.setItem('demo-pos', JSON.stringify([e.clientX, e.clientY])); }, true);
      addEventListener('mousedown', () => c.classList.add('down'), true);
      addEventListener('mouseup', () => c.classList.remove('down'), true);
      // keep overlay above open <dialog>s (top layer): re-parent into the open dialog
      new MutationObserver(() => {
        const d = [...document.querySelectorAll('dialog[open]')].pop();
        const host = d || document.body;
        if (c.parentNode !== host) host.append(c, cap);
      }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open'] });
    };
    if (document.body) add(); else addEventListener('DOMContentLoaded', add);
  })();
`;

async function newPage(viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.evaluateOnNewDocument(OVERLAY);
  return page;
}

async function caption(page, html, hold = 0) {
  await page.evaluate((h) => {
    const cap = document.getElementById('demo-cap');
    if (!cap) return;
    if (!h) return cap.classList.remove('on');
    cap.innerHTML = h;
    cap.classList.add('on');
  }, html);
  if (hold) await sleep(hold);
}

let mouse = { x: 720, y: 450 };
async function moveTo(page, x, y, steps = 28) {
  const from = { ...mouse };
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // ease in-out
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    await sleep(12);
  }
  mouse = { x, y };
}

async function center(page, selector, index = 0) {
  // Bring off-screen targets into view first, the way a person would scroll to them.
  const moved = await page.evaluate(
    (s, i) => {
      const el = document.querySelectorAll(s)[i];
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.top >= 0 && r.top + Math.min(r.height, 60) <= innerHeight) return false; // already reachable on screen
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return true;
    },
    selector,
    index
  );
  if (moved) await sleep(700);
  const box = await page.evaluate(
    (s, i) => {
      const el = document.querySelectorAll(s)[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    selector,
    index
  );
  if (!box) throw new Error(`not found: ${selector}[${index}]`);
  return box;
}

async function clickOn(page, selector, index = 0, { pause = 250 } = {}) {
  const { x, y } = await center(page, selector, index);
  await moveTo(page, x, y);
  await sleep(pause);
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
}

async function hoverOn(page, selector, index = 0) {
  const { x, y } = await center(page, selector, index);
  await moveTo(page, x, y);
}

/** Smooth scroll to an absolute Y (or element top minus offset). */
async function scrollTo(page, target, { offset = 0, duration = 1200 } = {}) {
  await page.evaluate(
    async (target, offset, duration) => {
      const y = typeof target === 'number' ? target : document.querySelector(target).getBoundingClientRect().top + scrollY - offset;
      const start = scrollY;
      const t0 = performance.now();
      await new Promise((done) => {
        const step = (now) => {
          const t = Math.min(1, (now - t0) / duration);
          const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
          scrollTo(0, start + (y - start) * e);
          t < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      });
    },
    target,
    offset,
    duration
  );
  await sleep(150);
}

async function typeSlow(page, selector, text) {
  await page.focus(selector);
  for (const ch of text) {
    await page.keyboard.type(ch);
    await sleep(85);
  }
}

async function slide(page, html) {
  await page.setContent(
    `<!doctype html><html><head><style>
      @font-face { font-family: Bricolage; src: url('${BASE}/assets/bricolage-var.woff2') format('woff2'); font-weight: 200 800; }
      html, body { margin: 0; height: 100%; background: #FBFAF6; color: #17261C; font-family: Bricolage, sans-serif; }
      .s { height: 100%; box-sizing: border-box; padding: 64px 80px; display: grid; }
      .lab { font-weight: 600; font-size: 16px; color: #4C5A50; }
      h1 { font-size: 150px; line-height: .9; font-weight: 780; letter-spacing: -.05em; margin: 0; }
      h2 { font-size: 72px; line-height: .95; font-weight: 740; letter-spacing: -.04em; margin: 0; }
      .dots { display: flex; gap: 14px; }
      .dots i { width: 64px; height: 64px; border-radius: 50%; display: block; box-shadow: inset -8px -8px 0 rgba(0,0,0,.1); }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
      .card { border-radius: 28px; padding: 24px; background: #fff; border: 1.5px solid #E2DFD3; }
      .num { font-size: 60px; font-weight: 760; letter-spacing: -.03em; line-height: 1; }
      pre { font: 500 14px/1.6 ui-monospace, Menlo, monospace; background: #17261C; color: #E8E6DD; padding: 20px 24px; margin: 0; border-radius: 24px; }
      .ok { color: #9BD27F } .k { color: #F2B233 }
    </style></head><body>${html}</body></html>`,
    { waitUntil: 'load' }
  );
  await page.evaluate(() => document.fonts.ready);
}

/* ---------------------------------------------------------------------- */

const clips = [];

/** Static slides: screenshot → looped clip. Deterministic, unlike screencasting a page that doesn't repaint. */
async function still(name, page, html, seconds) {
  await page.bringToFront();
  await slide(page, html);
  await sleep(300);
  const path = `${OUT}${name}.png`;
  await page.screenshot({ path });
  clips.push({ path, seconds });
  console.log(`✓ ${name}`);
}

async function record(name, page, fn) {
  const path = `${OUT}${name}.webm`;
  await page.bringToFront(); // background tabs stop painting, which stalls the screencast
  const rec = await page.screencast({ path });
  try {
    await fn();
  } finally {
    await rec.stop();
  }
  clips.push({ path });
  console.log(`✓ ${name}`);
}

const desktop = await newPage({ width: W, height: H, deviceScaleFactor: 1 });
await desktop.goto(`${BASE}/`, { waitUntil: 'networkidle0' });

await still(
  '01-title',
  desktop,
  `<div class="s" style="align-content:space-between">
    <div class="lab" style="display:flex;justify-content:space-between"><span>Portfolio · Shopify developer</span><span>Yodhimas Geffananda</span></div>
    <div style="display:grid;gap:28px">
      <div class="dots"><i style="background:#F2B233"></i><i style="background:#EADBB6"></i><i style="background:#D9822B"></i><i style="background:#B5412E"></i><i style="background:#3D4FA3"></i><i style="background:#4A7A2E"></i></div>
      <h1>racik<span style="color:#2E5B39">.</span></h1>
      <p style="font-size:30px;font-weight:600;margin:0;max-width:30ch">Subscriptions, bundles and a product quiz for an international wellness brand.</p>
    </div>
    <div class="lab" style="display:flex;gap:28px;flex-wrap:wrap"><span>Selling plans</span><span>Shopify Functions</span><span>Metaobjects</span><span>Markets</span><span>Liquid · vanilla JS</span></div>
  </div>`,
  3.6
);

await record('02-home', desktop, async () => {
  await desktop.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  await sleep(500);
  await caption(desktop, 'Botanical tonics from Indonesia, sold to the US, UK, EU and Australia.', 2600);
  await scrollTo(desktop, '.tiles', { offset: 160, duration: 1400 });
  await caption(desktop, 'Every product brings its own colour from a metafield; text contrast is picked automatically.');
  await hoverOn(desktop, '.tile', 0);
  await sleep(700);
  await hoverOn(desktop, '.tile', 4);
  await sleep(900);
  await scrollTo(desktop, '.ing-grid', { offset: 260, duration: 1600 });
  await caption(desktop, 'Ingredients are <b>metaobjects</b>, each with its own page.');
  await hoverOn(desktop, '.ing', 7);
  await sleep(1300);
  await caption(desktop, '');
});

await record('03-quiz', desktop, async () => {
  await desktop.goto(`${BASE}/pages/quiz`, { waitUntil: 'networkidle0' });
  await caption(desktop, 'Product quiz: questions and answers are editable blocks; answers map to product tags.');
  await sleep(800);
  await clickOn(desktop, '[data-start]');
  for (const label of ['Clearer focus', 'After lunch', 'Iced, or with sparkling water']) {
    await sleep(700);
    const idx = await desktop.$$eval('fieldset:not([hidden]) .answer__box', (els, l) => els.findIndex((e) => e.textContent.trim() === l), label);
    await clickOn(desktop, 'fieldset:not([hidden]) .answer__box', idx);
  }
  await sleep(800);
  for (const label of ['Floral & herbal', 'Bright & citrusy']) {
    const idx = await desktop.$$eval('fieldset:not([hidden]) .answer__box', (els, l) => els.findIndex((e) => e.textContent.trim() === l), label);
    await clickOn(desktop, 'fieldset:not([hidden]) .answer__box', idx);
    await sleep(300);
  }
  await clickOn(desktop, 'fieldset:not([hidden]) [data-next]');
  await caption(desktop, 'Three matches, with the reasons shown. One click builds them into a pack.');
  await sleep(2600);
  await scrollTo(desktop, 0, { duration: 300 });
  await caption(desktop, '');
});

await record('04-pack', desktop, async () => {
  await clickOn(desktop, '[data-build]');
  await desktop.waitForSelector('pack-builder');
  await sleep(700);
  await caption(desktop, 'Build-your-own pack: three pouches unlock 10% off, five unlock 15%.');
  await scrollTo(desktop, 360, { duration: 800 });
  await clickOn(desktop, '[data-inc]', 5);
  await sleep(600);
  await clickOn(desktop, '[data-inc]', 3);
  await sleep(900);
  await caption(desktop, 'The tier discount is enforced at checkout by a <b>Shopify Function</b> that reads each line’s pack id.');
  await sleep(1600);
  await clickOn(desktop, '[data-add]');
  await sleep(2600);
  await clickOn(desktop, '#cart-drawer [data-close-dialog]');
  await caption(desktop, '');
});

await record('05-product', desktop, async () => {
  await desktop.goto(`${BASE}/products/focus`, { waitUntil: 'networkidle0' });
  await sleep(500);
  await caption(desktop, 'Subscribe & save is preselected. Each option shows its own price, rendered by Liquid.');
  await sleep(1400);
  await clickOn(desktop, 'purchase-options .choice:first-child .choice__box');
  await sleep(1100);
  await clickOn(desktop, '[data-subscription] + .choice__box');
  await sleep(700);
  await clickOn(desktop, '.pill:nth-child(2) span');
  await sleep(1300);
  await caption(desktop, 'FDA-style Supplement Facts from a JSON metafield.');
  await clickOn(desktop, '.pdp__acc details:nth-child(3) summary');
  await sleep(500);
  await scrollTo(desktop, '.facts', { offset: 140, duration: 900 });
  await sleep(1800);
  await caption(desktop, '');
});

await record('06-markets', desktop, async () => {
  await desktop.goto(`${BASE}/products/glow`, { waitUntil: 'networkidle0' });
  await caption(desktop, '<b>Shopify Markets</b>: switch country and prices, shipping threshold and duties notes follow.');
  await sleep(1200);
  await hoverOn(desktop, '#header-country');
  await sleep(300);
  await Promise.all([desktop.waitForNavigation({ waitUntil: 'networkidle0' }), desktop.select('#header-country', 'DE')]);
  await caption(desktop, 'EU visitors get a consent banner from the Customer Privacy API; US visitors don’t.');
  await sleep(2400);
  await clickOn(desktop, '[data-consent="all"]');
  await sleep(1000);
  await caption(desktop, '');
});

await desktop.setCookie({ name: 'country', value: 'US', url: BASE }); // back to the US market for the mobile scene
const phoneHost = await newPage({ width: W, height: H, deviceScaleFactor: 1 });
await phoneHost.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
await phoneHost.setContent(
  `<!doctype html><html><head><style>
    @font-face { font-family: Bricolage; src: url('${BASE}/assets/bricolage-var.woff2') format('woff2'); font-weight: 200 800; }
    html,body{margin:0;height:100%;background:#3D4FA3;font-family:Bricolage,sans-serif;color:#fff}
    .wrap{height:100%;display:grid;grid-template-columns:1fr 430px 1fr;align-items:center}
    .phone{width:390px;height:780px;border:12px solid #17261C;border-radius:46px;overflow:hidden;background:#FBFAF6;justify-self:center}
    iframe{width:390px;height:780px;border:0;display:block}
    .copy{padding:0 56px}
    h2{font-size:62px;line-height:.92;font-weight:760;letter-spacing:-.04em;margin:0 0 18px}
    p{font-size:19px;line-height:1.45;max-width:28ch;opacity:.9}
  </style></head><body><div class="wrap">
    <div class="copy"><h2>Thumb-first</h2><p>On phones the pack tray becomes a bottom sheet: slots and the button stay in reach, options fold away.</p></div>
    <div class="phone"><iframe src="${BASE}/pages/build-a-pack"></iframe></div>
    <div class="copy"><h2 style="font-size:48px">A11y 100<br>SEO 100<br>CLS 0</h2><p>Lighthouse mobile on every main page.</p></div>
  </div></body></html>`,
  { waitUntil: 'load' }
);
await phoneHost.evaluate(() => document.fonts.ready);
await sleep(1500);
const frame = () => phoneHost.frames().find((f) => f.url().includes('/pages/'));
await record('07-mobile', phoneHost, async () => {
  await sleep(600);
  for (const i of [0, 4, 3]) {
    const btns = await frame().$$('[data-inc]');
    await btns[i].evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    await sleep(700);
    await btns[i].click();
    await sleep(600);
  }
  await frame().click('[data-tray-toggle]');
  await sleep(1800);
  await frame().click('[data-tray-toggle]');
  await sleep(800);
});

const outro = await newPage({ width: W, height: H, deviceScaleFactor: 1 });
await outro.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
await still(
  '08-outro',
  outro,
  `<div class="s" style="grid-template-rows:auto auto 1fr auto;gap:30px">
    <div class="lab">Behind the storefront</div>
    <h2>Rules enforced server-side,<br>tested outside the store</h2>
    <pre><span style="color:#8D9A8F">$ npm test</span>

<span class="ok">✓</span> pack of 3 across two lines gets 10% on both lines, singles untouched
<span class="ok">✓</span> two packs are priced independently
<span class="ok">✓</span> tiers come from the metafield when present
<span class="ok">✓</span> every quiz answer tag is carried by at least one tonic
<span class="ok">✓</span> discount carries the same tiers the theme displays
<span class="ok">✓</span> selling plans: 30 and 60 days at 15% off, billing matches delivery

<span class="k">14/14 passed</span>   ·   e2e <span class="k">13/13 passed</span></pre>
    <div class="grid">
      <div class="card"><div class="num">0</div><div class="lab">Theme Check offenses</div></div>
      <div class="card"><div class="num">14</div><div class="lab">Function & seed tests</div></div>
      <div class="card"><div class="num">13/13</div><div class="lab">End-to-end checks</div></div>
      <div class="card"><div class="num">100</div><div class="lab">Lighthouse accessibility</div></div>
    </div>
  </div>`,
  6
);

await browser.close();

/* ---------- join + encode ---------- */
const parts = clips.flatMap((c) => (c.seconds ? ['-loop', '1', '-framerate', '30', '-t', String(c.seconds), '-i', c.path] : ['-i', c.path]));
const filter =
  clips.map((_, i) => `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x131312,fps=30,setsar=1[v${i}]`).join(';') +
  ';' +
  clips.map((_, i) => `[v${i}]`).join('') +
  `concat=n=${clips.length}:v=1:a=0[out]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...parts, '-filter_complex', filter, '-map', '[out]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}racik-demo.mp4`]);
console.log(`→ ${OUT}racik-demo.mp4`);
