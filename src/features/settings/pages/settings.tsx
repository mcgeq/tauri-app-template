import { useNavigate } from '@tanstack/react-router';
import { Keyboard, Palette, SquareArrowOutUpRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MobileSubpageShell } from '@/app/shell/mobile-subpage-shell';
import { TitleBar } from '@/app/shell/title-bar';
import { WindowFrame } from '@/app/shell/window-frame';
import { AppearanceSection } from '@/features/settings/components/appearance-section';
import { ShortcutSection } from '@/features/settings/components/shortcut-section';
import { WindowBehaviorSection } from '@/features/settings/components/window-behavior-section';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { registerShortcut } from '@/lib/shortcut';
import { cn } from '@/lib/utils';
import { IS_DESKTOP } from '@/platform/runtime/platform';
import { toggleWindow } from '@/platform/windows/window-manager';
import { useWindowBehavior } from '@/stores/window-behavior';

const SHORTCUT_KEY = 'global-shortcut-show-main';

type SettingSection = 'appearance' | 'window' | 'shortcut';

export default function SettingsPage() {
  const [shortcut, setShortcut] = useState<string>('');
  const [activeSection, setActiveSection] = useState<SettingSection>('appearance');
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const {
    hydrated: windowBehaviorHydrated,
    minimizeAction,
    closeAction,
    setMinimizeAction,
    setCloseAction,
  } = useWindowBehavior();

  const handleShowMainWindow = useCallback(async () => {
    if (!IS_DESKTOP) {
      return;
    }
    await toggleWindow('main');
  }, []);

  useEffect(() => {
    if (!IS_DESKTOP) {
      return;
    }
    const savedShortcut = localStorage.getItem(SHORTCUT_KEY);
    if (savedShortcut) {
      setShortcut(savedShortcut);
      registerShortcut(savedShortcut, handleShowMainWindow);
    }
  }, [handleShowMainWindow]);

  const menuItems = useMemo(
    () => [
      { id: 'appearance' as SettingSection, label: t('settings.appearance.title'), icon: Palette },
      ...(IS_DESKTOP
        ? [
            { id: 'window' as SettingSection, label: t('settings.window.title'), icon: SquareArrowOutUpRight },
            { id: 'shortcut' as SettingSection, label: t('settings.shortcut.title'), icon: Keyboard },
          ]
        : []),
    ],
    [t],
  );

  const settingsContent = useMemo(
    () => (
      <div className={cn('max-w-3xl p-4', !IS_DESKTOP && 'mx-auto w-full')}>
        {activeSection === 'appearance' && <AppearanceSection t={t} />}
        {IS_DESKTOP && activeSection === 'window' && (
          <WindowBehaviorSection
            hydrated={windowBehaviorHydrated}
            minimizeAction={minimizeAction}
            closeAction={closeAction}
            setMinimizeAction={setMinimizeAction}
            setCloseAction={setCloseAction}
            t={t}
          />
        )}
        {IS_DESKTOP && activeSection === 'shortcut' && (
          <ShortcutSection shortcut={shortcut} onShortcutChange={setShortcut} t={t} />
        )}
      </div>
    ),
    [
      t,
      activeSection,
      windowBehaviorHydrated,
      minimizeAction,
      closeAction,
      setMinimizeAction,
      setCloseAction,
      shortcut,
    ],
  );

  return (
    <WindowFrame
      titleBar={<TitleBar title={t('settings.title')} showMinimize={false} showMaximize={false} />}
      contentClassName={IS_DESKTOP ? 'flex flex-1 flex-row overflow-hidden' : 'flex flex-1 overflow-hidden'}
    >
      {IS_DESKTOP && (
        <aside className="border-border flex w-40 flex-col border-r p-4">
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    activeSection === item.id
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
      )}

      {IS_DESKTOP ? (
        <div className="flex-1 overflow-auto">{settingsContent}</div>
      ) : (
        <MobileSubpageShell
          title={t('settings.title')}
          onBack={() => {
            void navigate({ to: '/profile' });
          }}
          className="flex-1 overflow-auto"
        >
          {settingsContent}
        </MobileSubpageShell>
      )}
    </WindowFrame>
  );
}
