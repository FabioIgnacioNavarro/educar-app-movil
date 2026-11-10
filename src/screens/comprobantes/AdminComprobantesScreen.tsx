import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ComprobanteViewerModal } from "../../components/ComprobanteViewerModal";
import { ComprobantePendienteModel } from "../../types/comprobantes";
import { comprobantesService } from "../../services/comprobantesService";
import { EstadoPago } from "../../types/cuota";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { getAccessToken } from "../../utils/storage";

function normalizeEstadoPago(estado: string): EstadoPago {
  const lower = estado.toLowerCase().trim();
  if (lower === "pagado" || lower === "pagada" || lower === "aprobado") return "pagado";
  if (lower === "rechazado") return "rechazado";
  return "en revisión";
}

export function AdminComprobantesScreen() {
  const [comprobantes, setComprobantes] = useState<ComprobantePendienteModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modal de rechazo
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Modal de visor de comprobante
  const [viewerModalVisible, setViewerModalVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerFileName, setViewerFileName] = useState<string>("");
  const [authToken, setAuthToken] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await comprobantesService.getComprobantesPendientes();
      setComprobantes(data);
      const token = await getAccessToken();
      setAuthToken(token);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || "No se pudieron cargar los comprobantes pendientes.");
      } else {
        setError("Error al consultar los comprobantes pendientes.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleRefresh() {
    setRefreshing(true);
    loadData();
  }

  function handleConfirmAprobar(item: ComprobantePendienteModel) {
    Alert.alert(
      "Confirmar aprobación",
      `¿Desea aprobar la transferencia de ${formatCurrency(item.importe)} del alumno ${item.alumno.nombre} (${item.periodo})?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar Pago",
          onPress: () => void ejecutarAprobacion(item.id),
        },
      ]
    );
  }

  async function ejecutarAprobacion(pagoId: number) {
    setActionLoadingId(pagoId);
    try {
      const response = await comprobantesService.aprobarComprobante(pagoId);
      Alert.alert("Éxito", response.detail || "Pago aprobado exitosamente.");
      await loadData();
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail || "No se pudo aprobar el pago."
        : "Error al aprobar el pago.";
      Alert.alert("Error", String(msg));
    } finally {
      setActionLoadingId(null);
    }
  }

  function abrirModalRechazo(pagoId: number) {
    setSelectedRejectId(pagoId);
    setRejectReason("");
    setRejectModalVisible(true);
  }

  async function ejecutarRechazo() {
    if (!selectedRejectId) return;
    const motivo = rejectReason.trim();
    if (!motivo) {
      Alert.alert("Atención", "Debe ingresar un motivo para el rechazo.");
      return;
    }

    setRejectSubmitting(true);
    try {
      const response = await comprobantesService.rechazarComprobante(selectedRejectId, motivo);
      setRejectModalVisible(false);
      Alert.alert("Pago rechazado", response.detail || "El comprobante fue rechazado correctamente.");
      await loadData();
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail || "No se pudo rechazar el comprobante."
        : "Error al rechazar el pago.";
      Alert.alert("Error", String(msg));
    } finally {
      setRejectSubmitting(false);
    }
  }

  function abrirVisor(archivoUrl: string, nombreArchivo: string) {
    setViewerUrl(archivoUrl);
    setViewerFileName(nombreArchivo);
    setViewerModalVisible(true);
  }

  if (loading && !refreshing) {
    return <LoadingSpinner message="Consultando transferencias en revisión..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={comprobantes}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Validar Pagos</Text>
            <Text style={styles.subtitle}>
              Auditoría y confirmación de transferencias bancarias en revisión.
            </Text>
            {error && <ErrorMessage message={error} />}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle" size={54} color="#16A34A" />
              <Text style={styles.emptyTitle}>¡Todo al día!</Text>
              <Text style={styles.emptySubtitle}>
                No hay transferencias bancarias pendientes de revisión en este momento.
              </Text>
            </Card>
          ) : undefined
        }
        renderItem={({ item }) => {
          const isProcessing = actionLoadingId === item.id;
          return (
            <Card style={styles.card}>
              {/* Encabezado: Alumno y curso */}
              <View style={styles.cardHeader}>
                <View style={styles.alumnoInfo}>
                  <Text style={styles.alumnoNombre}>{item.alumno.nombre}</Text>
                  <Text style={styles.alumnoSub}>
                    Legajo #{item.alumno.legajo} {item.alumno.curso ? `• ${item.alumno.curso}` : ""}
                  </Text>
                </View>
                <StatusBadge estado={normalizeEstadoPago(item.estado)} />
              </View>

              <View style={styles.divider} />

              {/* Información de Tutor e Importe */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tutor informante:</Text>
                <Text style={styles.infoValue}>{item.tutor.nombre}</Text>
              </View>
              {item.tutor.email ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{item.tutor.email}</Text>
                </View>
              ) : null}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Período abonado:</Text>
                <Text style={styles.infoValueBold}>{item.periodo}</Text>
              </View>

              <View style={styles.montoRow}>
                <Text style={styles.montoLabel}>Monto transferido:</Text>
                <Text style={styles.montoValue}>{formatCurrency(item.importe)}</Text>
              </View>

              {item.fechaSolicitud ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fecha de envío:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(item.fechaSolicitud.split("T")[0])}
                  </Text>
                </View>
              ) : null}

              {/* Desglose de conceptos si aplica */}
              {item.conceptos && item.conceptos.length > 0 && (
                <View style={styles.conceptosBox}>
                  <Text style={styles.conceptosBoxTitle}>Conceptos a cancelar:</Text>
                  {item.conceptos.map((c, idx) => (
                    <View key={`${c.clave}-${idx}`} style={styles.conceptoItem}>
                      <Text style={styles.conceptoNombre}>• {c.concepto}</Text>
                      <Text style={styles.conceptoMonto}>{formatCurrency(c.monto)}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Botón para ver archivo adjunto */}
              {item.comprobante ? (
                <TouchableOpacity
                  style={styles.attachmentButton}
                  onPress={() => abrirVisor(item.comprobante!.archivoUrl, item.comprobante!.nombreArchivo)}
                >
                  <Ionicons name="document-attach" size={18} color="#1D66C2" />
                  <Text style={styles.attachmentText} numberOfLines={1}>
                    Ver comprobante: {item.comprobante.nombreArchivo}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {/* Botones de acción */}
              <View style={styles.actionsRow}>
                <Button
                  title="Aprobar Pago"
                  variant="primary"
                  loading={isProcessing}
                  disabled={isProcessing}
                  onPress={() => handleConfirmAprobar(item)}
                  style={styles.approveButton}
                />
                <Button
                  title="Rechazar"
                  variant="danger"
                  disabled={isProcessing}
                  onPress={() => abrirModalRechazo(item.id)}
                  style={styles.rejectButton}
                />
              </View>
            </Card>
          );
        }}
      />

      {/* Modal de Rechazo */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rechazar comprobante</Text>
            <Text style={styles.modalSubtitle}>
              Indicá el motivo del rechazo. El tutor podrá visualizarlo para corregir y reenviar la transferencia.
            </Text>

            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={3}
              placeholder="Ej: Importe transferido insuficiente o archivo ilegible..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.modalButtonsRow}>
              <Button
                title="Cancelar"
                variant="secondary"
                disabled={rejectSubmitting}
                onPress={() => setRejectModalVisible(false)}
                style={styles.modalCancelBtn}
              />
              <Button
                title="Confirmar Rechazo"
                variant="danger"
                loading={rejectSubmitting}
                disabled={!rejectReason.trim() || rejectSubmitting}
                onPress={() => void ejecutarRechazo()}
                style={styles.modalConfirmBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Modal de Visor de Archivo (PDF e Imágenes) */}
      <ComprobanteViewerModal
        visible={viewerModalVisible}
        onClose={() => setViewerModalVisible(false)}
        archivoUrl={viewerUrl}
        nombreArchivo={viewerFileName}
        authToken={authToken}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
    marginTop: 3,
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  alumnoInfo: {
    flex: 1,
    marginRight: 8,
  },
  alumnoNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  alumnoSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "500",
  },
  infoValueBold: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  montoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  montoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  montoValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1D66C2",
  },
  conceptosBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  conceptosBoxTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  conceptoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  conceptoNombre: {
    fontSize: 12,
    color: "#334155",
  },
  conceptoMonto: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  attachmentText: {
    fontSize: 13,
    color: "#1D66C2",
    fontWeight: "600",
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  approveButton: {
    flex: 2,
  },
  rejectButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    textAlignVertical: "top",
    minHeight: 80,
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalConfirmBtn: {
    flex: 2,
  },
});
