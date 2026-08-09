import * as ImagePicker from 'expo-image-picker';

import { MaintenanceAttachment } from '../models/maintenance';

export type MaintenanceMediaResult =
  | { status: 'selected'; attachments: MaintenanceAttachment[] }
  | { status: 'cancelled' }
  | { status: 'unavailable'; message: string };

export interface MaintenanceMediaPicker {
  pickFromLibrary(remainingSlots: number): Promise<MaintenanceMediaResult>;
  takePhoto(remainingSlots: number): Promise<MaintenanceMediaResult>;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/png']);

function toAttachment(
  asset: ImagePicker.ImagePickerAsset,
  index: number,
): MaintenanceAttachment | null {
  const extension = asset.fileName?.split('.').pop()?.toLowerCase();
  const mimeType =
    asset.mimeType?.toLowerCase() ??
    (extension === 'png'
      ? 'image/png'
      : extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : undefined);
  if (!mimeType || !allowedMimeTypes.has(mimeType)) return null;
  if (asset.fileSize !== undefined && asset.fileSize > MAX_PHOTO_BYTES) {
    return null;
  }

  const fallbackExtension = mimeType === 'image/png' ? 'png' : 'jpg';
  const name =
    asset.fileName ?? `maintenance-${Date.now()}-${index}.${fallbackExtension}`;
  const normalizedExtension = name.split('.').pop()?.toLowerCase();
  if (
    (mimeType === 'image/png' && normalizedExtension !== 'png') ||
    (mimeType === 'image/jpeg' &&
      normalizedExtension !== 'jpg' &&
      normalizedExtension !== 'jpeg')
  ) {
    return null;
  }
  return { uri: asset.uri, name, mimeType };
}

function selected(
  result: ImagePicker.ImagePickerResult,
): MaintenanceMediaResult {
  if (result.canceled) return { status: 'cancelled' };
  const attachments = result.assets
    .map(toAttachment)
    .filter((item): item is MaintenanceAttachment => item !== null);
  if (attachments.length !== result.assets.length) {
    return {
      status: 'unavailable',
      message: 'Chỉ chấp nhận ảnh PNG/JPG/JPEG, tối đa 5 MB mỗi ảnh.',
    };
  }
  return { status: 'selected', attachments };
}

export const maintenanceMediaPicker: MaintenanceMediaPicker = {
  pickFromLibrary: async (remainingSlots) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return {
          status: 'unavailable',
          message: 'Bạn cần cho phép truy cập thư viện ảnh để đính kèm ảnh.',
        };
      }
      return selected(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: remainingSlots > 1,
          selectionLimit: remainingSlots,
          quality: 1,
        }),
      );
    } catch {
      return {
        status: 'unavailable',
        message: 'Không thể mở thư viện ảnh. Vui lòng thử lại.',
      };
    }
  },
  takePhoto: async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return {
          status: 'unavailable',
          message: 'Bạn cần cho phép sử dụng camera để chụp ảnh.',
        };
      }
      return selected(
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 1,
        }),
      );
    } catch {
      return {
        status: 'unavailable',
        message: 'Không thể mở camera. Vui lòng thử lại.',
      };
    }
  },
};
