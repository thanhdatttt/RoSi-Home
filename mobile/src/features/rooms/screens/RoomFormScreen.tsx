import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useProperties } from '@/features/properties/hooks/use-properties';
import { Button, Feedback, Field, Notice, Screen, Title } from '@/ui';
import { useRooms } from '../hooks/use-rooms';

export function RoomFormScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { properties } = useProperties();
  const { createRoom } = useRooms();
  const [name, setName] = useState('');
  const [rent, setRent] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const amount = Number(rent.replace(/\D/g, ''));
  const selectedPropertyId = propertyId ?? properties[0]?.id;

  if (!selectedPropertyId) {
    return (
      <Screen>
        <Feedback
          type="error"
          message="Hãy tạo bất động sản trước khi thêm phòng."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>Thêm phòng</Title>
      {savingError ? (
        <Notice title="Không thể lưu phòng" message={savingError} />
      ) : null}
      <Field label="Tên / số phòng *" value={name} onChangeText={setName} />
      <Field label="Giá thuê *" value={rent} onChangeText={setRent} keyboardType="numeric" error={rent && amount < 0 ? 'Số tiền không được âm' : undefined} />
      <Button
        label="Lưu phòng"
        disabled={!name || !rent || saving}
        onPress={async () => {
          setSaving(true);
          setSavingError(null);
          try {
            await createRoom({
              propertyId: selectedPropertyId,
              name,
              rent: amount,
            });
            router.back();
          } catch (requestError) {
            setSavingError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể lưu phòng.',
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}
