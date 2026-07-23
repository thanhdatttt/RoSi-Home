import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, Screen, Success, Title } from '@/ui';
import { useProperties } from '../hooks/use-properties';

export function PropertyFormScreen() {
  const { createProperty } = useProperties();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [done, setDone] = useState(false);

  return (
    <Screen>
      <Title subtitle="Thông tin dùng để phân nhóm phòng và chi phí.">Thêm bất động sản</Title>
      {done ? <Success message="Đã lưu bất động sản" /> : null}
      <Field
        label="Tên bất động sản *"
        value={name}
        onChangeText={setName}
        error={!name ? 'Không được để trống' : undefined}
      />
      <Field label="Địa chỉ *" value={address} onChangeText={setAddress} />
      <Button
        label="Lưu và thêm phòng"
        disabled={!name || !address}
        onPress={() => {
          createProperty({ name, address });
          setDone(true);
          setTimeout(() => router.replace('/room-form'), 400);
        }}
      />
    </Screen>
  );
}
