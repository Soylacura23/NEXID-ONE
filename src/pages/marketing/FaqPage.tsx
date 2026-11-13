import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { FAQ_ITEMS, FaqItem } from '@/data/demoData';
import { useI18n } from '@/contexts/I18nContext';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export function FaqPage() {
  const { t } = useI18n();
  const [category, setCategory] = useState<'all' | FaqItem['category']>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string>('faq-1');

  const categories: { id: 'all' | FaqItem['category']; label: string }[] = [
    { id: 'all', label: t('Todas', 'All') },
    { id: 'general', label: t('Plataforma', 'Platform') },
    { id: 'nfc', label: t('NFC y QR', 'NFC & QR') },
    { id: 'privacy', label: t('Privacidad', 'Privacy') },
    { id: 'plans', label: t('Planes', 'Plans') },
  ];

  const filtered = FAQ_ITEMS.filter((item) => {
    const matchesCat = category === 'all' || item.category === category;
    const text = `${item.questionEs} ${item.questionEn} ${item.answerEs} ${item.answerEn}`.toLowerCase();
    const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">{t('Preguntas frecuentes', 'FAQ')}</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            {t('Centro de respuestas NEXID ONE', 'NEXID ONE Answer Center')}
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            {t('Explora por categoría o busca un término específico.', 'Browse by category or search for a specific topic.')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  category === c.id
                    ? 'bg-[var(--accent-gold)] text-[var(--accent-ink)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Buscar pregunta...', 'Search question...')}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pl-9 pr-3 py-2 text-sm focus:border-[var(--accent-gold)] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
              {t('No se encontraron preguntas que coincidan con tu búsqueda.', 'No questions matched your filter.')}
            </div>
          ) : (
            filtered.map((item) => {
              const expanded = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? '' : item.id)}
                    aria-expanded={expanded}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                  >
                    <span className="font-display text-sm sm:text-base font-semibold">
                      {t(item.questionEs, item.questionEn)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[var(--text-muted)] shrink-0 transition-transform ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expanded && (
                    <div className="px-5 pb-4 pt-3 border-t border-[var(--border-subtle)] text-sm text-[var(--text-muted)] leading-relaxed">
                      {t(item.answerEs, item.answerEn)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
