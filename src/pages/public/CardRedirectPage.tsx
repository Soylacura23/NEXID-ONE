import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { analyticsService, cardService, identityService } from '@/services/dataService';
import { NexidLogo } from '@/components/ui/NexidLogo';

export function CardRedirectPage() {
  const { codigoPublico } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [errorState, setErrorState] = useState<'loading' | 'not_found' | 'unlinked'>('loading');

  useEffect(() => {
    let active = true;
    const code = codigoPublico || '';

    async function resolve() {
      try {
        const card = await cardService.resolvePublicCode(code);
        if (!active) return;

        if (!card || card.status === 'disabled') {
          setErrorState('not_found');
          return;
        }
        if (card.status === 'unlinked' || (!card.identitySlug && !card.identityId)) {
          setErrorState('unlinked');
          return;
        }

        const slug = card.identitySlug || 'alex-rivera';
        const targetIdentity = await identityService.getPublicBySlug(slug);
        if (!active) return;

        if (!targetIdentity) {
          setErrorState('unlinked');
          return;
        }

        await analyticsService.recordEvent({
          identityId: targetIdentity.id,
          identityOwnerId: targetIdentity.ownerId,
          eventType: 'card_redirect',
          source: 'nfc_redirect',
          targetId: card.publicCode,
        });

        const path =
          targetIdentity.slug === 'alex-rivera'
            ? '/demo/perfil/alex-rivera?src=nfc'
            : `/perfil/${encodeURIComponent(targetIdentity.slug)}?src=nfc`;
        navigate(path, { replace: true });
      } catch {
        if (active) setErrorState('not_found');
      }
    }

    resolve();
    return () => {
      active = false;
    };
  }, [codigoPublico, navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center space-y-5">
        <div className="flex justify-center">
          <NexidLogo variant="horizontal" size="md" />
        </div>

        {errorState === 'loading' ? (
          <>
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--accent-gold)] border-t-transparent animate-spin" />
            <h1 className="font-display text-lg font-bold">
              {t('Resolviendo tarjeta NEXID ONE...', 'Resolving NEXID ONE card...')}
            </h1>
            <p className="text-xs font-mono-tabular text-[var(--text-muted)]">{codigoPublico}</p>
          </>
        ) : errorState === 'unlinked' ? (
          <>
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--semantic-warning)]/15 text-[var(--semantic-warning)] flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <h1 className="font-display text-xl font-bold">
              {t('Tarjeta aún sin identidad vinculada', 'Card not linked yet')}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {t(
                'Esta tarjeta está registrada pero su propietario aún no ha asociado un perfil público activo.',
                'This card is registered but its owner has not linked an active public profile yet.',
              )}
            </p>
            <Link
              to="/"
              className="inline-block rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-ink)]"
            >
              {t('Explorar NEXID ONE', 'Explore NEXID ONE')}
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--semantic-error)]/15 text-[var(--semantic-error)] flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h1 className="font-display text-xl font-bold">
              {t('Tarjeta no encontrada o desactivada', 'Card not found or disabled')}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {t(
                'El código público solicitado no corresponde a una tarjeta activa en la plataforma.',
                'The requested public code does not match an active card on the platform.',
              )}
            </p>
            <Link
              to="/demo"
              className="inline-block rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-ink)]"
            >
              {t('Ir a la demostración 3D', 'Go to 3D Demo')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
