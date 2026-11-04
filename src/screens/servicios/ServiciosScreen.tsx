import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { AlumnoServiciosModel } from "../../types/servicio";
import { serviciosService } from "../../services/serviciosService";
import { Card } from "../../components/Card";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";

export function ServiciosScreen() {
  const [servicios, setServicios] = useState<AlumnoServiciosModel[]>([]);
  const [selectedLegajo, setSelectedLegajo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadServicios() {
    try {
      setError(null);
      const data = await serviciosService.getInscripciones();
      setServicios(data);
      if (data.length > 0 && selectedLegajo === null) {
        setSelectedLegajo(data[0].alumnoLegajo);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "No se pudieron cargar los servicios extracurriculares. Verifique su conexión."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const data = await serviciosService.getInscripciones();
        if (isMounted) {
          setServicios(data);
          if (data.length > 0) {
            setSelectedLegajo(data[0].alumnoLegajo);
          }
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "No se pudieron cargar los servicios. Verifique su conexión."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void init();
    return () => {
      isMounted = false;
    };
  }, []);

  function onRefresh() {
    setRefreshing(true);
    void loadServicios();
  }

  const currentAlumno =
    servicios.find((s) => s.alumnoLegajo === selectedLegajo) || servicios[0];

  if (loading) {
    return <LoadingSpinner message="Consultando servicios extracurriculares..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Servicios Contratados</Text>
        <Text style={styles.subtitle}>
          Deportes, Transporte Escolar y Comedor Institucional
        </Text>
      </View>

      {error && <ErrorMessage message={error} />}

      {/* Selector de Alumno si hay más de 1 */}
      {servicios.length > 1 && (
        <View style={styles.alumnoSelector}>
          <Text style={styles.selectorLabel}>Alumno Seleccionado:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {servicios.map((s) => (
              <TouchableOpacity
                key={s.alumnoLegajo}
                style={[
                  styles.alumnoChip,
                  selectedLegajo === s.alumnoLegajo && styles.alumnoChipActive,
                ]}
                onPress={() => setSelectedLegajo(s.alumnoLegajo)}
              >
                <Text
                  style={[
                    styles.alumnoChipText,
                    selectedLegajo === s.alumnoLegajo && styles.alumnoChipTextActive,
                  ]}
                >
                  {s.alumnoNombre} ({s.alumnoCurso})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {currentAlumno ? (
        <>
          {/* Banner Resumen de Servicios */}
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryAlumnoName}>{currentAlumno.alumnoNombre}</Text>
              <Text style={styles.summaryTotalLabel}>Total Mensual en Servicios</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {currentAlumno.totalMensualServiciosFormateado}
            </Text>
          </View>

          {/* ⚽ Sección Deportes */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚽ Disciplinas Deportivas</Text>
              <View
                style={[
                  styles.cupoBadge,
                  currentAlumno.cantidadDeportes >= 2
                    ? styles.cupoMaximo
                    : styles.cupoNormal,
                ]}
              >
                <Text style={styles.cupoBadgeText}>
                  {currentAlumno.cantidadDeportes}/2 DEPORTES
                </Text>
              </View>
            </View>

            <Text style={styles.sectionRule}>
              Regla institucional: Máximo 2 disciplinas simultáneas con control de horarios.
            </Text>

            {currentAlumno.deportes.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Sin deportes inscriptos en este ciclo.</Text>
              </View>
            ) : (
              currentAlumno.deportes.map((dep) => (
                <View key={dep.id} style={styles.serviceItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{dep.nombre}</Text>
                    <Text style={styles.itemDetail}>🕒 {dep.horario}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{dep.montoMensualFormateado}</Text>
                </View>
              ))
            )}
          </Card>

          {/* 🚌 Sección Transporte Escolar */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🚌 Transporte Escolar</Text>
              {currentAlumno.transporte && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    {currentAlumno.transporte.estado.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionRule}>
              4 recorridos fijos institucionales. Servicio opcional y configurable mes a mes.
            </Text>

            {!currentAlumno.transporte ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Servicio de transporte no contratado.</Text>
              </View>
            ) : (
              <View style={styles.serviceItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{currentAlumno.transporte.recorrido}</Text>
                  <Text style={styles.itemDetail}>Asignación de parada y recorrido seguro</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {currentAlumno.transporte.montoMensualFormateado}
                </Text>
              </View>
            )}
          </Card>

          {/* 🍽️ Sección Comedor Escolar */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🍽️ Comedor Escolar</Text>
              {currentAlumno.comedor && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    {currentAlumno.comedor.estado.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionRule}>
              Servicio nutricional institucional con menú diario y colación saludable.
            </Text>

            {!currentAlumno.comedor ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Servicio de comedor no contratado.</Text>
              </View>
            ) : (
              <View style={styles.serviceItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {currentAlumno.comedor.detalleMenu || "Menú Nutricional Completo"}
                  </Text>
                  <Text style={styles.itemDetail}>Almuerzo supervisado por nutricionistas</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {currentAlumno.comedor.montoMensualFormateado}
                </Text>
              </View>
            )}
          </Card>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sin alumnos registrados</Text>
          <Text style={styles.emptyText}>
            No se encontraron alumnos asociados a este tutor.
          </Text>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
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
  alumnoSelector: {
    marginBottom: 14,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  alumnoChip: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  alumnoChipActive: {
    backgroundColor: "#1E3A8A",
  },
  alumnoChipText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  alumnoChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  summaryAlumnoName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  summaryTotalLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionRule: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 10,
  },
  cupoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cupoNormal: {
    backgroundColor: "#E0F2FE",
  },
  cupoMaximo: {
    backgroundColor: "#FEF3C7",
  },
  cupoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0369A1",
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  itemDetail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyBox: {
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
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
});
