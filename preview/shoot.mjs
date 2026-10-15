/**
 * Screenshots of the preview for README / review.
 * node preview/shoot.mjs [path ...]  → preview/out/<name>-{desktop,mobile}.png
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:9494';
const out = new URL('./out/', import.meta.url).pathname;
await mkdir(out, { recursive: true });

const pages = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/', '/products/focus', '/pages/quiz', '/pages/build-a-pack', '/pages/ingredient/butterfly-pea'];

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const [label, viewport] of [
  ['desktop', { width: 1440, height: 900, deviceScaleFactor: 1 }],
  ['mobile', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  page.on('pageerror', (e) => console.error(`[${label}] pageerror:`, e.message));
  page.on('console', (m) => m.type() === 'error' && console.error(`[${label}] console:`, m.text()));
  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    // Scroll through so lazy images load, then return to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await document.fonts.ready;
    });
    await new Promise((r) => setTimeout(r, 400));
    const name = path === '/' ? 'home' : path.replace(/^\//, '').replace(/[/?=&]/g, '_');
    await page.screenshot({ path: `${out}${name}-${label}.png`, fullPage: true });
    if (process.env.SEGMENTS) {
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const seg = Number(process.env.SEGMENTS);
      for (let y = 0, i = 0; y < height; y += seg, i++) {
        await page.screenshot({ path: `${out}${name}-${label}-${i}.png`, clip: { x: 0, y, width: viewport.width, height: Math.min(seg, height - y) }, captureBeyondViewport: true });
      }
    }
    console.log(`${name}-${label}`);
  }
  await page.close();
}
await browser.close();
