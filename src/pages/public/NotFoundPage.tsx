import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useI18n } from '@/contexts/I18nContext';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center space-y-5">
        <p className="font-mono-tabular text-sm font-semibold text-[var(--accent-gold)]">404</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
          {t('Página no encontrada', 'Page not found')}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t(
            'La ruta solicitada no existe o fue movida dentro de NEXID ONE.',
            'The requested route does not exist or has been moved inside NEXID ONE.',
          )}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-5 py-2.5 text-xs font-semibold text-[var(--accent-ink)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('Volver al inicio', 'Back home')}
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center rounded-xl border border-[var(--border-subtle)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary)]"
          >
            {t('Ver Demo 3D', 'View 3D Demo')}
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
