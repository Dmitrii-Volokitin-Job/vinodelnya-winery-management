export interface User {
  username: string;
  role: "ADMIN" | "USER";
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  role: string;
}
