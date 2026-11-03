# Backlog del Producto — Centro Educativo "Transformar para educar" (App Móvil)

**Metodología de Sistemas II** — MaTech Grupo 10  
Responsables: Fabio Ignacio Navarro & Maximiliano Joel Echeverría  
Duración Planificada: 6 Sprints semanales (44 días calendario / 90 horas hombre)

---

## 📊 Tablero de Estado General

| ID | Sprint | Historia de Usuario / Tarea | Prioridad | Estado | Responsables | DoD / Criterio de Aceptación |
| :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| **CHORE-01** | Sprint 1 | Configuración del entorno base, arquitectura y documentación (#1) | Alta | en revisión | Navarro / Echeverría | Expo TS configurado, AGENTS.md, ADRs, contratos y typecheck en verde |
| **HU_M01** | Sprint 1 | Iniciar y cerrar sesión en la app móvil con JWT | Alta | `pendiente` | Navarro / Echeverría | Token guardado en SecureStore, sesión persistente, guard por rol |
| **HU_M02** | Sprint 2 | Consultar listado de cuotas pendientes y por vencer | Alta | `pendiente` | Navarro / Echeverría | Filtro por hijos propios, indicadores de estado visual |
| **HU_M03** | Sprint 2 | Consultar historial completo de pagos | Media | `pendiente` | Navarro / Echeverría | Pagos ordenados por fecha, detalle con comprobantes |
| **HU_M04** | Sprint 3 | Cargar comprobante de transferencia (PDF/imagen) | Alta | `pendiente` | Navarro / Echeverría | Envío multipart, vinculación a factura, validación de formato |
| **HU_M05** | Sprint 4 | Consultar inscripciones a deportes, transporte y comedor | Media | `pendiente` | Navarro / Echeverría | Límite máx. 2 deportes, recorrido asignado y valores vigentes |
| **HU_M06** | Sprint 5 | Recibir notificación de factura mensual emitida | Alta | `pendiente` | Navarro / Echeverría | Tarea de fin de mes, cálculo discriminado, PDF adjunto |
| **HU_M07** | Sprint 5 | Recibir recordatorio automático de deuda (día 20) | Media | `pendiente` | Navarro / Echeverría | Tarea día 20, solo a tutores con deuda, monto pendiente |
| **HU_M08** | Sprint 6 | Consultar reportes de facturas por período (Tutor) | Media | `pendiente` | Navarro / Echeverría | Filtro de fechas, listado de comprobantes asociados |
| **HU_M09** | Sprint 6 | Consultar historial de deuda discriminado (Tutor) | Media | `pendiente` | Navarro / Echeverría | Desglose por concepto (cuota, deporte, transporte, comedor) |
| **HU_M10** | Sprint 6 | Consultar reportes administrativos móviles (Admin) | Alta | `pendiente` | Navarro / Echeverría | Ingresos del período, pagos completos e incompletos |

---

## 🗓️ Detalle de Sprints y Tareas Técnicas

### 🔹 Sprint 1 — Configuración y Autenticación Móvil (Semana 1)
- [ ] **CHORE-01:** Configuración del entorno móvil con Expo (TypeScript, React Navigation, SecureStore, Axios).
- [ ] **CHORE-02:** Diseño de wireframes y paleta institucional en Figma (Login y paneles por rol).
- [ ] **HU_M01:** Implementar pantalla de Login consumiendo `POST /api/auth/login/`.
- [ ] **HU_M01:** Almacenamiento seguro del token JWT en `expo-secure-store` y restauración de sesión.
- [ ] **HU_M01:** Implementar cierre de sesión (`POST /api/auth/logout/`) y reseteo de clave.
- [ ] **TEST-01:** Pruebas automatizadas de contrato API para login y guard de navegación.
- **DoD Sprint 1:** `HU_M01` completada y probada. Token JWT seguro. Sesión persistente funcional.

### 🔹 Sprint 2 — Módulo de Cuotas (Semana 2)
- [ ] **CHORE-03:** Diseño de wireframes del módulo de cuotas y tarjetas de estado.
- [ ] **HU_M02:** Consumo de `GET /api/cuotas/` con filtrado estricto por hijos del tutor.
- [ ] **HU_M02:** Visualización clara de estados con badges (`pendiente`, `parcial`, `pagada`, `vencida`).
- [ ] **HU_M03:** Pantalla de historial de pagos ordenados cronológicamente.
- [ ] **HU_M02:** Implementación de filtros por período en el cliente.
- **DoD Sprint 2:** `HU_M02` y `HU_M03` completadas. Cuotas e historial funcionales.

### 🔹 Sprint 3 — Carga de Comprobantes (Semana 3)
- [ ] **CHORE-04:** Wireframes de selector de comprobantes y vista previa.
- [ ] **HU_M04:** Integración de `expo-document-picker` y `expo-image-picker`.
- [ ] **HU_M04:** Consumo de `POST /api/comprobantes/` con envío multipart `{ uri, name, type }`.
- [ ] **HU_M04:** Asociación del comprobante a la factura correspondiente y confirmación visual.
- **DoD Sprint 3:** `HU_M04` completada. Subida de comprobantes operativa y validada.

### 🔹 Sprint 4 — Módulo de Servicios Extracurriculares (Semana 4)
- [ ] **CHORE-05:** Wireframes de visualización de servicios contratados.
- [ ] **HU_M05:** Consumo de `GET /api/servicios/inscripciones/`.
- [ ] **HU_M05:** Visualización de deportes asignados (validación de máx. 2) y sus aranceles.
- [ ] **HU_M05:** Visualización del recorrido de transporte escolar y estado de comedor.
- **DoD Sprint 4:** `HU_M05` completada. Consulta de servicios funcional.

### 🔹 Sprint 5 — Notificaciones y Recordatorios Automáticos (Semana 5)
- [ ] **CHORE-06:** Configuración de tareas programadas (management commands de Django).
- [ ] **HU_M06:** Generación de factura en PDF y envío automático por correo el último día hábil.
- [ ] **HU_M07:** Envío automático de recordatorio de deuda el día 20 del mes.
- [ ] **TEST-02:** Pruebas de ejecución de comandos y despacho de emails simulados.
- **DoD Sprint 5:** `HU_M06` y `HU_M07` completadas. Mails y facturas PDF operativas.

### 🔹 Sprint 6 — Reportes Móviles, Pruebas Integrales y Despliegue (Semana 6)
- [ ] **HU_M08:** Reporte de facturas y comprobantes por rango de fechas (Tutor).
- [ ] **HU_M09:** Historial de deuda discriminado por ítems (Tutor).
- [ ] **HU_M10:** Reportes administrativos móviles (Ingresos, recaudación, estados de deuda).
- [ ] **CHORE-07:** Pruebas integrales en emulador Android y dispositivo físico real.
- [ ] **CHORE-08:** Compilación de APK de vista previa mediante EAS Build (`eas build -p android`).
- [ ] **DOC-01:** Manual de usuario móvil y entrega final.
- **DoD Sprint 6:** 100% de las historias completadas. APK compilada y proyecto entregado.
