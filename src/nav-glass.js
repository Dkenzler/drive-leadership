(() => {
const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('#navigation');function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});
})();
(() => {
  const header = document.querySelector('.header');
  if (!header) return;
  let compact = false;
  let pending = false;
  function update() {
    pending = false;
    // Hysteresis prevents layout changes near the threshold from flickering.
    const next = compact ? window.scrollY > 24 : window.scrollY > 96;
    if (next !== compact) {
      compact = next;
      header.classList.toggle('is-scrolled', compact);
    }
  }
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('pageshow', update);
  update();
})();

// Keep the opening section sized to the available space below the navigation.
(() => {
  const header = document.querySelector('.header');
  if (!header) return;
  const updateHeight = () => document.documentElement.style.setProperty('--navigation-height', `${header.getBoundingClientRect().height}px`);
  new ResizeObserver(updateHeight).observe(header);
  updateHeight();
})();
