import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { COMMERCIAL_PLANS } from '@/data/demoData';
import { useI18n } from '@/contexts/I18nContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export function PricingPage() {
  const { t } = useI18n();

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-12">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">
            {t('Propuesta de planes', 'Proposed tiers')}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
            {t('Estructura comercial informativa de NEXID ONE', 'NEXID ONE illustrative commercial tiers')}
          </h1>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            {t(
              'Conoce los niveles proyectados para uso personal, profesional y corporativo.',
              'Review projected tiers for personal, professional, and enterprise use.',
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-[var(--semantic-info)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--text-secondary)]">
            {t(
              'Nota transparente: en esta primera versión prototipo los planes son estrictamente informativos. No existen cobros reales ni pasarelas de pago activadas.',
              'Transparency notice: in this initial prototype release, tiers are strictly informational. No live payments or billing gateways are active.',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {COMMERCIAL_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-7 flex flex-col justify-between gap-8 ${
                plan.id === 'professional'
                  ? 'border-[var(--accent-gold)] bg-[var(--bg-surface)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
                  <span className="text-xs font-semibold text-[var(--accent-gold)]">
                    {t(plan.badgeEs, plan.badgeEn)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{t(plan.audienceEs, plan.audienceEn)}</p>
                <p className="font-display text-lg font-semibold">
                  {t(plan.priceLabelEs, plan.priceLabelEn)}
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {t(plan.summaryEs, plan.summaryEn)}
                </p>
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                  {plan.features.map((f) => (
                    <div key={f.labelEs} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-[var(--text-muted)]">{t(f.labelEs, f.labelEn)}</span>
                      <span className="font-medium text-right">{t(f.valueEs, f.valueEn)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to={plan.id === 'business' ? '/contacto' : '/registro'}
                className={`w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${
                  plan.id === 'professional'
                    ? 'bg-[var(--accent-gold)] text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)]'
                    : 'border border-[var(--border-subtle)] hover:border-[var(--accent-gold)]'
                }`}
              >
                {plan.id === 'business'
                  ? t('Consultar propuesta empresarial', 'Inquire about Business')
                  : t('Probar plataforma', 'Try platform')}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
