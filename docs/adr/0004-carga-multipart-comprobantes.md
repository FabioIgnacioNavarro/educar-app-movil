# ADR 0004: Estrategia de Carga Multipart de Comprobantes de Pago

## Estado
Aceptado

## Contexto
El requerimiento funcional **RF_M08** exige permitir a los padres/tutores adjuntar comprobantes de pago por transferencia bancaria (imágenes JPG/PNG o archivos PDF) asociados a una factura específica mediante envío multipart (`FormData`).

En React Native, el envío de archivos mediante `FormData` con Axios presenta problemas conocidos si el objeto de archivo no respeta la firma nativa requerida por el motor de red móvil (`{ uri, name, type }`) o si se fuerzan headers de `Content-Type: multipart/form-data` con boundaries incompatibles.

## Decisión
1. Usar `expo-document-picker` para PDFs e imágenes y `expo-image-picker` para capturas desde cámara o galería.
2. Formatear explícitamente el campo de archivo en el `FormData`:
   ```typescript
   formData.append('archivo_comprobante', {
     uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
     name: file.name || 'comprobante.pdf',
     type: file.mimeType || 'application/pdf',
   } as any);
   ```
3. Permitir que Axios y el cliente nativo generen automáticamente el header `Content-Type` con su respectivo `boundary`.

## Consecuencias
- Carga confiable en emuladores y dispositivos Android físicos.
- Compatibilidad directa con el parser `MultiPartParser` y `FormParser` de Django REST Framework en el backend.
