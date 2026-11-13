import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { generateId, identityService, notificationService } from '@/services/dataService';
import { Identity, TemplateId } from '@/types/nexid';
import { slugify } from '@/utils/exportUtils';
import { NexidLogo } from '@/components/ui/NexidLogo';

const DRAFT_KEY = 'nexid_onboarding_draft';

export function OnboardingPage() {
  const { user, isCloudActive, updateAccountProfile } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(user?.displayName || '');
  const [profession, setProfession] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState('');
  const [templateId, setTemplateId] = useState<TemplateId>('executive');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.profession) setProfession(parsed.profession);
        if (parsed.company) setCompany(parsed.company);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.slug) setSlug(parsed.slug);
        if (parsed.templateId) setTemplateId(parsed.templateId);
        if (parsed.step) setStep(parsed.step);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ step, title, profession, company, bio, slug, templateId }),
      );
    } catch {
      // ignore
    }
  }, [step, title, profession, company, bio, slug, templateId]);

  const templates: { id: TemplateId; name: string; desc: string }[] = [
    { id: 'executive', name: 'Executive', desc: t('Corporativa de dos columnas', 'Corporate two-column dossier') },
    { id: 'minimal', name: 'Minimal', desc: t('Editorial limpia y tipográfica', 'Clean typographic column') },
    { id: 'creative', name: 'Creative', desc: t('Enfoque visual de portafolio', 'Portfolio-forward layout') },
    { id: 'tech', name: 'Tech', desc: t('Modular para ingeniería y producto', 'Modular tech & engineering grid') },
  ];

  const handleFinish = async (publishNow: boolean) => {
    if (!user) return;
    setSaving(true);
    try {
      const cleanSlug =
        slugify(slug || title) || `perfil-${user.uid.slice(0, 6).toLowerCase()}`;
      const newIdentity: Identity = {
        id: generateId('id'),
        ownerId: user.uid,
        slug: cleanSlug,
        identityType: 'professional',
        title: title.trim() || user.displayName,
        profession: profession.trim() || t('Profesional Digital', 'Digital Professional'),
        company: company.trim(),
        location: '',
        bio: bio.trim(),
        photoURL: user.photoURL || '',
        coverURL: '',
        publicEmail: user.email,
        publicPhone: '',
        website: '',
        showEmail: false,
        showPhone: false,
        templateId,
        accentColor: '#D5B47A',
        coverStyle: 'editorial',
        buttonStyle: 'solid',
        visibility: publishNow ? 'public' : 'private',
        status: publishNow ? 'published' : 'draft',
        links: [],
        projects: [],
        experience: [],
        education: [],
        skills: [],
        sectionOrder: ['projects', 'experience', 'skills', 'education', 'links'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: publishNow ? new Date().toISOString() : null,
      };

      await identityService.save(newIdentity, true, isCloudActive);
      await updateAccountProfile({ onboardingCompleted: true });
      await notificationService.create(
        {
          ownerId: user.uid,
          type: publishNow ? 'identity_published' : 'system_info',
          title: publishNow ? t('Primera identidad publicada', 'First identity published') : t('Borrador inicial creado', 'Initial draft created'),
          message: `${newIdentity.title} (/${newIdentity.slug})`,
          read: false,
          actionPath: `/app/identidades/${newIdentity.id}/editar`,
        },
        isCloudActive,
      );

      sessionStorage.removeItem(DRAFT_KEY);
      showToast({
        type: 'success',
        title: t('¡Bienvenido a NEXID ONE!', 'Welcome to NEXID ONE!'),
      });
      navigate(`/app/identidades/${newIdentity.id}/editar`, { replace: true });
    } catch {
      showToast({
        type: 'error',
        title: t('No se pudo guardar la configuración inicial', 'Could not save onboarding profile'),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <NexidLogo variant="horizontal" size="sm" />
          <span className="font-mono-tabular text-xs text-[var(--accent-gold)]">
            {t('Paso', 'Step')} {step} / 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-colors ${
                idx <= step ? 'bg-[var(--accent-gold)]' : 'bg-[var(--border-subtle)]'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {t('Bienvenido a NEXID ONE', 'Welcome to NEXID ONE')}
            </h1>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              {t(
                'En cuatro pasos configuraremos tu primera identidad digital profesional lista para compartir mediante enlace, código QR o tarjeta NFC.',
                'In four steps we will configure your first professional digital identity ready to share via link, QR code, or NFC card.',
              )}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold">
              {t('Información básica de tu identidad', 'Basic identity details')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  {t('Nombre público *', 'Display name *')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Alex Rivera"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  {t('Profesión o especialidad *', 'Profession or role *')}
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder={t('Ej. Diseñador de producto', 'e.g. Product Designer')}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  {t('Organización / Empresa', 'Company / Organization')}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  {t('Slug público (/perfil/...)', 'Public slug (/perfil/...)')}
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="alex-rivera"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm font-mono-tabular"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('Biografía breve', 'Short bio')}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold">
              {t('Elige tu plantilla inicial', 'Select your starting template')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplateId(tpl.id)}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    templateId === tpl.id
                      ? 'border-[var(--accent-gold)] bg-[var(--bg-surface-alt)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold">{tpl.name}</span>
                    {templateId === tpl.id && <Check className="h-4 w-4 text-[var(--accent-gold)]" />}
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold">
              {t('Todo listo para crear tu primera identidad', 'Ready to create your first identity')}
            </h2>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-5 space-y-2 text-sm">
              <p><strong>{t('Nombre', 'Name')}:</strong> {title || user?.displayName}</p>
              <p><strong>{t('Profesión', 'Role')}:</strong> {profession || t('Profesional Digital', 'Digital Professional')}</p>
              <p><strong>{t('Plantilla', 'Template')}:</strong> {templateId}</p>
              <p className="font-mono-tabular text-xs text-[var(--accent-gold)]">
                /perfil/{slugify(slug || title || 'mi-perfil')}
              </p>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {t(
                'Tu correo y teléfono permanecen privados hasta que los habilites en el editor.',
                'Your email and phone remain hidden until you explicitly enable them in the editor.',
              )}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('Atrás', 'Back')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => updateAccountProfile({ onboardingCompleted: true }).then(() => navigate('/app/dashboard'))}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {t('Omitir por ahora', 'Skip for now')}
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)]"
            >
              <span>{t('Continuar', 'Continue')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleFinish(false)}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {t('Guardar borrador', 'Save draft')}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleFinish(true)}
                className="rounded-xl bg-[var(--accent-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-ink)] disabled:opacity-50"
              >
                {saving ? '...' : t('Crear y publicar', 'Create & publish')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
