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
      "alumno": {
        "legajo": 1245,
        "nombre_completo": "Mateo Pérez",
        "curso": "3° Año A - Secundaria"
      },
      "factura_id": 87
    }
  ]
  ```

---

### `GET /api/cuotas/{id}/`
Detalle de una cuota con la discriminación exacta de sus conceptos.
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
Sube un comprobante de transferencia bancaria y lo asocia a una factura específica.
- **Autenticación:** `Bearer <access_token>`.
- **Content-Type:** `multipart/form-data`.
- **Form Data Fields:**
  - `factura`: ID numérico de la factura (ej. `87`).
  - `fecha_pago`: Fecha en formato `YYYY-MM-DD` (ej. `2026-11-05`).
  - `importe`: Monto pagado (ej. `45000.00`).
  - `medio_pago`: `transferencia` (por defecto).
  - `archivo_comprobante`: Archivo binario (PDF, PNG o JPG).
- **Response `201 Created`:**
  ```json
  {
    "id": 42,
    "factura": 87,
    "fecha_pago": "2026-11-05",
    "importe": "45000.00",
    "estado": "pendiente_validacion",
    "archivo_url": "/media/comprobantes/comp_42.pdf"
  }
  ```
- **Response `400 Bad Request`:**
  ```json
  {
    "archivo_comprobante": ["Formato de archivo no admitido. Utilice PDF o imagen (JPG/PNG)."]
  }
  ```

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
