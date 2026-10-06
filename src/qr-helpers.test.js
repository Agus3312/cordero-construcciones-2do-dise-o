import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQrTargets, loadQrSession, saveQrSession } from './qr-helpers.js';

test('includes only configured public destinations', () => {
  const targets = buildQrTargets({
    siteUrl: '',
    instagramUrl: 'https://www.instagram.com/ser.co.ok/',
    whatsappPhone: '',
    facebookUrl: ''
  });

  assert.deepEqual(targets.map(({ key }) => key), ['instagram']);
});

test('accepts an Instagram username without a full URL', () => {
  const targets = buildQrTargets({
    siteUrl: '',
    instagramUrl: '@ser.co.ok',
    whatsappPhone: '',
    facebookUrl: ''
  });

  assert.equal(targets.length, 1);
  assert.equal(targets[0].url, 'https://www.instagram.com/ser.co.ok/');
});

test('adds HTTPS to bare website and Facebook domains', () => {
  const targets = buildQrTargets({
    siteUrl: 'sercok.com.ar',
    instagramUrl: '',
    whatsappPhone: '',
    facebookUrl: 'facebook.com/sercok'
  });

  assert.deepEqual(targets.map(({ url }) => url), [
    'https://sercok.com.ar/',
    'https://facebook.com/sercok'
  ]);
});

test('builds a direct target for each configured channel', () => {
  const targets = buildQrTargets({
    siteUrl: 'https://sercok.com.ar/',
    instagramUrl: 'https://www.instagram.com/ser.co.ok/',
    whatsappPhone: '+54 9 11 2345-6789',
    whatsappMessage: 'Hola, quiero consultar.',
    facebookUrl: 'https://www.facebook.com/sercok'
  });

  assert.deepEqual(targets.map(({ key }) => key), ['site', 'instagram', 'whatsapp', 'facebook']);
  assert.equal(targets[2].url, 'https://wa.me/5491123456789?text=Hola%2C%20quiero%20consultar.');
});

test('rejects insecure or malformed public URLs', () => {
  const targets = buildQrTargets({
    siteUrl: 'http://sercok.com.ar/',
    instagramUrl: 'not a URL',
    whatsappPhone: '1234',
    facebookUrl: 'javascript:alert(1)'
  });

  assert.deepEqual(targets, []);
});

test('saves and restores a QR session snapshot from storage', () => {
  const storage = new Map();
  const values = {
    siteUrl: 'https://sercok.com.ar/',
    instagramUrl: 'https://www.instagram.com/ser.co.ok/',
    whatsappPhone: '+54 9 11 2345-6789',
    facebookUrl: 'https://www.facebook.com/sercok',
    generatedAt: '2026-10-06T00:00:00.000Z'
  };

  saveQrSession({
    setItem: (key, value) => storage.set(key, value),
    getItem: (key) => storage.get(key) ?? null
  }, values);

  assert.deepEqual(loadQrSession({
    getItem: (key) => storage.get(key) ?? null
  }), values);
});