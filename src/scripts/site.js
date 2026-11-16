// Progressive enhancement only: the pages read and navigate without this file.
const root = document.documentElement;
root.classList.add('js');

// Mobile navigation
const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
if (toggle && nav) {
  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('nav-open', open);
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => e.target.closest('a') && set(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      set(false);
      toggle.focus();
    }
  });
}

// Header: solid once the page has moved
const header = document.querySelector('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Drawings ink themselves in, and blocks settle, as they enter the viewport
const seen = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        seen.unobserve(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
);
document.querySelectorAll('.sketch--draw, [data-reveal]').forEach((el) => seen.observe(el));

// Work index: the preview pane follows the row being pointed at or focused
const rows = document.querySelectorAll('[data-work-row]');
const panes = document.querySelectorAll('[data-work-pane]');
if (rows.length && panes.length) {
  const show = (id) => {
    panes.forEach((p) => p.classList.toggle('is-active', p.dataset.workPane === id));
    rows.forEach((r) => r.classList.toggle('is-active', r.dataset.workRow === id));
  };
  rows.forEach((r) => {
    r.addEventListener('pointerenter', () => show(r.dataset.workRow));
    r.addEventListener('focusin', () => show(r.dataset.workRow));
  });
}

// Project page: room index tracks the reading position
const roomLinks = document.querySelectorAll('[data-room-link]');
if (roomLinks.length) {
  const byId = new Map([...roomLinks].map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          roomLinks.forEach((a) => a.removeAttribute('aria-current'));
          byId.get(e.target.id)?.setAttribute('aria-current', 'true');
        }
      }
    },
    { rootMargin: '-35% 0px -55% 0px' },
  );
  byId.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

// Enquiry form: demonstration only. Nothing leaves the browser.
const form = document.querySelector('[data-demo-form]');
if (form) {
  const note = form.querySelector('[data-form-note]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = (new FormData(form).get('name') || '').toString().trim().split(' ')[0];
    form.reset();
    note.hidden = false;
    note.textContent = `Thank you${name ? `, ${name}` : ''}. This is a concept preview, so nothing was sent or stored. On the live site this would reach the studio directly.`;
    note.focus();
  });
}
