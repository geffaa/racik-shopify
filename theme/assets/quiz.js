/**
 * RACIK — quiz.js
 * Steps through the question fieldsets, scores products by tag matches and
 * hands the top three to the pack builder (?add=handle,handle,handle).
 * The last result is remembered per browser so returning visitors can
 * pick up where they left off.
 */
const { publish } = window.Racik;
const STORE_KEY = 'racik:quiz';
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Pure: score products against chosen tags; returns the top `n` with matched tags. */
export function recommend(products, chosenTags, n = 3) {
  const chosen = new Set(chosenTags);
  return products
    .map((p, order) => {
      const why = p.tags.filter((t) => chosen.has(t));
      return { ...p, why, score: why.length + (p.available ? 0 : -100), order };
    })
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, n);
}

class RitualQuiz extends HTMLElement {
  connectedCallback() {
    this.products = JSON.parse(this.querySelector('[data-products]').textContent);
    this.questions = [...this.querySelectorAll('[data-screen="q"]')];
    this.progress = this.querySelector('[data-progress]');
    this.label = this.querySelector('[data-step-label]');
    this.step = -1;

    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-start]')) this.go(0);
      if (e.target.closest('[data-next]')) this.go(this.step + 1);
      if (e.target.closest('[data-back]')) this.go(this.step - 1);
      if (e.target.closest('[data-restart]')) this.restart();
    });
    this.addEventListener('change', (e) => {
      const q = e.target.closest('[data-screen="q"]');
      if (!q) return;
      const next = q.querySelector('[data-next]');
      next.disabled = !q.querySelector('input:checked');
      // Single-choice questions advance by themselves after a beat.
      if (q.dataset.multi !== 'true' && e.target.checked) setTimeout(() => this.go(this.step + 1), 280);
    });

    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved?.picks?.length) this.showResult(saved.picks, saved.labels, false);
    } catch {
      /* storage unavailable: start fresh */
    }
  }

  screens() {
    return [this.querySelector('[data-screen="intro"]'), ...this.questions, this.querySelector('[data-screen="result"]')];
  }

  show(el) {
    this.screens().forEach((s) => (s.hidden = s !== el));
    el.querySelector('input, button, a')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  go(index) {
    if (index < 0) {
      this.step = -1;
      this.setProgress(0, '');
      return this.show(this.screens()[0]);
    }
    if (index >= this.questions.length) return this.finish();
    this.step = index;
    this.setProgress(index / this.questions.length, `${index + 1} / ${this.questions.length}`);
    this.show(this.questions[index]);
  }

  setProgress(fraction, text) {
    this.progress.style.width = `${Math.round(fraction * 100)}%`;
    this.label.textContent = text;
  }

  finish() {
    const checked = [...this.querySelectorAll('[data-screen="q"] input:checked')];
    const tags = checked.flatMap((i) => i.value.split(',').map((t) => t.trim()).filter(Boolean));
    const labels = checked.map((i) => i.dataset.label);
    const picks = recommend(this.products, tags);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ picks, labels }));
    } catch {
      /* ignore */
    }
    publish('quiz_completed', { answers: labels, picks: picks.map((p) => p.handle) });
    this.showResult(picks, labels, true);
  }

  showResult(picks, labels, animate) {
    const tagLabel = (t) => t.split(':')[1]?.replace(/-/g, ' ');
    const list = this.querySelector('[data-picks]');
    list.innerHTML = picks
      .map(
        (p, i) => `
        <li class="pick" style="--tone:${esc(p.tone)};--on-tone:${esc(p.onTone)};--i:${animate ? i : 0}">
          <img src="${esc(p.image)}" alt="" loading="lazy">
          <div class="pick__body">
            ${p.local ? `<span class="small muted">${esc(p.local)}</span>` : ''}
            <a class="pick__title" href="${esc(p.url)}">${esc(p.title)}</a>
            <span class="small muted">${esc(p.benefit ?? '')}</span>
            <span class="small" style="font-weight:600">${esc(p.price)}</span>
            ${p.why?.length ? `<div class="pick__why">${p.why.map((w) => `<span>${esc(tagLabel(w))}</span>`).join('')}</div>` : ''}
          </div>
        </li>`
      )
      .join('');
    this.querySelector('[data-summary]').textContent = labels?.length ? `Based on: ${labels.join(' · ')}` : '';
    const build = this.querySelector('[data-build]');
    build.href = `${this.dataset.packUrl}?add=${picks.map((p) => p.handle).join(',')}`;
    this.setProgress(1, '');
    this.show(this.querySelector('[data-screen="result"]'));
  }

  restart() {
    this.querySelectorAll('input').forEach((i) => (i.checked = false));
    this.querySelectorAll('[data-next]').forEach((b) => (b.disabled = true));
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    this.go(0);
  }
}
customElements.define('ritual-quiz', RitualQuiz);
