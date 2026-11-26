(() => {
  const header = document.querySelector('.site-header');
  const menu = header.querySelector('.menu-toggle');
  const navigation = header.querySelector('.site-nav');
  const mobile = matchMedia('(max-width: 760px)');

  function setMenu(open = false) {
    menu.hidden = !mobile.matches;
    navigation.hidden = mobile.matches && !open;
    menu.setAttribute('aria-expanded', String(open));
  }

  function menuIsOpen() {
    return menu.getAttribute('aria-expanded') === 'true';
  }

  function showTarget(link) {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }

  menu.addEventListener('click', () => setMenu(!menuIsOpen()));
  navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !mobile.matches || !menuIsOpen()) return;
    setMenu(false);
    showTarget(link);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menuIsOpen()) return;
    setMenu(false);
    menu.focus();
  });
  document.addEventListener('click', (event) => {
    if (!menuIsOpen() || header.contains(event.target)) return;
    const focusWasInMenu = navigation.contains(document.activeElement);
    setMenu(false);
    if (focusWasInMenu) menu.focus();
  });
  mobile.addEventListener('change', () => {
    const oldFocus = document.activeElement;
    setMenu(false);
    if (mobile.matches && navigation.contains(oldFocus)) menu.focus();
    if (!mobile.matches && oldFocus === menu) navigation.querySelector('a').focus();
  });

  header.dataset.menuReady = '';
  setMenu();
})();
