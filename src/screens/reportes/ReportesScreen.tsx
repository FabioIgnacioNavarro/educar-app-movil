import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../components/Card";
import { useAuth } from "../../context/AuthContext";

export function ReportesScreen() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "Administrador";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAdmin ? "Reportes Administrativos" : "Historial Financiero"}
        </Text>
        <Text style={styles.subtitle}>
          {isAdmin
            ? "Métricas de recaudación y estado de deuda institucional"
            : "Desglose de facturación y pagos por período"}
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>
          {isAdmin ? "📊 Ingresos por Período" : "📄 Facturas Emitidas"}
        </Text>
        <Text style={styles.cardBody}>
          {isAdmin
            ? "Consulte los ingresos consolidados por cuota base y servicios extracurriculares."
            : "Descargue o visualice las facturas mensuales en PDF generadas a fin de mes."}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>
          {isAdmin ? "👥 Alumnos con Deuda" : "📉 Discriminación de Deuda"}
        </Text>
        <Text style={styles.cardBody}>
          {isAdmin
            ? "Listado filtrable de tutores con cuotas vencidas o incompletas."
            : "Vea el desglose de conceptos adeudados (cuota base, deportes, transporte, comedor)."}
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
});
