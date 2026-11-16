// Prefix an internal path with the deployment base (GitHub Pages subpath).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (p = '/') => `${base}${p.startsWith('/') ? p : `/${p}`}`;
