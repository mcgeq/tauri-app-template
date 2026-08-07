import { useNavigate } from '@tanstack/react-router';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Github, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MobileSubpageShell } from '@/app/shell/mobile-subpage-shell';
import { TitleBar } from '@/app/shell/title-bar';
import { WindowFrame } from '@/app/shell/window-frame';
import appIcon from '@/assets/app-icon.png';
import { Button } from '@/components/ui/button';
import { useManualUpdateCheck } from '@/features/updater/hooks/use-manual-update-check';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';

export default function AboutPage() {
  const [appVersion, setAppVersion] = useState('');
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { checkUpdate, checking, showNoUpdate } = useManualUpdateCheck();

  useEffect(() => {
    if (!IS_TAURI_APP) {
      setAppVersion('0.0.1');
      return;
    }
    void getVersion().then(setAppVersion);
  }, []);

  const handleOpenGithub = async () => {
    await openUrl('https://github.com/mcgeq/tauri-app-template');
  };

  const aboutContent = (
    <div className="flex flex-col items-center gap-5 px-8 py-6 text-center">
      <img src={appIcon} alt="App icon" className="h-16 w-16 rounded-xl" />

      <div className="space-y-1">
        <h2 className="text-lg font-bold">{t('about.appName')}</h2>
        <p className="text-muted-foreground text-xs">{t('about.version', { num: appVersion })}</p>
        <p className="text-muted-foreground/60 text-xs">{t('about.copyright')}</p>
      </div>

      <div className="w-full space-y-2">
        <Button onClick={handleOpenGithub} className="w-full" variant="outline">
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>

        {IS_DESKTOP && (
          <Button onClick={checkUpdate} className="w-full" variant="outline" disabled={checking}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? t('updater.checking') : t('updater.checkForUpdates')}
          </Button>
        )}
      </div>

      {showNoUpdate && <p className="text-muted-foreground text-xs">{t('updater.upToDate')}</p>}
    </div>
  );

  return (
    <WindowFrame
      titleBar={<TitleBar title={t('about.title')} showMinimize={false} showMaximize={false} />}
      contentClassName="flex flex-1 items-center justify-center overflow-hidden"
    >
      {IS_DESKTOP ? (
        aboutContent
      ) : (
        <MobileSubpageShell
          onBack={() => {
            void navigate({ to: '/profile' });
          }}
          className="w-full"
        >
          {aboutContent}
        </MobileSubpageShell>
      )}
    </WindowFrame>
  );
}
