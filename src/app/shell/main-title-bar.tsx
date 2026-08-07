import { useNavigate } from '@tanstack/react-router';
import { Info, Moon, Settings, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TitleBar } from '@/app/shell/title-bar';
import { LanguageToggle } from '@/features/settings/components/language-toggle';
import { openAppRoute } from '@/platform/windows/open-app-route';
import { useTheme } from '@/providers/theme-provider';

export function MainTitleBar() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleOpenAbout = async () => {
    await openAppRoute('about', {
      navigate,
      t,
    });
  };

  const handleOpenSettings = async () => {
    await openAppRoute('settings', {
      navigate,
      t,
    });
  };

  return (
    <TitleBar
      title={t('app.title')}
      windowMenu
      rightActions={
        <>
          <button
            type="button"
            onClick={handleOpenSettings}
            className="title-bar-btn mr-1"
            aria-label={t('settings.button')}
            tabIndex={-1}
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenAbout}
            className="title-bar-btn mr-1"
            aria-label={t('about.button')}
            tabIndex={-1}
          >
            <Info className="h-4 w-4" />
          </button>

          <LanguageToggle />

          <button
            type="button"
            onClick={handleToggleTheme}
            className="title-bar-btn mr-0.5"
            aria-label={t('theme.toggle')}
            tabIndex={-1}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </>
      }
    />
  );
}
