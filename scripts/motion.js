(() => {
  const root = document.documentElement;
  const motionQuery = matchMedia('(prefers-reduced-motion: no-preference)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const phone = matchMedia('(max-width: 760px)');
  const header = document.querySelector('.site-header');
  const sun = header.querySelector('.scroll-sun');
  const hero = document.querySelector('.hero');
  const assessment = document.querySelector('#assessment');
  const dusk = document.querySelector('.dusk-media');
  const floatCta = document.querySelector('[data-float-cta]');
  const energy = document.querySelector('.energy-visual');
  const badges = [...energy.querySelectorAll('.energy-badge[data-at]')];
  const flows = [...document.querySelectorAll('[data-flow], .systems-section')];
  const steps = [...document.querySelectorAll('.process-flow li')];
  const revealables = [...document.querySelectorAll('[data-reveal]')];
  const cards = document.querySelectorAll('.setup-tile, .system-card a');

  const STAGGER = 110;
  const MAX_STAGGER_STEPS = 5;
  const SETTLE_TIME = 1800;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const motionOn = () => motionQuery.matches && root.classList.contains('motion');

  // Tell the head script that motion started, so it keeps the hidden-until-revealed state.
  root.dataset.motionReady = '';

  /* ---------- Scroll reveals ---------- */

  function reveal(element, delay = 0) {
    if (element.classList.contains('is-revealed')) return;
    element.style.setProperty('--reveal-delay', delay + 'ms');
    element.classList.add('is-revealed');
    setTimeout(() => {
      element.classList.add('reveal-done');
      element.style.removeProperty('--reveal-delay');
    }, delay + SETTLE_TIME);
  }

  const revealNow = (element) => element.classList.add('is-revealed', 'reveal-done');

  // A media reveal starts clipped to zero area, so the observer would never see it (and its lazy
  // image would never load). Watch its container instead and reveal the photo from there.
  const watched = new Map();
  const watchTarget = (element) => (element.dataset.reveal === 'media' ? element.parentElement : element);

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .flatMap((entry) => {
        observer.unobserve(entry.target);
        const elements = watched.get(entry.target) ?? [];
        watched.delete(entry.target);
        return elements;
      })
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .forEach((element, index) => reveal(element, Math.min(index, MAX_STAGGER_STEPS) * STAGGER));
  }, { rootMargin: '0px 0px -8% 0px', threshold: .1 }) : null;

  function watch(element) {
    const target = watchTarget(element);
    if (!watched.has(target)) {
      watched.set(target, []);
      observer.observe(target);
    }
    watched.get(target).push(element);
  }

  function disableMotion() {
    observer?.disconnect();
    watched.clear();
    root.classList.remove('motion');
    revealables.forEach(revealNow);
    for (const element of [hero, dusk, ...flows]) {
      for (const property of ['--shift', '--drift', '--flow-progress']) element.style.removeProperty(property);
    }
    steps.forEach((step) => step.removeAttribute('data-active'));
    badges.forEach((badge) => badge.removeAttribute('data-lit'));
    energy.removeAttribute('data-full');
  }

  // Keyboard users must never land on invisible content.
  document.addEventListener('focusin', (event) => {
    let hidden = event.target.closest?.('[data-reveal]:not(.is-revealed)');
    while (hidden) {
      revealNow(hidden);
      hidden = hidden.parentElement?.closest('[data-reveal]:not(.is-revealed)');
    }
  });

  /* ---------- Pause looping light (pulses, sunburst) while offscreen ---------- */

  if ('IntersectionObserver' in window) {
    const loops = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
    });
    [hero, energy, assessment].forEach((element) => loops.observe(element));
  }

  /* ---------- Scroll-linked effects, batched into one frame ---------- */

  let frame = 0;
  const requestUpdate = () => { frame ||= requestAnimationFrame(update); };

  function update() {
    frame = 0;
    const viewport = innerHeight;
    const scrollable = root.scrollHeight - viewport;
    const progress = scrollable > 0 ? clamp(scrollY / scrollable) : 0;
    header.style.setProperty('--reading-progress', progress.toFixed(4));
    sun.style.setProperty('--sun-x', (progress * (header.clientWidth - sun.offsetWidth)).toFixed(1) + 'px');
    sun.style.setProperty('--sun-opacity', clamp(progress * 25).toFixed(2));
    header.toggleAttribute('data-scrolled', scrollY > 8);
    updateFloatCta(viewport);

    if (!motionOn()) return;

    // Safety net: a fast flick can skip past an element before the observer catches it.
    for (const [target, elements] of watched) {
      if (target.getBoundingClientRect().bottom >= 0) continue;
      observer.unobserve(target);
      watched.delete(target);
      elements.forEach((element) => reveal(element));
    }

    const heroBox = hero.getBoundingClientRect();
    if (heroBox.bottom > 0) hero.style.setProperty('--shift', clamp(-heroBox.top / heroBox.height).toFixed(4));

    const duskBox = dusk.getBoundingClientRect();
    if (duskBox.bottom > 0 && duskBox.top < viewport) {
      const passage = clamp((viewport - duskBox.top) / (viewport + duskBox.height));
      dusk.style.setProperty('--drift', (passage * 2 - 1).toFixed(4));
    }

    for (const flow of flows) {
      const box = flow.getBoundingClientRect();
      if (box.bottom < -viewport || box.top > viewport * 2) continue;
      const line = flow.querySelector('.band-trace');
      const bounds = line ? line.getBoundingClientRect() : box;
      // Starts as the element enters and completes as it passes the upper third of the screen.
      const amount = clamp((viewport * .9 - bounds.top) / (bounds.height + viewport * .3));
      flow.style.setProperty('--flow-progress', amount.toFixed(4));

      if (flow === energy) {
        badges.forEach((badge) => badge.toggleAttribute('data-lit', amount >= Number(badge.dataset.at)));
        energy.toggleAttribute('data-full', amount >= .99);
      }
      if (flow.dataset.flow === 'process') {
        steps.forEach((step, index) => step.toggleAttribute('data-active', amount >= index / Math.max(1, steps.length - 1) * .92 + .04));
      }
    }
  }

  /* ---------- Floating assessment button: phones, after the hero until the assessment ---------- */

  function updateFloatCta(viewport) {
    if (!floatCta) return;
    const show = phone.matches
      && hero.getBoundingClientRect().bottom < 0
      && assessment.getBoundingClientRect().top > viewport * .92;
    if (show === floatCta.hasAttribute('data-show')) return;
    if (!show && floatCta.contains(document.activeElement)) floatCta.blur();
    floatCta.toggleAttribute('data-show', show);
  }

  if (motionOn() && observer) revealables.forEach(watch);
  else disableMotion();

  if (floatCta) floatCta.hidden = false;
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  phone.addEventListener('change', requestUpdate);
  update();

  motionQuery.addEventListener('change', () => {
    if (!motionQuery.matches) disableMotion();
    requestUpdate();
  });

  /* ---------- Cards: pointer tilt + spotlight ---------- */

  function trackPointer(event) {
    if (!finePointer.matches || !motionOn()) return;
    const card = event.currentTarget;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    const strength = clamp(380 / box.width, .25, 1) * 7;
    card.style.setProperty('--tilt-x', ((.5 - y) * strength).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-y', ((x - .5) * strength).toFixed(2) + 'deg');
  }

  function resetPointer(event) {
    for (const property of ['--mx', '--my', '--tilt-x', '--tilt-y']) event.currentTarget.style.removeProperty(property);
  }

  for (const card of cards) {
    card.addEventListener('pointermove', trackPointer);
    card.addEventListener('pointerleave', resetPointer);
  }
})();
