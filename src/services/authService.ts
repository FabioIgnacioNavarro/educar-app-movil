import { apiClient } from "../api/client";
import { LoginCredentials, LoginResponseDTO } from "../types/auth";
import { adaptUserFromLoginResponse } from "../adapters/authAdapter";
import {
  saveAuthTokens,
  saveUserData,
  clearAuthStorage,
  getRefreshToken,
} from "../utils/storage";

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<LoginResponseDTO>(
      "/auth/login/",
      credentials
    );
    const { access, refresh } = response.data;
    const user = adaptUserFromLoginResponse(response.data);

    await saveAuthTokens(access, refresh);
    await saveUserData(user);

    return { user, tokens: { access, refresh } };
  },

  async logout() {
    try {
      const refresh = await getRefreshToken();
      if (refresh) {
        await apiClient.post("/auth/logout/", { refresh });
      }
    } catch {
      // Ignorar fallo de red en logout para garantizar la salida local
    } finally {
      await clearAuthStorage();
    }
  },

  async requestPasswordReset(email: string) {
    const response = await apiClient.post("/auth/password-reset/", { email });
    return response.data;
  },
};
