export type LoginRequestBody = {
  email: string;
  password: string;
};

export type RefreshRequestBody = {
  refreshToken: string;
};

export type LogoutRequestBody = {
  refreshToken: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
};

export type AuthResponse = AuthTokens & {
  user: AuthUser;
};
