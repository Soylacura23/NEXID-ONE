import React from 'react';
import {
  Briefcase,
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Share2,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToast } from '@/contexts/ToastContext';
import { Identity } from '@/types/nexid';
import { buildIdentityVCard, buildPublicProfileUrl, downloadTextFile, sanitizeExternalUrl } from '@/utils/exportUtils';
import { NexidLogo } from '@/components/ui/NexidLogo';

interface ProfileRendererProps {
  identity: Identity;
  preview?: boolean;
  onTrackLinkClick?: (linkId: string) => void;
  onTrackVCard?: () => void;
  onTrackShare?: () => void;
}

export function ProfileRenderer({
  identity,
  preview = false,
  onTrackLinkClick,
  onTrackVCard,
  onTrackShare,
}: ProfileRendererProps) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const publicUrl = buildPublicProfileUrl(identity.slug, identity.id === 'demo-alex-rivera');
  const enabledLinks = (identity.links || []).filter((l) => l.enabled && sanitizeExternalUrl(l.url));
  const accent = identity.accentColor || '#D5B47A';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      onTrackShare?.();
      showToast({
        type: 'success',
        title: t('Enlace copiado', 'Link copied'),
        description: publicUrl,
      });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({
        type: 'info',
        title: t('URL del perfil', 'Profile URL'),
        description: publicUrl,
      });
    }
  };

  const handleVCard = () => {
    const vcf = buildIdentityVCard(identity);
    downloadTextFile(`${identity.slug || 'contacto'}.vcf`, vcf, 'text/vcard;charset=utf-8');
    onTrackVCard?.();
    showToast({
      type: 'success',
      title: t('Contacto descargado', 'Contact downloaded'),
      description: `${identity.title}.vcf`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${identity.title} — NEXID ONE`,
          text: `${identity.profession}`,
          url: publicUrl,
        });
        onTrackShare?.();
        return;
      } catch {
        // user cancelled
      }
    }
    handleCopy();
  };

  const avatarFallback = (
    <div
      className="h-full w-full flex items-center justify-center font-display text-2xl font-bold text-[#101114]"
      style={{ backgroundColor: accent }}
    >
      {(identity.title || 'N').slice(0, 2).toUpperCase()}
    </div>
  );

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={handleVCard}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 ${
          identity.buttonStyle === 'outline'
            ? 'border border-[var(--border-strong)] text-[var(--text-primary)] bg-transparent'
            : 'text-[#101114]'
        }`}
        style={identity.buttonStyle === 'outline' ? { borderColor: accent } : { backgroundColor: accent }}
      >
        <Download className="h-4 w-4" />
        {t('Guardar contacto', 'Save contact')}
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap shrink-0"
      >
        {copied ? <Check className="h-4 w-4 text-[var(--semantic-success)]" /> : <Copy className="h-4 w-4" />}
        {copied ? t('Copiado', 'Copied') : t('Copiar enlace', 'Copy link')}
      </button>

      <button
        type="button"
        onClick={handleShare}
        aria-label={t('Compartir perfil', 'Share profile')}
        className="inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );

  const contactItems = (
    <div className="space-y-2 text-sm text-[var(--text-secondary)]">
      {identity.showEmail && identity.publicEmail && (
        <a
          href={`mailto:${identity.publicEmail}`}
          className="flex items-center gap-2.5 hover:text-[var(--text-primary)] transition-colors break-all"
        >
          <Mail className="h-4 w-4 shrink-0" style={{ color: accent }} />
          <span>{identity.publicEmail}</span>
        </a>
      )}
      {identity.showPhone && identity.publicPhone && (
        <a
          href={`tel:${identity.publicPhone}`}
          className="flex items-center gap-2.5 hover:text-[var(--text-primary)] transition-colors"
        >
          <Phone className="h-4 w-4 shrink-0" style={{ color: accent }} />
          <span>{identity.publicPhone}</span>
        </a>
      )}
      {identity.website && sanitizeExternalUrl(identity.website) && (
        <a
          href={sanitizeExternalUrl(identity.website)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 hover:text-[var(--text-primary)] transition-colors break-all"
        >
          <Globe className="h-4 w-4 shrink-0" style={{ color: accent }} />
          <span>{identity.website.replace(/^https?:\/\//, '')}</span>
        </a>
      )}
      {identity.location && (
        <div className="flex items-center gap-2.5 text-[var(--text-muted)]">
          <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
          <span>{identity.location}</span>
        </div>
      )}
    </div>
  );

  const renderLinks = (columns = 2) => {
    if (enabledLinks.length === 0) return null;
    return (
      <section className="space-y-3">
        <h2 className="font-display text-sm font-semibold text-[var(--text-muted)]">
          {t('Enlaces y redes', 'Links & channels')}
        </h2>
        <div className={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : ''} gap-2.5`}>
          {enabledLinks.map((lnk) => {
            const href = sanitizeExternalUrl(lnk.url);
            return (
              <a
                key={lnk.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrackLinkClick?.(lnk.id)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate">{lnk.label}</p>
                  <p className="text-xs text-[var(--text-muted)] capitalize">{lnk.platform}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0" />
              </a>
            );
          })}
        </div>
      </section>
    );
  };

  const renderProjects = (gridCols = 'md:grid-cols-2') => {
    if (!identity.projects || identity.projects.length === 0) return null;
    return (
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
          {t('Portafolio destacado', 'Featured portfolio')}
        </h2>
        <div className={`grid grid-cols-1 ${gridCols} gap-5`}>
          {identity.projects.map((proj) => {
            const safeProjectUrl = proj.projectURL ? sanitizeExternalUrl(proj.projectURL) : '';
            return (
              <article
                key={proj.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden flex flex-col"
              >
                {proj.imageURL ? (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--bg-surface-alt)]">
                    <img
                      src={proj.imageURL}
                      alt={proj.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full bg-[var(--bg-surface-alt)] flex items-center justify-center p-6 text-center">
                    <span className="font-display text-sm font-semibold text-[var(--text-muted)]">{proj.title}</span>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium" style={{ color: accent }}>
                      {proj.category}
                    </p>
                    <h3 className="mt-1 font-display text-base font-bold text-[var(--text-primary)]">{proj.title}</h3>
                    <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{proj.description}</p>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className="text-xs text-[var(--text-muted)]">{proj.technologies.join(' · ')}</p>
                    )}
                    {safeProjectUrl && (
                      <a
                        href={safeProjectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onTrackLinkClick?.(`project_${proj.id}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                        style={{ color: accent }}
                      >
                        {t('Consultar proyecto', 'View project')}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (!identity.experience || identity.experience.length === 0) return null;
    return (
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Briefcase className="h-4 w-4" style={{ color: accent }} />
          {t('Experiencia profesional', 'Experience')}
        </h2>
        <div className="space-y-4">
          {identity.experience.map((exp) => (
            <div key={exp.id} className="pb-4 border-b border-[var(--border-subtle)] last:border-b-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">{exp.position}</h3>
                <span className="text-xs font-mono-tabular text-[var(--text-muted)]">
                  {exp.startDate} — {exp.endDate}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: accent }}>
                {exp.organization}
              </p>
              {exp.description && (
                <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!identity.education || identity.education.length === 0) return null;
    return (
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <GraduationCap className="h-4 w-4" style={{ color: accent }} />
          {t('Formación académica', 'Education')}
        </h2>
        <div className="space-y-4">
          {identity.education.map((edu) => (
            <div key={edu.id} className="pb-4 border-b border-[var(--border-subtle)] last:border-b-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">{edu.program}</h3>
                <span className="text-xs font-mono-tabular text-[var(--text-muted)]">{edu.dates}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: accent }}>
                {edu.institution}
              </p>
              {edu.description && (
                <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!identity.skills || identity.skills.length === 0) return null;
    return (
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
          {t('Habilidades clave', 'Core skills')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {identity.skills.map((sk) => (
            <div
              key={sk.id}
              className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]"
            >
              <span className="font-medium text-[var(--text-primary)]">{sk.name}</span>
              <span className="text-xs text-[var(--text-muted)]">{sk.category}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const footerBrand = (
    <div className="pt-8 mt-10 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
      <NexidLogo variant="horizontal" size="sm" />
      <span className="font-mono-tabular">/{identity.slug}</span>
    </div>
  );

  // TEMPLATE 1: EXECUTIVE (Structured 2-Column Corporate Dossier)
  if (identity.templateId === 'executive') {
    return (
      <div className={preview ? 'p-5 sm:p-7' : 'mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12'}>
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
          {identity.coverStyle !== 'minimal' && (
            <div className="h-36 sm:h-48 w-full bg-[var(--bg-surface-alt)] relative overflow-hidden">
              {identity.coverURL && (
                <img
                  src={identity.coverURL}
                  alt={identity.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4 space-y-6 lg:border-r lg:border-[var(--border-subtle)] lg:pr-6">
              <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border border-[var(--border-strong)] shrink-0">
                  {identity.photoURL ? (
                    <img
                      src={identity.photoURL}
                      alt={identity.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarFallback
                  )}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">{identity.title}</h1>
                  <p className="mt-1 text-sm font-medium" style={{ color: accent }}>
                    {identity.profession}
                  </p>
                  {identity.company && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{identity.company}</p>
                  )}
                </div>
              </div>

              {actionButtons}
              <div className="pt-4 border-t border-[var(--border-subtle)]">{contactItems}</div>
              {renderSkills()}
            </aside>

            <div className="lg:col-span-8 space-y-8">
              {identity.bio && (
                <section>
                  <h2 className="font-display text-sm font-semibold text-[var(--text-muted)] mb-2">
                    {t('Resumen ejecutivo', 'Executive summary')}
                  </h2>
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed">{identity.bio}</p>
                </section>
              )}
              {renderLinks(2)}
              {renderExperience()}
              {renderProjects('md:grid-cols-2')}
              {renderEducation()}
            </div>
          </div>
          <div className="px-6 sm:px-8 pb-6">{footerBrand}</div>
        </div>
      </div>
    );
  }

  // TEMPLATE 2: MINIMAL (High-Whitespace Editorial Typography Column)
  if (identity.templateId === 'minimal') {
    return (
      <div className={preview ? 'p-5 sm:p-8' : 'mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16'}>
        <header className="space-y-6 pb-8 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border border-[var(--border-subtle)] shrink-0">
              {identity.photoURL ? (
                <img
                  src={identity.photoURL}
                  alt={identity.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarFallback
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                {identity.title}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {identity.profession}
                {identity.company ? ` · ${identity.company}` : ''}
              </p>
            </div>
          </div>

          {identity.bio && (
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">{identity.bio}</p>
          )}

          {actionButtons}
          {contactItems}
        </header>

        <div className="py-8 space-y-10">
          {renderLinks(1)}
          {renderProjects('grid-cols-1')}
          {renderExperience()}
          {renderEducation()}
          {renderSkills()}
        </div>

        {footerBrand}
      </div>
    );
  }

  // TEMPLATE 3: TECH (Modular Engineering & Developer Grid)
  if (identity.templateId === 'tech') {
    return (
      <div className={preview ? 'p-5 sm:p-7' : 'mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12'}>
        <div className="space-y-6">
          <header className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-[var(--border-strong)] shrink-0">
                  {identity.photoURL ? (
                    <img
                      src={identity.photoURL}
                      alt={identity.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarFallback
                  )}
                </div>
                <div>
                  <p className="font-mono-tabular text-xs" style={{ color: accent }}>
                    nexid.one/{identity.slug}
                  </p>
                  <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    {identity.title}
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {identity.profession}
                    {identity.company ? ` · ${identity.company}` : ''}
                  </p>
                </div>
              </div>
              {actionButtons}
            </div>

            {identity.bio && (
              <p className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {identity.bio}
              </p>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-6">
              <div>
                <h2 className="font-display text-sm font-semibold text-[var(--text-muted)] mb-3">
                  {t('Canales directos', 'Direct channels')}
                </h2>
                {contactItems}
              </div>
              {renderSkills()}
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-8">
              {renderLinks(2)}
              {renderExperience()}
              {renderEducation()}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8">
            {renderProjects('md:grid-cols-3')}
          </div>

          {footerBrand}
        </div>
      </div>
    );
  }

  // TEMPLATE 4: CREATIVE (Portfolio-Forward Visual Showcase — Alex Rivera Default)
  return (
    <div className={preview ? 'p-4 sm:p-6' : 'mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10'}>
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
        {/* Visual Cover Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-[var(--bg-surface-alt)] overflow-hidden">
          {identity.coverURL && (
            <img
              src={identity.coverURL}
              alt={identity.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] via-black/35 to-transparent" />
        </div>

        <div className="px-6 sm:px-10 pb-10 -mt-14 relative z-10 space-y-10">
          {/* Identity Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-[var(--bg-surface)] shadow-xl shrink-0">
                {identity.photoURL ? (
                  <img
                    src={identity.photoURL}
                    alt={identity.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarFallback
                )}
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                  {identity.title}
                </h1>
                <p className="text-base font-medium" style={{ color: accent }}>
                  {identity.profession}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {[identity.company, identity.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {actionButtons}
          </div>

          {identity.bio && (
            <p className="max-w-3xl text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              {identity.bio}
            </p>
          )}

          {renderProjects('md:grid-cols-3')}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-[var(--border-subtle)]">
            <div className="lg:col-span-7 space-y-8">
              {renderExperience()}
              {renderEducation()}
            </div>
            <div className="lg:col-span-5 space-y-8">
              {renderLinks(1)}
              {renderSkills()}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/50 p-5 space-y-3">
                <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                  {t('Información de contacto', 'Contact information')}
                </h2>
                {contactItems}
              </div>
            </div>
          </div>

          {footerBrand}
        </div>
      </div>
    </div>
  );
}
