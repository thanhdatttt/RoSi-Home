import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { Button, Feedback, Notice, Screen, Success, Title } from '@/ui';

import { MeterReadingField } from '../components/MeterReadingField';
import { useMeterReadings } from '../hooks/use-billing';

const ELECTRICITY_PRICE = 3500;
const WATER_PRICE = 18000;

export function MeterReadingScreen() {
  const { roomId = 'r2' } = useLocalSearchParams<{ roomId?: string }>();
  const { rooms } = useRooms();
  const { saveMeterReading } = useMeterReadings();
  const room = rooms.find((item) => item.id === roomId);
  const [electricity, setElectricity] = useState('1368');
  const [water, setWater] = useState('351');
  const [saved, setSaved] = useState(false);
  const previousElectricity = 1250;
  const previousWater = 342;
  const electricityError =
    Number(electricity) < previousElectricity ? 'Chỉ số không được nhỏ hơn kỳ trước' : undefined;
  const waterError =
    Number(water) < previousWater ? 'Chỉ số không được nhỏ hơn kỳ trước' : undefined;

  if (!room) {
    return (
      <Screen>
        <Feedback type="error" message="Không tìm thấy phòng để nhập chỉ số" />
      </Screen>
    );
  }

  const submit = () => {
    saveMeterReading({
      roomId: room.id,
      period: '07/2026',
      previousElectricity,
      electricity: Number(electricity),
      previousWater,
      water: Number(water),
    });
    setSaved(true);
    router.push({
      pathname: '/invoice-preview',
      params: { roomId: room.id, electricity, water },
    });
  };

  return (
    <Screen>
      <Title subtitle={`Phòng ${room.name}`}>Chỉ số tháng 07/2026</Title>
      <Notice
        title="CONCEPT · CHƯA TÍCH HỢP BACKEND"
        message="Chỉ số chỉ được lưu trong bộ nhớ. Chỉ số mới phải lớn hơn hoặc bằng kỳ trước."
      />
      {saved ? <Success message="Đã lưu chỉ số điện nước" /> : null}
      <MeterReadingField
        title="Điện"
        previous={previousElectricity}
        value={electricity}
        unit="kWh"
        price={ELECTRICITY_PRICE}
        onChange={setElectricity}
        error={electricityError}
      />
      <MeterReadingField
        title="Nước"
        previous={previousWater}
        value={water}
        unit="m³"
        price={WATER_PRICE}
        onChange={setWater}
        error={waterError}
      />
      <Button
        label="Tính hóa đơn dự kiến"
        disabled={!electricity || !water || Boolean(electricityError || waterError)}
        onPress={submit}
      />
    </Screen>
  );
}
