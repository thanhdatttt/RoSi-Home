import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { useSettingsData } from '@/features/settings/hooks/use-settings';
import { Button, Feedback, Notice, Screen, Success, Title } from '@/ui';

import { MeterReadingField } from '../components/MeterReadingField';
import { useMeterReadings } from '../hooks/use-billing';
import {
  billingPeriodLabel,
  currentBillingPeriod,
} from '../models/billing';

function readingNumberError(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? undefined
    : 'Chỉ số phải là số không âm';
}

export function MeterReadingScreen() {
  const period = currentBillingPeriod();
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const { rooms } = useRooms();
  const { utilityRates } = useSettingsData();
  const { saveMeterReading, remote } = useMeterReadings();
  const room = rooms.find((item) => item.id === roomId);
  const utilityRate = utilityRates.find(
    (item) => item.propertyId === room?.propertyId,
  );
  const electricityPrice = utilityRate?.electricityRate ?? 3500;
  const waterPrice = utilityRate?.waterRate ?? 18000;
  const waterMetered = utilityRate?.waterMethod !== 'Theo người';
  const [previousElectricity, setPreviousElectricity] = useState(
    remote ? '' : '1250',
  );
  const [electricity, setElectricity] = useState(remote ? '' : '1368');
  const [previousWater, setPreviousWater] = useState(remote ? '' : '342');
  const [water, setWater] = useState(remote ? '' : '351');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const previousElectricityError = readingNumberError(previousElectricity);
  const previousWaterError = readingNumberError(previousWater);
  const electricityError =
    readingNumberError(electricity) ??
    (previousElectricity &&
    electricity &&
    !previousElectricityError &&
    Number(electricity) < Number(previousElectricity)
      ? 'Chỉ số không được nhỏ hơn kỳ trước'
      : undefined);
  const waterError =
    readingNumberError(water) ??
    (previousWater &&
    water &&
    !previousWaterError &&
    Number(water) < Number(previousWater)
      ? 'Chỉ số không được nhỏ hơn kỳ trước'
      : undefined);

  if (!room) {
    return (
      <Screen>
        <Feedback type="error" message="Không tìm thấy phòng để nhập chỉ số" />
      </Screen>
    );
  }

  const submit = async () => {
    setSaving(true);
    setSavingError(null);
    try {
      await saveMeterReading({
        roomId: room.id,
        period,
        previousElectricity: Number(previousElectricity),
        electricity: Number(electricity),
        previousWater: waterMetered ? Number(previousWater) : 0,
        water: Number(water),
        waterMetered,
      });
      setSaved(true);
      router.push({
        pathname: '/invoice-preview',
        params: {
          roomId: room.id,
          previousElectricity,
          electricity,
          previousWater,
          water,
          waterMetered: String(waterMetered),
          period,
        },
      });
    } catch (requestError) {
      setSavingError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể lưu chỉ số.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Title subtitle={`Phòng ${room.name}`}>
        Chỉ số tháng {billingPeriodLabel(period)}
      </Title>
      <Notice
        title={remote ? 'ĐÃ KẾT NỐI BACKEND' : 'CHẾ ĐỘ MOCK'}
        message={
          remote
            ? 'Nhập cả chỉ số kỳ trước và kỳ này để xem mức tiêu thụ. Nếu chưa có dữ liệu cũ, hệ thống tự ghi kỳ trước làm baseline.'
            : 'Chỉ số chỉ được lưu trong bộ nhớ. Chỉ số mới phải lớn hơn hoặc bằng kỳ trước.'
        }
      />
      {savingError ? (
        <Notice title="Không thể lưu chỉ số" message={savingError} />
      ) : null}
      {saved ? <Success message="Đã lưu chỉ số điện nước" /> : null}
      <MeterReadingField
        title="Điện"
        previousValue={previousElectricity}
        value={electricity}
        unit="kWh"
        price={electricityPrice}
        onPreviousChange={setPreviousElectricity}
        onChange={setElectricity}
        previousError={previousElectricityError}
        error={electricityError}
      />
      {waterMetered ? (
        <MeterReadingField
          title="Nước"
          previousValue={previousWater}
          value={water}
          unit="m³"
          price={waterPrice}
          onPreviousChange={setPreviousWater}
          onChange={setWater}
          previousError={previousWaterError}
          error={waterError}
        />
      ) : (
        <Notice
          title="Nước tính theo người"
          message={`Phí nước hiện tại là ${new Intl.NumberFormat('vi-VN').format(waterPrice)} đ/người, không cần nhập chỉ số đồng hồ.`}
        />
      )}
      <Button
        label={saving ? 'Đang lưu chỉ số…' : 'Tính hóa đơn dự kiến'}
        disabled={
          saving ||
          !previousElectricity ||
          !electricity ||
          (waterMetered && (!previousWater || !water)) ||
          Boolean(
            previousElectricityError ||
              electricityError ||
              previousWaterError ||
              waterError,
          )
        }
        onPress={submit}
      />
    </Screen>
  );
}
