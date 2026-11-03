import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, LoginCredentials } from "../types/auth";
import { authService } from "../services/authService";
import { getAccessToken, getUserData } from "../utils/storage";

/**
 * Contexto de Autenticación - PATRÓN DE COMPORTAMIENTO: OBSERVER (ADR 0003)
 * Mantiene la sesión del usuario y notifica reactivamente a los componentes observadores.
 */

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

  // Restaurar sesión al iniciar la aplicación (RNF_M01)
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedToken = await getAccessToken();
        const storedUser = await getUserData<User>();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (err) {
        console.warn("No se pudo restaurar la sesión:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  async function login(credentials: LoginCredentials) {
    setIsLoading(true);
    try {
      const { user: loggedUser, tokens } = await authService.login(credentials);
      setUser(loggedUser);
      setToken(tokens.access);
    } finally {
      setIsLoading(false);
    }
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
        isAuthenticated: !!token && !!user,
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
