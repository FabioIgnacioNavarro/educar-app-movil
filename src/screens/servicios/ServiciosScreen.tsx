import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../components/Card";

export function ServiciosScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Servicios Contratados</Text>
        <Text style={styles.subtitle}>
          Deportes, Transporte Escolar y Comedor Institucional
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>⚽ Disciplinas Deportivas</Text>
        <Text style={styles.info}>
          Máximo 2 deportes simultáneos por alumno con control de horarios.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🚌 Transporte Escolar</Text>
        <Text style={styles.info}>
          4 recorridos fijos habilitados. Servicio opcional y configurable mes a mes.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🍽️ Comedor Escolar</Text>
        <Text style={styles.info}>
          Servicio nutricional institucional con tarifa mensual discriminada.
        </Text>
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  info: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
});
