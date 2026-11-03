import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Módulo seguro de almacenamiento persistente (RNF_M01 / ADR 0002)
 * Utiliza Android Keystore y iOS Keychain en dispositivos nativos.
 */

const ACCESS_TOKEN_KEY = "educar_access_token";
const REFRESH_TOKEN_KEY = "educar_refresh_token";
const USER_DATA_KEY = "educar_user_data";

export async function saveAuthTokens(access: string, refresh: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveUserData(userData: object): Promise<void> {
  const json = JSON.stringify(userData);
  if (Platform.OS === "web") {
    localStorage.setItem(USER_DATA_KEY, json);
    return;
  }
  await SecureStore.setItemAsync(USER_DATA_KEY, json);
}

export async function getUserData<T>(): Promise<T | null> {
  let json: string | null = null;
  if (Platform.OS === "web") {
    json = localStorage.getItem(USER_DATA_KEY);
  } else {
    json = await SecureStore.getItemAsync(USER_DATA_KEY);
  }
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function clearAuthStorage(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
}
