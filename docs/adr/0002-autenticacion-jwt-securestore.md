# ADR 0002: Almacenamiento Seguro de Tokens JWT con Expo SecureStore

## Estado
Aceptado

## Contexto
El requerimiento no funcional **RNF_M01** establece taxativamente:
> *"La aplicación debe almacenar el token JWT de forma segura en el dispositivo móvil (utilizando mecanismos nativos como Keystore en Android)."*

El almacenamiento predeterminado en React Native (`AsyncStorage`) persiste los datos como texto plano sin cifrar en el almacenamiento interno de la app, lo que expone tokens de acceso y refresco a vulnerabilidades si el dispositivo sufre un ataque o extracción física.

## Decisión
Se decide implementar el almacenamiento de tokens JWT utilizando la librería oficial **`expo-secure-store`**.

## Consecuencias
### Positivas
- En Android, los tokens se cifran mediante **Android Keystore system** y `EncryptedSharedPreferences`.
- En iOS, se almacena en el **Keychain** del sistema.
- Cumplimiento estricto del requerimiento **RNF_M01**.
- API simple y asíncrona (`getItemAsync`, `setItemAsync`, `deleteItemAsync`).

### Negativas / Mitigaciones
- Límite de tamaño por clave (2048 bytes), el cual es más que suficiente para almacenar un par de tokens JWT (`access` y `refresh`).
