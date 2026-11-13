import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Info, KeyRound, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { isFirebaseConfigured } from '@/services/firebase/client';
import { NexidLogo } from '@/components/ui/NexidLogo';

type AuthViewMode = 'login' | 'register' | 'recover' | 'reset';

export function AuthPages({ mode }: { mode: AuthViewMode }) {
  const {
    user,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPasswordReset,
    enterDemoMode,
  } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(mode === 'recover' || mode === 'reset');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recoverSent, setRecoverSent] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from || '/app/dashboard';

  useEffect(() => {
    if (user && mode !== 'recover' && mode !== 'reset') {
      navigate(user.onboardingCompleted ? redirectTo : '/app/onboarding', { replace: true });
    }
  }, [user, mode, navigate, redirectTo]);

  const handleGoogle = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      showToast({
        type: 'success',
        title: t('Sesión iniciada con Google', 'Signed in with Google'),
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg(t('Se cerró la ventana de acceso antes de completar el inicio.', 'Sign-in window was closed before completing.'));
      } else {
        setErrorMsg(
          t(
            'No fue posible completar el inicio con Google en este navegador. Puedes usar el Modo Demo instantáneo abajo.',
            'Could not complete Google Sign-In in this browser. You can use Instant Demo Mode below.',
          ),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setSubmitting(true);
    try {
      await enterDemoMode();
      showToast({
        type: 'success',
        title: t('Espacio Demo activado', 'Demo Workspace active'),
        description: t('Sesión local lista con datos de ejemplo de Alex Rivera.', 'Local session ready with Alex Rivera sample data.'),
      });
      navigate('/app/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(t('Ingresa un correo válido.', 'Please enter a valid email address.'));
      return;
    }

    if (mode === 'recover') {
      setSubmitting(true);
      try {
        await sendPasswordReset(email);
        setRecoverSent(true);
        showToast({
          type: 'success',
          title: t('Correo de recuperación enviado', 'Recovery email sent'),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        setErrorMsg(
          msg.includes('operation-not-allowed')
            ? t(
                'El proveedor Email/Contraseña no está activado en Firebase Console. Usa Google Sign-In o actívalo en Authentication > Sign-in method.',
                'Email/Password provider is not enabled in Firebase Console. Use Google Sign-In or enable it under Authentication > Sign-in method.',
              )
            : t('No se pudo enviar el enlace de recuperación. Verifica el correo.', 'Could not send reset email. Check the address.'),
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t('La contraseña debe tener al menos 6 caracteres.', 'Password must be at least 6 characters.'));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMsg(t('Ingresa tu nombre.', 'Enter your name.'));
          setSubmitting(false);
          return;
        }
        await registerWithEmail(name, email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          t(
            'El acceso con Google está listo automáticamente. Para usar contraseña manual, activa Email/Password en Firebase Console > Authentication > Sign-in method.',
            'Google Sign-In is ready automatically. To use manual passwords, enable Email/Password in Firebase Console > Authentication > Sign-in method.',
          ),
        );
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setErrorMsg(t('Credenciales incorrectas.', 'Invalid credentials.'));
      } else {
        setErrorMsg(t('No se pudo completar la autenticación. Prueba con Google o Modo Demo.', 'Authentication failed. Try Google Sign-In or Demo Mode.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength =
    password.length >= 10 ? t('Fuerte', 'Strong') : password.length >= 6 ? t('Aceptable', 'Fair') : t('Mínimo 6 caracteres', 'Min 6 chars');

  return (
    <div className="min-h-screen bg-[#101114] text-[#F4F1EB] flex flex-col justify-between p-4 sm:p-8">
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#A6ABB4] hover:text-[#F4F1EB]">
          <ArrowLeft className="h-4 w-4" />
          <span>{t('Volver al sitio', 'Back to site')}</span>
        </Link>
        <NexidLogo variant="horizontal" size="sm" tone="monochrome-light" />
      </div>

      <div className="mx-auto w-full max-w-md my-8 rounded-3xl border border-[#34373D] bg-[#17191D] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="flex justify-center pb-1">
            <NexidLogo variant="mark" size="lg" tone="gold" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {mode === 'register'
              ? t('Crea tu cuenta en NEXID ONE', 'Create your NEXID ONE account')
              : mode === 'recover'
                ? t('Recuperar contraseña', 'Recover password')
                : mode === 'reset'
                  ? t('Restablecer contraseña', 'Reset password')
                  : t('Accede a tu espacio profesional', 'Sign in to your workspace')}
          </h1>
          <p className="text-xs sm:text-sm text-[#A6ABB4]">
            {mode === 'recover'
              ? t('Ingresa tu correo registrado para solicitar el enlace oficial de Firebase.', 'Enter your registered email to request a Firebase reset link.')
              : t(
                  'Acceso automático y gratuito con Google Cloud Firestore o exploración inmediata en Modo Demo.',
                  'Automatic free access with Google & Cloud Firestore or instant Demo Mode.',
                )}
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-[#D96767]/40 bg-[#D96767]/10 px-4 py-3 text-xs text-[#F4F1EB] leading-relaxed"
          >
            {errorMsg}
          </div>
        )}

        {mode === 'reset' ? (
          <div className="space-y-4 text-center">
            <Info className="h-6 w-6 text-[#D5B47A] mx-auto" />
            <p className="text-sm text-[#A6ABB4]">
              {t(
                'Los enlaces de restablecimiento de Firebase se procesan mediante la página segura alojada por Firebase Authentication.',
                'Firebase password reset links are processed through Firebase Authentication’s hosted action handler.',
              )}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#D5B47A] px-4 py-3 text-sm font-semibold text-[#101114]"
            >
              {t('Volver a iniciar sesión', 'Back to sign in')}
            </Link>
          </div>
        ) : (
          <>
            {mode !== 'recover' && (
              <div className="space-y-3">
                {isFirebaseConfigured && (
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#D5B47A] px-4 py-3 text-sm font-semibold text-[#101114] hover:bg-[#E8D2A7] transition-colors disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                      />
                    </svg>
                    <span>{t('Continuar con Google (Automático)', 'Continue with Google (Instant)')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#34373D] bg-[#202329] px-4 py-3 text-sm font-semibold text-[#F4F1EB] hover:border-[#D5B47A] transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-[#D5B47A]" />
                  <span>{t('Entrar en Modo Demo (Sin registro)', 'Enter Demo Mode (No sign-up)')}</span>
                </button>
              </div>
            )}

            {mode !== 'recover' && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#34373D]" />
                <button
                  type="button"
                  onClick={() => setShowEmailForm((v) => !v)}
                  className="text-xs text-[#A6ABB4] hover:text-[#F4F1EB] transition-colors"
                >
                  {showEmailForm
                    ? t('Ocultar acceso con correo', 'Hide email option')
                    : t('O usar correo y contraseña', 'Or use email & password')}
                </button>
                <div className="h-px flex-1 bg-[#34373D]" />
              </div>
            )}

            {(showEmailForm || mode === 'recover') && (
              <>
                {recoverSent ? (
                  <div className="rounded-2xl border border-[#3BAA82]/40 bg-[#3BAA82]/10 p-4 text-center space-y-2">
                    <CheckCircle2 className="h-6 w-6 text-[#3BAA82] mx-auto" />
                    <p className="text-sm font-semibold">{t('Revisa tu bandeja de entrada', 'Check your inbox')}</p>
                    <p className="text-xs text-[#A6ABB4]">
                      {t('Si la cuenta existe, recibirás las instrucciones de recuperación.', 'If the account exists, you will receive reset instructions.')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {mode === 'register' && (
                      <div className="space-y-1.5">
                        <label htmlFor="auth-name" className="block text-xs font-medium text-[#A6ABB4]">
                          {t('Nombre completo', 'Full name')}
                        </label>
                        <input
                          id="auth-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Rivera"
                          className="w-full rounded-xl border border-[#34373D] bg-[#101114] px-3.5 py-2.5 text-sm text-[#F4F1EB] focus:border-[#D5B47A] focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label htmlFor="auth-email" className="block text-xs font-medium text-[#A6ABB4]">
                        {t('Correo electrónico', 'Email address')}
                      </label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-[#A6ABB4] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="auth-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nombre@dominio.com"
                          className="w-full rounded-xl border border-[#34373D] bg-[#101114] pl-10 pr-3.5 py-2.5 text-sm text-[#F4F1EB] focus:border-[#D5B47A] focus:outline-none"
                        />
                      </div>
                    </div>

                    {mode !== 'recover' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="auth-pass" className="block text-xs font-medium text-[#A6ABB4]">
                            {t('Contraseña', 'Password')}
                          </label>
                          {mode === 'register' && (
                            <span className="text-[11px] text-[#D5B47A]">{passwordStrength}</span>
                          )}
                        </div>
                        <div className="relative">
                          <KeyRound className="h-4 w-4 text-[#A6ABB4] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="auth-pass"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-[#34373D] bg-[#101114] pl-10 pr-3.5 py-2.5 text-sm text-[#F4F1EB] focus:border-[#D5B47A] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#D5B47A]/60 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#D5B47A] hover:bg-[#D5B47A] hover:text-[#101114] transition-colors disabled:opacity-50"
                    >
                      <span>
                        {mode === 'register'
                          ? t('Registrar con correo', 'Register with email')
                          : mode === 'recover'
                            ? t('Enviar enlace de recuperación', 'Send reset link')
                            : t('Entrar con correo', 'Sign in with email')}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </>
            )}
          </>
        )}

        <div className="pt-4 border-t border-[#34373D] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A6ABB4]">
          {mode === 'login' ? (
            <>
              <Link to="/registro" className="hover:text-[#F4F1EB]">
                {t('Crear cuenta nueva', 'Create account')}
              </Link>
              <Link to="/recuperar-contrasena" className="hover:text-[#F4F1EB]">
                {t('Olvidé mi contraseña', 'Forgot password')}
              </Link>
            </>
          ) : (
            <Link to="/login" className="hover:text-[#F4F1EB]">
              {t('Ya tengo cuenta · Iniciar sesión', 'Already have an account · Sign in')}
            </Link>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#A6ABB4]">
        NEXID ONE · {t('Autenticación protegida con Firebase', 'Secured with Firebase Authentication')}
      </p>
    </div>
  );
}
