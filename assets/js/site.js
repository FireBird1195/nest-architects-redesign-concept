// Galaxy Interior concept v5. Progressive enhancement: content and links work without it.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Full-screen menu from the floating dock
const menu = document.querySelector('[data-menu]');
const menuBtn = document.querySelector('[data-menu-toggle]');
if (menu && menuBtn) {
  const set = (open) => { menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = open ? 'Close' : 'Menu'; root.classList.toggle('menu-open', open); if (open) menu.querySelector('a')?.focus(); };
  menuBtn.addEventListener('click', () => set(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => e.target.closest('a') && set(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); menuBtn.focus(); } });
}

// Hero: the four process words light up in turn
const words = [...document.querySelectorAll('.hero__words li')];
if (words.length && !reduce) {
  let w = 0;
  setInterval(() => { words[w].classList.remove('is-on'); w = (w + 1) % words.length; words[w].classList.add('is-on'); }, 1800);
}

// Room index: a photo follows the pointer (desktop only)
const peek = document.querySelector('[data-peek]');
if (peek && matchMedia('(hover: hover)').matches) {
  const pimg = peek.querySelector('img');
  let tx = 0, ty = 0, x = 0, y = 0, raf;
  const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; peek.style.left = x + 'px'; peek.style.top = y + 'px'; raf = requestAnimationFrame(loop); };
  document.querySelectorAll('[data-peek-src]').forEach((el) => {
    el.addEventListener('pointerenter', (e) => { pimg.src = el.dataset.peekSrc; x = tx = e.clientX; y = ty = e.clientY; peek.classList.add('is-on'); cancelAnimationFrame(raf); loop(); });
    el.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    el.addEventListener('pointerleave', () => { peek.classList.remove('is-on'); cancelAnimationFrame(raf); });
  });
}

// Lightbox for a room category (or all photos)
const lb = document.querySelector('[data-lightbox]');
const G = window.GALLERY || {};
if (lb) {
  const lbImg = lb.querySelector('[data-lb-img]'); const lbCap = lb.querySelector('[data-lb-cap]');
  let list = [], i = 0, opener = null;
  const show = () => { const p = list[i]; lbImg.src = p.src; lbImg.alt = p.alt; lbCap.textContent = `${p.alt} (${i + 1} of ${list.length})`; };
  const open = (cat, start, btn) => {
    list = cat === 'all' ? Object.values(G).flat() : (G[cat] || []);
    if (!list.length) return;
    i = Math.max(0, list.findIndex((p) => p.src === start)); opener = btn; show();
    lb.hidden = false; lb.classList.add('is-open'); root.style.overflow = 'hidden'; lb.querySelector('[data-lb-close]').focus();
  };
  const close = () => { lb.classList.remove('is-open'); lb.hidden = true; root.style.overflow = ''; opener?.focus(); };
  const step = (d) => { i = (i + d + list.length) % list.length; show(); };
  document.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => open(b.dataset.cat, b.dataset.start, b)));
  lb.querySelector('[data-lb-close]').addEventListener('click', close);
  lb.querySelector('[data-lb-prev]').addEventListener('click', () => step(-1));
  lb.querySelector('[data-lb-next]').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1);
    if (e.key === 'Tab') { const f = [...lb.querySelectorAll('button')]; if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); x0 = null; });
}

// Walkthrough phone: play/pause, switch between videos
const phone = document.querySelector('[data-phone]');
if (phone) {
  const v = phone.querySelector('video'); const btn = phone.querySelector('[data-phone-play]'); const label = btn.querySelector('span');
  const sync = () => { label.textContent = v.paused ? 'Play' : 'Pause'; };
  v.addEventListener('error', () => phone.classList.add('is-missing'));
  v.addEventListener('play', sync); v.addEventListener('pause', sync);
  btn.addEventListener('click', () => (v.paused ? v.play().catch(() => {}) : v.pause()));
  document.querySelectorAll('[data-reel]').forEach((r, _, all) => r.addEventListener('click', () => {
    all.forEach((o) => o.setAttribute('aria-pressed', String(o === r)));
    phone.classList.remove('is-missing'); v.src = r.dataset.reel + '#t=0.6'; v.play().catch(() => {});
  }));
}

// Service panels: tap or focus opens one on touch screens
const panels = [...document.querySelectorAll('.panel')];
panels.forEach((p) => {
  const openOnly = () => panels.forEach((o) => o.classList.toggle('is-open', o === p));
  p.addEventListener('click', openOnly); p.addEventListener('focus', openOnly);
  p.addEventListener('pointerenter', openOnly);
});

// One large client quote at a time
const Q = [
  ['“They acted as the project managers, working with the architect, builders and sub-contractors. They are organized, sensitive to budget and time, and make any project exciting and fun!”', 'Govind Kabra'],
  ['“Galaxy Interior has the best interior designers. They know their job very well and complete on time.”', 'Prasoon Ghosh'],
  ['“I’m glad to take Galaxy team on board for my new home as it is one of the best companies in the market. Great experience with the company.”', 'Kevin L'],
];
const qs = document.querySelector('[data-quotes]');
if (qs) {
  let q = 0; const t = qs.querySelector('[data-q-text]'); const n = qs.querySelector('[data-q-name]');
  qs.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { q = (q + Number(b.dataset.q) + Q.length) % Q.length; t.textContent = Q[q][0]; n.innerHTML = `${Q[q][1]}<span>Client</span>`; }));
}

// Estimate form: demonstration only
const form = document.querySelector('[data-demo-form]');
if (form) {
  const note = form.querySelector('[data-form-note]');
  form.addEventListener('submit', (e) => {
    e.preventDefault(); if (!form.reportValidity()) return;
    const d = new FormData(form); const name = String(d.get('name') || '').trim().split(' ')[0];
    form.reset(); note.hidden = false;
    note.textContent = `Thank you${name ? `, ${name}` : ''}. On the live site Galaxy Interior would now call you about your ${d.get('property')}. This concept doesn't send or store anything.`;
    note.focus();
  });
}
