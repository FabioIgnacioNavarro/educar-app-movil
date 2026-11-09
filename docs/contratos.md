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

### `POST /api/auth/password-change/`
Permite que un usuario móvil autenticado cambie su contraseña desde **Mi Perfil**.
- **Autenticación:** `Authorization: Bearer <access>`.
- **Request Body:** `{"current_password":"...","new_password":"..."}`.
- **Response `200 OK`:** `{"detail":"La contraseña se cambió correctamente."}`.
- **Errores:** `400` si la actual es incorrecta o la nueva no cumple los validadores del proyecto; `401` si la sesión venció.
- **Seguridad:** se revocan las demás sesiones móviles; la sesión actual continúa activa. Máximo cinco intentos por hora.

### `POST /api/auth/password-reset/request/`
Endpoint público para solicitar un código al correo guardado en la cuenta. Request: `{"email":"persona@correo.com"}`. Devuelve siempre un mensaje genérico para no revelar si la cuenta existe. Si el correo corresponde a una cuenta móvil activa, se envía un código de seis dígitos que vence en 15 minutos. Límite: cinco solicitudes por hora.

### `POST /api/auth/password-reset/confirm/`
Endpoint público. Request: `{"email":"persona@correo.com","code":"123456","new_password":"..."}`. Valida el código de un solo uso, vencimiento y validadores de contraseña del backend. Permite hasta cinco códigos incorrectos y limita a diez solicitudes por hora. Al confirmar, cambia la contraseña y revoca todas las sesiones; la persona debe iniciar sesión con la nueva contraseña.

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
      "saldo": "45000.00",
      "fecha_vencimiento": "2026-11-10",
      "estado": "pendiente",
      "conceptos_pago": [
        {
          "clave": "cuota_base",
          "tipo": "cuota_base",
          "concepto": "Cuota base (Primario)",
          "monto": "30000.00",
          "monto_pagado": "0.00",
          "monto_en_revision": "0.00",
          "saldo_disponible": "30000.00",
          "bloqueado_por_revision": false
        },
        {
          "clave": "deporte:8",
          "tipo": "deporte",
          "concepto": "Deporte: Fútbol",
          "monto": "5000.00",
          "monto_pagado": "0.00",
          "monto_en_revision": "0.00",
          "saldo_disponible": "5000.00",
          "bloqueado_por_revision": false
        },
        {
          "clave": "deporte:9",
          "tipo": "deporte",
          "concepto": "Deporte: Básquet",
          "monto": "4000.00",
          "monto_pagado": "0.00",
          "monto_en_revision": "0.00",
          "saldo_disponible": "4000.00",
          "bloqueado_por_revision": false
        },
        {
          "clave": "transporte:2",
          "tipo": "transporte",
          "concepto": "Transporte: Recorrido 2 - Centro",
          "monto": "6000.00",
          "monto_pagado": "0.00",
          "monto_en_revision": "0.00",
          "saldo_disponible": "6000.00",
          "bloqueado_por_revision": false
        }
      ],
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
  - `conceptos_seleccionados`: lista JSON con una o más claves de `conceptos_pago`. Cada concepto se paga por el saldo completo disponible; el backend valida la lista y el total.
  - `importe`: suma exacta de los saldos completos de los conceptos seleccionados; debe ser positivo.
  - `medio_pago`: medio de pago (opcional, por defecto `Transferencia`).
  - `archivo`: Archivo binario (PDF, PNG o JPG).

La app envía siempre `conceptos_seleccionados`. El backend conserva compatibilidad con clientes
anteriores que omitan ese campo, pero la nueva interfaz no permite enviar un pago sin seleccionar
conceptos. Un concepto con saldo en revisión o pagado no está disponible para otro envío. Para cuotas
históricas sin desglose guardado, se muestra un concepto único por el saldo pendiente completo.
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

Descarga el archivo asociado a un comprobante usando el token Bearer. Admite tanto al padre/tutor asociado al alumno como al rol administrativo; no se expone una URL pública.

