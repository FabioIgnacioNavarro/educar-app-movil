# Contratos de API REST (Django REST Framework ↔ App Móvil)

Este documento especifica la comunicación entre el backend Django y la aplicación móvil. La autenticación descrita aquí ya está implementada en `mobile_api`; los módulos financieros que siguen son contratos planificados y requieren sus endpoints en Django antes de poder usarse desde la app.

Base URL en desarrollo: `http://10.0.2.2:8000/api/` (emulador Android) o `http://127.0.0.1:8000/api/` (pruebas locales). En producción se usa el dominio HTTPS del sitio seguido por `/api/`.

---

## 1. Módulo Autenticación

### `POST /api/auth/login/`
Autentica un padre/tutor o administrador con las credenciales del sitio.

- **Autenticación:** Pública.
- **Request Body:**
  ```json
  {
    "identifier": "usuario-o-correo",
    "password": "contraseña"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access": "<jwt>",
    "token_type": "Bearer",
    "expires_in": 28800,
    "user": {
      "id": 14,
      "username": "perez_juan",
      "name": "Juan Pérez",
      "email": "juan.perez@email.com",
      "role": "padre"
    }
  }
  ```
- **Roles devueltos por Django:** `padre` y `administrativo`.
- **Errores:** `400` si faltan datos; `401` si las credenciales no coinciden; `403` si la cuenta está inactiva o el rol no está habilitado.

### `GET /api/auth/me/`
Devuelve los datos actuales del usuario y valida que el token siga vigente.

- **Autenticación:** `Authorization: Bearer <access_token>`.
- **Response `200 OK`:** `{ "user": { "id": 14, "username": "perez_juan", "name": "Juan Pérez", "email": "juan.perez@email.com", "role": "padre" } }`.

### `POST /api/auth/logout/`
Revoca en el servidor la sesión asociada al token.

- **Autenticación:** `Authorization: Bearer <access_token>`.
- **Request Body:** vacío.
- **Response:** `204 No Content`.

La API entrega un token de acceso con duración de 8 horas y no entrega token `refresh`. La app guarda el acceso en SecureStore, valida la sesión con `/auth/me/` al abrirse y llama a `/auth/logout/` al salir.

### Recuperación de contraseña
`POST /api/auth/password-reset/` figura como necesidad futura, pero todavía no está implementado en el backend.

---
## 2. Módulo Cuotas e Historial Financiero

### `GET /api/cuotas/`
Obtiene las cuotas de los alumnos a cargo del tutor autenticado (aislamiento RNF_M04).
- **Autenticación:** `Bearer <access_token>` (Rol: `Padre/Tutor`).
- **Query Params opcionales:**
  - `periodo`: Filtrar por mes/año (ej. `2026-11`).
  - `estado`: Filtrar por `pendiente`, `parcial`, `pagada`, `vencida`.
- **Response `200 OK`:**
  ```json
  [
    {
      "id": 101,
      "periodo": "Noviembre 2026",
      "monto": "45000.00",
      "monto_pagado": "0.00",
      "fecha_vencimiento": "2026-11-10",
      "estado": "pendiente",
      "comprobantes": [
        {
          "id": 42,
          "estado": "pendiente",
          "estado_pago": "en revisión",
          "fecha_envio": "2026-11-05T18:30:00-03:00",
          "importe": "20000.00",
          "motivo_rechazo": null,
          "nombre_archivo": "comprobantes/2026/11/transferencia.pdf"
        }
      ],
      "alumno": {
        "legajo": 1245,
        "nombre_completo": "Mateo Pérez",
        "curso": "3° Año A - Secundaria"
      }
    }
  ]
  ```

---

