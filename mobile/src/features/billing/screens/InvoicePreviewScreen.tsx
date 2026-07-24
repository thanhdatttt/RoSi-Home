import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { vnd } from '@/core/formatters';
import { useLeases } from '@/features/leases/hooks/use-leases';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { useSettingsData } from '@/features/settings/hooks/use-settings';
import { Button, Card, Feedback, Notice, Screen, Title, colors } from '@/ui';

import { InvoiceLineItem } from '../components/InvoiceLineItem';
import { useInvoices } from '../hooks/use-billing';
import {
  billingPeriodLabel,
  currentBillingPeriod,
  defaultInvoiceDueDate,
  InvoiceLine,
} from '../models/billing';

export function InvoicePreviewScreen() {
  const {
    roomId,
    previousElectricity = '1250',
    electricity = '1368',
    previousWater = '342',
    water = '351',
    waterMetered = 'true',
    period = currentBillingPeriod(),
  } = useLocalSearchParams<{
    roomId?: string;
    previousElectricity?: string;
    electricity?: string;
    previousWater?: string;
    water?: string;
    waterMetered?: string;
    period?: string;
  }>();
  const { rooms } = useRooms();
  const { leases } = useLeases();
  const { utilityRates, surcharges } = useSettingsData();
  const { createInvoice, remote } = useInvoices();
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return (
      <Screen>
        <Feedback type="error" message="Không thể tính hóa đơn vì phòng không tồn tại" />
      </Screen>
    );
  }

  const utilityRate = utilityRates.find(
    (rate) => rate.propertyId === room.propertyId,
  );
  const electricityPrice = utilityRate?.electricityRate ?? 3500;
  const waterPrice = utilityRate?.waterRate ?? 18000;
  const usesWaterMeter =
    waterMetered === 'true' && utilityRate?.waterMethod !== 'Theo người';
  const electricityUsage = Math.max(
    Number(electricity) - Number(previousElectricity),
    0,
  );
  const waterUsage = usesWaterMeter
    ? Math.max(Number(water) - Number(previousWater), 0)
    : 0;
  const activeSurcharges = surcharges.filter(
    (surcharge) =>
      surcharge.propertyId === room.propertyId &&
      surcharge.status === 'Đang áp dụng',
  );
  const lines: InvoiceLine[] = [
    { label: 'Tiền thuê phòng', amount: room.rent },
    {
      label: 'Điện',
      detail: `${electricityUsage} kWh × ${new Intl.NumberFormat('vi-VN').format(electricityPrice)} đ`,
      amount: electricityUsage * electricityPrice,
    },
    {
      label: 'Nước',
      detail: usesWaterMeter
        ? `${waterUsage} m³ × ${new Intl.NumberFormat('vi-VN').format(waterPrice)} đ`
        : `1 người × ${new Intl.NumberFormat('vi-VN').format(waterPrice)} đ`,
      amount: usesWaterMeter ? waterUsage * waterPrice : waterPrice,
    },
    ...activeSurcharges.map((surcharge) => ({
      label: surcharge.name,
      amount: surcharge.amount,
    })),
  ];
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const tenantName =
    leases.find((lease) => lease.roomId === room.id && lease.status !== 'Đã kết thúc')
      ?.tenantName ?? 'Chưa có người thuê';

  const createDraft = async () => {
    setSaving(true);
    setSavingError(null);
    try {
      const invoiceId = await createInvoice({
        roomId: room.id,
        tenantName,
        period,
        dueDate: defaultInvoiceDueDate(period),
        lines,
      });
      if (invoiceId) {
        router.replace({
          pathname: '/invoice-detail',
          params: { invoiceId },
        });
      } else {
        router.replace('/invoices');
      }
    } catch (requestError) {
      setSavingError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể tạo hóa đơn.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Title subtitle={`Phòng ${room.name} · Tháng ${billingPeriodLabel(period)}`}>
        Hóa đơn dự kiến
      </Title>
      <Notice
        title="ƯỚC TÍNH TRÊN THIẾT BỊ"
        message={
          remote
            ? 'Bạn có thể kiểm tra ngay từng phép tính trước khi tạo. Hóa đơn chính thức vẫn được backend kiểm tra lại từ dữ liệu đã lưu.'
            : 'Số tiền được tính từ dữ liệu mẫu hiện tại.'
        }
      />
      {savingError ? (
        <Notice title="Không thể tạo hóa đơn" message={savingError} />
      ) : null}
      <Card>
        {lines.map((line) => (
          <InvoiceLineItem key={line.label} line={line} />
        ))}
      </Card>
      <Text style={styles.total}>{vnd(total)}</Text>
      <Button
        label={saving ? 'Đang tạo hóa đơn…' : 'Tạo hóa đơn nháp'}
        disabled={saving}
        onPress={createDraft}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'right' },
});
