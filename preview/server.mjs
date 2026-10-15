/**
 * Offline preview for the Racik theme: renders the real theme files with
 * liquidjs plus Shopify tags/filters, against mock data from the seed
 * catalog. Emulates Markets (country → currency), selling plans, metaobject
 * pages, the Ajax Cart API with the Section Rendering API, and prices pack
 * lines by running the actual pack-discount Function on the preview cart.
 *
 * It approximates Shopify; a development store is the source of truth.
 *   node preview/server.mjs  →  http://localhost:9494
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid, Tag, Hash, Drop } from 'liquidjs';
import { COUNTRIES, buildCatalog, menus, pages, planById, shopImages, variantIndex } from './data.mjs';
import { cartLinesDiscountsGenerateRun } from '../extensions/pack-discount/src/cart_lines_discounts_generate_run.js';

const root = new URL('..', import.meta.url);
const themeDir = new URL('theme/', root);
const PORT = Number(process.env.PORT || 9494);
const read = (p) => readFile(new URL(p, themeDir), 'utf8');
const locale = JSON.parse(readFileSync(new URL('locales/en.default.json', themeDir), 'utf8'));
const catalogTiers = JSON.parse(readFileSync(new URL('scripts/catalog.json', root), 'utf8')).tiers;

/* ---------------------------------------------------------------------- */
/* Money (per presentment currency)                                        */
/* ---------------------------------------------------------------------- */

