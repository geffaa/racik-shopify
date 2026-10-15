/**
 * RACIK — pack.js
 * Client state for the pack builder. Prices are integer minor units from
 * Liquid (already in the customer's presentment currency); the totals are a
 * preview of the tier discount the pack-discount Function applies at checkout.
 */
const { addToCart, formatMoney, publish, toast } = window.Racik;

/** Pure: "3:10, 5:15" → [{ min: 3, pct: 10 }, { min: 5, pct: 15 }] (ascending). */
export function parseTiers(text) {
  return String(text)
    .split(',')
    .map((pair) => pair.split(':').map((n) => Number(n.trim())))
    .filter(([min, pct]) => min > 0 && pct > 0)
    .map(([min, pct]) => ({ min, pct }))
    .sort((a, b) => a.min - b.min);
}

/** Pure: the tier reached and the next one to aim for. */
export function tierFor(count, tiers) {
  const reached = [...tiers].reverse().find((t) => count >= t.min) ?? null;
  const next = tiers.find((t) => count < t.min) ?? null;
  return { reached, next };
}

class PackBuilder extends HTMLElement {
  connectedCallback() {
    this.products = JSON.parse(this.querySelector('[data-products]').textContent);
    this.tiers = parseTiers(this.dataset.tiers);
    this.max = Number(this.dataset.max) || 8;
    this.counts = {};
    this.order = []; // handles in the order they were added, for the slot colours

    this.addEventListener('click', (e) => {
      const card = e.target.closest('[data-handle]');
      if (card && e.target.closest('[data-inc]')) this.change(card.dataset.handle, 1);
      if (card && e.target.closest('[data-dec]')) this.change(card.dataset.handle, -1);
      if (e.target.closest('[data-add]')) this.submit();
      const toggle = e.target.closest('[data-tray-toggle]');
      if (toggle) {
        const tray = toggle.closest('.tray');
        const open = !tray.hasAttribute('data-expanded');
        tray.toggleAttribute('data-expanded', open);
        toggle.setAttribute('aria-expanded', String(open));
      }
    });
    this.addEventListener('change', () => this.render());

    // Prefill from the quiz: ?add=handle,handle
    const add = new URLSearchParams(window.location.search).get('add');
    add?.split(',').forEach((h) => this.products[h] && this.change(h, 1, { silent: true }));
    this.render();
  }

  get total() {
    return Object.values(this.counts).reduce((a, b) => a + b, 0);
  }

  get planId() {
    const sub = this.querySelector('input[name="pack-purchase"]:checked')?.value !== 'once';
    return sub ? this.querySelector('[data-plan]')?.value || null : null;
  }

  change(handle, delta, { silent = false } = {}) {
    const current = this.counts[handle] || 0;
    if (delta > 0 && this.total >= this.max) return toast(`Packs hold up to ${this.max} pouches.`);
    const next = Math.max(0, current + delta);
    this.counts[handle] = next;
    if (delta > 0) this.order.push(handle);
    else {
      const i = this.order.lastIndexOf(handle);
      if (i > -1) this.order.splice(i, 1);
    }
    const card = this.querySelector(`[data-handle="${CSS.escape(handle)}"]`);
    if (card && !silent) {
      card.removeAttribute('data-bump');
      void card.offsetWidth;
      card.setAttribute('data-bump', '');
    }
    this.render();
  }

  unitPrice(p) {
    const plan = this.planId;
    return plan && p.plans[plan] != null ? p.plans[plan] : p.price;
  }

  render() {
    const count = this.total;
    const { reached, next } = tierFor(count, this.tiers);

    this.querySelectorAll('[data-handle]').forEach((card) => {
      const n = this.counts[card.dataset.handle] || 0;
      card.querySelector('[data-count]').textContent = n;
      card.querySelector('[data-dec]').disabled = n === 0;
      card.toggleAttribute('data-active', n > 0);
    });

    // Slots: filled ones in add order, then empty ones up to the next tier goal.
    const goal = Math.min(this.max, Math.max(count, next?.min ?? count, this.tiers[0]?.min ?? 3));
    const slots = this.querySelector('[data-slots]');
    slots.innerHTML = Array.from({ length: goal }, (_, i) => {
      const h = this.order[i];
      return h ? `<li data-filled style="--c:${this.products[h].tone}"></li>` : `<li${i === goal - 1 && next ? ' data-goal' : ''}></li>`;
    }).join('');

    this.querySelector('[data-count-label]').textContent = `${count}/${this.max}`;
    const msg = this.querySelector('[data-tier-msg]');
    if (!reached && next) msg.innerHTML = `Add <strong>${next.min - count}</strong> more to save ${next.pct}%`;
    else if (reached && next) msg.innerHTML = `<span class="tier-ok">${reached.pct}% off unlocked.</span> Add ${next.min - count} more for ${next.pct}%.`;
    else if (reached) msg.innerHTML = `<span class="tier-ok">${reached.pct}% off, the best pack price.</span>`;

    const subtotal = Object.entries(this.counts).reduce((sum, [h, n]) => sum + n * this.unitPrice(this.products[h]), 0);
    const discount = reached ? Math.round((subtotal * reached.pct) / 100) : 0;
    this.querySelector('[data-subtotal]').textContent = formatMoney(subtotal);
    this.querySelector('[data-discount-row]').hidden = !discount;
    this.querySelector('[data-discount-label]').textContent = reached ? `Pack discount (${reached.pct}%)` : '';
    this.querySelector('[data-discount]').textContent = `−${formatMoney(discount)}`;
    this.querySelector('[data-total]').textContent = formatMoney(subtotal - discount);

    const add = this.querySelector('[data-add]');
    add.disabled = !reached;
    add.textContent = reached ? `Add ${count} pouches · ${formatMoney(subtotal - discount)}` : `Pick at least ${this.tiers[0]?.min ?? 3}`;
  }

  async submit() {
    const packId = `P${Date.now().toString(36)}`;
    const plan = this.planId;
    const label = `Pack of ${this.total}`;
    const items = Object.entries(this.counts)
      .filter(([, n]) => n > 0)
      .map(([h, n]) => ({
        id: this.products[h].variantId,
        quantity: n,
        ...(plan ? { selling_plan: Number(plan) } : {}),
        properties: { _pack: packId, Pack: label },
      }));
    const btn = this.querySelector('[data-add]');
    btn.setAttribute('aria-busy', 'true');
    try {
      await addToCart({ items });
      publish('pack_added', { size: this.total, subscription: Boolean(plan), handles: Object.keys(this.counts).filter((h) => this.counts[h]) });
    } catch (e) {
      toast(e.message);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  }
}
customElements.define('pack-builder', PackBuilder);
