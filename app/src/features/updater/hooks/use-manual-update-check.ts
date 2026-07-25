import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdater } from '@/hooks/use-updater';

export function useManualUpdateCheck() {
  const { checkUpdate, checking, update } = useUpdater();
  const [showNoUpdate, setShowNoUpdate] = useState(false);
  const { t } = useTranslation();

  const handleCheckUpdate = async () => {
    setShowNoUpdate(false);
    const result = await checkUpdate();

    if (result.status === 'up-to-date') {
      setShowNoUpdate(true);
      return;
    }

    if (result.status === 'error') {
      toast.error(t('updater.checkFailed'));
    }
  };

  return {
    checkUpdate: handleCheckUpdate,
    checking,
    hasUpdate: !!update,
    showNoUpdate,
    dismissNoUpdate: () => setShowNoUpdate(false),
  };
}