### `GET /api/cuotas/{id}/`
Contrato planificado para devolver el detalle discriminado de una cuota. **El backend actual todavía no implementa esta ruta.** Mientras tanto, la app obtiene los datos disponibles desde `GET /api/cuotas/` y no inventa un desglose cuando la API no lo entrega.
- **Autenticación:** `Bearer <access_token>`.
- **Response `200 OK`:**
  ```json
  {
    "id": 101,
    "periodo": "Noviembre 2026",
    "monto_total": "45000.00",
    "fecha_vencimiento": "2026-11-10",
    "estado": "pendiente",
    "discriminacion": {
      "cuota_base": "30000.00",
      "deportes": [
        { "nombre": "Fútbol", "monto": "5000.00" },
        { "nombre": "Básquet", "monto": "4000.00" }
      ],
      "transporte": { "recorrido": "Recorrido 2 - Centro", "monto": "6000.00" },
      "comedor": null
    },
    "comprobantes": [
      {
        "id": 12,
        "fecha_pago": "2026-11-05",
        "importe": "20000.00",
        "estado": "aprobado",
        "archivo_url": "/media/comprobantes/comp_12.pdf"
      }
    ]
  }
  ```

---

## 3. Módulo Comprobantes de Pago (Envío Multipart)

### `POST /api/comprobantes/`
Sube un comprobante de transferencia bancaria y lo asocia a una cuota específica.
- **Autenticación:** `Bearer <access_token>`.
- **Content-Type:** `multipart/form-data`.
- **Form Data Fields:**
  - `cuota_id`: ID numérico de la cuota.
  - `importe`: Monto a acreditar; debe ser positivo y no superar el saldo pendiente.
  - `medio_pago`: medio de pago (opcional, por defecto `Transferencia`).
  - `archivo`: Archivo binario (PDF, PNG o JPG).
- **Response `201 Created`:**
  ```json
  {
    "id": 42,
    "cuota_id": 101,
    "pago_id": 42,
    "estado": "en revisión",
    "mensaje": "El comprobante fue enviado y quedó en revisión administrativa."
  }
  ```
- **Response `400 Bad Request`:**
  ```json
  {
      "detail": "Debe enviar el archivo del comprobante en 'archivo'."
  }
  ```

El listado de cuotas incluye `comprobantes`. En cada elemento, `estado_pago` puede ser `pendiente`,
`en revisión`, `pagado` o `rechazado`; `motivo_rechazo` contiene el motivo ingresado por administración
cuando el estado es `rechazado`. La app muestra el estado y el motivo en la cuota y en el historial.

### `GET /api/comprobantes/{id}/archivo/`

Descarga el archivo asociado a un comprobante usando el token Bearer. El backend vuelve a validar que el comprobante pertenezca a un alumno asociado al tutor; no se expone una URL pública.

---

## 4. Módulo Servicios Extracurriculares

### `GET /api/servicios/inscripciones/`
Consulta las inscripciones activas a deportes, transporte y comedor de los hijos del tutor.
- **Autenticación:** `Bearer <access_token>`.
- **Response `200 OK`:**
  ```json
  [
    {
      "alumno": {
        "legajo": 1245,
        "nombre_completo": "Mateo Pérez"
      },
      "deportes": [
        { "id": 3, "nombre": "Fútbol", "monto_mensual": "5000.00", "horario": "Lun-Mie 17:00" },
        { "id": 5, "nombre": "Básquet", "monto_mensual": "4000.00", "horario": "Mar-Jue 18:00" }
      ],
      "transporte": {
        "id_inscripcion": 8,
        "recorrido": "Recorrido 2 - Centro",
        "monto_mensual": "6000.00",
        "estado": "Activo"
      },
      "comedor": null
    }
  ]
  ```

---

## 5. Módulo Reportes

### `GET /api/deuda/historial/`
Historial de deuda acumulada para el padre/tutor.
- **Autenticación:** `Bearer <access_token>` (Tutor).

### `GET /api/facturas/`
Listado de facturas emitidas por rango de fechas (`?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`).
- **Autenticación:** `Bearer <access_token>`.

### `GET /api/reportes/ingresos/` (Administrador)
Reporte institucional de ingresos por período (`?mes=11&anio=2026`).
- **Autenticación:** `Bearer <access_token>` (Rol: `Administrador`).

### `GET /api/reportes/pagos-completos/` y `GET /api/reportes/pagos-incompletos/` (Administrador)
Listados de alumnos/tutores al día y con saldo deudor en un período.
