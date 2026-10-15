import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartLinesDiscountsGenerateRun as run, parseConfig } from '../src/cart_lines_discounts_generate_run.js';

const line = (id, quantity, pack) => ({ id: `gid://shopify/CartLine/${id}`, quantity, pack: pack ? { value: pack } : null });
const input = (lines, { classes = ['PRODUCT'], config } = {}) => ({
  cart: { lines },
  discount: { discountClasses: classes, metafield: config ? { value: JSON.stringify(config) } : null },
});

test('no packs, no discount', () => {
  assert.deepEqual(run(input([line(1, 2), line(2, 1)])), { operations: [] });
});

test('pack below the first tier gets nothing', () => {
  assert.deepEqual(run(input([line(1, 1, 'P1'), line(2, 1, 'P1')])), { operations: [] });
});

test('pack of 3 across two lines gets 10% on both lines, singles untouched', () => {
  const out = run(input([line(1, 2, 'P1'), line(2, 1, 'P1'), line(3, 4)]));
  const [{ productDiscountsAdd: op }] = out.operations;
  assert.equal(op.selectionStrategy, 'ALL');
  assert.equal(op.candidates.length, 1);
  assert.deepEqual(op.candidates[0].targets.map((t) => t.cartLine.id), ['gid://shopify/CartLine/1', 'gid://shopify/CartLine/2']);
  assert.equal(op.candidates[0].value.percentage.value, 10);
  assert.equal(op.candidates[0].message, 'Pack of 3: 10% off');
});

test('two packs are priced independently', () => {
  const out = run(input([line(1, 3, 'A'), line(2, 5, 'B')]));
  const pcts = out.operations[0].productDiscountsAdd.candidates.map((c) => c.value.percentage.value);
  assert.deepEqual(pcts, [10, 15]);
});

test('tiers come from the metafield when present', () => {
  const config = { tiers: [{ min: 2, percentage: 5 }, { min: 6, percentage: 20 }] };
  const out = run(input([line(1, 6, 'P')], { config }));
  assert.equal(out.operations[0].productDiscountsAdd.candidates[0].value.percentage.value, 20);
});

test('bad configuration falls back to defaults', () => {
  assert.deepEqual(parseConfig({ value: 'not json' }), parseConfig(null));
  assert.deepEqual(parseConfig({ value: '{"tiers":[{"min":3,"percentage":250}]}' }), []);
});

test('does nothing when the discount is not a product discount', () => {
  assert.deepEqual(run(input([line(1, 5, 'P')], { classes: ['ORDER'] })), { operations: [] });
});
