import React, { useState } from 'react';
import { Check, Copy, Info, Mail, MapPin } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export function ContactPage() {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('general');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submittedDraft, setSubmittedDraft] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || name.trim().length < 2) {
      setError(t('Ingresa tu nombre completo.', 'Please enter your full name.'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('Ingresa un correo electrónico válido.', 'Please enter a valid email address.'));
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError(t('Describe brevemente tu consulta (mínimo 10 caracteres).', 'Please enter at least 10 characters in your message.'));
      return;
    }

    setSubmittedDraft(true);
    showToast({
      type: 'info',
      title: t('Consulta preparada', 'Inquiry prepared'),
      description: t(
        'Puedes enviarla mediante tu cliente de correo o copiar el resumen.',
        'You can open it in your email app or copy the summary.',
      ),
    });
  };

  const mailtoHref = `mailto:contacto@nexid-one.ejemplo?subject=${encodeURIComponent(
    `[NEXID ONE - ${topic}] ${name}`,
  )}&body=${encodeURIComponent(`${message}\n\nResponder a: ${email}`)}`;

  const copySummary = async () => {
    const text = `Nombre: ${name}\nCorreo: ${email}\nTema: ${topic}\nMensaje:\n${message}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast({
        type: 'success',
        title: t('Resumen copiado', 'Summary copied'),
      });
    } catch {
      // ignore
    }
  };

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Contacto', 'Contact')}</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {t('Hablemos sobre NEXID ONE', 'Let’s talk about NEXID ONE')}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              {t(
                '¿Tienes preguntas sobre despliegues para equipos, tarjetas NFC corporativas o integración técnica? Escríbenos.',
                'Questions about team deployments, corporate NFC cards, or technical integration? Reach out.',
              )}
            </p>

            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)] text-sm">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <Mail className="h-4 w-4 text-[var(--accent-gold)] shrink-0" />
                <span>contacto@nexid-one.ejemplo</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <MapPin className="h-4 w-4 text-[var(--accent-gold)] shrink-0" />
                <span>Colombia · Operación Digital Remota</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex items-start gap-3">
              <Info className="h-4 w-4 text-[var(--semantic-info)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t(
                  'Estado de infraestructura: el envío automático SMTP está pendiente de configuración de proveedor externo. El formulario valida tu mensaje y genera un enlace mailto directo sin simular envíos.',
                  'Infrastructure notice: automated SMTP dispatch awaits an external mail provider. This form validates your inquiry and prepares a direct mailto link without faking server delivery.',
                )}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8">
              {submittedDraft ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-[var(--semantic-success)]">
                    <Check className="h-5 w-5" />
                    <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                      {t('Mensaje validado y listo para enviar', 'Message validated and ready to send')}
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {t(
                      'Dado que aún no hay un servidor de correo externo conectado, selecciona cómo deseas despachar tu mensaje:',
                      'Since no external mail server is connected yet, choose how you want to dispatch your message:',
                    )}
                  </p>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 text-xs space-y-1 text-[var(--text-secondary)]">
                    <p><strong>{t('Nombre', 'Name')}:</strong> {name}</p>
                    <p><strong>{t('Correo', 'Email')}:</strong> {email}</p>
                    <p><strong>{t('Mensaje', 'Message')}:</strong> {message}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={mailtoHref}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-ink)]"
                    >
                      <Mail className="h-4 w-4" />
                      {t('Abrir en cliente de correo', 'Open in email client')}
                    </a>
                    <button
                      type="button"
                      onClick={copySummary}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium"
                    >
                      <Copy className="h-4 w-4" />
                      {t('Copiar texto', 'Copy text')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmittedDraft(false)}
                      className="rounded-xl px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {t('Editar', 'Edit')}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-[var(--semantic-error)]/40 bg-[var(--semantic-error)]/10 px-4 py-3 text-xs font-medium text-[var(--semantic-error)]"
                    >
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-[var(--text-secondary)]">
                      {t('Nombre completo *', 'Full name *')}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={120}
                      placeholder={t('Ej. Sofía Herrera', 'e.g. Sophia Herrera')}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-[var(--text-secondary)]">
                      {t('Correo electrónico *', 'Email address *')}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={180}
                      placeholder="nombre@empresa.com"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-topic" className="block text-xs font-semibold text-[var(--text-secondary)]">
                      {t('Motivo de contacto', 'Topic')}
                    </label>
                    <select
                      id="contact-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:outline-none"
                    >
                      <option value="general">{t('Consulta general', 'General inquiry')}</option>
                      <option value="business">{t('Propuesta Business / Equipos', 'Business / Teams inquiry')}</option>
                      <option value="nfc">{t('Tarjetas NFC corporativas', 'Corporate NFC cards')}</option>
                      <option value="support">{t('Soporte técnico', 'Technical support')}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-msg" className="block text-xs font-semibold text-[var(--text-secondary)]">
                      {t('Mensaje *', 'Message *')}
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={1200}
                      placeholder={t('Cuéntanos cómo planeas usar NEXID ONE...', 'Tell us how you plan to use NEXID ONE...')}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[var(--accent-gold)] px-5 py-3 text-sm font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors"
                  >
                    {t('Preparar consulta', 'Prepare inquiry')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
