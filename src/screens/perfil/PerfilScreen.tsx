import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export function PerfilScreen() {
  const { user, logout, isLoading } = useAuth();

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
});
