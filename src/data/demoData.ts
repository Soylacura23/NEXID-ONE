import alexAvatar from '@/assets/images/alex_rivera_avatar_1794534905337.jpg';
import alexCover from '@/assets/images/alex_rivera_cover_1794534905786.jpg';
import projectAether from '@/assets/images/project_aether_ui_1794534906624.jpg';
import projectKinetix from '@/assets/images/project_kinetix_brand_1794534907720.jpg';
import projectLumina from '@/assets/images/project_lumina_arch_1794534907831.jpg';
import { AppNotification, Card, Contact, Identity } from '@/types/nexid';

export const DEMO_IMAGES = {
  alexAvatar,
  alexCover,
  projectAether,
  projectKinetix,
  projectLumina,
};

export const ALEX_RIVERA_PROFILE: Identity = {
  id: 'demo-alex-rivera',
  ownerId: 'demo-user',
  slug: 'alex-rivera',
  identityType: 'creative',
  title: 'Alex Rivera',
  profession: 'Diseñador digital y desarrollador web',
  company: 'Rivera Studio',
  location: 'Bogotá / Remoto',
  bio: 'Creo experiencias digitales donde el diseño y la tecnología se encuentran. Especializado en sistemas de diseño, interfaces SaaS de alta precisión y productos web interactivos.',
  photoURL: alexAvatar,
  coverURL: alexCover,
  publicEmail: 'contacto@alexrivera.ejemplo',
  publicPhone: '+57 300 000 0194',
  website: 'https://nexid-one.ejemplo/demo/perfil/alex-rivera',
  showEmail: true,
  showPhone: false,
  templateId: 'creative',
  accentColor: '#D5B47A',
  coverStyle: 'editorial',
  buttonStyle: 'solid',
  visibility: 'public',
  status: 'published',
  links: [
    {
      id: 'lnk-1',
      label: 'Portafolio de Diseño',
      platform: 'behance',
      url: 'https://www.behance.net/',
      enabled: true,
      order: 1,
    },
    {
      id: 'lnk-2',
      label: 'GitHub',
      platform: 'github',
      url: 'https://github.com/',
      enabled: true,
      order: 2,
    },
    {
      id: 'lnk-3',
      label: 'LinkedIn Profesional',
      platform: 'linkedin',
      url: 'https://www.linkedin.com/',
      enabled: true,
      order: 3,
    },
    {
      id: 'lnk-4',
      label: 'Instagram Studio',
      platform: 'instagram',
      url: 'https://www.instagram.com/',
      enabled: true,
      order: 4,
    },
  ],
  projects: [
    {
      id: 'prj-1',
      title: 'Aether Wealth UI System',
      category: 'Producto SaaS & Fintech',
      description:
        'Sistema de diseño y arquitectura visual para plataforma de análisis financiero en tiempo real, con enfoque en legibilidad tabular y modo oscuro de alto contraste.',
      imageURL: projectAether,
      projectURL: 'https://nexid-one.ejemplo/demo/perfil/alex-rivera',
      technologies: ['React', 'TypeScript', 'Design Tokens', 'Recharts'],
      order: 1,
    },
    {
      id: 'prj-2',
      title: 'Kinetix Smart Card Identity',
      category: 'Hardware & Marca',
      description:
        'Dirección de arte, empaque minimalista y experiencia digital vinculada para tarjetas metálicas de presentación corporativa sin contacto.',
      imageURL: projectKinetix,
      projectURL: 'https://nexid-one.ejemplo/demo/perfil/alex-rivera',
      technologies: ['Branding', 'WebGL', 'Three.js', 'UX'],
      order: 2,
    },
    {
      id: 'prj-3',
      title: 'Lumina Monograph Architecture',
      category: 'Editorial & Web',
      description:
        'Portafolio digital interactivo para firma de arquitectura contemporánea con grilla suiza, tipografía editorial y transiciones fluidas.',
      imageURL: projectLumina,
      projectURL: 'https://nexid-one.ejemplo/demo/perfil/alex-rivera',
      technologies: ['Vite', 'Tailwind CSS', 'Motion', 'Accesibilidad'],
      order: 3,
    },
  ],
  experience: [
    {
      id: 'exp-1',
      position: 'Lead Product Designer & Frontend Engineer',
      organization: 'Rivera Digital Studio',
      startDate: '2023',
      endDate: 'Actualidad',
      description:
        'Diseño de producto de extremo a extremo, construcción de design systems y desarrollo de aplicaciones web escalables para startups B2B.',
    },
    {
      id: 'exp-2',
      position: 'Senior UI/UX Designer',
      organization: 'Nexo Lab Tecnología',
      startDate: '2020',
      endDate: '2023',
      description:
        'Liderazgo de interfaces para herramientas analíticas, prototipado interactivo y pruebas de usabilidad con equipos multidisciplinarios.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Universidad Nacional de Diseño e Ingeniería',
      program: 'Especialización en Interacción Digital y Arquitectura Web',
      dates: '2018 – 2020',
      description: 'Proyecto de grado enfocado en identidad digital accesible y sistemas modulares.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'UI/UX Architecture', category: 'Diseño', order: 1 },
    { id: 'sk-2', name: 'React & TypeScript', category: 'Ingeniería', order: 2 },
    { id: 'sk-3', name: 'Design Systems', category: 'Diseño', order: 3 },
    { id: 'sk-4', name: 'Three.js & WebGL', category: 'Interacción', order: 4 },
    { id: 'sk-5', name: 'Tailwind CSS', category: 'Ingeniería', order: 5 },
    { id: 'sk-6', name: 'Product Strategy', category: 'Estrategia', order: 6 },
  ],
  sectionOrder: ['projects', 'experience', 'skills', 'education', 'links'],
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-11-10T14:30:00.000Z',
  publishedAt: '2026-01-16T09:00:00.000Z',
};

export const DEMO_ACADEMIC_PROFILE: Identity = {
  id: 'demo-alex-academic',
  ownerId: 'demo-user',
  slug: 'alex-rivera-academico',
  identityType: 'academic',
  title: 'Alex Rivera — Perfil Académico',
  profession: 'Investigador en Interacción Humano-Computador y Frontend',
  company: 'Semillero de Diseño Computacional',
  location: 'Medellín, Colombia',
  bio: 'Identidad enfocada en publicaciones académicas, ponencias universitarias, formación y proyectos de investigación aplicada.',
  photoURL: alexAvatar,
  coverURL: alexCover,
  publicEmail: 'investigacion@alexrivera.ejemplo',
  publicPhone: '',
  website: 'https://nexid-one.ejemplo/perfil/alex-rivera-academico',
  showEmail: true,
  showPhone: false,
  templateId: 'minimal',
  accentColor: '#D5B47A',
  coverStyle: 'minimal',
  buttonStyle: 'outline',
  visibility: 'public',
  status: 'published',
  links: [
    {
      id: 'alnk-1',
      label: 'Repositorio de Investigación',
      platform: 'github',
      url: 'https://github.com/',
      enabled: true,
      order: 1,
    },
    {
      id: 'alnk-2',
      label: 'Perfil Académico LinkedIn',
      platform: 'linkedin',
      url: 'https://www.linkedin.com/',
      enabled: true,
      order: 2,
    },
  ],
  projects: [
    {
      id: 'aprj-1',
      title: 'Accesibilidad en Interfaces 3D Web',
      category: 'Artículo de Investigación',
      description:
        'Evaluación de patrones de navegación por teclado y alternativas semánticas para experiencias WebGL educativas y comerciales.',
      imageURL: projectLumina,
      projectURL: 'https://nexid-one.ejemplo/demo/perfil/alex-rivera',
      technologies: ['WCAG 2.2', 'WebGL', 'HCI'],
      order: 1,
    },
  ],
  experience: [
    {
      id: 'aexp-1',
      position: 'Docente Invitado — Diseño de Producto Digital',
      organization: 'Facultad de Arquitectura y Diseño',
      startDate: '2024',
      endDate: 'Actualidad',
      description: 'Acompañamiento de proyectos de grado en diseño de sistemas e interfaces web.',
    },
  ],
  education: [
    {
      id: 'aedu-1',
      institution: 'Universidad Nacional de Diseño e Ingeniería',
      program: 'Maestría en Medios Interactivos',
      dates: '2021 – 2023',
      description: 'Tesis laureada sobre centralización de portafolios digitales.',
    },
  ],
  skills: [
    { id: 'ask-1', name: 'Investigación UX', category: 'Metodología', order: 1 },
    { id: 'ask-2', name: 'Accesibilidad WCAG', category: 'Estándares', order: 2 },
    { id: 'ask-3', name: 'Visualización de Datos', category: 'Ingeniería', order: 3 },
  ],
  sectionOrder: ['education', 'projects', 'experience', 'skills', 'links'],
  createdAt: '2026-02-01T10:00:00.000Z',
  updatedAt: '2026-11-08T12:00:00.000Z',
  publishedAt: '2026-02-02T09:00:00.000Z',
};

export const DEMO_INITIAL_CARDS: Card[] = [
  {
    id: 'demo-card-1',
    ownerId: 'demo-user',
    publicCode: 'NX-ALEX-01',
    identityId: 'demo-alex-rivera',
    identitySlug: 'alex-rivera',
    displayName: 'ALEX RIVERA',
    roleLabel: 'Product Designer & Web Dev',
    finish: 'obsidian',
    layoutStyle: 'monogram',
    status: 'active',
    cardType: 'virtual',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 'demo-card-2',
    ownerId: 'demo-user',
    publicCode: 'NX-ACAD-02',
    identityId: 'demo-alex-academic',
    identitySlug: 'alex-rivera-academico',
    displayName: 'ALEX RIVERA',
    roleLabel: 'Academic & Research',
    finish: 'graphite',
    layoutStyle: 'executive',
    status: 'active',
    cardType: 'virtual',
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-11-09T10:00:00.000Z',
  },
];

export const DEMO_INITIAL_CONTACTS: Contact[] = [
  {
    id: 'demo-cnt-1',
    ownerId: 'demo-user',
    name: 'Camila Mendoza',
    organization: 'Estudio Nómada',
    role: 'Directora de Operaciones',
    email: 'camila@studionomada.ejemplo',
    phone: '+57 310 000 1122',
    tags: ['Cliente potencial', 'Diseño'],
    notes: 'Interesada en rediseño de plataforma SaaS en Q1.',
    createdAt: '2026-10-18T14:20:00.000Z',
    updatedAt: '2026-10-18T14:20:00.000Z',
  },
  {
    id: 'demo-cnt-2',
    ownerId: 'demo-user',
    name: 'Mateo Salcedo',
    organization: 'Vértice Ventures',
    role: 'Socio de Tecnología',
    email: 'mateo@vertice.ejemplo',
    phone: '+57 315 000 3344',
    tags: ['Evento', 'Inversión'],
    notes: 'Contacto intercambiado durante demostración NFC en encuentro tech.',
    createdAt: '2026-11-02T17:10:00.000Z',
    updatedAt: '2026-11-02T17:10:00.000Z',
  },
  {
    id: 'demo-cnt-3',
    ownerId: 'demo-user',
    name: 'Laura Pardo',
    organization: 'Arquitectura Aura',
    role: 'Arquitecta Principal',
    email: 'laura@aura.ejemplo',
    phone: '+57 318 000 5566',
    tags: ['Portafolio', 'Colaboración'],
    notes: 'Consultó por portafolio editorial y tarjetas para su equipo.',
    createdAt: '2026-11-06T09:45:00.000Z',
    updatedAt: '2026-11-06T09:45:00.000Z',
  },
];

export const DEMO_INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'demo-notif-1',
    ownerId: 'demo-user',
    type: 'identity_published',
    title: 'Identidad publicada',
    message: 'Tu perfil profesional «Alex Rivera» está disponible mediante enlace público y código QR.',
    read: false,
    actionPath: '/demo/perfil/alex-rivera',
    createdAt: '2026-11-10T14:30:00.000Z',
  },
  {
    id: 'demo-notif-2',
    ownerId: 'demo-user',
    type: 'card_linked',
    title: 'Tarjeta virtual vinculada',
    message: 'La tarjeta virtual NX-ALEX-01 apunta correctamente a tu identidad principal.',
    read: true,
    actionPath: '/app/tarjetas',
    createdAt: '2026-11-09T11:15:00.000Z',
  },
];

