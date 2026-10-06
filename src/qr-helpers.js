import { buildWhatsAppUrl } from './contact.js';

const STORAGE_KEY = 'cordero-qr-session-v1';

function isPublicHttpsUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function normalizePublicHttpsUrl(value) {
  const input = value?.trim();
  if (!input) return null;

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`;
  if (!isPublicHttpsUrl(candidate)) return null;
  return new URL(candidate).href;
}

function normalizeInstagramUrl(value) {
  const input = value?.trim();
  if (!input) return null;

  const username = input.startsWith('@') ? input.slice(1) : input;
  if (/^[A-Za-z0-9._]{1,30}$/.test(username) && !username.startsWith('.') && !username.endsWith('.')) {
    return `https://www.instagram.com/${username}/`;
  }

  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function buildQrTargets({ siteUrl, instagramUrl, whatsappPhone, whatsappMessage, facebookUrl }) {
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone ?? '', whatsappMessage ?? '');
  const targets = [
    { key: 'site', name: 'Web · todos los contactos', url: normalizePublicHttpsUrl(siteUrl) },
    { key: 'instagram', name: 'Instagram · @ser.co.ok', url: normalizeInstagramUrl(instagramUrl) },
    { key: 'whatsapp', name: 'WhatsApp · consulta directa', url: whatsappUrl },
    { key: 'facebook', name: 'Facebook', url: normalizePublicHttpsUrl(facebookUrl) }
  ];

  return targets.filter(({ url }) => isPublicHttpsUrl(url));
}

export function saveQrSession(storage, payload = {}) {
  if (!storage || typeof storage.setItem !== 'function') return null;

  const timestamp = payload.updatedAt ?? payload.generatedAt ?? new Date().toISOString();
  const normalized = {
    siteUrl: payload.siteUrl ?? '',
    instagramUrl: payload.instagramUrl ?? '',
    whatsappPhone: payload.whatsappPhone ?? '',
    facebookUrl: payload.facebookUrl ?? '',
    generatedAt: timestamp,
    updatedAt: timestamp
  };

  storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadQrSession(storage) {
  if (!storage || typeof storage.getItem !== 'function') return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      siteUrl: parsed.siteUrl ?? '',
      instagramUrl: parsed.instagramUrl ?? '',
      whatsappPhone: parsed.whatsappPhone ?? '',
      facebookUrl: parsed.facebookUrl ?? '',
      generatedAt: parsed.generatedAt ?? parsed.updatedAt ?? null
    };
  } catch {
    return null;
  }
}

export function clearQrSession(storage) {
  if (!storage || typeof storage.removeItem !== 'function') return;
  storage.removeItem(STORAGE_KEY);
}