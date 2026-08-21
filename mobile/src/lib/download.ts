import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { API_BASE, apiRequestRaw } from "./api";

export async function downloadAuthenticatedPdf(path: string, token: string | null, filename: string) {
  if (Platform.OS === "web") {
    const response = await apiRequestRaw(path, { token });
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
    return;
  }
  if (!token || !FileSystem.cacheDirectory) throw new Error("A signed-in session is required to download this PDF.");
  const destination = `${FileSystem.cacheDirectory}${filename}`;
  const result = await FileSystem.downloadAsync(
    `${API_BASE}/api/v1${path}`,
    destination,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (result.status !== 200) throw new Error("The report PDF could not be downloaded.");
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device.");
  await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: "Open or share report" });
}
