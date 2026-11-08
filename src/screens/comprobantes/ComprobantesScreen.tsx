import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { isAxiosError } from "axios";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ComprobanteUploadFile } from "../../types/comprobantes";
import { comprobantesService } from "../../services/comprobantesService";
import { MainTabParamList } from "../../types/navigation";
import { formatCurrency } from "../../utils/formatters";
import { cuotasService } from "../../services/cuotasService";
import type { DetalleCuotaModel } from "../../types/cuota";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

type ComprobantesScreenProps = BottomTabScreenProps<MainTabParamList, "Comprobantes">;

export function ComprobantesScreen({ route, navigation }: ComprobantesScreenProps) {
  const cuotaId: number | undefined = route.params?.cuotaId;
  const periodo: string | undefined = route.params?.periodo;
  const alumnoNombre: string | undefined = route.params?.alumnoNombre;
  const saldo: number | undefined = route.params?.saldo;
  const [archivo, setArchivo] = useState<ComprobanteUploadFile | null>(null);
  const [detalle, setDetalle] = useState<DetalleCuotaModel | null>(null);
  const [conceptosSeleccionados, setConceptosSeleccionados] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detalleActual = detalle?.id === cuotaId ? detalle : null;
  const cargandoDetalle = Boolean(cuotaId && !detalleActual && !error);
  const conceptosPago = useMemo(
    () => detalleActual?.conceptosPago ?? [],
    [detalleActual]
  );
  const importeSeleccionado = useMemo(
    () => conceptosPago
      .filter((concepto) => conceptosSeleccionados.includes(concepto.clave))
      .reduce((total, concepto) => total + Math.round(concepto.saldoDisponible * 100), 0) / 100,
    [conceptosPago, conceptosSeleccionados]
  );

  useEffect(() => {
    if (!cuotaId) {
      return;
    }
    let activo = true;
    Promise.resolve()
      .then(() => {
        if (!activo) return null;
        setError(null);
        return cuotasService.getCuotaById(cuotaId);
      })
      .then((data) => {
        if (activo && data) {
          setDetalle(data);
          setConceptosSeleccionados([]);
        }
      })
      .catch(() => {
        if (activo) setError("No se pudo cargar el desglose de la cuota. Volvé a Cuotas y actualizá el listado.");
      });
    return () => { activo = false; };
  }, [cuotaId]);

  function alternarConcepto(clave: string) {
    setConceptosSeleccionados((actuales) => actuales.includes(clave)
      ? actuales.filter((actual) => actual !== clave)
      : [...actuales, clave]);
  }

  function aceptarArchivo(file: ComprobanteUploadFile) {
    const normalizedType = file.type.toLowerCase();
    if (!ACCEPTED_TYPES.includes(normalizedType)) {
      setError("El archivo debe ser PDF, JPG o PNG.");
      return;
    }
    if (file.size !== undefined && file.size > MAX_FILE_SIZE_BYTES) {
      setError("El archivo supera el tamaño máximo de 5 MB.");
      return;
    }
    setError(null);
    setArchivo(file);
  }

  async function seleccionarPDF() {
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      aceptarArchivo({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || mimeFromName(asset.name),
        size: asset.size,
      });
    } catch {
      setError("No se pudo abrir el selector de archivos. Intentá nuevamente.");
    }
  }

  async function seleccionarImagen() {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const name = asset.fileName || `comprobante-${Date.now()}.jpg`;
      aceptarArchivo({
        uri: asset.uri,
        name,
        type: asset.mimeType || mimeFromName(name),
        size: asset.fileSize,
      });
    } catch {
      setError("No se pudo abrir la galería. Revisá los permisos e intentá nuevamente.");
    }
  }

  async function tomarFoto() {
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError("Necesitamos permiso para usar la cámara y fotografiar el comprobante.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const name = asset.fileName || `comprobante-${Date.now()}.jpg`;
      aceptarArchivo({
        uri: asset.uri,
        name,
        type: asset.mimeType || mimeFromName(name),
        size: asset.fileSize,
      });
    } catch {
      setError("No se pudo abrir la cámara. Revisá los permisos e intentá nuevamente.");
    }
  }

  async function enviarComprobante() {
    setError(null);
    if (!cuotaId) {
      setError("Volvé a Cuotas y seleccioná la cuota a pagar.");
      return;
    }
    if (!archivo) {
      setError("Seleccioná el comprobante de pago antes de enviarlo.");
      return;
    }
    if (conceptosSeleccionados.length === 0 || importeSeleccionado <= 0) {
      setError("Seleccioná al menos un concepto con saldo pendiente.");
      return;
    }
    const saldoCuota = detalleActual?.saldoPendiente ?? saldo;
    if (saldoCuota !== undefined && importeSeleccionado > saldoCuota) {
      setError(`La selección supera el saldo pendiente de ${formatCurrency(saldoCuota)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await comprobantesService.upload({
        cuotaId,
        importe: importeSeleccionado,
        conceptosSeleccionados,
        archivo,
      });
      Alert.alert("Comprobante enviado", response.mensaje, [
        { text: "Aceptar", onPress: () => navigation.navigate("Cuotas") },
      ]);
      setArchivo(null);
      setConceptosSeleccionados([]);
    } catch (err: unknown) {
      const detail = isAxiosError<{ detail?: string }>(err)
        ? err.response?.data?.detail
        : undefined;
      setError(detail || "No se pudo enviar el comprobante. Revisá tu conexión e intentá otra vez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Carga de comprobantes</Text>
        <Text style={styles.subtitle}>
          Adjuntá el comprobante de tu transferencia bancaria.
        </Text>
      </View>

      <Card style={styles.card}>
        {cuotaId ? (
          <>
            <Text style={styles.cardTitle}>Registrar pago</Text>
            <Text style={styles.info}>
              {periodo ? `${periodo} · ` : ""}{alumnoNombre || "Cuota seleccionada"}
            </Text>
            {(detalleActual?.saldoPendiente ?? saldo) !== undefined && (
              <Text style={styles.balance}>Saldo pendiente: {formatCurrency(detalleActual?.saldoPendiente ?? saldo ?? 0)}</Text>
            )}

            <Text style={styles.label}>Elegí qué conceptos pagar</Text>
            <Text style={styles.info}>
              Cada concepto se paga por su saldo completo. Podés elegir uno o varios.
            </Text>
            {cargandoDetalle ? (
              <View style={styles.progress}>
                <ActivityIndicator color="#1E3A8A" />
                <Text style={styles.progressText}>Cargando conceptos…</Text>
              </View>
            ) : conceptosPago.length === 0 ? (
              <Text style={styles.emptyConcepts}>Esta cuota no tiene un desglose disponible para seleccionar.</Text>
            ) : (
              <View style={styles.conceptsList}>
                {conceptosPago.map((concepto) => {
                  const disponible = concepto.saldoDisponible > 0;
                  const seleccionado = conceptosSeleccionados.includes(concepto.clave);
                  const estadoConcepto = concepto.bloqueadoPorRevision
                    ? "En revisión"
                    : concepto.montoEnRevision > 0
                      ? "En revisión"
                      : disponible
                        ? "Pendiente"
                        : "Pagado";
                  return (
                    <TouchableOpacity
                      key={concepto.clave}
                      testID={`concepto-${concepto.clave}`}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${concepto.concepto}, ${formatCurrency(concepto.saldoDisponible)} disponible`}
                      accessibilityState={{ checked: seleccionado, disabled: !disponible }}
                      disabled={!disponible}
                      onPress={() => alternarConcepto(concepto.clave)}
                      style={[
                        styles.conceptRow,
                        seleccionado && styles.conceptRowSelected,
                        !disponible && styles.conceptRowDisabled,
                      ]}
                    >
                      <View style={[styles.checkbox, seleccionado && styles.checkboxSelected]}>
                        {seleccionado && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.conceptText}>
                        <Text style={styles.conceptName}>{concepto.concepto}</Text>
                        <Text style={styles.conceptStatus}>{estadoConcepto}</Text>
                      </View>
                      <Text style={styles.conceptAmount}>
                        {formatCurrency(concepto.saldoDisponible)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={styles.selectedTotal}>
              <Text style={styles.selectedTotalLabel}>Total seleccionado</Text>
              <Text testID="total-conceptos-seleccionados" style={styles.selectedTotalAmount}>
                {formatCurrency(importeSeleccionado)}
              </Text>
            </View>

            <Text style={styles.label}>Comprobante</Text>
            <Button
              testID="btn-subir-comprobante"
              title="Seleccionar archivo PDF"
              variant="outline"
              onPress={() => void seleccionarPDF()}
              style={styles.button}
            />
            <Button
              title="Elegir imagen de la galería"
              variant="outline"
              onPress={() => void seleccionarImagen()}
              style={styles.button}
            />
            <Button
              title="Tomar foto del comprobante"
              variant="outline"
              onPress={() => void tomarFoto()}
              style={styles.button}
            />

            {archivo && (
              <View style={styles.preview}>
                {archivo.type.startsWith("image/") ? (
                  <Image source={{ uri: archivo.uri }} style={styles.previewImage} resizeMode="contain" />
                ) : (
                  <View style={styles.pdfPreview}>
                    <Text style={styles.pdfIcon}>PDF</Text>
                  </View>
                )}
                <Text style={styles.fileName} numberOfLines={2}>{archivo.name}</Text>
                <Text style={styles.fileMeta}>
                  {archivo.size !== undefined ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB · ` : ""}
                  Vista previa antes del envío
                </Text>
              </View>
            )}

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Se aceptan PDF, JPG y PNG de hasta 5 MB. Al enviarlo, el comprobante queda en revisión administrativa.
              </Text>
            </View>
            {error && <ErrorMessage message={error} />}
            <Button
              title="Enviar comprobante"
              onPress={() => void enviarComprobante()}
              loading={submitting}
              disabled={!archivo || !detalleActual || cargandoDetalle || !conceptosSeleccionados.length || importeSeleccionado <= 0}
              style={styles.submitButton}
            />
            {submitting && (
              <View style={styles.progress}>
                <ActivityIndicator color="#1E3A8A" />
                <Text style={styles.progressText}>Enviando comprobante…</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>Seleccioná una cuota</Text>
            <Text style={styles.info}>
              Para asociar el pago correctamente, primero elegí una cuota desde el listado.
            </Text>
            <Button title="Ir a Mis Cuotas" onPress={() => navigation.navigate("Cuotas")} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

export function AdminComprobantesScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Revisión de comprobantes</Text>
        <Text style={styles.info}>
          La revisión y aprobación administrativa de pagos se realiza desde el panel web.
        </Text>
      </Card>
    </View>
  );
}

function mimeFromName(name: string): string {
  const extension = name.toLowerCase().split(".").pop();
  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 3 },
  card: { padding: 20 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B", marginBottom: 8 },
  info: { fontSize: 14, color: "#475569", marginBottom: 12, lineHeight: 20 },
  balance: { fontSize: 15, color: "#1E3A8A", fontWeight: "700", marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 8 },
  conceptsList: { gap: 9, marginBottom: 8 },
  conceptRow: {
    flexDirection: "row", alignItems: "center", padding: 12, gap: 10,
    borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, backgroundColor: "#FFFFFF",
  },
  conceptRowSelected: { borderColor: "#1E3A8A", backgroundColor: "#EFF6FF" },
  conceptRowDisabled: { backgroundColor: "#F1F5F9", opacity: 0.75 },
  checkbox: {
    width: 22, height: 22, borderWidth: 1, borderColor: "#94A3B8", borderRadius: 5,
    alignItems: "center", justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: "#1E3A8A", borderColor: "#1E3A8A" },
  checkmark: { color: "#FFFFFF", fontWeight: "800", fontSize: 14, lineHeight: 18 },
  conceptText: { flex: 1 },
  conceptName: { color: "#1E293B", fontSize: 14, fontWeight: "700" },
  conceptStatus: { color: "#64748B", fontSize: 12, marginTop: 3 },
  conceptAmount: { color: "#0F172A", fontSize: 14, fontWeight: "700" },
  selectedTotal: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12, marginBottom: 6, borderTopWidth: 1, borderColor: "#E2E8F0",
  },
  selectedTotalLabel: { color: "#334155", fontSize: 14, fontWeight: "700" },
  selectedTotalAmount: { color: "#1E3A8A", fontSize: 16, fontWeight: "800" },
  emptyConcepts: { color: "#92400E", backgroundColor: "#FEF3C7", padding: 12, borderRadius: 8, fontSize: 13 },
  button: { marginTop: 9 },
  preview: {
    alignItems: "center", backgroundColor: "#F1F5F9", borderColor: "#CBD5E1",
    borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 14,
  },
  previewImage: { width: "100%", height: 190, backgroundColor: "#E2E8F0", borderRadius: 6 },
  pdfPreview: {
    width: 90, height: 110, alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFFFFF", borderColor: "#CBD5E1", borderWidth: 1, borderRadius: 8,
  },
  pdfIcon: { fontSize: 22, fontWeight: "800", color: "#DC2626" },
  fileName: { color: "#334155", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 9 },
  fileMeta: { color: "#64748B", fontSize: 11, marginTop: 3 },
  noticeBox: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 8, padding: 12, marginTop: 16 },
  noticeText: { color: "#166534", fontSize: 13, lineHeight: 18 },
  submitButton: { marginTop: 16 },
  progress: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 },
  progressText: { color: "#475569", fontSize: 12 },
});
