import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Eye,
  IdCard,
  MousePointerClick,
  Plus,
  QrCode,
  Users,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { analyticsService, cardService, contactService, identityService } from '@/services/dataService';
import { AnalyticsEvent, Card, Contact, Identity } from '@/types/nexid';

export function DashboardPage() {
  const { user, isCloudActive } = useAuth();
  const { t, lang } = useI18n();

  const [identities, setIdentities] = useState<Identity[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    Promise.all([
      identityService.listByOwner(user.uid, isCloudActive),
      cardService.listByOwner(user.uid, isCloudActive),
      contactService.listByOwner(user.uid, isCloudActive),
      analyticsService.listByOwner(user.uid, isCloudActive),
    ])
      .then(([ids, crds, cnts, evts]) => {
        if (!active) return;
        setIdentities(ids);
        setCards(crds);
        setContacts(cnts);
        setEvents(evts);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, isCloudActive]);

  const metrics = useMemo(() => {
    const publishedCount = identities.filter((i) => i.status === 'published').length;
    const activeCards = cards.filter((c) => c.status === 'active').length;
    const profileViews = events.filter((e) => e.eventType === 'profile_view').length;
    const linkClicks = events.filter((e) => e.eventType === 'link_click').length;
    return {
      identitiesCount: identities.length,
      publishedCount,
      activeCards,
      cardsCount: cards.length,
      contactsCount: contacts.length,
      profileViews,
      linkClicks,
    };
  }, [identities, cards, contacts, events]);

  const chartData = useMemo(() => {
    const days: { key: string; label: string; views: number; interactions: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' });
      days.push({ key, label, views: 0, interactions: 0 });
    }
    const map = new Map(days.map((d) => [d.key, d]));
    events.forEach((evt) => {
      const dayKey = evt.timestamp.slice(0, 10);
      const bucket = map.get(dayKey);
      if (!bucket) return;
      if (evt.eventType === 'profile_view') bucket.views += 1;
      else bucket.interactions += 1;
    });
    return days;
  }, [events, lang]);

  const eventLabel = (evt: AnalyticsEvent) => {
    switch (evt.eventType) {
      case 'profile_view':
        return t('Visita a perfil público', 'Public profile view');
      case 'link_click':
        return t('Clic en enlace o proyecto', 'Link or project click');
      case 'vcard_download':
        return t('Descarga de vCard (.vcf)', 'vCard (.vcf) download');
      case 'card_redirect':
        return t('Redirección de tarjeta NFC', 'NFC card redirect');
      case 'share_action':
        return t('Acción de compartir', 'Share action');
      default:
        return evt.eventType;
    }
  };

  return (
    <DashboardLayout
      title={t('Resumen ejecutivo', 'Workspace Overview')}
      breadcrumbs={[{ label: 'NEXID ONE' }, { label: t('Resumen', 'Overview') }]}
      actions={
        <Link
          to="/app/identidades"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-gold)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('Nueva identidad', 'New identity')}
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-[var(--accent-gold)]">
              {t('Espacio de identidad profesional', 'Professional identity workspace')}
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {t('Hola,', 'Welcome,')} {user?.displayName || 'NEXID ONE'}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--text-muted)] max-w-2xl">
              {t(
                'Gestiona tus perfiles públicos, tarjetas NFC virtuales, códigos QR y contactos desde un centro unificado.',
                'Manage your public profiles, virtual NFC cards, QR codes, and contacts from one unified console.',
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/app/compartir"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors whitespace-nowrap shrink-0"
            >
              <QrCode className="h-4 w-4 text-[var(--accent-gold)]" />
              {t('Generar QR y vCard', 'Generate QR & vCard')}
            </Link>
            <Link
              to="/app/tarjetas"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors whitespace-nowrap shrink-0"
            >
              <CreditCard className="h-4 w-4 text-[var(--accent-gold)]" />
              {t('Configurar tarjeta', 'Configure card')}
            </Link>
          </div>
        </section>

        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: t('Identidades digitales', 'Digital identities'),
              value: metrics.identitiesCount,
              detail: `${metrics.publishedCount} ${t('publicadas', 'published')}`,
              icon: IdCard,
              to: '/app/identidades',
            },
            {
              label: t('Tarjetas vinculadas', 'Linked cards'),
              value: metrics.activeCards,
              detail: `${metrics.cardsCount} ${t('en total', 'total')}`,
              icon: CreditCard,
              to: '/app/tarjetas',
            },
            {
              label: t('Contactos guardados', 'Saved contacts'),
              value: metrics.contactsCount,
              detail: t('Red profesional', 'Professional network'),
              icon: Users,
              to: '/app/contactos',
            },
            {
              label: t('Visitas y clics reales', 'Recorded views & clicks'),
              value: metrics.profileViews + metrics.linkClicks,
              detail: `${metrics.profileViews} ${t('visitas', 'views')} · ${metrics.linkClicks} ${t('clics', 'clicks')}`,
              icon: Eye,
              to: '/app/analitica',
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link
                key={kpi.label}
                to={kpi.to}
                className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-muted)]">{kpi.label}</span>
                  <Icon className="h-4 w-4 text-[var(--accent-gold)]" />
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                  {loading ? '—' : kpi.value}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)] tabular-nums flex items-center justify-between">
                  <span>{kpi.detail}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </Link>
            );
          })}
        </section>

        {/* Chart & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[var(--accent-gold)]" />
                  {t('Actividad observable (últimos 14 días)', 'Observable activity (last 14 days)')}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t(
                    'Solo eventos reales registrados cuando visitas perfiles, haces clic en enlaces o descargas vCards.',
                    'Only real events logged when profiles are viewed, links are clicked, or vCards are downloaded.',
                  )}
                </p>
              </div>
              <Link
                to="/app/analitica"
                className="text-xs font-semibold text-[var(--accent-gold)] hover:underline whitespace-nowrap shrink-0"
              >
                {t('Ver analítica', 'Open insights')}
              </Link>
            </div>

            <div className="h-64 w-full">
              {events.length === 0 ? (
                <div className="h-full rounded-xl border border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center p-6 text-center">
                  <MousePointerClick className="h-6 w-6 text-[var(--text-muted)] mb-2" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t('Aún no hay eventos registrados en este espacio.', 'No events recorded in this workspace yet.')}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md">
                    {t(
                      'Abre tu perfil público o prueba una redirección NFC (/t/codigo) para ver actividad real reflejada aquí.',
                      'Open your public profile or test an NFC redirect (/t/code) to see real activity reflected here.',
                    )}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="nxViewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D5B47A" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#D5B47A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(166,171,180,0.16)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#8B919B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#8B919B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#17191D',
                        border: '1px solid #34373D',
                        borderRadius: '12px',
                        color: '#F4F1EB',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name={t('Visitas', 'Views')}
                      stroke="#D5B47A"
                      strokeWidth={2}
                      fill="url(#nxViewsGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="interactions"
                      name={t('Interacciones', 'Interactions')}
                      stroke="#60A5FA"
                      strokeWidth={2}
                      fillOpacity={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 flex flex-col">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)] mb-4">
              {t('Actividad reciente', 'Recent activity')}
            </h3>
            {events.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <p className="text-xs text-[var(--text-muted)]">
                  {t('Sin eventos recientes todavía.', 'No recent events yet.')}
                </p>
                {identities[0] && (
                  <Link
                    to={
                      identities[0].id === 'demo-alex-rivera'
                        ? '/demo/perfil/alex-rivera'
                        : `/perfil/${identities[0].slug}`
                    }
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-gold)] hover:underline"
                  >
                    {t('Abrir perfil público', 'Open public profile')}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                {events.slice(0, 8).map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)] last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">{eventLabel(evt)}</p>
                      <p className="text-[11px] text-[var(--text-muted)] capitalize">
                        {t('Origen:', 'Source:')} {evt.source}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono-tabular text-[var(--text-muted)] shrink-0">
                      {new Date(evt.timestamp).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Active Identities Snapshot */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              {t('Tus identidades configuradas', 'Your configured identities')}
            </h3>
            <Link to="/app/identidades" className="text-xs font-semibold text-[var(--accent-gold)] hover:underline">
              {t('Gestionar todas', 'Manage all')}
            </Link>
          </div>

          {identities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] p-8 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t('Todavía no has creado una identidad digital.', 'You have not created a digital identity yet.')}
              </p>
              <Link
                to="/app/identidades"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-[var(--accent-ink)]"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('Crear primera identidad', 'Create first identity')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {identities.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/40 p-4 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono-tabular text-[var(--accent-gold)]">/{item.slug}</span>
                      <span className="text-[var(--text-muted)] capitalize">{item.status}</span>
                    </div>
                    <h4 className="mt-2 font-display text-base font-bold text-[var(--text-primary)] truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] truncate">{item.profession}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)]">
                    <Link
                      to={`/app/identidades/${item.id}/editar`}
                      className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-gold)]"
                    >
                      {t('Editar perfil', 'Edit profile')}
                    </Link>
                    <Link
                      to={item.id === 'demo-alex-rivera' ? '/demo/perfil/alex-rivera' : `/perfil/${item.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {t('Ver', 'View')}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
