(() => {
  const button = document.querySelector('.author-motion');
  if (!button) return;
  const canvas = button.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sheet = new Image(), winkSheet = new Image();
  const size = 384, center = 31, frames = 60, winkFrames = 20;
  let ready = false, winkReady = false, visible = false, started = false;
  let target = center, current = center, last = 0, previous = '';
  let centering = false, winkStart = null, raf = 0;
  function draw(index, wink = false) {
    index = Math.max(0, Math.min((wink ? winkFrames : frames) - 1, Math.round(index)));
    const key = `${wink ? 'wink' : 'turn'}:${index}`;
    if (key === previous) return;
    const cols = wink ? 5 : 10;
    ctx.clearRect(0, 0, size, size);
    ctx.filter = 'grayscale(1)';
    ctx.drawImage(wink ? winkSheet : sheet, (index % cols) * size, Math.floor(index / cols) * size, size, size, 0, 0, size, size);
    previous = key;
    canvas.dataset.animation = wink ? 'wink' : 'turn';
  }
  function schedule() {
    if (!raf && ready && visible && !document.hidden) raf = requestAnimationFrame(animate);
  }
  function animate(time) {
    raf = 0;
    const dt = Math.min(50, time - (last || time)); last = time;
    if (centering) {
      current += (center - current) * (1 - Math.exp(-dt / 65));
      if (Math.abs(current - center) < .35) { current = center; centering = false; winkStart = time; }
    }
    if (winkStart !== null) {
      const elapsed = time - winkStart;
      if (elapsed < 400) draw(elapsed / 400 * 19, true);
      else if (elapsed < 480) draw(19, true);
      else if (elapsed < 880) draw((1 - (elapsed - 480) / 400) * 19, true);
      else { winkStart = null; current = center; draw(center); }
    } else {
      if (!centering) current = reduced.matches ? target : current + (target - current) * (1 - Math.exp(-dt / 95));
      draw(current);
    }
    if (centering || winkStart !== null || Math.abs(current - target) > .05) schedule();
  }
  function reset() {
    target = center; current = center; centering = false; winkStart = null; last = 0;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (ready) draw(center);
  }
  function load() {
    if (started) return;
    started = true;
    sheet.onload = () => {
      ready = true; draw(center);
      button.querySelector('img').hidden = true; canvas.hidden = false;
      schedule();
    };
    winkSheet.onload = () => { winkReady = true; };
    sheet.src = 'assets/flora-motion-sheet.webp';
    winkSheet.src = 'assets/flora-wink-sheet.webp';
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { load(); schedule(); } else reset();
  }).observe(button);
  document.addEventListener('pointermove', event => {
    if (!ready || !visible || reduced.matches || event.pointerType === 'touch' || document.hidden) return;
    const r = canvas.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - r.left - r.width / 2) / (r.width * .7)));
    target = center + x * (x < 0 ? center : frames - 1 - center);
    schedule();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { target = center; schedule(); });
  button.addEventListener('click', () => {
    if (ready && winkReady && !centering && winkStart === null) { centering = true; schedule(); }
  });
  reduced.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); else schedule(); });
})();
