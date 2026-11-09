import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CuotaModel, PagoHistorialModel } from "../../types/cuota";
import { cuotasService } from "../../services/cuotasService";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { DetalleCuotaModal } from "./DetalleCuotaModal";
import { formatCurrency } from "../../utils/formatters";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../../types/navigation";
import { isAxiosError } from "axios";
import { useFocusEffect } from "@react-navigation/native";

type TabView = "vigentes" | "historial";

type CuotasScreenProps = BottomTabScreenProps<MainTabParamList, "Cuotas">;

export function CuotasScreen({ navigation }: CuotasScreenProps) {
  const [activeTab, setActiveTab] = useState<TabView>("vigentes");
  const [cuotas, setCuotas] = useState<CuotaModel[]>([]);
  const [historial, setHistorial] = useState<PagoHistorialModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedAlumno, setSelectedAlumno] = useState<string>("TODOS");
  const [selectedEstado, setSelectedEstado] = useState<string>("TODOS");

  // Modal de Detalle
  const [selectedCuotaId, setSelectedCuotaId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  async function loadData() {
    try {
      setError(null);
      const cuotasData = await cuotasService.getCuotas();
      const historialData = await cuotasService.getHistorialPagos(cuotasData);
      setCuotas(cuotasData);
      setHistorial(historialData);
    } catch (err: unknown) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function initData() {
        try {
          const cuotasData = await cuotasService.getCuotas();
          const historialData = await cuotasService.getHistorialPagos(cuotasData);
          if (isMounted) {
            setCuotas(cuotasData);
            setHistorial(historialData);
            setError(null);
          }
        } catch (err: unknown) {
          if (isMounted) {
            setError(getApiError(err));
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }

      void initData();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    void loadData();
  }

  // Lista única de alumnos para los chips de filtro
  const alumnosList = useMemo(() => {
    const names = Array.from(new Set(cuotas.map((c) => c.alumnoNombre)));
    return ["TODOS", ...names];
  }, [cuotas]);

  // Cuotas filtradas
  const filteredCuotas = useMemo(() => {
    return cuotas.filter((c) => {
      const matchAlumno =
        selectedAlumno === "TODOS" || c.alumnoNombre === selectedAlumno;
      const matchEstado =
        selectedEstado === "TODOS" || c.estado === selectedEstado.toLowerCase();
      return matchAlumno && matchEstado;
    });
  }, [cuotas, selectedAlumno, selectedEstado]);

  // Saldo total pendiente acumulado
  const totalDeudaAcumulada = useMemo(() => {
    return cuotas.reduce((acc, c) => acc + c.saldoPendiente, 0);
  }, [cuotas]);

  // Total abonado histórico
  const totalHistoricoAbonado = useMemo(() => {
    return historial
      .filter((p) => p.estado === "pagado")
      .reduce((acc, p) => acc + p.montoAbonado, 0);
  }, [historial]);

  function handleVerDetalle(id: number) {
    setSelectedCuotaId(id);
    setModalVisible(true);
  }

  function handleAdjuntarComprobante(cuotaId?: number, saldo?: number) {
    const cuota = cuotas.find((item) => item.id === cuotaId);
    navigation.navigate("Comprobantes", {
      cuotaId,
      saldo,
      periodo: cuota?.periodo,
      alumnoNombre: cuota?.alumnoNombre,
      refreshKey: Date.now(),
    });
  }

  if (loading) {
    return <LoadingSpinner message="Consultando cuotas e importes escolares..." />;
  }

  return (
    <View style={styles.container}>
      {/* Selector de Pestañas Superiores */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "vigentes" && styles.tabButtonActive]}
          onPress={() => setActiveTab("vigentes")}
        >
          <Text
            style={[styles.tabText, activeTab === "vigentes" && styles.tabTextActive]}
          >
            Cuotas Vigentes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "historial" && styles.tabButtonActive]}
          onPress={() => setActiveTab("historial")}
        >
          <Text
            style={[styles.tabText, activeTab === "historial" && styles.tabTextActive]}
          >
            Historial de Pagos
          </Text>
        </TouchableOpacity>
      </View>

      {error && <ErrorMessage message={error} />}

      {activeTab === "vigentes" ? (
        <>
          {/* Banner Resumen de Deuda */}
          <View style={styles.summaryBanner}>
            <View>
              <Text style={styles.summaryTitle}>Saldo Total a Regularizar</Text>
              <Text style={styles.summarySubtitle}>
                Cuotas vigentes y pendientes de vencimiento
              </Text>
            </View>
            <Text style={styles.summaryAmount}>
              {formatCurrency(totalDeudaAcumulada)}
            </Text>
          </View>

          {/* Filtros por Alumno */}
          {alumnosList.length > 2 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Filtrar por Alumno:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
              >
                {alumnosList.map((nombre) => (
                  <TouchableOpacity
                    key={nombre}
                    style={[
                      styles.chip,
                      selectedAlumno === nombre && styles.chipActive,
                    ]}
                    onPress={() => setSelectedAlumno(nombre)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedAlumno === nombre && styles.chipTextActive,
                      ]}
                    >
                      {nombre === "TODOS" ? "Todos los Alumnos" : nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Filtros por Estado */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
            >
              {["TODOS", "pendiente", "parcial", "vencida", "pagada"].map((est) => (
                <TouchableOpacity
                  key={est}
                  style={[
                    styles.chip,
                    selectedEstado === est && styles.chipActive,
                  ]}
                  onPress={() => setSelectedEstado(est)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedEstado === est && styles.chipTextActive,
                    ]}
                  >
                    {est.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lista de Tarjetas de Cuotas */}
          <FlatList
            data={filteredCuotas}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Sin cuotas para este filtro</Text>
                <Text style={styles.emptyText}>
                  No se encontraron cuotas que coincidan con los criterios seleccionados.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Card testID={`cuota-card-${item.id}`} style={styles.cuotaCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleVerDetalle(item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.periodo}>{item.periodo}</Text>
                      <Text style={styles.alumno}>
                        {item.alumnoNombre} • {item.alumnoCurso}
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
                    <Text style={styles.detailLabel}>Monto Cuota:</Text>
                    <Text style={styles.montoTotal}>{item.montoTotalFormateado}</Text>
                  </View>

                  {item.montoPagado > 0 && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailLabel}>Acreditado:</Text>
                      <Text style={styles.montoPagado}>
                        - {item.montoPagadoFormateado}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.detailsRow, styles.saldoRow]}>
                    <Text style={styles.saldoLabelText}>Saldo a Pagar:</Text>
                    <Text
                      style={[
                        styles.saldoText,
                        item.saldoPendiente > 0
                          ? styles.textDanger
                          : styles.textSuccess,
                      ]}
                    >
                      {item.saldoPendienteFormateado}
                    </Text>
                  </View>

                  {item.comprobantes[0] && (
                    <View style={styles.paymentReview}>
                      <View style={styles.paymentReviewHeader}>
                        <Text style={styles.detailLabel}>Último comprobante:</Text>
                        <StatusBadge estado={item.comprobantes[0].estado} />
                      </View>
                      {item.comprobantes[0].motivoRechazo && (
                        <Text style={styles.rejectionReason}>
                          Motivo del rechazo: {item.comprobantes[0].motivoRechazo}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleVerDetalle(item.id)}
                  >
                    <Text style={styles.detailButtonText}>Ver Desglose</Text>
                  </TouchableOpacity>

                  {item.estado !== "pagada" && (
                    <TouchableOpacity
                      testID={`btn-pagar-${item.id}`}
                      style={styles.payButton}
                      onPress={() => handleAdjuntarComprobante(item.id, item.saldoPendiente)}
                    >
                      <Text style={styles.payButtonText}>Pagar Transferencia</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            )}
          />
        </>
      ) : (
        /* Pestaña: Historial de Pagos (HU_M03) */
        <View style={{ flex: 1 }}>
          <View style={[styles.summaryBanner, styles.bannerSuccess]}>
            <View>
              <Text style={styles.summaryTitle}>Total Histórico Abonado</Text>
              <Text style={styles.summarySubtitle}>
                Pagos acreditados durante el ciclo lectivo
              </Text>
            </View>
            <Text style={[styles.summaryAmount, styles.textSuccess]}>
              {formatCurrency(totalHistoricoAbonado)}
            </Text>
          </View>

          <FlatList
            data={historial}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Sin pagos registrados</Text>
                <Text style={styles.emptyText}>
                  Aún no se enviaron comprobantes de pago.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Card style={styles.historialCard}>
                <View style={styles.historialHeader}>
                  <View>
                    <Text style={styles.historialPeriodo}>{item.periodo}</Text>
                    <Text style={styles.historialAlumno}>
                      {item.alumnoNombre} • {item.alumnoCurso}
                    </Text>
                  </View>
                  <StatusBadge estado={item.estado} />
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsRow}>
                  <Text style={styles.detailLabel}>Fecha del comprobante:</Text>
                  <Text style={styles.detailValue}>{item.fechaPago}</Text>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detailLabel}>
                    {item.estado === "pagado" ? "Importe acreditado:" : "Importe informado:"}
                  </Text>
                  <Text style={styles.historialMonto}>
                    {item.montoAbonadoFormateado}
                  </Text>
                </View>
                {item.motivoRechazo && (
                  <Text style={styles.rejectionReason}>
                    Motivo del rechazo: {item.motivoRechazo}
                  </Text>
                )}
              </Card>
            )}
          />
        </View>
      )}

      {/* Modal de Detalle Discriminado */}
      <DetalleCuotaModal
        visible={modalVisible}
        cuotaId={selectedCuotaId}
        onClose={() => setModalVisible(false)}
        onAdjuntarComprobante={handleAdjuntarComprobante}
      />
    </View>
  );
}

function getApiError(error: unknown): string {
  if (isAxiosError<{ detail?: string }>(error) && error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return "No se pudieron sincronizar las cuotas. Verifique su conexión.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#1E3A8A",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
  summaryBanner: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  bannerSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  summarySubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  chipsScroll: {
    flexDirection: "row",
  },
  chip: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#1E3A8A",
  },
  chipText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  alumno: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  montoTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  montoPagado: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803D",
  },
  saldoRow: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  saldoLabelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  saldoText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  textDanger: {
    color: "#B91C1C",
  },
  textSuccess: {
    color: "#15803D",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  detailButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  payButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "#1E3A8A",
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  historialCard: {
    marginBottom: 10,
  },
  historialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historialPeriodo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  historialAlumno: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  paymentReview: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 6,
  },
  paymentReviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  rejectionReason: {
    color: "#991B1B",
    backgroundColor: "#FEF2F2",
    borderRadius: 7,
    padding: 9,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
  },
  historialMonto: {
    fontSize: 14,
    fontWeight: "700",
    color: "#15803D",
  },
});
