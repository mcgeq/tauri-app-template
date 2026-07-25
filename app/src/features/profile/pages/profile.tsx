import { useNavigate } from '@tanstack/react-router';
import { Info, Settings, Sparkles } from 'lucide-react';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useCompactLayout } from '@/platform/runtime/use-compact-layout';
import { openAppRoute } from '@/platform/windows/open-app-route';

const techStack = [
  { labelKey: 'profile.techTauri', descKey: 'profile.techTauriDesc' },
  { labelKey: 'profile.techReact', descKey: 'profile.techReactDesc' },
  { labelKey: 'profile.techTs', descKey: 'profile.techTsDesc' },
  { labelKey: 'profile.techTailwind', descKey: 'profile.techTailwindDesc' },
];

export function ProfilePage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const isMobile = useCompactLayout();

  const handleSettings = async () => {
    await openAppRoute(isMobile ? 'settings' : 'settings', {
      navigate,
      t,
    });
  };

  const handleAbout = async () => {
    await openAppRoute(isMobile ? 'about' : 'about', {
      navigate,
      t,
    });
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {/* Header */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 ring-primary/20 flex h-14 w-14 items-center justify-center rounded-2xl ring-1">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{t('profile.appName')}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{t('profile.version', { num: '0.0.1' })}</p>
            </div>
          </div>
          <button
            onClick={handleSettings}
            className="bg-primary/10 hover:bg-primary/20 ring-primary/20 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 transition-all hover:scale-105 active:scale-95"
            aria-label={t('profile.settings')}
          >
            <Settings className="h-4 w-4" />
            {t('profile.settings')}
          </button>
        </div>
      </div>

      {/* Tech stack */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4">
        {techStack.map(item => (
          <div
            key={item.labelKey}
            className="bg-muted/50 hover:bg-muted/80 rounded-xl border p-4 transition-colors"
          >
            <p className="text-sm font-medium">{t(item.labelKey)}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{t(item.descKey)}</p>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t px-6 py-4">
        <button
          onClick={handleAbout}
          className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 py-2 text-sm transition-colors"
        >
          <Info className="h-4 w-4" />
          {t('profile.about')}
        </button>
      </div>
    </div>
  );
}
