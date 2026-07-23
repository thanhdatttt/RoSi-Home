import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { vnd } from '@/core/formatters';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { Card, Feedback, KeyValueRow, Notice, Screen, Title, colors, spacing } from '@/ui';
import { useInvoices } from '../hooks/use-billing';
import { invoiceTotal } from '../models/billing';

const qrCells = Array.from({ length: 121 }, (_, index) => {
  const row = Math.floor(index / 11);
  const column = index % 11;
  const finder =
    (row < 4 && column < 4) ||
    (row < 4 && column > 6) ||
    (row > 6 && column < 4);
  return finder || (row * 3 + column * 5 + index) % 4 < 2;
});

export function VietQrScreen() {
  const { invoiceId = 'i1' } = useLocalSearchParams<{ invoiceId?: string }>();
  const { invoices } = useInvoices();
  const { rooms } = useRooms();
  const invoice = invoices.find((item) => item.id === invoiceId);

  if (!invoice) {
    return <Screen><Feedback type="error" message="Không thể tạo VietQR minh họa" /></Screen>;
  }

  const room = rooms.find((item) => item.id === invoice.roomId);
  return (
    <Screen>
      <Title subtitle={`P${room?.name ?? '—'} · Tháng ${invoice.period}`}>
        Thanh toán VietQR
      </Title>
      <Notice
        title="QR MINH HỌA · KHÔNG QUÉT ĐƯỢC"
        message="VietQR chỉ hiển thị dữ liệu mẫu và không thay đổi trạng thái hóa đơn."
      />
      <Text style={styles.amount}>{vnd(invoiceTotal(invoice))}</Text>
      <View accessibilityLabel="Mã VietQR minh họa" style={styles.qr}>
        {qrCells.map((filled, index) => (
          <View key={index} style={[styles.cell, filled && styles.cellFilled]} />
        ))}
      </View>
      <Card>
        <KeyValueRow label="Ngân hàng" value="VCB" />
        <KeyValueRow label="Số tài khoản" value="0123456789" />
        <KeyValueRow label="Chủ tài khoản" value="NGUYEN MINH AN" />
        <KeyValueRow label="Nội dung" value={`RH P${room?.name ?? '—'} ${invoice.period}`} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amount: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  qr: {
    width: 242,
    height: 242,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  cell: { width: 20, height: 20, backgroundColor: colors.surface },
  cellFilled: { backgroundColor: colors.text },
});
