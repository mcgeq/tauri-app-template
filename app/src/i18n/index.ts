import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { defaultNS, ensureLanguageResources, resources } from './resources';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS,
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

const detectedLng = i18n.language?.slice(0, 2) ?? 'en';
if (detectedLng !== 'en') {
  ensureLanguageResources(detectedLng as Parameters<typeof ensureLanguageResources>[0]).catch(console.error);
}

export default i18n;
