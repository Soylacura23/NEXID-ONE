import { AlertTriangle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export function LegalPage({ type }: { type: 'terms' | 'privacy' }) {
  const { t } = useI18n();
  const isTerms = type === 'terms';

  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-8">
        <div className="rounded-2xl border border-[var(--semantic-warning)]/40 bg-[var(--semantic-warning)]/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--semantic-warning)] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {t(
              'Borrador informativo sujeto a revisión legal profesional antes del lanzamiento comercial definitivo, adaptado al marco de protección de datos personales en Colombia (Ley 1581 de 2012 y decretos reglamentarios).',
              'Informational draft subject to formal legal counsel review prior to commercial launch, aligned with Colombian personal data protection principles (Law 1581 of 2012).',
            )}
          </p>
        </div>

        <header className="space-y-2 pb-6 border-b border-[var(--border-subtle)]">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">NEXID ONE · Legal</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {isTerms
              ? t('Términos y Condiciones de Uso (Borrador)', 'Terms of Service (Draft)')
              : t('Política de Tratamiento y Privacidad de Datos (Borrador)', 'Privacy & Data Policy (Draft)')}
          </h1>
          <p className="text-xs font-mono-tabular text-[var(--text-muted)]">
            {t('Versión prototipo · Noviembre 2026', 'Prototype release · November 2026')}
          </p>
        </header>

        {isTerms ? (
          <div className="space-y-6 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                1. {t('Objeto de la plataforma', 'Platform scope')}
              </h2>
              <p>
                {t(
                  'NEXID ONE provee herramientas digitales para crear, editar y compartir identidades profesionales mediante enlaces web, códigos QR y tarjetas vinculables. El contenido publicado en cada perfil es responsabilidad exclusiva de su titular.',
                  'NEXID ONE provides digital tools to create, edit, and share professional identities via web links, QR codes, and linkable cards. Content published on each profile is the sole responsibility of its owner.',
                )}
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                2. {t('Uso aceptable y enlaces externos', 'Acceptable use & external links')}
              </h2>
              <p>
                {t(
                  'No está permitido publicar material ilícito, suplantación de identidad ni enlaces maliciosos. NEXID ONE aplica saneamiento de URLs y controles de acceso por propietario.',
                  'Impersonation, unlawful content, and malicious links are prohibited. NEXID ONE enforces URL sanitization and strict owner access controls.',
                )}
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                3. {t('Planes ilustrativos y ausencia de cobros', 'Illustrative plans & no active billing')}
              </h2>
              <p>
                {t(
                  'En esta etapa prototipo no se procesan pagos en línea ni se contraen obligaciones de facturación automática.',
                  'In this prototype stage no online payments are processed and no automatic billing obligations apply.',
                )}
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                1. {t('Minimización y control del titular', 'Data minimization & owner control')}
              </h2>
              <p>
                {t(
                  'Recopilamos únicamente los datos necesarios para autenticar tu cuenta y renderizar las identidades que decidas publicar. El correo y teléfono dentro de una identidad permanecen ocultos salvo autorización explícita del usuario.',
                  'We collect only the data necessary to authenticate your account and render identities you choose to publish. Email and phone inside an identity stay hidden unless explicitly enabled.',
                )}
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                2. {t('Separación de datos públicos y privados', 'Public vs private data isolation')}
              </h2>
              <p>
                {t(
                  'Tus contactos guardados, borradores, identidades privadas y eventos analíticos están protegidos mediante reglas de seguridad en Cloud Firestore para impedir lecturas cruzadas entre cuentas.',
                  'Saved contacts, drafts, private identities, and analytics events are isolated by Cloud Firestore security rules to prevent cross-account reads.',
                )}
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                3. {t('Derechos de exportación y supresión', 'Export & deletion rights')}
              </h2>
              <p>
                {t(
                  'Desde el módulo de Ajustes puedes exportar tus datos y solicitar la eliminación de tu cuenta y registros asociados.',
                  'From Settings you can export your data and delete your account and associated records.',
                )}
              </p>
            </section>
          </div>
        )}
      </article>
    </MarketingLayout>
  );
}
