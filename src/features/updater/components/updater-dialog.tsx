import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useUpdater } from '@/hooks/use-updater';

interface UpdaterDialogProps {
  manualCheck?: boolean;
  onCheckComplete?: () => void;
}

let lastAutoCheck = 0;
const AUTO_CHECK_INTERVAL = 1000 * 60 * 60; // 1 hour

export function UpdaterDialog({ manualCheck = false, onCheckComplete }: UpdaterDialogProps) {
  const { update, checking, downloading, progress, checkUpdate, installUpdate } = useUpdater();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (manualCheck || import.meta.env.DEV)
      return;

    const now = Date.now();
    if (now - lastAutoCheck < AUTO_CHECK_INTERVAL)
      return;

    lastAutoCheck = now;
    void checkUpdate();
  }, [manualCheck, checkUpdate]);

  useEffect(() => {
    if (update) {
      setOpen(true);
      onCheckComplete?.();
    }
    else if (manualCheck && !checking) {
      onCheckComplete?.();
    }
  }, [update, checking, manualCheck, onCheckComplete]);

  const handleInstall = () => {
    void installUpdate();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const getProgressPercentage = () => {
    if (!progress || progress.event === 'Started')
      return 0;
    const { downloaded, contentLength } = progress.data || {};
    if (!contentLength)
      return 0;
    if (progress.event === 'Finished')
      return 100;
    return Math.round(((downloaded ?? 0) / contentLength) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {downloading ? t('updater.downloading') : t('updater.updateAvailable')}
          </DialogTitle>
          <DialogDescription>
            {downloading
              ? (
                  <div className="space-y-2">
                    <p>{t('updater.installingVersion', { version: update?.version })}</p>
                    <Progress value={getProgressPercentage()} />
                  </div>
                )
              : (
                  <div className="space-y-2">
                    <p>{t('updater.versionAvailable', { version: update?.version })}</p>
                    {update?.body && (
                      <div className="bg-muted mt-2 rounded-md p-3 text-sm">
                        <p className="font-semibold">{t('updater.releaseNotes')}</p>
                        <p className="mt-1 whitespace-pre-wrap">{update.body}</p>
                      </div>
                    )}
                  </div>
                )}
          </DialogDescription>
        </DialogHeader>
        {!downloading && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {t('updater.later')}
            </Button>
            <Button onClick={handleInstall}>{t('updater.installNow')}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
