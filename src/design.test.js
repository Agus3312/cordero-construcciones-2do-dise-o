import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('homepage keeps a typographic hero instead of a decorative split image', async () => {
  const home = await readFile(new URL('index.html', root), 'utf8');
  const hero = home.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.match(hero, /Hacemos que tu/);
  assert.match(hero, /espacio/);
  assert.match(hero, /id="hero-phrase"/);
  assert.doesNotMatch(hero, /hero-visual|<img\b/);
});

test('homepage exposes an accessible expanded navigation panel', async () => {
  const home = await readFile(new URL('index.html', root), 'utf8');

  assert.match(home, /class="menu-toggle"[^>]*aria-expanded="false"/);
  assert.match(home, /class="mobile-menu"[^>]*aria-label="Navegación principal"/);
  assert.doesNotMatch(home, /class="menu-mark"/);
  assert.match(home, /class="menu-contact"/);
  assert.match(home, /href="#servicios"/);
  assert.match(home, /href="#trabajos"/);
  assert.match(home, /href="#proceso"/);
  assert.match(home, /href="#contacto"/);
  assert.match(home, /href="https:\/\/www\.instagram\.com\/ser\.co\.ok\/"/);
});

test('homepage wires scroll reveals and honors reduced-motion preferences', async () => {
  const [main, styles] = await Promise.all([
    readFile(new URL('src/main.js', root), 'utf8'),
    readFile(new URL('variables.css', root), 'utf8')
  ]);

  assert.match(main, /addEventListener\(['"]scroll['"]/);
  assert.match(main, /prefers-reduced-motion/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /\.is-visible/);
});

test('property cards reveal laterally when they enter the viewport', async () => {
  const [main, styles] = await Promise.all([
    readFile(new URL('src/main.js', root), 'utf8'),
    readFile(new URL('variables.css', root), 'utf8')
  ]);

  assert.match(main, /--scroll-reveal-x/);
  assert.match(styles, /translate:\s*var\(--scroll-reveal-x/);
  assert.match(styles, /\.property-section\s*\{[^}]*overflow-x:\s*clip;/s);
});

test('hero includes rotating phrases with reduced-motion support', async () => {
  const [home, main] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    readFile(new URL('src/main.js', root), 'utf8')
  ]);

  assert.match(home, /class="hero-phrase" id="hero-phrase"/);
  assert.match(main, /hero-phrase/);
  assert.match(main, /prefersReducedMotion/);
  assert.match(main, /setInterval/);
  assert.doesNotMatch(main, /import\s+['"]\.\/styles\.css['"]/);
});

test('scroll reveals track scroll position continuously', async () => {
  const [main, styles] = await Promise.all([
    readFile(new URL('src/main.js', root), 'utf8'),
    readFile(new URL('variables.css', root), 'utf8')
  ]);

  assert.match(main, /addEventListener\(['"]scroll['"]/);
  assert.match(main, /requestAnimationFrame/);
  assert.match(main, /--scroll-reveal-progress/);
  assert.match(styles, /opacity:\s*var\(--scroll-reveal-progress/);
  assert.match(main, /getBoundingClientRect\(\)\.top/);
});

test('text stays hidden until the final 20 percent of its scroll reveal', async () => {
  const [main, styles] = await Promise.all([
    readFile(new URL('src/main.js', root), 'utf8'),
    readFile(new URL('variables.css', root), 'utf8')
  ]);

  assert.match(main, /revealThreshold\s*=\s*0\.8/);
  assert.match(main, /revealStart\s*=\s*viewportHeight\s*\*\s*1\.8/);
  assert.match(main, /revealDistance\s*=\s*viewportHeight\s*;/);
  assert.match(main, /progress\s*-\s*revealThreshold/);
  const revealRule = styles.match(/\.reveal-item\s*\{[^}]*\}/s)?.[0] ?? '';
  assert.match(revealRule, /opacity:\s*var\(--scroll-reveal-progress,\s*0\)/);
  assert.doesNotMatch(revealRule, /transition:/);
});

test('work and service cards have defined borders, shadows, and hover motion', async () => {
  const styles = await readFile(new URL('variables.css', root), 'utf8');

  assert.match(styles, /\.property-card\s*\{[^}]*border:/s);
  assert.match(styles, /\.property-card\s*\{[^}]*box-shadow:/s);
  assert.match(styles, /\.service-item\s*\{[^}]*box-shadow:/s);
  assert.match(styles, /\.service-item:hover[^\{]*\{[^}]*transform:/s);
});

test('both pages load the single variables stylesheet directly', async () => {
  const [home, qr, styles] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    readFile(new URL('qr.html', root), 'utf8'),
    readFile(new URL('variables.css', root), 'utf8')
  ]);

  assert.match(home, /rel="stylesheet" href="\/variables\.css"/);
  assert.match(qr, /rel="stylesheet" href="\/variables\.css"/);
  assert.match(styles, /--line-color:/);
});

test('footer stays fully contrasted through hover transitions', async () => {
  const styles = await readFile(new URL('variables.css', root), 'utf8');

  assert.match(styles, /\.footer-credit\s*\{[^}]*color:\s*var\(--color-iron\)/s);
  assert.match(styles, /\.footer-qr-link:hover\s*\{[^}]*text-decoration-color:\s*currentColor/s);
  assert.doesNotMatch(styles, /\.footer-qr-link:hover\s*\{[^}]*opacity:/s);
});