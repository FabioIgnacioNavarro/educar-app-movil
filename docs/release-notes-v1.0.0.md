# 📱 Educar para Transformar — v1.0.0 (Release Oficial)

**Centro Educativo "Transformar para educar"**  
*Cátedra: Metodología de Sistemas II — MaTech Grupo 10*  
*Desarrolladores: Fabio Ignacio Navarro & Maximiliano Joel Echeverría*

---

## 🎯 Descripción General

Primera versión final de producción de la aplicación móvil complementaria al sistema web del **Centro Educativo "Transformar para educar"**. Desarrollada con **React Native** y **Expo (Managed Workflow)**, la app provee un canal ágil y accesible para la autogestión financiera de padres/tutores y la auditoría y control institucional por parte del equipo directivo y administrativo.

Se conecta en tiempo real a la API REST de producción desplegada en PythonAnywhere:
`https://educarparatransformar.pythonanywhere.com/api`

---

## 🚀 Principales Módulos y Funcionalidades

### 👨‍👩‍👧 1. Módulo del Padre / Tutor
- **Gestión Integral de Cuotas:** Consulta en tiempo real de aranceles escolares discriminados por alumno con aislamiento estricto de privacidad (`RNF_M04`). Estados visuales claros: *Pendiente*, *Parcial*, *Pagada*, *En revisión* y *Vencida*.
- **Pago de Conceptos Específicos (HU_M11):** Capacidad de seleccionar conceptos arancelarios específicos (cuota base, comedor, transporte, deportes) para abonar de forma parcial o total con recálculo dinámico de saldos.
- **Carga de Comprobantes Bancarios (HU_M04):** Adjunto directo de transferencias bancarias en formato PDF o fotos (`multipart/form-data`). Visualización del estado de auditoría y motivo de rechazo en caso de discrepancias.
- **Historial Financiero y Reportes (HU_M03, HU_M08, HU_M09):** Historial cronológico de pagos auditados, reporte de facturación por rango de fechas y desglose analítico de deuda.
- **Servicios Extracurriculares (HU_M05):** Consulta de inscripciones activas (hasta 2 deportes simultáneos, recorrido asignado de transporte escolar y comedor).
- **Seguridad y Cuenta (HU_M01):** Persistencia de sesión segura en Android Keystore (`RNF_M01`), cambio de clave desde el perfil y recuperación de contraseña por correo electrónico con código de un solo uso.

### 🏫 2. Módulo Administrativo y de Gestión
- **Auditoría y Validación de Pagos (HU_M04-ADMIN):** Panel en vivo para revisar transferencias pendientes, contrastar importes y ejecutar la **Aprobación** o el **Rechazo con motivo explicativo**.
- **Visor de PDFs Integrado (HU_M04-ADMIN):** Motor de renderizado en WebView con Mozilla PDF.js. Permite leer comprobantes bancarios en PDF con zoom/pellizco, navegación multi-página e indicador de páginas sin salir de la app ni requerir visores externos.
- **Dashboard Ejecutivo y Reportes (HU_M10):** Visualización de métricas de ingresos, recaudación y morosidad con desglose financiero real por deporte, nivel educativo, turnos y recorridos de transporte escolar.
- **Simulación de Automatizaciones (CHORE-11 / HU_M06, HU_M07):** Panel para probar y disparar en vivo el envío de facturas mensuales por correo y recordatorios de vencimiento de deuda.

---

## 🔒 Estándares de Seguridad y Calidad (DoD)

- **RNF_M01:** Tokens JWT almacenados de forma encriptada en el hardware del dispositivo mediante `expo-secure-store` (Android Keystore).
- **RNF_M02:** Inyección automática de `Authorization: Bearer <token>` mediante cliente HTTP centralizado (Patrón Singleton Axios).
- **RNF_M04:** Aislamiento estricto de datos: ningún tutor puede acceder a información financiera o comprobantes de otros alumnos.
- **Tipado Estricto:** 100% TypeScript sin errores (`tsc --noEmit`), código analizado con ESLint y suite de pruebas automatizadas con Playwright.

---

## 📦 Ficha Técnica del Artefacto (APK)

| Atributo | Detalle |
| :--- | :--- |
| **Nombre del archivo** | `educar-para-transformar-1.0.0.apk` |
| **Package Name** | `com.matech.educarappmovil` |
| **Versión** | `1.0.0` (Build 1) |
| **Tamaño del APK** | 79.25 MB (83.102.317 bytes) |
| **Hash SHA-256** | `C2EB3B713624D1E2C54D0A2FB5C9BD95228565E89796EA419F0B886F9C4F4F65` |
| **Framework** | Expo SDK 58 / React Native 0.88.1 |
| **Motor JS** | Hermes Engine |
| **Arquitecturas compatibles** | `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` |
| **Requisito mínimo** | Android 7.0 (Nougat, API 24) o superior |
| **Entorno Backend** | Django 5.x REST Framework en PythonAnywhere |

---

## 📲 Guía de Instalación para Evaluadores / Usuarios

1. Descargá el archivo adjunto **`educar-para-transformar-1.0.0.apk`** en tu teléfono Android (o desde esta misma página de Releases).
2. Abrí el archivo descargado. Si Android te solicita autorización, activá la casilla **"Permitir la instalación de aplicaciones de esta fuente"**.
3. Presioná **Instalar** y luego **Abrir**.
4. Podés probar la aplicación utilizando las credenciales provistas para la cátedra:
   - **Rol Padre / Tutor:** Usuario `rperez` | Clave institucional provista.
   - **Rol Administrativo:** Usuario administrativo | Clave institucional provista.

---

## 👥 Equipo de Desarrollo — MaTech Grupo 10
- **Fabio Ignacio Navarro** — Frontend Móvil, Arquitectura Expo, Patrones de Diseño, Visor PDF y Flujo Git/GitHub.
- **Maximiliano Joel Echeverría** — Backend Django REST Framework, Carga Multipart, Automatizaciones, Modelado y Testing.
