import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import { ComprobanteUploadFile } from "../../types/cuota";
import { cuotasService } from "../../services/cuotasService";

export function ComprobantesScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const cuotaId: number | undefined = route.params?.cuotaId;
  const periodo: string | undefined = route.params?.periodo;
  const alumnoNombre: string | undefined = route.params?.alumnoNombre;
  const saldo: number | undefined = route.params?.saldo;
  const [archivo, setArchivo] = useState<ComprobanteUploadFile | null>(null);
  const [importe, setImporte] = useState(saldo ? String(saldo) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function seleccionarPDF() {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const type = asset.mimeType || mimeFromName(asset.name);
    if (!isAllowedType(type)) {
      setError("El archivo debe ser un PDF, JPG o PNG.");
      return;
    }
    setArchivo({ uri: asset.uri, name: asset.name, type });
  }

  async function seleccionarImagen() {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const name = asset.fileName || `comprobante-${Date.now()}.jpg`;
    const type = asset.mimeType || mimeFromName(name) || "image/jpeg";
    if (!isAllowedType(type)) {
      setError("La imagen debe estar en formato JPG o PNG. También podés adjuntar un PDF.");
      return;
    }
    setArchivo({ uri: asset.uri, name, type });
  }

  async function enviarComprobante() {
    setError(null);
    const numericImporte = Number(importe.replace(",", "."));
    if (!cuotaId) {
      setError("Volvé a Cuotas y seleccioná la cuota a pagar.");
      return;
    }
    if (!archivo) {
      setError("Seleccioná el comprobante de pago antes de enviarlo.");
      return;
    }
    if (!Number.isFinite(numericImporte) || numericImporte <= 0) {
      setError("Ingresá un importe válido mayor que cero.");
      return;
    }
    if (saldo !== undefined && numericImporte > saldo) {
      setError(`El importe no puede superar el saldo de ${formatCurrency(saldo)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await cuotasService.uploadComprobante({
        cuotaId,
        importe: numericImporte,
        archivo,
      });
      Alert.alert("Comprobante enviado", response.mensaje, [
        { text: "Aceptar", onPress: () => navigation.navigate("Cuotas") },
      ]);
      setArchivo(null);
      setImporte("");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "No se pudo enviar el comprobante. Revisá tu conexión e intentá otra vez."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (user?.rol === "Administrador") {
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
            {saldo !== undefined && (
              <Text style={styles.balance}>Saldo pendiente: {formatCurrency(saldo)}</Text>
            )}

            <Text style={styles.label}>Importe transferido</Text>
            <TextInput
              accessibilityLabel="Importe transferido"
              keyboardType="decimal-pad"
              placeholder="Ej.: 15000,00"
              value={importe}
              onChangeText={setImporte}
              style={styles.input}
            />

            <Text style={styles.label}>Archivo</Text>
            <Text style={styles.fileName} numberOfLines={2}>
              {archivo?.name || "Todavía no seleccionaste un comprobante"}
            </Text>
            <Button
              testID="btn-subir-comprobante"
              title="Elegir PDF o imagen"
              variant="outline"
              onPress={() => void seleccionarPDF()}
              style={styles.button}
            />
            <Button
              title="Elegir foto de la galería"
              variant="outline"
              onPress={() => void seleccionarImagen()}
              style={styles.button}
            />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Se aceptan archivos PDF, JPG y PNG. El pago quedará pendiente de revisión administrativa.
              </Text>
            </View>
            {error && <ErrorMessage message={error} />}
            <Button
              title="Enviar comprobante"
              onPress={() => void enviarComprobante()}
              loading={submitting}
              disabled={!archivo}
              style={styles.submitButton}
            />
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>Seleccioná una cuota</Text>
            <Text style={styles.info}>
              Para asociar el pago de forma segura, primero elegí la cuota desde el listado.
            </Text>
            <Button
              title="Ir a Mis Cuotas"
              onPress={() => navigation.navigate("Cuotas")}
            />
          </>
        )}
      </Card>
    </ScrollView>
  );
}

function mimeFromName(name: string): string {
  const extension = name.toLowerCase().split(".").pop();
  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function isAllowedType(type: string): boolean {
  return ["application/pdf", "image/jpeg", "image/png"].includes(type.toLowerCase());
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
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
  input: {
    borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 11, backgroundColor: "#FFFFFF", color: "#0F172A", fontSize: 15,
  },
  fileName: { color: "#475569", fontSize: 13, marginBottom: 4 },
  button: { marginTop: 9 },
  noticeBox: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 8, padding: 12, marginTop: 16 },
  noticeText: { color: "#166534", fontSize: 13, lineHeight: 18 },
  submitButton: { marginTop: 16 },
});
