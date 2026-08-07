import { emitLanguageChanged, updateTrayMenu } from '@/api';
import i18n from '@/i18n';
import type { AppLanguage } from '@/i18n/resources';
import { ensureLanguageResources, SUPPORTED_LANGUAGES } from '@/i18n/resources';
import { IS_TAURI_APP, SUPPORTS_TAURI_CALLBACKS } from '@/platform/runtime/platform';

export function toggleLanguage(current: string): AppLanguage {
  const langs = SUPPORTED_LANGUAGES;
  const idx = langs.indexOf(current as AppLanguage);
  return langs[(idx + 1) % langs.length];
}

export async function setLanguage(language: AppLanguage): Promise<void> {
  await ensureLanguageResources(language);
  await i18n.changeLanguage(language);

  if (IS_TAURI_APP) {
    try {
      await updateTrayMenu({
        showText: i18n.t('tray.show', { lng: language }),
        settingsText: i18n.t('tray.settings', { lng: language }),
        quitText: i18n.t('tray.quit', { lng: language }),
      });
    } catch (error) {
      console.error('Failed to update tray menu:', error);
    }
  }

  if (IS_TAURI_APP && SUPPORTS_TAURI_CALLBACKS) {
    await emitLanguageChanged(language);
  }
}
