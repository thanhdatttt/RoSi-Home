import { Surcharge, UtilityRate } from '../models/settings';

export const initialSurcharges: Surcharge[] = [
  { id: 's1', propertyId: 'p1', name: 'Internet', amount: 100000, status: 'Đang áp dụng' },
  { id: 's2', propertyId: 'p1', name: 'Vệ sinh', amount: 50000, status: 'Đang áp dụng' },
];

export const initialUtilityRates: UtilityRate[] = [
  {
    propertyId: 'p1',
    electricityRate: 3500,
    waterMethod: 'Theo đồng hồ',
    waterRate: 18000,
    effectiveFrom: '01/08/2026',
  },
];
