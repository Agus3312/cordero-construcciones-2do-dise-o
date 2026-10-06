import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('loads Google Material Symbols on both pages', async () => {
  const [home, qr] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    readFile(new URL('qr.html', root), 'utf8')
  ]);

  assert.match(home, /fonts\.googleapis\.com\/css2\?[^\"]*Material\+Symbols\+Outlined/);
  assert.match(qr, /fonts\.googleapis\.com\/css2\?[^\"]*Material\+Symbols\+Outlined/);
});

test('uses semantic Material Symbols for the three service icons', async () => {
  const home = await readFile(new URL('index.html', root), 'utf8');
  const serviceIcons = [...home.matchAll(/class="material-symbols-outlined service-symbol"[^>]*>([^<]+)<\/span>/g)]
    .map(([, name]) => name.trim());

  assert.deepEqual(serviceIcons, ['construction', 'home_repair_service', 'format_paint']);
});