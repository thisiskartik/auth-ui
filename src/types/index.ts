export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  authServerEndpoint: string;
}

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
}

export interface LoginResponse {
  code: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface ValidationError {
  error: string;
  fields: {
    [key: string]: string | string[];
  };
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  getUser: () => Promise<User | null>;
}

export interface RouteConfig {
  protected: string[];
  public: string[];
}
