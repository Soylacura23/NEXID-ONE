import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CreditCard, IdCard, QrCode, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export function HelpCenterPage() {
  const { t } = useI18n();

  const guides = [
    {
      id: 'getting-started',
      icon: BookOpen,
      title: t('Primeros pasos y Onboarding', 'Getting started & Onboarding'),
      summary: t(
        'Cómo iniciar sesión en un clic con Google o explorar el modo Demo, completar los 4 pasos de bienvenida y publicar tu primera identidad.',
        'How to sign in with Google or launch Demo mode, complete the 4-step welcome flow, and publish your first identity.',
      ),
      steps: [
        t('Ingresa desde /login con tu cuenta de Google o activa el espacio Demo instantáneo.', 'Sign in via /login with Google or launch Instant Demo mode.'),
        t('Define tu nombre público, profesión y elige una de las 4 plantillas disponibles.', 'Set your display name, profession, and select one of the 4 templates.'),
        t('Publica tu identidad para obtener tu enlace público /perfil/:slug.', 'Publish your identity to unlock your public /perfil/:slug link.'),
      ],
    },
    {
      id: 'editor',
      icon: IdCard,
      title: t('Uso del Editor de Identidades', 'Using the Identity Editor'),
      summary: t(
        'Organiza proyectos, experiencia, educación, habilidades y controla la visibilidad privada de correo y teléfono.',
        'Organize projects, work history, education, skills, and control private email/phone visibility.',
      ),
      steps: [
        t('En escritorio visualizas los controles a la izquierda y la vista previa viva a la derecha.', 'On desktop you edit on the left while previewing live on the right.'),
        t('Los campos de correo y teléfono solo se muestran al público si activas su casilla explícita.', 'Email and phone only appear publicly when explicitly toggled on.'),
        t('Guarda tus cambios o alterna entre estado Borrador, Publicada y Archivada.', 'Save updates or switch between Draft, Published, and Archived statuses.'),
      ],
    },
    {
      id: 'cards-nfc',
      icon: CreditCard,
      title: t('Tarjetas Virtuales vs Físicas', 'Virtual vs Physical Cards'),
      summary: t(
        'Aprende cómo funciona la redirección /t/:codigoPublico, el personalizador 3D y los límites de seguridad entre tarjetas virtuales y físicas.',
        'Learn how /t/:publicCode redirection, the 3D customizer, and security boundaries between virtual and physical cards work.',
      ),
      steps: [
        t('Crea tarjetas virtuales en /app/tarjetas y personaliza su acabado 3D en vivo.', 'Create virtual cards in /app/tarjetas and customize their 3D finish live.'),
        t('Asocia cualquier identidad publicada y prueba la redirección desde la misma vista.', 'Link any published identity and test the live redirect right away.'),
        t('Las tarjetas físicas reales requieren emisión controlada y activación por token de un solo uso.', 'Real physical cards require controlled issuance and single-use token activation.'),
      ],
    },
    {
      id: 'qr-export',
      icon: QrCode,
      title: t('Códigos QR, vCard y Exportación', 'QR Codes, vCard & Exports'),
      summary: t(
        'Genera códigos QR reales en PNG/SVG y exporta contactos en CSV o formato vCard estándar (.vcf).',
        'Generate real PNG/SVG QR codes and export contacts in CSV or standard vCard (.vcf) format.',
      ),
      steps: [
        t('Accede a /app/compartir para elegir una identidad publicada y descargar su QR.', 'Visit /app/compartir to select a published identity and download its QR.'),
        t('Los visitantes de tu perfil pueden descargar tu .vcf sin tener cuenta en NEXID ONE.', 'Profile visitors can download your .vcf without creating a NEXID ONE account.'),
        t('En /app/contactos puedes exportar toda tu libreta en CSV o tarjetas individuales.', 'In /app/contactos you can export your entire network to CSV or individual vCards.'),
      ],
    },
  ];

  const [activeId, setActiveId] = useState(guides[0].id);
  const current = guides.find((g) => g.id === activeId) || guides[0];

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Centro de ayuda', 'Help Center')}</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            {t('Guías operativas de NEXID ONE', 'NEXID ONE Operational Guides')}
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            {t('Documentación práctica para aprovechar cada módulo de la plataforma.', 'Practical documentation for every module in the platform.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-2">
            {guides.map((g) => {
              const Icon = g.icon;
              const selected = g.id === activeId;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveId(g.id)}
                  className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition-colors ${
                    selected
                      ? 'border-[var(--accent-gold)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4 text-[var(--accent-gold)] shrink-0" />
                  <span className="font-display text-sm font-semibold">{g.title}</span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold">{current.title}</h2>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">{current.summary}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
              {current.steps.map((st, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="font-mono-tabular text-xs font-bold text-[var(--accent-gold)] mt-1">
                    0{idx + 1}
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{st}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <ShieldCheck className="h-4 w-4 text-[var(--semantic-success)]" />
                <span>{t('Seguridad aplicada mediante reglas Firestore', 'Protected via Firestore security rules')}</span>
              </div>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-gold)] hover:underline"
              >
                {t('¿Necesitas soporte adicional?', 'Need additional support?')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
