import { useMockAppData } from '@/core/data/MockAppDataProvider';

import { Surcharge, UtilityRate } from '../models/settings';

export interface SettingsRepository {
  remote: boolean;
  surcharges: Surcharge[];
  utilityRates: UtilityRate[];
  loading: boolean;
  error: string | null;
  createSurcharge(
    value: Omit<Surcharge, 'id' | 'status'>,
  ): Promise<Surcharge>;
  toggleSurcharge(id: string): Promise<void>;
  saveUtilityRate(value: UtilityRate): Promise<UtilityRate>;
}

export function useSettingsRepository(): SettingsRepository {
  const {
    remote,
    surcharges,
    utilityRates,
    loading,
    error,
    addSurcharge,
    toggleSurcharge,
    updateUtilityRate,
  } = useMockAppData();
  return {
    remote,
    surcharges,
    utilityRates,
    loading,
    error,
    createSurcharge: addSurcharge,
    toggleSurcharge,
    saveUtilityRate: updateUtilityRate,
  };
}
