# Mapa de Endpoints y Selectores para Tests Playwright (educar-app-movil)

## 1. Endpoints de la API REST de Django (`http://127.0.0.1:8000/api`)

| Endpoint | Método | Autenticación | HU | Descripción / Contrato |
| :--- | :---: | :---: | :---: | :--- |
| `/api/auth/login/` | POST | Pública | `HU_M01` | Login con credenciales (`username`/`correo`, `password`). Retorna `{ access, refresh, user: { id, nombre, rol } }`. |
| `/api/auth/logout/` | POST | Bearer | `HU_M01` | Cierre de sesión e invalidación del token de refresco. |
| `/api/auth/password-reset/` | POST | Pública | `HU_M01` | Solicitud de cambio de contraseña por correo. |
| `/api/cuotas/` | GET | Bearer (Tutor) | `HU_M02`, `HU_M03` | Listado de cuotas (pendientes, vencidas y pagadas) de los alumnos a cargo del tutor. Permite filtro `?periodo=2026-11`. |
| `/api/cuotas/<id>/` | GET | Bearer (Tutor) | `HU_M02` | Detalle específico de una cuota e importes discriminados. |
| `/api/comprobantes/` | POST | Bearer (Tutor) | `HU_M04` | Carga multipart con `cuota_id`, `importe`, `medio_pago` y `archivo` (PDF/imagen); respuesta `en revisión`. |
| `/api/facturas/` | GET | Bearer (Tutor) | `HU_M08` | Listado de facturas emitidas por período. |
| `/api/deuda/historial/` | GET | Bearer (Tutor) | `HU_M09` | Historial de deuda discriminado por ítem (cuota base, deportes, transporte, comedor). |
| `/api/servicios/inscripciones/` | GET | Bearer (Tutor) | `HU_M05` | Inscripciones activas de los hijos a deportes (máx. 2), transporte y comedor con sus valores. |
| `/api/reportes/ingresos/` | GET | Bearer (Admin) | `HU_M10` | Reporte financiero de ingresos por período. |
| `/api/reportes/pagos-completos/` | GET | Bearer (Admin) | `HU_M10` | Listado de alumnos y tutores al día en el período. |
| `/api/reportes/pagos-incompletos/` | GET | Bearer (Admin) | `HU_M10` | Listado de alumnos y tutores con deuda pendiente en el período. |

---

## 2. Vistas y Selectores UI en la App Móvil

| Vista / Pantalla | `testID` recomendado | Selector Accesible |
| :--- | :--- | :--- |
| Login - Input Usuario | `input-usuario` | `page.getByLabel(/usuario o correo/i)` |
| Login - Input Contraseña | `input-password` | `page.getByLabel(/contraseña/i)` |
| Login - Botón Ingresar | `btn-login` | `page.getByRole('button', { name: /ingresar|iniciar sesión/i })` |
| Login - Error credenciales | `login-error-msg` | `page.getByText(/credenciales inválidas/i)` |
| Tab - Cuotas | `tab-cuotas` | `page.getByRole('tab', { name: /cuotas/i })` |
| Tab - Comprobantes | `tab-comprobantes` | `page.getByRole('tab', { name: /comprobantes/i })` |
| Tab - Servicios | `tab-servicios` | `page.getByRole('tab', { name: /servicios/i })` |
| Tab - Reportes (Admin) | `tab-reportes` | `page.getByRole('tab', { name: /reportes/i })` |
| Item de Cuota | `cuota-card-<id>` | `page.getByTestId(/cuota-card-/i)` |
| Botón Subir Comprobante | `btn-subir-comprobante` | `page.getByRole('button', { name: /subir comprobante|adjuntar/i })` |
| Badge de Estado Cuota | `badge-estado-<estado>` | `page.getByText(/pendiente|pagada|vencida/i)` |
