/**
 * Seeds a development store for Racik through the Admin GraphQL API:
 *   1. product metafield definitions + the `ingredient` metaobject definition
 *      (with an Online Store URL, so each ingredient gets its own page)
 *   2. ingredient entries
 *   3. products (productSet, idempotent by handle) with images and metafields
 *   4. the "Subscribe & save" selling plan group, attached to the tonics
 *   5. the `tonics` collection, Quiz and Build-a-pack pages
 *   6. cross references (product → ingredients, ingredient → products)
 *   7. the automatic app discount backed by the pack-discount Function
 *
 * Usage: node scripts/seed.js   (needs SHOPIFY_SHOP + token; see .env.example)
 */
import { readFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAdminClient } from './lib/admin.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const exists = (p) => stat(p).then(() => true, () => false);

/* ---------------------------------------------------------------------- */
/* Pure builders (unit-tested)                                             */
/* ---------------------------------------------------------------------- */

export const PRODUCT_METAFIELDS = [
  ['local_name', 'Local name', 'single_line_text_field'],
  ['benefit', 'Benefit', 'single_line_text_field'],
  ['color', 'Colour', 'color'],
  ['servings', 'Servings', 'number_integer'],
  ['ritual', 'How to take it', 'multi_line_text_field'],
  ['supplement_facts', 'Supplement facts', 'json'],
];

export function ingredientDefinition() {
  return {
    type: 'ingredient',
    name: 'Ingredient',
    displayNameKey: 'name',
    access: { storefront: 'PUBLIC_READ' },
    capabilities: {
      publishable: { enabled: true },
      renderable: { enabled: true, data: { metaTitleKey: 'name', metaDescriptionKey: 'story' } },
      onlineStore: { enabled: true, data: { urlHandle: 'ingredient' } },
    },
    fieldDefinitions: [
      { key: 'name', name: 'Name', type: 'single_line_text_field', required: true },
      { key: 'local_name', name: 'Local name', type: 'single_line_text_field' },
      { key: 'latin_name', name: 'Latin name', type: 'single_line_text_field' },
      { key: 'origin', name: 'Grown in', type: 'single_line_text_field' },
      { key: 'harvest', name: 'Harvest', type: 'single_line_text_field' },
      { key: 'color', name: 'Colour', type: 'color' },
      { key: 'story', name: 'Story', type: 'multi_line_text_field' },
      { key: 'illustration', name: 'Illustration', type: 'file_reference' },
      { key: 'found_in', name: 'Found in', type: 'list.product_reference' },
    ],
  };
}

export function ingredientFields(ing, productIds = [], illustrationId = null) {
  const fields = ['name', 'local_name', 'latin_name', 'origin', 'harvest', 'color', 'story'].map((key) => ({ key, value: ing[key] }));
  if (illustrationId) fields.push({ key: 'illustration', value: illustrationId });
  if (productIds.length) fields.push({ key: 'found_in', value: JSON.stringify(productIds) });
  return fields;
}

export function tonicInput(t, { locationId, files = [] }) {
  const sizes = [
    { name: '30 sticks', price: t.price, servings: 30 },
    { name: '15 sticks', price: t.price15, servings: 15 },
  ];
  return {
    title: t.title,
    handle: t.handle,
    descriptionHtml: t.description,
    vendor: 'Racik',
    productType: 'Herbal tonic',
    status: 'ACTIVE',
    tags: t.tags,
    seo: { title: `${t.title} (${t.local}) | Racik`, description: t.benefit },
    productOptions: [{ name: 'Size', position: 1, values: sizes.map((s) => ({ name: s.name })) }],
    variants: sizes.map((s, i) => ({
      optionValues: [{ optionName: 'Size', name: s.name }],
      price: String(s.price),
      sku: `RCK-${t.handle.toUpperCase()}-${s.servings}`,
      inventoryPolicy: 'DENY',
      inventoryItem: { tracked: true, measurement: { weight: { value: i === 0 ? 0.14 : 0.08, unit: 'KILOGRAMS' } } },
      inventoryQuantities: [{ locationId, name: 'available', quantity: 400 }],
    })),
    metafields: [
      ['local_name', 'single_line_text_field', t.local],
      ['benefit', 'single_line_text_field', t.benefit],
      ['color', 'color', t.color],
      ['servings', 'number_integer', '30'],
      ['ritual', 'multi_line_text_field', t.ritual],
      ['supplement_facts', 'json', JSON.stringify(t.facts)],
    ].map(([key, type, value]) => ({ namespace: 'racik', key, type, value })),
    files: files.map((f) => ({ originalSource: f.url, alt: f.alt, contentType: 'IMAGE' })),
  };
}

