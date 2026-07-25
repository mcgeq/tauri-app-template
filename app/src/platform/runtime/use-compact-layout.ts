import { useEffect, useState } from 'react';

export function useCompactLayout(breakpoint = 768) {
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    function handleResize() {
      setIsCompactLayout(window.innerWidth < breakpoint);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isCompactLayout;
}
