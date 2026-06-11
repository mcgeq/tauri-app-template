import { Minus, SquareArrowOutUpRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WindowBehaviorSectionProps {
  hydrated: boolean;
  minimizeAction: 'taskbar' | 'tray';
  closeAction: 'quit' | 'tray';
  setMinimizeAction: (value: 'taskbar' | 'tray') => void;
  setCloseAction: (value: 'quit' | 'tray') => void;
  t: (key: string) => string;
}

export function WindowBehaviorSection({
  hydrated,
  minimizeAction,
  closeAction,
  setMinimizeAction,
  setCloseAction,
  t,
}: WindowBehaviorSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-semibold">{t('settings.window.title')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('settings.window.description')}
        </p>
      </div>

      <div className="space-y-0">
        <div className="flex items-center justify-between py-2.5">
          <label className="text-sm font-medium">{t('settings.window.minimizeAction')}</label>
          <div className="flex gap-2">
            <Button
              variant={minimizeAction === 'taskbar' ? 'default' : 'outline'}
              size="sm"
              disabled={!hydrated}
              onClick={() => setMinimizeAction('taskbar')}
              className="flex items-center gap-1.5"
            >
              <Minus className="h-3.5 w-3.5" />
              {t('settings.window.taskbar')}
            </Button>
            <Button
              variant={minimizeAction === 'tray' ? 'default' : 'outline'}
              size="sm"
              disabled={!hydrated}
              onClick={() => setMinimizeAction('tray')}
              className="flex items-center gap-1.5"
            >
              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
              {t('settings.window.tray')}
            </Button>
          </div>
        </div>

        <div className="border-t" />

        <div className="flex items-center justify-between py-2.5">
          <label className="text-sm font-medium">{t('settings.window.closeAction')}</label>
          <div className="flex gap-2">
            <Button
              variant={closeAction === 'quit' ? 'default' : 'outline'}
              size="sm"
              disabled={!hydrated}
              onClick={() => setCloseAction('quit')}
              className="flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              {t('settings.window.quit')}
            </Button>
            <Button
              variant={closeAction === 'tray' ? 'default' : 'outline'}
              size="sm"
              disabled={!hydrated}
              onClick={() => setCloseAction('tray')}
              className="flex items-center gap-1.5"
            >
              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
              {t('settings.window.tray')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
