import { Invoice } from '@/features/billing/models/billing';

import { TenantInvoiceDto } from './tenant-billing.dto';

export function toTenantInvoice(dto: TenantInvoiceDto): Invoice {
  return {
    id: dto.id,
    roomId: dto.roomId,
    tenantName: '',
    period: dto.billingPeriod,
    dueDate: dto.dueDate,
    status:
      dto.status === 'Paid'
        ? 'Đã thanh toán'
        : dto.status === 'Sent'
          ? 'Đã gửi'
          : 'Nháp',
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
