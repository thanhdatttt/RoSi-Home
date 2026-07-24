export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  refreshAccessToken(): Promise<string | null>;
  handleUnauthorized(): Promise<void>;
}

export const emptyTokenProvider: TokenProvider = {
  getAccessToken: async () => null,
  getRefreshToken: async () => null,
  refreshAccessToken: async () => null,
  handleUnauthorized: async () => undefined,
};
