import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Layers,
  Palette,
  RefreshCw,
  Share2,
  Sparkles,
  UserCheck,
  Users,
  Briefcase,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { ALEX_RIVERA_PROFILE, COMMERCIAL_PLANS, FAQ_ITEMS } from '@/data/demoData';
import { useI18n } from '@/contexts/I18nContext';
import { TemplateId } from '@/types/nexid';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { Hero3DScene } from '@/scenes/HeroScene/Hero3DScene';
import { ProfileRenderer } from '@/components/profiles/ProfileRenderer';

export function LandingPage() {
  const { t } = useI18n();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('creative');
  const [openFaq, setOpenFaq] = useState<string>('faq-1');

  useEffect(() => {
    AOS.init({ duration: 550, once: true, offset: 40, easing: 'ease-out-cubic' });
  }, []);

  const benefits = [
    {
      icon: Layers,
      title: t('Identidad centralizada', 'Centralized identity'),
      desc: t(
        'Reúne portafolio, experiencia, enlaces y contacto en un único punto de acceso verificado.',
        'Unify portfolio, work history, links, and contact channels in one verified hub.',
      ),
    },
    {
      icon: RefreshCw,
      title: t('Actualización inmediata', 'Instant updates'),
      desc: t(
        'Modifica proyectos o datos cuando quieras; tus enlaces, códigos QR y tarjetas reflejan el cambio al instante.',
        'Update projects or details anytime; your links, QR codes, and cards reflect changes immediately.',
      ),
    },
    {
      icon: Share2,
      title: t('Compartición inteligente', 'Smart sharing'),
      desc: t(
        'Comparte mediante URL pública, código QR descargable en PNG/SVG, vCard o tarjeta NFC compatible.',
        'Share via public URL, downloadable PNG/SVG QR code, vCard, or compatible NFC card.',
      ),
    },
    {
      icon: Palette,
      title: t('Personalización real', 'True customization'),
      desc: t(
        'Elige entre cuatro plantillas con arquitecturas distintas, acentos de marca y control por sección.',
        'Choose from four structurally distinct templates, brand accents, and section controls.',
      ),
    },
    {
      icon: Users,
      title: t('Networking estructurado', 'Structured networking'),
      desc: t(
        'Registra contactos, organiza con etiquetas, añade notas de seguimiento y exporta en CSV o vCard.',
        'Store contacts, organize with tags, add follow-up notes, and export to CSV or vCard.',
      ),
    },
    {
      icon: BarChart3,
      title: t('Analítica transparente', 'Transparent analytics'),
      desc: t(
        'Observa visitas reales a tus perfiles, clics en enlaces, descargas vCard y redirecciones de tarjetas.',
        'Track observable profile views, link clicks, vCard downloads, and card redirects.',
      ),
    },
  ];

  const steps = [
    {
      num: '01',
      title: t('Crea tu identidad', 'Create your identity'),
      desc: t('Configura tu perfil profesional, académico o comercial en pocos minutos.', 'Set up your professional, academic, or commercial profile in minutes.'),
    },
    {
      num: '02',
      title: t('Personaliza tu perfil', 'Customize your profile'),
      desc: t('Selecciona plantilla, ordena secciones, agrega proyectos y define qué datos son públicos.', 'Choose a template, arrange sections, add projects, and set field privacy.'),
    },
    {
      num: '03',
      title: t('Comparte mediante QR o NFC', 'Share via QR or NFC'),
      desc: t('Descarga tu código QR real o vincula tu identidad a una tarjeta inteligente NEXID ONE.', 'Download your live QR code or link your identity to a NEXID ONE smart card.'),
    },
    {
      num: '04',
      title: t('Conecta con oportunidades', 'Connect with opportunities'),
      desc: t('Facilita el guardado de tu vCard sin fricción y da seguimiento a cada nueva conexión.', 'Let contacts save your vCard effortlessly and follow up on every connection.'),
    },
  ];

  const products = [
    {
      id: 'profile',
      name: 'NEXID ONE Profile',
      desc: t(
        'Perfiles profesionales digitales con slug único, portafolio interactivo y exportación vCard directa para visitantes.',
        'Digital professional profiles with custom slug, interactive portfolio, and direct visitor vCard export.',
      ),
      span: 'lg:col-span-2',
    },
    {
      id: 'card',
      name: 'NEXID ONE Card',
      desc: t(
        'Tarjetas inteligentes NFC con URL persistente (/t/codigo) y personalizador 3D en tiempo real.',
        'Smart NFC cards with persistent routing (/t/code) and real-time 3D finish customizer.',
      ),
      span: 'lg:col-span-1',
    },
    {
      id: 'studio',
      name: 'NEXID ONE Studio',
      desc: t(
        'Editor dividido con vista previa instantánea y cuatro plantillas estructurales adaptables.',
        'Split-screen editor with live preview and four structurally distinct templates.',
      ),
      span: 'lg:col-span-1',
    },
    {
      id: 'connect',
      name: 'NEXID ONE Connect',
      desc: t(
        'Gestor privado de contactos con etiquetas, notas de contexto y exportación CSV/vCard.',
        'Private contact CRM with tags, context notes, and CSV/vCard exports.',
      ),
      span: 'lg:col-span-1',
    },
    {
      id: 'insights',
      name: 'NEXID ONE Insights',
      desc: t(
        'Visualización de visitas, clics en enlaces y redirecciones por periodo mediante gráficos claros.',
        'Time-series analytics for profile visits, link clicks, and card redirects.',
      ),
      span: 'lg:col-span-1',
    },
    {
      id: 'teams',
      name: 'NEXID ONE Teams',
      desc: t(
        'Arquitectura preparada para administrar múltiples identidades corporativas con auditoría y gobernanza de marca.',
        'Architecture ready for managing corporate team identities with brand governance and audit trails.',
      ),
      span: 'lg:col-span-3',
    },
  ];

  const segments = [
    {
      icon: GraduationCap,
      title: t('Estudiantes', 'Students'),
      desc: t('Destaca formación, proyectos académicos, habilidades y certificaciones desde tu primer contacto.', 'Highlight education, academic projects, skills, and certifications from day one.'),
    },
    {
      icon: Briefcase,
      title: t('Profesionales', 'Professionals'),
      desc: t('Presenta trayectoria laboral, especialidades y contacto directo sin depender de tarjetas impresas.', 'Present work history, specialties, and direct contact without disposable paper cards.'),
    },
    {
      icon: Rocket,
      title: t('Emprendedores', 'Entrepreneurs'),
      desc: t('Comparte propuesta comercial, servicios, portafolio y canales de atención en un solo gesto.', 'Share commercial offers, services, portfolio, and communication channels in one tap.'),
    },
    {
      icon: Building2,
      title: t('Empresas', 'Enterprises'),
      desc: t('Estandariza la presencia institucional de equipos comerciales y directivos bajo una misma marca.', 'Standardize institutional presence across sales and leadership teams under one brand.'),
    },
  ];

  return (
    <MarketingLayout>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-semibold tracking-wide text-[var(--accent-gold)]">
                NEXID ONE · One identity. Infinite connections.
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.08] text-balance">
                {t(
                  'Tu identidad. Una conexión. Infinitas posibilidades.',
                  'Your identity. One connection. Infinite possibilities.',
                )}
              </h1>
              <p className="max-w-xl text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
                {t(
                  'Crea, personaliza y comparte tu identidad profesional desde una plataforma diseñada para conectar personas, proyectos y oportunidades.',
                  'Create, customize, and share your professional identity from a platform built to connect people, projects, and opportunities.',
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/registro"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{t('Crear mi identidad', 'Create my identity')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
                  <span>{t('Explorar demostración', 'Explore demo')}</span>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-muted)]">
                <span>{t('Enlaces web persistentes', 'Persistent web links')}</span>
                <span aria-hidden="true">·</span>
                <span>{t('Códigos QR PNG y SVG', 'PNG & SVG QR codes')}</span>
                <span aria-hidden="true">·</span>
                <span>{t('Tarjetas inteligentes NFC 3D', '3D Smart NFC cards')}</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Hero3DScene />
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM & SOLUTION CONVERGENCE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-aos="fade-up">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-semibold text-[var(--accent-gold)]">
              {t('Problema y solución', 'Problem & solution')}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              {t(
                'De enlaces dispersos y tarjetas caducas a una sola identidad viva',
                'From scattered links and static paper to one living identity',
              )}
            </h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              {t(
                'Tu trayectoria suele fragmentarse entre redes, repositorios, portafolios y tarjetas impresas que quedan obsoletas al cambiar de rol. NEXID ONE unifica todo en una presencia actualizable al instante.',
                'Your work is often split across social networks, repositories, portfolios, and printed cards that go stale. NEXID ONE unifies everything into an instantly updatable presence.',
              )}
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                {t('Antes · Información fragmentada', 'Before · Fragmented presence')}
              </p>
              <div className="space-y-2.5 text-sm text-[var(--text-muted)]">
                {['LinkedIn · Trayectoria aislada', 'GitHub · Repositorios sueltos', 'Behance · Portafolio aparte', 'Tarjetas impresas · Datos fijos', 'WhatsApp · Sin contexto previo'].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--accent-gold)]/50 bg-[var(--bg-surface)] p-6 flex flex-col justify-between space-y-5">
              <div>
                <p className="text-xs font-semibold text-[var(--accent-gold)]">
                  {t('Con NEXID ONE · Identidad centralizada', 'With NEXID ONE · Centralized identity')}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold">nexid.one/perfil/alex-rivera</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
                  {t(
                    'Portafolio, experiencia, enlaces verificados, vCard inmediata, QR y tarjeta NFC apuntando siempre a tu versión más reciente.',
                    'Portfolio, experience, verified links, instant vCard, QR, and NFC card always pointing to your latest profile.',
                  )}
                </p>
              </div>
              <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--semantic-success)]" />
                  <span>{t('Actualización en tiempo real sin reimprimir', 'Real-time updates with zero reprinting')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--semantic-success)]" />
                  <span>{t('Control granular de privacidad por campo', 'Granular per-field privacy controls')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mb-12" data-aos="fade-up">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Beneficios', 'Benefits')}</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {t('Diseñada para presentar tu valor profesional con claridad', 'Engineered to present your value with clarity')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                data-aos="fade-up"
                data-aos-delay={i * 50}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3"
              >
                <Icon className="h-5 w-5 text-[var(--accent-gold)]" />
                <h3 className="font-display text-lg font-bold">{b.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12" data-aos="fade-up">
          <div>
            <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Cómo funciona', 'How it works')}</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {t('Cuatro pasos hacia una presencia conectada', 'Four steps to a connected presence')}
            </h2>
          </div>
          <Link to="/como-funciona" className="text-sm font-semibold text-[var(--accent-gold)] hover:underline">
            {t('Ver guía completa', 'View full guide')}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              data-aos="fade-up"
              data-aos-delay={idx * 60}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3"
            >
              <span className="font-mono-tabular text-xs font-semibold text-[var(--accent-gold)]">{s.num}</span>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ECOSYSTEM PRODUCTS (Bento Hierarchy) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mb-12" data-aos="fade-up">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Ecosistema', 'Ecosystem')}</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {t('Seis módulos integrados en una misma arquitectura', 'Six modules integrated into one architecture')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {products.map((prod, idx) => (
            <div
              key={prod.id}
              data-aos="fade-up"
              data-aos-delay={idx * 40}
              className={`${prod.span} rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between gap-4`}
            >
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">{prod.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{prod.desc}</p>
              </div>
              <Link
                to="/soluciones"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-gold)] hover:underline"
              >
                {t('Explorar solución', 'Explore solution')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SEGMENTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mb-12" data-aos="fade-up">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Segmentos', 'Segments')}</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {t('Adaptado a cada etapa profesional', 'Built for every career stage')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {segments.map((seg, i) => {
            const Icon = seg.icon;
            return (
              <div
                key={seg.title}
                data-aos="fade-up"
                data-aos-delay={i * 50}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3"
              >
                <Icon className="h-5 w-5 text-[var(--accent-gold)]" />
                <h3 className="font-display text-lg font-bold">{seg.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{seg.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. NFC 3D DEMO CALLOUT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div
          data-aos="fade-up"
          className="rounded-3xl border border-[var(--accent-gold)]/40 bg-[#17191D] p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-[#F4F1EB]"
        >
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold text-[#D5B47A]">
              {t('Demostración NFC en 3D', '3D NFC Demonstration')}
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
              {t('Acerca la tarjeta al teléfono y descubre la experiencia NEXID ONE', 'Bring the card near the phone and experience NEXID ONE')}
            </h2>
            <p className="text-sm sm:text-base text-[#A6ABB4] leading-relaxed">
              {t(
                'Prueba nuestra escena tridimensional interactiva con mouse o pantalla táctil y explora el perfil completo de Alex Rivera.',
                'Try our interactive 3D stage with mouse or touch and explore Alex Rivera’s live digital identity.',
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D5B47A] px-6 py-3 text-sm font-semibold text-[#101114] hover:bg-[#E8D2A7] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t('Probar conexión', 'Try connection')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/demo/perfil/alex-rivera"
              className="inline-flex items-center gap-2 rounded-xl border border-[#34373D] px-5 py-3 text-sm font-medium text-[#F4F1EB] hover:bg-[#202329] transition-colors whitespace-nowrap shrink-0"
            >
              <UserCheck className="h-4 w-4 text-[#D5B47A]" />
              <span>{t('Ver perfil de Alex', 'View Alex profile')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. LIVE TEMPLATE SWITCHER SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10" data-aos="fade-up">
          <div>
            <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Personalización', 'Customization')}</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {t('Cuatro arquitecturas de perfil en un clic', 'Four profile architectures in one click')}
            </h2>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
            {(['creative', 'executive', 'minimal', 'tech'] as TemplateId[]).map((tpl) => (
              <button
                key={tpl}
                type="button"
                onClick={() => setSelectedTemplate(tpl)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors whitespace-nowrap shrink-0 ${
                  selectedTemplate === tpl
                    ? 'bg-[var(--accent-gold)] text-[var(--accent-ink)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tpl}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/30 overflow-hidden">
          <ProfileRenderer
            preview
            identity={{
              ...ALEX_RIVERA_PROFILE,
              templateId: selectedTemplate,
            }}
          />
        </div>
      </section>

      {/* 9. PRICING PROPOSAL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mb-12" data-aos="fade-up">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Propuesta comercial', 'Commercial proposal')}</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {t('Planes diseñados para escalar contigo', 'Plans structured to scale with you')}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {t(
              'Los planes mostrados son una referencia comercial informativa. Esta versión no procesa pagos en línea.',
              'Displayed plans are an illustrative commercial proposal. This release does not process online payments.',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {COMMERCIAL_PLANS.map((plan) => (
            <div
              key={plan.id}
              data-aos="fade-up"
              className={`rounded-2xl border p-6 flex flex-col justify-between gap-6 ${
                plan.id === 'professional'
                  ? 'border-[var(--accent-gold)] bg-[var(--bg-surface)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  <span className="text-xs font-medium text-[var(--accent-gold)]">
                    {t(plan.badgeEs, plan.badgeEn)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{t(plan.audienceEs, plan.audienceEn)}</p>
                <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  {t(plan.priceLabelEs, plan.priceLabelEn)}
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t(plan.summaryEs, plan.summaryEn)}</p>
                <ul className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)]">
                  {plan.features.map((feat) => (
                    <li key={feat.labelEs} className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="text-[var(--text-muted)]">{t(feat.labelEs, feat.labelEn)}</span>
                      <span className="font-medium text-[var(--text-primary)] text-right">
                        {t(feat.valueEs, feat.valueEn)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/precios"
                className="w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-center text-sm font-semibold hover:border-[var(--accent-gold)] transition-colors"
              >
                {t('Comparar detalles', 'Compare details')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10" data-aos="fade-up">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Preguntas frecuentes', 'FAQ')}</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
            {t('Respuestas directas sobre la plataforma', 'Clear answers about the platform')}
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.slice(0, 5).map((item) => {
            const expanded = openFaq === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(expanded ? '' : item.id)}
                  aria-expanded={expanded}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-display text-sm sm:text-base font-semibold">
                    {t(item.questionEs, item.questionEn)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--text-muted)] shrink-0 transition-transform ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expanded && (
                  <div className="px-5 pb-4 text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                    {t(item.answerEs, item.answerEn)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/faq" className="text-sm font-semibold text-[var(--accent-gold)] hover:underline">
            {t('Ver todas las preguntas frecuentes', 'View all FAQs')}
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
