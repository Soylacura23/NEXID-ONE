import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { contactService, generateId } from '@/services/dataService';
import { Contact } from '@/types/nexid';
import { buildContactVCard, downloadTextFile, exportContactsToCsv } from '@/utils/exportUtils';

const EMPTY_FORM = {
  id: '',
  name: '',
  organization: '',
  role: '',
  email: '',
  phone: '',
  tagsRaw: '',
  notes: '',
};

export function ContactsPage() {
  const { user, isCloudActive } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    contactService
      .listByOwner(user.uid, isCloudActive)
      .then((list) => {
        if (active) setContacts(list);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, isCloudActive]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => (c.tags || []).forEach((tg) => set.add(tg)));
    return Array.from(set).sort();
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return contacts.filter((c) => {
      if (tagFilter !== 'all' && !(c.tags || []).includes(tagFilter)) return false;
      if (q) {
        const hay = `${c.name} ${c.organization || ''} ${c.role || ''} ${c.email || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [contacts, searchQuery, tagFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Contact) => {
    setForm({
      id: c.id,
      name: c.name,
      organization: c.organization || '',
      role: c.role || '',
      email: c.email || '',
      phone: c.phone || '',
      tagsRaw: (c.tags || []).join(', '),
      notes: c.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) {
      showToast({ type: 'error', title: t('Ingresa el nombre del contacto', 'Contact name is required') });
      return;
    }

    setSaving(true);
    try {
      const isNew = !form.id;
      const existing = isNew ? null : contacts.find((c) => c.id === form.id);
      const now = new Date().toISOString();
      const payload: Contact = {
        id: form.id || generateId('cnt'),
        ownerId: user.uid,
        name: form.name.trim(),
        organization: form.organization.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        tags: form.tagsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        notes: form.notes.trim(),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      const saved = await contactService.save(payload, isNew, isCloudActive);
      setContacts((prev) => (isNew ? [saved, ...prev] : prev.map((c) => (c.id === saved.id ? saved : c))));
      setModalOpen(false);
      showToast({
        type: 'success',
        title: isNew ? t('Contacto guardado', 'Contact saved') : t('Contacto actualizado', 'Contact updated'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteTarget) return;
    await contactService.remove(deleteTarget.id, user.uid, isCloudActive);
    setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast({ type: 'success', title: t('Contacto eliminado', 'Contact deleted') });
  };

  const handleExportCsv = () => {
    if (contacts.length === 0) return;
    const csv = exportContactsToCsv(contacts);
    downloadTextFile('nexid-contactos.csv', csv, 'text/csv;charset=utf-8');
    showToast({ type: 'success', title: t('CSV exportado', 'CSV exported') });
  };

  return (
    <DashboardLayout
      title={t('Agenda y contactos', 'Contacts & CRM')}
      breadcrumbs={[{ label: 'NEXID ONE', to: '/app/dashboard' }, { label: t('Contactos', 'Contacts') }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={contacts.length === 0}
            onClick={handleExportCsv}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
            {t('Exportar CSV', 'Export CSV')}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-gold)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('Nuevo contacto', 'New contact')}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Tag Filter */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Buscar por nombre, organización o correo...', 'Search by name, company, or email...')}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            aria-label={t('Filtrar por etiqueta', 'Filter by tag')}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs font-medium"
          >
            <option value="all">{t('Todas las etiquetas', 'All tags')}</option>
            {allTags.map((tg) => (
              <option key={tg} value={tg}>
                {tg}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="h-72 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-pulse" />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
            <Users className="h-8 w-8 text-[var(--accent-gold)] mx-auto mb-3" />
            <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
              {t('Sin contactos registrados', 'No contacts found')}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {t('Añade tus contactos clave para organizar notas y exportar vCards.', 'Add key contacts to organize notes and export vCards.')}
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t('Añadir contacto', 'Add contact')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-[var(--text-primary)]">{c.name}</h3>
                      <p className="text-xs text-[var(--accent-gold)] font-medium">
                        {[c.role, c.organization].filter(Boolean).join(' · ') || t('Contacto profesional', 'Professional contact')}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono-tabular text-[var(--text-muted)] shrink-0">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {c.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <p className="mt-3 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">{c.notes}</p>
                  )}

                  {c.tags && c.tags.length > 0 && (
                    <p className="mt-3 text-[11px] font-medium text-[var(--text-muted)]">{c.tags.join(' · ')}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => {
                      downloadTextFile(
                        `${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.vcf`,
                        buildContactVCard(c),
                        'text/vcard;charset=utf-8',
                      );
                      showToast({ type: 'success', title: t('vCard descargada', 'vCard downloaded') });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-gold)] hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    vCard
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      title={t('Editar', 'Edit')}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      title={t('Eliminar', 'Delete')}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--semantic-error)]/15 hover:text-[var(--semantic-error)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
              {form.id ? t('Editar contacto', 'Edit contact') : t('Nuevo contacto', 'New contact')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{t('Nombre completo*', 'Full name*')}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{t('Organización', 'Organization')}</label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{t('Cargo', 'Role')}</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{t('Correo', 'Email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{t('Teléfono', 'Phone')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {t('Etiquetas (separadas por coma)', 'Tags (comma-separated)')}
                </label>
                <input
                  type="text"
                  value={form.tagsRaw}
                  onChange={(e) => setForm({ ...form, tagsRaw: e.target.value })}
                  placeholder="Diseño, Partner, Evento 2026"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{t('Notas', 'Notes')}</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]"
              >
                {t('Cancelar', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
              >
                {saving ? '...' : t('Guardar contacto', 'Save contact')}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        destructive
        title={t('Eliminar contacto', 'Delete contact')}
        description={
          deleteTarget
            ? t(`¿Eliminar a "${deleteTarget.name}" de tu agenda?`, `Remove "${deleteTarget.name}" from your contacts?`)
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
