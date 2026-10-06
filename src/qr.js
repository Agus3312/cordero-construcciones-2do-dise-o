import QRCode from 'qrcode';
import { buildQrTargets, loadQrSession, saveQrSession } from './qr-helpers.js';
import { siteConfig } from './site-config.js';

const form = document.querySelector('#qr-form');
const results = document.querySelector('#qr-results');
const status = document.querySelector('#qr-status');
const count = document.querySelector('#qr-count');
const printButton = document.querySelector('#print-qrs');
const siteInput = document.querySelector('#site-url');
const instagramInput = document.querySelector('#instagram-url');
const whatsappInput = document.querySelector('#whatsapp-phone');
const facebookInput = document.querySelector('#facebook-url');

const savedSession = loadQrSession(window.localStorage);

instagramInput.value = savedSession?.instagramUrl ?? siteConfig.instagramUrl;
facebookInput.value = savedSession?.facebookUrl ?? siteConfig.facebookUrl;
whatsappInput.value = savedSession?.whatsappPhone ?? '';
siteInput.value = savedSession?.siteUrl ?? (window.location.protocol === 'https:' && !['localhost', '127.0.0.1'].includes(window.location.hostname) ? window.location.origin : '');

function persistQrSession() {
  const session = {
    siteUrl: siteInput.value.trim(),
    instagramUrl: instagramInput.value.trim(),
    whatsappPhone: whatsappInput.value.trim(),
    facebookUrl: facebookInput.value.trim(),
    updatedAt: new Date().toISOString()
  };

  saveQrSession(window.localStorage, session);
  return session;
}

function createDownloadLink(label, filename, dataUrl) {
  const link = document.createElement('a');
  link.className = 'qr-download';
  link.href = dataUrl;
  link.download = filename;
  link.textContent = label;
  return link;
}

async function createQrCard(target) {
  const article = document.createElement('article');
  article.className = 'qr-card';

  const cardHeader = document.createElement('div');
  cardHeader.className = 'qr-card-heading';
  const title = document.createElement('h3');
  title.textContent = target.name;
  const label = document.createElement('span');
  label.textContent = target.key === 'site' ? 'GENERAL' : 'DIRECTO';
  cardHeader.append(title, label);

  const canvas = document.createElement('canvas');
  canvas.className = 'qr-canvas';
  canvas.setAttribute('aria-label', `Código QR para ${target.name}`);
  await QRCode.toCanvas(canvas, target.url, {
    errorCorrectionLevel: 'H',
    width: 280,
    margin: 4,
    color: { dark: '#34473c', light: '#ffffff' }
  });

  const destination = document.createElement('p');
  destination.className = 'qr-destination';
  destination.textContent = target.url;

  const actions = document.createElement('div');
  actions.className = 'qr-card-actions';
  actions.append(createDownloadLink('Descargar PNG', `${target.key}-cordero-oscar.png`, canvas.toDataURL('image/png')));

  const svg = await QRCode.toString(target.url, {
    type: 'svg',
    width: 900,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: { dark: '#34473c', light: '#ffffff' }
  });
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  actions.append(createDownloadLink('Descargar SVG', `${target.key}-cordero-oscar.svg`, URL.createObjectURL(svgBlob)));

  article.append(cardHeader, canvas, destination, actions);
  return article;
}

async function renderQrTargets() {
  printButton.disabled = true;
  results.replaceChildren();
  status.textContent = '';

  const targets = buildQrTargets({
    siteUrl: siteInput.value.trim(),
    instagramUrl: instagramInput.value.trim(),
    whatsappPhone: whatsappInput.value,
    whatsappMessage: siteConfig.whatsappMessage,
    facebookUrl: facebookInput.value.trim()
  });

  if (targets.length === 0) {
    count.textContent = '0';
    if (siteInput.value || instagramInput.value || whatsappInput.value || facebookInput.value) {
      status.textContent = 'Agregá al menos un enlace HTTPS válido para generar un código.';
    }
    return;
  }

  try {
    for (const target of targets) {
      results.append(await createQrCard(target));
    }
    count.textContent = String(targets.length).padStart(2, '0');
    printButton.disabled = false;
    status.textContent = `Listo: ${targets.length} ${targets.length === 1 ? 'código preparado' : 'códigos preparados'}. Guardado automáticamente.`;
    persistQrSession();
  } catch {
    results.replaceChildren();
    count.textContent = '0';
    status.textContent = 'No se pudieron generar los códigos. Revisá los enlaces e intentá de nuevo.';
  }
}

[siteInput, instagramInput, whatsappInput, facebookInput].forEach((input) => {
  input.addEventListener('input', () => {
    persistQrSession();
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await renderQrTargets();
});

printButton.addEventListener('click', () => window.print());

if (siteInput.value || instagramInput.value || whatsappInput.value || facebookInput.value) {
  renderQrTargets();
}