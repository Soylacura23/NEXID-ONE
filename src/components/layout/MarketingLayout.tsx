import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X, Globe, Presentation } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NexidLogo } from '@/components/ui/NexidLogo';

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { lang, toggleLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/soluciones', label: t('Soluciones', 'Solutions') },
    { to: '/como-funciona', label: t('Cómo funciona', 'How it works') },
    { to: '/demo', label: t('Demostración', 'Demo') },
    { to: '/precios', label: t('Precios', 'Pricing') },
  ];

  const isActive = (to: string) => pathname === to;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* 3-Zone Top Bar Contract */}
      <header
        className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
          scrolled
            ? 'bg-[var(--bg-canvas)]/92 backdrop-blur-md border-[var(--border-subtle)]'
            : 'bg-[var(--bg-canvas)] border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Brand wordmark */}
          <Link
            to="/"
            className="whitespace-nowrap shrink-0 text-[var(--text-primary)] focus-visible:rounded-lg"
          >
            <NexidLogo variant="horizontal" size="md" />
          </Link>

          {/* Zone 2: 4 clean single-line text nav links */}
          <nav aria-label={t('Navegación principal', 'Primary navigation')} className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                  isActive(item.to)
                    ? 'text-[var(--text-primary)] border-[var(--accent-gold)]'
                    : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Primary Action + Mobile Trigger */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to={user ? '/app/dashboard' : '/login'}
              className="hidden sm:inline-block text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              {user ? t('Mi panel', 'Dashboard') : t('Iniciar sesión', 'Sign in')}
            </Link>
            <Link
              to={user ? '/app/identidades' : '/registro'}
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-sm font-semibold text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)] transition-colors whitespace-nowrap shrink-0"
            >
              {user ? t('Mis identidades', 'My identities') : t('Crear cuenta', 'Create account')}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t('Cerrar menú', 'Close menu') : t('Abrir menú', 'Open menu')}
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'bg-[var(--bg-surface-alt)] text-[var(--accent-gold)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/contacto"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]"
                >
                  {t('Contacto', 'Contact')}
                </Link>
                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  <Link
                    to={user ? '/app/dashboard' : '/login'}
                    className="w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-primary)]"
                  >
                    {user ? t('Ir al Dashboard', 'Go to Dashboard') : t('Iniciar sesión', 'Sign in')}
                  </Link>
                  <Link
                    to={user ? '/app/identidades' : '/registro'}
                    className="w-full rounded-xl bg-[var(--accent-gold)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--accent-ink)]"
                  >
                    {user ? t('Mis identidades', 'My identities') : t('Crear cuenta', 'Create account')}
                  </Link>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={toggleLang}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)]"
                    >
                      <Globe className="h-4 w-4" />
                      {lang === 'es' ? 'Español (ES)' : 'English (EN)'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)]"
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {theme === 'dark' ? t('Modo claro', 'Light mode') : t('Modo oscuro', 'Dark mode')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      {/* Editorial Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-4">
              <NexidLogo variant="horizontal" size="md" />
              <p className="max-w-sm text-sm text-[var(--text-muted)] leading-relaxed">
                {t(
                  'Tu identidad profesional, centralizada, conectada y siempre actualizada mediante enlaces web, códigos QR y tarjetas inteligentes NFC.',
                  'Your professional identity, centralized, connected, and always up to date via web links, QR codes, and smart NFC cards.',
                )}
              </p>
              <p className="text-xs font-medium text-[var(--accent-gold)]">
                One identity. Infinite connections.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={toggleLang}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {lang === 'es' ? 'ES · Español' : 'EN · English'}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-colors"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  {theme === 'dark' ? t('Tema claro', 'Light theme') : t('Tema oscuro', 'Dark theme')}
                </button>
                <Link
                  to="/showcase"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--accent-gold)] hover:border-[var(--accent-gold)] transition-colors"
                >
                  <Presentation className="h-3.5 w-3.5" />
                  {t('Modo Presentación', 'Showcase Mode')}
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-[var(--text-primary)] mb-4">
                {t('Plataforma', 'Platform')}
              </h4>
              <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
                <li><Link to="/soluciones" className="hover:text-[var(--text-primary)] transition-colors">{t('Soluciones', 'Solutions')}</Link></li>
                <li><Link to="/como-funciona" className="hover:text-[var(--text-primary)] transition-colors">{t('Cómo funciona', 'How it works')}</Link></li>
                <li><Link to="/demo" className="hover:text-[var(--text-primary)] transition-colors">{t('Experiencia NFC 3D', '3D NFC Experience')}</Link></li>
                <li><Link to="/demo/perfil/alex-rivera" className="hover:text-[var(--text-primary)] transition-colors">{t('Perfil de ejemplo', 'Sample profile')}</Link></li>
                <li><Link to="/precios" className="hover:text-[var(--text-primary)] transition-colors">{t('Planes propuestos', 'Proposed plans')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-[var(--text-primary)] mb-4">
                {t('Soporte', 'Support')}
              </h4>
              <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
                <li><Link to="/faq" className="hover:text-[var(--text-primary)] transition-colors">{t('Preguntas frecuentes', 'FAQ')}</Link></li>
                <li><Link to="/ayuda" className="hover:text-[var(--text-primary)] transition-colors">{t('Centro de ayuda', 'Help Center')}</Link></li>
                <li><Link to="/contacto" className="hover:text-[var(--text-primary)] transition-colors">{t('Contacto', 'Contact')}</Link></li>
                <li><Link to="/showcase" className="hover:text-[var(--text-primary)] transition-colors">{t('NEXID ONE Showcase', 'NEXID ONE Showcase')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-[var(--text-primary)] mb-4">
                {t('Legal y Cuenta', 'Legal & Account')}
              </h4>
              <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
                <li><Link to="/terminos" className="hover:text-[var(--text-primary)] transition-colors">{t('Términos de servicio', 'Terms of service')}</Link></li>
                <li><Link to="/privacidad" className="hover:text-[var(--text-primary)] transition-colors">{t('Política de privacidad', 'Privacy policy')}</Link></li>
                <li><Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">{t('Iniciar sesión', 'Sign in')}</Link></li>
                <li><Link to="/registro" className="hover:text-[var(--text-primary)] transition-colors">{t('Crear cuenta', 'Create account')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>© {new Date().getFullYear()} NEXID ONE. {t('Prototipo comercial en evolución.', 'Commercial prototype.')}</p>
            <p>{t('Una identidad. Infinitas conexiones.', 'One identity. Infinite connections.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
