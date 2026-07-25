import en from './locales/en.json';

export const defaultNS = 'translation';

export const resources = {
  en: { translation: en },
} as const;

const extraLoaders = {
  zh: () => import('./locales/zh.json'),
};

type ExtraLanguages = keyof typeof extraLoaders;
export type AppLanguage = 'en' | ExtraLanguages;

const allLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => Promise.resolve({ default: en }),
  ...extraLoaders,
};

export const SUPPORTED_LANGUAGES = Object.keys(allLoaders) as AppLanguage[];

export async function ensureLanguageResources(lang: AppLanguage): Promise<void> {
  if (lang === 'en') {
    return;
  }

  const loader = extraLoaders[lang as ExtraLanguages];
  if (!loader) {
    return;
  }

  const mod = await loader();
  const i18n = (await import('i18next')).default;
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    i18n.addResourceBundle(lang, 'translation', mod.default ?? mod);
  }
  if (i18n.language?.startsWith(lang)) {
    await i18n.changeLanguage(lang);
  }
}

/**
 * Add a new language:
 * 1. Create src/i18n/locales/{code}.json
 * 2. Add one entry to `extraLoaders` above: `{code}: () => import('./locales/{code}.json')`
 * AppLanguage type, language cycle, and lazy loading are auto-derived.
 */
