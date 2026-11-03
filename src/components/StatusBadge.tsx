import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EstadoCuota } from "../types/cuota";

interface StatusBadgeProps {
  estado: EstadoCuota;
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const config = getBadgeConfig(estado);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {config.label}
      </Text>
    </View>
  );
}

function getBadgeConfig(estado: EstadoCuota) {
  switch (estado) {
    case "pagada":
      return { label: "PAGADA", bg: "#DCFCE7", text: "#166534" };
    case "parcial":
      return { label: "PAGO PARCIAL", bg: "#FEF3C7", text: "#92400E" };
    case "vencida":
      return { label: "VENCIDA", bg: "#FEE2E2", text: "#991B1B" };
    case "pendiente":
    default:
      return { label: "PENDIENTE", bg: "#E0F2FE", text: "#075985" };
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
