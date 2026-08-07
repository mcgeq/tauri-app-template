import { useNavigate } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import { setLanguage, toggleLanguage } from '@/i18n/language';
import { openAppRoute } from '@/platform/windows/open-app-route';
import { useTheme } from '@/providers/theme-provider';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleOpenSettings = () => {
    onOpenChange(false);
    void openAppRoute('settings', {
      navigate,
      t,
    });
  };

  const handleOpenAbout = () => {
    onOpenChange(false);
    void openAppRoute('about', {
      navigate,
      t,
    });
  };

  const handleToggleTheme = () => {
    onOpenChange(false);
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleToggleLanguage = () => {
    onOpenChange(false);
    void setLanguage(toggleLanguage(i18n.language));
  };

  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command menu">
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Navigation">
          <Command.Item onSelect={handleOpenSettings}>Settings</Command.Item>
          <Command.Item onSelect={handleOpenAbout}>About</Command.Item>
        </Command.Group>

        <Command.Group heading="Preferences">
          <Command.Item onSelect={handleToggleTheme}>{t('theme.toggle')}</Command.Item>
          <Command.Item onSelect={handleToggleLanguage}>{t('language.toggle')}</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

export default CommandPalette;
