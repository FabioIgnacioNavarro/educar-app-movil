import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, clearAuthStorage } from "../utils/storage";

/**
 * Cliente HTTP Centralizado - PATRÓN CREACIONAL: SINGLETON (ADR 0003)
 * Garantiza un único punto global de acceso para consumir la API REST de Django.
 */
class ApiClientSingleton {
  private static instance: AxiosInstance;

  private constructor() {}

  public static getInstance(): AxiosInstance {
    if (!ApiClientSingleton.instance) {
      const baseURL =
        process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000/api";
      const timeout = Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 10000;

      ApiClientSingleton.instance = axios.create({
        baseURL,
        timeout,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Interceptor de Request: inyecta Bearer token de forma transparente (RNF_M02)
      ApiClientSingleton.instance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          const token = await getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Interceptor de Response: captura 401 para expiración de sesión
      ApiClientSingleton.instance.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401) {
            // Sesión expirada o token inválido
            await clearAuthStorage();
          }
          return Promise.reject(error);
        }
      );
    }

    return ApiClientSingleton.instance;
  }
}

export const apiClient = ApiClientSingleton.getInstance();
