import * as ImagePicker from "expo-image-picker";
import type { PaymentProofFile } from "./api";

const MAX_BYTES = 5 * 1024 * 1024;

export type PaymentProofPickResult =
  | { status: "selected"; file: PaymentProofFile }
  | { status: "cancelled" }
  | { status: "error"; message: string };

export async function pickPaymentProof(): Promise<PaymentProofPickResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: "error", message: "Photo library permission is required to choose a payment proof." };
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: false,
    quality: 1,
  });
  if (result.canceled) return { status: "cancelled" };

  const asset = result.assets[0];
  const extension = asset.fileName?.split(".").pop()?.toLowerCase();
  const mimeType =
    asset.mimeType === "image/png" || extension === "png"
      ? "image/png"
      : asset.mimeType === "image/jpeg" || extension === "jpg" || extension === "jpeg"
        ? "image/jpeg"
        : null;
  if (!mimeType) return { status: "error", message: "Only PNG, JPG, and JPEG images are supported." };
  if (asset.fileSize !== undefined && asset.fileSize > MAX_BYTES) {
    return { status: "error", message: "The payment proof must be 5 MB or smaller." };
  }
  return {
    status: "selected",
    file: {
      uri: asset.uri,
      name: asset.fileName ?? `payment-proof-${Date.now()}.${mimeType === "image/png" ? "png" : "jpg"}`,
      mimeType,
      fileSize: asset.fileSize,
    },
  };
}
