import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "rosihome.authToken";

export async function saveToken(token: string): Promise<void> {
  const key = TOKEN_KEY;
  await SecureStore.setItemAsync(key, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