export interface PlanComparisonItem {
  id: string;
  name: string;
  audienceEs: string;
  audienceEn: string;
  badgeEs: string;
  badgeEn: string;
  priceLabelEs: string;
  priceLabelEn: string;
  summaryEs: string;
  summaryEn: string;
  features: {
    labelEs: string;
    labelEn: string;
    valueEs: string;
    valueEn: string;
  }[];
}

export const COMMERCIAL_PLANS: PlanComparisonItem[] = [
  {
    id: 'free',
    name: 'Free',
    audienceEs: 'Para estudiantes y uso inicial',
    audienceEn: 'For students & getting started',
    badgeEs: 'Propuesta Esencial',
    badgeEn: 'Essential Proposal',
    priceLabelEs: 'Sin costo (Propuesta inicial)',
    priceLabelEn: 'Free tier (Proposed)',
    summaryEs: 'Ideal para centralizar tu primera identidad profesional y compartirla mediante enlace o código QR.',
    summaryEn: 'Ideal for centralizing your first professional identity and sharing it via link or QR code.',
    features: [
      { labelEs: 'Identidades digitales', labelEn: 'Digital identities', valueEs: '1 identidad activa', valueEn: '1 active identity' },
      { labelEs: 'Plantillas de diseño', labelEn: 'Design templates', valueEs: 'Minimal y Executive', valueEn: 'Minimal & Executive' },
      { labelEs: 'Compartición QR y vCard', labelEn: 'QR & vCard sharing', valueEs: 'Incluido (PNG / SVG)', valueEn: 'Included (PNG / SVG)' },
      { labelEs: 'Tarjetas virtuales demo', labelEn: 'Virtual demo cards', valueEs: '1 tarjeta virtual', valueEn: '1 virtual card' },
      { labelEs: 'Gestor de contactos', labelEn: 'Contact manager', valueEs: 'Hasta 50 contactos', valueEn: 'Up to 50 contacts' },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    audienceEs: 'Para profesionales y creativos',
    audienceEn: 'For professionals & creatives',
    badgeEs: 'Recomendado',
    badgeEn: 'Recommended',
    priceLabelEs: 'Plan comercial propuesto',
    priceLabelEn: 'Proposed commercial tier',
    summaryEs: 'Diseñado para quienes manejan múltiples facetas profesionales, portafolios completos y analítica avanzada.',
    summaryEn: 'Built for multi-faceted professionals managing rich portfolios, cards, and engagement insights.',
    features: [
      { labelEs: 'Identidades digitales', labelEn: 'Digital identities', valueEs: 'Hasta 5 identidades', valueEn: 'Up to 5 identities' },
      { labelEs: 'Plantillas de diseño', labelEn: 'Design templates', valueEs: '4 plantillas completas', valueEn: 'All 4 templates' },
      { labelEs: 'Compartición QR y vCard', labelEn: 'QR & vCard sharing', valueEs: 'Personalización completa', valueEn: 'Full customization' },
      { labelEs: 'Tarjetas NFC vinculables', labelEn: 'Linkable NFC cards', valueEs: 'Virtuales + físicas registradas', valueEn: 'Virtual + registered physical' },
      { labelEs: 'NEXID ONE Insights', labelEn: 'NEXID ONE Insights', valueEs: 'Analítica por periodo', valueEn: 'Time-series analytics' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    audienceEs: 'Para empresas y equipos',
    audienceEn: 'For companies & teams',
    badgeEs: 'Escala Corporativa',
    badgeEn: 'Corporate Scale',
    priceLabelEs: 'Cotización institucional',
    priceLabelEn: 'Institutional quote',
    summaryEs: 'Administración centralizada de identidades corporativas, control de marca, tarjetas de equipo y auditoría.',
    summaryEn: 'Centralized corporate identity governance, brand consistency, team cards, and audit logs.',
    features: [
      { labelEs: 'Identidades digitales', labelEn: 'Digital identities', valueEs: 'Ilimitadas por equipo', valueEn: 'Unlimited per team' },
      { labelEs: 'Plantillas corporativas', labelEn: 'Corporate templates', valueEs: 'Gobernanza de marca', valueEn: 'Brand governance' },
      { labelEs: 'Tarjetas de equipo', labelEn: 'Team NFC cards', valueEs: 'Emisión y reasignación', valueEn: 'Issuance & reassignment' },
      { labelEs: 'Exportación y CRM', labelEn: 'CRM & exports', valueEs: 'CSV / vCard consolidado', valueEn: 'Consolidated CSV / vCard' },
      { labelEs: 'Auditoría y roles', labelEn: 'Audit & roles', valueEs: 'Registro de auditoría', valueEn: 'Audit trail & RBAC' },
    ],
  },
];

export interface FaqItem {
  id: string;
  category: 'general' | 'nfc' | 'privacy' | 'plans';
  questionEs: string;
  questionEn: string;
  answerEs: string;
  answerEn: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    questionEs: '¿Qué es exactamente NEXID ONE?',
    questionEn: 'What exactly is NEXID ONE?',
    answerEs:
      'Es una plataforma SaaS de identidad digital profesional que centraliza tu perfil, portafolio, trayectoria y medios de contacto en un enlace único compartible vía web, código QR o tarjeta NFC inteligente.',
    answerEn:
      'It is a professional digital identity SaaS platform that centralizes your profile, portfolio, career history, and contact channels in a single link shareable via web, QR code, or smart NFC card.',
  },
  {
    id: 'faq-2',
    category: 'nfc',
    questionEs: '¿Cómo funciona la conexión con tarjetas NFC?',
    questionEn: 'How does NFC card connection work?',
    answerEs:
      'Una tarjeta NFC compatible almacena la URL persistente (/t/codigoPublico) de tu tarjeta NEXID ONE. Al acercarla a un teléfono compatible, el navegador abre el perfil publicado vinculado sin necesidad de instalar aplicaciones adicionales.',
    answerEn:
      'A compatible NFC card stores your persistent NEXID ONE redirect URL (/t/publicCode). Tapping it against a compatible smartphone opens your linked published profile with no extra app required.',
  },
  {
    id: 'faq-3',
    category: 'nfc',
    questionEs: '¿Qué teléfonos son compatibles con NFC y códigos QR?',
    questionEn: 'Which smartphones support NFC and QR codes?',
    answerEs:
      'La mayoría de teléfonos Android modernos e iPhone (desde iPhone XS en adelante de forma nativa en segundo plano, y iPhone 7+ con lector) detectan enlaces NFC. Además, todos los dispositivos con cámara pueden escanear el código QR incluido.',
    answerEn:
      'Most modern Android phones and iPhones (iPhone XS and newer natively in background, iPhone 7+ with reader) detect NFC links. Additionally, any device with a camera can scan the included QR code.',
  },
  {
    id: 'faq-4',
    category: 'general',
    questionEs: 'Si actualizo mi perfil, ¿debo cambiar mi tarjeta o mi código QR?',
    questionEn: 'If I update my profile, do I need to replace my card or QR?',
    answerEs:
      'No. La tarjeta y el código QR apuntan a una dirección estable de NEXID ONE. Cualquier ajuste en tus proyectos, cargo o enlaces se refleja de inmediato para quienes visiten tu perfil.',
    answerEn:
      'No. Both your card and QR code point to a persistent NEXID ONE address. Any update to your projects, role, or links appears immediately for visitors.',
  },
  {
    id: 'faq-5',
    category: 'privacy',
    questionEs: '¿Cómo se protege mi privacidad y mis datos de contacto?',
    questionEn: 'How are my privacy and contact details protected?',
    answerEs:
      'Tú decides qué campos mostrar públicamente (como correo o teléfono) y si una identidad es pública o privada. Las reglas de seguridad en Firestore restringen el acceso de perfiles privados, contactos y analíticas exclusivamente a su propietario.',
    answerEn:
      'You control which fields appear publicly (such as email or phone) and whether an identity is public or private. Firestore security rules restrict private profiles, contacts, and analytics strictly to their owner.',
  },
  {
    id: 'faq-6',
    category: 'nfc',
    questionEs: '¿Cuál es la diferencia entre una tarjeta virtual y una tarjeta física real?',
    questionEn: 'What is the difference between a virtual card and a real physical card?',
    answerEs:
      'Las tarjetas virtuales permiten probar el diseño 3D, los enlaces /t/:codigo y la redirección dentro de la plataforma. Las tarjetas físicas reales requieren emisión controlada y activación segura mediante token de un solo uso; la plataforma no afirma programar chips físicos desde el navegador.',
    answerEn:
      'Virtual cards let you test 3D styling, /t/:code routing, and redirection inside the platform. Physical cards require controlled issuance and secure single-use token activation; the browser app never claims to program physical NFC chips.',
  },
  {
    id: 'faq-7',
    category: 'plans',
    questionEs: '¿Los planes mostrados tienen cobros activos en esta versión?',
    questionEn: 'Do the displayed plans process live payments in this version?',
    answerEs:
      'No. Esta primera versión es un prototipo comercial completo. Los planes Free, Professional y Business son informativos y no procesan cobros reales.',
    answerEn:
      'No. This initial release is a full commercial prototype. Free, Professional, and Business plans are illustrative and do not process real payments.',
  },
];
