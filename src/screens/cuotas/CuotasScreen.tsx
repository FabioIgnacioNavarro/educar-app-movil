import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CuotaModel, EstadoCuota } from "../../types/cuota";
import { cuotasService } from "../../services/cuotasService";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";

const ESTADOS: { label: string; value: EstadoCuota | "todas" }[] = [
  { label: "Todas", value: "todas" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Parciales", value: "parcial" },
  { label: "Pagadas", value: "pagada" },
  { label: "Vencidas", value: "vencida" },
];

export function CuotasScreen({ navigation }: any) {
  const [cuotas, setCuotas] = useState<CuotaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCuota | "todas">("todas");
  const [alumnoFiltro, setAlumnoFiltro] = useState<number | null>(null);
  const [periodoFiltro, setPeriodoFiltro] = useState("");
  const [detalleAbierto, setDetalleAbierto] = useState<number | null>(null);

  const fetchCuotas = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchCuotas();
    }, [fetchCuotas])
  );

  const alumnos = useMemo(() => {
    const unique = new Map<number, string>();
    cuotas.forEach((cuota) => unique.set(cuota.alumnoLegajo, cuota.alumnoNombre));
    return Array.from(unique.entries());
  }, [cuotas]);

  const cuotasFiltradas = useMemo(() => {
    const periodo = periodoFiltro.trim().toLocaleLowerCase("es-AR");
    return cuotas.filter((cuota) => {
      const coincideEstado = estadoFiltro === "todas" || cuota.estado === estadoFiltro;
      const coincideAlumno = alumnoFiltro === null || cuota.alumnoLegajo === alumnoFiltro;
      const coincidePeriodo = !periodo || cuota.periodo.toLocaleLowerCase("es-AR").includes(periodo);
      return coincideEstado && coincideAlumno && coincidePeriodo;
    });
  }, [alumnoFiltro, cuotas, estadoFiltro, periodoFiltro]);

  if (loading) {
    return <LoadingSpinner message="Consultando cuotas e importes..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Cuotas y Pagos</Text>
        <Text style={styles.subtitle}>
          Cuotas y comprobantes de tus alumnos asociados
        </Text>
      </View>

      <TextInput
        accessibilityLabel="Filtrar por período"
        placeholder="Buscar período (por ejemplo, Octubre 2026)"
        value={periodoFiltro}
        onChangeText={setPeriodoFiltro}
        style={styles.searchInput}
      />

      <Text style={styles.filterLabel}>Estado</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {ESTADOS.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            selected={estadoFiltro === item.value}
            onPress={() => setEstadoFiltro(item.value)}
          />
        ))}
      </ScrollView>

      {alumnos.length > 1 && (
        <>
          <Text style={styles.filterLabel}>Alumno</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <FilterChip
              label="Todos"
              selected={alumnoFiltro === null}
              onPress={() => setAlumnoFiltro(null)}
            />
            {alumnos.map(([legajo, nombre]) => (
              <FilterChip
                key={legajo}
                label={nombre}
                selected={alumnoFiltro === legajo}
                onPress={() => setAlumnoFiltro(legajo)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {error && <ErrorMessage message={error} />}

      <FlatList
        data={cuotasFiltradas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={cuotasFiltradas.length === 0 ? styles.emptyList : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void fetchCuotas(true)} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Sin cuotas para mostrar</Text>
            <Text style={styles.emptyText}>
              No hay cuotas que coincidan con los filtros seleccionados.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card testID={`cuota-card-${item.id}`} style={styles.cuotaCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleGroup}>
                <Text style={styles.periodo}>{item.periodo}</Text>
                <Text style={styles.alumno}>
                  {item.alumnoNombre} · {item.alumnoCurso}
                </Text>
              </View>
              <StatusBadge estado={item.estado} />
            </View>

            <View style={styles.divider} />

            <AmountRow label="Vencimiento" value={item.fechaVencimiento} />
            <AmountRow label="Monto total" value={item.montoTotalFormateado} />
            <AmountRow label="Pagado" value={item.montoPagadoFormateado} />
            <AmountRow
              label="Saldo pendiente"
              value={item.saldoPendienteFormateado}
              strong
            />

            {item.comprobantes.length > 0 && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setDetalleAbierto(detalleAbierto === item.id ? null : item.id)}
                style={styles.historyToggle}
              >
                <Text style={styles.historyToggleText}>
                  {detalleAbierto === item.id ? "Ocultar" : "Ver"} comprobantes ({item.comprobantes.length})
                </Text>
              </TouchableOpacity>
            )}

            {detalleAbierto === item.id && (
              <View style={styles.history}>
                {item.comprobantes.map((comprobante) => (
                  <View key={comprobante.id} style={styles.receiptRow}>
                    <View style={styles.receiptText}>
                      <Text style={styles.receiptName} numberOfLines={1}>
                        {comprobante.nombreArchivo.split("/").pop() || "Comprobante"}
                      </Text>
                      <Text style={styles.receiptDate}>
                        {formatTimestamp(comprobante.fechaEnvio)}
                      </Text>
                    </View>
                    <Text style={styles.receiptState}>{comprobante.estado.toLocaleUpperCase("es-AR")}</Text>
                  </View>
                ))}
              </View>
            )}

            {item.saldoPendiente > 0 && (
              <TouchableOpacity
                testID={`btn-pagar-${item.id}`}
                style={styles.payButton}
                onPress={() =>
                  navigation.navigate("Comprobantes", {
                    cuotaId: item.id,
                    periodo: item.periodo,
                    alumnoNombre: item.alumnoNombre,
                    saldo: item.saldoPendiente,
                  })
                }
              >
                <Text style={styles.payButtonText}>Adjuntar comprobante</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}
      />
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipSelected]}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function AmountRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.detailsRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, strong && styles.amountStrong]}>{value}</Text>
    </View>
  );
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-AR");
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 16, paddingTop: 16 },
  header: { marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  searchInput: {
    backgroundColor: "#FFFFFF", borderColor: "#CBD5E1", borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, color: "#0F172A", marginBottom: 10,
  },
  filterLabel: { color: "#475569", fontSize: 12, fontWeight: "700", marginTop: 3, marginBottom: 5 },
  filters: { flexGrow: 0, marginBottom: 6 },
  filterChip: {
    borderColor: "#CBD5E1", borderWidth: 1, borderRadius: 18, paddingHorizontal: 12,
    paddingVertical: 7, marginRight: 7, backgroundColor: "#FFFFFF",
  },
  filterChipSelected: { backgroundColor: "#1E3A8A", borderColor: "#1E3A8A" },
  filterChipText: { color: "#334155", fontSize: 12, fontWeight: "600" },
  filterChipTextSelected: { color: "#FFFFFF" },
  cuotaCard: { marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitleGroup: { flex: 1 },
  periodo: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  alumno: { fontSize: 13, color: "#475569", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 12 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7, gap: 8 },
  detailLabel: { fontSize: 13, color: "#64748B" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#1E293B", textAlign: "right" },
  amountStrong: { fontSize: 15, color: "#1E3A8A", fontWeight: "700" },
  historyToggle: { paddingVertical: 9 },
  historyToggleText: { color: "#1E3A8A", fontWeight: "600", fontSize: 13 },
  history: { borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 8, marginBottom: 4 },
  receiptRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, gap: 8 },
  receiptText: { flex: 1 },
  receiptName: { color: "#334155", fontSize: 12, fontWeight: "600" },
  receiptDate: { color: "#64748B", fontSize: 11, marginTop: 2 },
  receiptState: { color: "#475569", fontSize: 10, fontWeight: "700" },
  payButton: { marginTop: 10, backgroundColor: "#0D9488", paddingVertical: 11, borderRadius: 8, alignItems: "center" },
  payButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  emptyList: { flexGrow: 1 },
  emptyContainer: { alignItems: "center", justifyContent: "center", flex: 1, paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#334155" },
  emptyText: { fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 6 },
});
