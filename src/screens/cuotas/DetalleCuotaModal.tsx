import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { DetalleCuotaModel } from "../../types/cuota";
import { cuotasService } from "../../services/cuotasService";
import { StatusBadge } from "../../components/StatusBadge";
import { Button } from "../../components/Button";

interface DetalleCuotaModalProps {
  visible: boolean;
  cuotaId: number | null;
  onClose: () => void;
  onAdjuntarComprobante?: (cuotaId?: number, saldo?: number) => void;
}

export function DetalleCuotaModal({
  visible,
  cuotaId,
  onClose,
  onAdjuntarComprobante,
}: DetalleCuotaModalProps) {
  const [detalle, setDetalle] = useState<DetalleCuotaModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !cuotaId) {
      return;
    }

    let isMounted = true;

    async function fetchDetalle(id: number) {
      setLoading(true);
      setError(null);
      try {
        const data = await cuotasService.getCuotaById(id);
        if (isMounted) {
          setDetalle(data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setDetalle(null);
          setError("No se pudo cargar la información real de esta cuota. Actualizá el listado e intentá de nuevo.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchDetalle(cuotaId);

    return () => {
      isMounted = false;
    };
  }, [visible, cuotaId]);

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>Cargando desglose de conceptos...</Text>
            </View>
          ) : !detalle ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{error || "No se pudo cargar la cuota."}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.periodoTitle}>{detalle.periodo}</Text>
                  <Text style={styles.alumnoSub}>
                    {detalle.alumnoNombre} • {detalle.alumnoCurso}
                  </Text>
                </View>
                <StatusBadge estado={detalle.estado} />
              </View>

              <View style={styles.separator} />

              {/* Vencimiento */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha de Vencimiento:</Text>
                <Text style={styles.infoValue}>{detalle.fechaVencimiento}</Text>
              </View>

              {/* Desglose de Conceptos, si la API lo informa */}
              {detalle.discriminacion ? (
                <>
                  <Text style={styles.sectionTitle}>Desglose Arancelario</Text>
                  <View style={styles.breakdownBox}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.conceptName}>Cuota Base Escolar</Text>
                  <Text style={styles.conceptAmount}>
                    {detalle.discriminacion.cuotaBaseFormateada}
                  </Text>
                </View>

                {detalle.discriminacion.deportes.map((dep, idx) => (
                  <View key={idx} style={styles.breakdownRow}>
                    <Text style={styles.conceptName}>Deporte: {dep.nombre}</Text>
                    <Text style={styles.conceptAmount}>{dep.montoFormateado}</Text>
                  </View>
                ))}

                {detalle.discriminacion.transporte && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.conceptName}>
                      Transporte ({detalle.discriminacion.transporte.recorrido})
                    </Text>
                    <Text style={styles.conceptAmount}>
                      {detalle.discriminacion.transporte.montoFormateado}
                    </Text>
                  </View>
                )}

                {detalle.discriminacion.comedor && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.conceptName}>Servicio de Comedor</Text>
                    <Text style={styles.conceptAmount}>
                      {detalle.discriminacion.comedor.montoFormateado}
                    </Text>
                  </View>
                )}
                  </View>
                </>
              ) : (
                <Text style={styles.loadingText}>
                  El desglose por concepto no está disponible para esta cuota.
                </Text>
              )}

              {/* Totales y Saldo */}
              <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Monto Total Liquidado:</Text>
                  <Text style={styles.totalValue}>{detalle.montoTotalFormateado}</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Monto Acreditado / Pagado:</Text>
                  <Text style={[styles.totalValue, styles.textSuccess]}>
                    - {detalle.montoPagadoFormateado}
                  </Text>
                </View>

                <View style={[styles.totalRow, styles.saldoHighlight]}>
                  <Text style={styles.saldoLabel}>Saldo Pendiente:</Text>
                  <Text
                    style={[
                      styles.saldoValue,
                      detalle.saldoPendiente > 0 ? styles.textDanger : styles.textSuccess,
                    ]}
                  >
                    {detalle.saldoPendienteFormateado}
                  </Text>
                </View>
              </View>

              {/* Comprobantes Asociados */}
              <Text style={styles.sectionTitle}>Comprobantes Vinculados</Text>
              {detalle.comprobantes.length === 0 ? (
                <View style={styles.emptyComprobantes}>
                  <Text style={styles.emptyComprobantesText}>
                    No hay comprobantes de transferencia registrados para esta cuota.
                  </Text>
                </View>
              ) : (
                detalle.comprobantes.map((comp) => (
                  <View key={comp.id} style={styles.compCard}>
                    <View style={styles.compHeader}>
                      <Text style={styles.compId}>Comp. #{comp.id}</Text>
                      <StatusBadge estado={comp.estado} />
                    </View>
                    <View style={styles.compBody}>
                      <Text style={styles.compDate}>Fecha: {comp.fechaPago}</Text>
                      <Text style={styles.compAmount}>{comp.importeFormateado}</Text>
                    </View>
                    {comp.motivoRechazo && (
                      <Text style={styles.rejectionReason}>
                        Motivo del rechazo: {comp.motivoRechazo}
                      </Text>
                    )}
                  </View>
                ))
              )}

              {/* Botón de Acción */}
              {detalle.estado !== "pagada" && onAdjuntarComprobante && (
                <Button
                  title="Adjuntar Nuevo Comprobante"
                  onPress={() => {
                    onClose();
                    onAdjuntarComprobante(detalle.id, detalle.saldoPendiente);
                  }}
                  style={styles.actionBtn}
                />
              )}

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  periodoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },
  alumnoSub: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
    marginTop: 12,
    marginBottom: 8,
  },
  breakdownBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  conceptName: {
    fontSize: 13,
    color: "#334155",
  },
  conceptAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  totalsBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: "#475569",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  saldoHighlight: {
    borderTopWidth: 1,
    borderTopColor: "#CBD5E1",
    marginTop: 6,
    paddingTop: 8,
  },
  saldoLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F172A",
  },
  saldoValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textSuccess: {
    color: "#15803D",
  },
  textDanger: {
    color: "#B91C1C",
  },
  emptyComprobantes: {
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    alignItems: "center",
  },
  emptyComprobantesText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  compCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  compHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  compId: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
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
  compBody: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  compDate: {
    fontSize: 12,
    color: "#64748B",
  },
  compAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  actionBtn: {
    marginTop: 16,
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  closeBtnText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
});
