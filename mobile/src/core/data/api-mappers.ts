import { Invoice } from '@/features/billing/models/billing';
import { Lease } from '@/features/leases/models/lease';
import { MaintenanceRequest } from '@/features/maintenance/models/maintenance';
import { Property } from '@/features/properties/models/property';
import { Room } from '@/features/rooms/models/room';
import { Surcharge, UtilityRate } from '@/features/settings/models/settings';

export type PropertyDto = {
  id: string;
  name: string;
  address: string;
};

export type RoomDto = {
  id: string;
  propertyId: string;
  name: string;
  baseRent: number;
  status: 'Vacant' | 'Occupied';
};

export type LeaseDto = {
  id: string;
  roomId: string;
  tenant: { fullName: string; phone: string; email: string };
  startDate: string;
  endDate: string;
  agreedRent: number;
  deposit: number;
  status: 'Active' | 'Ended' | 'Expired';
};

export type SurchargeDto = {
  id: string;
  propertyId: string;
  name: string;
  monthlyAmount: number;
  active: boolean;
};

export type UtilityRateDto = {
  propertyId: string;
  electricityRatePerKwh: number;
  waterBillingMethod: 'Metered' | 'Flat';
  waterRatePerM3: number | null;
  waterFlatAmountPerTenant: number | null;
  effectiveFrom: string;
};

export type MaintenanceRequestDto = {
  id: string;
  title: string;
  description: string;
  roomId?: string;
  room?: { id: string; name: string };
  status: 'Pending' | 'InProgress' | 'Completed';
  submittedAt: string;
};

export type InvoiceDto = {
  id: string;
  roomId: string;
  billingPeriod: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid';
  lineItems: {
    description: string;
    quantity: number | null;
    unitRate: number | null;
    amount: number;
  }[];
};

export function toProperty(dto: PropertyDto): Property {
  return { id: dto.id, name: dto.name, address: dto.address };
}

export function toRoom(dto: RoomDto): Room {
  return {
    id: dto.id,
    propertyId: dto.propertyId,
    name: dto.name,
    rent: dto.baseRent,
    status: dto.status === 'Occupied' ? 'Đang thuê' : 'Trống',
  };
}

function leaseStatus(dto: LeaseDto): Lease['status'] {
  if (dto.status !== 'Active') return 'Đã kết thúc';
  const daysUntilEnd =
    (new Date(`${dto.endDate}T00:00:00Z`).getTime() - Date.now()) /
    (24 * 60 * 60 * 1000);
  return daysUntilEnd >= 0 && daysUntilEnd <= 30
    ? 'Sắp hết hạn'
    : 'Đang hiệu lực';
}

export function toLease(dto: LeaseDto): Lease {
  return {
    id: dto.id,
    roomId: dto.roomId,
    tenantName: dto.tenant.fullName,
    phone: dto.tenant.phone,
    identityNumber: '',
    email: dto.tenant.email,
    startDate: dto.startDate,
    endDate: dto.endDate,
    rent: dto.agreedRent,
    deposit: dto.deposit,
    status: leaseStatus(dto),
  };
}

export function toSurcharge(dto: SurchargeDto): Surcharge {
  return {
    id: dto.id,
    propertyId: dto.propertyId,
    name: dto.name,
    amount: dto.monthlyAmount,
    status: dto.active ? 'Đang áp dụng' : 'Ngừng áp dụng',
  };
}

export function toUtilityRate(dto: UtilityRateDto): UtilityRate {
  return {
    propertyId: dto.propertyId,
    electricityRate: dto.electricityRatePerKwh,
    waterMethod:
      dto.waterBillingMethod === 'Flat' ? 'Theo người' : 'Theo đồng hồ',
    waterRate:
      dto.waterBillingMethod === 'Flat'
        ? (dto.waterFlatAmountPerTenant ?? 0)
        : (dto.waterRatePerM3 ?? 0),
    effectiveFrom: dto.effectiveFrom,
  };
}

export function toMaintenanceRequest(
  dto: MaintenanceRequestDto,
): MaintenanceRequest {
  const status: MaintenanceRequest['status'] =
    dto.status === 'Pending'
      ? 'Mới'
      : dto.status === 'InProgress'
        ? 'Đang xử lý'
        : 'Hoàn tất';
  return {
    id: dto.id,
    roomId: dto.roomId ?? dto.room?.id ?? '',
    title: dto.title,
    description: dto.description,
    createdAt: dto.submittedAt,
    status,
  };
}

export function toInvoice(dto: InvoiceDto): Invoice {
  const status: Invoice['status'] =
    dto.status === 'Draft'
      ? 'Nháp'
      : dto.status === 'Sent'
        ? 'Đã gửi'
        : 'Đã thanh toán';
  return {
    id: dto.id,
    roomId: dto.roomId,
    tenantName: '—',
    period: dto.billingPeriod,
    dueDate: dto.dueDate,
    status,
    lines: dto.lineItems.map((line) => ({
      label: line.description,
      detail:
        line.quantity !== null && line.unitRate !== null
          ? `${line.quantity} × ${line.unitRate}`
          : undefined,
      amount: line.amount,
    })),
  };
}

export function toApiDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value;
  return `${match[3]}-${match[2]}-${match[1]}`;
}
