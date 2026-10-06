import { buildWhatsAppUrl, getActiveSocialLinks } from './contact.js';
import { siteConfig } from './site-config.js';

const whatsappUrl = buildWhatsAppUrl(siteConfig.whatsappPhone, siteConfig.whatsappMessage);
const socialLinks = getActiveSocialLinks({
  instagram: siteConfig.instagramUrl,
  whatsapp: whatsappUrl,
  facebook: siteConfig.facebookUrl
});

const menuToggle = document.querySelector('.menu-toggle');
const menuIcon = menuToggle.querySelector('.material-symbols-outlined');
const mobileMenu = document.querySelector('.mobile-menu');
const menuLinks = mobileMenu.querySelectorAll('a');
const headerBrand = document.querySelector('.site-header .brand');
const pageRegions = document.querySelectorAll('main, .site-footer');

function setMenuOpen(isOpen, restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  menuIcon.textContent = isOpen ? 'close' : 'menu';
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  mobileMenu.inert = !isOpen;
  mobileMenu.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  headerBrand.inert = isOpen;
  pageRegions.forEach((region) => {
    region.inert = isOpen;
  });

  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!isExpanded);
});

menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

document.addEventListener('keydown', (event) => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

  if (event.key === 'Escape' && isExpanded) {
    setMenuOpen(false, true);
    return;
  }

  if (event.key === 'Tab' && isExpanded) {
    const firstLink = menuLinks[0];
    const lastLink = menuLinks[menuLinks.length - 1];

    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault();
      lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      menuToggle.focus();
    }
  }
});

const whatsappContact = document.querySelector('#whatsapp-contact');
const whatsappStatus = document.querySelector('#whatsapp-status');
if (whatsappUrl) {
  whatsappContact.href = whatsappUrl;
  whatsappContact.target = '_blank';
  whatsappContact.rel = 'noreferrer';
  whatsappContact.removeAttribute('aria-disabled');
  whatsappStatus.textContent = '';
} else {
  whatsappContact.classList.add('is-pending');
}

const socialContainer = document.querySelector('#social-links');
for (const { key, name, url } of socialLinks) {
  const link = document.createElement('a');
  link.className = 'social-link';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = name;
  link.setAttribute('aria-label', `Visitar ${name}`);
  link.dataset.channel = key;
  socialContainer.append(link);
}

document.documentElement.classList.add('page-ready');

const revealTargets = document.querySelectorAll('.property-card, .service-item, .process-step, .section-heading h2, .section-intro, .process-heading, .contact-copy, .contact-side');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroPhrase = document.querySelector('#hero-phrase');
const heroPhrases = ['funcione mejor.', 'se vea renovado.', 'cambie con vos.', 'gane nueva vida.'];

if (heroPhrase && !prefersReducedMotion) {
  let phraseIndex = 0;
  let phraseInterval;

  const startPhraseRotation = () => {
    window.clearInterval(phraseInterval);
    phraseInterval = window.setInterval(() => {
      heroPhrase.dataset.state = 'out';

      window.setTimeout(() => {
        phraseIndex = (phraseIndex + 1) % heroPhrases.length;
        heroPhrase.textContent = heroPhrases[phraseIndex];
        heroPhrase.dataset.state = 'in';
        window.setTimeout(() => delete heroPhrase.dataset.state, 380);
      }, 180);
    }, 3200);
  };

  startPhraseRotation();
  document.addEventListener('visibilitychange', () => {
    window.clearInterval(phraseInterval);
    if (!document.hidden) startPhraseRotation();
  });
}

if (prefersReducedMotion) {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
} else {
  let scrollFrame = 0;

  const updateScrollReveal = () => {
    scrollFrame = 0;
    const viewportHeight = window.innerHeight;
    const revealStart = viewportHeight * 0.9;
    const revealDistance = viewportHeight * 0.56;
    const revealThreshold = 0.8;

    revealTargets.forEach((element) => {
      const progress = Math.max(0, Math.min(1, (revealStart - element.getBoundingClientRect().top) / revealDistance));
      const opacityProgress = Math.max(0, Math.min(1, (progress - revealThreshold) / (1 - revealThreshold)));
      const remaining = 1 - opacityProgress;
      const lateralDirection = element.classList.contains('property-card')
        ? (element.matches(':nth-child(odd)') ? -1 : 1)
        : 0;

      element.style.setProperty('--scroll-reveal-progress', opacityProgress.toFixed(3));
      element.style.setProperty('--scroll-reveal-x', `${lateralDirection * 42 * remaining}px`);
      element.style.setProperty('--scroll-reveal-y', `${18 * remaining}px`);
      element.classList.toggle('is-visible', progress >= 1);
    });
  };

  const requestScrollRevealUpdate = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollReveal);
  };

  revealTargets.forEach((element) => element.classList.add('reveal-item'));
  updateScrollReveal();
  window.addEventListener('scroll', requestScrollRevealUpdate, { passive: true });
  window.addEventListener('resize', requestScrollRevealUpdate);
}