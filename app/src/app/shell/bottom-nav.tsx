import type { NavIconKey } from '@/routes/registry/route-types';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Home, Info, List, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getNavRoutes } from '@/routes/registry/route-registry';

const iconMap: Record<NavIconKey, typeof Home> = {
  home: Home,
  tasks: List,
  profile: User,
  settings: Settings,
  about: Info,
};

export function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = getNavRoutes('mobile');

  return (
    <nav className="border-border bg-background flex shrink-0 h-[calc(var(--bottom-nav-height)+var(--app-safe-area-bottom)+var(--bottom-nav-bottom-buffer))] border-t pb-[calc(var(--app-safe-area-bottom)+var(--bottom-nav-bottom-buffer))]">
      {tabs.map((tab) => {
        const Icon = iconMap[tab.nav.iconKey];
        const active = pathname === tab.path;
        return (
          <button
            key={tab.key}
            onClick={() => navigate({ to: tab.path })}
            className={cn(
              'flex h-[var(--bottom-nav-height)] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
              active
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {t(tab.nav.labelKey)}
          </button>
        );
      })}
    </nav>
  );
}
