import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text } from 'react-native';

import { vnd } from '@/core/formatters';
import {
  Button,
  Card,
  EmptyState,
  Feedback,
  KeyValueRow,
  Notice,
  Screen,
  Title,
  colors,
  radius,
} from '@/ui';

import { usePendingProofs } from '../hooks/use-payments';

export function PaymentProofsScreen() {
  const { proofs, loading, error, refresh, confirm } = usePendingProofs();
  if (loading) return <Screen><Feedback type="loading" /></Screen>;
  if (error) {
    return (
      <Screen>
        <Feedback type="error" message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }
  return (
    <Screen>
      <Title subtitle="Đối chiếu với tài khoản ngân hàng trước khi xác nhận.">
        Chứng từ chờ duyệt
      </Title>
      <Notice
        title="XÁC NHẬN THỦ CÔNG"
        message="RosiHome không tự kiểm tra giao dịch ngân hàng. Chủ nhà chịu trách nhiệm đối chiếu chứng từ."
      />
      {proofs.length === 0 ? (
        <EmptyState
          title="Không có chứng từ chờ duyệt"
          description="Chứng từ mới nhất của người thuê sẽ xuất hiện ở đây."
        />
      ) : (
        proofs.map((proof) => (
          <Card key={proof.id}>
            <Text style={styles.title}>
              {proof.property.name} · Phòng {proof.room.name}
            </Text>
            <Image
              accessibilityLabel="Chứng từ thanh toán do người thuê tải lên"
              contentFit="contain"
              source={proof.fileUrl}
              style={styles.image}
            />
            <KeyValueRow label="Kỳ hóa đơn" value={proof.invoice.billingPeriod} />
            <KeyValueRow
              label="Số tiền cần đối chiếu"
              value={vnd(proof.invoice.totalAmount)}
            />
            <KeyValueRow label="Tải lên lúc" value={proof.uploadedAt} />
            <Button
              label="Mở chi tiết hóa đơn"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/invoice-detail',
                  params: { invoiceId: proof.invoiceId },
                })
              }
            />
            <Button
              label="Tôi đã đối chiếu · Xác nhận đã nhận tiền"
              onPress={() =>
                Alert.alert(
                  'Xác nhận đã nhận tiền?',
                  'Thao tác này sẽ đánh dấu hóa đơn đã thanh toán. Đây là xác nhận thủ công, không phải xác minh từ ngân hàng.',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    {
                      text: 'Xác nhận',
                      onPress: () => void confirm(proof.invoiceId),
                    },
                  ],
                )
              }
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  image: {
    width: '100%',
    height: 280,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
});
