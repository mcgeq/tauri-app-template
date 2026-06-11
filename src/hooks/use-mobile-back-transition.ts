import { useEffect, useRef, useState } from 'react';

export const MOBILE_BACK_FADE_DURATION_MS = 180;

export function useMobileBackTransition(onNavigateBack: () => void) {
  const [isLeaving, setIsLeaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function startBackTransition() {
    if (isLeaving) {
      return;
    }

    setIsLeaving(true);
    timerRef.current = window.setTimeout(() => {
      onNavigateBack();
    }, MOBILE_BACK_FADE_DURATION_MS);
  }

  return {
    isLeaving,
    startBackTransition,
  };
}
