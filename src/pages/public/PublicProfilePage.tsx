import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { ALEX_RIVERA_PROFILE } from '@/data/demoData';
import { useI18n } from '@/contexts/I18nContext';
import { analyticsService, identityService } from '@/services/dataService';
import { AnalyticsSource, Identity } from '@/types/nexid';
import { ProfileRenderer } from '@/components/profiles/ProfileRenderer';
import { NexidLogo } from '@/components/ui/NexidLogo';

export function PublicProfilePage({ isAlexDemo = false }: { isAlexDemo?: boolean }) {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  const targetSlug = isAlexDemo ? 'alex-rivera' : slug || 'alex-rivera';
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const sourceParam = searchParams.get('src');
  const source: AnalyticsSource =
    sourceParam === 'nfc' ? 'nfc_redirect' : sourceParam === 'qr' ? 'qr' : 'web';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    if (targetSlug === 'alex-rivera' && isAlexDemo) {
      setIdentity(ALEX_RIVERA_PROFILE);
      setLoading(false);
      analyticsService.recordEvent({
        identityId: ALEX_RIVERA_PROFILE.id,
        identityOwnerId: ALEX_RIVERA_PROFILE.ownerId,
        eventType: 'profile_view',
        source,
      });
      return;
    }

    identityService
      .getPublicBySlug(targetSlug)
      .then((found) => {
        if (!active) return;
        if (!found) {
          setNotFound(true);
        } else {
          setIdentity(found);
          analyticsService.recordEvent({
            identityId: found.id,
            identityOwnerId: found.ownerId,
            eventType: 'profile_view',
            source,
          });
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [targetSlug, isAlexDemo, source]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Minimal non-intrusive public profile bar */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t('Volver a NEXID ONE', 'Back to NEXID ONE')}</span>
          </Link>

          {isAlexDemo && (
            <span className="text-xs font-medium text-[var(--accent-gold)]">
              {t('Perfil de demostración interactivo', 'Interactive demo profile')}
            </span>
          )}

          <Link to="/demo" className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            {t('Probar NFC 3D', 'Try 3D NFC')}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mx-auto max-w-4xl px-4 py-16 space-y-6">
          <div className="h-48 rounded-3xl bg-[var(--bg-surface)] animate-pulse" />
          <div className="h-8 w-64 rounded-lg bg-[var(--bg-surface)] animate-pulse" />
          <div className="h-32 rounded-2xl bg-[var(--bg-surface)] animate-pulse" />
        </div>
      ) : notFound || !identity ? (
        <div className="mx-auto max-w-lg px-4 py-24 text-center space-y-5">
          <div className="mx-auto h-12 w-12 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--accent-gold)]">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            {t('Identidad no disponible', 'Identity unavailable')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {t(
              'Este perfil no existe, fue archivado o su visibilidad está configurada como privada por su propietario.',
              'This profile does not exist, has been archived, or its visibility is set to private by its owner.',
            )}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/demo/perfil/alex-rivera"
              className="rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-ink)]"
            >
              {t('Ver perfil de ejemplo', 'View sample profile')}
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]"
            >
              {t('Ir al inicio', 'Go home')}
            </Link>
          </div>
          <div className="pt-8 flex justify-center">
            <NexidLogo variant="horizontal" size="sm" />
          </div>
        </div>
      ) : (
        <ProfileRenderer
          identity={identity}
          onTrackLinkClick={(linkId) =>
            analyticsService.recordEvent({
              identityId: identity.id,
              identityOwnerId: identity.ownerId,
              eventType: 'link_click',
              source,
              targetId: linkId,
            })
          }
          onTrackVCard={() =>
            analyticsService.recordEvent({
              identityId: identity.id,
              identityOwnerId: identity.ownerId,
              eventType: 'vcard_download',
              source,
            })
          }
          onTrackShare={() =>
            analyticsService.recordEvent({
              identityId: identity.id,
              identityOwnerId: identity.ownerId,
              eventType: 'share_action',
              source,
            })
          }
        />
      )}
    </div>
  );
}
