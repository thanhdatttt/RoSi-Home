import { useSettingsRepository } from '../api/settings.repository';

export function useSettingsData() {
  return useSettingsRepository();
}
