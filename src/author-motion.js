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
  let touch = null, suppressClick = false;
  let entering = !reduced.matches;
  const side = 0;
  function updateEntrance() {
    if (!entering || reduced.matches) return;
    const rect = button.getBoundingClientRect();
    const viewport = window.innerHeight;
    const start = viewport + rect.height / 2;
    const end = viewport * .6;
    const progress = Math.max(0, Math.min(1, (start - rect.top - rect.height / 2) / (start - end)));
    const eased = progress * progress * (3 - 2 * progress);
    target = side + (center - side) * eased;
    if (progress >= 1) entering = false;
    schedule();
  }
  function draw(index, wink = false) {
    index = Math.max(0, Math.min((wink ? winkFrames : frames) - 1, Math.round(index)));
    const key = `${wink ? 'wink' : 'turn'}:${index}`;
    if (key === previous) return;
    const cols = wink ? 5 : 10;
    ctx.clearRect(0, 0, size, size);
    ctx.filter = 'none';
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
    entering = !reduced.matches;
    target = entering ? side : center; current = target; centering = false; winkStart = null; last = 0;
    touch = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (ready) draw(current);
  }
  function load() {
    if (started) return;
    started = true;
    sheet.onload = () => {
      ready = true; updateEntrance(); current = target; draw(current);
      button.querySelector('img').hidden = true; canvas.hidden = false;
      schedule();
    };
    winkSheet.onload = () => { winkReady = true; };
    sheet.src = 'assets/flora-motion-sheet.webp';
    winkSheet.src = 'assets/flora-wink-sheet.webp';
  }
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { load(); updateEntrance(); schedule(); } else reset();
  }).observe(button);
  const preload = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { load(); preload.disconnect(); }
  }, { rootMargin: '400px' });
  preload.observe(button);
  window.addEventListener('scroll', () => { if (visible) updateEntrance(); }, { passive: true });
  window.addEventListener('resize', () => { if (visible) updateEntrance(); }, { passive: true });
  document.addEventListener('pointermove', event => {
    if (entering || !ready || !visible || reduced.matches || event.pointerType === 'touch' || document.hidden) return;
    const r = canvas.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - r.left - r.width / 2) / (r.width * .7)));
    target = center + x * (x < 0 ? center : frames - 1 - center);
    schedule();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { if (!entering) { target = center; schedule(); } });
  button.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !event.isPrimary) return;
    suppressClick = false;
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY, start: current, dragging: false };
  }, { passive: true });
  button.addEventListener('pointermove', event => {
    if (!touch || event.pointerId !== touch.id) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
    if (!touch.dragging) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { suppressClick = true; touch = null; return; }
      if (Math.abs(dx) < 8) return;
      touch.dragging = true;
      suppressClick = true;
    }
    if (!ready || !visible || reduced.matches) return;
    entering = false;
    target = Math.max(0, Math.min(frames - 1, touch.start + dx / button.clientWidth * (frames - 1)));
    schedule();
  }, { passive: true });
  function endTouch(event) {
    if (!touch || event.pointerId !== touch.id) return;
    if (event.type === 'pointercancel') suppressClick = true;
    touch = null;
    target = center;
    schedule();
  }
  button.addEventListener('pointerup', endTouch);
  button.addEventListener('pointercancel', endTouch);
  button.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    if (ready && winkReady && !centering && winkStart === null) { entering = false; centering = true; schedule(); }
  });
  reduced.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); else { updateEntrance(); schedule(); } });
})();
