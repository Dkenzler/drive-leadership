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
