import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { InvoiceLineItem } from '@/features/billing/components/InvoiceLineItem';
import { invoiceTotal } from '@/features/billing/models/billing';
import {
  pickPaymentProof,
  usePaymentsRepository,
} from '@/features/payments';
import {
  Badge,
  Button,
  Card,
  Feedback,
  KeyValueRow,
  Notice,
  Screen,
  Title,
} from '@/ui';

import { useTenantInvoice } from '../hooks/use-tenant-billing';

export function TenantInvoiceDetailScreen() {
  const { invoiceId = '' } = useLocalSearchParams<{ invoiceId?: string }>();
  const { invoice, loading, error, refresh, getInvoicePdf } =
    useTenantInvoice(invoiceId);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);
  const [proofMessage, setProofMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { uploadProof } = usePaymentsRepository();

  if (!invoiceId) {
    return (
      <Screen>
        <Title>Chi tiết hóa đơn</Title>
        <Notice
          title="SẴN SÀNG KẾT NỐI API"
          message="Màn hình chỉ mở khi ứng dụng có invoice id do backend cấp."
        />
      </Screen>
    );
  }
  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error || !invoice) {
    return (
      <Screen>
        <Feedback
          type="error"
          message={error ?? 'Không tìm thấy hóa đơn.'}
          onRetry={() => void refresh()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle={`Kỳ ${invoice.period}`}>Chi tiết hóa đơn</Title>
      {pdfMessage ? (
        <Notice title="PDF HÓA ĐƠN" message={pdfMessage} />
      ) : null}
      {proofMessage ? (
        <Notice title="CHỨNG TỪ THANH TOÁN" message={proofMessage} />
      ) : null}
      <Badge label={invoice.status} />
      <Card>
        {invoice.lines.map((line) => (
          <InvoiceLineItem key={line.label} line={line} />
        ))}
        <InvoiceLineItem
          line={{ label: 'Tổng tiền', amount: invoiceTotal(invoice) }}
        />
        <KeyValueRow label="Hạn thanh toán" value={invoice.dueDate} />
      </Card>
      <Button
        label="Xem hoặc tải PDF"
        variant="secondary"
        onPress={() => {
          void getInvoicePdf(invoice.id)
            .then(() =>
              setPdfMessage(
                'Backend đã trả tệp PDF. Dự án chưa có luồng lưu hoặc mở tệp native đã được phê duyệt.',
              ),
            )
            .catch((requestError: unknown) =>
              setPdfMessage(
                requestError instanceof Error
                  ? requestError.message
                  : 'Không thể tải PDF hóa đơn.',
              ),
            );
        }}
      />
      {invoice.status === 'Đã gửi' ? (
        <>
          <Button
            label="Mở VietQR"
            onPress={() =>
              router.push({
                pathname: '/vietqr',
                params: { invoiceId: invoice.id },
              })
            }
          />
          <Button
            disabled={uploading}
            label={uploading ? 'Đang tải chứng từ…' : 'Tải chứng từ thanh toán'}
            variant="secondary"
            onPress={() => {
              void pickPaymentProof().then(async (result) => {
                if (result.status === 'cancelled') return;
                if (result.status === 'error') {
                  setProofMessage(result.message);
                  return;
                }
                setUploading(true);
                setProofMessage(null);
                try {
                  await uploadProof(invoice.id, result.file);
                  setProofMessage(
                    'Đã tải chứng từ. Chủ nhà sẽ đối chiếu thủ công trước khi xác nhận.',
                  );
                } catch (requestError) {
                  setProofMessage(
                    requestError instanceof Error
                      ? requestError.message
                      : 'Không thể tải chứng từ.',
                  );
                } finally {
                  setUploading(false);
                }
              });
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}
