import type { AppLanguage } from '@/i18n/resources';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { onLanguageChanged } from '@/api';
import { IS_TAURI_APP, SUPPORTS_TAURI_CALLBACKS } from '@/platform/runtime/platform';

export function useAppTranslation() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!(IS_TAURI_APP && SUPPORTS_TAURI_CALLBACKS)) {
      return;
    }

    const unlistenLanguageChanged = onLanguageChanged((payload) => {
      i18n.changeLanguage(payload.language);
    });

    return () => {
      unlistenLanguageChanged.then(fn => fn());
    };
  }, [i18n]);

  return {
    t,
    language: (i18n.resolvedLanguage ?? i18n.language) as AppLanguage,
  };
}
