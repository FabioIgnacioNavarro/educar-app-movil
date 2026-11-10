import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  notificacionesService,
  ResultadoSimulacionNotificacion,
  TipoNotificacionPrueba,
} from "../../services/notificacionesService";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function SimulacionNotificacionesScreen() {
  const hoy = new Date();
  const [tipo, setTipo] = useState<TipoNotificacionPrueba>("factura");
  const [mes, setMes] = useState(String(hoy.getMonth() + 1));
  const [anio, setAnio] = useState(String(hoy.getFullYear()));
  const [legajo, setLegajo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoSimulacionNotificacion | null>(null);

  async function enviarPrueba() {
    const mesNumero = Number(mes);
    const anioNumero = Number(anio);
    const legajoNumero = Number(legajo);
    if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
      setError("Ingresá un mes entre 1 y 12.");
      return;
    }
    if (!Number.isInteger(anioNumero) || anioNumero < 2000 || anioNumero > 9999) {
      setError("Ingresá un año válido.");
      return;
    }
    if (!Number.isInteger(legajoNumero) || legajoNumero <= 0) {
      setError("Ingresá el legajo del alumno que querés usar como ejemplo.");
      return;
    }

    setError(null);
    setResultado(null);
    setEnviando(true);
    try {
      const envio = await notificacionesService.simular({
        tipo,
        mes: mesNumero,
        anio: anioNumero,
        legajo: legajoNumero,
      });
      setResultado(envio);
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { detail?: string } };
      };
      setError(
        apiError.response?.data?.detail ||
          "No se pudo enviar el correo de prueba. Revisá la conexión y la configuración del servidor."
      );
    } finally {
      setEnviando(false);
    }
  }

  function elegirTipo(nuevoTipo: TipoNotificacionPrueba) {
    setTipo(nuevoTipo);
    setResultado(null);
    setError(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Prueba de notificaciones</Text>
      <Text style={styles.subtitle}>
        Simulá los correos programados sin esperar al día 20 ni al cierre de mes.
      </Text>

      <Card>
        <Text style={styles.sectionTitle}>Tipo de correo</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: tipo === "factura" }}
            onPress={() => elegirTipo("factura")}
            style={[styles.typeButton, tipo === "factura" && styles.typeButtonSelected]}
          >
            <Text style={[styles.typeButtonText, tipo === "factura" && styles.typeButtonTextSelected]}>
              Factura de fin de mes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: tipo === "recordatorio" }}
            onPress={() => elegirTipo("recordatorio")}
            style={[styles.typeButton, tipo === "recordatorio" && styles.typeButtonSelected]}
          >
            <Text style={[styles.typeButtonText, tipo === "recordatorio" && styles.typeButtonTextSelected]}>
              Deuda del día 20
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.periodRow}>
          <View style={styles.periodField}>
            <Text style={styles.label}>Mes (1–12)</Text>
            <TextInput
              accessibilityLabel="Mes"
              keyboardType="number-pad"
              maxLength={2}
              onChangeText={setMes}
              style={styles.input}
              value={mes}
            />
          </View>
          <View style={styles.periodField}>
            <Text style={styles.label}>Año</Text>
            <TextInput
              accessibilityLabel="Año"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={setAnio}
              style={styles.input}
              value={anio}
            />
          </View>
        </View>

        <Text style={styles.label}>Legajo del alumno de ejemplo</Text>
        <TextInput
          accessibilityLabel="Legajo del alumno"
          keyboardType="number-pad"
          onChangeText={setLegajo}
          placeholder="Ej.: 31"
          style={styles.input}
          value={legajo}
        />

        <Text style={styles.notice}>
          Se enviará una sola copia a maxecheverri9@gmail.com.
          {tipo === "factura" ? " La copia incluye el PDF de factura." : " El recordatorio resume las deudas del tutor asociado al alumno."}
        </Text>

        {error && <ErrorMessage message={error} />}
        {resultado && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Correo de prueba enviado</Text>
            <Text style={styles.resultText}>{resultado.detail}</Text>
            <Text style={styles.resultText}>Destino: {resultado.destinatario}</Text>
            <Text style={styles.resultText}>Alumno de referencia: {resultado.alumno}</Text>
            <Text style={styles.resultText}>Período: {resultado.periodo}</Text>
            {resultado.total && <Text style={styles.resultText}>Total: ${resultado.total}</Text>}
          </View>
        )}

        <Button
          title="Enviar correo de prueba"
          onPress={() => {
            Alert.alert(
              "Enviar correo de prueba",
              `Se enviará un correo a maxecheverri9@gmail.com simulando el envío de ${tipo === "factura" ? "la factura de fin de mes" : "el recordatorio del día 20"} para el mes ${MESES[Number(mes) - 1]} de ${anio}.`,
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Enviar", onPress: () => void enviarPrueba() },
              ]
            );
          }}
          loading={enviando}
          style={styles.sendButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 16, paddingBottom: 28 },
  title: { color: "#0F172A", fontSize: 24, fontWeight: "800", marginTop: 12 },
  subtitle: { color: "#64748B", fontSize: 15, lineHeight: 21, marginTop: 6, marginBottom: 12 },
  sectionTitle: { color: "#1E3A8A", fontSize: 17, fontWeight: "700", marginBottom: 12 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  typeButton: { flex: 1, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, padding: 11, alignItems: "center" },
  typeButtonSelected: { backgroundColor: "#1E3A8A", borderColor: "#1E3A8A" },
  typeButtonText: { color: "#334155", fontSize: 13, fontWeight: "600", textAlign: "center" },
  typeButtonTextSelected: { color: "#FFFFFF" },
  periodRow: { flexDirection: "row", gap: 12 },
  periodField: { flex: 1 },
  label: { color: "#334155", fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1", borderRadius: 8, borderWidth: 1, color: "#0F172A", fontSize: 16, paddingHorizontal: 12, paddingVertical: 11 },
  notice: { backgroundColor: "#EFF6FF", borderRadius: 8, color: "#1E3A8A", fontSize: 13, lineHeight: 19, marginTop: 18, padding: 12 },
  successBox: { backgroundColor: "#ECFDF5", borderColor: "#86EFAC", borderRadius: 8, borderWidth: 1, marginTop: 14, padding: 12 },
  successTitle: { color: "#166534", fontSize: 15, fontWeight: "700", marginBottom: 5 },
  resultText: { color: "#14532D", fontSize: 13, lineHeight: 19 },
  sendButton: { marginTop: 18 },
});
