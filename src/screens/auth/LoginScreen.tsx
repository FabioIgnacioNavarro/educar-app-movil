import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";

export function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!usuario.trim() || !password.trim()) {
      setError("Por favor ingrese su usuario y contraseña.");
      return;
    }

    setError(null);
    try {
      await login({ usuario: usuario.trim(), password });
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Credenciales inválidas o error de conexión.";
      setError(serverMessage);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.institution}>CENTRO EDUCATIVO</Text>
          <Text style={styles.title}>Transformar para educar</Text>
          <Text style={styles.subtitle}>Gestión Móvil de Padres y Administración</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>

          {error && <ErrorMessage message={error} testID="login-error-msg" />}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Usuario o Correo Institucional</Text>
            <TextInput
              testID="input-usuario"
              accessibilityLabel="Usuario o Correo"
              style={styles.input}
              placeholder="Ej: perez_juan"
              autoCapitalize="none"
              autoCorrect={false}
              value={usuario}
              onChangeText={setUsuario}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              testID="input-password"
              accessibilityLabel="Contraseña"
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Button
            testID="btn-login"
            title="Ingresar a la Plataforma"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <Text style={styles.helperText}>
            Acceda con las mismas credenciales registradas en el portal web.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  institution: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  loginButton: {
    marginTop: 10,
  },
  helperText: {
    marginTop: 16,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
});
