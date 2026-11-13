import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import AOS from 'aos';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

// Marketing Pages
import { ContactPage } from '@/pages/marketing/ContactPage';
import { FaqPage } from '@/pages/marketing/FaqPage';
import { HelpCenterPage } from '@/pages/marketing/HelpCenterPage';
import { HowItWorksPage } from '@/pages/marketing/HowItWorksPage';
import { LandingPage } from '@/pages/marketing/LandingPage';
import { LegalPage } from '@/pages/marketing/LegalPage';
import { PricingPage } from '@/pages/marketing/PricingPage';
import { SolutionsPage } from '@/pages/marketing/SolutionsPage';

// Public & Demo Pages
import { CardRedirectPage } from '@/pages/public/CardRedirectPage';
import { DemoNfcPage } from '@/pages/public/DemoNfcPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { PublicProfilePage } from '@/pages/public/PublicProfilePage';
import { ShowcasePage } from '@/pages/public/ShowcasePage';

// Auth & Onboarding
import { AuthPages } from '@/pages/auth/AuthPages';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';

// Dashboard & Admin
import { AdminPage } from '@/pages/admin/AdminPage';
import { AnalyticsPage } from '@/pages/dashboard/AnalyticsPage';
import { CardsPage } from '@/pages/dashboard/CardsPage';
import { ContactsPage } from '@/pages/dashboard/ContactsPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { IdentitiesPage } from '@/pages/dashboard/IdentitiesPage';
import { IdentityEditorPage } from '@/pages/dashboard/IdentityEditorPage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';
import { ShareQrPage } from '@/pages/dashboard/ShareQrPage';

function ScrollAndAosManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    AOS.refresh();
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollAndAosManager />
              <Routes>
                {/* Public Marketing */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/soluciones" element={<SolutionsPage />} />
                <Route path="/como-funciona" element={<HowItWorksPage />} />
                <Route path="/precios" element={<PricingPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/ayuda" element={<HelpCenterPage />} />
                <Route path="/terminos" element={<LegalPage type="terms" />} />
                <Route path="/privacidad" element={<LegalPage type="privacy" />} />

                {/* Interactive Demo, Public Profiles, Card Redirects & Showcase */}
                <Route path="/demo" element={<DemoNfcPage />} />
                <Route path="/demo/perfil/alex-rivera" element={<PublicProfilePage isAlexDemo />} />
                <Route path="/perfil/:slug" element={<PublicProfilePage />} />
                <Route path="/t/:codigoPublico" element={<CardRedirectPage />} />
                <Route path="/showcase" element={<ShowcasePage />} />

                {/* Auth */}
                <Route path="/login" element={<AuthPages mode="login" />} />
                <Route path="/registro" element={<AuthPages mode="register" />} />
                <Route path="/recuperar-contrasena" element={<AuthPages mode="recover" />} />
                <Route path="/restablecer-contrasena" element={<AuthPages mode="reset" />} />

                {/* Protected App Workspace */}
                <Route
                  path="/app/onboarding"
                  element={
                    <ProtectedRoute requireOnboarding={false}>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/identidades"
                  element={
                    <ProtectedRoute>
                      <IdentitiesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/identidades/:id/editar"
                  element={
                    <ProtectedRoute>
                      <IdentityEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/tarjetas"
                  element={
                    <ProtectedRoute>
                      <CardsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/compartir"
                  element={
                    <ProtectedRoute>
                      <ShareQrPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/contactos"
                  element={
                    <ProtectedRoute>
                      <ContactsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/analitica"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app/ajustes"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
