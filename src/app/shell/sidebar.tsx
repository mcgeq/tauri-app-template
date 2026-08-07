import { useLocation, useNavigate } from '@tanstack/react-router';
import { Info, LayoutDashboard, Settings, Timer, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getNavRoutes } from '@/routes/registry/route-registry';
import type { NavIconKey } from '@/routes/registry/route-types';

export type Section = 'home' | 'tasks' | 'profile';

const iconMap: Record<NavIconKey, typeof LayoutDashboard> = {
  home: LayoutDashboard,
  tasks: Timer,
  profile: User,
  settings: Settings,
  about: Info,
};

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = getNavRoutes('desktop');

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="bg-muted/50 flex w-12 flex-col border-r pt-14">
        <div className="flex flex-col items-center gap-1 px-2 py-3">
          {items.map((item) => {
            const Icon = iconMap[item.nav.iconKey];
            const active = pathname === item.path;
            return (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => navigate({ to: item.path })}
                    className={cn(
                      'flex items-center justify-center rounded-lg p-2 transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{t(item.nav.labelKey)}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}
