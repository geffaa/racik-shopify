/**
 * RACIK — product.js
 * Purchase options are switched client-side using prices Liquid already
 * formatted (data-label), so there's no money formatting in JS. Changing
 * size re-renders the buy box through the Section Rendering API and the
 * chosen purchase option is carried across.
 */
const { fetchSection, toast, config } = window.Racik;

class ProductPage extends HTMLElement {
  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-thumb]');
      if (thumb) this.showSlide(thumb.dataset.thumb);
    });
    this.addEventListener('change', (e) => {
      if (e.target.matches('[data-variant-radio]')) this.changeVariant(e.target.value);
    });
  }

  showSlide(index) {
    this.querySelectorAll('[data-slide]').forEach((s) => (s.hidden = s.dataset.slide !== index));
    this.querySelectorAll('[data-thumb]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.thumb === index)));
  }

  async changeVariant(variantId) {
    const options = this.querySelector('purchase-options');
    const keep = options?.currentPlan ?? null;
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variantId);
    window.history.replaceState({}, '', url);
    try {
      const doc = await fetchSection(`${this.dataset.url}?variant=${variantId}`, this.sectionId);
      const next = doc.getElementById(`buybox-${this.sectionId}`);
      this.querySelector(`#buybox-${this.sectionId}`).replaceWith(next);
      this.querySelector('purchase-options')?.select(keep);
    } catch {
      toast(config.strings.error);
    }
  }
}
customElements.define('product-page', ProductPage);

class PurchaseOptions extends HTMLElement {
  connectedCallback() {
    this.box = this.closest('.buybox');
    this.planInput = this.box.querySelector('[data-plan-input]');
    this.atcPrice = this.box.querySelector('[data-atc-price]');
    this.frequency = this.querySelector('[data-frequency] select');
    this.addEventListener('change', () => this.sync());
    this.sync();
  }

  /** '' for one-time, otherwise the selling plan id. */
  get currentPlan() {
    const radio = this.querySelector('input[type=radio]:checked');
    if (!radio) return '';
    return radio.hasAttribute('data-subscription') ? this.frequency?.value || radio.value : '';
  }

  select(planId) {
    if (planId === null) return;
    const sub = this.querySelector('[data-subscription]');
    const once = this.querySelector('input[type=radio][value=""]');
    if (planId && sub) {
      sub.checked = true;
      if (this.frequency) this.frequency.value = planId;
    } else if (once) {
      once.checked = true;
    }
    this.sync();
  }

  sync() {
    const radio = this.querySelector('input[type=radio]:checked');
    const isSub = radio?.hasAttribute('data-subscription');
    const freqWrap = this.querySelector('[data-frequency]');
    if (freqWrap) freqWrap.hidden = !isSub;
    if (this.planInput) this.planInput.value = this.currentPlan;
    let label = radio?.dataset.label;
    if (isSub && this.frequency) label = this.frequency.selectedOptions[0]?.dataset.label ?? label;
    if (this.atcPrice && label) this.atcPrice.textContent = label;
  }
}
customElements.define('purchase-options', PurchaseOptions);
