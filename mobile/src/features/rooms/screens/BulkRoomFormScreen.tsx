import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, Screen, Title } from '@/ui';
import { useRooms } from '../hooks/use-rooms';

export function BulkRoomFormScreen() {
  const { createRooms } = useRooms();
  const [prefix, setPrefix] = useState('P');
  const [start, setStart] = useState('101');
  const [count, setCount] = useState('6');
  const [rent, setRent] = useState('3500000');
  return (
    <Screen>
      <Title subtitle="Tối đa 50 phòng trong một lần.">Tạo nhiều phòng</Title>
      <Field label="Tiền tố" value={prefix} onChangeText={setPrefix} />
      <Field label="Số bắt đầu" value={start} onChangeText={setStart} keyboardType="numeric" />
      <Field label="Số lượng" value={count} onChangeText={setCount} keyboardType="numeric" />
      <Field label="Giá thuê chung" value={rent} onChangeText={setRent} keyboardType="numeric" />
      <Button
        label={`Tạo ${count || 0} phòng`}
        onPress={() => {
          createRooms('p1', prefix, Number(start), Math.min(Number(count), 50), Number(rent));
          router.back();
        }}
      />
    </Screen>
  );
}
