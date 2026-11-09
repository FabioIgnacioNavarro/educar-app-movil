import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { authService } from "../../services/authService";

export function LoginScreen() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recoveryStep, setRecoveryStep] = useState<"login" | "request" | "confirm">("login");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);

  async function handleLogin() {
    if (!usuario.trim() || !password.trim()) {
      setError("Por favor ingrese su usuario y contraseña.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ identifier: usuario.trim(), password });
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (err.code === "ECONNABORTED"
          ? "Tiempo de espera agotado (10s). El teléfono no pudo comunicarse con el backend en su PC. Verifique que la red Wi-Fi esté en modo Privado en Windows."
          : null) ||
        (err.message === "Network Error"
          ? "Error de conexión. El teléfono no puede alcanzar la IP de su PC. Verifique el Firewall de Windows."
          : null) ||
        "Credenciales inválidas o error de conexión.";
      setError(serverMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestRecovery() {
    const email = recoveryEmail.trim();
    if (!email || !email.includes("@")) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }
    setError(null);
    setRecoveryMessage(null);
    setRecoverySubmitting(true);
    try {
      const result = await authService.requestPasswordReset(email);
      setRecoveryEmail(email);
      setRecoveryMessage(result.detail);
      setRecoveryStep("confirm");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "No se pudo solicitar la recuperación. Intentá nuevamente."
      );
    } finally {
      setRecoverySubmitting(false);
    }
  }

  async function handleConfirmRecovery() {
    if (!/^\d{6}$/.test(recoveryCode)) {
      setError("Ingresá el código de seis dígitos que recibiste por correo.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setError(null);
    setRecoverySubmitting(true);
    try {
      const result = await authService.confirmPasswordReset({
        email: recoveryEmail,
        code: recoveryCode,
        newPassword,
      });
      setUsuario(recoveryEmail);
      setPassword("");
      setRecoveryMessage(result.detail);
      setRecoveryStep("login");
      setRecoveryCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.join(" ") : detail || "No se pudo restablecer la contraseña.");
    } finally {
      setRecoverySubmitting(false);
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
          <Text style={styles.formTitle}>
            {recoveryStep === "login"
              ? "Iniciar Sesión"
              : recoveryStep === "request"
                ? "Recuperar contraseña"
                : "Crear contraseña nueva"}
          </Text>

          {error && <ErrorMessage message={error} testID="login-error-msg" />}
          {recoveryMessage && <Text style={styles.notice}>{recoveryMessage}</Text>}

          {recoveryStep === "login" ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Usuario o Correo Institucional</Text>
                <TextInput
                  testID="input-usuario"
                  accessibilityLabel="Usuario o Correo"
                  style={styles.input}
                  placeholder="Ej: rperez"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
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
                loading={submitting}
                style={styles.loginButton}
              />

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setRecoveryMessage(null);
                  setError(null);
                  setRecoveryEmail(usuario.includes("@") ? usuario : "");
                  setRecoveryStep("request");
                }}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
              <Text style={styles.helperText}>
                Accedé con las credenciales registradas en el portal web.
              </Text>
            </>
          ) : recoveryStep === "request" ? (
            <>
              <Text style={styles.recoveryHelp}>
                Te enviaremos un código al correo asociado a tu cuenta, si está registrado.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  accessibilityLabel="Correo electrónico"
                  style={styles.input}
                  placeholder="nombre@correo.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={recoveryEmail}
                  onChangeText={setRecoveryEmail}
                />
              </View>
              <Button
                title="Enviar código"
                onPress={handleRequestRecovery}
                loading={recoverySubmitting}
                style={styles.loginButton}
              />
              <Pressable onPress={() => { setError(null); setRecoveryStep("login"); }} style={styles.linkButton}>
                <Text style={styles.linkText}>Volver al inicio de sesión</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.recoveryHelp}>
                Ingresá el código de seis dígitos enviado a {recoveryEmail}. Vence en 15 minutos.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Código de recuperación</Text>
                <TextInput
                  accessibilityLabel="Código de recuperación"
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={recoveryCode}
                  onChangeText={(value) => setRecoveryCode(value.replace(/\D/g, ""))}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva contraseña</Text>
                <TextInput
                  accessibilityLabel="Nueva contraseña"
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Repetir nueva contraseña</Text>
                <TextInput
                  accessibilityLabel="Repetir nueva contraseña"
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
              <Button
                title="Restablecer contraseña"
                onPress={handleConfirmRecovery}
                loading={recoverySubmitting}
                style={styles.loginButton}
              />
              <Pressable onPress={() => { setError(null); setRecoveryStep("request"); }} style={styles.linkButton}>
                <Text style={styles.linkText}>Solicitar otro código</Text>
              </Pressable>
            </>
          )}
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
  linkButton: {
    alignItems: "center",
    paddingVertical: 14,
  },
  linkText: {
    color: "#1E3A8A",
    fontSize: 14,
    fontWeight: "700",
  },
  recoveryHelp: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  notice: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    color: "#1E3A8A",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    padding: 12,
  },
});
