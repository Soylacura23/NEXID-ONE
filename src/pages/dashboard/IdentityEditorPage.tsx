import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Eye,
  Globe,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileRenderer } from '@/components/profiles/ProfileRenderer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { generateId, identityService, notificationService } from '@/services/dataService';
import {
  ButtonStyle,
  CoverStyle,
  Identity,
  IdentityEducation,
  IdentityExperience,
  IdentityLink,
  IdentityProject,
  IdentitySkill,
  IdentityType,
  IdentityVisibility,
  TemplateId,
} from '@/types/nexid';
import { slugify } from '@/utils/exportUtils';

const ACCENT_PRESETS = ['#D5B47A', '#60A5FA', '#34D399', '#F472B6', '#A78BFA', '#F59E0B'];

export function IdentityEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isCloudActive } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [activeSection, setActiveSection] = useState<
    'general' | 'contact' | 'links' | 'projects' | 'career' | 'appearance'
  >('general');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const draftKey = id ? `nexid_editor_draft_${id}` : '';

  useEffect(() => {
    if (!user || !id) return;
    let active = true;
    setLoading(true);
    identityService
      .getById(id, user.uid, isCloudActive)
      .then((found) => {
        if (!active) return;
        if (!found) {
          setIdentity(null);
          return;
        }
        try {
          const cached = sessionStorage.getItem(`nexid_editor_draft_${id}`);
          if (cached) {
            const parsed = JSON.parse(cached) as Identity;
            if (parsed.id === found.id) {
              setIdentity(parsed);
              setDirty(true);
              return;
            }
          }
        } catch {
          // ignore
        }
        setIdentity(found);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user, isCloudActive]);

  // Debounced session draft backup while editing
  useEffect(() => {
    if (!identity || !dirty || !draftKey) return;
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify(identity));
      } catch {
        // ignore
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [identity, dirty, draftKey]);

  // Warn browser unload when unsaved changes exist
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const updateField = <K extends keyof Identity>(field: K, value: Identity[K]) => {
    setIdentity((prev) => (prev ? { ...prev, [field]: value } : prev));
    setDirty(true);
  };

  const handleSave = async (overrideStatus?: Identity['status']) => {
    if (!identity || !user) return;
    if (!identity.title.trim()) {
      showToast({
        type: 'error',
        title: t('Falta el nombre público', 'Public name required'),
      });
      return;
    }

    setSaving(true);
    try {
      const normalizedSlug = slugify(identity.slug || identity.title) || `perfil-${identity.id.slice(-4)}`;
      const nextStatus = overrideStatus || identity.status;
      const payload: Identity = {
        ...identity,
        slug: normalizedSlug,
        status: nextStatus,
        visibility: nextStatus === 'published' ? 'public' : identity.visibility,
      };
      const saved = await identityService.save(payload, false, isCloudActive);
      setIdentity(saved);
      setDirty(false);
      if (draftKey) {
        try {
          sessionStorage.removeItem(draftKey);
        } catch {
          // ignore
        }
      }

      if (overrideStatus === 'published') {
        await notificationService.create(
          {
            ownerId: user.uid,
            type: 'identity_published',
            title: t('Identidad publicada', 'Identity published'),
            message: `${saved.title} (/perfil/${saved.slug})`,
            read: false,
            actionPath: `/app/identidades/${saved.id}/editar`,
          },
          isCloudActive,
        );
      }

      showToast({
        type: 'success',
        title: t('Cambios guardados', 'Changes saved'),
        description:
          nextStatus === 'published'
            ? t(`Publicado en /perfil/${saved.slug}`, `Published at /perfil/${saved.slug}`)
            : t('Borrador actualizado correctamente.', 'Draft updated successfully.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (dirty) {
      setLeaveModalOpen(true);
      return;
    }
    navigate('/app/identidades');
  };

  const confirmLeaveWithoutSaving = () => {
    if (draftKey) {
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
    }
    setDirty(false);
    setLeaveModalOpen(false);
    navigate('/app/identidades');
  };

  if (loading) {
    return (
      <DashboardLayout title={t('Editor de identidad', 'Identity Editor')}>
        <div className="h-96 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-pulse" />
      </DashboardLayout>
    );
  }

  if (!identity) {
    return (
      <DashboardLayout title={t('Identidad no encontrada', 'Identity not found')}>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            {t('No encontramos esta identidad en tu cuenta.', 'We could not find this identity in your account.')}
          </p>
          <Link
            to="/app/identidades"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('Volver a mis identidades', 'Back to identities')}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const addLink = () => {
    const next: IdentityLink = {
      id: generateId('lnk'),
      label: 'LinkedIn',
      platform: 'linkedin',
      url: 'https://linkedin.com/in/',
      enabled: true,
      order: identity.links.length + 1,
    };
    updateField('links', [...identity.links, next]);
  };

  const addProject = () => {
    const next: IdentityProject = {
      id: generateId('prj'),
      title: t('Nuevo proyecto', 'New project'),
      category: t('Producto digital', 'Digital product'),
      description: '',
      imageURL: '',
      projectURL: '',
      technologies: [],
      order: identity.projects.length + 1,
    };
    updateField('projects', [...identity.projects, next]);
  };

  const addExperience = () => {
    const next: IdentityExperience = {
      id: generateId('exp'),
      position: t('Cargo o rol', 'Role or position'),
      organization: t('Organización', 'Organization'),
      startDate: '2024',
      endDate: t('Presente', 'Present'),
      description: '',
    };
    updateField('experience', [...identity.experience, next]);
  };

  const addEducation = () => {
    const next: IdentityEducation = {
      id: generateId('edu'),
      institution: t('Institución', 'Institution'),
      program: t('Programa o título', 'Program or degree'),
      dates: '2020 — 2024',
      description: '',
    };
    updateField('education', [...identity.education, next]);
  };

  const addSkill = () => {
    const next: IdentitySkill = {
      id: generateId('skl'),
      name: t('Nueva habilidad', 'New skill'),
      category: t('Especialidad', 'Specialty'),
      order: identity.skills.length + 1,
    };
    updateField('skills', [...identity.skills, next]);
  };

  const publicUrl =
    identity.id === 'demo-alex-rivera' ? '/demo/perfil/alex-rivera' : `/perfil/${identity.slug}`;

  return (
    <DashboardLayout
      title={identity.title || t('Editor de identidad', 'Identity Editor')}
      breadcrumbs={[
        { label: t('Identidades', 'Identities'), to: '/app/identidades' },
        { label: t('Editar', 'Edit') },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('Volver', 'Back')}
          </button>

          <Link
            to={publicUrl}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors whitespace-nowrap shrink-0"
          >
            <Eye className="h-3.5 w-3.5" />
            {t('Ver público', 'View public')}
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap shrink-0"
          >
            <Save className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
            {saving ? t('Guardando...', 'Saving...') : dirty ? t('Guardar*', 'Save*') : t('Guardado', 'Saved')}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(identity.status === 'published' ? 'draft' : 'published')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-gold)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="h-3.5 w-3.5" />
            {identity.status === 'published' ? t('Pasar a borrador', 'Unpublish') : t('Publicar', 'Publish')}
          </button>
        </div>
      }
    >
      {/* Mobile Edit / Preview switcher */}
      <div className="lg:hidden mb-4 grid grid-cols-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
            mobileTab === 'edit' ? 'bg-[var(--accent-gold)] text-[var(--accent-ink)]' : 'text-[var(--text-muted)]'
          }`}
        >
          {t('Editar contenido', 'Edit content')}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
            mobileTab === 'preview' ? 'bg-[var(--accent-gold)] text-[var(--accent-ink)]' : 'text-[var(--text-muted)]'
          }`}
        >
          {t('Vista previa en vivo', 'Live preview')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Editor Panel */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Section tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2">
            {[
              { id: 'general', label: t('Principal', 'Core') },
              { id: 'contact', label: t('Contacto', 'Contact') },
              { id: 'links', label: t('Enlaces', 'Links') },
              { id: 'projects', label: t('Portafolio', 'Portfolio') },
              { id: 'career', label: t('Trayectoria', 'Career') },
              { id: 'appearance', label: t('Diseño', 'Design') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeSection === tab.id
                    ? 'bg-[var(--accent-gold)] text-[var(--accent-ink)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
            {activeSection === 'general' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Nombre o título público', 'Public name or title')}
                  </label>
                  <input
                    type="text"
                    value={identity.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('Slug público', 'Public slug')}
                    </label>
                    <input
                      type="text"
                      value={identity.slug}
                      onChange={(e) => updateField('slug', slugify(e.target.value))}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm font-mono-tabular text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('Tipo de identidad', 'Identity type')}
                    </label>
                    <select
                      value={identity.identityType}
                      onChange={(e) => updateField('identityType', e.target.value as IdentityType)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                    >
                      <option value="professional">{t('Profesional', 'Professional')}</option>
                      <option value="creative">{t('Creativo', 'Creative')}</option>
                      <option value="business">{t('Negocio', 'Business')}</option>
                      <option value="academic">{t('Académico', 'Academic')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Profesión o cargo', 'Profession or role')}
                  </label>
                  <input
                    type="text"
                    value={identity.profession}
                    onChange={(e) => updateField('profession', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('Empresa o estudio', 'Company or studio')}
                    </label>
                    <input
                      type="text"
                      value={identity.company || ''}
                      onChange={(e) => updateField('company', e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('Ubicación', 'Location')}
                    </label>
                    <input
                      type="text"
                      value={identity.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Biografía ejecutiva', 'Executive bio')}
                  </label>
                  <textarea
                    rows={4}
                    value={identity.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('URL de avatar', 'Avatar image URL')}
                    </label>
                    <input
                      type="url"
                      value={identity.photoURL || ''}
                      onChange={(e) => updateField('photoURL', e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('URL de portada', 'Cover image URL')}
                    </label>
                    <input
                      type="url"
                      value={identity.coverURL || ''}
                      onChange={(e) => updateField('coverURL', e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </>
            )}

            {activeSection === 'contact' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Correo electrónico público', 'Public email')}
                  </label>
                  <input
                    type="email"
                    value={identity.publicEmail || ''}
                    onChange={(e) => updateField('publicEmail', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={identity.showEmail}
                      onChange={(e) => updateField('showEmail', e.target.checked)}
                    />
                    {t('Mostrar correo en perfil público y vCard', 'Show email on public profile and vCard')}
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Teléfono público', 'Public phone')}
                  </label>
                  <input
                    type="tel"
                    value={identity.publicPhone || ''}
                    onChange={(e) => updateField('publicPhone', e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={identity.showPhone}
                      onChange={(e) => updateField('showPhone', e.target.checked)}
                    />
                    {t('Mostrar teléfono en perfil público y vCard', 'Show phone on public profile and vCard')}
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Sitio web principal', 'Primary website')}
                  </label>
                  <input
                    type="url"
                    value={identity.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://tudominio.com"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </>
            )}

            {activeSection === 'links' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                    {t('Enlaces y canales', 'Links & channels')}
                  </h3>
                  <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-surface-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('Añadir enlace', 'Add link')}
                  </button>
                </div>

                {identity.links.map((lnk, idx) => (
                  <div
                    key={lnk.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={lnk.platform}
                        onChange={(e) => {
                          const next = [...identity.links];
                          next[idx] = { ...lnk, platform: e.target.value as IdentityLink['platform'] };
                          updateField('links', next);
                        }}
                        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="behance">Behance</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="website">Website</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="other">{t('Otro', 'Other')}</option>
                      </select>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[var(--text-muted)] inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lnk.enabled}
                            onChange={(e) => {
                              const next = [...identity.links];
                              next[idx] = { ...lnk, enabled: e.target.checked };
                              updateField('links', next);
                            }}
                          />
                          {t('Activo', 'Active')}
                        </label>
                        <button
                          type="button"
                          onClick={() => updateField('links', identity.links.filter((_, i) => i !== idx))}
                          className="text-[var(--text-muted)] hover:text-[var(--semantic-error)] p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={lnk.label}
                      placeholder={t('Etiqueta visible', 'Display label')}
                      onChange={(e) => {
                        const next = [...identity.links];
                        next[idx] = { ...lnk, label: e.target.value };
                        updateField('links', next);
                      }}
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="url"
                      value={lnk.url}
                      placeholder="https://..."
                      onChange={(e) => {
                        const next = [...identity.links];
                        next[idx] = { ...lnk, url: e.target.value };
                        updateField('links', next);
                      }}
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'projects' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                    {t('Proyectos de portafolio', 'Portfolio projects')}
                  </h3>
                  <button
                    type="button"
                    onClick={addProject}
                    className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-surface-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('Añadir proyecto', 'Add project')}
                  </button>
                </div>

                {identity.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const next = [...identity.projects];
                          next[idx] = { ...proj, title: e.target.value };
                          updateField('projects', next);
                        }}
                        placeholder={t('Título del proyecto', 'Project title')}
                        className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('projects', identity.projects.filter((_, i) => i !== idx))}
                        className="text-[var(--text-muted)] hover:text-[var(--semantic-error)] p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={proj.category}
                      onChange={(e) => {
                        const next = [...identity.projects];
                        next[idx] = { ...proj, category: e.target.value };
                        updateField('projects', next);
                      }}
                      placeholder={t('Categoría', 'Category')}
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                    />
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const next = [...identity.projects];
                        next[idx] = { ...proj, description: e.target.value };
                        updateField('projects', next);
                      }}
                      placeholder={t('Descripción breve', 'Brief description')}
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="url"
                      value={proj.projectURL || ''}
                      onChange={(e) => {
                        const next = [...identity.projects];
                        next[idx] = { ...proj, projectURL: e.target.value };
                        updateField('projects', next);
                      }}
                      placeholder={t('URL del proyecto (opcional)', 'Project URL (optional)')}
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={(proj.technologies || []).join(', ')}
                      onChange={(e) => {
                        const next = [...identity.projects];
                        next[idx] = {
                          ...proj,
                          technologies: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        updateField('projects', next);
                      }}
                      placeholder={t('Tecnologías separadas por coma', 'Technologies comma-separated')}
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'career' && (
              <div className="space-y-6">
                {/* Experience */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      {t('Experiencia', 'Experience')}
                    </h3>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-surface-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('Añadir', 'Add')}
                    </button>
                  </div>
                  {identity.experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const next = [...identity.experience];
                            next[idx] = { ...exp, position: e.target.value };
                            updateField('experience', next);
                          }}
                          placeholder={t('Cargo', 'Position')}
                          className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => updateField('experience', identity.experience.filter((_, i) => i !== idx))}
                          className="text-[var(--text-muted)] hover:text-[var(--semantic-error)] p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={exp.organization}
                        onChange={(e) => {
                          const next = [...identity.experience];
                          next[idx] = { ...exp, organization: e.target.value };
                          updateField('experience', next);
                        }}
                        placeholder={t('Empresa', 'Organization')}
                        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const next = [...identity.experience];
                            next[idx] = { ...exp, startDate: e.target.value };
                            updateField('experience', next);
                          }}
                          placeholder={t('Inicio', 'Start')}
                          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => {
                            const next = [...identity.experience];
                            next[idx] = { ...exp, endDate: e.target.value };
                            updateField('experience', next);
                          }}
                          placeholder={t('Fin', 'End')}
                          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      {t('Educación', 'Education')}
                    </h3>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-surface-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('Añadir', 'Add')}
                    </button>
                  </div>
                  {identity.education.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={edu.program}
                          onChange={(e) => {
                            const next = [...identity.education];
                            next[idx] = { ...edu, program: e.target.value };
                            updateField('education', next);
                          }}
                          placeholder={t('Programa', 'Program')}
                          className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => updateField('education', identity.education.filter((_, i) => i !== idx))}
                          className="text-[var(--text-muted)] hover:text-[var(--semantic-error)] p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const next = [...identity.education];
                          next[idx] = { ...edu, institution: e.target.value };
                          updateField('education', next);
                        }}
                        placeholder={t('Institución', 'Institution')}
                        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      {t('Habilidades', 'Skills')}
                    </h3>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-surface-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t('Añadir', 'Add')}
                    </button>
                  </div>
                  {identity.skills.map((sk, idx) => (
                    <div key={sk.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sk.name}
                        onChange={(e) => {
                          const next = [...identity.skills];
                          next[idx] = { ...sk, name: e.target.value };
                          updateField('skills', next);
                        }}
                        placeholder={t('Habilidad', 'Skill')}
                        className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={sk.category}
                        onChange={(e) => {
                          const next = [...identity.skills];
                          next[idx] = { ...sk, category: e.target.value };
                          updateField('skills', next);
                        }}
                        placeholder={t('Categoría', 'Category')}
                        className="w-32 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('skills', identity.skills.filter((_, i) => i !== idx))}
                        className="text-[var(--text-muted)] hover:text-[var(--semantic-error)] p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Plantilla estructural', 'Structural template')}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(
                      [
                        { id: 'executive', label: t('Executive', 'Executive'), desc: t('2 columnas corporativas', '2 corporate columns') },
                        { id: 'minimal', label: t('Minimal', 'Minimal'), desc: t('Editorial centrada', 'Centered editorial') },
                        { id: 'tech', label: t('Tech', 'Tech'), desc: t('Modular técnica', 'Modular engineering') },
                        { id: 'creative', label: t('Creative', 'Creative'), desc: t('Portafolio visual', 'Visual showcase') },
                      ] as { id: TemplateId; label: string; desc: string }[]
                    ).map((tpl) => {
                      const active = identity.templateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => updateField('templateId', tpl.id)}
                          className={`rounded-xl border p-3 text-left transition-colors ${
                            active
                              ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display text-xs font-bold text-[var(--text-primary)]">{tpl.label}</span>
                            {active && <Check className="h-3.5 w-3.5 text-[var(--accent-gold)]" />}
                          </div>
                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">{tpl.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Color de acento', 'Accent color')}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {ACCENT_PRESETS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => updateField('accentColor', hex)}
                        aria-label={hex}
                        className={`h-8 w-8 rounded-full border-2 transition-transform ${
                          identity.accentColor === hex ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    <input
                      type="color"
                      value={identity.accentColor || '#D5B47A'}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      aria-label={t('Color personalizado', 'Custom color')}
                      className="h-8 w-10 rounded-lg border border-[var(--border-subtle)] bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('Estilo de portada', 'Cover style')}
                    </label>
                    <select
                      value={identity.coverStyle}
                      onChange={(e) => updateField('coverStyle', e.target.value as CoverStyle)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs"
                    >
                      <option value="editorial">Editorial</option>
                      <option value="obsidian">Obsidian</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      {t('Estilo de botones', 'Button style')}
                    </label>
                    <select
                      value={identity.buttonStyle}
                      onChange={(e) => updateField('buttonStyle', e.target.value as ButtonStyle)}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs"
                    >
                      <option value="solid">{t('Sólido', 'Solid')}</option>
                      <option value="outline">{t('Contorno', 'Outline')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--text-secondary)]">
                    {t('Visibilidad pública', 'Public visibility')}
                  </label>
                  <select
                    value={identity.visibility}
                    onChange={(e) => updateField('visibility', e.target.value as IdentityVisibility)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs"
                  >
                    <option value="public">{t('Pública (/perfil/slug)', 'Public (/perfil/slug)')}</option>
                    <option value="private">{t('Privada (solo lectura en panel)', 'Private (workspace only)')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Preview */}
        <div
          className={`lg:col-span-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden ${
            mobileTab === 'edit' ? 'hidden lg:block' : ''
          }`}
        >
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-mono-tabular">
              {t('Vista previa en tiempo real', 'Live preview')} · {identity.templateId}
            </span>
            <span className="font-mono-tabular">/{identity.slug}</span>
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            <ProfileRenderer identity={identity} preview />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={leaveModalOpen}
        destructive
        title={t('Cambios sin guardar', 'Unsaved changes')}
        description={t(
          'Tienes cambios pendientes en esta identidad. ¿Deseas salir y descartar los cambios no guardados?',
          'You have unsaved changes in this identity. Leave and discard unsaved changes?',
        )}
        confirmLabel={t('Salir sin guardar', 'Leave without saving')}
        cancelLabel={t('Seguir editando', 'Keep editing')}
        onConfirm={confirmLeaveWithoutSaving}
        onCancel={() => setLeaveModalOpen(false)}
      />
    </DashboardLayout>
  );
}
