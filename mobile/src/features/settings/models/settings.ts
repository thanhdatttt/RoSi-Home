export type SurchargeStatus = 'Đang áp dụng' | 'Ngừng áp dụng';
export type Surcharge = {
  id: string;
  propertyId: string;
  name: string;
  amount: number;
  status: SurchargeStatus;
};

export type WaterBillingMethod = 'Theo đồng hồ' | 'Theo người';
export type UtilityRate = {
  propertyId: string;
  electricityRate: number;
  waterMethod: WaterBillingMethod;
  waterRate: number;
  effectiveFrom: string;
};
