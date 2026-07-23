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
import { useInvoices } from '../hooks/use-billing';
import { invoiceTotal } from '../models/billing';

export function InvoiceDetailScreen() {
  const { invoiceId = 'i1' } = useLocalSearchParams<{ invoiceId?: string }>();
  const { invoices, sendInvoice } = useInvoices();
  const { rooms } = useRooms();
  const [sent, setSent] = useState(false);
  const invoice = invoices.find((item) => item.id === invoiceId);

  if (!invoice) {
    return <Screen><Feedback type="error" message="Không tìm thấy hóa đơn" /></Screen>;
  }

  const room = rooms.find((item) => item.id === invoice.roomId);
  const handleSend = () => {
    sendInvoice(invoice.id);
    setSent(true);
  };

  return (
    <Screen>
      <Title subtitle={`P${room?.name ?? '—'} · Tháng ${invoice.period}`}>
        Chi tiết hóa đơn
      </Title>
      <Notice
        title="CONCEPT · CHƯA GỬI THÔNG BÁO THẬT"
        message="Thao tác gửi chỉ cập nhật trạng thái trong bộ nhớ."
      />
      {sent ? <Success message="Đã gửi hóa đơn mô phỏng" /> : null}
      <Badge label={invoice.status} />
      <Card>
        {invoice.lines.map((line) => (
          <InvoiceLineItem key={line.label} line={line} />
        ))}
      </Card>
      <Text style={styles.total}>{vnd(invoiceTotal(invoice))}</Text>
      <Button
        label="Xem VietQR"
        onPress={() => router.push({ pathname: '/vietqr', params: { invoiceId: invoice.id } })}
      />
      <Button
        label="Gửi cho người thuê"
        variant="secondary"
        disabled={invoice.status !== 'Nháp'}
        onPress={handleSend}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'right' },
});
