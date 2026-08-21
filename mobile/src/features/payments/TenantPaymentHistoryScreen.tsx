import { MobileFrame } from '@/components/MobileFrame';
import { DatePicker } from '@/components/ui/DatePicker';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/i18n/I18nProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { getPaymentHistory, type PaymentHistory } from './api';

const monthText = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export function TenantPaymentHistoryScreen() {
  const { token } = useAuth();
  const { formatDate, formatVnd, t } = useI18n();
  const router = useRouter();
  const [month, setMonth] = useState(new Date());
  const [history, setHistory] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getPaymentHistory(token)
      .then((value) => active && setHistory(value))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : t('common.noData')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token, t]);

  const period = monthText(month);
  const entries = useMemo(
    () => history?.entries.filter((entry) => entry.billingPeriod === period) ?? [],
    [history, period],
  );
  const paid = entries.filter((entry) => entry.status === 'Paid').reduce((total, entry) => total + entry.amount, 0);
  const outstanding = entries.filter((entry) => entry.status === 'Sent').reduce((total, entry) => total + entry.amount, 0);

  return (
    <MobileFrame>
      <View style={{ flex: 1, backgroundColor: '#f5f8ff' }}>
        <ScreenHeader eyebrow={t('payment.eyebrow')} title={t('tenant.paymentHistory')} />
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 48 }}>
          <View style={{ padding: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' }}>
            <DatePicker label={t('payment.billingMonth')} value={month} onChange={setMonth} monthOnly />
          </View>

          {loading ? <ActivityIndicator color="#2563eb" /> : null}
          {error ? <Text style={{ color: '#b91c1c' }}>{error}</Text> : null}
          {!loading && !error ? <>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Metric label={t('payment.paid')} value={formatVnd(paid)} />
              <Metric label={t('payment.outstanding')} value={formatVnd(outstanding)} />
            </View>
            {entries.length === 0 ? (
              <View style={{ padding: 28, alignItems: 'center' }}>
                <Text style={{ color: '#64748b', textAlign: 'center' }}>{t('payment.noneForMonth', { month: period })}</Text>
              </View>
            ) : entries.map((entry) => (
              <TouchableOpacity
                key={entry.invoiceId}
                onPress={() => router.push({ pathname: '/(dashboard)/tenant/invoices/[id]', params: { id: entry.invoiceId } } as never)}
                style={{ padding: 16, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', fontSize: 16 }}>{t('payment.invoice', { period: entry.billingPeriod })}</Text>
                    <Text style={{ color: '#64748b', marginTop: 5 }}>
                      {entry.verifiedAt ? t('payment.verifiedOn', { date: formatDate(entry.verifiedAt) }) : t('payment.awaitingConfirmation')}
                    </Text>
                  </View>
                  <StatusBadge value={entry.status} />
                </View>
                <Text style={{ marginTop: 12, fontWeight: '800', color: '#2563eb' }}>{formatVnd(entry.amount)}</Text>
              </TouchableOpacity>
            ))}
          </> : null}
        </ScrollView>
      </View>
    </MobileFrame>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={{ minWidth: '47%', flex: 1, padding: 14, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' }}>
    <Text style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: '700' }}>{label}</Text>
    <Text style={{ color: '#0f172a', fontSize: 17, fontWeight: '900', marginTop: 6 }}>{value}</Text>
  </View>;
}
