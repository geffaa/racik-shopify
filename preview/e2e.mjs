/**
 * End-to-end checks against the Racik preview (node preview/server.mjs, fresh start).
 *   node preview/e2e.mjs
 */
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE || 'http://localhost:9494';
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
async function check(name, fn) {
  try {
    await Promise.race([fn(), new Promise((_, r) => setTimeout(() => r(new Error('timed out after 20s')), 20000))]);
    results.push(true);
    console.log(`✓ ${name}`);
  } catch (e) {
    results.push(false);
    console.log(`✗ ${name}\n    ${e.message}`);
  }
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
// WARMUP=1: the store is the in-browser demo (docs/store); install its Service Worker first.
if (process.env.WARMUP) {
  const warm = await browser.newPage();
  await warm.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  await warm.waitForFunction(() => navigator.serviceWorker?.controller && !document.title.startsWith('Opening'), { timeout: 30000 });
  await warm.close();
}
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
const events = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
page.on('console', (m) => m.text().startsWith('[analytics]') && events.push(m.text()));
const text = (sel) => page.$eval(sel, (el) => el.textContent.trim());
const count = () => page.$eval('[data-cart-count]', (el) => el.textContent.trim());

await check('home: six colour tiles with real prices', async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  const prices = await page.$$eval('.tile .price span', (els) => els.map((e) => e.textContent.trim()));
  assert(prices.length >= 6, `tiles: ${prices.length}`);
  assert(!prices.some((p) => p === '$0.00'), prices.join(','));
});

await check('product: subscription is preselected and priced 15% lower', async () => {
  await page.goto(`${BASE}/products/focus`, { waitUntil: 'networkidle0' });
  assert((await text('[data-atc-price]')) === '$30.60', await text('[data-atc-price]'));
  assert(await page.$eval('[data-plan-input]', (i) => i.value === '9001'), 'plan input not set');
});

await check('product: one-time purchase switches price and clears the plan', async () => {
  await page.click('purchase-options .choice:first-child .choice__box');
  await sleep(150);
  assert((await text('[data-atc-price]')) === '$36.00', await text('[data-atc-price]'));
  assert(await page.$eval('[data-plan-input]', (i) => i.value === ''), 'plan still set');
  assert(await page.$eval('[data-frequency]', (el) => el.hidden), 'frequency visible for one-time');
});

await check('product: size change re-renders the buy box and keeps one-time', async () => {
  await page.click('.pill:nth-child(2) span');
  await sleep(600);
  assert((await text('[data-atc-price]')) === '$20.00', await text('[data-atc-price]'));
  assert(page.url().includes('variant='), 'URL not updated');
  assert(await page.$eval('[data-plan-input]', (i) => i.value === ''), 'purchase choice lost');
});

await check('product: subscription line shows its delivery schedule in the bag', async () => {
  await page.click('[data-subscription] + .choice__box');
  await page.select('[data-frequency] select', '9002');
  await sleep(100);
  await page.click('[data-atc]');
  await sleep(700);
  assert(await page.$eval('#cart-drawer', (d) => d.open), 'drawer closed');
  assert((await text('#cart-drawer .sub-tag')).includes('60 days'), await text('#cart-drawer .sub-tag'));
  await page.keyboard.press('Escape');
});

await check('quiz: answers lead to Focus and a prefilled pack', async () => {
  await page.goto(`${BASE}/pages/quiz`, { waitUntil: 'networkidle0' });
  await page.click('[data-start]');
  const pick = async (label) => {
    await sleep(350);
    const boxes = await page.$$('fieldset:not([hidden]) .answer__box');
    for (const b of boxes) if ((await b.evaluate((e) => e.textContent.trim())) === label) return b.click();
    throw new Error(`answer not found: ${label}`);
  };
  await pick('Clearer focus');
  await pick('After lunch');
  await pick('Iced, or with sparkling water');
  await pick('Floral & herbal');
  await sleep(150);
  await page.click('fieldset:not([hidden]) [data-next]');
  await sleep(500);
  const titles = await page.$$eval('.pick__title', (els) => els.map((e) => e.textContent));
  assert(titles.length === 3 && titles[0] === 'Focus', titles.join(','));
  assert(events.some((e) => e.includes('racik:quiz_completed')), 'quiz_completed not published');
  await page.click('[data-build]');
  await page.waitForSelector('pack-builder');
  await sleep(300);
  assert((await text('[data-count-label]')) === '3/8', await text('[data-count-label]'));
  assert(!(await page.$eval('[data-add]', (b) => b.disabled)), 'add disabled at 3');
});

await check('pack: five pouches unlock 15% and the preview total matches it', async () => {
  const plus = await page.$$('[data-inc]');
  await plus[0].click();
  await plus[1].click();
  await sleep(200);
  assert((await text('[data-tier-msg]')).includes('15%'), await text('[data-tier-msg]'));
  assert((await text('[data-discount-label]')).includes('15%'), 'discount label');
  assert((await page.$$('[data-slots] li[data-filled]')).length === 5, 'slots not filled');
});

await check('pack: added as one group, priced by the pack-discount Function', async () => {
  await page.click('[data-add]');
  await sleep(800);
  assert((await text('#cart-drawer .pack-group__head .d-3')) === 'Pack of 5', await text('#cart-drawer .pack-group__head .d-3'));
  assert((await text('#cart-drawer .pack-group .sub-tag')).startsWith('You save'), 'no saving shown');
  assert(Number(await count()) === 6, `count ${await count()}`);
});

await check('pack: removing the pack removes all its lines', async () => {
  await page.click('#cart-drawer [data-remove-pack]');
  await sleep(700);
  assert(!(await page.$('#cart-drawer .pack-group')), 'pack still in bag');
  assert(Number(await count()) === 1, `count ${await count()}`);
  await page.keyboard.press('Escape');
});

await check('markets: Germany shows euros, duties note and the consent banner', async () => {
  await page.goto(`${BASE}/products/glow`, { waitUntil: 'networkidle0' });
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.select('#header-country', 'DE')]);
  assert((await text('[data-atc-price]')).startsWith('€'), await text('[data-atc-price]'));
  assert((await text('.delivery')).includes('Duties'), 'no duties note');
  assert(await page.$eval('consent-banner', (b) => !b.hidden), 'banner hidden in the EU');
  await page.click('[data-consent="all"]');
  await sleep(200);
  assert(await page.$eval('consent-banner', (b) => b.hidden), 'banner did not close');
});

await check('markets: free-shipping bar uses the EUR threshold', async () => {
  await page.click('[data-open-dialog="cart-drawer"]');
  await sleep(400);
  assert((await text('#cart-drawer .ship-bar')).includes('€'), await text('#cart-drawer .ship-bar'));
  await page.keyboard.press('Escape');
});

await check('ingredient chips lead to metaobject pages', async () => {
  await page.click('.pdp__chips a');
  await page.waitForSelector('.ingp');
  assert(page.url().includes('/pages/ingredient/'), page.url());
  assert(await page.$('.ingp__art img'), 'no illustration');
});

await check('no JS errors or failed requests', async () => assert(!errors.length, errors.join('\n')));

await browser.close();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exitCode = results.every(Boolean) ? 0 : 1;
