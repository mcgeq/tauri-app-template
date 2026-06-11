import { toast } from 'sonner';
import { emitShortcutChanged } from '@/api';
import { ShortcutInput } from '@/features/settings/components/shortcut-input';
import { registerShortcut, unregisterShortcut } from '@/lib/shortcut';
import { IS_DESKTOP } from '@/platform/runtime/platform';
import { toggleWindow } from '@/platform/windows/window-manager';

const SHORTCUT_KEY = 'global-shortcut-show-main';

interface ShortcutSectionProps {
  shortcut: string;
  onShortcutChange: (value: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function ShortcutSection({ shortcut, onShortcutChange, t }: ShortcutSectionProps) {
  const handleShortcutChange = async (newShortcut: string) => {
    if (!IS_DESKTOP) {
      return;
    }

    const oldShortcut = shortcut;
    onShortcutChange(newShortcut);

    if (newShortcut) {
      localStorage.setItem(SHORTCUT_KEY, newShortcut);
      await registerShortcut(newShortcut, () => toggleWindow('main'), oldShortcut);
      await emitShortcutChanged(newShortcut);
      toast.success(t('settings.shortcut.setSuccess', { shortcut: newShortcut }));
    }
    else {
      localStorage.removeItem(SHORTCUT_KEY);
      if (oldShortcut) {
        await unregisterShortcut(oldShortcut);
      }
      await emitShortcutChanged('');
      toast.info(t('settings.shortcut.cleared'));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-semibold">{t('settings.shortcut.title')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('settings.shortcut.description')}
        </p>
      </div>

      <div className="space-y-0">
        <div className="flex items-center justify-between py-2.5">
          <div className="flex-1">
            <label className="text-sm font-medium">{t('settings.shortcut.showMain')}</label>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('settings.shortcut.showMainDesc')}
            </p>
          </div>
          <ShortcutInput value={shortcut} onChange={handleShortcutChange} />
        </div>
      </div>
    </div>
  );
}
