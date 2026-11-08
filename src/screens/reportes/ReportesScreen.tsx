import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { reportesService } from "../../services/reportesService";
import {
  ReporteIngresosModel,
  PagoCompletoModel,
  PagoIncompletoModel,
  FacturaReporteModel,
  DeudaDiscriminadaModel,
  ReporteDesgloseFinancieroModel,
} from "../../types/reportes";

type AdminTab = "al_dia" | "morosos";
type TutorTab = "facturas" | "deuda";
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function ReportesScreen() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "Administrador";

  // Estados de Administrador (HU_M10)
  const [adminTab, setAdminTab] = useState<AdminTab>("morosos");
  const [reporteIngresos, setReporteIngresos] = useState<ReporteIngresosModel | null>(null);
  const [pagosCompletos, setPagosCompletos] = useState<PagoCompletoModel[]>([]);
  const [pagosIncompletos, setPagosIncompletos] = useState<PagoIncompletoModel[]>([]);
  const [desgloseFinanciero, setDesgloseFinanciero] = useState<ReporteDesgloseFinancieroModel | null>(null);
  const [mesAdmin, setMesAdmin] = useState(() => new Date().getMonth() + 1);
  const [anioAdmin, setAnioAdmin] = useState(() => new Date().getFullYear());

  // Estados de Tutor (HU_M08 y HU_M09)
  const [tutorTab, setTutorTab] = useState<TutorTab>("facturas");
  const [filtroPeriodoTutor, setFiltroPeriodoTutor] = useState<string>("3m");
  const [facturas, setFacturas] = useState<FacturaReporteModel[]>([]);
  const [deudaDiscriminada, setDeudaDiscriminada] = useState<DeudaDiscriminadaModel | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const loadData = useCallback(async (mes: number, anio: number) => {
    const requestId = ++latestRequestId.current;
    try {
      setError(null);
      setReporteIngresos(null);
      setPagosCompletos([]);
      setPagosIncompletos([]);
      setDesgloseFinanciero(null);
      setFacturas([]);
      setDeudaDiscriminada(null);
      if (isAdmin) {
        const [ingresos, completos, incompletos, desglose] = await Promise.all([
          reportesService.getReporteIngresos(mes, anio),
          reportesService.getPagosCompletos(mes, anio),
          reportesService.getPagosIncompletos(mes, anio),
          reportesService.getDesgloseFinanciero(mes, anio),
        ]);
        if (requestId !== latestRequestId.current) return;
        setReporteIngresos(ingresos);
        setPagosCompletos(completos);
        setPagosIncompletos(incompletos);
        setDesgloseFinanciero(desglose);
      } else {
        const [facturasList, deuda] = await Promise.all([
          reportesService.getFacturasTutor(),
          reportesService.getDeudaDiscriminada(),
        ]);
        if (requestId !== latestRequestId.current) return;
        setFacturas(facturasList);
        setDeudaDiscriminada(deuda);
      }
    } catch (err: any) {
      if (requestId === latestRequestId.current) {
        setError(
          err.response?.data?.detail ||
            "No se pudieron sincronizar los reportes. Verifique su conexión."
        );
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    const request = setTimeout(() => {
      void loadData(mesAdmin, anioAdmin);
    }, 0);
    return () => clearTimeout(request);
  }, [isAdmin, mesAdmin, anioAdmin, loadData]);

  function onRefresh() {
    setRefreshing(true);
    void loadData(mesAdmin, anioAdmin);
  }

  function cambiarPeriodoAdmin(desplazamiento: number) {
    const siguiente = new Date(anioAdmin, mesAdmin - 1 + desplazamiento, 1);
    setLoading(true);
    setMesAdmin(siguiente.getMonth() + 1);
    setAnioAdmin(siguiente.getFullYear());
  }

  function handleContactarTutor(item: PagoIncompletoModel) {
    Alert.alert(
      `Contacto con ${item.tutorNombre}`,
      `Alumno: ${item.alumnoNombre} (${item.alumnoCurso})\nSaldo pendiente: ${item.saldoPendienteFormateado}\n\nEmail: ${item.tutorEmail}\nTeléfono: ${item.tutorTelefono}`,
      [{ text: "Cerrar", style: "cancel" }]
    );
  }

  if (loading) {
    return <LoadingSpinner message="Generando métricas y reportes institucionales..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header General */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAdmin ? "Dashboard Administrativo" : "Reportes Financieros"}
        </Text>
        <Text style={styles.subtitle}>
          {isAdmin
            ? "Métricas institucionales de recaudación, cobro y morosidad"
            : "Historial consolidado de facturación y desglose de deuda"}
        </Text>
      </View>

      {isAdmin && (
        <View style={styles.periodSelector}>
          <Text style={styles.periodSelectorLabel}>Período del reporte</Text>
          <View style={styles.periodSelectorControls}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              style={styles.periodSelectorButton}
              onPress={() => cambiarPeriodoAdmin(-1)}
            >
              <Text style={styles.periodSelectorButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.periodSelectorValue}>
              {MESES[mesAdmin - 1]} {anioAdmin}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              style={styles.periodSelectorButton}
              onPress={() => cambiarPeriodoAdmin(1)}
            >
              <Text style={styles.periodSelectorButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error && <ErrorMessage message={error} />}

      {/* ========================================================================= */}
      {/* VISTA ROL ADMINISTRADOR (HU_M10) */}
      {/* ========================================================================= */}
      {isAdmin ? (
        <>
          {reporteIngresos && (
            <Card style={styles.kpiCard}>
              <View style={styles.periodoBadgeRow}>
                <Text style={styles.kpiPeriodoText}>
                  Período: {reporteIngresos.periodoNombre}
                </Text>
                <View style={styles.cobranzaBadge}>
                  <Text style={styles.cobranzaBadgeText}>
                    {reporteIngresos.porcentajeCobranza}% COBRADO
                  </Text>
                </View>
              </View>

              <View style={styles.kpiRow}>
                <View>
                    <Text style={styles.kpiLabel}>Total Recaudado</Text>
                  <Text style={styles.kpiAmountSuccess}>
                    {reporteIngresos.totalRecaudadoFormateado}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.kpiLabel}>Total Facturado</Text>
                  <Text style={styles.kpiAmountMuted}>
                    {reporteIngresos.totalFacturadoFormateado}
                  </Text>
                </View>
              </View>

              {/* Barra de Progreso de Cobranza */}
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, reporteIngresos.porcentajeCobranza)}%` },
                  ]}
                />
              </View>

              <View style={styles.kpiDivider} />

              <View style={styles.kpiSubdetailsRow}>
                <Text style={styles.kpiSubText}>
                  🏫 Cuota Base: {reporteIngresos.ingresosCuotaBaseFormateado}
                </Text>
                <Text style={styles.kpiSubText}>
                  ⚽ Servicios: {reporteIngresos.ingresosServiciosFormateado}
                </Text>
              </View>
              {reporteIngresos.cuotasSinDesglose > 0 && (
                <Text style={styles.unclassifiedNote}>
                  {reporteIngresos.cuotasSinDesglose} cuota(s) histórica(s), con {reporteIngresos.ingresosSinDesgloseFormateado} cobrado, no tienen desglose guardado.
                </Text>
              )}
            </Card>
          )}

          {desgloseFinanciero && (
            <Card style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Facturado y pagado por categoría</Text>
              {[
                { titulo: "Deportes", filas: desgloseFinanciero.deportes },
                { titulo: "Nivel educativo", filas: desgloseFinanciero.niveles },
                { titulo: "Horario", filas: desgloseFinanciero.horarios },
                { titulo: "Docente", filas: desgloseFinanciero.docentes },
                { titulo: "Recorrido", filas: desgloseFinanciero.recorridos },
              ].map((grupo) => (
                <View key={grupo.titulo} style={styles.breakdownSection}>
                  <Text style={styles.breakdownSectionTitle}>{grupo.titulo}</Text>
                  {grupo.filas.length > 0 ? grupo.filas.map((fila) => (
                    <View key={`${grupo.titulo}-${fila.nombre}`} style={styles.breakdownRow}>
                      <Text style={styles.breakdownName}>{fila.nombre}</Text>
                      <View style={styles.breakdownAmounts}>
                        <Text style={styles.breakdownAmount}>Facturado {fila.facturadoFormateado}</Text>
                        <Text style={styles.breakdownPaid}>Pagado {fila.pagadoFormateado}</Text>
                      </View>
                    </View>
                  )) : (
                    <Text style={styles.breakdownEmpty}>Sin movimientos con desglose en este período.</Text>
                  )}
                </View>
              ))}
              {desgloseFinanciero.cuotasSinDesglose > 0 && (
                <Text style={styles.unclassifiedNote}>
                  {desgloseFinanciero.cuotasSinDesglose} cuota(s) no tienen desglose histórico; no se atribuyeron a categorías.
                </Text>
              )}
            </Card>
          )}

          {/* Selector de Pestañas Admin */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                adminTab === "morosos" && styles.segmentButtonActiveDanger,
              ]}
              onPress={() => setAdminTab("morosos")}
            >
              <Text
                style={[
                  styles.segmentText,
                  adminTab === "morosos" && styles.segmentTextActiveDanger,
                ]}
              >
                Pagos Incompletos ({pagosIncompletos.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                adminTab === "al_dia" && styles.segmentButtonActiveSuccess,
              ]}
              onPress={() => setAdminTab("al_dia")}
            >
              <Text
                style={[
                  styles.segmentText,
                  adminTab === "al_dia" && styles.segmentTextActiveSuccess,
                ]}
              >
                Al Día ({pagosCompletos.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Listado Admin: Morosos */}
          {adminTab === "morosos" ? (
            <View>
              {!error && pagosIncompletos.length === 0 && (
                <Text style={styles.emptyState}>No hay pagos incompletos en este período.</Text>
              )}
              {pagosIncompletos.map((item) => (
                <Card key={item.id} style={styles.deudorCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.alumnoNombre}</Text>
                      <Text style={styles.itemSubtitle}>
                        {item.alumnoCurso} • Tutor: {item.tutorNombre}
                      </Text>
                    </View>
                    <View style={styles.dangerBadge}>
                      <Text style={styles.dangerBadgeText}>
                        DEBE {item.saldoPendienteFormateado}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.conceptosRow}>
                    <Text style={styles.conceptosLabel}>Conceptos:</Text>
                    {item.conceptosAdeudados.map((c, i) => (
                      <View key={i} style={styles.conceptoChip}>
                        <Text style={styles.conceptoChipText}>{c}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContactarTutor(item)}
                  >
                    <Text style={styles.contactButtonText}>📞 Contactar Familia</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          ) : (
            /* Listado Admin: Al Día */
            <View>
              {!error && pagosCompletos.length === 0 && (
                <Text style={styles.emptyState}>No hay pagos completos en este período.</Text>
              )}
              {pagosCompletos.map((item) => (
                <Card key={item.id} style={styles.alDiaCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.alumnoNombre}</Text>
                      <Text style={styles.itemSubtitle}>
                        {item.alumnoCurso} • Tutor: {item.tutorNombre}
                      </Text>
                    </View>
                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>PAGO COMPLETO</Text>
                    </View>
                  </View>
                  <View style={styles.alDiaFooter}>
                    <Text style={styles.alDiaDate}>
                      Cancelado el: {item.fechaCancelacion}
                    </Text>
                    <Text style={styles.alDiaAmount}>{item.montoTotalFormateado}</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </>
      ) : (
        /* ========================================================================= */
        /* VISTA ROL PADRE / TUTOR (HU_M08 y HU_M09) */
        /* ========================================================================= */
        <>
          {/* Selector de Pestañas Tutor */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                tutorTab === "facturas" && styles.segmentButtonActive,
              ]}
              onPress={() => setTutorTab("facturas")}
            >
              <Text
                style={[
                  styles.segmentText,
                  tutorTab === "facturas" && styles.segmentTextActive,
                ]}
              >
                Facturas por Período
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                tutorTab === "deuda" && styles.segmentButtonActive,
              ]}
              onPress={() => setTutorTab("deuda")}
            >
              <Text
                style={[
                  styles.segmentText,
                  tutorTab === "deuda" && styles.segmentTextActive,
                ]}
              >
                Discriminación de Deuda
              </Text>
            </TouchableOpacity>
          </View>

          {tutorTab === "facturas" ? (
            /* Subsección: Facturas por Período (HU_M08) */
            <View>
              {/* Filtro Rápido de Rango */}
              <View style={styles.filterBar}>
                <Text style={styles.filterBarLabel}>Rango:</Text>
                {["3m", "6m", "anio"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.filterChip,
                      filtroPeriodoTutor === p && styles.filterChipActive,
                    ]}
                    onPress={() => setFiltroPeriodoTutor(p)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filtroPeriodoTutor === p && styles.filterChipTextActive,
                      ]}
                    >
                      {p === "3m"
                        ? "Últimos 3 Meses"
                        : p === "6m"
                        ? "Semestre"
                        : "Ciclo 2026"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {facturas.map((fac) => (
                <Card key={fac.id} style={styles.facturaCard}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.facturaNumber}>{fac.numeroFactura}</Text>
                      <Text style={styles.facturaPeriodo}>
                        Período: {fac.periodo} • {fac.alumnoNombre}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.facturaBadge,
                        fac.saldo === 0 ? styles.badgeSuccess : styles.badgeWarning,
                      ]}
                    >
                      <Text
                        style={[
                          styles.facturaBadgeText,
                          fac.saldo === 0 ? styles.textSuccess : styles.textWarning,
                        ]}
                      >
                        {fac.saldo === 0 ? "PAGADA" : "PENDIENTE"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.facturaDivider} />

                  <View style={styles.facturaDetails}>
                    <Text style={styles.facturaDate}>Emisión: {fac.fechaEmision}</Text>
                    <Text style={styles.facturaAmount}>
                      Total: {fac.montoTotalFormateado}
                    </Text>
                  </View>

                  {fac.comprobantes.length > 0 && (
                    <View style={styles.facturaComprobantesBox}>
                      <Text style={styles.compBoxTitle}>Comprobantes vinculados:</Text>
                      {fac.comprobantes.map((c) => (
                        <Text key={c.id} style={styles.compBoxItem}>
                          • Recibo #{c.id} ({c.fechaPago}): {c.importeFormateado} [
                          {c.estado.toUpperCase()}]
                        </Text>
                      ))}
                    </View>
                  )}
                </Card>
              ))}
            </View>
          ) : (
            /* Subsección: Discriminación de Deuda (HU_M09) */
            <View>
              {deudaDiscriminada && (
                <>
                  <Card
                    style={[
                      styles.deudaBanner,
                      deudaDiscriminada.totalDeuda === 0
                        ? styles.bannerSuccess
                        : styles.bannerDanger,
                    ]}
                  >
                    <Text
                      style={[
                        styles.deudaBannerTitle,
                        deudaDiscriminada.totalDeuda === 0
                          ? styles.textSuccess
                          : styles.textDanger,
                      ]}
                    >
                      {deudaDiscriminada.totalDeuda === 0
                        ? "¡Su cuenta se encuentra al día!"
                        : "Saldo Deudor Consolidado"}
                    </Text>
                    <Text
                      style={[
                        styles.deudaBannerAmount,
                        deudaDiscriminada.totalDeuda === 0
                          ? styles.textSuccess
                          : styles.textDanger,
                      ]}
                    >
                      {deudaDiscriminada.totalDeudaFormateado}
                    </Text>
                  </Card>

                  {/* Desglose por Concepto */}
                  <Card style={styles.sectionCard}>
                    <Text style={styles.sectionHeaderTitle}>
                      📊 Desglose por Concepto Arancelario
                    </Text>

                    <View style={styles.conceptRow}>
                      <Text style={styles.conceptLabel}>Cuota Base Escolar:</Text>
                      <Text style={styles.conceptValue}>
                        {deudaDiscriminada.deudaCuotaBaseFormateada}
                      </Text>
                    </View>

                    <View style={styles.conceptRow}>
                      <Text style={styles.conceptLabel}>Disciplinas Deportivas:</Text>
                      <Text style={styles.conceptValue}>
                        {deudaDiscriminada.deudaDeportesFormateada}
                      </Text>
                    </View>

                    <View style={styles.conceptRow}>
                      <Text style={styles.conceptLabel}>Transporte Escolar:</Text>
                      <Text style={styles.conceptValue}>
                        {deudaDiscriminada.deudaTransporteFormateado}
                      </Text>
                    </View>

                    <View style={styles.conceptRow}>
                      <Text style={styles.conceptLabel}>Servicio de Comedor:</Text>
                      <Text style={styles.conceptValue}>
                        {deudaDiscriminada.deudaComedorFormateado}
                      </Text>
                    </View>
                  </Card>

                  {/* Desglose por Alumno */}
                  <Card style={styles.sectionCard}>
                    <Text style={styles.sectionHeaderTitle}>
                      🧒 Desglose por Alumno a Cargo
                    </Text>
                    {deudaDiscriminada.desgloseAlumnos.map((a) => (
                      <View key={a.alumnoLegajo} style={styles.alumnoDeudaBox}>
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.alumnoDeudaName}>{a.alumnoNombre}</Text>
                          <Text
                            style={[
                              styles.alumnoDeudaTotal,
                              a.subtotalDeuda > 0 ? styles.textDanger : styles.textSuccess,
                            ]}
                          >
                            {a.subtotalDeudaFormateado}
                          </Text>
                        </View>
                        <Text style={styles.alumnoDeudaCurso}>{a.alumnoCurso}</Text>
                      </View>
                    ))}
                  </Card>
                </>
              )}
            </View>
          )}
        </>
      )}

      <View style={{ height: 32 }} />
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
  periodSelector: {
    marginHorizontal: 0,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  periodSelectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  periodSelectorControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodSelectorButton: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  periodSelectorButtonText: {
    fontSize: 24,
    lineHeight: 28,
    color: "#1E3A8A",
    fontWeight: "700",
  },
  periodSelectorValue: {
    fontSize: 16,
    color: "#1E3A8A",
    fontWeight: "700",
  },
  emptyState: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },
  breakdownCard: {
    marginBottom: 16,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  breakdownSection: {
    marginTop: 8,
  },
  breakdownSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  breakdownRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  breakdownName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  breakdownAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  breakdownAmount: {
    fontSize: 12,
    color: "#64748B",
  },
  breakdownPaid: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
  },
  breakdownEmpty: {
    fontSize: 12,
    color: "#64748B",
    paddingVertical: 4,
  },
  unclassifiedNote: {
    fontSize: 12,
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 9,
    marginTop: 10,
  },
  kpiCard: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  periodoBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  kpiPeriodoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  cobranzaBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cobranzaBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  kpiLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  kpiAmountSuccess: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#15803D",
  },
  kpiAmountMuted: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1E3A8A",
    borderRadius: 4,
  },
  kpiDivider: {
    height: 1,
    backgroundColor: "#DBEAFE",
    marginVertical: 10,
  },
  kpiSubdetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  kpiSubText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  segmentButtonActiveDanger: {
    backgroundColor: "#FEE2E2",
    elevation: 2,
  },
  segmentButtonActiveSuccess: {
    backgroundColor: "#DCFCE7",
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  segmentTextActive: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
  segmentTextActiveDanger: {
    color: "#991B1B",
    fontWeight: "700",
  },
  segmentTextActiveSuccess: {
    color: "#166534",
    fontWeight: "700",
  },
  deudorCard: {
    marginBottom: 10,
    borderColor: "#FECACA",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  alDiaCard: {
    marginBottom: 10,
    borderColor: "#BBF7D0",
    borderLeftWidth: 4,
    borderLeftColor: "#16A34A",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  dangerBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dangerBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#991B1B",
  },
  successBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  successBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  conceptosRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 4,
  },
  conceptosLabel: {
    fontSize: 11,
    color: "#64748B",
    marginRight: 4,
  },
  conceptoChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conceptoChipText: {
    fontSize: 11,
    color: "#475569",
  },
  contactButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },
  alDiaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  alDiaDate: {
    fontSize: 12,
    color: "#64748B",
  },
  alDiaAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  filterBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#1E3A8A",
  },
  filterChipText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  facturaCard: {
    marginBottom: 10,
  },
  facturaNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  facturaPeriodo: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  facturaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: "#DCFCE7",
  },
  badgeWarning: {
    backgroundColor: "#FEF3C7",
  },
  facturaBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  textSuccess: {
    color: "#15803D",
  },
  textWarning: {
    color: "#92400E",
  },
  textDanger: {
    color: "#B91C1C",
  },
  facturaDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  facturaDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  facturaDate: {
    fontSize: 12,
    color: "#64748B",
  },
  facturaAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  facturaComprobantesBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
  },
  compBoxTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 2,
  },
  compBoxItem: {
    fontSize: 11,
    color: "#64748B",
  },
  deudaBanner: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  bannerSuccess: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  bannerDanger: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deudaBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  deudaBannerAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  conceptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  conceptLabel: {
    fontSize: 13,
    color: "#475569",
  },
  conceptValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  alumnoDeudaBox: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  alumnoDeudaName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  alumnoDeudaTotal: {
    fontSize: 14,
    fontWeight: "700",
  },
  alumnoDeudaCurso: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});

