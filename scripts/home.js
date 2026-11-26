(() => {
  const form = document.querySelector('#assessment-form');
  const property = form.elements.property;
  const goal = form.elements.goal;
  const result = document.querySelector('#plan-result');
  const summary = result.querySelector('#plan-summary');
  const essentials = [...document.querySelectorAll('input[name=essential]')];
  const essentialStatus = document.querySelector('#essential-status');
  const meterCells = [...document.querySelectorAll('[data-meter] span')];
  const list = new Intl.ListFormat('en-ZA', { style: 'long', type: 'conjunction' });

  function selectedEssentials() {
    return essentials.filter((input) => input.checked).map((input) => input.value);
  }

  function updateEssentials() {
    const selected = selectedEssentials();
    meterCells.forEach((cell, index) => cell.toggleAttribute('data-on', index < selected.length));
    essentialStatus.textContent = selected.length
      ? 'Selected for your plan: ' + list.format(selected) + '.'
      : 'No essentials selected.';
    result.hidden = true;
  }

  for (const input of essentials) input.addEventListener('change', updateEssentials);
  form.addEventListener('change', () => { result.hidden = true; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = selectedEssentials();
    const mainChoice = property.selectedOptions[0].text + ' · ' + goal.selectedOptions[0].text + '.';
    summary.textContent = selected.length ? mainChoice + ' Essentials: ' + list.format(selected) + '.' : mainChoice;
    result.hidden = false;
    result.focus();
  });

  result.querySelector('#edit-plan').addEventListener('click', () => {
    result.hidden = true;
    property.focus();
  });

  document.addEventListener('click', (event) => {
    const choice = event.target.closest('a[data-property], a[data-goal]');
    if (!choice || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const chosen = [];
    if (choice.dataset.property) { property.value = choice.dataset.property; chosen.push(property); }
    if (choice.dataset.goal) { goal.value = choice.dataset.goal; chosen.push(goal); }
    result.hidden = true;
    for (const field of chosen) {
      field.classList.remove('is-chosen');
      void field.offsetWidth;
      field.classList.add('is-chosen');
    }
  });

  form.querySelector('fieldset').disabled = false;
  updateEssentials();
  essentialStatus.hidden = false;
})();

(() => {
  const filter = document.querySelector('.filters');
  const buttons = [...filter.querySelectorAll('button')];
  const grid = document.querySelector('.systems-grid');
  const cards = [...grid.querySelectorAll('[data-system]')];
  const status = document.querySelector('#filter-status');
  const allowMotion = matchMedia('(prefers-reduced-motion: no-preference)');

  filter.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    const type = button.dataset.filter;
    grid.toggleAttribute('data-filtered', type !== 'all');
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));

    const visible = cards.filter((card) => type === 'all' || card.dataset.system === type);
    for (const card of cards) card.hidden = !visible.includes(card);
    status.textContent = visible.length === 1 ? '1 system example shown.' : visible.length + ' system examples shown.';

    if (!allowMotion.matches || typeof Element.prototype.animate !== 'function') return;
    for (const [index, card] of visible.entries()) {
      card.animate([
        { opacity: 0, translate: '0 1.5rem', scale: .96 },
        { opacity: 1, translate: '0 0', scale: 1 }
      ], { duration: 520, delay: index * 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    }
  });
  filter.hidden = false;
})();
