import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  QrCode,
  Share2,
  UserPlus,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { analyticsService, identityService } from '@/services/dataService';
import { Identity } from '@/types/nexid';
import {
  buildIdentityVCard,
  buildPublicProfileUrl,
  downloadDataUrl,
  downloadTextFile,
  generateQrPngDataUrl,
  generateQrSvgString,
  getPublicBaseUrl,
} from '@/utils/exportUtils';

export function ShareQrPage() {
  const { user, isCloudActive } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [identities, setIdentities] = useState<Identity[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [qrStyle, setQrStyle] = useState<'ivory' | 'obsidian'>('ivory');
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    identityService
      .listByOwner(user.uid, isCloudActive)
      .then((list) => {
        if (!active) return;
        setIdentities(list);
        const requested = searchParams.get('id');
        if (requested && list.some((i) => i.id === requested)) {
          setSelectedId(requested);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, isCloudActive, searchParams]);

  const selected = identities.find((i) => i.id === selectedId) || null;
  const targetUrl = selected ? buildPublicProfileUrl(selected.slug, selected.id === 'demo-alex-rivera') : '';

  useEffect(() => {
    if (!targetUrl) {
      setQrPngUrl('');
      setQrSvg('');
      return;
    }
    let active = true;
    const dark = qrStyle === 'ivory' ? '#101114' : '#F4F1EB';
    const light = qrStyle === 'ivory' ? '#F4F1EB' : '#101114';

    Promise.all([generateQrPngDataUrl(targetUrl, dark, light), generateQrSvgString(targetUrl, dark, light)]).then(
      ([png, svg]) => {
        if (!active) return;
        setQrPngUrl(png);
        setQrSvg(svg);
      },
    );

    return () => {
      active = false;
    };
  }, [targetUrl, qrStyle]);

  const handleCopy = async () => {
    if (!targetUrl || !selected) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      analyticsService.recordEvent({
        identityId: selected.id,
        identityOwnerId: selected.ownerId,
        eventType: 'share_action',
        source: 'web',
      });
      showToast({
        type: 'success',
        title: t('Enlace copiado', 'Link copied'),
        description: targetUrl,
      });
    } catch {
      showToast({ type: 'info', title: 'URL', description: targetUrl });
    }
  };

  const handleNativeShare = async () => {
    if (!selected || !targetUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selected.title} — NEXID ONE`,
          text: selected.profession,
          url: targetUrl,
        });
        analyticsService.recordEvent({
          identityId: selected.id,
          identityOwnerId: selected.ownerId,
          eventType: 'share_action',
          source: 'web',
        });
        return;
      } catch {
        // cancelled
      }
    }
    handleCopy();
  };

  const handleDownloadPng = () => {
    if (!qrPngUrl || !selected) return;
    downloadDataUrl(`nexid-qr-${selected.slug}.png`, qrPngUrl);
    showToast({ type: 'success', title: t('QR PNG descargado', 'QR PNG downloaded') });
  };

  const handleDownloadSvg = () => {
    if (!qrSvg || !selected) return;
    downloadTextFile(`nexid-qr-${selected.slug}.svg`, qrSvg, 'image/svg+xml;charset=utf-8');
    showToast({ type: 'success', title: t('QR SVG descargado', 'QR SVG downloaded') });
  };

  const handleDownloadVCard = () => {
    if (!selected) return;
    const vcf = buildIdentityVCard(selected);
    downloadTextFile(`${selected.slug}.vcf`, vcf, 'text/vcard;charset=utf-8');
    analyticsService.recordEvent({
      identityId: selected.id,
      identityOwnerId: selected.ownerId,
      eventType: 'vcard_download',
      source: 'web',
    });
    showToast({ type: 'success', title: t('vCard descargada', 'vCard downloaded') });
  };

  return (
    <DashboardLayout
      title={t('Compartir, QR y vCard', 'Share, QR & vCard')}
      breadcrumbs={[{ label: 'NEXID ONE', to: '/app/dashboard' }, { label: t('Compartir', 'Share') }]}
    >
      {loading ? (
        <div className="h-80 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-pulse" />
      ) : !selected ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
          <QrCode className="h-8 w-8 text-[var(--accent-gold)] mx-auto mb-3" />
          <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
            {t('Necesitas crear una identidad para generar su QR.', 'Create an identity first to generate its QR code.')}
          </p>
          <Link
            to="/app/identidades"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
          >
            {t('Ir a identidades', 'Go to identities')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Configuration */}
          <div className="lg:col-span-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                {t('Selecciona la identidad', 'Select identity')}
              </label>
              <select
                value={selected.id}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
              >
                {identities.map((idn) => (
                  <option key={idn.id} value={idn.id}>
                    {idn.title} — /{idn.slug}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                {t('URL pública del código QR', 'QR code target URL')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={targetUrl}
                  className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs font-mono-tabular text-[var(--text-primary)]"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] whitespace-nowrap shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[var(--semantic-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t('Copiado', 'Copied') : t('Copiar', 'Copy')}
                </button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {t('Dominio base activo:', 'Active base domain:')} {getPublicBaseUrl()}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                {t('Contraste del QR descargable', 'QR contrast theme')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setQrStyle('ivory')}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                    qrStyle === 'ivory'
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {t('Marfil sobre obsidiana', 'Ivory background')}
                </button>
                <button
                  type="button"
                  onClick={() => setQrStyle('obsidian')}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                    qrStyle === 'obsidian'
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {t('Obsidiana oscuro', 'Obsidian dark')}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)]"
              >
                <Download className="h-3.5 w-3.5" />
                {t('Descargar PNG', 'Download PNG')}
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
              >
                <FileCode2 className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                {t('Descargar SVG', 'Download SVG')}
              </button>
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
              >
                <UserPlus className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                {t('Descargar vCard (.vcf)', 'Download vCard (.vcf)')}
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
              >
                <Share2 className="h-3.5 w-3.5" />
                {t('Compartir', 'Share')}
              </button>
            </div>
          </div>

          {/* Right Live QR Card */}
          <div className="lg:col-span-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 flex flex-col items-center text-center">
            <p className="text-xs font-medium text-[var(--accent-gold)]">{t('Código QR real', 'Live QR code')}</p>
            <h3 className="mt-1 font-display text-lg font-bold text-[var(--text-primary)]">{selected.title}</h3>
            <p className="text-xs text-[var(--text-muted)]">{selected.profession}</p>

            <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] p-4 bg-[#101114]">
              {qrPngUrl ? (
                <img
                  src={qrPngUrl}
                  alt={`QR ${selected.title}`}
                  className="h-56 w-56 rounded-xl object-contain"
                />
              ) : (
                <div className="h-56 w-56 rounded-xl bg-[var(--bg-surface-alt)] animate-pulse" />
              )}
            </div>

            <Link
              to={selected.id === 'demo-alex-rivera' ? '/demo/perfil/alex-rivera' : `/perfil/${selected.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-gold)] hover:underline"
            >
              {t('Abrir destino público', 'Open public destination')}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-2 text-[11px] text-[var(--text-muted)] max-w-xs">
              {t(
                'Generar o descargar este código QR no suma escaneos ficticios; solo se registran aperturas reales del perfil.',
                'Generating or downloading this QR does not count as a scan; only actual profile visits are logged.',
              )}
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
