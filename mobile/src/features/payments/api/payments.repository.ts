import { useCallback } from 'react';

import { ApiEnvelope, useApiSession } from '@/core/api';

import {
  PaymentConfig,
  PaymentHistory,
  PaymentProof,
  PaymentProofFile,
  ReminderConfig,
  VietQr,
} from '../models/payment';

export function usePaymentsRepository() {
  const { client } = useApiSession();

  const getPaymentConfig = useCallback(
    async () =>
      (
        await client.request<ApiEnvelope<PaymentConfig>>({
          path: '/api/v1/payment-config',
        })
      ).data,
    [client],
  );

  const savePaymentConfig = useCallback(
    async (value: PaymentConfig) =>
      (
        await client.request<ApiEnvelope<PaymentConfig>>({
          method: 'PUT',
          path: '/api/v1/payment-config',
          body: value,
        })
      ).data,
    [client],
  );

  const getVietQr = useCallback(
    async (invoiceId: string) =>
      (
        await client.request<ApiEnvelope<VietQr>>({
          path: `/api/v1/invoices/${invoiceId}/vietqr`,
        })
      ).data,
    [client],
  );

  const uploadProof = useCallback(
    async (invoiceId: string, file: PaymentProofFile) => {
      const form = new FormData();
      form.append(
        'proof',
        { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob,
      );
      return (
        await client.request<ApiEnvelope<PaymentProof>>({
          method: 'POST',
          path: `/api/v1/invoices/${invoiceId}/payment-proofs`,
          body: form,
        })
      ).data;
    },
    [client],
  );

  const getPendingProofs = useCallback(
    async () =>
      (
        await client.request<ApiEnvelope<PaymentProof[]>>({
          path: '/api/v1/payment-proofs?status=Pending',
        })
      ).data,
    [client],
  );

  const confirmPayment = useCallback(
    async (invoiceId: string) =>
      client.request<ApiEnvelope<{ id: string }>>({
        method: 'POST',
        path: `/api/v1/invoices/${invoiceId}/confirm-payment`,
      }),
    [client],
  );

  const getHistory = useCallback(
    async () =>
      (
        await client.request<ApiEnvelope<PaymentHistory>>({
          path: '/api/v1/payments/history',
        })
      ).data,
    [client],
  );

  const sendReminder = useCallback(
    async (invoiceId: string) =>
      client.request<ApiEnvelope<{ success: true }>>({
        method: 'POST',
        path: `/api/v1/invoices/${invoiceId}/remind`,
      }),
    [client],
  );

  const getReminderConfig = useCallback(
    async (propertyId: string) =>
      (
        await client.request<ApiEnvelope<ReminderConfig>>({
          path: `/api/v1/properties/${propertyId}/lease-reminder-config`,
        })
      ).data,
    [client],
  );

  const saveReminderConfig = useCallback(
    async (propertyId: string, overdueReminderEveryDays: number) =>
      (
        await client.request<ApiEnvelope<ReminderConfig>>({
          method: 'PATCH',
          path: `/api/v1/properties/${propertyId}/lease-reminder-config`,
          body: { overdueReminderEveryDays },
        })
      ).data,
    [client],
  );

  return {
    getPaymentConfig,
    savePaymentConfig,
    getVietQr,
    uploadProof,
    getPendingProofs,
    confirmPayment,
    getHistory,
    sendReminder,
    getReminderConfig,
    saveReminderConfig,
  };
}
