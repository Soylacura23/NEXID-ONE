import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, Edit3, Globe, QrCode } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export function HowItWorksPage() {
  const { t } = useI18n();

  const stages = [
    {
      step: '01',
      icon: Edit3,
      title: t('Creación y estructuración en NEXID ONE Studio', 'Creation in NEXID ONE Studio'),
      body: t(
        'Completa tu información principal, proyectos, trayectoria laboral, formación y enlaces. Mientras editas, la vista previa lateral refleja cada ajuste en tiempo real antes de publicar.',
        'Fill in your primary details, projects, work history, education, and links. As you type, the side-by-side preview updates in real time before publishing.',
      ),
    },
    {
      step: '02',
      icon: Globe,
      title: t('Publicación con slug único y control de privacidad', 'Publishing with unique slug & privacy controls'),
      body: t(
        'Al publicar, tu identidad queda accesible en /perfil/tu-slug desde cualquier dispositivo. Tú decides si mostrar tu correo y teléfono públicos o mantener el perfil privado en borrador.',
        'Upon publishing, your identity becomes available at /perfil/your-slug on any device. You choose whether to expose public email/phone or keep a profile private.',
      ),
    },
    {
      step: '03',
      icon: CreditCard,
      title: t('Vinculación dinámica con tarjetas (/t/:codigoPublico)', 'Dynamic card linking (/t/:publicCode)'),
      body: t(
        'Cada tarjeta inteligente posee un código público estable. Puedes cambiar la identidad asociada en segundos (por ejemplo, de tu perfil corporativo a tu perfil académico) sin alterar la tarjeta.',
        'Each smart card has a persistent public code. You can reassign its linked identity in seconds without changing the card.',
      ),
    },
    {
      step: '04',
      icon: QrCode,
      title: t('Compartición vía QR, NFC y descarga vCard', 'Sharing via QR, NFC & vCard download'),
      body: t(
        'Descarga tu código QR en PNG o SVG apuntando al dominio real de producción, comparte con un enlace o permite que tus contactos guarden tu archivo .vcf sin crear cuenta.',
        'Download your QR code as PNG or SVG pointing to your production domain, share your link, or let contacts save your .vcf file without signing up.',
      ),
    },
  ];

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Cómo funciona', 'How it works')}</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
            {t('Del editor en tiempo real a una conexión en segundos', 'From live editor to connection in seconds')}
          </h1>
          <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
            {t(
              'Conoce el ciclo técnico y operativo detrás de cada perfil publicado, código QR y redirección NFC en NEXID ONE.',
              'Understand the technical and operational flow behind every published profile, QR code, and NFC redirect in NEXID ONE.',
            )}
          </p>
        </div>

        <div className="space-y-6">
          {stages.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono-tabular text-sm font-bold text-[var(--accent-gold)]">{s.step}</span>
                  <div className="h-10 w-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[var(--accent-gold)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-bold">{s.title}</h2>
                  <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[var(--semantic-success)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-base font-bold">
                {t('Pruébalo ahora mismo sin registro previo', 'Try it right now without signing up')}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {t('Accede a la demostración NFC 3D o entra al espacio de trabajo demo.', 'Launch the 3D NFC demo or enter the demo workspace.')}
              </p>
            </div>
          </div>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)] whitespace-nowrap shrink-0"
          >
            <span>{t('Ir a la demostración', 'Go to demo')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
