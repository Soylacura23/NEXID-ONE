import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Presentation,
  QrCode,
  Settings,
  Shield,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { notificationService } from '@/services/dataService';
import { AppNotification } from '@/types/nexid';
import { NexidLogo } from '@/components/ui/NexidLogo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, breadcrumbs, actions }: DashboardLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isDemoMode, isCloudActive, isAdmin, logout } = useAuth();
  const { lang, toggleLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    notificationService.listByOwner(user.uid, isCloudActive).then((list) => {
      if (active) setNotifications(list);
    });
    return () => {
      active = false;
    };
  }, [user, isCloudActive, pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = async (item: AppNotification) => {
    if (!user) return;
    if (!item.read) {
      await notificationService.markRead(item.id, user.uid, isCloudActive);
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    }
    if (item.actionPath) {
      setNotifOpen(false);
      navigate(item.actionPath);
    }
  };

  const navItems = [
    { to: '/app/dashboard', label: t('Resumen', 'Overview'), icon: LayoutDashboard },
    { to: '/app/identidades', label: t('Mis identidades', 'Identities'), icon: IdCard },
    { to: '/app/tarjetas', label: t('Tarjetas NFC', 'NFC Cards'), icon: CreditCard },
    { to: '/app/compartir', label: t('Compartir y QR', 'Share & QR'), icon: QrCode },
    { to: '/app/contactos', label: t('Contactos', 'Contacts'), icon: Users },
    { to: '/app/analitica', label: t('Analítica', 'Insights'), icon: BarChart3 },
    { to: '/app/ajustes', label: t('Ajustes', 'Settings'), icon: Settings },
  ];

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-200 ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
          <Link to="/" className="overflow-hidden">
            <NexidLogo variant={collapsed ? 'mark' : 'horizontal'} size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? t('Expandir barra lateral', 'Expand sidebar') : t('Colapsar barra lateral', 'Collapse sidebar')}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav aria-label={t('Navegación del panel', 'Dashboard navigation')} className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--bg-surface-alt)] text-[var(--accent-gold)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)]/60 hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-[var(--bg-surface-alt)] text-[var(--accent-gold)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)]/60 hover:text-[var(--text-primary)]'
              }`}
            >
              <Shield className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{t('Administración', 'Admin')}</span>}
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          <Link
            to="/showcase"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
          >
            <Presentation className="h-4 w-4 text-[var(--accent-gold)] shrink-0" />
            {!collapsed && <span>{t('Modo Presentación', 'Showcase Mode')}</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--semantic-error)] transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t('Cerrar sesión', 'Sign out')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('Abrir menú', 'Open menu')}
              className="md:hidden rounded-lg border border-[var(--border-subtle)] p-2 text-[var(--text-primary)]"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  {breadcrumbs.map((b, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span aria-hidden="true">/</span>}
                      {b.to ? (
                        <Link to={b.to} className="hover:text-[var(--text-primary)] truncate">
                          {b.label}
                        </Link>
                      ) : (
                        <span className="truncate">{b.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
              <h1 className="font-display text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions}

            <button
              type="button"
              onClick={toggleLang}
              aria-label={t('Cambiar idioma', 'Switch language')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang.toUpperCase()}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('Cambiar tema', 'Toggle theme')}
              className="rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label={t('Notificaciones', 'Notifications')}
                className="relative rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-gold)] px-1 text-[10px] font-bold text-[var(--accent-ink)] tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shadow-2xl z-40"
                  >
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--border-subtle)]">
                      <span className="font-display text-xs font-semibold text-[var(--text-primary)]">
                        {t('Notificaciones', 'Notifications')}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {unreadCount} {t('sin leer', 'unread')}
                      </span>
                    </div>
                    <div className="mt-2 max-h-72 overflow-y-auto space-y-1">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                          {t('No hay notificaciones recientes.', 'No recent notifications.')}
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => markNotificationRead(n)}
                            className={`w-full text-left rounded-xl p-2.5 transition-colors ${
                              n.read ? 'hover:bg-[var(--bg-surface-alt)]/60' : 'bg-[var(--bg-surface-alt)]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[var(--text-primary)]">{n.title}</span>
                              {!n.read && (
                                <span className="text-[11px] font-medium text-[var(--accent-gold)]">
                                  {t('Nueva', 'New')}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">{n.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Badge */}
            <Link
              to="/app/ajustes"
              className="hidden sm:flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pl-2 pr-3 py-1.5 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="h-6 w-6 rounded-lg bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] flex items-center justify-center text-xs font-bold">
                {(user?.displayName || 'N').slice(0, 1).toUpperCase()}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-[var(--text-primary)] max-w-[120px] truncate">
                  {user?.displayName || 'NEXID ONE'}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isDemoMode ? t('Modo Demo', 'Demo Mode') : isCloudActive ? 'Firestore' : t('Local', 'Local')}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label={t('Navegación móvil', 'Mobile navigation')}
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around"
      >
        {[
          { to: '/app/dashboard', label: t('Panel', 'Home'), icon: LayoutDashboard },
          { to: '/app/identidades', label: t('Perfiles', 'Profiles'), icon: IdCard },
          { to: '/app/tarjetas', label: t('Tarjetas', 'Cards'), icon: CreditCard },
          { to: '/app/compartir', label: 'QR', icon: QrCode },
          { to: '/app/contactos', label: t('Red', 'Network'), icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                active ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-72 max-w-[82vw] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col p-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <NexidLogo variant="horizontal" size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t('Cerrar menú', 'Close menu')}
                  className="rounded-lg p-1.5 text-[var(--text-muted)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        isActive(item.to)
                          ? 'bg-[var(--bg-surface-alt)] text-[var(--accent-gold)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)]"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{t('Administración', 'Admin')}</span>
                  </Link>
                )}
              </div>
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
                <button
                  type="button"
                  onClick={toggleLang}
                  className="w-full flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium"
                >
                  <span>{t('Idioma', 'Language')}</span>
                  <span>{lang.toUpperCase()}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[var(--semantic-error)]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('Cerrar sesión', 'Sign out')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
