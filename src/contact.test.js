import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl, getActiveSocialLinks } from './contact.js';

test('builds a WhatsApp URL with a normalized phone and encoded message', () => {
  const url = buildWhatsAppUrl('+54 9 11 2345-6789', 'Hola, quiero consultar por una refacción.');

  assert.equal(
    url,
    'https://wa.me/5491123456789?text=Hola%2C%20quiero%20consultar%20por%20una%20refacci%C3%B3n.'
  );
});

test('adds the Buenos Aires mobile prefix to local Argentine numbers', () => {
  assert.equal(buildWhatsAppUrl('1234-5678', 'Hola'), 'https://wa.me/5491112345678?text=Hola');
  assert.equal(buildWhatsAppUrl('11 2345 6789', 'Hola'), 'https://wa.me/5491123456789?text=Hola');
  assert.equal(buildWhatsAppUrl('011 2345 6789', 'Hola'), 'https://wa.me/5491123456789?text=Hola');
  assert.equal(buildWhatsAppUrl('+54 11 2345 6789', 'Hola'), 'https://wa.me/5491123456789?text=Hola');
});

test('does not create a WhatsApp URL when the number is absent or too short', () => {
  assert.equal(buildWhatsAppUrl('', 'Hola'), null);
  assert.equal(buildWhatsAppUrl('1234', 'Hola'), null);
});

test('returns only configured social channels in display order', () => {
  const links = getActiveSocialLinks({
    instagram: 'https://www.instagram.com/ser.co.ok/',
    whatsapp: '',
    facebook: 'https://www.facebook.com/sercok'
  });

  assert.deepEqual(links.map(({ name }) => name), ['Instagram', 'Facebook']);
});