export function sellingPlanGroupInput({ name, plans, percentage }) {
  return {
    name,
    merchantCode: 'subscribe-save',
    options: ['Delivery every'],
    position: 1,
    sellingPlansToCreate: plans.map((days, i) => ({
      name: `Delivered every ${days} days`,
      options: [`${days} days`],
      position: i + 1,
      category: 'SUBSCRIPTION',
      billingPolicy: { recurring: { interval: 'DAY', intervalCount: days } },
      deliveryPolicy: { recurring: { interval: 'DAY', intervalCount: days } },
      pricingPolicies: [{ fixed: { adjustmentType: 'PERCENTAGE', adjustmentValue: { percentage } } }],
    })),
  };
}

export function packDiscountInput(tiers, startsAt = new Date().toISOString()) {
  return {
    title: 'Pack tiers',
    functionHandle: 'pack-discount',
    discountClasses: ['PRODUCT'],
    startsAt,
    combinesWith: { orderDiscounts: true, productDiscounts: false, shippingDiscounts: true },
    metafields: [{ namespace: '$app', key: 'function-configuration', type: 'json', value: JSON.stringify({ tiers }) }],
  };
}

/* ---------------------------------------------------------------------- */
/* GraphQL                                                                 */
/* ---------------------------------------------------------------------- */

