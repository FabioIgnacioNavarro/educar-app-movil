import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { CuotaModel } from "../../types/cuota";
import { cuotasService } from "../../services/cuotasService";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";

export function CuotasScreen({ navigation }: any) {
  const [cuotas, setCuotas] = useState<CuotaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCuotas() {
    try {
      setError(null);
      const data = await cuotasService.getCuotas();
      setCuotas(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "No se pudieron cargar las cuotas. Verifique su conexión."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchCuotas();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    fetchCuotas();
  }

  if (loading) {
    return <LoadingSpinner message="Consultando cuotas e importes..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Cuotas y Pagos</Text>
        <Text style={styles.subtitle}>
          Visualice el estado de cuenta de sus hijos asociados
        </Text>
      </View>

      {error && <ErrorMessage message={error} />}

      <FlatList
        data={cuotas}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Sin cuotas registradas</Text>
            <Text style={styles.emptyText}>
              No se encontraron cuotas pendientes para el período consultado.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card testID={`cuota-card-${item.id}`} style={styles.cuotaCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.periodo}>{item.periodo}</Text>
                <Text style={styles.alumno}>
                  {item.alumnoNombre} ({item.alumnoCurso})
                </Text>
              </View>
              <StatusBadge estado={item.estado} />
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Vencimiento:</Text>
              <Text style={styles.detailValue}>{item.fechaVencimiento}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Total Cuota:</Text>
              <Text style={styles.montoTotal}>{item.montoTotalFormateado}</Text>
            </View>

            {item.estado !== "pagada" && (
              <TouchableOpacity
                testID={`btn-pagar-${item.id}`}
                style={styles.payButton}
                onPress={() =>
                  navigation.navigate("Comprobantes", {
                    facturaId: item.facturaId,
                  })
                }
              >
                <Text style={styles.payButtonText}>Adjuntar Comprobante</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}
      />
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
  cuotaCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  periodo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  alumno: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  montoTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  payButton: {
    marginTop: 12,
    backgroundColor: "#0D9488",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
});
