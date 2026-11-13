import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, Eye, Info, MousePointerClick, Radio, Share2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { analyticsService, identityService } from '@/services/dataService';
import { AnalyticsEvent, Identity } from '@/types/nexid';

export function AnalyticsPage() {
  const { user, isCloudActive } = useAuth();
  const { t, lang } = useI18n();

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [identityFilter, setIdentityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    Promise.all([
      analyticsService.listByOwner(user.uid, isCloudActive),
      identityService.listByOwner(user.uid, isCloudActive),
    ])
      .then(([evtList, idList]) => {
        if (!active) return;
        setEvents(evtList);
        setIdentities(idList);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, isCloudActive]);

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const maxAgeMs = range === '7d' ? 7 * 86400000 : range === '30d' ? 30 * 86400000 : Infinity;
    return events.filter((evt) => {
      if (identityFilter !== 'all' && evt.identityId !== identityFilter) return false;
      if (maxAgeMs !== Infinity) {
        const ts = new Date(evt.timestamp).getTime();
        if (now - ts > maxAgeMs) return false;
      }
      return true;
    });
  }, [events, range, identityFilter]);

  const totals = useMemo(() => {
    return {
      profileViews: filteredEvents.filter((e) => e.eventType === 'profile_view').length,
      linkClicks: filteredEvents.filter((e) => e.eventType === 'link_click').length,
      vcardDownloads: filteredEvents.filter((e) => e.eventType === 'vcard_download').length,
      cardRedirects: filteredEvents.filter((e) => e.eventType === 'card_redirect').length,
      shareActions: filteredEvents.filter((e) => e.eventType === 'share_action').length,
    };
  }, [filteredEvents]);

  const dailySeries = useMemo(() => {
    const daysCount = range === '7d' ? 7 : 14;
    const buckets: { key: string; label: string; views: number; clicks: number; vcards: number }[] = [];
    const now = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' });
      buckets.push({ key, label, views: 0, clicks: 0, vcards: 0 });
    }
    const map = new Map(buckets.map((b) => [b.key, b]));
    filteredEvents.forEach((evt) => {
      const bucket = map.get(evt.timestamp.slice(0, 10));
      if (!bucket) return;
      if (evt.eventType === 'profile_view') bucket.views += 1;
      else if (evt.eventType === 'link_click') bucket.clicks += 1;
      else if (evt.eventType === 'vcard_download') bucket.vcards += 1;
    });
    return buckets;
  }, [filteredEvents, range, lang]);

  const sourceSeries = useMemo(() => {
    const counts = { web: 0, qr: 0, nfc_redirect: 0, direct: 0 };
    filteredEvents.forEach((e) => {
      if (e.source in counts) counts[e.source as keyof typeof counts] += 1;
    });
    return [
      { source: 'Web', total: counts.web },
      { source: 'NFC (/t)', total: counts.nfc_redirect },
      { source: 'QR', total: counts.qr },
      { source: t('Directo', 'Direct'), total: counts.direct },
    ];
  }, [filteredEvents, t]);

  return (
    <DashboardLayout
      title={t('NEXID ONE Insights', 'NEXID ONE Insights')}
      breadcrumbs={[{ label: 'NEXID ONE', to: '/app/dashboard' }, { label: t('Analítica', 'Insights') }]}
    >
      <div className="space-y-6">
        {/* Transparency banner */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-[var(--accent-gold)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {t(
              'Métricas provisionales registradas directamente desde eventos reales del cliente (visitas a perfiles, clics en enlaces, descargas de vCard, redirecciones NFC y acciones de compartir). No se muestran proyecciones simuladas ni visitas sintéticas.',
              'Provisional metrics logged directly from real client events (profile views, link clicks, vCard downloads, NFC redirects, and share actions). No synthetic or projected numbers are shown.',
            )}
          </p>
        </div>

        {/* Filter bar */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(
              [
                { id: '7d', label: t('7 días', '7 days') },
                { id: '30d', label: t('30 días', '30 days') },
                { id: 'all', label: t('Todo el historial', 'All time') },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  range === r.id
                    ? 'bg-[var(--accent-gold)] text-[var(--accent-ink)]'
                    : 'border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <select
            value={identityFilter}
            onChange={(e) => setIdentityFilter(e.target.value)}
            aria-label={t('Filtrar por identidad', 'Filter by identity')}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs font-medium"
          >
            <option value="all">{t('Todas las identidades', 'All identities')}</option>
            {identities.map((idn) => (
              <option key={idn.id} value={idn.id}>
                {idn.title} (/{idn.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Observable event totals */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: t('Visitas a perfil', 'Profile views'), value: totals.profileViews, icon: Eye },
            { label: t('Clics en enlaces', 'Link clicks'), value: totals.linkClicks, icon: MousePointerClick },
            { label: t('Descargas vCard', 'vCard downloads'), value: totals.vcardDownloads, icon: Download },
            { label: t('Redirecciones NFC', 'NFC redirects'), value: totals.cardRedirects, icon: Radio },
            { label: t('Compartidos', 'Share actions'), value: totals.shareActions, icon: Share2 },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{stat.label}</span>
                  <Icon className="h-4 w-4 text-[var(--accent-gold)]" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                  {loading ? '—' : stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
            <BarChart3 className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="font-display text-base font-semibold text-[var(--text-primary)]">
              {t('Sin eventos observables en este rango', 'No observable events in this range')}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md mx-auto">
              {t(
                'Cuando alguien abra tus perfiles públicos, descargue una vCard o utilice un enlace /t/codigo, los gráficos se actualizarán automáticamente.',
                'When visitors open your public profiles, download a vCard, or visit a /t/code link, charts update automatically.',
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
              <h3 className="font-display text-base font-semibold text-[var(--text-primary)] mb-5">
                {t('Evolución diaria de eventos', 'Daily event evolution')}
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
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
                    <Area type="monotone" dataKey="views" name={t('Visitas', 'Views')} stroke="#D5B47A" fill="#D5B47A" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="clicks" name={t('Clics', 'Clicks')} stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="vcards" name="vCard" stroke="#34D399" fill="#34D399" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
              <h3 className="font-display text-base font-semibold text-[var(--text-primary)] mb-5">
                {t('Eventos por origen', 'Events by source')}
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceSeries} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(166,171,180,0.16)" vertical={false} />
                    <XAxis dataKey="source" tick={{ fill: '#8B919B', fontSize: 11 }} axisLine={false} tickLine={false} />
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
                    <Bar dataKey="total" name={t('Eventos', 'Events')} fill="#D5B47A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