const G = {
  context: `{ locations(first: 1) { nodes { id } } publications(first: 20) { nodes { id name } } }`,
  mfDef: `mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { userErrors { message code } } }`,
  moDef: `mutation($d: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition: $d) { metaobjectDefinition { id } userErrors { message code } } }`,
  moDefByType: `query { metaobjectDefinitionByType(type: "ingredient") { id } }`,
  moUpsert: `mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) { metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { id } userErrors { field message } } }`,
  staged: `mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
  productSet: `mutation($input: ProductSetInput!, $identifier: ProductSetIdentifiers) { productSet(input: $input, identifier: $identifier, synchronous: true) { product { id } userErrors { field message } } }`,
  publish: `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`,
  spgCreate: `mutation($input: SellingPlanGroupInput!, $resources: SellingPlanGroupResourceInput) { sellingPlanGroupCreate(input: $input, resources: $resources) { sellingPlanGroup { id } userErrors { field message } } }`,
  collection: `query($h: String!) { collectionByIdentifier(identifier: { handle: $h }) { id } }`,
  collectionCreate: `mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { message } } }`,
  pageCreate: `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id } userErrors { field message code } } }`,
  metafieldsSet: `mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message } } }`,
  fileCreate: `mutation($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id } userErrors { message } } }`,
  discount: `mutation($d: DiscountAutomaticAppInput!) { discountAutomaticAppCreate(automaticAppDiscount: $d) { automaticAppDiscount { discountId } userErrors { field message } } }`,
};

async function upload(admin, path) {
  const bytes = await readFile(path);
  const filename = basename(path);
  const data = await admin.graphql(G.staged, { input: [{ filename, mimeType: 'image/png', resource: 'IMAGE', httpMethod: 'POST', fileSize: String(bytes.length) }] });
  const target = admin.assertNoUserErrors(data.stagedUploadsCreate, 'stagedUploadsCreate').stagedTargets[0];
  const form = new FormData();
  target.parameters.forEach(({ name, value }) => form.append(name, value));
  form.append('file', new Blob([bytes], { type: 'image/png' }), filename);
  const res = await fetch(target.url, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`upload ${filename}: ${res.status}`);
  return target.resourceUrl;
}

export async function seed({ admin, imagesDir = join(root, 'design/out'), log = console.log }) {
  const catalog = JSON.parse(await readFile(join(root, 'scripts/catalog.json'), 'utf8'));
  const ctx = await admin.graphql(G.context);
  const locationId = ctx.locations.nodes[0].id;
  const store = ctx.publications.nodes.find((p) => p.name === 'Online Store');
  const publish = async (id) => store && admin.graphql(G.publish, { id, input: [{ publicationId: store.id }] });

  // 1. Definitions
  for (const [key, name, type] of PRODUCT_METAFIELDS) {
    const r = await admin.graphql(G.mfDef, { d: { namespace: 'racik', key, name, type, ownerType: 'PRODUCT', access: { storefront: 'PUBLIC_READ' } } });
    const errs = r.metafieldDefinitionCreate.userErrors.filter((e) => e.code !== 'TAKEN');
    if (errs.length) throw new Error(`metafield ${key}: ${errs[0].message}`);
  }
  let defId = (await admin.graphql(G.moDefByType)).metaobjectDefinitionByType?.id;
  if (!defId) {
    const r = await admin.graphql(G.moDef, { d: ingredientDefinition() });
    defId = admin.assertNoUserErrors(r.metaobjectDefinitionCreate, 'metaobjectDefinitionCreate').metaobjectDefinition.id;
  }
  const r = await admin.graphql(G.mfDef, {
    d: { namespace: 'racik', key: 'ingredients', name: 'Ingredients', type: 'list.metaobject_reference', ownerType: 'PRODUCT', validations: [{ name: 'metaobject_definition_id', value: defId }] },
  });
  if (r.metafieldDefinitionCreate.userErrors.some((e) => e.code !== 'TAKEN')) throw new Error('ingredients metafield definition');
  log('✓ definitions');

  // 2. Ingredients (found_in is linked after products exist)
  const ingIds = {};
  const illustrations = {};
  for (const ing of catalog.ingredients) {
    const art = join(imagesDir, `ingredient-${ing.handle}.png`);
    if (await exists(art)) {
      const f = await admin.graphql(G.fileCreate, { files: [{ originalSource: await upload(admin, art), contentType: 'IMAGE', alt: ing.name }] });
      illustrations[ing.handle] = admin.assertNoUserErrors(f.fileCreate, 'fileCreate').files[0].id;
    }
    const res = await admin.graphql(G.moUpsert, {
      h: { type: 'ingredient', handle: ing.handle },
      m: { fields: ingredientFields(ing, [], illustrations[ing.handle]), capabilities: { publishable: { status: 'ACTIVE' } } },
    });
    ingIds[ing.handle] = admin.assertNoUserErrors(res.metaobjectUpsert, `ingredient ${ing.handle}`).metaobject.id;
  }
  log(`✓ ${catalog.ingredients.length} ingredients`);

  // 3. Products
  const productIds = {};
  for (const t of catalog.tonics) {
    const files = [];
    for (const view of ['pouch', 'glass', 'sticks']) {
      const p = join(imagesDir, `${t.handle}-${view}.png`);
      if (await exists(p)) files.push({ url: await upload(admin, p), alt: `${t.title} ${view}` });
    }
    const res = await admin.graphql(G.productSet, { input: tonicInput(t, { locationId, files }), identifier: { handle: t.handle } });
    productIds[t.handle] = admin.assertNoUserErrors(res.productSet, `product ${t.handle}`).product.id;
    await publish(productIds[t.handle]);
    log(`✓ ${t.title}`);
  }
  const a = catalog.accessory;
  const glassImg = join(imagesDir, `${a.handle}.png`);
  const accessoryRes = await admin.graphql(G.productSet, {
    identifier: { handle: a.handle },
    input: {
      title: a.title, handle: a.handle, descriptionHtml: a.description, vendor: 'Racik', productType: 'Accessory', status: 'ACTIVE', tags: a.tags,
      productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
      variants: [{ optionValues: [{ optionName: 'Title', name: 'Default Title' }], price: String(a.price), inventoryItem: { tracked: true }, inventoryQuantities: [{ locationId, name: 'available', quantity: 60 }] }],
      metafields: [{ namespace: 'racik', key: 'color', type: 'color', value: a.color }, { namespace: 'racik', key: 'benefit', type: 'single_line_text_field', value: a.benefit }],
      files: (await exists(glassImg)) ? [{ originalSource: await upload(admin, glassImg), alt: a.title, contentType: 'IMAGE' }] : [],
    },
  });
  await publish(admin.assertNoUserErrors(accessoryRes.productSet, 'accessory').product.id);

  // 4. Subscriptions
  const tonicIds = catalog.tonics.map((t) => productIds[t.handle]);
  const spg = await admin.graphql(G.spgCreate, { input: sellingPlanGroupInput(catalog.subscription), resources: { productIds: tonicIds } });
  admin.assertNoUserErrors(spg.sellingPlanGroupCreate, 'sellingPlanGroupCreate');
  log('✓ selling plan group');

  // 5. Collection and pages
  if (!(await admin.graphql(G.collection, { h: 'tonics' })).collectionByIdentifier) {
    const c = await admin.graphql(G.collectionCreate, { input: { title: 'Tonics', handle: 'tonics', products: tonicIds, sortOrder: 'MANUAL' } });
    await publish(admin.assertNoUserErrors(c.collectionCreate, 'collection').collection.id);
  }
  for (const page of [
    { title: 'Find your blend', handle: 'quiz', templateSuffix: 'quiz', isPublished: true },
    { title: 'Build a pack', handle: 'build-a-pack', templateSuffix: 'pack', isPublished: true },
  ]) {
    const p = await admin.graphql(G.pageCreate, { page });
    const errs = p.pageCreate.userErrors.filter((e) => e.code !== 'TAKEN');
    if (errs.length) throw new Error(`page ${page.handle}: ${errs[0].message}`);
  }
  log('✓ collection and pages');

  // 6. Cross references
  const mf = catalog.tonics.map((t) => ({
    ownerId: productIds[t.handle], namespace: 'racik', key: 'ingredients', type: 'list.metaobject_reference',
    value: JSON.stringify(t.ingredients.map((h) => ingIds[h])),
  }));
  admin.assertNoUserErrors((await admin.graphql(G.metafieldsSet, { m: mf })).metafieldsSet, 'metafieldsSet');
  for (const ing of catalog.ingredients) {
    const users = catalog.tonics.filter((t) => t.ingredients.includes(ing.handle)).map((t) => productIds[t.handle]);
    await admin.graphql(G.moUpsert, { h: { type: 'ingredient', handle: ing.handle }, m: { fields: ingredientFields(ing, users, illustrations[ing.handle]) } });
  }
  log('✓ ingredient ↔ product links');

  // Hero image for templates/index.json (shopify://shop_images/hero-racik.png)
  const hero = join(imagesDir, 'hero-racik.png');
  if (await exists(hero)) await admin.graphql(G.fileCreate, { files: [{ originalSource: await upload(admin, hero), filename: 'hero-racik.png', contentType: 'IMAGE' }] });

  // 7. Discount (requires the app with the function to be deployed: `shopify app deploy`)
  const d = await admin.graphql(G.discount, { d: packDiscountInput(catalog.tiers) });
  admin.assertNoUserErrors(d.discountAutomaticAppCreate, 'discountAutomaticAppCreate');
  log('✓ pack discount');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.loadEnvFile(join(root, '.env'));
  } catch {
    /* env from shell */
  }
  const e = process.env;
  const admin = createAdminClient({ shop: e.SHOPIFY_SHOP, apiVersion: e.SHOPIFY_API_VERSION || '2026-07', token: e.SHOPIFY_ADMIN_TOKEN, clientId: e.SHOPIFY_CLIENT_ID, clientSecret: e.SHOPIFY_CLIENT_SECRET, log: (m) => console.error(`[admin] ${m}`) });
  seed({ admin }).catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
