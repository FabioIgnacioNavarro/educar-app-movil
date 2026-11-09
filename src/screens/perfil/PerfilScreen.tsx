import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  View,
} from "react-native";
import { isAxiosError } from "axios";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { authService } from "../../services/authService";

export function PerfilScreen() {
  const { user, logout, isLoading } = useAuth();
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [contraseniaActual, setContraseniaActual] = useState("");
  const [contraseniaNueva, setContraseniaNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cambiandoContrasenia, setCambiandoContrasenia] = useState(false);
  const [errorContrasenia, setErrorContrasenia] = useState<string | null>(null);

  async function cambiarContrasenia() {
    setErrorContrasenia(null);
    if (!contraseniaActual || !contraseniaNueva || !confirmacion) {
      setErrorContrasenia("Completá los tres campos de contraseña.");
      return;
    }
    if (contraseniaNueva !== confirmacion) {
      setErrorContrasenia("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setCambiandoContrasenia(true);
    try {
      const response = await authService.changePassword({
        currentPassword: contraseniaActual,
        newPassword: contraseniaNueva,
      });
      setContraseniaActual("");
      setContraseniaNueva("");
      setConfirmacion("");
      setFormularioVisible(false);
      Alert.alert("Contraseña actualizada", response.detail);
    } catch (err: unknown) {
      const detail = isAxiosError<{ detail?: string | string[] }>(err)
        ? err.response?.data?.detail
        : undefined;
      setErrorContrasenia(
        Array.isArray(detail)
          ? detail.join("\n")
          : detail || "No se pudo cambiar la contraseña. Revisá la conexión e intentá nuevamente."
      );
    } finally {
      setCambiandoContrasenia(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Información de la cuenta y sesión</Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.nombre_completo || "U").charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{user?.nombre_completo || "Usuario"}</Text>
        <Text style={styles.role}>{user?.rol || "Rol no asignado"}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Usuario:</Text>
          <Text style={styles.infoValue}>{user?.nombre_usuario || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Correo Electrónico:</Text>
          <Text style={styles.infoValue}>{user?.email || "-"}</Text>
        </View>

        {user?.tutor_id && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Tutor:</Text>
            <Text style={styles.infoValue}>#{user.tutor_id}</Text>
          </View>
        )}

        <Button
          testID="btn-logout"
          title="Cerrar Sesión Segura"
          variant="danger"
          onPress={logout}
          loading={isLoading}
          style={styles.logoutButton}
        />
      </Card>
      <Card style={styles.passwordCard}>
        <Text style={styles.passwordTitle}>Seguridad de la cuenta</Text>
        <Text style={styles.passwordHelp}>
          Cambiá tu contraseña actual. Por seguridad, las demás sesiones se cerrarán.
        </Text>
        {!formularioVisible ? (
          <Button
            testID="btn-mostrar-cambio-contrasenia"
            title="Cambiar contraseña"
            variant="outline"
            onPress={() => {
              setErrorContrasenia(null);
              setFormularioVisible(true);
            }}
          />
        ) : (
          <View>
            {errorContrasenia && <ErrorMessage message={errorContrasenia} />}
            <TextInput
              testID="input-contrasenia-actual"
              accessibilityLabel="Contraseña actual"
              style={styles.passwordInput}
              placeholder="Contraseña actual"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={contraseniaActual}
              onChangeText={setContraseniaActual}
            />
            <TextInput
              testID="input-contrasenia-nueva"
              accessibilityLabel="Nueva contraseña"
              style={styles.passwordInput}
              placeholder="Nueva contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={contraseniaNueva}
              onChangeText={setContraseniaNueva}
            />
            <TextInput
              testID="input-confirmar-contrasenia"
              accessibilityLabel="Confirmar nueva contraseña"
              style={styles.passwordInput}
              placeholder="Confirmar nueva contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={confirmacion}
              onChangeText={setConfirmacion}
            />
            <Button
              testID="btn-cambiar-contrasenia"
              title="Guardar contraseña nueva"
              onPress={() => void cambiarContrasenia()}
              loading={cambiandoContrasenia}
              style={styles.passwordAction}
            />
            <Button
              title="Cancelar"
              variant="secondary"
              disabled={cambiandoContrasenia}
              onPress={() => {
                setFormularioVisible(false);
                setErrorContrasenia(null);
                setContraseniaActual("");
                setContraseniaNueva("");
                setConfirmacion("");
              }}
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  card: {
    padding: 20,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  role: {
    fontSize: 14,
    color: "#0D9488",
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    width: "100%",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  logoutButton: {
    width: "100%",
    marginTop: 20,
  },
  passwordCard: {
    padding: 20,
    alignItems: "stretch",
  },
  passwordTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  passwordHelp: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 14,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    marginBottom: 12,
  },
  passwordAction: {
    marginBottom: 10,
  },
});
