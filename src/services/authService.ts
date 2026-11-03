import { apiClient } from "../api/client";
import { LoginCredentials, LoginResponseDTO, CurrentUserResponseDTO, User } from "../types/auth";
import { adaptUserFromApi } from "../adapters/authAdapter";
import { saveAuthTokens, saveUserData, clearAuthStorage } from "../utils/storage";

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<LoginResponseDTO>(
      "/auth/login/",
      credentials
    );
    const { access, user: userDto } = response.data;
    const user = adaptUserFromApi(userDto);

    await saveAuthTokens(access);
    await saveUserData(user);

    return { user, access };
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<CurrentUserResponseDTO>("/auth/me/");
    const user = adaptUserFromApi(response.data.user);
    await saveUserData(user);
    return user;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout/");
    } catch {
      // La sesión local se cierra aunque no haya conexión con el servidor.
    } finally {
      await clearAuthStorage();
    }
  },
};
