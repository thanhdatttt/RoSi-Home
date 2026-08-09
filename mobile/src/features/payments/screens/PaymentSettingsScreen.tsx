import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { ApiError } from '@/core/api';
import { useProperties } from '@/features/properties/hooks/use-properties';
import {
  Button,
  Card,
  Field,
  Feedback,
  Notice,
  Screen,
  SegmentedControl,
  Success,
  Title,
} from '@/ui';

import { usePaymentsRepository } from '../api/payments.repository';

const bankCodes = 'VCB, TCB, MB, VPB, ACB, STB, BIDV, CTG, VIB, TPB, HDB';

export function PaymentSettingsScreen() {
  const { propertyId: routePropertyId } = useLocalSearchParams<{
    propertyId?: string;
  }>();
  const { properties, loading: propertiesLoading } = useProperties();
  const [propertyId, setPropertyId] = useState(routePropertyId ?? '');
  const {
    getPaymentConfig,
    savePaymentConfig,
    getReminderConfig,
    saveReminderConfig,
  } = usePaymentsRepository();
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [frequency, setFrequency] = useState<'1' | '3' | '7'>('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!propertyId && properties[0]?.id) setPropertyId(properties[0].id);
  }, [properties, propertyId]);

  useEffect(() => {
    if (propertiesLoading) return;
    let active = true;
    setLoading(true);
    void Promise.all([
      getPaymentConfig().catch((requestError: unknown) => {
        if (requestError instanceof ApiError && requestError.kind === 'not-found') {
          return null;
        }
        throw requestError;
      }),
      propertyId ? getReminderConfig(propertyId) : Promise.resolve(null),
    ])
      .then(([config, reminder]) => {
        if (!active) return;
        if (config) {
          setBankCode(config.bankCode);
          setAccountNumber(config.accountNumber);
          setAccountHolderName(config.accountHolderName);
        }
        const currentFrequency = reminder?.overdueReminderEveryDays ?? 1;
        setFrequency(
          currentFrequency === 3 ? '3' : currentFrequency === 7 ? '7' : '1',
        );
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Không thể tải cấu hình thanh toán.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [getPaymentConfig, getReminderConfig, propertiesLoading, propertyId]);

  if (loading || propertiesLoading) {
    return <Screen><Feedback type="loading" /></Screen>;
  }

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await savePaymentConfig({
        bankCode,
        accountNumber,
        accountHolderName,
      });
      if (propertyId) {
        await saveReminderConfig(propertyId, Number(frequency));
      }
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể lưu cấu hình.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Title subtitle="Chỉ chủ tài khoản chủ nhà có thể xem và thay đổi.">
        Cấu hình thanh toán
      </Title>
      {error ? <Notice title="Không thể tải hoặc lưu cấu hình" message={error} /> : null}
      {saved ? <Success message="Đã lưu cấu hình thanh toán và lịch nhắc" /> : null}
      <Card>
        <Field
          autoCapitalize="characters"
          label="Mã ngân hàng"
          value={bankCode}
          onChangeText={setBankCode}
          hint={`Hỗ trợ: ${bankCodes}`}
        />
        <Field
          autoCapitalize="characters"
          label="Số tài khoản"
          value={accountNumber}
          onChangeText={setAccountNumber}
          hint="5–19 chữ cái hoặc chữ số"
        />
        <Field
          autoCapitalize="characters"
          label="Tên chủ tài khoản"
          value={accountHolderName}
          onChangeText={setAccountHolderName}
        />
      </Card>
      <Card>
        {properties.length > 1 ? (
          <SegmentedControl
            value={propertyId}
            onChange={setPropertyId}
            options={properties.map((property) => ({
              value: property.id,
              label: property.name,
            }))}
          />
        ) : null}
        <Notice
          title="NHẮC HÓA ĐƠN QUÁ HẠN"
          message="Áp dụng cho bất động sản đang chọn; mặc định gửi mỗi ngày khi hóa đơn vẫn quá hạn."
        />
        <SegmentedControl
          value={frequency}
          onChange={setFrequency}
          options={[
            { value: '1', label: 'Mỗi ngày' },
            { value: '3', label: 'Mỗi 3 ngày' },
            { value: '7', label: 'Mỗi 7 ngày' },
          ]}
        />
      </Card>
      <Button
        disabled={
          saving ||
          !bankCode.trim() ||
          !accountNumber.trim() ||
          !accountHolderName.trim()
        }
        label={saving ? 'Đang lưu…' : 'Lưu cấu hình'}
        onPress={() => void save()}
      />
    </Screen>
  );
}
