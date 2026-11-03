---
name: flujo-git-github
description: >-
  Automatiza el ciclo de vida de desarrollo de la app móvil del Centro Educativo "Transformar para educar"
  (MaTech Grupo 10 - Metodología de Sistemas II) según AGENTS.md, contexto_proyecto.md y docs/flujo-trabajo.md:
  gestión de historias de usuario y tareas en docs/backlog.md y tablero Kanban en GitHub Projects
  (Backlog -> In progress -> In review -> Done), sincronización con GitHub Issues con especificación técnica
  detallada, creación de ramas aisladas (feature/HU_M<n>-descripcion-corta, fix/descripcion, chore/descripcion),
  verificación de Definition of Done (typecheck con tsc, lint, tests unitarios y pruebas de contratos API),
  commits semánticos atómicos, apertura automática de Pull Requests vinculados a los issues listos para revisión humana y cierre post-merge.
---

# Flujo de Trabajo Git, Kanban, Backlog e Issues (educar-app-movil)

Esta skill estandariza el ciclo de vida completo de cada Historia de Usuario (`HU_M01` a `HU_M10`) y tarea técnica en el repositorio [educar-app-movil](https://github.com/FabioIgnacioNavarro/educar-app-movil), garantizando el cumplimiento estricto de [AGENTS.md](../../../AGENTS.md), [docs/contexto_proyecto.md](../../../docs/contexto_proyecto.md), [docs/flujo-trabajo.md](../../../docs/flujo-trabajo.md) y [docs/contratos.md](../../../docs/contratos.md).

Todos los desarrolladores del equipo (**Fabio Ignacio Navarro** y **Maximiliano Joel Echeverría**) y cualquier agente de IA deben seguir exactamente este mismo procedimiento para mantener la trazabilidad, el orden del tablero Kanban y la estabilidad del código en `main`.

```mermaid
flowchart TD
    subgraph Fase 0: Definición y Backlog
        A0["Detectar HU, tarea o bug"] --> A1["Crear entrada en docs/backlog.md ('pendiente')"]
        A1 --> A2["Crear GitHub Issue con plantilla técnica completa"]
        A2 --> A3["Tarjeta entra a 'Backlog' en tablero Kanban"]
    end

    subgraph Fase 1: Inicio de Tarea (In Progress)
        A3 --> B1["Confirmar ID de tarea / HU e Issue"]
        B1 --> B2["Actualizar docs/backlog.md a 'en progreso'"]
        B2 --> B3["Mover tarjeta en Kanban a 'In progress'"]
        B3 --> B4["Sincronizar main (git checkout main && git pull)"]
        B4 --> B5["Crear rama aislada (feature/HU_M<n>-slug, fix/slug, chore/slug)"]
    end

    subgraph Fase 2: Implementación y Commits
        B5 --> C1["Desarrollar respetando patrones: Singleton, Adapter y Observer"]
        C1 --> C2["Verificar: typecheck, lint y tests de contratos"]
        C2 --> C3["Commits semánticos atómicos (feat:, fix:, test:, docs:, chore:)"]
    end

    subgraph Fase 3: Revisión y Pull Request (In Review)
        C3 --> D1["Verificar Definition of Done (DoD)"]
        D1 --> D2["Actualizar docs/backlog.md a 'en revisión'"]
        D2 --> D3["git push -u origin <rama>"]
        D3 --> D4["Crear Pull Request con 'Closes #Issue'"]
        D4 --> D5["Mover tarjeta en Kanban a 'In review'"]
        D5 --> D6["Revisión de pares y aprobación de merge"]
    end

    subgraph Fase 4: Post-Merge y Cierre (Done)
        D6 --> E1["Pull Request mergeado a main en GitHub"]
        E1 --> E2["Sincronizar local: git checkout main && git pull"]
        E2 --> E3["Eliminar rama local: git branch -d <rama>"]
        E3 --> E4["Actualizar docs/backlog.md a 'terminado'"]
        E4 --> E5["Commit y push a main: docs: marcar <ID> terminado"]
        E5 --> E6["Verificar que Issue y tarjeta en Kanban pasen a 'Done'"]
    end
```

---

## 📋 Mapeo de Estados: La Regla Tripartita de Sincronización

Para que el estado del proyecto sea transparente y predecible, **el archivo local, el Issue/PR y el Tablero Kanban deben reflejar exactamente el mismo estado en cada momento**:

| Estado Kanban (Tablero) | Estado en `docs/backlog.md` | Estado Git / GitHub Issue / PR | Acción que dispara la transición |
|---|---|---|---|
| **Backlog** (o *Todo*) | `pendiente` | GitHub Issue Abierto (sin rama activa ni asignación activa) | Registro inicial de la HU o tarea técnica en el backlog. |
| **In progress** | `en progreso` | Issue asignado, rama `feature/`, `fix/` o `chore/` creada | Inicio activo del desarrollo por un desarrollador o agente. |
| **In review** | `en revisión` | Rama subida a GitHub, Pull Request abierto vinculando `Closes #<Issue>` | Desarrollo finalizado, `typecheck`, `lint` y tests en verde, esperando revisión. |
| **Done** | `terminado` | Pull Request mergeado en `main`, Issue cerrado por GitHub | Merge aprobado, `main` actualizado, rama eliminada y backlog sincronizado. |

---

## 🗂️ Gestión del Tablero Kanban en GitHub Projects

El proyecto gestiona sus historias y tareas a través del tablero Kanban de GitHub Projects. Los desarrolladores y agentes gestionan las tarjetas mediante tres vías complementarias:

### 1. Automatizaciones Nativas de GitHub Projects (Por defecto)
- **Auto-add to project:** Todo issue creado entra automáticamente a **Backlog**.
- **Pull request opened:** Al abrir un PR vinculado al issue, la tarjeta pasa automáticamente a **In review**.
- **Item closed / PR merged:** Al mergear el PR a `main` y cerrarse el issue con `Closes #<Issue>`, la tarjeta se mueve automáticamente a **Done**.

### 2. Actualización por CLI (`gh project`)
Si se cuenta con el scope `project` en GitHub CLI (`gh auth refresh -s project`):
```powershell
# Listar proyectos
gh project list --owner FabioIgnacioNavarro

# Mover tarjeta de columna
gh project item-edit --id <item-id> --field-id <status-field-id> --project-id <project-id> --single-select-option-id <option-id>
```

### 3. Fallback Manual (UI Web)
Si no se utiliza el CLI de proyectos, proporcionar el enlace directo en el chat y arrastrar la tarjeta en el tablero.

---

## 📝 Estándar de Redacción de Issues en GitHub

Todo Issue creado o actualizado en GitHub **debe seguir una especificación técnica completa**:

```markdown
## 📌 Contexto y Requerimiento
<Explicación clara de la Historia de Usuario (ej. HU_M01), requerimiento funcional/no funcional (ej. RF_M01, RNF_M01) y qué valor aporta a la gestión móvil del centro educativo.>

## 🏗️ Alcance Técnico
- **Historia / ID Backlog:** <ej. HU_M01, HU_M04, CHORE-01>
- **Rol involucrado:** <Padre/Tutor | Administrador>
- **Módulos / Archivos involucrados:** <ej. src/screens/auth, src/services/authService, src/api/client, src/context/AuthContext>
- **Endpoints de la API (DRF):** <ej. POST /api/auth/login/>
- **Sprint:** <Sprint 1..6> | **Prioridad:** <Alta | Media | Baja>

## ✅ Criterios de Aceptación
- [ ] <Criterio verificable 1>
- [ ] <Criterio verificable 2>
- [ ] <Criterio verificable 3>

## 🧪 Plan de Verificación y Pruebas
- [ ] <Prueba de contrato con la API de Django / emulador / dispositivo>
- [ ] Verificación de tipos (`npx.cmd tsc --noEmit`) y linter (`npm.cmd run lint`).

## ⚠️ Reglas de Arquitectura y Seguridad a Respetar
- <Reglas de AGENTS.md: tokens en expo-secure-store, patrón Adapter para DTOs, no mezclar llamadas directas en componentes UI, aislamiento por rol de hijos.>
```

---

## 🚀 Fase 0: Creación de Tareas y Registro en Backlog

1. **Revisar documentación previa:** Consultar `AGENTS.md`, `docs/contexto_proyecto.md` y `docs/contratos.md`.
2. **Registrar en `docs/backlog.md`:** Añadir o actualizar la tarea con su ID (`HU_M01`..`HU_M10`, `CHORE-<n>`, `FIX-<n>`) en estado `pendiente`.
3. **Crear el Issue en GitHub:**
   ```powershell
   gh issue create --title "[<ID>] <Título descriptivo>" --body-file <archivo_body.md>
   ```
4. **Verificar en el Tablero Kanban:** Comprobar que la tarjeta esté en la columna **Backlog**.

---

## 🛠️ Fase 1: Iniciar Tarea (Mover a In Progress)

### 1. Localizar la tarea en `docs/backlog.md`
- Identificar ID, rol, endpoints relacionados y dependencias de UI.

### 2. Sincronizar o crear el GitHub Issue
- Verificar existencia del Issue:
  ```powershell
  gh issue list --search "<ID_TAREA>" --state open
  ```
- Anotar el número asignado (`#N`).

### 3. Actualizar `docs/backlog.md`
- Cambiar el estado de `pendiente` a `en progreso` y referenciar `#N`.

### 4. Mover la tarjeta en el Tablero Kanban a `In progress`

### 5. Crear la rama correspondiente desde `main` limpio
```powershell
git checkout main
git pull origin main
```
Nomenclatura obligatoria:
- Historias de usuario: `feature/HU_M<n>-descripcion-corta` (ej. `feature/HU_M01-login-jwt`)
- Correcciones de bugs: `fix/descripcion-corta` (ej. `fix/multipart-extension-comprobante`)
- Tareas técnicas: `chore/descripcion-corta` (ej. `chore/setup-expo-navigation`)
- Documentación: `docs/descripcion-corta` (ej. `docs/contratos-api`)
- Pruebas: `test/descripcion-corta` (ej. `test/contratos-auth-cuotas`)

```powershell
git checkout -b <nombre-de-rama>
```

---

## 💻 Fase 2: Implementación y Commits

### 1. Respetar reglas arquitectónicas (AGENTS.md)
- **Singleton:** Consumir siempre la instancia centralizada `api/client.ts` para Axios.
- **Adapter:** Transformar las respuestas de Django REST Framework en `adapters/` antes de entregarlas a los componentes.
- **Observer:** Usar React Context (`AuthContext`, etc.) y Hooks para el estado global y reactividad.
- **Seguridad (RNF_M01):** Tokens JWT almacenados exclusivamente con `expo-secure-store`.
- **Aislamiento de Rol:** Padres/tutores solo deben recibir y visualizar cuotas e inscripciones de sus propios hijos.

### 2. Validar calidad antes de commitear
En PowerShell de Windows ejecutar:
```powershell
npx.cmd tsc --noEmit     # Verificación de tipos TypeScript
npm.cmd run lint         # Verificación de linter / formato
npm.cmd test             # Pruebas unitarias / contratos
```

### 3. Commits semánticos y atómicos
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Ejemplo:
  ```powershell
  git commit -m "feat(auth): implementar inicio de sesion con SimpleJWT y SecureStore

  - Conecta con endpoint POST /api/auth/login/
  - Guarda tokens de acceso y refresco en expo-secure-store
  - Redirige segun rol detectado (Tutor / Administrador)
  - Ref: HU_M01 (#1)"
  ```

---

## 🔍 Fase 3: Cierre de Desarrollo y Pull Request (Mover a In Review)

### 1. Validar Definition of Done (DoD)
- [ ] Criterios de aceptación de la HU cumplidos al 100%.
- [ ] `tsc --noEmit` y `lint` sin errores.
- [ ] Pruebas en emulador o dispositivo físico validadas.
- [ ] Documentación técnica (`docs/contratos.md`, `docs/backlog.md`) actualizada.

### 2. Actualizar `docs/backlog.md`
Cambiar estado de `en progreso` a `en revisión`.
```powershell
git add docs/backlog.md
git commit -m "docs: marcar <ID> en revision en backlog"
```

### 3. Subir rama a GitHub
```powershell
git push -u origin <nombre-de-rama>
```

### 4. Crear el Pull Request vinculado al Issue
Vía GitHub CLI (`gh pr create`):
```powershell
$prBody = @"
## 🎯 Historia de Usuario / Tarea
- **Backlog ID:** <ID>
- **Closes #<NumeroIssue>**
- **Requerimientos cubiertos:** <RF_M* / RNF_M*>

## 🛠️ Cambios introducidos
- <Resumen claro de componentes, adaptadores o servicios creados/modificados>

## 🧪 Cómo probar este PR
```powershell
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd test
```

## ✅ Checklist de Definition of Done (AGENTS.md)
- [x] Respeta patrones arquitectónicos (Singleton Axios, Adapter DTOs, Observer Context).
- [x] Almacenamiento seguro de tokens con expo-secure-store.
- [x] Pruebas y verificación de tipos en verde.
- [x] Documentación y docs/backlog.md actualizados.
- [x] Sin secretos versionados.
"@

gh pr create --title "<tipo>(<alcance>): <ID> <resumen>" --body $prBody
```

### 5. Mover tarjeta en Kanban a `In review`
Ceder el paso a la revisión de pares humana.

---

## 🏁 Fase 4: Post-Merge y Cierre (Mover a Done)

1. **Sincronizar `main` local:**
   ```powershell
   git checkout main
   git pull origin main
   ```
2. **Limpiar rama local:**
   ```powershell
   git branch -d <nombre-de-rama>
   git fetch -p
   ```
3. **Actualizar `docs/backlog.md` a `terminado`** indicando referencia del PR (`PR #N`).
4. **Commitear y pushear:**
   ```powershell
   git add docs/backlog.md
   git commit -m "docs: marcar <ID> terminado en backlog"
   git push origin main
   ```
5. **Verificar cierre de Issue y tarjeta en `Done` en el Tablero Kanban:**
   Si el Issue quedó abierto, cerrarlo con:
   ```powershell
   gh issue close <NumeroIssue> --comment "Cerrado tras el merge de PR #<NumeroPR>."
   ```
