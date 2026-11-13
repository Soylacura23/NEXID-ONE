import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Globe, Moon, ShieldCheck, Sun, Trash2, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { cardService, contactService, identityService, userService } from '@/services/dataService';
import { downloadTextFile } from '@/utils/exportUtils';

export function SettingsPage() {
  const { user, isDemoMode, isCloudActive, updateAccountProfile, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateAccountProfile({
        displayName: displayName.trim() || user.displayName,
        photoURL: photoURL.trim(),
        themePreference: theme,
        languagePreference: lang,
      });
      showToast({
        type: 'success',
        title: t('Preferencias guardadas', 'Preferences saved'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = async () => {
    if (!user) return;
    const [identities, cards, contacts] = await Promise.all([
      identityService.listByOwner(user.uid, isCloudActive),
      cardService.listByOwner(user.uid, isCloudActive),
      contactService.listByOwner(user.uid, isCloudActive),
    ]);
    const bundle = {
      exportedAt: new Date().toISOString(),
      account: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      },
      identities,
      cards,
      contacts,
    };
    downloadTextFile('nexid-one-export.json', JSON.stringify(bundle, null, 2), 'application/json');
    showToast({ type: 'success', title: t('Datos exportados en JSON', 'JSON data exported') });
  };

  const handleDeleteAllData = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await userService.deleteAccountData(user.uid);
      await logout();
      setDeleteOpen(false);
      showToast({
        type: 'info',
        title: t('Datos de cuenta eliminados', 'Account data deleted'),
      });
      navigate('/');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title={t('Ajustes de cuenta', 'Account Settings')}
      breadcrumbs={[{ label: 'NEXID ONE', to: '/app/dashboard' }, { label: t('Ajustes', 'Settings') }]}
    >
      <div className="max-w-3xl space-y-6">
        {/* Account Form */}
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <User className="h-5 w-5 text-[var(--accent-gold)]" />
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                {t('Perfil y preferencias', 'Profile & preferences')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {isDemoMode
                  ? t('Sesión local en Modo Demo', 'Local Demo Mode session')
                  : isCloudActive
                    ? t('Sincronizado con Firebase Firestore', 'Synced with Firebase Firestore')
                    : t('Almacenamiento local', 'Local storage')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                {t('Nombre visible', 'Display name')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                {t('Correo de la cuenta', 'Account email')}
              </label>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 px-3 py-2 text-sm text-[var(--text-muted)]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                {t('URL de foto de perfil (opcional)', 'Profile photo URL (optional)')}
              </label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <span className="block text-xs font-medium text-[var(--text-secondary)]">{t('Tema visual', 'Color theme')}</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold ${
                    theme === 'dark'
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  {t('Obsidiana', 'Dark')}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold ${
                    theme === 'light'
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  {t('Alabastro', 'Light')}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-[var(--text-secondary)]">{t('Idioma de interfaz', 'Interface language')}</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold ${
                    lang === 'es'
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Español
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold ${
                    lang === 'en'
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  English
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--accent-gold)] px-5 py-2.5 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)]"
            >
              {saving ? t('Guardando...', 'Saving...') : t('Guardar preferencias', 'Save preferences')}
            </button>
          </div>
        </form>

        {/* Security & Data Portability */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--accent-gold)]" />
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                {t('Portabilidad y privacidad', 'Data portability & privacy')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t(
                  'Descarga una copia completa de tus identidades, tarjetas y contactos en JSON o elimina tus datos locales/cloud.',
                  'Download a complete JSON backup of your identities, cards, and contacts or clear your account data.',
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
            >
              <Download className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
              {t('Exportar respaldo JSON', 'Export JSON backup')}
            </button>

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--semantic-error)]/40 px-4 py-2.5 text-xs font-semibold text-[var(--semantic-error)] hover:bg-[var(--semantic-error)]/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('Eliminar datos de la cuenta', 'Delete account data')}
            </button>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={deleteOpen}
        destructive
        loading={deleting}
        title={t('Eliminar datos de NEXID ONE', 'Delete NEXID ONE data')}
        description={t(
          'Esta acción eliminará tus identidades, tarjetas, contactos y notificaciones del espacio actual y cerrará tu sesión.',
          'This action will delete your identities, cards, contacts, and notifications from this workspace and sign you out.',
        )}
        confirmLabel={t('Eliminar todo', 'Delete everything')}
        cancelLabel={t('Cancelar', 'Cancel')}
        onConfirm={handleDeleteAllData}
        onCancel={() => setDeleteOpen(false)}
      />
    </DashboardLayout>
  );
}
