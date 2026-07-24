import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useState } from 'react';

import { vnd } from '@/core/formatters';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import {
  Badge,
  Button,
  Card,
  Feedback,
  Notice,
  Screen,
  Success,
  Title,
  colors,
} from '@/ui';

import { InvoiceLineItem } from '../components/InvoiceLineItem';
import { useInvoice } from '../hooks/use-billing';
import { invoiceTotal } from '../models/billing';

export function InvoiceDetailScreen() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId?: string }>();
  const { invoice, remote, loading, error, sendInvoice } = useInvoice(invoiceId ?? '');
  const { rooms } = useRooms();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingError, setSendingError] = useState<string | null>(null);
  if (loading) {
    return <Screen><Feedback type="loading" /></Screen>;
  }
  if (!invoice) {
    return (
      <Screen>
        <Feedback
          type="error"
          message={error ?? 'Không tìm thấy hóa đơn'}
        />
      </Screen>
    );
  }

  const room = rooms.find((item) => item.id === invoice.roomId);
  const handleSend = async () => {
    setSending(true);
    setSendingError(null);
    try {
      await sendInvoice(invoice.id);
      setSent(true);
    } catch (requestError) {
      setSendingError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể gửi hóa đơn.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <Title subtitle={`P${room?.name ?? '—'} · Tháng ${invoice.period}`}>
        Chi tiết hóa đơn
      </Title>
      <Notice
        title="TRẠNG THÁI HÓA ĐƠN"
        message="Backend chỉ cho gửi hóa đơn đang ở trạng thái Draft."
      />
      {sendingError ? (
        <Notice title="Không thể gửi hóa đơn" message={sendingError} />
      ) : null}
      {sent ? <Success message="Đã gửi hóa đơn" /> : null}
      <Badge label={invoice.status} />
      <Card>
        {invoice.lines.map((line) => (
          <InvoiceLineItem key={line.label} line={line} />
        ))}
      </Card>
      <Text style={styles.total}>{vnd(invoiceTotal(invoice))}</Text>
      <Button
        label={remote ? 'VietQR chưa có API' : 'Xem VietQR'}
        disabled={remote}
        onPress={() => router.push({ pathname: '/vietqr', params: { invoiceId: invoice.id } })}
      />
      <Button
        label={sending ? 'Đang gửi hóa đơn…' : 'Gửi cho người thuê'}
        variant="secondary"
        disabled={sending || invoice.status !== 'Nháp'}
        onPress={handleSend}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'right' },
});
