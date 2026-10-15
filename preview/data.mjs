/**
 * Mock storefront data for the Racik preview, built from scripts/catalog.json
 * and shaped like the Liquid objects the theme reads. Prices are converted
 * per request into the visitor's market currency, as Shopify Markets would.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Drop } from 'liquidjs';

const root = new URL('..', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('scripts/catalog.json', root), 'utf8'));
const img = new URL('design/out/', root);

export const COUNTRIES = [
  { iso_code: 'US', name: 'United States', currency: { iso_code: 'USD', symbol: '$' } },
  { iso_code: 'CA', name: 'Canada', currency: { iso_code: 'CAD', symbol: '$' } },
  { iso_code: 'GB', name: 'United Kingdom', currency: { iso_code: 'GBP', symbol: '£' } },
  { iso_code: 'DE', name: 'Germany', currency: { iso_code: 'EUR', symbol: '€' } },
  { iso_code: 'FR', name: 'France', currency: { iso_code: 'EUR', symbol: '€' } },
  { iso_code: 'NL', name: 'Netherlands', currency: { iso_code: 'EUR', symbol: '€' } },
  { iso_code: 'AU', name: 'Australia', currency: { iso_code: 'AUD', symbol: '$' } },
];
const RATES = { USD: 1, CAD: 1.37, GBP: 0.79, EUR: 0.92, AUD: 1.52 };

/** Market price: converted and rounded to whole units (a simplified version of Shopify's rounding rules). */
export const convert = (usdCents, currency) => (currency === 'USD' ? usdCents : Math.round((usdCents * RATES[currency]) / 100) * 100);

/** A value that prints as itself in Liquid but also exposes `.value` (metafields, metaobject fields). */
export class Field extends Drop {
  constructor(value) {
    super();
    this.value = value;
  }
  valueOf() {
    return typeof this.value === 'object' ? JSON.stringify(this.value) : this.value;
  }
  toString() {
    return String(this.valueOf());
  }
}

const image = (file, alt) => {
  const src = `/img/${file}`;
  const media = { id: file, src, width: 1400, height: 1400, aspect_ratio: 1, alt, media_type: 'image' };
  media.preview_image = media;
  return media;
};

const PLANS = catalog.subscription.plans.map((days, i) => ({
  id: 9001 + i,
  name: `Delivered every ${days} days`,
  options: [{ name: 'Delivery every', value: `${days} days` }],
  price_adjustments: [{ value_type: 'percentage', value: catalog.subscription.percentage }],
}));
export const planById = Object.fromEntries(PLANS.map((p) => [String(p.id), p]));

let nextId = 2000;
const raw = [];
for (const t of catalog.tonics) {
  raw.push({
    id: nextId++,
    handle: t.handle,
    title: t.title,
    tags: t.tags,
    description: t.description,
    media: ['pouch', 'glass', 'sticks'].filter((v) => existsSync(new URL(`${t.handle}-${v}.png`, img))).map((v) => image(`${t.handle}-${v}.png`, `${t.title} ${v}`)),
    variants: [
      { id: nextId++, title: '30 sticks', usd: t.price * 100, qty: 400 },
      { id: nextId++, title: '15 sticks', usd: t.price15 * 100, qty: 400 },
    ],
    subscribable: true,
    meta: { local_name: t.local, benefit: t.benefit, color: t.color, servings: 30, ritual: t.ritual, supplement_facts: t.facts },
    ingredientHandles: t.ingredients,
  });
}
const a = catalog.accessory;
raw.push({
  id: nextId++,
  handle: a.handle,
  title: a.title,
  tags: a.tags,
  description: a.description,
  media: [image(`${a.handle}.png`, a.title)],
  variants: [{ id: nextId++, title: 'Default Title', usd: a.price * 100, qty: 60 }],
  subscribable: false,
  meta: { local_name: a.local, benefit: a.benefit, color: a.color },
  ingredientHandles: [],
});

export const variantIndex = new Map();
for (const p of raw) for (const v of p.variants) variantIndex.set(String(v.id), { p, v });

