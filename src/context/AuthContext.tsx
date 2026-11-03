import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, LoginCredentials } from "../types/auth";
import { authService } from "../services/authService";
import { getAccessToken, clearAuthStorage } from "../utils/storage";

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await getAccessToken();
        if (storedToken) {
          const currentUser = await authService.getCurrentUser();
          setToken(storedToken);
          setUser(currentUser);
        }
      } catch (error) {
        console.warn("No se pudo restaurar la sesión:", error);
        await clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    }
    void restoreSession();
  }, []);

  async function login(credentials: LoginCredentials) {
    const { user: loggedUser, access } = await authService.login(credentials);
    setUser(loggedUser);
    setToken(access);
  }

  async function logout() {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
