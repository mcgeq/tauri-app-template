import { invokeCommand } from './client';

export interface TrayMenuText {
  showText: string;
  settingsText: string;
  quitText: string;
}

export async function updateTrayMenu(text: TrayMenuText): Promise<void> {
  await invokeCommand<void>('update_tray_menu', {
    showText: text.showText,
    settingsText: text.settingsText,
    quitText: text.quitText,
  });
}
