# NEXID ONE

Plataforma SaaS de identidad digital profesional con perfiles multi-plantilla, tarjetas NFC virtuales personalizables en 3D, códigos QR dinámicos, exportación vCard (.vcf), gestión de contactos y analítica real de interacciones.

## Stack tecnológico

- **Frontend:** React 19 + TypeScript + Vite
- **Estilos y UI:** Tailwind CSS v4 + Lucide Icons + Motion + AOS
- **Escenas 3D:** Three.js (`Hero3DScene`, `NFCExperience3D`, `CardCustomizer3D`)
- **Gráficas:** Recharts
- **QR / Exportación:** `qrcode` (PNG / SVG), vCard `.vcf` 3.0 y CSV
- **Backend / Persistencia:** Firebase Authentication (Google Sign-In) + Cloud Firestore + Modo Demo local automático (`localStorage`)

## Instalación local

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Variables de entorno (`.env.example`)

Puedes definir estas variables opcionales en `.env` o en Vercel (`Project Settings -> Environment Variables`):

- `VITE_PUBLIC_APP_URL`: URL pública de producción usada para construir enlaces de perfiles y códigos QR (ej. `https://nexid-one.vercel.app`). Si no se define, usa `window.location.origin`.
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_FIRESTORE_DATABASE_ID`: opcionales si deseas conectar otro proyecto Firebase distinto al incluido en `firebase-applet-config.json`.

## Firebase y reglas de Firestore

El proyecto incluye:
- `firebase-blueprint.json`: esquema de entidades (`users`, `identities`, `cards`, `contacts`, `analyticsEvents`, `notifications`, `admins`, `adminAudit`).
- `firestore.rules`: reglas de seguridad con validación de propietario, acceso público solo a identidades publicadas/públicas y tarjetas activas, y protección administrativa.
- `firestore.indexes.json`: índices compuestos para consultas de identidades, tarjetas y analítica.

### Modos de acceso

1. **Modo Demo inmediato ("Entrar en Modo Demo"):** No requiere credenciales ni configuración. Precarga el perfil de ejemplo **Alex Rivera**, un segundo perfil académico, 2 tarjetas virtuales y 3 contactos de muestra en `localStorage`.
2. **Cuenta con Google (Firebase Auth):** Inicio de sesión en 1 clic sincronizado con Cloud Firestore.

## Compilación y despliegue en Vercel

El proyecto incluye `vercel.json` con reescritura SPA (`/(.*) -> /index.html`) para soportar rutas limpias de `react-router-dom`:

```bash
npm run build
```

En Vercel:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## Módulos disponibles

- **Sitio público y marketing:** `/`, `/soluciones`, `/como-funciona`, `/precios`, `/contacto`, `/faq`, `/ayuda`, `/terminos`, `/privacidad`
- **Experiencia NFC 3D y perfil demo:** `/demo`, `/demo/perfil/alex-rivera`
- **NEXID ONE Showcase (presentación guiada de 10 pasos):** `/showcase`
- **Perfiles públicos y redirecciones NFC:** `/perfil/:slug`, `/t/:codigoPublico`
- **Panel privado:** `/app/onboarding`, `/app/dashboard`, `/app/identidades`, `/app/identidades/:id/editar`, `/app/tarjetas`, `/app/compartir`, `/app/contactos`, `/app/analitica`, `/app/ajustes`
- **Consola administrativa:** `/admin`

## Límites conocidos

- **Hardware NFC físico:** Desde un navegador web estándar no se graban chips NFC físicos; las tarjetas virtuales generan el flujo `/t/:codigoPublico` y las físicas se conciben como pre-emitidas con código de activación.
- **Analítica:** Las métricas reflejan únicamente eventos reales registrados en el cliente (`profile_view`, `link_click`, `vcard_download`, `card_redirect`, `share_action`), sin números simulados.
- **Pagos:** Los planes en `/precios` son propuestas comerciales informativas sin pasarela de cobro real.
