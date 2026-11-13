import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CreditCard,
  GraduationCap,
  IdCard,
  Palette,
  Rocket,
  Users,
  Briefcase,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export function SolutionsPage() {
  const { t } = useI18n();

  const modules = [
    {
      icon: IdCard,
      name: 'NEXID ONE Profile',
      tagline: t('Perfiles digitales con URL única', 'Digital profiles with custom slug'),
      desc: t(
        'Centraliza biografía, trayectoria laboral, formación, portafolio visual y descarga vCard sin necesidad de cuentas para quien visita tu perfil.',
        'Centralize bio, career history, education, visual portfolio, and frictionless visitor vCard download.',
      ),
    },
    {
      icon: CreditCard,
      name: 'NEXID ONE Card',
      tagline: t('Tarjetas inteligentes NFC y rutas /t/:codigo', 'Smart NFC cards & /t/:code routing'),
      desc: t(
        'Administra tarjetas virtuales con personalizador 3D en tiempo real, cambia la identidad vinculada sin reimprimir y separa emisión física segura.',
        'Manage virtual cards with a real-time 3D customizer, switch linked identities without reprinting, and enforce secure physical issuance.',
      ),
    },
    {
      icon: Palette,
      name: 'NEXID ONE Studio',
      tagline: t('Editor dividido con vista previa instantánea', 'Split-screen editor with live preview'),
      desc: t(
        'Alterna entre las plantillas Executive, Minimal, Creative y Tech, edita proyectos y controla la visibilidad privada de correo y teléfono.',
        'Switch across Executive, Minimal, Creative, and Tech templates, edit projects, and manage private field visibility.',
      ),
    },
    {
      icon: Users,
      name: 'NEXID ONE Connect',
      tagline: t('Gestor privado de contactos', 'Private networking CRM'),
      desc: t(
        'Organiza tus nuevas conexiones por etiquetas y notas de seguimiento, con exportación directa a CSV y vCard estándar.',
        'Organize new connections by tags and notes with direct CSV and standard vCard exports.',
      ),
    },
    {
      icon: BarChart3,
      name: 'NEXID ONE Insights',
      tagline: t('Analítica observable por periodo', 'Time-series observable analytics'),
      desc: t(
        'Consulta aperturas de perfil, clics en enlaces, descargas vCard y redirecciones de tarjetas filtradas por identidad y ventana temporal.',
        'Review profile views, link clicks, vCard downloads, and card redirects filtered by identity and date range.',
      ),
    },
    {
      icon: Building2,
      name: 'NEXID ONE Teams',
      tagline: t('Gobernanza de identidades corporativas', 'Corporate identity governance'),
      desc: t(
        'Base arquitectónica orientada a empresas con auditoría administrativa, lineamientos visuales consistentes y control de acceso basado en roles.',
        'Enterprise-ready architecture featuring audit trails, consistent brand guidelines, and role-based access control.',
      ),
    },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: t('Estudiantes y recién graduados', 'Students & graduates'),
      points: [
        t('Portafolio académico y certificaciones en un enlace limpio', 'Academic portfolio and certifications in one clean link'),
        t('Plantilla Minimal optimizada para hojas de vida digitales', 'Minimal template tailored for digital resumes'),
      ],
    },
    {
      icon: Briefcase,
      title: t('Profesionales independientes', 'Independent professionals'),
      points: [
        t('Descarga inmediata de vCard en reuniones y conferencias', 'Instant vCard saving at meetings and conferences'),
        t('Control de privacidad para correo y teléfono personal', 'Privacy toggles for personal email and phone'),
      ],
    },
    {
      icon: Rocket,
      title: t('Emprendedores y estudios', 'Founders & studios'),
      points: [
        t('Separación de identidad comercial y perfil personal', 'Separate commercial brand and personal profiles'),
        t('Códigos QR de alta resolución listos para empaques o stands', 'High-resolution QR codes ready for packaging or booths'),
      ],
    },
    {
      icon: Building2,
      title: t('Empresas y equipos', 'Companies & teams'),
      points: [
        t('Reasignación rápida de tarjetas cuando cambian cargos', 'Rapid card reassignment when team roles change'),
        t('Panel de auditoría y consistencia institucional', 'Audit trail and institutional consistency'),
      ],
    },
  ];

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-16">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Soluciones', 'Solutions')}</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
            {t('Un ecosistema completo para gestionar tu presencia profesional', 'A complete ecosystem for managing professional presence')}
          </h1>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            {t(
              'Cada componente de NEXID ONE resuelve una etapa concreta del ciclo de presentación, compartición y seguimiento.',
              'Each NEXID ONE module addresses a specific stage of identity presentation, sharing, and follow-up.',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3"
              >
                <Icon className="h-5 w-5 text-[var(--accent-gold)]" />
                <h2 className="font-display text-lg font-bold">{m.name}</h2>
                <p className="text-xs font-medium text-[var(--accent-gold)]">{m.tagline}</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-8 border-t border-[var(--border-subtle)] space-y-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            {t('Aplicaciones por segmento', 'Solutions by audience')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audiences.map((aud) => {
              const Icon = aud.icon;
              return (
                <div
                  key={aud.title}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--accent-gold)]" />
                    <h3 className="font-display text-lg font-bold">{aud.title}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                    {aud.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <span className="text-[var(--accent-gold)]" aria-hidden="true">·</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold">
              {t('¿Listo para ver el flujo en acción?', 'Ready to see the workflow live?')}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {t('Explora la demostración 3D o entra al modo presentación.', 'Try the 3D demonstration or launch showcase mode.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)]"
            >
              <span>{t('Probar NFC 3D', 'Try 3D NFC')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/showcase"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-medium"
            >
              <span>{t('Abrir Showcase', 'Open Showcase')}</span>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
