import { useEffect, useState } from 'react';

import { ApiEnvelope, useApiSession } from '@/core/api';
import { useMockAppData } from '@/core/data/MockAppDataProvider';
import { invoiceTotal } from '@/features/billing/models/billing';

type OutstandingSummaryDto = {
  outstandingTotal: number;
  overdueInvoices: {
    invoiceId: string;
    tenant: string;
    room: string;
    dueDate: string;
    amount: number;
  }[];
};

type UpcomingExpirationDto = { leaseId: string }[];

export function useDashboard() {
  const { enabled, authenticated, client } = useApiSession();
  const { rooms, invoices, leases } = useMockAppData();
  const [outstanding, setOutstanding] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [remoteExpiring, setRemoteExpiring] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !authenticated) return;
    let active = true;
    setError(null);
    void Promise.all([
      client.request<ApiEnvelope<OutstandingSummaryDto>>({
        path: '/api/v1/dashboard/outstanding',
      }),
      client.request<ApiEnvelope<UpcomingExpirationDto>>({
        path: '/api/v1/dashboard/upcoming-expirations',
      }),
    ])
      .then(([outstandingResponse, expirationResponse]) => {
        if (!active) return;
        setOutstanding(outstandingResponse.data.outstandingTotal);
        setOverdueCount(outstandingResponse.data.overdueInvoices.length);
        setRemoteExpiring(expirationResponse.data.length);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Không thể tải dashboard.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [authenticated, client, enabled]);

  const expected = invoices.reduce(
    (total, invoice) => total + invoiceTotal(invoice),
    0,
  );
  const collected = invoices
    .filter((invoice) => invoice.status === 'Đã thanh toán')
    .reduce((total, invoice) => total + invoiceTotal(invoice), 0);

  return {
    remote: enabled,
    error,
    rooms,
    invoices,
    expected,
    collected,
    outstanding,
    overdueCount,
    occupied: rooms.filter((room) => room.status === 'Đang thuê').length,
    expiring: enabled
      ? remoteExpiring
      : leases.filter((lease) => lease.status === 'Sắp hết hạn').length,
  };
}
