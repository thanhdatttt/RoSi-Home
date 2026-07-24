import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useProperties } from '@/features/properties/hooks/use-properties';
import { Button, Feedback, Field, Notice, Screen, Success, Title } from '@/ui';
import { useSettingsData } from '../hooks/use-settings';

export function SurchargeFormScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { properties } = useProperties();
  const { createSurcharge } = useSettingsData();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const effectiveFrom = new Date().toISOString().slice(0, 10);
  const selectedPropertyId = propertyId ?? properties[0]?.id;

  if (!selectedPropertyId) {
    return (
      <Screen>
        <Feedback
          type="error"
          message="Hãy tạo bất động sản trước khi thêm phụ phí."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle="Áp dụng định kỳ theo bất động sản.">Thêm phụ phí</Title>
      {done ? <Success message="Đã lưu phụ phí" /> : null}
      {savingError ? (
        <Notice title="Không thể lưu phụ phí" message={savingError} />
      ) : null}
      <Field label="Tên phụ phí *" value={name} onChangeText={setName} />
      <Field
        label="Số tiền *"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        error={Number(amount) < 0 ? 'Số tiền không được âm' : undefined}
      />
      <Field label="Ngày bắt đầu" value={effectiveFrom} editable={false} />
      <Button
        label="Lưu phụ phí"
        disabled={!name || !amount || Number(amount) < 0 || saving}
        onPress={async () => {
          setSaving(true);
          setSavingError(null);
          try {
            await createSurcharge({
              propertyId: selectedPropertyId,
              name,
              amount: Number(amount),
            });
            setDone(true);
          } catch (requestError) {
            setSavingError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể lưu phụ phí.',
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}
