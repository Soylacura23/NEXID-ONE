import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Globe,
  IdCard,
  LayoutDashboard,
  List,
  QrCode,
  X,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProfileRenderer } from '@/components/profiles/ProfileRenderer';
import { NexidLogo } from '@/components/ui/NexidLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { ALEX_RIVERA_PROFILE, DEMO_INITIAL_CARDS } from '@/data/demoData';
import { CardCustomizer3D } from '@/scenes/CardCustomizer/CardCustomizer3D';
import { Hero3DScene } from '@/scenes/HeroScene/Hero3DScene';
import { NFCExperience3D } from '@/scenes/NFCExperience/NFCExperience3D';
import { CardFinish, CardLayoutStyle, TemplateId } from '@/types/nexid';
import { buildPublicProfileUrl, generateQrPngDataUrl } from '@/utils/exportUtils';

const SHOWCASE_CHART_SAMPLE = [
  { day: 'D1', views: 1, clicks: 0 },
  { day: 'D2', views: 2, clicks: 1 },
  { day: 'D3', views: 2, clicks: 2 },
  { day: 'D4', views: 4, clicks: 3 },
  { day: 'D5', views: 3, clicks: 2 },
  { day: 'D6', views: 5, clicks: 4 },
  { day: 'D7', views: 6, clicks: 5 },
];