/** Builds the Liquid-facing catalog for one currency. */
export function buildCatalog(currency) {
  const products = {};
  for (const p of raw) {
    const variants = p.variants.map((v) => {
      const price = convert(v.usd, currency);
      return {
        id: v.id,
        title: v.title,
        price,
        compare_at_price: null,
        available: v.qty > 0,
        inventory_quantity: v.qty,
        selling_plan_allocations: p.subscribable
          ? PLANS.map((plan) => ({ selling_plan: plan, price: Math.round(price * (1 - plan.price_adjustments[0].value / 100)), compare_at_price: price }))
          : [],
      };
    });
    products[p.handle] = {
      id: p.id,
      handle: p.handle,
      title: p.title,
      url: `/products/${p.handle}`,
      tags: p.tags,
      description: p.description,
      media: p.media,
      featured_media: p.media[0],
      featured_image: p.media[0],
      variants,
      selected_or_first_available_variant: variants.find((v) => v.available) ?? variants[0],
      price: variants[0].price,
      available: variants.some((v) => v.available),
      has_only_default_variant: variants.length === 1 && variants[0].title === 'Default Title',
      options: variants.length === 1 && variants[0].title === 'Default Title' ? ['Title'] : ['Size'],
      requires_selling_plan: false,
      selling_plan_groups: p.subscribable ? [{ name: catalog.subscription.name, options: [{ name: 'Delivery every' }], selling_plans: PLANS }] : [],
      metafields: { racik: Object.fromEntries(Object.entries(p.meta).filter(([, v]) => v != null).map(([k, v]) => [k, new Field(v)])) },
      _ingredients: p.ingredientHandles,
    };
  }

  const ingredients = {};
  for (const ing of catalog.ingredients) {
    const fields = Object.fromEntries(['name', 'local_name', 'latin_name', 'origin', 'harvest', 'color', 'story'].map((k) => [k, new Field(ing[k])]));
    const art = `ingredient-${ing.handle}.png`;
    ingredients[ing.handle] = {
      ...fields,
      illustration: new Field(existsSync(new URL(art, img)) ? image(art, ing.name) : null),
      handle: ing.handle,
      system: { url: `/pages/ingredient/${ing.handle}`, handle: ing.handle, type: 'ingredient' },
      found_in: new Field(Object.values(products).filter((p) => p._ingredients.includes(ing.handle))),
    };
  }
  for (const p of Object.values(products)) {
    if (p._ingredients.length) p.metafields.racik.ingredients = new Field(p._ingredients.map((h) => ingredients[h]));
  }

  const tonics = catalog.tonics.map((t) => products[t.handle]);
  const all = Object.values(products);
  const collections = {
    tonics: { handle: 'tonics', title: 'Tonics', url: '/collections/tonics', description: '<p>Six daily jamu tonics, each a 30-stick pouch.</p>', products: tonics, products_count: tonics.length },
    all: { handle: 'all', title: 'Shop all', url: '/collections/all', description: '', products: all, products_count: all.length },
  };
  for (const c of Object.values(collections)) c.all_tags = [...new Set(c.products.flatMap((p) => p.tags))].sort();

  return { products, ingredients, collections, metaobjects: { ingredient: { values: Object.values(ingredients) } } };
}

export const menus = {
  'main-menu': { links: [
    { title: 'Shop tonics', url: '/collections/tonics' },
    { title: 'Build a pack', url: '/pages/build-a-pack' },
    { title: 'Ingredients', url: '/#ingredients' },
  ] },
  footer: { links: [
    { title: 'Shipping & duties', url: '/pages/shipping' },
    { title: 'Manage subscription', url: '/account' },
    { title: 'Contact', url: '/pages/contact' },
    { title: 'Privacy', url: '/policies/privacy-policy' },
  ] },
};

export const pages = {
  quiz: { handle: 'quiz', title: 'Find your blend', url: '/pages/quiz', template_suffix: 'quiz' },
  'build-a-pack': { handle: 'build-a-pack', title: 'Build a pack', url: '/pages/build-a-pack', template_suffix: 'pack' },
};

export const shopImages = { 'hero-racik.png': { src: '/img/hero-racik.png', width: 1600, height: 1760, aspect_ratio: 1600 / 1760, alt: 'Racik pouches and a glass of Focus' } };
