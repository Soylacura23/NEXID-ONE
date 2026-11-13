import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Database, Lock, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { adminService } from '@/services/dataService';
import { firebaseProjectId, isFirebaseConfigured } from '@/services/firebase/client';
import { AdminAudit } from '@/types/nexid';

export function AdminPage() {
  const { user, isAdmin, isCloudActive } = useAuth();
  const { t } = useI18n();
  const [logs, setLogs] = useState<AdminAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    let active = true;
    adminService
      .listAuditLogs()
      .then((list) => {
        if (active) setLogs(list);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  return (
    <DashboardLayout
      title={t('Consola administrativa', 'Admin Console')}
      breadcrumbs={[{ label: 'NEXID ONE', to: '/app/dashboard' }, { label: t('Administración', 'Admin') }]}
    >
      {!isAdmin ? (
        <div className="max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 space-y-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--semantic-warning)]/15 text-[var(--semantic-warning)]">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
            {t('Acceso restringido a administradores', 'Administrator access restricted')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {t(
              'Esta vista está protegida mediante Firebase Authentication y reglas de seguridad de Firestore para administradores verificados.',
              'This view is protected by Firebase Authentication and Firestore security rules for verified administrators.',
            )}
          </p>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
          >
            {t('Volver al panel', 'Return to dashboard')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{t('Proyecto Firebase', 'Firebase project')}</span>
                <Database className="h-4 w-4 text-[var(--accent-gold)]" />
              </div>
              <p className="mt-2 font-mono-tabular text-sm font-semibold text-[var(--text-primary)]">
                {firebaseProjectId || t('Local', 'Local')}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{t('Estado Firestore', 'Firestore status')}</span>
                <Activity className="h-4 w-4 text-[var(--semantic-success)]" />
              </div>
              <p className="mt-2 font-display text-sm font-semibold text-[var(--text-primary)]">
                {isFirebaseConfigured && isCloudActive ? t('Conectado en vivo', 'Connected live') : t('Modo local', 'Local mode')}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{t('Administrador verificado', 'Verified admin')}</span>
                <Shield className="h-4 w-4 text-[var(--accent-gold)]" />
              </div>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)] truncate">{user?.email}</p>
            </div>
          </div>

          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              {t('Registro de auditoría administrativa (adminAudit)', 'Administrative audit log (adminAudit)')}
            </h2>
            {loading ? (
              <div className="h-40 rounded-xl bg-[var(--bg-surface-alt)] animate-pulse" />
            ) : logs.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-6">
                {t(
                  'No hay eventos administrativos registrados en la colección adminAudit.',
                  'No administrative audit events recorded in adminAudit yet.',
                )}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                      <th className="py-2 pr-4">{t('Acción', 'Action')}</th>
                      <th className="py-2 pr-4">{t('Objetivo', 'Target')}</th>
                      <th className="py-2 pr-4">{t('Actor', 'Actor')}</th>
                      <th className="py-2">{t('Fecha', 'Timestamp')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-[var(--border-subtle)]/50">
                        <td className="py-2.5 pr-4 font-semibold text-[var(--text-primary)]">{log.action}</td>
                        <td className="py-2.5 pr-4 font-mono-tabular text-[var(--text-secondary)]">
                          {log.targetType}:{log.targetId}
                        </td>
                        <td className="py-2.5 pr-4 font-mono-tabular text-[var(--text-muted)]">{log.actorId}</td>
                        <td className="py-2.5 font-mono-tabular text-[var(--text-muted)]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
