import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ingredientDefinition, ingredientFields, packDiscountInput, sellingPlanGroupInput, tonicInput } from '../seed.js';

const catalog = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));

test('every tonic references ingredients that exist', () => {
  const known = new Set(catalog.ingredients.map((i) => i.handle));
  for (const t of catalog.tonics) for (const h of t.ingredients) assert.ok(known.has(h), `${t.handle} → ${h}`);
});

test('every quiz answer tag is carried by at least one tonic', () => {
  const quiz = JSON.parse(readFileSync(new URL('../../theme/templates/page.quiz.json', import.meta.url), 'utf8'));
  const productTags = new Set(catalog.tonics.flatMap((t) => t.tags));
  for (const block of Object.values(quiz.sections.main.blocks)) {
    for (const line of block.settings.answers.split('\n')) {
      for (const tag of line.split('|')[1].split(',').map((s) => s.trim())) assert.ok(productTags.has(tag), `no tonic has ${tag}`);
    }
  }
});

test('tonicInput builds two sizes with SKUs and racik metafields', () => {
  const input = tonicInput(catalog.tonics[0], { locationId: 'gid://shopify/Location/1' });
  assert.deepEqual(input.variants.map((v) => [v.optionValues[0].name, v.price, v.sku]), [
    ['30 sticks', '34', 'RCK-GLOW-30'],
    ['15 sticks', '19', 'RCK-GLOW-15'],
  ]);
  const facts = JSON.parse(input.metafields.find((m) => m.key === 'supplement_facts').value);
  assert.equal(facts.servings, 30);
  assert.ok(facts.footnotes.some((f) => f.startsWith('†')));
});

test('selling plans: 30 and 60 days at 15% off, billing matches delivery', () => {
  const g = sellingPlanGroupInput(catalog.subscription);
  assert.equal(g.sellingPlansToCreate.length, 2);
  for (const p of g.sellingPlansToCreate) {
    assert.deepEqual(p.billingPolicy, p.deliveryPolicy);
    assert.equal(p.pricingPolicies[0].fixed.adjustmentValue.percentage, 15);
  }
});

test('ingredient definition is renderable at /pages/ingredient/<handle>', () => {
  const d = ingredientDefinition();
  assert.equal(d.capabilities.onlineStore.data.urlHandle, 'ingredient');
  assert.ok(d.fieldDefinitions.some((f) => f.key === 'found_in' && f.type === 'list.product_reference'));
});

test('ingredientFields only adds found_in when products are known', () => {
  const ing = catalog.ingredients[0];
  assert.equal(ingredientFields(ing).some((f) => f.key === 'found_in'), false);
  assert.equal(JSON.parse(ingredientFields(ing, ['gid://shopify/Product/1']).at(-1).value).length, 1);
});

test('discount carries the same tiers the theme displays', () => {
  const settings = JSON.parse(readFileSync(new URL('../../theme/config/settings_data.json', import.meta.url), 'utf8'));
  const themeTiers = settings.presets.Default.pack_tiers.split(',').map((p) => p.split(':').map((n) => Number(n.trim())));
  const fnTiers = JSON.parse(packDiscountInput(catalog.tiers).metafields[0].value).tiers.map((t) => [t.min, t.percentage]);
  assert.deepEqual(fnTiers, themeTiers);
});
