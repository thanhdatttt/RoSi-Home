import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { vnd } from '@/core/formatters';
import { useLeases } from '@/features/leases/hooks/use-leases';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { Button, Card, Feedback, Notice, Screen, Title, colors } from '@/ui';

import { InvoiceLineItem } from '../components/InvoiceLineItem';
import { useInvoices } from '../hooks/use-billing';
import { InvoiceLine } from '../models/billing';

export function InvoicePreviewScreen() {
  const {
    roomId = 'r2',
    electricity = '1368',
    water = '351',
  } = useLocalSearchParams<{ roomId?: string; electricity?: string; water?: string }>();
  const { rooms } = useRooms();
  const { leases } = useLeases();
  const { createInvoice } = useInvoices();
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return (
      <Screen>
        <Feedback type="error" message="Không thể tính hóa đơn vì phòng không tồn tại" />
      </Screen>
    );
  }

  const electricityUsage = Math.max(Number(electricity) - 1250, 0);
  const waterUsage = Math.max(Number(water) - 342, 0);
  const lines: InvoiceLine[] = [
    { label: 'Tiền thuê phòng', amount: room.rent },
    {
      label: 'Điện',
      detail: `${electricityUsage} kWh × 3.500 đ`,
      amount: electricityUsage * 3500,
    },
    {
      label: 'Nước',
      detail: `${waterUsage} m³ × 18.000 đ`,
      amount: waterUsage * 18000,
    },
    { label: 'Internet + vệ sinh', amount: 150000 },
  ];
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const tenantName =
    leases.find((lease) => lease.roomId === room.id && lease.status !== 'Đã kết thúc')
      ?.tenantName ?? 'Chưa có người thuê';

  const createDraft = () => {
    const invoiceId = createInvoice({
      roomId: room.id,
      tenantName,
      period: '07/2026',
      dueDate: '05/08/2026',
      lines,
    });
    router.replace({ pathname: '/invoice-detail', params: { invoiceId } });
  };

  return (
    <Screen>
      <Title subtitle={`Phòng ${room.name} · Tháng 07/2026`}>Hóa đơn dự kiến</Title>
      <Notice
        title="CONCEPT · KIỂM TRA TRƯỚC KHI TẠO"
        message="Số tiền được tính từ mock giá điện nước và phụ phí hiện tại."
      />
      <Card>
        {lines.map((line) => (
          <InvoiceLineItem key={line.label} line={line} />
        ))}
      </Card>
      <Text style={styles.total}>{vnd(total)}</Text>
      <Button label="Tạo hóa đơn nháp" onPress={createDraft} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'right' },
});
