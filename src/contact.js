const SOCIAL_CHANNELS = [
  { key: 'instagram', name: 'Instagram' },
  { key: 'whatsapp', name: 'WhatsApp' },
  { key: 'facebook', name: 'Facebook' }
];

export function buildWhatsAppUrl(phoneNumber, message) {
  let phone = phoneNumber.replace(/\D/g, '');

  if (phone.startsWith('54') && !phone.startsWith('549') && phone.length === 12) {
    phone = `549${phone.slice(2)}`;
  } else if (phone.startsWith('0')) {
    phone = phone.slice(1);
    if (phone.length === 10) phone = `549${phone}`;
  } else if (phone.length === 10) {
    phone = `549${phone}`;
  } else if (phone.length === 8) {
    phone = `54911${phone}`;
  }

  if (phone.length < 8 || phone.length > 15) {
    return null;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getActiveSocialLinks(urls) {
  return SOCIAL_CHANNELS
    .filter(({ key }) => urls[key])
    .map(({ key, name }) => ({ key, name, url: urls[key] }));
}