const FORMATS = {
  USD: (a) => `$${a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  CAD: (a) => `$${a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  AUD: (a) => `$${a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  GBP: (a) => `£${a.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  EUR: (a) => `€${a.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
};
const money = (cents, cur) => FORMATS[cur](Number(cents || 0) / 100);

/* ---------------------------------------------------------------------- */
/* Settings                                                                */
/* ---------------------------------------------------------------------- */

class Color extends Drop {
  constructor(hex) {
    super();
    this.hex = hex;
    const n = parseInt(hex.slice(1), 16);
    Object.assign(this, { red: (n >> 16) & 255, green: (n >> 8) & 255, blue: n & 255 });
  }
  valueOf() {
    return this.hex;
  }
  toString() {
    return this.hex;
  }
}

function resolveSetting(type, value, data) {
  if (value == null || value === '') return null;
  switch (type) {
    case 'color': return new Color(value);
    case 'collection': return data.collections[value] ?? null;
    case 'product': return data.products[value] ?? null;
    case 'page': return pages[value] ?? null;
    case 'image_picker': return shopImages[String(value).replace('shopify://shop_images/', '')] ?? null;
    case 'link_list': return menus[value] ?? { links: [] };
    default: return value;
  }
}

function resolveSettings(defs = [], values = {}, data) {
  const out = {};
  for (const s of defs) if (s.id) out[s.id] = resolveSetting(s.type, values[s.id] ?? s.default, data);
  return out;
}

const schemaSettings = JSON.parse(readFileSync(new URL('config/settings_schema.json', themeDir), 'utf8')).flatMap((g) => g.settings ?? []);
const settingsValues = JSON.parse(readFileSync(new URL('config/settings_data.json', themeDir), 'utf8')).presets.Default;

/* ---------------------------------------------------------------------- */
/* Engine                                                                  */
/* ---------------------------------------------------------------------- */

const engine = new Liquid({
  root: fileURLToPath(themeDir),
  partials: fileURLToPath(new URL('snippets/', themeDir)),
  extname: '.liquid',
  strictFilters: true,
});

const kw = (args) => Object.fromEntries(args.filter(Array.isArray));
const cur = (ctx) => ctx.globals.__currency || 'USD';

class ImageUrl {
  constructor(img, width) {
    this.img = img;
    this.width = width;
  }
  toString() {
    return `${this.img.src}${this.width ? `?width=${this.width}` : ''}`;
  }
  toJSON() {
    return this.toString(); // Shopify's image_url returns a plain string
  }
}

const filters = {
  t(key, ...args) {
    const vars = kw(args);
    let v = key.split('.').reduce((o, k) => o?.[k], locale);
    if (v && typeof v === 'object') v = Number(vars.count) === 1 ? v.one : v.other;
    if (typeof v !== 'string') return `translation missing: ${key}`;
    return v.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(vars[k] ?? ''));
  },
  money(c) { return money(c, cur(this.context)); },
  money_with_currency(c) { return `${money(c, cur(this.context))} ${cur(this.context)}`; },
  money_without_trailing_zeros(c) { return money(c, cur(this.context)).replace(/[.,]00$/, ''); },
  money_without_currency(c) { return (Number(c) / 100).toFixed(2); },
  color_brightness(hex) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    return Math.round((((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000);
  },
  asset_url: (n) => `/assets/${n}`,
  stylesheet_tag: (u) => `<link href="${u}" rel="stylesheet">`,
  preload_tag: (u, ...a) => `<link href="${u}" rel="preload" as="${kw(a).as}" type="${kw(a).type}" crossorigin>`,
  image_url: (img, ...a) => (img ? new ImageUrl(img.preview_image ?? img, kw(a).width) : ''),
  image_tag(url, ...a) {
    if (!url) return '';
    const o = kw(a);
    const img = url.img ?? {};
    const attrs = { src: String(url), alt: o.alt ?? img.alt ?? '', width: img.width, height: img.height };
    if (o.widths) attrs.srcset = String(o.widths).split(',').map((w) => `${img.src}?width=${w.trim()} ${w.trim()}w`).join(', ');
    for (const [k, v] of Object.entries(o)) if (!['widths', 'preload', 'alt', 'height'].includes(k)) attrs[k] = v;
    return `<img ${Object.entries(attrs).filter(([, v]) => v != null).map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' ')}>`;
  },
  placeholder_svg_tag: () => '<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#ddd"/></svg>',
  structured_data: () => '{}',
  default_pagination: () => '',
  handleize: (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  handle: (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
};
for (const [n, f] of Object.entries(filters)) engine.registerFilter(n, f);

engine.registerTag('schema', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    while (remain.length && remain.shift().name !== 'endschema');
  }
  *render() {}
});

const FORM_ACTIONS = { product: '/cart/add', customer: '/contact', localization: '/localization' };
engine.registerTag('form', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    const m = token.args.match(/^\s*'([^']+)'\s*(?:,\s*([a-z_.]+)(?=\s*(?:,|$)))?\s*,?(.*)$/s);
    this.type = m[1];
    this.hash = new Hash(m[3] ?? '');
    this.tpls = [];
    const s = liquid.parser.parseStream(remain).on('tag:endform', () => s.stop()).on('template', (t) => this.tpls.push(t));
    s.start();
  }
  *render(ctx, emitter) {
    const attrs = yield this.hash.render(ctx);
    emitter.write(`<form method="post" action="${FORM_ACTIONS[this.type] ?? '/'}" ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}><input type="hidden" name="form_type" value="${this.type}">`);
    ctx.push({ form: { errors: null, 'posted_successfully?': false } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
    emitter.write('</form>');
  }
});

engine.registerTag('paginate', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    this.tpls = [];
    const s = liquid.parser.parseStream(remain).on('tag:endpaginate', () => s.stop()).on('template', (t) => this.tpls.push(t));
    s.start();
  }
  *render(ctx, emitter) {
    ctx.push({ paginate: { pages: 1, current_page: 1 } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
  }
});

async function renderSection(type, data = {}, id = type, globals, index = 1) {
  const src = await read(`sections/${type}.liquid`);
  const match = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  const schema = match ? JSON.parse(match[1]) : {};
  const blockDefs = Object.fromEntries((schema.blocks ?? []).map((b) => [b.type, b]));
  const blocks = (data.block_order ?? Object.keys(data.blocks ?? {})).map((bid) => ({
    id: bid,
    type: data.blocks[bid].type,
    settings: resolveSettings(blockDefs[data.blocks[bid].type]?.settings, data.blocks[bid].settings, globals.__data),
    shopify_attributes: '',
  }));
  const section = { id, index, settings: resolveSettings(schema.settings, data.settings, globals.__data), blocks };
  const html = await engine.parseAndRender(src, { section }, { globals });
  const tag = schema.tag ?? 'div';
  return `<${tag} id="shopify-section-${id}" class="shopify-section">${html}</${tag}>`;
}

for (const name of ['section', 'sections']) {
  engine.registerTag(name, class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      this.arg = token.args.trim().replace(/['"]/g, '');
    }
    *render(ctx, emitter) {
      const globals = ctx.getAll();
      if (name === 'section') return emitter.write(yield renderSection(this.arg, {}, this.arg, globals));
      const group = JSON.parse(yield read(`sections/${this.arg}.json`));
      for (const key of group.order) emitter.write(yield renderSection(group.sections[key].type, group.sections[key], `sections--1__${key}`, globals));
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Cart (priced by the real pack-discount Function)                        */
/* ---------------------------------------------------------------------- */

let lines = [];

function cartFor(data, currency) {
  const fnInput = {
    cart: { lines: lines.map((l, i) => ({ id: `L${i}`, quantity: l.quantity, pack: l.properties._pack ? { value: l.properties._pack } : null })) },
    discount: { discountClasses: ['PRODUCT'], metafield: { value: JSON.stringify({ tiers: catalogTiers }) } },
  };
  const pct = {};
  for (const op of cartLinesDiscountsGenerateRun(fnInput).operations) {
    for (const c of op.productDiscountsAdd.candidates) for (const t of c.targets) pct[t.cartLine.id] = c.value.percentage.value;
  }
  const items = lines.map((l, i) => {
    const { p } = variantIndex.get(String(l.id));
    const product = data.products[p.handle];
    const variant = product.variants.find((v) => String(v.id) === String(l.id));
    const plan = l.selling_plan ? planById[String(l.selling_plan)] : null;
    const unit = plan ? variant.selling_plan_allocations.find((a) => a.selling_plan.id === plan.id).price : variant.price;
    const original = unit * l.quantity;
    const final = Math.round(original * (1 - (pct[`L${i}`] || 0) / 100));
    return {
      key: `${l.id}:${i}`,
      url: product.url,
      image: product.featured_media,
      product,
      variant,
      quantity: l.quantity,
      properties: l.properties,
      selling_plan_allocation: plan ? { selling_plan: plan } : null,
      original_line_price: original,
      final_line_price: final,
    };
  });
  return {
    items,
    item_count: items.reduce((s, i) => s + i.quantity, 0),
    total_price: items.reduce((s, i) => s + i.final_line_price, 0),
    currency: { iso_code: currency },
  };
}

/* ---------------------------------------------------------------------- */
/* Requests                                                                */
/* ---------------------------------------------------------------------- */

function context(req, url, extra = {}) {
  const code = /country=([A-Z]{2})/.exec(req.headers.cookie || '')?.[1] || 'US';
  const country = COUNTRIES.find((c) => c.iso_code === code) ?? COUNTRIES[0];
  const currency = country.currency.iso_code;
  const data = buildCatalog(currency);
  const consented = /consent=1/.test(req.headers.cookie || '');
  const needsBanner = ['GB', 'DE', 'FR', 'NL'].includes(country.iso_code) && !consented;
  return {
    __data: data,
    __currency: currency,
    settings: resolveSettings(schemaSettings, settingsValues, data),
    shop: { name: 'Racik', description: 'Indonesian botanical tonics.', metaobjects: data.metaobjects },
    cart: cartFor(data, currency),
    localization: { country, available_countries: COUNTRIES },
    request: { locale: { iso_code: 'en' }, page_type: extra.template?.name ?? 'index' },
    routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update', all_products_collection_url: '/collections/all' },
    canonical_url: url.href,
    page_title: 'Racik',
    page_description: 'Indonesian botanical tonics: turmeric, red ginger and butterfly pea, grown in Java and Bali. Subscribe and save 15%.',
    content_for_header: `<script>
      window.Shopify = {
        analytics: { publish(n, d) { console.log('[analytics]', n, JSON.stringify(d)); } },
        loadFeatures(f, cb) { cb(); },
        customerPrivacy: {
          shouldShowBanner() { return ${needsBanner}; },
          setTrackingConsent(c, cb) { document.cookie = 'consent=1; path=/'; cb(); },
        },
      };
    </script>`,
    current_tags: extra.current_tags ?? null,
    ...extra,
  };
}

async function renderTemplate(name, req, url, extra = {}) {
  const template = JSON.parse(await read(`templates/${name}.json`));
  const globals = context(req, url, { template: { name: name.split('.')[0].split('/')[0] }, ...extra });
  const only = url.searchParams.get('section_id');
  let html = '';
  let i = 0;
  for (const key of template.order) {
    const id = `template--1__${key}`;
    if (only && only !== id) continue;
    html += await renderSection(template.sections[key].type, template.sections[key], id, globals, ++i);
  }
  if (only) return html;
  return engine.parseAndRender(await read('layout/theme.liquid'), {}, { globals: { ...globals, content_for_layout: html } });
}

async function sectionsFor(ids, req, url) {
  const out = {};
  for (const id of ids) {
    if (id === 'cart-drawer') out[id] = await renderSection('cart-drawer', {}, 'cart-drawer', context(req, url));
    else if (id.startsWith('template--1__')) out[id] = await renderTemplate('cart', req, new URL(`/cart?section_id=${id}`, url));
  }
  return out;
}

async function body(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) return JSON.parse(raw || '{}');
  if (type.includes('multipart/form-data')) {
    const out = {};
    for (const part of raw.split(/-{2,}\S+/)) {
      const m = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/);
      if (m) out[m[1]] = m[2];
    }
    return out;
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

const MIME = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const send = (status, content, type = 'text/html; charset=utf-8', headers = {}) => {
    res.writeHead(status, { 'Content-Type': type, ...headers });
    res.end(content);
  };
  const json = (status, data) => send(status, JSON.stringify(data), 'application/json');
  try {
    if (path === '/favicon.ico') return send(204, '');
    if (path.startsWith('/assets/') || path.startsWith('/img/')) {
      const file = path.startsWith('/assets/') ? new URL(`assets/${path.slice(8)}`, themeDir) : new URL(`design/out/${path.slice(5)}`, root);
      return existsSync(file) ? send(200, await readFile(file), MIME[extname(path)]) : send(404, 'not found');
    }

    if (req.method === 'POST' && path === '/localization') {
      const b = await body(req);
      return send(302, '', 'text/plain', { 'Set-Cookie': `country=${b.country_code}; Path=/`, Location: req.headers.referer || '/' });
    }
    if (req.method === 'POST' && path === '/cart/add.js') {
      const b = await body(req);
      const items = b.items ?? [{ id: b.id, quantity: Number(b.quantity || 1), selling_plan: b.selling_plan || null, properties: {} }];
      for (const it of items) {
        if (!variantIndex.has(String(it.id))) return json(404, { status: 404, message: 'Cart Error', description: 'Product not found' });
        const props = it.properties ?? {};
        const same = lines.find((l) => String(l.id) === String(it.id) && String(l.selling_plan ?? '') === String(it.selling_plan ?? '') && JSON.stringify(l.properties) === JSON.stringify(props));
        if (same) same.quantity += Number(it.quantity || 1);
        else lines.push({ id: Number(it.id), quantity: Number(it.quantity || 1), selling_plan: it.selling_plan ? Number(it.selling_plan) : null, properties: props });
      }
      const ids = Array.isArray(b.sections) ? b.sections : String(b.sections || '').split(',').filter(Boolean);
      return json(200, { items, sections: await sectionsFor(ids, req, url) });
    }
    if (req.method === 'POST' && path === '/cart/change.js') {
      const b = await body(req);
      const i = Number(b.line) - 1;
      if (Number(b.quantity) === 0) lines.splice(i, 1);
      else lines[i].quantity = Number(b.quantity);
      return json(200, { sections: await sectionsFor(b.sections ?? [], req, url) });
    }
    if (req.method === 'POST' && path === '/cart/update.js') {
      const b = await body(req);
      const keys = Object.entries(b.updates ?? {});
      const indexByKey = (key) => Number(key.split(':')[1]);
      const remove = new Set(keys.filter(([, q]) => Number(q) === 0).map(([k]) => indexByKey(k)));
      lines = lines.filter((_, i) => !remove.has(i));
      return json(200, { sections: await sectionsFor(b.sections ?? [], req, url) });
    }

    let m;
    if (path === '/') return send(200, await renderTemplate('index', req, url));
    if ((m = path.match(/^\/products\/([\w-]+)$/))) {
      const data = buildCatalog(context(req, url).__currency);
      const base = data.products[m[1]];
      if (!base) return send(404, await renderTemplate('404', req, url));
      const vid = url.searchParams.get('variant');
      const product = { ...base, selected_or_first_available_variant: base.variants.find((v) => String(v.id) === vid) ?? base.variants[0] };
      return send(200, await renderTemplate('product', req, url, { product, page_title: base.title }));
    }
    if ((m = path.match(/^\/collections\/([\w-]+)(?:\/([\w-]+))?$/))) {
      const data = buildCatalog(context(req, url).__currency);
      const c = data.collections[m[1]];
      if (!c) return send(404, await renderTemplate('404', req, url));
      const tag = m[2] ? c.all_tags.find((t) => filters.handleize(t) === m[2]) : null;
      const collection = tag ? { ...c, products: c.products.filter((p) => p.tags.includes(tag)) } : c;
      return send(200, await renderTemplate('collection', req, url, { collection, current_tags: tag ? [tag] : null, page_title: c.title }));
    }
    if ((m = path.match(/^\/pages\/ingredient\/([\w-]+)$/))) {
      const data = buildCatalog(context(req, url).__currency);
      const metaobject = data.ingredients[m[1]];
      if (!metaobject) return send(404, await renderTemplate('404', req, url));
      return send(200, await renderTemplate('metaobject/ingredient', req, url, { metaobject, page_title: String(metaobject.name) }));
    }
    if ((m = path.match(/^\/pages\/([\w-]+)$/)) && pages[m[1]]) {
      const page = pages[m[1]];
      return send(200, await renderTemplate(`page.${page.template_suffix}`, req, url, { page, page_title: page.title }));
    }
    if (path === '/cart') return send(200, await renderTemplate('cart', req, url));
    return send(404, await renderTemplate('404', req, url));
  } catch (e) {
    console.error(e);
    send(500, `<pre>${String(e.stack).replace(/</g, '&lt;')}</pre>`);
  }
}).listen(PORT, () => console.log(`Racik preview → http://localhost:${PORT}`));
