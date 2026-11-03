# 📱 Educar para Transformar — Aplicación Móvil de Gestión

> **Centro Educativo "Transformar para educar"**  
> Metodología de Sistemas II — UTN Facultad Regional Resistencia  
> **MaTech Grupo 10:**  
> - **Navarro, Fabio Ignacio**  
> - **Echeverría, Maximiliano Joel**  
>
> 🔗 **Repositorio Backend Django:** [educar_pagina](https://github.com/maxechev/educar_pagina)  
> 🔗 **Repositorio Móvil:** [educar-app-movil](https://github.com/FabioIgnacioNavarro/educar-app-movil)

---

## 📌 Descripción del Proyecto

Aplicación móvil complementaria al sistema de gestión web del Centro Educativo "Transformar para educar", orientada a brindar a los **Padres/Tutores** y **Administradores** un canal ágil, seguro y accesible desde sus dispositivos móviles Android/iOS.

### Objetivos Principales:
- **Consulta de Cuotas y Deuda:** Estados en tiempo real (`pendiente`, `parcial`, `pagada`, `vencida`).
- **Carga Digital de Comprobantes:** Envío multipart de transferencias bancarias (PDF o foto) vinculadas a facturas.
- **Consulta de Servicios:** Deportes contratados (máximo 2 por alumno), transporte escolar (por recorrido) y comedor.
- **Notificaciones Automáticas:** Emisión mensual automática de facturas en PDF y recordatorios de saldo el día 20.
- **Reportes Móviles:** Consultas de ingresos y deudores para administración y desglose para tutores.

---

## 🛠️ Stack Tecnológico

| Capa / Módulo | Tecnología | Justificación / ADR |
| :--- | :--- | :--- |
| **Framework Móvil** | React Native + Expo (SDK 58) | Multiplataforma, pruebas inmediatas con Expo Go y EAS Build ([ADR 0001](docs/adr/0001-uso-expo-react-native.md)) |
| **Lenguaje** | TypeScript (~6.0) | Tipado estricto de entidades de dominio y contratos de API |
| **Cliente HTTP** | Axios (Singleton) | Instancia única centralizada con interceptor Bearer ([ADR 0003](docs/adr/0003-patrones-singleton-adapter-observer.md)) |
| **Navegación** | React Navigation 7 | Stacks nativos, Bottom Tabs y guards de autenticación por rol |
| **Estado Global** | React Context API + Hooks | Patrón Observer reactivo para gestión de sesión y usuario |
| **Almacenamiento Seguro** | `expo-secure-store` | Cifrado nativo (Android Keystore / iOS Keychain) para tokens JWT ([ADR 0002](docs/adr/0002-autenticacion-jwt-securestore.md)) |
| **Backend REST** | Django + Django REST Framework | Arquitectura centralizada de 3 capas compartida con el portal web |
| **Testing** | Playwright (Contratos de API y E2E) | Validación de respuestas JSON, códigos HTTP y roles |

---

## 🏛️ Arquitectura del Repositorio

```
educar-app-movil/
├── .agents/skills/            # Skills de Antigravity (flujo-git-github, playwright-testing)
├── docs/                      # Documentación viva de ingeniería
│   ├── adr/                   # Architecture Decision Records (0001 a 0004)
│   ├── contratos.md           # Especificación formal de endpoints DRF y schemas JSON
│   ├── backlog.md             # Backlog de 6 Sprints (HU_M01 a HU_M10) y DoD
│   ├── contexto_proyecto.md   # Dominio del centro educativo y reglas de negocio
│   └── flujo-trabajo.md       # Flujo colaborativo Git, Kanban, ramas y commits
├── e2e/                       # Pruebas automatizadas de contratos de API REST
├── src/
│   ├── api/                   # [SINGLETON] Axios client con interceptor Authorization: Bearer
│   ├── adapters/              # [ADAPTER] Mapeo de DTOs de DRF a modelos de vista
│   ├── context/               # [OBSERVER] AuthContext y proveedores de estado
│   ├── navigation/            # RootNavigator, AuthStack y TabNavigators
│   ├── screens/               # Vistas por módulo (Auth, Cuotas, Comprobantes, Servicios, Reportes, Perfil)
│   ├── components/            # Componentes UI reutilizables (Card, Button, StatusBadge, Spinner)
│   ├── services/              # Consumo de endpoints (authService, cuotasService)
│   ├── types/                 # Interfaces y contratos TypeScript
│   └── utils/                 # Helpers (formateo ARS, fechas, almacenamiento seguro)
├── App.tsx                    # Punto de entrada de la aplicación
├── app.json                   # Configuración del proyecto Expo
├── package.json               # Dependencias y scripts
└── tsconfig.json              # Configuración TypeScript con alias "@/..."
```

---

## 🚀 Puesta en Marcha Rápida

### 1. Prerrequisitos
- **Node.js** v20+ o v24+
- **Expo Go** instalado en tu celular físico Android (desde Google Play Store)
- Backend Django de `educar_pagina` corriendo en local o remoto.

### 2. Instalación de dependencias
En PowerShell (Windows):
```powershell
npm.cmd install
```

### 3. Configuración de Entorno
Copiar la plantilla de variables de entorno:
```powershell
Copy-Item .env.example .env
```
Ajustar `EXPO_PUBLIC_API_URL` en `.env`:
- **Emulador Android Studio:** `http://10.0.2.2:8000/api`
- **Dispositivo físico con Expo Go:** http://<TU_IP_LOCAL>:8000/api/ (ej. http://192.168.1.15:8000/api/)
- **PythonAnywhere:** https://educarparatransformar.pythonanywhere.com/api/

La autenticación móvil (inicio, restauración y cierre de sesión) ya consume la API Django. Cuotas, comprobantes, servicios y reportes todavía requieren que se implementen sus endpoints en el backend.

### 4. Ejecución del Servidor de Desarrollo
```powershell
npm.cmd start
```
Escanear el código QR resultante desde la app **Expo Go** en tu celular o presionar `a` para abrir en el emulador de Android.

---

## 🧪 Pruebas y Control de Calidad

```powershell
# Verificación de tipos estricta (TypeScript)
npm.cmd run typecheck

# Linter de la aplicación
npm.cmd run lint

# Pruebas de contratos de API REST (Playwright)
npm.cmd run test:contracts
```

---

## 📋 Metodología y Flujo de Trabajo

El proyecto aplica la **Regla Tripartita de Sincronización** (`docs/backlog.md` $\iff$ GitHub Issues $\iff$ Tablero Kanban):
- Ramas aisladas: `feature/HU_M<n>-descripcion-corta`, `fix/...`, `chore/...`.
- Commits atómicos convencionales: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Revisión de pares obligatoria antes de mergear a `main`.
- Consulta la guía completa en [docs/flujo-trabajo.md](docs/flujo-trabajo.md).
