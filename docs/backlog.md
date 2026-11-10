# Backlog del Producto — Centro Educativo "Transformar para educar" (App Móvil)

**Metodología de Sistemas II** — MaTech Grupo 10  
Responsables: Fabio Ignacio Navarro & Maximiliano Joel Echeverría  
Planificación Ejecutiva: 3 Macro-Sprints Consolidados (6 Sprints Teóricos integrados / 90 horas hombre)

---

## 📊 Tablero de Estado General

| ID | Macro-Sprint | Historia de Usuario / Tarea | Prioridad | Estado | Responsables | DoD / Criterio de Aceptación |
| :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| **CHORE-01** | Sprint 1 | Configuración del entorno base, arquitectura y documentación (#1) | Alta | `terminado` | Navarro / Echeverría | Expo TS configurado, AGENTS.md, ADRs, contratos y typecheck en verde |
| **FIX-01** | Sprint 1 | Corregir incompatibilidad de react-native-gesture-handler (#4) | Alta | `terminado` | Navarro / Echeverría | Versiones nativas fijadas con expo install, expo-doctor 20/20 |
| **HU_M01** | Sprint 1 | Iniciar y cerrar sesión en la app móvil con JWT (#3) | Alta | `terminado` | Navarro / Echeverría | Token en SecureStore, sesión persistente, guard por rol, verificado en dispositivo real |
| **HU_M02** | Sprint 2 | Consultar listado de cuotas pendientes y por vencer (#7) | Alta | `terminado` | Navarro | Filtro por hijos propios, badges de estado visual, detalle de cuota |
| **HU_M03** | Sprint 2 | Consultar historial completo de pagos (#8) | Media | `terminado` | Navarro | Pagos ordenados por fecha, desglose de montos y comprobantes asociados |
| **HU_M04** | Sprint 2 | Cargar comprobante de transferencia (PDF/imagen) (#9, PR #12) | Alta | `terminado` | Echeverría | Envío multipart `{ uri, name, type }`, vinculación a cuota, validación y estados visibles con motivo de rechazo |
| **HU_M05** | Sprint 2 | Consultar inscripciones a deportes, transporte y comedor (#10) | Media | `terminado` | Navarro | Límite máx. 2 deportes, recorrido asignado y valores vigentes |
| **FIX-02** | Sprint 2 | No presentar aranceles no informados como gratuitos (#13) | Media | `terminado` | Echeverría | La app distingue precios nulos y no calcula un total falso |
| **FIX-03** | Extensión pagos | Refrescar conceptos disponibles al volver a pagar (#32, PR #33) | Alta | `terminado` | Echeverría | Al enfocar comprobantes y cada vez que se abre el formulario para una cuota, consultar el backend y mostrar saldo y estados actuales |
| **FIX-04** | Extensión HU_M01 | Cambiar contraseña desde Mi Perfil (#34; PR #35; API backend #46 / PR #47) | Media | `terminado` | Echeverría | Validación de contraseña actual/nueva en API y revocación de otras sesiones |
| **FIX-05** | Extensión HU_M01 | Recuperar contraseña olvidada por correo (#36; API backend #48) | Alta | `terminado` | Echeverría | Código de un solo uso con vencimiento, cambio de contraseña desde Login y revocación de sesiones (PR #37 fusionado) |
| **HU_M06** | Sprint 3 | Recibir notificación de factura mensual emitida (#17) | Alta | `terminado` | Navarro / Echeverría | Tarea de fin de mes, cálculo discriminado, PDF adjunto (PR #31 backend fusionada) |
| **HU_M07** | Sprint 3 | Recibir recordatorio automático de deuda (día 20) (#18) | Media | `terminado` | Navarro / Echeverría | Tarea día 20, solo a tutores con deuda, exclusión comprobantes en revisión (PR #31 backend fusionada) |
| **HU_M08** | Sprint 3 | Consultar reportes de facturas por período (Tutor) (#19) | Media | `terminado` | Navarro | Filtro de fechas, listado de comprobantes asociados |
| **HU_M09** | Sprint 3 | Consultar historial de deuda discriminado (Tutor) (#20) | Media | `terminado` | Navarro | Desglose por concepto (cuota, deporte, transporte, comedor) |
| **HU_M10** | Sprint 3 | Consultar reportes administrativos móviles (Admin) (#21, #26, #27, PR #22, PR #28) | Alta | `terminado` | Navarro / Echeverría | Reportes base, período seleccionable, datos reales y desglose financiero por deporte, nivel, horario, docente y recorrido (backend PR #40 fusionado) |
| **HU_M11** | Extensión pagos | Pagar conceptos seleccionados de una cuota (#29, backend PR #41, app PR #31) | Alta | `terminado` | Navarro / Echeverría | El tutor selecciona conceptos completos; API persiste asignación y saldo por concepto |
| **HU_M12** | Extensión pagos | Recibir correo al aprobar un pago (#30, backend PR #41) | Media | `terminado` | Echeverría | Correo idempotente al tutor con importe aprobado y saldo restante |
| **CHORE-07** | Sprint 3 | Pruebas integrales en emulador y dispositivo real (#23) | Alta | `pendiente` | Navarro / Echeverría | Verificación E2E de flujos móvil + backend en sesión presencial |
| **CHORE-08** | Sprint 3 | Compilación de APK autónomo de producción (#24) | Alta | `en progreso` | Navarro / Echeverría | Build con EAS (`eas build -p android`), APK instalable descargable |
| **DOC-01** | Sprint 3 | Manual de usuario y documentación final de cátedra (#25) | Media | `pendiente` | Navarro / Echeverría | Manual ilustrado en `docs/manual_usuario.md` y memoria final |
| **CHORE-09** | Sprint 3 | Identidad visual: logo institucional en login y cabecera de texto corporativa (#40, PR #39) | Media | `terminado` | Navarro | Integración de logo.png en Login y navegación con texto de marca corporativo |
| **HU_M04-ADMIN** | Extensión HU_M04 | Validación y gestión administrativa de comprobantes en la app (#41, PR #42) | Alta | `terminado` | Navarro | Endpoints admin y pantalla interactiva de comprobantes con aprobar/rechazar |
| **CHORE-11** | Extensión HU_M06/HU_M07 | Probar correos programados desde la app administrativa (#48, seguimiento #50; backend #52, seguimiento #56) | Media | `en revisión` | Echeverría | Confirmación indica tipo y período; copia de prueba dirigida a maxecheverri9@gmail.com |

---

## 🗓️ Detalle de Sprints y Tareas Técnicas

### 🔹 Sprint 1 — Configuración y Autenticación Móvil [TERMINADO ✅]
*(Abarca Sprint Teórico 1)*
- [x] **CHORE-01:** Configuración del entorno móvil con Expo (TypeScript, React Navigation, SecureStore, Axios).
- [x] **CHORE-02:** Diseño de wireframes y paleta institucional en Figma (Login y paneles por rol).
- [x] **HU_M01:** Implementar pantalla de Login consumiendo `POST /api/auth/login/`.
- [x] **HU_M01:** Almacenamiento seguro del token JWT en `expo-secure-store` y restauración de sesión (`GET /api/auth/me/`).
- [x] **HU_M01:** Implementar cierre de sesión (`POST /api/auth/logout/`) y feedback de conexión/red.
- [x] **FIX-04 (#34, PR #35):** Permitir cambiar la contraseña autenticado desde Mi Perfil usando `POST /api/auth/password-change/` (#46 backend, PR #47).
- [x] **FIX-05 (#36, PR #37):** Solicitar y confirmar recuperación de contraseña por correo usando `POST /api/auth/password-reset/request/` y `/confirm/` (#48 backend).
- [x] **TEST-01:** Pruebas automatizadas de contrato API para login y guard de navegación con Playwright.
- **DoD Sprint 1:** `HU_M01` completada y probada en dispositivo físico real. Token JWT seguro en Keystore/Keychain. Sesión persistente funcional.

---

### 🔹 Sprint 2 — Módulo Integral del Tutor: Cuotas, Historial, Comprobantes y Servicios [TERMINADO ✅]
*(Consolida Sprints Teóricos 2, 3 y 4 — Cierra el 100% de la operatoria del Padre/Tutor)*

> **División de Trabajo en Paralelo (Sin Bloqueos):**
> - **Eje Frontend Móvil (Fabio Navarro):** Cuotas (`HU_M02` #7), Historial (`HU_M03` #8) y Servicios Extracurriculares (`HU_M05` #10).
> - **Eje Backend & Carga Multipart (Maximiliano Echeverría):** Endpoints DRF en `educar_pagina` y Carga de Comprobantes (`HU_M04` #9).

#### 👤 Tareas Eje A (Fabio Navarro - Frontend Móvil):
- [x] **CHORE-03:** Tarjetas de cuotas y estados visuales en UI (`pendiente`, `parcial`, `pagada`, `vencida`).
- [x] **HU_M02:** Consumo de `GET /api/cuotas/` con aislamiento por hijos del tutor (`RNF_M04`) (#7).
- [x] **HU_M02:** Pantalla/modal de detalle de cuota con desglose de conceptos (cuota base, servicios) (#7).
- [x] **HU_M02:** Implementación de filtro por alumno y período en el cliente (#7).
- [x] **HU_M03:** Pantalla de historial completo de pagos ordenados cronológicamente con montos y comprobantes asociados (#8).
- [x] **CHORE-05:** Wireframes y tarjetas de visualización de servicios contratados.
- [x] **HU_M05:** Consumo de `GET /api/servicios/inscripciones/` (#10).
- [x] **HU_M05:** Visualización de deportes asignados (validación de máx. 2) y sus aranceles (#10).
- [x] **HU_M05:** Visualización del recorrido de transporte escolar y estado de comedor (#10).

- [x] **FIX-02 (#13):** Representar aranceles ausentes como “No informado” y no calcular un total mensual falso.
- [x] **FIX-03 (#32, PR #33):** Recargar el detalle al enfocar Comprobantes y cada vez que se abre el formulario de pago, incluso para la misma cuota; reiniciar selecciones y mostrar saldo y conceptos actualizados.

#### 👤 Tareas Eje B (Maximiliano Echeverría - Backend DRF + Comprobantes):
- [x] **BACKEND:** Endpoint `GET /api/cuotas/` con filtrado por rol Tutor en `educar_pagina` (`RNF_M04`).
- [x] **BACKEND:** Endpoint `GET /api/cuotas/{id}/` con detalle y desglose de conceptos en `educar_pagina`.
- [x] **BACKEND:** Endpoint `POST /api/comprobantes/` receptor de archivos multipart en `educar_pagina`.
- [x] **BACKEND:** Endpoint `GET /api/servicios/inscripciones/` para consulta de servicios en `educar_pagina`.
- [x] **CHORE-04 (PR #16):** Wireframes de selector de comprobantes y vista previa en móvil ([diseño en Figma](https://www.figma.com/design/FC2LWtGL00wjyvqODzbqSX/Educar-para-transformar?node-id=0-1&t=0Ipl9GgzGKmQpafH-1)).
- [x] **HU_M04:** Integración de `expo-document-picker` y `expo-image-picker` para adjuntar PDF/imágenes (#9).
- [x] **HU_M04:** Consumo de `POST /api/comprobantes/` con envío multipart `{ uri, name, type }` (#9).
- [x] **HU_M04:** Asociación del comprobante a la cuota correspondiente y confirmación visual (#9).
- [x] **HU_M04:** Mostrar estados reales del comprobante y el motivo de rechazo en cuotas e historial (#9).
- [x] **TEST-M04:** Contratos Playwright locales para cuotas, motivo de rechazo, validación multipart y carga con estado `en revisión`.
- [x] **TEST-M04:** Verificar desde Expo Go en dispositivo la carga, estados `en revisión`/`pagado`/`rechazado`, motivo visible y saldo actualizado tras la aprobación.

- **DoD Sprint 2 (PR #16 fusionado):** `HU_M02`, `HU_M03`, `HU_M04` y `HU_M05` completadas y validadas integralmente en Expo Go y en el sitio administrativo. Joel confirmó la carga real de archivos y las transiciones de estado. Los wireframes de selector y vista previa están documentados en Figma mediante `CHORE-04`.

---

### 🔹 Sprint 3 — Automatizaciones, Reportes Institucionales, EAS Build y Cierre [EN CURSO 🚀]
*(Consolida Sprints Teóricos 5 y 6)*
- [x] **CHORE-06:** Configuración de tareas programadas (management commands de Django).
- [x] **HU_M06:** Generación de factura en PDF y envío automático por correo el último día hábil (#17, PR #31 backend).
- [x] **HU_M07:** Envío automático de recordatorio de deuda el día 20 del mes con exclusión de comprobantes en revisión (#18, PR #31 backend).
- [x] **TEST-02:** Pruebas de ejecución de comandos, despacho de emails simulados y contratos de reportes (20 tests en verde).
- [x] **HU_M08:** Reporte de facturas y comprobantes por rango de fechas (Tutor) (#19, PR #22).
- [x] **HU_M09:** Historial de deuda discriminado por ítems (Tutor) (#20, PR #22).
- [x] **HU_M10 (#21):** Reportes administrativos móviles (ingresos, recaudación, estados de deuda) (PR #22).
- [x] **HU_M10 (#26):** Período dinámico y datos reales sin fallbacks (PR móvil #28).
- [x] **HU_M10 (#27):** Desglose financiero por deporte, nivel, horario, docente y recorrido desde snapshots (backend PR #40, migración 0018; app PR móvil #28).
- [x] **HU_M11 (#29):** Selección de conceptos completos al pagar; backend PR #41 y app PR #31 fusionados.
- [x] **HU_M12 (#30):** Correo al tutor tras la aprobación administrativa, con importe y saldo restante; backend PR #41 fusionado.
- [ ] **CHORE-07:** Pruebas integrales en emulador Android y dispositivo físico real (#23, asignado a sesión presencial Navarro / Echeverría).
- [ ] **CHORE-08:** Compilación de APK de producción mediante EAS Build (`eas build -p android`) (#24, asignado a sesión presencial Navarro / Echeverría).
- [ ] **DOC-01:** Manual de usuario móvil y entrega final de la cátedra (#25).
- [x] **CHORE-09 (#40, PR #39):** Identidad visual: incorporar logo institucional en login y cabecera de texto con colores de marca.
- [x] **CHORE-10 (#46):** Logo institucional oficial como icono de la app móvil y pantalla de carga (splash screen).
- [x] **HU_M04-ADMIN (#41):** Validación y gestión de comprobantes por el administrador en la app móvil.
- [x] **HU_M04-ADMIN (#44):** Visor de PDF integrado dentro de la app móvil para comprobantes de pago (WebView + PDF.js autónomo en el cliente).
- [x] **CHORE-11 (#48, PR móvil #49; API backend #52, PR #55):** Simulación de facturas y recordatorios sin modificar datos financieros.
- [ ] **CHORE-11 seguimiento (#50; backend #56):** Ajustar los textos del correo y la confirmación mostrada en la app.
- **DoD Sprint 3:** 100% de las historias completadas. APK instalable generada y proyecto final entregado.

