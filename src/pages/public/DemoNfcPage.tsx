import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Smartphone, Wifi } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { NFCExperience3D } from '@/scenes/NFCExperience/NFCExperience3D';

export function DemoNfcPage() {
  const { t } = useI18n();

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">
            {t('Demostración interactiva 3D', 'Interactive 3D Demonstration')}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
            {t('Experimenta el intercambio de identidad sin fricción', 'Experience frictionless identity sharing')}
          </h1>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            {t(
              'Manipula la tarjeta inteligente NEXID ONE en el espacio tridimensional y acércala al teléfono para observar cómo se activa el enlace NFC hacia el perfil profesional de Alex Rivera.',
              'Manipulate the NEXID ONE smart card in 3D space and bring it close to the smartphone to trigger the NFC link into Alex Rivera’s professional profile.',
            )}
          </p>
        </div>

        <NFCExperience3D />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-2">
            <Wifi className="h-5 w-5 text-[var(--accent-gold)]" />
            <h2 className="font-display text-base font-bold">
              {t('01. Detección por proximidad', '01. Proximity detection')}
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {t(
                'Al aproximar la tarjeta física a la antena superior del smartphone, el sistema lee el identificador persistente sin requerir apps instaladas.',
                'When bringing the physical card near the smartphone antenna, the device reads the persistent identifier with no extra apps needed.',
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-2">
            <Smartphone className="h-5 w-5 text-[var(--accent-gold)]" />
            <h2 className="font-display text-base font-bold">
              {t('02. Apertura instantánea', '02. Instant profile launch')}
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {t(
                'El visitante visualiza el portafolio, experiencia, enlaces verificados y botón de descarga directa de vCard.',
                'Visitors immediately see the portfolio, career history, verified links, and direct vCard download button.',
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3">
            <CheckCircle2 className="h-5 w-5 text-[var(--semantic-success)]" />
            <h2 className="font-display text-base font-bold">
              {t('03. Siempre actualizado', '03. Always up to date')}
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {t(
                'Cualquier cambio en el editor de NEXID ONE se refleja al instante sin reimprimir tarjetas ni alterar la URL.',
                'Any update made in the NEXID ONE editor reflects instantly without reprinting cards or changing URLs.',
              )}
            </p>
            <Link
              to="/demo/perfil/alex-rivera"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-gold)] hover:underline"
            >
              {t('Abrir perfil de Alex Rivera', 'Open Alex Rivera profile')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