### `GET /api/comprobantes/pendientes/`
Exclusivo para el rol `administrativo`. Devuelve el listado de comprobantes y transferencias bancarias en estado `En revisión` o `Pendiente`.
- **Autenticación:** `Bearer <access_token>` (rol administrativo).
- **Response `200 OK`:**
  ```json
  [
    {
      "id": 42,
      "cuota_id": 101,
      "periodo": "Noviembre 2026",
      "importe": "42000.00",
      "estado": "En revisión",
      "fecha_solicitud": "2026-11-09T18:30:00Z",
      "motivo_rechazo": null,
      "alumno": {
        "legajo": 1245,
        "nombre": "Mateo Pérez",
        "curso": "3° Año A"
      },
      "tutor": {
        "id": 147,
        "nombre": "Juan López",
        "email": "juan.lopez@example.com"
      },
      "comprobante": {
        "id": 12,
        "nombre_archivo": "transferencia.pdf",
        "archivo_url": "/api/comprobantes/12/archivo/",
        "fecha_envio": "2026-11-09T18:30:00Z"
      },
      "conceptos": [
        { "clave": "cuota_base", "concepto": "Cuota Base", "monto": 25000.00 }
      ]
    }
  ]
  ```

### `POST /api/comprobantes/{id_pago}/aprobar/`
Exclusivo para el rol `administrativo`. Aprueba un pago en revisión, actualiza la cuota a `Pagada` o cancela los saldos correspondientes y despacha automáticamente el correo de confirmación con el recibo PDF adjunto.
- **Autenticación:** `Bearer <access_token>` (rol administrativo).
- **Response `200 OK`:**
  ```json
  {
    "detail": "Pago aprobado con éxito.",
    "pago_id": 42,
    "estado": "Pagado",
    "cuota_estado": "Pagada"
  }
  ```

### `POST /api/comprobantes/{id_pago}/rechazar/`
Exclusivo para el rol `administrativo`. Rechaza un pago en revisión registrando obligatoriamente el motivo para conocimiento del tutor.
- **Autenticación:** `Bearer <access_token>` (rol administrativo).
- **Request JSON:** `{"motivo": "El importe transferido es insuficiente o el comprobante es ilegible"}`
- **Response `200 OK`:**
  ```json
  {
    "detail": "Pago rechazado correctamente.",
    "pago_id": 42,
    "estado": "Rechazado",
    "motivo_rechazo": "El importe transferido es insuficiente"
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


Los importes monto_mensual pueden ser null cuando el backend no tiene un arancel mensual registrado. La app debe mostrar “No informado”, nunca “$0” por falta de dato. El total mensual también se muestra como “No informado” si alguna inscripción activa carece de precio.

---

## 5. Módulo Reportes

### `GET /api/deuda/historial/`
Historial de deuda acumulada para el padre/tutor.
- **Autenticación:** `Bearer <access_token>` (Tutor).

### `GET /api/facturas/`
Listado de facturas emitidas por rango de fechas (`?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`).
- **Autenticación:** `Bearer <access_token>`.

Todos los endpoints administrativos de este apartado requieren `Authorization: Bearer <access_token>` y el rol `Administrador`. El período se envía como `?mes=<1-12>&anio=<YYYY>`; si se omite, el backend usa el mes y año actuales. La consulta usa el período exacto y no mezcla cuotas de años distintos. Una lista vacía representa cero filas, nunca datos de ejemplo.

### `GET /api/reportes/ingresos/`

Devuelve el total facturado, cobrado, porcentaje de cobranza y cantidad de cuotas pagadas/pendientes. Incluye `ingresos_cuota_base`, `ingresos_servicios`, `ingresos_sin_desglose` y `cuotas_sin_desglose`.

### `GET /api/reportes/pagos-completos/` y `GET /api/reportes/pagos-incompletos/`

Listan cuotas saldadas y cuotas con saldo pendiente del período solicitado. Devuelven `[]` cuando no existen filas.

### `GET /api/reportes/desglose-financiero/`

Devuelve importes facturados y pagados aprobados, agrupados a partir de los conceptos guardados al emitir cada cuota. La distribución de un pago parcial entre conceptos se realiza proporcionalmente al importe de cada concepto.

```json
{
  "mes": 11,
  "anio": 2026,
  "deportes": [{"nombre": "Natación", "facturado": "5000.00", "pagado": "2500.00"}],
  "niveles": [],
  "horarios": [],
  "docentes": [],
  "recorridos": [],
  "cuotas_sin_desglose": 2,
  "facturado_sin_desglose": "50000.00",
  "pagado_sin_desglose": "10000.00"
}
```

Las categorías `niveles`, `horarios`, `docentes` y `recorridos` tienen la misma forma `{ "nombre", "facturado", "pagado" }`. Las cuotas históricas anteriores al guardado del desglose se contabilizan como `sin_desglose`; no se reconstruyen usando las inscripciones actuales, porque podrían haber cambiado.

Si falla una solicitud, la app debe mostrar el error de conexión/servidor y no reemplazarlo con cifras de ejemplo. Una respuesta correcta con arreglos vacíos debe mostrar un estado sin movimientos.

