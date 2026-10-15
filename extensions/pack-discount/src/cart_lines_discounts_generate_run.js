/**
 * Pack tier discount.
 *
 * Lines added by the theme's pack builder share a `_pack` attribute. For each
 * pack, count its units and apply the highest tier it reaches to every line
 * in that pack. Configuration (metafield on the discount):
 *   { "tiers": [{ "min": 3, "percentage": 10 }, { "min": 5, "percentage": 15 }] }
 *
 * Enum values are written as strings ("PRODUCT", "ALL") so the logic can be
 * unit-tested without running `shopify app function typegen`.
 */

export const DEFAULT_TIERS = [
  { min: 3, percentage: 10 },
  { min: 5, percentage: 15 },
];

export function parseConfig(metafield) {
  try {
    const tiers = JSON.parse(metafield?.value ?? '{}').tiers;
    if (!Array.isArray(tiers) || !tiers.length) return DEFAULT_TIERS;
    return tiers
      .map((t) => ({ min: Number(t.min), percentage: Number(t.percentage) }))
      .filter((t) => t.min > 0 && t.percentage > 0 && t.percentage <= 100)
      .sort((a, b) => a.min - b.min);
  } catch {
    return DEFAULT_TIERS;
  }
}

export function tierFor(units, tiers) {
  let best = null;
  for (const t of tiers) if (units >= t.min) best = t;
  return best;
}

export function cartLinesDiscountsGenerateRun(input) {
  if (!input.discount.discountClasses.includes('PRODUCT')) return { operations: [] };

  const tiers = parseConfig(input.discount.metafield);
  const packs = new Map();
  for (const line of input.cart.lines) {
    const id = line.pack?.value;
    if (!id) continue;
    const pack = packs.get(id) ?? { units: 0, lineIds: [] };
    pack.units += line.quantity;
    pack.lineIds.push(line.id);
    packs.set(id, pack);
  }

  const candidates = [];
  for (const { units, lineIds } of packs.values()) {
    const tier = tierFor(units, tiers);
    if (!tier) continue;
    candidates.push({
      message: `Pack of ${units}: ${tier.percentage}% off`,
      targets: lineIds.map((id) => ({ cartLine: { id } })),
      value: { percentage: { value: tier.percentage } },
    });
  }

  if (!candidates.length) return { operations: [] };
  // ALL: every pack gets its own tier; packs don't compete with each other.
  return { operations: [{ productDiscountsAdd: { candidates, selectionStrategy: 'ALL' } }] };
}
