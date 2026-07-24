import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useProperties } from '@/features/properties/hooks/use-properties';
import { Button, Feedback, Field, Notice, Screen, Title } from '@/ui';
import { useRooms } from '../hooks/use-rooms';

export function BulkRoomFormScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { properties } = useProperties();
  const { createRooms } = useRooms();
  const [prefix, setPrefix] = useState('P');
  const [start, setStart] = useState('101');
  const [count, setCount] = useState('6');
  const [rent, setRent] = useState('3500000');
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const selectedPropertyId = propertyId ?? properties[0]?.id;

  if (!selectedPropertyId) {
    return (
      <Screen>
        <Feedback
          type="error"
          message="Hãy tạo bất động sản trước khi tạo phòng."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle="Tối đa 50 phòng trong một lần.">Tạo nhiều phòng</Title>
      {savingError ? (
        <Notice title="Không thể tạo phòng" message={savingError} />
      ) : null}
      <Field label="Tiền tố" value={prefix} onChangeText={setPrefix} />
      <Field label="Số bắt đầu" value={start} onChangeText={setStart} keyboardType="numeric" />
      <Field label="Số lượng" value={count} onChangeText={setCount} keyboardType="numeric" />
      <Field label="Giá thuê chung" value={rent} onChangeText={setRent} keyboardType="numeric" />
      <Button
        label={`Tạo ${count || 0} phòng`}
        disabled={saving || Number(count) < 1 || Number(count) > 50}
        onPress={async () => {
          setSaving(true);
          setSavingError(null);
          try {
            await createRooms(
              selectedPropertyId,
              prefix,
              Number(start),
              Math.min(Number(count), 50),
              Number(rent),
            );
            router.back();
          } catch (requestError) {
            setSavingError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể tạo các phòng.',
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}
