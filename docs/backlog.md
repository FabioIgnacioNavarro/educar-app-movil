# Backlog del Producto — Centro Educativo "Transformar para educar" (App Móvil)

**Metodología de Sistemas II** — MaTech Grupo 10  
Responsables: Fabio Ignacio Navarro & Maximiliano Joel Echeverría  
Duración Planificada: 6 Sprints semanales (44 días calendario / 90 horas hombre)

---

## 📊 Tablero de Estado General

| ID | Sprint | Historia de Usuario / Tarea | Prioridad | Estado | Responsables | DoD / Criterio de Aceptación |
| :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| **CHORE-01** | Sprint 1 | Configuración del entorno base, arquitectura y documentación (#1) | Alta | `terminado` | Navarro / Echeverría | Expo TS configurado, AGENTS.md, ADRs, contratos y typecheck en verde |
| **FIX-01** | Sprint 1 | Corregir incompatibilidad de react-native-gesture-handler (#4) | Alta | `terminado` | Navarro / Echeverría | Versiones nativas fijadas con expo install, expo-doctor 20/20 |
| **HU_M01** | Sprint 1 | Iniciar y cerrar sesión en la app móvil con JWT (#3) | Alta | `terminado` | Navarro / Echeverría | Token en SecureStore, sesión persistente, guard por rol, verificado en dispositivo real |
| **HU_M02** | Sprint 2 & 3 | Consultar listado de cuotas pendientes y por vencer (#7) | Alta | `pendiente` | Navarro | Filtro por hijos propios, badges de estado visual, detalle de cuota |
| **HU_M03** | Sprint 2 & 3 | Consultar historial completo de pagos (#8) | Media | `pendiente` | Navarro | Pagos ordenados por fecha, desglose de montos y comprobantes asociados |
| **HU_M04** | Sprint 2 & 3 | Cargar comprobante de transferencia (PDF/imagen) (#9) | Alta | `pendiente` | Echeverría | Envío multipart `{ uri, name, type }`, vinculación a factura y validación de formato |
| **HU_M05** | Sprint 4 | Consultar inscripciones a deportes, transporte y comedor | Media | `pendiente` | Navarro / Echeverría | Límite máx. 2 deportes, recorrido asignado y valores vigentes |
| **HU_M06** | Sprint 5 | Recibir notificación de factura mensual emitida | Alta | `pendiente` | Navarro / Echeverría | Tarea de fin de mes, cálculo discriminado, PDF adjunto |
| **HU_M07** | Sprint 5 | Recibir recordatorio automático de deuda (día 20) | Media | `pendiente` | Navarro / Echeverría | Tarea día 20, solo a tutores con deuda, monto pendiente |
| **HU_M08** | Sprint 6 | Consultar reportes de facturas por período (Tutor) | Media | `pendiente` | Navarro / Echeverría | Filtro de fechas, listado de comprobantes asociados |
| **HU_M09** | Sprint 6 | Consultar historial de deuda discriminado (Tutor) | Media | `pendiente` | Navarro / Echeverría | Desglose por concepto (cuota, deporte, transporte, comedor) |
| **HU_M10** | Sprint 6 | Consultar reportes administrativos móviles (Admin) | Alta | `pendiente` | Navarro / Echeverría | Ingresos del período, pagos completos e incompletos |

---

## 🗓️ Detalle de Sprints y Tareas Técnicas

### 🔹 Sprint 1 — Configuración y Autenticación Móvil (Semana 1) [TERMINADO]
- [x] **CHORE-01:** Configuración del entorno móvil con Expo (TypeScript, React Navigation, SecureStore, Axios).
- [x] **CHORE-02:** Diseño de wireframes y paleta institucional en Figma (Login y paneles por rol).
- [x] **HU_M01:** Implementar pantalla de Login consumiendo `POST /api/auth/login/`.
- [x] **HU_M01:** Almacenamiento seguro del token JWT en `expo-secure-store` y restauración de sesión (`GET /api/auth/me/`).
- [x] **HU_M01:** Implementar cierre de sesión (`POST /api/auth/logout/`) y feedback de conexión/red.
- [x] **TEST-01:** Pruebas automatizadas de contrato API para login y guard de navegación con Playwright.
- **DoD Sprint 1:** `HU_M01` completada y probada en dispositivo físico real. Token JWT seguro en Keystore/Keychain. Sesión persistente funcional.

### 🔹 Sprints 2 & 3 (Unificado) — Gestión de Cuotas, Historial y Carga de Comprobantes Multipart (Semanas 2 y 3)

> **División de Trabajo en Paralelo:**
> - **Eje Frontend Móvil (Fabio Navarro):** Cuotas pendientes (`HU_M02` #7), detalle por cuota y filtrado, e historial de pagos (`HU_M03` #8).
> - **Eje Carga & Backend (Maximiliano Echeverría):** Selector y carga multipart de comprobantes (`HU_M04` #9) y soporte de endpoints API en `educar_pagina` (`GET /api/cuotas/` y `POST /api/comprobantes/`).

#### Tareas Eje A (Fabio Navarro):
- [ ] **CHORE-03:** Tarjetas de cuotas y estados visuales en UI (`pendiente`, `parcial`, `pagada`, `vencida`).
- [ ] **HU_M02:** Consumo de `GET /api/cuotas/` con aislamiento por hijos del tutor (`RNF_M04`) (#7).
- [ ] **HU_M02:** Pantalla/modal de detalle de cuota con desglose de conceptos (cuota base, servicios) (#7).
- [ ] **HU_M02:** Implementación de filtro por alumno y período en el cliente (#7).
- [ ] **HU_M03:** Pantalla de historial completo de pagos ordenados cronológicamente con montos y comprobantes asociados (#8).

#### Tareas Eje B (Maximiliano Echeverría):
- [ ] **CHORE-04:** Wireframes de selector de comprobantes y vista previa en móvil.
- [ ] **HU_M04:** Integración de `expo-document-picker` y `expo-image-picker` para adjuntar PDF/imágenes (#9).
- [ ] **HU_M04:** Consumo de `POST /api/comprobantes/` con envío multipart `{ uri, name, type }` (#9).
- [ ] **HU_M04:** Asociación del comprobante a la factura correspondiente y confirmación visual (#9).
- [ ] **BACKEND:** Endpoint `GET /api/cuotas/` con filtrado por rol Tutor en `educar_pagina`.
- [ ] **BACKEND:** Endpoint `POST /api/comprobantes/` receptor de archivos multipart en `educar_pagina`.

- **DoD Sprints 2 & 3:** `HU_M02`, `HU_M03` y `HU_M04` completadas. Cuotas, historial y subida de comprobantes validadas en emulador y dispositivo real.

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
- [ ] **HU_M10:** Reportes administrativos móviles (Admin).
- [ ] **CHORE-07:** Pruebas integrales en emulador Android y dispositivo físico real.
- [ ] **CHORE-08:** Compilación de APK de vista previa mediante EAS Build (`eas build -p android`).
- [ ] **DOC-01:** Manual de usuario móvil y entrega final.
- **DoD Sprint 6:** 100% de las historias completadas. APK compilada y proyecto entregado.
