import { Play, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskProgressPayload } from '@/api';
import { onTaskComplete, onTaskProgress, startBackgroundTask } from '@/api';
import { Button } from '@/components/ui/button';
import { SUPPORTS_TAURI_CALLBACKS } from '@/platform/runtime/platform';

export function TaskDemo() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [running, setRunning] = useState(false);
  const unlistenRef = useRef<(() => void)[]>([]);

  const start = useCallback(async () => {
    setProgress(0);
    setMessage('');
    setRunning(true);

    try {
      await startBackgroundTask();
    } catch {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    if (!SUPPORTS_TAURI_CALLBACKS) {
      return;
    }

    const setup = async () => {
      unlistenRef.current.push(
        await onTaskProgress((payload: TaskProgressPayload) => {
          setProgress(payload.progress);
          setMessage(payload.message);
        }),
      );
      unlistenRef.current.push(
        await onTaskComplete(() => {
          setRunning(false);
          setMessage('');
        }),
      );
    };
    setup();

    return () => {
      unlistenRef.current.forEach((fn) => {
        fn();
      });
      unlistenRef.current = [];
    };
  }, []);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t('task.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('task.description')}</p>
      </div>

      <Button onClick={start} disabled={running}>
        {running ? <Square className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
        {running ? t('task.running') : t('task.start')}
      </Button>

      {running && (
        <div className="flex w-full max-w-xs flex-col gap-2">
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground text-center text-xs">{message}</p>
        </div>
      )}
    </div>
  );
}
