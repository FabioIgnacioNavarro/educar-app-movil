# AGENTS.md

Instrucciones para agentes de IA y desarrolladores que trabajan en este repositorio.
Para el detalle de requerimientos, historia de diseño, arquitectura y plan de sprints, consultar:
- **`docs/contexto_proyecto.md`**: Dominio escolar, reglas de negocio, roles y relación con el backend Django.
- **`docs/contratos.md`**: Especificación formal de los endpoints de la API REST (DRF), schemas JSON y códigos HTTP.
- **`docs/backlog.md`**: Sprints 1 a 6, Historias de Usuario (`HU_M01` a `HU_M10`), tareas y Criterios de Aceptación.
- **`docs/flujo-trabajo.md`**: Convenciones Git, ramas aisladas, commits semánticos y sincronización de tablero Kanban.
- **`docs/adr/`**: Decisiones de arquitectura formalizadas (Expo, SecureStore, Singleton, Adapter, Observer).

---

## 🏫 Propósito del Proyecto

Aplicación móvil complementaria al sistema de gestión web del **Centro Educativo "Transformar para educar"** (Metodología de Sistemas II - MaTech Grupo 10: Fabio Ignacio Navarro y Maximiliano Joel Echeverría).
La app brinda a **Padres/Tutores** y **Administradores** un canal ágil y accesible para la gestión financiera, carga de comprobantes de pago por transferencia, consulta de servicios extracurriculares (deportes, transporte, comedor) y visualización de reportes institucionales.

---

## 📱 Alcance Técnico del Repositorio

- **Framework:** React Native con **Expo** (Managed Workflow).
- **Lenguaje:** **TypeScript** estricto (`tsconfig.json`). Prohibido el uso indiscriminado de `any`.
- **Navegación:** `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`.
- **Cliente HTTP:** **Axios** (Patrón Singleton centralizado en `src/api/client.ts`).
- **Manejo de Estado Global:** React Context API + Hooks (Patrón Observer).
- **Almacenamiento Seguro:** `expo-secure-store` para tokens JWT (Android Keystore / iOS Keychain). Cumplimiento obligatorio de **RNF_M01**.
- **Carga de Archivos:** `expo-document-picker` y `expo-image-picker` para adjuntar PDFs e imágenes en formato `multipart/form-data` (`{ uri, name, type }`).
- **Pruebas y Verificación:** `playwright` (contratos API y E2E), TypeScript compiler (`tsc --noEmit`), ESLint.

---

## 🏛️ Estructura del Proyecto y Capas Arquitectónicas

Respetar estrictamente la separación de responsabilidades dentro de `src/`:

```
educar-app-movil/
├── .agents/skills/            # Skills de Antigravity (flujo-git-github, playwright-testing)
├── docs/                      # Documentación viva de ingeniería (ADRs, contratos, backlog, contexto)
├── assets/                    # Íconos, splash screen y recursos visuales
├── e2e/                       # Pruebas automatizadas de contratos API con Playwright
├── src/
│   ├── api/                   # [SINGLETON] Cliente Axios con interceptor Authorization: Bearer
│   ├── adapters/              # [ADAPTER] Mapeo y saneamiento de DTOs de DRF a modelos de vista
│   ├── context/               # [OBSERVER] AuthContext, sesión y estados compartidos
│   ├── navigation/            # Navegación tipada: RootNavigator, AuthStack, MainTabs, AdminTabs
│   ├── screens/               # Pantallas por módulo (auth, cuotas, comprobantes, servicios, reportes)
│   ├── components/            # UI reutilizable (Card, Button, StatusBadge, LoadingSpinner, ErrorView)
│   ├── services/              # Métodos de llamada a endpoints (authService, cuotasService, etc.)
│   ├── types/                 # Interfaces TypeScript del dominio y navegación
│   └── utils/                 # Helpers (formateo ARS, fechas en español, validadores)
├── App.tsx                    # Punto de entrada con providers y Theme
├── app.json                   # Configuración de Expo y paquetes nativos
├── package.json               # Dependencias y scripts
└── tsconfig.json              # Configuración de TypeScript
```

---

## 🔒 Reglas Inviolables del Dominio y Seguridad

1. **Aislamiento de Rol y Confidencialidad (RNF_M04):**
   - Un **Padre/Tutor solo puede ver cuotas, facturas, comprobantes y servicios de sus hijos asociados** (`TutorTutoraAlumno`).
   - El **Administrador** puede visualizar el estado global de cuotas, validar comprobantes y consultar reportes.
   - Si un endpoint no filtra correctamente en el backend, reportarlo y jamás mostrar datos cruzados en el cliente.
2. **Tokens Seguros (RNF_M01 / RNF_M02):**
   - El token JWT jamás se guarda en `AsyncStorage` en texto plano ni en variables globales volátiles. Se usa exclusivamente `expo-secure-store`.
   - Toda petición a endpoints protegidos debe inyectar automáticamente `Authorization: Bearer <access_token>` mediante el interceptor de Axios.
3. **Formato Multipart en React Native (HU_M04):**
   - Al subir comprobantes bancarios, el objeto del archivo en `FormData` debe tener exactamente la estructura:
     `{ uri: file.uri, name: file.name, type: file.mimeType }`.
4. **Reglas de Negocio Institucionales:**
   - Cada alumno puede inscribirse a un **máximo de 2 deportes simultáneos**.
   - El servicio de transporte tiene **4 recorridos fijos** y es opcional mes a mes.
   - No se realizan pagos en efectivo: todos los pagos se registran por transferencia bancaria con su correspondiente comprobante asociado a una factura.
   - Una factura puede tener **múltiples comprobantes** asociados.

---

## 🛠️ Comandos de Desarrollo en Windows

En sistemas Windows con PowerShell, ejecutar los comandos siempre con `.cmd`:

```powershell
# Levantar servidor de desarrollo de Expo
npm.cmd start

# Iniciar en emulador Android o web
npm.cmd run android
npm.cmd run web

# Verificación de tipos TypeScript (cero errores)
npx.cmd tsc --noEmit

# Verificación de linter
npm.cmd run lint

# Pruebas de contratos de API REST (Playwright)
npx.cmd playwright test
```

---

## 📋 Convenciones de Ramas, Commits y Kanban

Seguir la skill [`.agents/skills/flujo-git-github`](.agents/skills/flujo-git-github/SKILL.md):
- **Ramas:** `feature/HU_M<n>-descripcion-corta`, `fix/descripcion-corta`, `chore/descripcion-corta`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- **DoD:** `tsc --noEmit` en verde, linter sin errores, tests de contratos aprobados, backlog actualizado.
