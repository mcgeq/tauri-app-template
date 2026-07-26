import { useEffect, useRef } from 'react';

interface SwipeBackOptions {
  onSwipeBack: () => void;
  threshold?: number;
  enabled?: boolean;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_ANGLE_THRESHOLD = 30;

export function useSwipeBack({ onSwipeBack, threshold = SWIPE_THRESHOLD, enabled = true }: SwipeBackOptions) {
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartXRef.current) {
        return;
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartXRef.current;
      const deltaY = touch.clientY - touchStartYRef.current;

      if (deltaX <= 0) {
        return;
      }

      const angle = Math.abs(deltaY / deltaX) * (180 / Math.PI);

      if (angle < SWIPE_ANGLE_THRESHOLD && deltaX > threshold) {
        onSwipeBack();
        touchStartXRef.current = 0;
        touchStartYRef.current = 0;
      }
    };

    const handleTouchEnd = () => {
      touchStartXRef.current = 0;
      touchStartYRef.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeBack, threshold, enabled]);
}
