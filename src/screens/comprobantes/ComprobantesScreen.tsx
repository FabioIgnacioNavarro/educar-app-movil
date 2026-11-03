import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export function ComprobantesScreen({ route }: any) {
  const facturaId = route.params?.facturaId;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carga de Comprobantes</Text>
        <Text style={styles.subtitle}>
          Adjunte su comprobante de transferencia bancaria
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Registrar Pago</Text>
        <Text style={styles.info}>
          {facturaId
            ? `Asociando a la Factura #${facturaId}`
            : "Seleccione una cuota o factura pendiente para asociar el comprobante."}
        </Text>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ Recuerde que solo se aceptan transferencias bancarias oficiales en formato PDF o imagen (JPG/PNG). El pago pasará a estado de validación administrativa.
          </Text>
        </View>

        <Button
          testID="btn-subir-comprobante"
          title="Seleccionar Archivo (PDF / Imagen)"
          variant="outline"
          onPress={() => {
            // Se implementará en Sprint 3 con expo-document-picker
          }}
          style={styles.selectButton}
        />
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
    padding: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 16,
  },
  noticeBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 13,
    color: "#166534",
    lineHeight: 18,
  },
  selectButton: {
    marginTop: 8,
  },
});
