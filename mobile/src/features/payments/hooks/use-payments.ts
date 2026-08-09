import { useCallback, useEffect, useState } from 'react';

import { PaymentHistory, PaymentProof, VietQr } from '../models/payment';
import { usePaymentsRepository } from '../api/payments.repository';

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useVietQr(invoiceId: string) {
  const { getVietQr } = usePaymentsRepository();
  const [value, setValue] = useState<VietQr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setValue(await getVietQr(invoiceId));
    } catch (requestError) {
      setError(message(requestError, 'Không thể tải VietQR.'));
    } finally {
      setLoading(false);
    }
  }, [getVietQr, invoiceId]);
  useEffect(() => void refresh(), [refresh]);
  return { value, loading, error, refresh };
}

export function usePaymentHistory() {
  const { getHistory } = usePaymentsRepository();
  const [value, setValue] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setValue(await getHistory());
    } catch (requestError) {
      setError(message(requestError, 'Không thể tải lịch sử thanh toán.'));
    } finally {
      setLoading(false);
    }
  }, [getHistory]);
  useEffect(() => void refresh(), [refresh]);
  return { value, loading, error, refresh };
}

export function usePendingProofs() {
  const { getPendingProofs, confirmPayment } = usePaymentsRepository();
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProofs(await getPendingProofs());
    } catch (requestError) {
      setError(message(requestError, 'Không thể tải chứng từ chờ duyệt.'));
    } finally {
      setLoading(false);
    }
  }, [getPendingProofs]);
  useEffect(() => void refresh(), [refresh]);
  const confirm = useCallback(
    async (invoiceId: string) => {
      await confirmPayment(invoiceId);
      await refresh();
    },
    [confirmPayment, refresh],
  );
  return { proofs, loading, error, refresh, confirm };
}
