import { useState } from 'react';

import { Button, Field, Screen, Success, Title } from '@/ui';
import { useSettingsData } from '../hooks/use-settings';

export function SurchargeFormScreen() {
  const { createSurcharge } = useSettingsData();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);
  return (
    <Screen>
      <Title subtitle="Áp dụng định kỳ theo bất động sản.">Thêm phụ phí</Title>
      {done ? <Success message="Đã lưu phụ phí" /> : null}
      <Field label="Tên phụ phí *" value={name} onChangeText={setName} />
      <Field
        label="Số tiền *"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        error={Number(amount) < 0 ? 'Số tiền không được âm' : undefined}
      />
      <Field label="Ngày bắt đầu" value="01/08/2026" editable={false} />
      <Button
        label="Lưu phụ phí"
        disabled={!name || !amount || Number(amount) < 0}
        onPress={() => {
          createSurcharge({ propertyId: 'p1', name, amount: Number(amount) });
          setDone(true);
        }}
      />
    </Screen>
  );
}
