import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { Button, Field, Notice, Screen, Success, Title } from '@/ui';
import { useLeases } from '../hooks/use-leases';

export function LeaseFormScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const { rooms } = useRooms();
  const { createLease } = useLeases();
  const room =
    rooms.find((item) => item.id === roomId) ??
    rooms.find((item) => item.status === 'Trống') ??
    rooms[0];
  const [tenantName, setTenantName] = useState('');
  const [phone, setPhone] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('01/08/2026');
  const [endDate, setEndDate] = useState('31/07/2027');
  const [rent, setRent] = useState(String(room?.rent ?? 0));
  const [deposit, setDeposit] = useState(String((room?.rent ?? 0) * 2));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const invalid =
    !room ||
    !tenantName ||
    !phone ||
    !identityNumber ||
    !email ||
    !startDate ||
    !endDate ||
    Number(rent) < 0 ||
    Number(deposit) < 0;

  const submit = async () => {
    if (!room) return;
    setSaving(true);
    setSavingError(null);
    try {
      const id = await createLease({
        roomId: room.id,
        tenantName,
        phone,
        identityNumber,
        email,
        startDate,
        endDate,
        rent: Number(rent),
        deposit: Number(deposit),
      });
      setSaved(true);
      router.replace({
        pathname: '/lease-detail',
        params: { leaseId: id },
      });
    } catch (requestError) {
      setSavingError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể tạo hợp đồng.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Title subtitle={room ? `Phòng ${room.name}` : 'Chọn phòng còn trống'}>Tạo hợp đồng</Title>
      <Notice
        title="HỢP ĐỒNG"
        message="Khi dùng backend, người thuê được tạo hoặc cấp tài khoản trong cùng giao dịch."
      />
      {saved ? <Success message="Đã tạo hợp đồng" /> : null}
      {savingError ? (
        <Notice title="Không thể tạo hợp đồng" message={savingError} />
      ) : null}
      <Field label="Họ tên người thuê *" value={tenantName} onChangeText={setTenantName} />
      <Field label="Số điện thoại *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="CCCD *" value={identityNumber} onChangeText={setIdentityNumber} keyboardType="numeric" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Ngày bắt đầu *" value={startDate} onChangeText={setStartDate} hint="dd/MM/yyyy" />
      <Field label="Ngày kết thúc *" value={endDate} onChangeText={setEndDate} hint="dd/MM/yyyy" />
      <Field
        label="Tiền thuê *"
        value={rent}
        onChangeText={setRent}
        keyboardType="numeric"
        error={Number(rent) < 0 ? 'Số tiền không được âm' : undefined}
      />
      <Field
        label="Tiền cọc *"
        value={deposit}
        onChangeText={setDeposit}
        keyboardType="numeric"
        error={Number(deposit) < 0 ? 'Số tiền không được âm' : undefined}
      />
      <Button
        label={saving ? 'Đang tạo hợp đồng…' : 'Tạo hợp đồng'}
        disabled={invalid || saving}
        onPress={submit}
      />
    </Screen>
  );
}
