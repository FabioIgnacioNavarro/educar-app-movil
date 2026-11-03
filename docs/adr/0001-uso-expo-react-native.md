# ADR 0001: Selección de Expo Managed Workflow sobre React Native CLI

## Estado
Aceptado

## Contexto
Para el desarrollo de la aplicación móvil del Centro Educativo "Transformar para educar" (MaTech Grupo 10), se requiere una tecnología multiplataforma para Android capaz de integrarse con el backend Django mediante API REST en un período acotado de 6 semanas.

Se evaluaron dos alternativas principales:
1. **React Native CLI puro:** Mayor control nativo pero requiere configuración manual pesada de Android SDKs, gradle, emuladores locales y vinculación manual de módulos nativos.
2. **Expo Managed Workflow:** Ecosistema completo para React Native con librerías nativas probadas (`expo-secure-store`, `expo-document-picker`), pruebas directas en celulares físicos con Expo Go (código QR) y compilación cloud gratuita con EAS Build.

## Decisión
Se decide adoptar **Expo con TypeScript** (Managed Workflow).

## Consecuencias
### Positivas
- Agilidad inmediata: ambos integrantes del equipo pueden probar en tiempo real escaneando un código QR desde Expo Go en sus teléfonos Android sin lidiar con configuración de SDKs pesados.
- Librerías nativas estandarizadas para el almacenamiento seguro (`expo-secure-store`) y carga de archivos (`expo-document-picker`).
- Facilidad de empaquetado del archivo APK final para la entrega mediante `eas build -p android --profile preview`.

### Negativas / Mitigaciones
- Dependencia del ecosistema de versiones de Expo SDK (mitigado fijando las versiones del runtime en `package.json`).
