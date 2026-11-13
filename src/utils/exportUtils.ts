import QRCode from 'qrcode';
import { Contact, Identity } from '@/types/nexid';

/**
 * Returns the configured production public base URL or falls back to window.location.origin.
 */
export function getPublicBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;
  if (configured && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://nexid-one.vercel.app';
}

export function buildPublicProfileUrl(slug: string, isDemo = false): string {
  const base = getPublicBaseUrl();
  if (isDemo || slug === 'alex-rivera') {
    return `${base}/demo/perfil/${encodeURIComponent(slug)}`;
  }
  return `${base}/perfil/${encodeURIComponent(slug)}`;
}

export function buildCardRedirectUrl(publicCode: string): string {
  return `${getPublicBaseUrl()}/t/${encodeURIComponent(publicCode)}`;
}

/**
 * Validates and normalizes external URLs, blocking javascript:, data:, or vbscript: payloads.
 */
export function sanitizeExternalUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/**
 * Generates a valid vCard (.vcf) string from an Identity.
 */
export function buildIdentityVCard(identity: Identity): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(identity.title)}`,
    identity.company ? `ORG:${escapeVCard(identity.company)}` : '',
    `TITLE:${escapeVCard(identity.profession)}`,
    identity.showEmail && identity.publicEmail ? `EMAIL;TYPE=WORK:${escapeVCard(identity.publicEmail)}` : '',
    identity.showPhone && identity.publicPhone ? `TEL;TYPE=CELL:${escapeVCard(identity.publicPhone)}` : '',
    identity.website ? `URL:${escapeVCard(identity.website)}` : `URL:${buildPublicProfileUrl(identity.slug, identity.id === 'demo-alex-rivera')}`,
    identity.location ? `ADR;TYPE=WORK:;;${escapeVCard(identity.location)};;;;` : '',
    identity.bio ? `NOTE:${escapeVCard(identity.bio)}` : '',
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\r\n');
}

export function buildContactVCard(contact: Contact): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(contact.name)}`,
    contact.organization ? `ORG:${escapeVCard(contact.organization)}` : '',
    contact.role ? `TITLE:${escapeVCard(contact.role)}` : '',
    contact.email ? `EMAIL;TYPE=WORK:${escapeVCard(contact.email)}` : '',
    contact.phone ? `TEL;TYPE=CELL:${escapeVCard(contact.phone)}` : '',
    contact.notes ? `NOTE:${escapeVCard(contact.notes)}` : '',
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\r\n');
}

function escapeVCard(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(filename: string, dataUrl: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportContactsToCsv(contacts: Contact[]): string {
  const headers = ['Nombre', 'Organización', 'Cargo', 'Correo', 'Teléfono', 'Etiquetas', 'Notas', 'Fecha de creación'];
  const escapeCell = (value: string) => `"${(value || '').replace(/"/g, '""')}"`;
  const rows = contacts.map((c) => [
    escapeCell(c.name),
    escapeCell(c.organization || ''),
    escapeCell(c.role || ''),
    escapeCell(c.email || ''),
    escapeCell(c.phone || ''),
    escapeCell((c.tags || []).join(' | ')),
    escapeCell(c.notes || ''),
    escapeCell(c.createdAt),
  ]);
  return [headers.map(escapeCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export async function generateQrPngDataUrl(targetUrl: string, darkColor = '#101114', lightColor = '#F4F1EB'): Promise<string> {
  return QRCode.toDataURL(targetUrl, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
}

export async function generateQrSvgString(targetUrl: string, darkColor = '#101114', lightColor = '#F4F1EB'): Promise<string> {
  return QRCode.toString(targetUrl, {
    type: 'svg',
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
}
