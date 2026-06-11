import { invokeCommand } from './client';

export interface AppConfig {
  data_dir: string;
  log_dir: string;
  config_dir: string;
}

export async function getAppConfig(): Promise<AppConfig> {
  return invokeCommand<AppConfig>('get_app_config');
}
