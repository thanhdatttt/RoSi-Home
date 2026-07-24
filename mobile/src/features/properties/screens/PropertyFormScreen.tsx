import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button, Field, Notice, Screen, Success, Title } from '@/ui';
import { useProperties } from '../hooks/use-properties';

export function PropertyFormScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { properties, createProperty, updateProperty } = useProperties();
  const existingProperty = properties.find((item) => item.id === propertyId);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const editing = Boolean(existingProperty);

  useEffect(() => {
    if (!existingProperty) return;
    setName(existingProperty.name);
    setAddress(existingProperty.address);
  }, [existingProperty]);

  return (
    <Screen>
      <Title subtitle="Thông tin dùng để phân nhóm phòng và chi phí.">
        {editing ? 'Sửa bất động sản' : 'Thêm bất động sản'}
      </Title>
      {done ? <Success message="Đã lưu bất động sản" /> : null}
      {savingError ? (
        <Notice title="Không thể lưu bất động sản" message={savingError} />
      ) : null}
      <Field
        label="Tên bất động sản *"
        value={name}
        onChangeText={setName}
        error={!name ? 'Không được để trống' : undefined}
      />
      <Field label="Địa chỉ *" value={address} onChangeText={setAddress} />
      <Button
        label={editing ? 'Lưu thay đổi' : 'Lưu và thêm phòng'}
        disabled={!name || !address || saving}
        onPress={async () => {
          setSaving(true);
          setSavingError(null);
          try {
            const property =
              editing && existingProperty
                ? await updateProperty({
                    id: existingProperty.id,
                    name,
                    address,
                  })
                : await createProperty({ name, address });
            setDone(true);
            if (editing) {
              router.back();
            } else {
              router.replace({
                pathname: '/room-form',
                params: { propertyId: property.id },
              });
            }
          } catch (requestError) {
            setSavingError(
              requestError instanceof Error
                ? requestError.message
                : 'Không thể lưu bất động sản.',
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}
