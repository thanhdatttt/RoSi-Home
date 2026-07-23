import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Surcharge, UtilityRate } from '../models/settings';

export interface SettingsRepository {
  surcharges: Surcharge[];
  utilityRates: UtilityRate[];
  createSurcharge(value: Omit<Surcharge, 'id' | 'status'>): void;
  toggleSurcharge(id: string): void;
  saveUtilityRate(value: UtilityRate): void;
}

export function useSettingsRepository(): SettingsRepository {
  const {
    surcharges,
    utilityRates,
    addSurcharge,
    toggleSurcharge,
    updateUtilityRate,
  } = useMockAppData();
  return {
    surcharges,
    utilityRates,
    createSurcharge: addSurcharge,
    toggleSurcharge,
    saveUtilityRate: updateUtilityRate,
  };
}
