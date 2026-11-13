import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive,
  Copy,
  Edit3,
  ExternalLink,
  Globe,
  Plus,
  QrCode,
  Search,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { generateId, identityService, notificationService } from '@/services/dataService';
import { Identity, IdentityStatus, IdentityType } from '@/types/nexid';
import { slugify } from '@/utils/exportUtils';

export function IdentitiesPage() {
  const { user, isCloudActive } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IdentityStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | IdentityType>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');
  const [deleteTarget, setDeleteTarget] = useState<Identity | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadIdentities = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await identityService.listByOwner(user.uid, isCloudActive);
      setIdentities(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdentities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isCloudActive]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return identities
      .filter((item) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (typeFilter !== 'all' && item.identityType !== typeFilter) return false;
        if (q) {
          const hay = `${item.title} ${item.profession} ${item.company || ''} ${item.slug}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [identities, searchQuery, statusFilter, typeFilter, sortBy]);

  const handleCreateNew = async () => {
    if (!user) return;
    const id = generateId('idn');
    const baseName = user.displayName || 'Nueva Identidad';
    const slug = `${slugify(baseName) || 'perfil'}-${id.slice(-4)}`;
    const now = new Date().toISOString();
    const fresh: Identity = {
      id,
      ownerId: user.uid,
      slug,
      identityType: 'professional',
      title: baseName,
      profession: t('Especialista Profesional', 'Professional Specialist'),
      company: '',
      location: '',
      bio: t(
        'Perfil profesional creado en NEXID ONE listo para personalizar y compartir.',
        'Professional profile created on NEXID ONE ready to customize and share.',
      ),
      publicEmail: user.email || '',
      publicPhone: '',
      website: '',
      showEmail: true,
      showPhone: false,
      templateId: 'executive',
      accentColor: '#D5B47A',
      coverStyle: 'editorial',
      buttonStyle: 'solid',
      visibility: 'public',
      status: 'draft',
      links: [],
      projects: [],
      experience: [],
      education: [],
      skills: [],
      sectionOrder: ['projects', 'experience', 'skills', 'education', 'links'],
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };

    const saved = await identityService.save(fresh, true, isCloudActive);
    showToast({
      type: 'success',
      title: t('Borrador creado', 'Draft created'),
      description: t('Abriendo el editor en vivo...', 'Opening live editor...'),
    });
    navigate(`/app/identidades/${saved.id}/editar`);
  };

  const handleDuplicate = async (item: Identity) => {
    if (!user) return;
    setBusyId(item.id);
    try {
      const id = generateId('idn');
      const now = new Date().toISOString();
      const copy: Identity = {
        ...item,
        id,
        ownerId: user.uid,
        title: `${item.title} (${t('Copia', 'Copy')})`,
        slug: `${slugify(item.slug) || 'perfil'}-${id.slice(-4)}`,
        status: 'draft',
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      const saved = await identityService.save(copy, true, isCloudActive);
      setIdentities((prev) => [saved, ...prev]);
      showToast({
        type: 'success',
        title: t('Identidad duplicada', 'Identity duplicated'),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePublish = async (item: Identity) => {
    if (!user) return;
    setBusyId(item.id);
    try {
      const nextStatus: IdentityStatus = item.status === 'published' ? 'draft' : 'published';
      const updated = await identityService.save(
        {
          ...item,
          status: nextStatus,
          visibility: nextStatus === 'published' ? 'public' : item.visibility,
        },
        false,
        isCloudActive,
      );
      setIdentities((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      if (nextStatus === 'published') {
        await notificationService.create(
          {
            ownerId: user.uid,
            type: 'identity_published',
            title: t('Identidad publicada', 'Identity published'),
            message: `${updated.title} (/perfil/${updated.slug})`,
            read: false,
            actionPath: `/app/identidades/${updated.id}/editar`,
          },
          isCloudActive,
        );
      }
      showToast({
        type: 'success',
        title:
          nextStatus === 'published'
            ? t('Identidad publicada', 'Identity published')
            : t('Movida a borrador', 'Moved to draft'),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleArchive = async (item: Identity) => {
    setBusyId(item.id);
    try {
      const nextStatus: IdentityStatus = item.status === 'archived' ? 'draft' : 'archived';
      const updated = await identityService.save({ ...item, status: nextStatus }, false, isCloudActive);
      setIdentities((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      showToast({
        type: 'info',
        title:
          nextStatus === 'archived'
            ? t('Identidad archivada', 'Identity archived')
            : t('Identidad restaurada', 'Identity restored'),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await identityService.remove(deleteTarget.id, user.uid, isCloudActive);
      setIdentities((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast({
        type: 'success',
        title: t('Identidad eliminada', 'Identity deleted'),
      });
      setDeleteTarget(null);
    } finally {
      setBusyId(null);
    }
  };

  const statusLabel = (s: IdentityStatus) => {
    if (s === 'published') return t('Publicada', 'Published');
    if (s === 'archived') return t('Archivada', 'Archived');
    return t('Borrador', 'Draft');
  };

  const statusTone = (s: IdentityStatus) => {
    if (s === 'published') return 'text-[var(--semantic-success)]';
    if (s === 'archived') return 'text-[var(--text-muted)]';
    return 'text-[var(--semantic-warning)]';
  };

  return (
    <DashboardLayout
      title={t('Mis identidades', 'My Identities')}
      breadcrumbs={[{ label: 'NEXID ONE', to: '/app/dashboard' }, { label: t('Identidades', 'Identities') }]}
      actions={
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-gold)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('Crear identidad', 'Create identity')}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Buscar por nombre, profesión, empresa o slug...', 'Search by name, role, company or slug...')}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | IdentityStatus)}
              aria-label={t('Filtrar por estado', 'Filter by status')}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            >
              <option value="all">{t('Todos los estados', 'All statuses')}</option>
              <option value="published">{t('Publicadas', 'Published')}</option>
              <option value="draft">{t('Borradores', 'Drafts')}</option>
              <option value="archived">{t('Archivadas', 'Archived')}</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | IdentityType)}
              aria-label={t('Filtrar por tipo', 'Filter by type')}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            >
              <option value="all">{t('Todos los tipos', 'All types')}</option>
              <option value="professional">{t('Profesional', 'Professional')}</option>
              <option value="creative">{t('Creativo', 'Creative')}</option>
              <option value="business">{t('Negocio', 'Business')}</option>
              <option value="academic">{t('Académico', 'Academic')}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'title')}
              aria-label={t('Ordenar por', 'Sort by')}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            >
              <option value="updated">{t('Más recientes', 'Most recent')}</option>
              <option value="title">{t('Orden alfabético', 'Alphabetical')}</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
            <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
              {t('No encontramos identidades con esos filtros.', 'No identities match those filters.')}
            </p>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">
              {t('Crea una nueva identidad digital o ajusta tu búsqueda.', 'Create a new digital identity or clear your filters.')}
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-ink)]"
            >
              <Plus className="h-4 w-4" />
              {t('Crear identidad', 'Create identity')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const publicHref = item.id === 'demo-alex-rivera' ? '/demo/perfil/alex-rivera' : `/perfil/${item.slug}`;
              const isBusy = busyId === item.id;
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between gap-5 hover:border-[var(--border-strong)] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
                      <span className="font-mono-tabular text-[var(--text-muted)]">{item.templateId}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-3.5">
                      <div
                        className="h-12 w-12 rounded-xl overflow-hidden border border-[var(--border-subtle)] shrink-0 flex items-center justify-center font-display font-bold text-[#101114]"
                        style={{ backgroundColor: item.accentColor || '#D5B47A' }}
                      >
                        {item.photoURL ? (
                          <img
                            src={item.photoURL}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (item.title || 'N').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold text-[var(--text-primary)] truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] truncate">{item.profession}</p>
                        <p className="text-[11px] font-mono-tabular text-[var(--accent-gold)] truncate mt-0.5">
                          /{item.slug}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{item.bio}</p>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/app/identidades/${item.id}/editar`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-gold)] px-3 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors whitespace-nowrap"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        {t('Editar', 'Edit')}
                      </Link>
                      <Link
                        to={publicHref}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors whitespace-nowrap"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('Vista previa', 'Preview')}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTogglePublish(item)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        {item.status === 'published' ? t('Despublicar', 'Unpublish') : t('Publicar', 'Publish')}
                      </button>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/app/compartir?id=${encodeURIComponent(item.id)}`}
                          title={t('Generar QR', 'Generate QR')}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDuplicate(item)}
                          title={t('Duplicar', 'Duplicate')}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleArchive(item)}
                          title={item.status === 'archived' ? t('Restaurar', 'Restore') : t('Archivar', 'Archive')}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setDeleteTarget(item)}
                          title={t('Eliminar', 'Delete')}
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--semantic-error)]/15 hover:text-[var(--semantic-error)] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        destructive
        loading={Boolean(busyId)}
        title={t('Eliminar identidad digital', 'Delete digital identity')}
        description={
          deleteTarget
            ? t(
                `¿Seguro que deseas eliminar "${deleteTarget.title}" (/${deleteTarget.slug})? Esta acción no se puede deshacer.`,
                `Are you sure you want to delete "${deleteTarget.title}" (/${deleteTarget.slug})? This action cannot be undone.`,
              )
            : ''
        }
        confirmLabel={t('Eliminar', 'Delete')}
        cancelLabel={t('Cancelar', 'Cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
