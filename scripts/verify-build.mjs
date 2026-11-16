// Post-build check: both pages exist, every internal href/src resolves under
// the deployment base path, and the noindex directive is present.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const base = (process.env.BASE_PATH || '/nest-architects-redesign-concept').replace(/\/$/, '');
const pages = ['index.html', 'work/vijayshree/index.html'];
const errors = [];

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const resolve = (p) => {
  const rel = p.slice(base.length).split('#')[0].split('?')[0];
  const target = join(dist, rel);
  return existsSync(target) && statSync(target).isDirectory() ? join(target, 'index.html') : target;
};

for (const page of pages) {
  const file = join(dist, page);
  if (!existsSync(file)) { errors.push(`missing page: ${page}`); continue; }
  const html = readFileSync(file, 'utf8');
  if (!/<meta name="robots" content="noindex/.test(html)) errors.push(`${page}: noindex missing`);
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue;
    if (!ref.startsWith(`${base}/`)) { errors.push(`${page}: path outside base -> ${ref}`); continue; }
    if (!existsSync(resolve(ref))) errors.push(`${page}: broken -> ${ref}`);
  }
}
for (const css of walk(dist).filter((f) => f.endsWith('.css'))) {
  for (const [, ref] of readFileSync(css, 'utf8').matchAll(/url\(([^)]+)\)/g)) {
    const u = ref.replace(/["']/g, '');
    if (u.startsWith('data:')) continue;
    if (!u.startsWith(`${base}/`) || !existsSync(resolve(u))) errors.push(`${css}: broken asset -> ${u}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`build verified: ${pages.length} pages, all internal paths resolve under ${base}/`);
