import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApiSession } from '@/core/api';
import { useLeases } from '@/features/leases/hooks/use-leases';
import {
  Button,
  Card,
  Field,
  Notice,
  Screen,
  SegmentedControl,
  Success,
  Title,
  colors,
  radius,
  spacing,
} from '@/ui';
import { SectionLabel } from '@/ui/patterns';

import { useMaintenanceRequests } from '../hooks/use-maintenance';
import { maintenanceMediaPicker } from '../media/maintenance-media-picker';
import {
  MaintenanceAttachment,
  MaintenancePriority,
} from '../models/maintenance';

const priorityOptions = [
  { value: 'Thấp', label: 'Thấp' },
  { value: 'Trung bình', label: 'Vừa' },
  { value: 'Cao', label: 'Cao' },
  { value: 'Khẩn cấp', label: 'Khẩn' },
] as const;

export function CreateMaintenanceRequestScreen() {
  const { enabled } = useApiSession();
  const { leases } = useLeases();
  const { createRequest } = useMaintenanceRequests();
  const activeLeases = useMemo(
    () => leases.filter((lease) => lease.status !== 'Đã kết thúc'),
    [leases],
  );
  const [roomId, setRoomId] = useState(activeLeases[0]?.roomId ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<MaintenancePriority>('Trung bình');
  const [photos, setPhotos] = useState<MaintenanceAttachment[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const selectedLease = activeLeases.find((lease) => lease.roomId === roomId);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(
      () => router.replace('/(tabs)/settings'),
      650,
    );
    return () => clearTimeout(timer);
  }, [submitted]);

  const titleError =
    title.length > 0 && title.trim().length < 3
      ? 'Tiêu đề cần ít nhất 3 ký tự'
      : undefined;
  const descriptionError =
    description.length > 0 && description.trim().length < 10
      ? 'Mô tả cần ít nhất 10 ký tự'
      : undefined;
  const valid =
    Boolean(roomId) &&
    title.trim().length >= 3 &&
    description.trim().length >= 10;

  const submit = async () => {
    if (!valid || submitting || !enabled) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createRequest({
        roomId,
        title,
        description,
        priority,
        photos,
      });
      setSubmitted(true);
    } catch (requestError) {
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể gửi yêu cầu bảo trì.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectMedia = async (source: 'library' | 'camera') => {
    if (photos.length >= 3) return;
    setMediaError(null);
    const result =
      source === 'library'
        ? await maintenanceMediaPicker.pickFromLibrary(3 - photos.length)
        : await maintenanceMediaPicker.takePhoto(3 - photos.length);
    if (result.status === 'selected') {
      setPhotos((current) =>
        [...current, ...result.attachments].slice(0, 3),
      );
    } else if (result.status === 'unavailable') {
      setMediaError(result.message);
    }
  };

  if (submitted) {
    return (
      <Screen>
        <Title>Yêu cầu đã được gửi</Title>
        <Success message="Chủ nhà sẽ nhận được yêu cầu và cập nhật tiến độ xử lý." />
        <Text style={styles.returning}>Đang trở về danh sách bảo trì…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle="Mô tả rõ vấn đề để chủ nhà sắp xếp xử lý nhanh hơn.">
        Tạo yêu cầu bảo trì
      </Title>
      {!enabled ? (
        <Notice
          title="CẦN KẾT NỐI BACKEND"
          message="Không tạo dữ liệu giả. Hãy cấu hình API để gửi yêu cầu thật."
        />
      ) : null}
      {submitError ? (
        <Notice title="Không thể gửi yêu cầu" message={submitError} />
      ) : null}
      {activeLeases.length === 0 ? (
        <Notice
          title="CHƯA CÓ PHÒNG ĐANG THUÊ"
          message="Bạn cần có hợp đồng đang hoạt động trước khi gửi bảo trì."
        />
      ) : activeLeases.length === 1 ? (
        <Field
          label="Phòng đang thuê"
          value={`Phòng ${selectedLease?.roomName ?? '—'} · ${selectedLease?.propertyName ?? 'Bất động sản'}`}
          editable={false}
          hint="Đã tự động chọn vì bạn chỉ có một phòng đang thuê."
        />
      ) : (
        <>
          <SectionLabel>Phòng đang thuê</SectionLabel>
          <SegmentedControl
            value={roomId}
            onChange={setRoomId}
            options={activeLeases.map((lease) => ({
              value: lease.roomId,
              label: lease.roomName ?? 'Phòng',
            }))}
          />
        </>
      )}
      <Field
        label="Tiêu đề *"
        value={title}
        onChangeText={setTitle}
        placeholder="Ví dụ: Máy lạnh không mát"
        error={titleError}
        maxLength={100}
      />
      <Field
        label="Mô tả chi tiết *"
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả vị trí, biểu hiện và thời điểm xảy ra…"
        error={descriptionError}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        maxLength={1000}
        style={styles.description}
      />
      <SectionLabel>Mức độ ưu tiên</SectionLabel>
      <SegmentedControl
        value={priority}
        onChange={setPriority}
        options={priorityOptions}
      />
      <SectionLabel>Ảnh đính kèm</SectionLabel>
      <Card>
        <View style={styles.photoHeader}>
          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>Tối đa 3 ảnh</Text>
            <Text style={styles.photoHint}>
              Chọn ảnh hoặc chụp trực tiếp để mô tả rõ hơn.
            </Text>
          </View>
          <Text style={styles.photoCount}>{photos.length}/3</Text>
        </View>
        {mediaError ? (
          <Notice title="CHƯA THỂ MỞ ẢNH" message={mediaError} />
        ) : null}
        <View style={styles.photoActions}>
          <View style={styles.photoAction}>
            <Button
              label="Chọn ảnh"
              variant="secondary"
              disabled={photos.length >= 3}
              onPress={() => void selectMedia('library')}
            />
          </View>
          <View style={styles.photoAction}>
            <Button
              label="Chụp ảnh"
              variant="secondary"
              disabled={photos.length >= 3}
              onPress={() => void selectMedia('camera')}
            />
          </View>
        </View>
        {photos.length ? (
          <View style={styles.previews}>
            {photos.map((photo) => (
              <View key={photo.uri} style={styles.preview}>
                <Image
                  source={{ uri: photo.uri }}
                  contentFit="cover"
                  style={styles.previewImage}
                  accessibilityLabel={photo.name}
                />
                <Pressable
                  accessibilityLabel={`Xóa ${photo.name}`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() =>
                    setPhotos((current) =>
                      current.filter((item) => item.uri !== photo.uri),
                    )
                  }
                  style={styles.removePhoto}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
      <Button
        label={submitting ? 'Đang gửi yêu cầu…' : 'Gửi yêu cầu'}
        disabled={!enabled || !valid || submitting}
        onPress={() => void submit()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: { minHeight: 120, paddingTop: spacing.md },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  photoCopy: { flex: 1, gap: spacing.xs },
  photoTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  photoHint: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  photoCount: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  photoActions: { flexDirection: 'row', gap: spacing.sm },
  photoAction: { flex: 1 },
  previews: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preview: { position: 'relative' },
  previewImage: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  removePhotoText: { color: colors.surface, fontSize: 20, lineHeight: 22 },
  returning: { color: colors.textSecondary, textAlign: 'center' },
});
