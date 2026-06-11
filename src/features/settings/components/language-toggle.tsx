import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setLanguage, toggleLanguage } from '@/i18n/language';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const handleToggleLanguage = async () => {
    const nextLanguage = toggleLanguage(i18n.language);
    await setLanguage(nextLanguage);
  };

  return (
    <button
      onClick={handleToggleLanguage}
      className="title-bar-btn mr-1"
      aria-label={t('language.toggle')}
      title={i18n.language === 'zh' ? 'Switch to English' : 'Switch to 中文'}
      tabIndex={-1}
    >
      <Languages className="h-4 w-4" />
    </button>
  );
}
