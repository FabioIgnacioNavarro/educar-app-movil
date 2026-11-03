# Contexto del Proyecto: Centro Educativo "Transformar para educar"

**Cátedra:** Metodología de Sistemas II - UTN Facultad Regional Resistencia  
**Equipo de Trabajo:** MaTech Grupo 10  
- **Navarro, Fabio Ignacio**
- **Echeverría, Maximiliano Joel**  
**Repositorio Móvil:** [educar-app-movil](https://github.com/FabioIgnacioNavarro/educar-app-movil)  
**Repositorio Backend / Web:** [educar_pagina](https://github.com/maxechev/educar_pagina)

---

## 1. Propósito y Problemática Institucional

El Centro Educativo "Transformar para educar" cuenta con un sistema web integral implementado en Django (Parte 2 de la materia). Si bien dicho sistema resuelve la administración académica, padres y tutores dependen de una computadora para consultar cuotas, registrar pagos de transferencias o ver los servicios extracurriculares de sus hijos.

Esta aplicación móvil (Parte 3) complementa la plataforma existente brindando a los **Padres/Tutores** y al **Administrador** un canal ágil y accesible para:
1. **Consulta de Cuotas y Estados de Deuda:** Visualización clara de importes, vencimientos y estados (`pendiente`, `parcial`, `pagada`, `vencida`).
2. **Carga Digital de Comprobantes:** Adjuntar fotos o PDFs de transferencias bancarias vinculándolos a facturas de forma directa.
3. **Consulta de Servicios Extracurriculares:** Seguimiento de inscripciones a deportes (máximo 2 por alumno), servicio de transporte escolar (por recorrido) y comedor.
4. **Notificaciones Automáticas:** Avisos mensuales automáticos con facturas en PDF y recordatorios de vencimiento de deuda.
5. **Reportes Móviles:** Consultas discriminadas para padres y reportes de recaudación y cumplimiento para la administración.

---

## 2. Arquitectura de Tres Capas Centralizada

Ambos sistemas (Web y App Móvil) comparten la **misma base de datos centralizada** en el backend Django:

```
[ App Móvil (React Native + Expo) ]  <--- HTTPS/JSON (JWT) ---> [ Backend Django (DRF) ]
[ App Web (Django Templates + JS) ]  <--- HTTP / Sesiones ----> [ Backend Django (Core) ]
                                                                        |
                                                                        v
                                                          [ Base de Datos MySQL/SQLite ]
```

### Principios Fundamentales:
- **Base de datos única:** No hay replicación ni silos de datos móviles.
- **Acceso exclusivo vía API REST:** La app móvil consume la API de Django REST Framework (DRF) mediante tokens JWT.
- **Sincronización en tiempo real:** Cuando un tutor sube un comprobante desde la app, el personal administrativo lo ve al instante en el panel web para su revisión y aprobación.

---

## 3. Roles y Control de Acceso (RNF_M04)

El alcance de la app móvil está estratégicamente delimitado a **dos roles**:

| Rol | Permisos y Alcance en la App Móvil |
| :--- | :--- |
| **Padre / Tutor** | - Acceso restringido **únicamente a sus hijos asociados** (`TutorTutoraAlumno`).<br/>- Consulta de cuotas e historial de pagos.<br/>- Carga de comprobantes multipart asociados a facturas.<br/>- Consulta de deportes, transporte y comedor contratados.<br/>- Recepción de facturas PDF y recordatorios por mail. |
| **Administrador** | - Visualización del estado global de facturas de la institución.<br/>- Validación y control de comprobantes de pago recibidos.<br/>- Consulta de reportes móviles de ingresos, pagos completos e incompletos. |

*Nota:* Los roles Alumno, Docente y Preceptor operan desde el portal web y no forman parte del alcance de la app móvil según el Plan de Trabajo.

---

## 4. Reglas de Negocio del Dominio Escolar

1. **Deportes:** Cada alumno puede inscribirse como máximo a **2 disciplinas deportivas simultáneas**. Existe validación de no solapamiento de horarios.
2. **Transporte Escolar:** Posee **4 recorridos fijos**. La contratación es opcional y variable mes a mes.
3. **Medio de Pago:** No se cobra en efectivo en la app. El método es transferencia bancaria; el padre sube el comprobante (PDF o imagen) y el estado inicial es `pendiente_validacion`.
4. **Múltiples Comprobantes:** Una misma factura puede tener asociados múltiples comprobantes (por ejemplo, pagos parciales).
5. **Composición de la Factura:**
   $$\text{Total Mensual} = \text{Cuota Base (Arancel según Nivel)} + \sum \text{Deportes} + \text{Transporte} + \text{Comedor}$$
6. **Notificaciones Programadas:**
   - **Último día hábil del mes:** Emisión y envío automático de factura en PDF por correo electrónico.
   - **Día 20 de cada mes:** Envío automático de recordatorio a tutores con saldo pendiente.

---

## 5. Entidades Compartidas con el Backend

- `Usuario`: Credenciales de acceso (`nombre_usuario`, `correo`, `contrasenia`, `rol`).
- `Persona`: Datos personales y DNI.
- `Tutor` / `Alumno` / `TutorTutoraAlumno`: Vinculación familiar.
- `Arancel` / `Cuota`: Estructura de costos y períodos.
- `DisciplinaDeportiva`, `GrupoDeportivo`, `InscripcionDeportiva`.
- `RecorridoTransporte`, `InscripcionTransporte`.
- `ServicioComedor`, `InscripcionComedor`.
- `Factura` y `ComprobantePago`: Nuevas entidades para la gestión de cobro móvil.