export function ShowcasePage() {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();
  const { t, lang, toggleLang } = useI18n();

  const [stepIndex, setStepIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Interactive showcase states reusing real controls
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId>('creative');
  const [cardFinish, setCardFinish] = useState<CardFinish>('obsidian');
  const [cardLayout, setCardLayout] = useState<CardLayoutStyle>('monogram');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const url = buildPublicProfileUrl('alex-rivera', true);
    generateQrPngDataUrl(url, '#101114', '#F4F1EB').then(setQrDataUrl);
  }, []);

  const steps = [
    {
      id: 'intro',
      title: t('Introducción', 'Introduction'),
      subtitle: t('Identidad digital ejecutiva y conectividad NFC/QR', 'Executive digital identity & NFC/QR connectivity'),
    },
    {
      id: 'problem',
      title: t('Problema y solución', 'Problem & Solution'),
      subtitle: t('Por qué el networking tradicional queda obsoleto', 'Why paper cards fall short for modern teams'),
    },
    {
      id: 'products',
      title: t('Productos y arquitectura', 'Products & Architecture'),
      subtitle: t('Perfiles multi-plantilla, tarjetas virtuales y CRM', 'Multi-template profiles, virtual cards & CRM'),
    },
    {
      id: 'nfc-3d',
      title: t('Demostración NFC 3D', '3D NFC Demonstration'),
      subtitle: t('Simulador físico-digital interactivo con Three.js', 'Interactive Three.js proximity & tap simulation'),
    },
    {
      id: 'alex',
      title: t('Perfil de Alex Rivera', 'Alex Rivera Profile'),
      subtitle: t('Identidad pública completa lista para compartir', 'Complete public identity ready to share'),
    },
    {
      id: 'editor',
      title: t('Editor de identidades', 'Identity Editor'),
      subtitle: t('4 plantillas estructurales en tiempo real', '4 live structural templates'),
    },
    {
      id: 'cards',
      title: t('Vinculación de tarjetas', 'Card Linking & 3D Finish'),
      subtitle: t('Personaliza acabado y apunta /t/codigo al perfil activo', 'Customize finish and route /t/code dynamically'),
    },
    {
      id: 'qr',
      title: t('Código QR y vCard', 'QR Code & vCard'),
      subtitle: t('Exportación real en PNG, SVG y contacto .vcf', 'Real PNG, SVG and .vcf export'),
    },
    {
      id: 'dashboard',
      title: t('Dashboard operativo', 'Operational Dashboard'),
      subtitle: t('Control centralizado de identidades, tarjetas y contactos', 'Unified control of identities, cards & contacts'),
    },
    {
      id: 'insights',
      title: t('Estadísticas reales', 'Real Insights'),
      subtitle: t('Métricas transparentes sin eventos inventados', 'Transparent observable metrics without invented numbers'),
    },
  ];

  const current = steps[stepIndex];
  const prev = () => setStepIndex((i) => Math.max(0, i - 1));
  const next = () => setStepIndex((i) => Math.min(steps.length - 1, i + 1));

  const openInteractiveDemoWorkspace = async () => {
    await enterDemoMode();
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F4F1EB] flex flex-col">
      {/* Top Presentation Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#34373D] bg-[#101114]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NexidLogo variant="horizontal" size="sm" />
          <span className="hidden sm:inline-block text-xs text-[#8B919B]">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-[#D5B47A]">
            NEXID ONE Showcase
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tabular text-[#A6ABB4] mr-1">
            {stepIndex + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#34373D] px-3 py-1.5 text-xs font-medium text-[#F4F1EB] hover:bg-[#202329]"
          >
            <List className="h-3.5 w-3.5 text-[#D5B47A]" />
            <span className="hidden sm:inline">{t('Índice', 'Steps')}</span>
          </button>
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1 rounded-xl border border-[#34373D] px-2.5 py-1.5 text-xs font-medium text-[#A6ABB4] hover:text-[#F4F1EB]"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang.toUpperCase()}
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#34373D] px-3 py-1.5 text-xs font-medium text-[#A6ABB4] hover:text-[#F4F1EB]"
          >
            <X className="h-3.5 w-3.5" />
            {t('Salir', 'Exit')}
          </Link>
        </div>
      </header>

      {/* Jump-to-step Drawer */}
      {menuOpen && (
        <div className="border-b border-[#34373D] bg-[#17191D] px-4 sm:px-6 py-4">
          <div className="mx-auto max-w-6xl grid grid-cols-2 sm:grid-cols-5 gap-2">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStepIndex(idx);
                  setMenuOpen(false);
                }}
                className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                  idx === stepIndex
                    ? 'border-[#D5B47A] bg-[#D5B47A]/10 text-[#F4F1EB]'
                    : 'border-[#34373D] text-[#A6ABB4] hover:border-[#494E57]'
                }`}
              >
                <span className="font-mono-tabular text-[#D5B47A]">{idx + 1}.</span> {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col">
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#D5B47A]">
            {t('Paso', 'Step')} {stepIndex + 1} · {current.title}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#F4F1EB]">
            {current.subtitle}
          </h1>
        </div>

        <div className="flex-1">
          {stepIndex === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <p className="text-base sm:text-lg text-[#C9CDD6] leading-relaxed">
                  {t(
                    'NEXID ONE unifica tarjetas NFC, códigos QR dinámicos, perfiles públicos multi-plantilla y gestión de contactos en una plataforma SaaS lista para operar.',
                    'NEXID ONE unifies NFC cards, dynamic QR codes, multi-template public profiles, and contact management in a production-ready SaaS platform.',
                  )}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl border border-[#34373D] bg-[#17191D] p-4">
                    <p className="font-display text-2xl font-bold text-[#D5B47A] tabular-nums">4</p>
                    <p className="text-xs text-[#A6ABB4] mt-1">{t('Plantillas estructurales', 'Structural templates')}</p>
                  </div>
                  <div className="rounded-2xl border border-[#34373D] bg-[#17191D] p-4">
                    <p className="font-display text-2xl font-bold text-[#D5B47A] tabular-nums">NFC + QR</p>
                    <p className="text-xs text-[#A6ABB4] mt-1">{t('Enlace /t/codigo + vCard', '/t/code routing + vCard')}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 h-[360px] rounded-2xl border border-[#34373D] bg-[#17191D] overflow-hidden">
                <Hero3DScene />
              </div>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#34373D] bg-[#17191D] p-6 space-y-3">
                <p className="text-xs font-semibold text-[#F87171]">{t('Limitación tradicional', 'Traditional friction')}</p>
                <h2 className="font-display text-xl font-bold">{t('Tarjetas impresas estáticas', 'Static printed business cards')}</h2>
                <ul className="space-y-2.5 text-sm text-[#A6ABB4]">
                  <li>· {t('Si cambia el cargo o teléfono, toda la tirada queda obsoleta.', 'Role or phone changes invalidate entire print batches.')}</li>
                  <li>· {t('Sin portafolio interactivo ni descarga inmediata al móvil.', 'No interactive portfolio or 1-tap smartphone contact save.')}</li>
                  <li>· {t('No permite separar identidad corporativa, creativa o académica.', 'Cannot separate corporate, creative, or academic contexts.')}</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#D5B47A]/40 bg-[#17191D] p-6 space-y-3">
                <p className="text-xs font-semibold text-[#34D399]">{t('Arquitectura NEXID ONE', 'NEXID ONE Architecture')}</p>
                <h2 className="font-display text-xl font-bold">{t('Identidad viva, modular y trazable', 'Live, modular, trackable identity')}</h2>
                <ul className="space-y-2.5 text-sm text-[#C9CDD6]">
                  <li>· {t('Actualizas una vez y cualquier tarjeta o QR apunta al instante.', 'Update once and every linked card or QR reflects it immediately.')}</li>
                  <li>· {t('Reasignación de tarjetas /t/codigo entre distintas identidades.', 'Reassign /t/code cards seamlessly between identities.')}</li>
                  <li>· {t('Descarga nativa de vCard (.vcf), QR PNG/SVG y CRM de contactos.', 'Native vCard (.vcf), QR PNG/SVG export, and contact CRM.')}</li>
                </ul>
              </div>
            </div>
          )}

          {stepIndex === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: IdCard,
                  title: t('Identidades multi-contexto', 'Multi-context identities'),
                  desc: t(
                    'Crea perfiles independientes para rol ejecutivo, consultoría, portafolio creativo o trayectoria académica.',
                    'Create dedicated profiles for executive, consulting, creative, or academic roles.',
                  ),
                },
                {
                  icon: CreditCard,
                  title: t('Tarjetas NFC virtuales 3D', 'Virtual 3D NFC cards'),
                  desc: t(
                    'Personaliza acabados Obsidian, Graphite, Gold o Ivory en 3D y gestiona códigos cortos /t/codigo.',
                    'Customize Obsidian, Graphite, Gold or Ivory finishes in 3D and manage /t/code links.',
                  ),
                },
                {
                  icon: QrCode,
                  title: t('QR, vCard y Agenda CRM', 'QR, vCard & CRM'),
                  desc: t(
                    'Exporta códigos QR vectoriales, tarjetas de contacto .vcf y administra contactos en CSV.',
                    'Export vector QR codes, .vcf contact cards, and manage CRM contacts in CSV.',
                  ),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-[#34373D] bg-[#17191D] p-6 space-y-3">
                    <Icon className="h-6 w-6 text-[#D5B47A]" />
                    <h3 className="font-display text-lg font-bold">{item.title}</h3>
                    <p className="text-sm text-[#A6ABB4] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {stepIndex === 3 && (
            <NFCExperience3D onExploreProfile={() => setStepIndex(4)} />
          )}

          {stepIndex === 4 && (
            <div className="rounded-2xl border border-[#34373D] bg-[#17191D] max-h-[68vh] overflow-y-auto">
              <ProfileRenderer identity={ALEX_RIVERA_PROFILE} preview />
            </div>
          )}

          {stepIndex === 5 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {(['executive', 'minimal', 'tech', 'creative'] as TemplateId[]).map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                      previewTemplate === tpl
                        ? 'bg-[#D5B47A] text-[#101114]'
                        : 'border border-[#34373D] text-[#A6ABB4] hover:text-[#F4F1EB]'
                    }`}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-[#34373D] bg-[#17191D] max-h-[60vh] overflow-y-auto">
                <ProfileRenderer identity={{ ...ALEX_RIVERA_PROFILE, templateId: previewTemplate }} preview />
              </div>
            </div>
          )}

          {stepIndex === 6 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <CardCustomizer3D
                  displayName={ALEX_RIVERA_PROFILE.title}
                  roleLabel={ALEX_RIVERA_PROFILE.profession}
                  publicCode={DEMO_INITIAL_CARDS[0].publicCode}
                  finish={cardFinish}
                  layoutStyle={cardLayout}
                />
              </div>
              <div className="lg:col-span-5 rounded-2xl border border-[#34373D] bg-[#17191D] p-6 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#A6ABB4]">{t('Acabado 3D', '3D Finish')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['obsidian', 'graphite', 'gold', 'ivory'] as CardFinish[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setCardFinish(f)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${
                          cardFinish === f ? 'border-[#D5B47A] bg-[#D5B47A]/15 text-[#F4F1EB]' : 'border-[#34373D] text-[#A6ABB4]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#A6ABB4]">{t('Composición frontal', 'Front layout')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['monogram', 'minimal', 'executive'] as CardLayoutStyle[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setCardLayout(l)}
                        className={`rounded-xl border px-2 py-2 text-xs font-semibold capitalize ${
                          cardLayout === l ? 'border-[#D5B47A] bg-[#D5B47A]/15 text-[#F4F1EB]' : 'border-[#34373D] text-[#A6ABB4]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {stepIndex === 7 && (
            <div className="rounded-2xl border border-[#34373D] bg-[#17191D] p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="rounded-2xl border border-[#34373D] bg-[#101114] p-4 shrink-0">
                {qrDataUrl && <img src={qrDataUrl} alt="QR Alex Rivera" className="h-52 w-52 rounded-xl" />}
              </div>
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold">{t('Distribución inmediata sin fricción', 'Zero-friction instant distribution')}</h2>
                <p className="text-sm text-[#A6ABB4] leading-relaxed">
                  {t(
                    'Cada identidad genera un código QR real de alta legibilidad descargable en PNG o SVG, junto con tarjeta vCard (.vcf) compatible con iOS y Android.',
                    'Every identity generates a scannable PNG/SVG QR code along with a standard .vcf contact card compatible with iOS and Android.',
                  )}
                </p>
                <Link
                  to="/demo/perfil/alex-rivera"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D5B47A] px-4 py-2.5 text-xs font-semibold text-[#101114]"
                >
                  {t('Abrir perfil demo de Alex Rivera', 'Open Alex Rivera demo profile')}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {stepIndex === 8 && (
            <div className="rounded-2xl border border-[#34373D] bg-[#17191D] p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold">{t('Panel SaaS completamente operativo', 'Fully operational SaaS console')}</h2>
                  <p className="text-sm text-[#A6ABB4] mt-1">
                    {t(
                      'Accede al Modo Demo con un clic o inicia sesión con Google para sincronizar en Firebase Firestore.',
                      'Enter Demo Mode in one click or sign in with Google to sync directly with Firebase Firestore.',
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openInteractiveDemoWorkspace}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D5B47A] px-5 py-3 text-xs font-semibold text-[#101114] whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('Abrir Dashboard Demo en vivo', 'Open live Demo Dashboard')}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: t('Identidades demo', 'Demo identities'), value: '2' },
                  { label: t('Tarjetas NFC', 'NFC cards'), value: '2' },
                  { label: t('Contactos CRM', 'CRM contacts'), value: '3' },
                  { label: t('Persistencia', 'Persistence'), value: 'Firestore + Local' },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-[#34373D] bg-[#101114] p-4">
                    <p className="text-xs text-[#8B919B]">{m.label}</p>
                    <p className="mt-2 font-display text-lg font-bold text-[#D5B47A] tabular-nums">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stepIndex === 9 && (
            <div className="rounded-2xl border border-[#34373D] bg-[#17191D] p-6 space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold">
                  {t('Ejemplo visual de métricas (solo eventos reales en producción)', 'Visual metrics sample (only real events in production)')}
                </h2>
                <p className="text-xs text-[#A6ABB4] mt-1">
                  {t(
                    'En el dashboard real, cada barra y línea proviene únicamente de aperturas reales, clics en enlaces, descargas vCard y redirecciones /t/codigo.',
                    'Inside the live dashboard, charts reflect real profile views, link clicks, vCard downloads, and /t/code redirects.',
                  )}
                </p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SHOWCASE_CHART_SAMPLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(166,171,180,0.16)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#8B919B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#8B919B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#101114',
                        border: '1px solid #34373D',
                        borderRadius: '12px',
                        color: '#F4F1EB',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="views" name={t('Visitas', 'Views')} stroke="#D5B47A" fill="#D5B47A" fillOpacity={0.22} />
                    <Area type="monotone" dataKey="clicks" name={t('Clics', 'Clicks')} stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Step Controls */}
      <footer className="sticky bottom-0 z-30 border-t border-[#34373D] bg-[#101114]/95 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={prev}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#34373D] px-4 py-2 text-xs font-semibold text-[#F4F1EB] disabled:opacity-40 hover:bg-[#202329]"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('Anterior', 'Previous')}
          </button>

          <div className="hidden md:flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={s.title}
                onClick={() => setStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex ? 'w-6 bg-[#D5B47A]' : 'w-2 bg-[#34373D] hover:bg-[#525863]'
                }`}
              />
            ))}
          </div>

          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D5B47A] px-4 py-2 text-xs font-semibold text-[#101114] hover:bg-[#E7CFA2]"
            >
              {t('Siguiente', 'Next')}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={openInteractiveDemoWorkspace}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D5B47A] px-4 py-2 text-xs font-semibold text-[#101114] hover:bg-[#E7CFA2]"
            >
              {t('Entrar a NEXID ONE', 'Enter NEXID ONE')}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
