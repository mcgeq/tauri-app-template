import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/features/settings/components/language-toggle';
import { useTheme } from '@/providers/theme-provider';

interface AppearanceSectionProps {
  t: (key: string) => string;
}

export function AppearanceSection({ t }: AppearanceSectionProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-semibold">{t('settings.appearance.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('settings.appearance.description')}</p>
      </div>

      <div className="space-y-0">
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm font-medium">{t('settings.appearance.theme')}</span>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-1.5"
            >
              <Sun className="h-3.5 w-3.5" />
              {t('settings.appearance.light')}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-1.5"
            >
              <Moon className="h-3.5 w-3.5" />
              {t('settings.appearance.dark')}
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="flex items-center gap-1.5"
            >
              <Monitor className="h-3.5 w-3.5" />
              {t('settings.appearance.system')}
            </Button>
          </div>
        </div>

        <div className="border-t" />

        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm font-medium">{t('settings.appearance.language')}</span>
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
