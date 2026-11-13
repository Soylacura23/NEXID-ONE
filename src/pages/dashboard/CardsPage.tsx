import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Info,
  KeyRound,
  Plus,
  Power,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { CardCustomizer3D } from '@/scenes/CardCustomizer/CardCustomizer3D';
import {
  cardService,
  generateCardPublicCode,
  generateId,
  identityService,
  notificationService,
} from '@/services/dataService';
import { Card, CardFinish, CardLayoutStyle, Identity } from '@/types/nexid';
import { buildCardRedirectUrl } from '@/utils/exportUtils';

export function CardsPage() {
  const { user, isCloudActive } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [cards, setCards] = useState<Card[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);
  const [physicalModalOpen, setPhysicalModalOpen] = useState(false);
  const [activationToken, setActivationToken] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    Promise.all([
      cardService.listByOwner(user.uid, isCloudActive),
      identityService.listByOwner(user.uid, isCloudActive),
    ])
      .then(([cardList, idList]) => {
        if (!active) return;
        setCards(cardList);
        setIdentities(idList);
        if (cardList.length > 0) {
          setSelectedId(cardList[0].id);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, isCloudActive]);

  const selectedCard = cards.find((c) => c.id === selectedId) || null;

  const handleCreateVirtualCard = async () => {
    if (!user) return;
    const defaultIdentity = identities[0];
    const now = new Date().toISOString();
    const fresh: Card = {
      id: generateId('crd'),
      ownerId: user.uid,
      publicCode: generateCardPublicCode(),
      identityId: defaultIdentity?.id || '',
      identitySlug: defaultIdentity?.slug || '',
      displayName: defaultIdentity?.title || user.displayName || 'NEXID ONE',
      roleLabel: defaultIdentity?.profession || t('Identidad Digital', 'Digital Identity'),
      finish: 'obsidian',
      layoutStyle: 'monogram',
      status: defaultIdentity ? 'active' : 'unlinked',
      cardType: 'virtual',
      createdAt: now,
      updatedAt: now,
    };

    const saved = await cardService.save(fresh, true, isCloudActive);
    setCards((prev) => [saved, ...prev]);
    setSelectedId(saved.id);
    showToast({
      type: 'success',
      title: t('Tarjeta virtual creada', 'Virtual card created'),
      description: saved.publicCode,
    });
  };

  const updateSelected = async (patch: Partial<Card>) => {
    if (!selectedCard || !user) return;
    setSaving(true);
    try {
      const merged: Card = { ...selectedCard, ...patch };
      const saved = await cardService.save(merged, false, isCloudActive);
      setCards((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      if (patch.identityId && patch.status === 'active') {
        await notificationService.create(
          {
            ownerId: user.uid,
            type: 'card_linked',
            title: t('Tarjeta vinculada', 'Card linked'),
            message: `${saved.publicCode} -> /perfil/${saved.identitySlug}`,
            read: false,
            actionPath: '/app/tarjetas',
          },
          isCloudActive,
        );
      }
      showToast({
        type: 'success',
        title: t('Tarjeta actualizada', 'Card updated'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyRedirect = async (code: string) => {
    const url = buildCardRedirectUrl(code);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
      showToast({
        type: 'success',
        title: t('URL de redirección copiada', 'Redirect URL copied'),
        description: url,
      });
    } catch {
      showToast({ type: 'info', title: t('URL de tarjeta', 'Card URL'), description: url });
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteTarget) return;
    await cardService.remove(deleteTarget.id, user.uid, isCloudActive);
    const remaining = cards.filter((c) => c.id !== deleteTarget.id);
    setCards(remaining);
    if (selectedId === deleteTarget.id) {
      setSelectedId(remaining[0]?.id || null);
    }
    setDeleteTarget(null);
    showToast({ type: 'success', title: t('Tarjeta eliminada', 'Card deleted') });
  };

  const handlePhysicalClaimAttempt = () => {
    if (!activationToken.trim()) {
      showToast({
        type: 'warning',
        title: t('Ingresa un token de activación', 'Enter an activation token'),
      });
      return;
    }
    showToast({
      type: 'info',
      title: t('Validación de lote físico', 'Physical batch validation'),
      description: t(
        'Las tarjetas físicas pre-emitidas requieren verificación de lote emitida por NEXID ONE en servidor. Utiliza tarjetas virtuales en este entorno web.',
        'Pre-issued physical cards require server-side NEXID ONE batch verification. Use virtual cards in this web workspace.',
      ),
    });
    setPhysicalModalOpen(false);
    setActivationToken('');
  };

  return (
    <DashboardLayout
      title={t('Tarjetas NFC y personalizador 3D', 'NFC Cards & 3D Customizer')}
      breadcrumbs={[{ label: 'NEXID ONE', to: '/app/dashboard' }, { label: t('Tarjetas NFC', 'NFC Cards') }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPhysicalModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors whitespace-nowrap shrink-0"
          >
            <KeyRound className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
            {t('Activar tarjeta física', 'Claim physical card')}
          </button>
          <button
            type="button"
            onClick={handleCreateVirtualCard}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-gold)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('Nueva tarjeta virtual', 'New virtual card')}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Hardware boundary notice */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-[var(--accent-gold)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {t(
              'Las tarjetas virtuales generan un enlace corto persistente (/t/codigo) y vista previa 3D interactiva. Las tarjetas NFC físicas se entregan pre-grabadas de fábrica con código de activación; el navegador no graba chips físicos directamente.',
              'Virtual cards generate a persistent short redirect (/t/code) and interactive 3D preview. Physical NFC cards ship factory-encoded with a claim token; browsers do not program physical NFC chips directly.',
            )}
          </p>
        </div>

        {loading ? (
          <div className="h-96 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] animate-pulse" />
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
            <CreditCard className="h-8 w-8 text-[var(--accent-gold)] mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              {t('Aún no tienes tarjetas configuradas', 'You do not have any cards yet')}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)] max-w-md mx-auto">
              {t(
                'Crea tu primera tarjeta virtual para personalizar su acabado en 3D y vincularla a una identidad pública.',
                'Create your first virtual card to customize its 3D finish and link it to a public identity.',
              )}
            </p>
            <button
              type="button"
              onClick={handleCreateVirtualCard}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-ink)]"
            >
              <Plus className="h-4 w-4" />
              {t('Crear tarjeta virtual', 'Create virtual card')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Cards Selector */}
            <div className="lg:col-span-4 space-y-3">
              {cards.map((card) => {
                const selected = card.id === selectedCard?.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedId(card.id)}
                    className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                      selected
                        ? 'border-[var(--accent-gold)] bg-[var(--bg-surface)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono-tabular font-semibold text-[var(--accent-gold)]">
                        {card.publicCode}
                      </span>
                      <span
                        className={
                          card.status === 'active'
                            ? 'text-[var(--semantic-success)] font-medium'
                            : 'text-[var(--text-muted)]'
                        }
                      >
                        {card.status === 'active'
                          ? t('Activa', 'Active')
                          : card.status === 'disabled'
                            ? t('Desactivada', 'Disabled')
                            : t('Sin vincular', 'Unlinked')}
                      </span>
                    </div>
                    <p className="mt-2 font-display text-sm font-bold text-[var(--text-primary)] truncate">
                      {card.displayName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {card.identitySlug ? `-> /perfil/${card.identitySlug}` : t('Sin identidad asignada', 'No linked identity')}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right 3D Customizer & Controls */}
            {selectedCard && (
              <div className="lg:col-span-8 space-y-6">
                <CardCustomizer3D
                  displayName={selectedCard.displayName}
                  roleLabel={selectedCard.roleLabel || ''}
                  publicCode={selectedCard.publicCode}
                  finish={selectedCard.finish}
                  layoutStyle={selectedCard.layoutStyle}
                />

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">{t('Enlace corto NFC', 'NFC short redirect')}</p>
                      <p className="font-mono-tabular text-sm font-semibold text-[var(--text-primary)]">
                        /t/{selectedCard.publicCode}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyRedirect(selectedCard.publicCode)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                      >
                        {copiedCode ? <Check className="h-3.5 w-3.5 text-[var(--semantic-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                        {t('Copiar enlace', 'Copy link')}
                      </button>
                      <Link
                        to={`/t/${selectedCard.publicCode}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('Probar redirección', 'Test redirect')}
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        {t('Identidad vinculada', 'Linked identity')}
                      </label>
                      <select
                        value={selectedCard.identityId || ''}
                        onChange={(e) => {
                          const target = identities.find((i) => i.id === e.target.value);
                          updateSelected({
                            identityId: target?.id || '',
                            identitySlug: target?.slug || '',
                            status: target ? 'active' : 'unlinked',
                          });
                        }}
                        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      >
                        <option value="">{t('Sin vincular', 'Unlinked')}</option>
                        {identities.map((idn) => (
                          <option key={idn.id} value={idn.id}>
                            {idn.title} (/{idn.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        {t('Acabado del material', 'Card finish')}
                      </label>
                      <select
                        value={selectedCard.finish}
                        onChange={(e) => updateSelected({ finish: e.target.value as CardFinish })}
                        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      >
                        <option value="obsidian">Obsidian Matte</option>
                        <option value="graphite">Brushed Graphite</option>
                        <option value="gold">Brushed Gold</option>
                        <option value="ivory">Warm Ivory</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        {t('Nombre grabado', 'Engraved name')}
                      </label>
                      <input
                        type="text"
                        value={selectedCard.displayName}
                        onChange={(e) =>
                          setCards((prev) =>
                            prev.map((c) => (c.id === selectedCard.id ? { ...c, displayName: e.target.value } : c)),
                          )
                        }
                        onBlur={(e) => updateSelected({ displayName: e.target.value })}
                        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        {t('Cargo o subtítulo', 'Role subtitle')}
                      </label>
                      <input
                        type="text"
                        value={selectedCard.roleLabel || ''}
                        onChange={(e) =>
                          setCards((prev) =>
                            prev.map((c) => (c.id === selectedCard.id ? { ...c, roleLabel: e.target.value } : c)),
                          )
                        }
                        onBlur={(e) => updateSelected({ roleLabel: e.target.value })}
                        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        {t('Diseño frontal', 'Front layout')}
                      </label>
                      <select
                        value={selectedCard.layoutStyle}
                        onChange={(e) => updateSelected({ layoutStyle: e.target.value as CardLayoutStyle })}
                        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      >
                        <option value="monogram">Monogram</option>
                        <option value="minimal">Minimal</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        updateSelected({
                          status: selectedCard.status === 'active' ? 'disabled' : 'active',
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
                    >
                      <Power className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                      {selectedCard.status === 'active'
                        ? t('Desactivar redirección', 'Disable redirect')
                        : t('Activar redirección', 'Enable redirect')}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(selectedCard)}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-[var(--semantic-error)] hover:bg-[var(--semantic-error)]/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('Eliminar tarjeta', 'Delete card')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Physical Card Claim Modal */}
      {physicalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
              {t('Activar tarjeta física pre-emitida', 'Claim pre-issued physical card')}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {t(
                'Las tarjetas físicas NEXID ONE incluyen un código único impreso y pre-grabado de fábrica. Ingresa tu código de activación para verificar el lote.',
                'Physical NEXID ONE cards include a unique factory-encoded claim token. Enter your activation token to verify batch eligibility.',
              )}
            </p>
            <input
              type="text"
              value={activationToken}
              onChange={(e) => setActivationToken(e.target.value)}
              placeholder="NX-CLAIM-XXXX-XXXX"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm font-mono-tabular"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPhysicalModalOpen(false)}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]"
              >
                {t('Cancelar', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handlePhysicalClaimAttempt}
                className="rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
              >
                {t('Verificar código', 'Verify token')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        destructive
        title={t('Eliminar tarjeta virtual', 'Delete virtual card')}
        description={
          deleteTarget
            ? t(
                `¿Eliminar la tarjeta ${deleteTarget.publicCode}? Su URL /t/${deleteTarget.publicCode} dejará de redirigir.`,
                `Delete card ${deleteTarget.publicCode}? Its /t/${deleteTarget.publicCode} link will stop redirecting.`,
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
