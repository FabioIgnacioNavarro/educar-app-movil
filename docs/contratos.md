# Contratos de API REST (Django REST Framework ↔ App Móvil)

Este documento especifica formalmente los contratos HTTP entre el backend Django (`educar_pagina`) y la aplicación móvil (`educar-app-movil`).

Base URL en desarrollo: `http://10.0.2.2:8000/api` (emulador Android) o `http://127.0.0.1:8000/api` (Playwright / local).

---

## 1. Módulo Autenticación

### `POST /api/auth/login/`
Permite al usuario iniciar sesión con sus credenciales institucionales.
- **Autenticación:** Pública.
- **Request Body:**
  ```json
  {
    "usuario": "perez_juan",
    "password": "miPasswordSegura123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 14,
      "nombre_usuario": "perez_juan",
      "email": "juan.perez@email.com",
      "nombre_completo": "Juan Pérez",
      "rol": "Padre/Tutor",
      "tutor_id": 5
    }
  }
  ```
- **Response `401 Unauthorized`:**
  ```json
  {
    "detail": "Credenciales inválidas o usuario inactivo."
  }
  ```

---

### `POST /api/auth/logout/`
Invalida el token de refresco en el servidor.
- **Autenticación:** `Bearer <access_token>`.
- **Request Body:**
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response `200 OK` / `204 No Content`**

---

### `POST /api/auth/password-reset/`
Solicita recuperación de contraseña mediante correo electrónico institucional.
- **Autenticación:** Pública.
- **Request Body:**
  ```json
  {
    "email": "juan.perez@email.com"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "Si el correo está registrado, se ha enviado un enlace de recuperación."
  }
  ```

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
