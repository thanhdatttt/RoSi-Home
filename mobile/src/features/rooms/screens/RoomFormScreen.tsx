import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, Screen, Title } from '@/ui';
import { useRooms } from '../hooks/use-rooms';

export function RoomFormScreen() {
  const { createRoom } = useRooms();
  const [name, setName] = useState('');
  const [rent, setRent] = useState('');
  const [area, setArea] = useState('20');
  const amount = Number(rent.replace(/\D/g, ''));
  return (
    <Screen>
      <Title>Thêm phòng</Title>
      <Field label="Tên / số phòng *" value={name} onChangeText={setName} />
      <Field label="Giá thuê *" value={rent} onChangeText={setRent} keyboardType="numeric" error={rent && amount < 0 ? 'Số tiền không được âm' : undefined} />
      <Field label="Diện tích" value={area} onChangeText={setArea} keyboardType="numeric" />
      <Button
        label="Lưu phòng"
        disabled={!name || !rent}
        onPress={() => {
          createRoom({ propertyId: 'p1', name, rent: amount, area: Number(area) || 20 });
          router.back();
        }}
      />
    </Screen>
  );
}
