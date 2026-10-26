/**
 * RACIK — global.js (module, no dependencies)
 * Shared helpers are exposed on window.Racik for page modules; importing this
 * file from another asset would load it twice because of Shopify's ?v= URLs.
 */
const config = JSON.parse(document.getElementById('theme-config')?.textContent || '{}');
const { routes = {}, strings = {} } = config;

export function publish(name, data = {}) {
  try {
    window.Shopify?.analytics?.publish?.(`racik:${name}`, data);
  } catch {
    /* never let analytics break the page */
  }
}

export const debounce = (fn, ms = 250) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

const parse = (html) => new DOMParser().parseFromString(html, 'text/html');

export async function fetchSection(url, sectionId) {
  const u = new URL(url, window.location.origin);
  u.searchParams.set('section_id', sectionId);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`section ${res.status}`);
  return parse(await res.text());
}

let toastTimer;
export function toast(message) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

/**
 * Formats minor units like Liquid's `money` filter does for the customer's
 * currency. shop.money_format is always the shop's own currency, so instead
 * the layout renders a sample (123456 | money, e.g. "€1.234,56") and the
 * symbol position and separators are read back from it. Only used for live
 * previews (pack totals); every other price comes from Liquid.
 */
export function formatMoney(cents, sample = config.moneySample || '$1,234.56') {
  // "€1.234,56" → prefix €, thousands ".", decimal ","; zero-decimal currencies render 123456 as "¥1,235".
  const m = sample.match(/^(.*?)1(\D?)234(\D)56(.*)$/) || sample.match(/^(.*?)1(\D?)23[45]()(.*)$/);
  if (!m) return (Number(cents) / 100).toFixed(2);
  const [, prefix, thousands, decimal, suffix] = m;
  const [int, frac] = (Number(cents) / 100).toFixed(decimal ? 2 : 0).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  return `${prefix}${grouped}${decimal && frac ? decimal + frac : ''}${suffix}`;
}

/* ---------------------------------------------------------------------- */
/* Cart: every mutation re-renders cart sections in the same response.    */
/* ---------------------------------------------------------------------- */

function cartSections() {
  const ids = new Set(['cart-drawer']);
  document.querySelectorAll('[data-cart-root]').forEach((el) => ids.add(el.dataset.cartRoot));
  return [...ids];
}

function renderSections(sections = {}) {
  let count;
  for (const [id, html] of Object.entries(sections)) {
    if (!html) continue;
    const next = parse(html).querySelector(`[data-cart-root="${id}"]`);
    const current = document.querySelector(`[data-cart-root="${id}"]`);
    if (next && current) current.replaceWith(next);
    if (next?.dataset.count !== undefined) count = next.dataset.count;
  }
  if (count !== undefined) {
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.dataset.count = count;
    });
  }
}

async function cartPost(path, body) {
  const sections = cartSections();
  const isForm = body instanceof FormData;
  if (isForm) {
    body.append('sections', sections.join(','));
    body.append('sections_url', window.location.pathname);
  }
  const res = await fetch(`${path}.js`, {
    method: 'POST',
    headers: isForm ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: isForm ? body : JSON.stringify({ ...body, sections, sections_url: window.location.pathname }),
  });
  const data = await res.json();
  if (!res.ok || data.status) throw new Error(data.description || data.message || strings.error);
  renderSections(data.sections);
  return data;
}

export async function addToCart(body) {
  const data = await cartPost(routes.cartAdd, body);
  openDialog('cart-drawer');
  return data;
}

export const changeLine = (line, quantity) => cartPost(routes.cartChange, { line, quantity });
export const updateCart = (updates) => cartPost(routes.cartUpdate, { updates });

/* ---------------------------------------------------------------------- */
/* Dialogs                                                                 */
/* ---------------------------------------------------------------------- */

export function openDialog(id) {
  const d = document.getElementById(id);
  if (!d || d.open) return;
  d._opener = document.activeElement;
  d.showModal();
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-dialog]');
  if (opener && document.getElementById(opener.dataset.openDialog)) {
    e.preventDefault();
    return openDialog(opener.dataset.openDialog);
  }
  const closer = e.target.closest('[data-close-dialog]');
  if (closer) return closer.closest('dialog')?.close();
  if (e.target instanceof HTMLDialogElement && e.target.open) {
    const r = e.target.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) e.target.close();
  }
});
document.addEventListener('close', (e) => e.target._opener?.focus?.({ preventScroll: true }), true);

/* ---------------------------------------------------------------------- */
/* Components                                                              */
/* ---------------------------------------------------------------------- */

class CartItems extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', async (e) => {
      const removePack = e.target.closest('[data-remove-pack]');
      if (removePack) {
        // A pack is priced as a unit, so it's removed as a unit.
        const group = removePack.closest('[data-pack]');
        const updates = Object.fromEntries([...group.querySelectorAll('[data-key]')].map((l) => [l.dataset.key, 0]));
        group.classList.add('line--busy');
        return updateCart(updates).catch((err) => toast(err.message));
      }
      const line = e.target.closest('[data-line]');
      if (!line) return;
      const input = line.querySelector('[data-qty]');
      if (e.target.closest('[data-remove]')) return this.set(line, 0);
      const step = e.target.closest('[data-step]');
      if (step) this.set(line, Math.max(0, Number(input.value) + Number(step.dataset.step)));
    });
    this.addEventListener('change', (e) => {
      if (e.target.matches('[data-qty]')) this.set(e.target.closest('[data-line]'), Math.max(0, Number(e.target.value) || 0));
    });
  }

  async set(line, qty) {
    line.classList.add('line--busy');
    try {
      await changeLine(Number(line.dataset.line), qty);
    } catch (err) {
      line.classList.remove('line--busy');
      toast(err.message);
    }
  }
}
customElements.define('cart-items', CartItems);

class ProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = this.form.querySelector('[type=submit]');
      const error = this.querySelector('[data-error]');
      btn.setAttribute('aria-busy', 'true');
      if (error) error.hidden = true;
      const data = new FormData(this.form);
      if (!data.get('selling_plan')) data.delete('selling_plan');
      try {
        await addToCart(data);
      } catch (err) {
        if (error) {
          error.textContent = err.message;
          error.hidden = false;
        }
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
  }
}
customElements.define('product-form', ProductForm);

/**
 * Consent banner backed by Shopify's Customer Privacy API. Shopify decides
 * whether the visitor's region needs a banner; we only render the choice.
 */
class ConsentBanner extends HTMLElement {
  connectedCallback() {
    const init = () => {
      const privacy = window.Shopify?.customerPrivacy;
      if (!privacy) return;
      if (privacy.shouldShowBanner?.()) this.hidden = false;
      this.addEventListener('click', (e) => {
        const choice = e.target.closest('[data-consent]')?.dataset.consent;
        if (!choice) return;
        const all = choice === 'all';
        privacy.setTrackingConsent({ analytics: all, marketing: all, preferences: all, sale_of_data: all }, () => {
          this.hidden = true;
          publish('consent_set', { all });
        });
      });
    };
    if (window.Shopify?.loadFeatures) {
      window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], (err) => !err && init());
    } else {
      init();
    }
  }
}
customElements.define('consent-banner', ConsentBanner);

/* Country selector: switching market reloads with prices in the new currency. */
document.querySelectorAll('form[id$="-locale"] select').forEach((s) => s.addEventListener('change', () => s.form.submit()));

window.Racik = { config, routes, strings, publish, debounce, fetchSection, toast, formatMoney, addToCart, updateCart, openDialog };
