import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ToasterProps } from 'sonner';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/providers/theme-provider';

function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.getElementById('toaster-root') || document.body);
  }, []);

  if (!portalEl) {
    return null;
  }

  return createPortal(
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      offset="48px"
      richColors
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      {...props}
    />,
    portalEl,
  );
}

export { Toaster };
