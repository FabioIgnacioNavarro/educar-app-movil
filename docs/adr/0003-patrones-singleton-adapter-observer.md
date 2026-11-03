# ADR 0003: Implementación de Patrones Creacional (Singleton), Estructural (Adapter) y de Comportamiento (Observer)

## Estado
Aceptado

## Contexto
El Plan de Trabajo de la cátedra exige explícitamente la aplicación de tres patrones de diseño de software para garantizar código limpio, mantenible y desacoplado en la aplicación móvil.

## Decisión
Se implementan formalmente los siguientes patrones:

1. **Singleton (Creacional) — `src/api/client.ts`:**
   - Una única instancia global de `AxiosInstance` compartida por toda la aplicación.
   - Centraliza la configuración de URL base (`EXPO_PUBLIC_API_URL`), headers por defecto y timeouts.
   - Aloja interceptores de request para inyectar `Authorization: Bearer <token>` e interceptores de response para manejar errores `401` y renovar el token.

2. **Adapter (Estructural) — `src/adapters/`:**
   - Convierte los DTOs en formato JSON provenientes de Django REST Framework a tipos e interfaces limpios de la vista móvil.
   - Desacopla la UI de variaciones en la base de datos o el backend Django (nombres de campos en español/snake_case, tipos de datos Decimal a string formateada, etc.).

3. **Observer (Comportamiento) — `src/context/` y Hooks de React:**
   - Implementado a través de **React Context API** (`AuthContext`).
   - Los componentes que consumen la sesión o las cuotas actúan como Observadores que reaccionan automáticamente a los cambios de estado del Sujeto (el Contexto).

## Consecuencias
- Desacoplamiento total entre llamadas de red, normalización de datos y componentes visuales.
- Facilidad para escribir pruebas unitarias simulando adaptadores o el cliente HTTP.
