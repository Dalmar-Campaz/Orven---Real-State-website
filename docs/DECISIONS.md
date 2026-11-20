# Registro de decisiones técnicas

Este documento distingue decisiones implementadas de limitaciones y propuestas futuras. No se atribuyen motivos históricos cuando no están documentados.

## D-001 — No utilizar una base de datos real

- **Estado:** vigente como requisito académico comunicado.
- **Decisión:** mantener el prototipo sin servidor ni motor de base de datos; utilizar datos TypeScript y almacenamiento local del navegador para persistir el ejemplo.
- **Consecuencias:** menor complejidad e infraestructura; los datos no son compartidos entre usuarios o dispositivos. La aceptación de `localStorage` como apoyo al prototipo debe confirmarse con el profesor.
- **Evidencia:** `src/data/propiedades.ts`, `src/context/PropiedadesContext.tsx`.

## D-002 — Compartir la sesión mediante React Context

- **Estado:** implementada.
- **Decisión:** `AuthContext` expone `user`, `login` y `logout`.
- **Persistencia:** `localStorage/orven_user` cuando «Recordar mi sesión» está activo; `sessionStorage/orven_user_session` cuando está desactivado.
- **Consecuencias:** la sesión puede sobrevivir una recarga o limitarse a la pestaña. No se almacenan contraseñas.

## D-003 — Utilizar React Router DOM

- **Estado:** implementada.
- **Decisión:** declarar las rutas de la SPA en `src/App.tsx`.
- **Consecuencias:** navegación sin recargar la aplicación. `/propiedades` muestra el catálogo público conectado al contexto compartido.

## D-004 — Mantener los estilos junto a páginas y componentes

- **Estado:** convención vigente.
- **Decisión:** conservar CSS junto a los TSX correspondientes.
- **Consecuencia:** los CSS actuales son hojas globales normales, no CSS Modules.

## D-005 — Utilizar Vite

- **Estado:** implementada.
- **Decisión:** Vite gestiona el servidor de desarrollo y la compilación.
- **Evidencia:** `vite.config.ts`, `package.json`.

## D-006 — Mantener la autenticación como simulación frontend

- **Estado:** limitación vigente.
- **Decisión:** asignar `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos.
- **Consecuencias:** no se comprueba la contraseña en un servidor y el rol se puede manipular desde el navegador. La protección de rutas evita navegación accidental, pero no equivale a autorización segura.

## D-007 — Estabilizar los cimientos antes de integrar el catálogo y las funciones avanzadas

- **Estado:** cumplida como secuencia de trabajo.
- **Decisión:** completar el modelo, el estado compartido, la persistencia y la protección de rutas antes de integrar el diseño final de catálogo y las funciones de usuario.
- **Resultado:** los cimientos se implementaron antes de integrar el catálogo público en `/propiedades`. Las funciones avanzadas que siguen pendientes se detallan en la arquitectura.
- **Evidencia:** plan de trabajo en `docs/correcion de errores/FIXROADMAP 001.md`.

## D-008 — Separar propiedades publicadas y solicitudes

- **Estado:** implementada.
- **Decisión:** `DatosPropiedad` contiene los campos comunes; `Propiedad` representa un inmueble publicado; `SolicitudPropiedad` representa una solicitud con estado, solicitante y motivo de rechazo.
- **Consecuencias:** una solicitud pendiente no se trata como propiedad publicada.
- **Evidencia:** `src/types/propiedad.ts`.

## D-009 — Manejar únicamente la operación «Venta»

- **Estado:** implementada por ahora.
- **Decisión:** `Operacion` admite solo `"Venta"`.
- **Consecuencias:** agregar arriendo exige ampliar el tipo y revisar los consumidores.

## D-010 — Compartir propiedades y solicitudes con un Context propio

- **Estado:** implementada.
- **Decisión:** `PropiedadesContext` expone los datos y las funciones para crear, aprobar y rechazar solicitudes. No se agrega una librería externa de estado.
- **Consecuencias:** Home, Admin y el formulario consumen una única fuente compartida.

## D-011 — Convertir las imágenes del formulario a data URLs

- **Estado:** implementada.
- **Decisión:** usar URLs `blob:` solo para previsualización y convertir archivos a data URLs al guardar la solicitud.
- **Consecuencias:** las imágenes no dependen de URL temporales después de desmontar el formulario. Las data URLs consumen espacio significativo en almacenamiento local.

## D-012 — Recibir los datos de contacto desde el formulario

- **Estado:** implementada.
- **Decisión:** pedir nombre, teléfono y correo del solicitante. El correo se prellena si hay sesión.
- **Consecuencia:** se permite registrar una solicitud sin iniciar sesión.

## D-013 — Persistir propiedades y solicitudes en localStorage

- **Estado:** implementada en la rama de finalización de Fase 1; pendiente de prueba manual y de confirmación académica.
- **Decisión:** guardar ambas colecciones juntas bajo `orven_propiedades` en un JSON versionado.
- **Manejo de errores:** validar el JSON al leer; si está corrupto, volver a los datos de ejemplo. Si el navegador rechaza un guardado, no actualizar React ni mostrar éxito.
- **Sincronización:** escuchar `storage` para reflejar cambios en otras pestañas del mismo navegador/origen.
- **Consecuencias:** persiste en ese navegador, no en otros dispositivos o usuarios. La cuota limita el tamaño de las imágenes.

## D-014 — Persistir la sesión según «Recordar mi sesión»

- **Estado:** implementada en la rama de finalización de Fase 1.
- **Decisión:** checkbox marcado usa `localStorage`; desmarcado usa `sessionStorage`. La lectura valida el objeto y no guarda la contraseña.
- **Evidencia:** `src/context/AuthContext.tsx`, `src/pages/Login/Login.tsx`.

## D-015 — Proteger el panel por rol

- **Estado:** implementada en la rama de finalización de Fase 1.
- **Decisión:** `ProtectedRoute` redirige visitantes a `/login` y usuarios `customer` a Home. Solo `admin` entra a `/admin`.
- **Consecuencia:** es una restricción de interfaz; sin backend no se considera seguridad real.
- **Evidencia:** `src/routes/ProtectedRoute.tsx`, `src/App.tsx`.

## D-016 — Mantener el catálogo temporal hasta la Fase 2

- **Estado:** reemplazada por D-017.
- **Decisión histórica:** mantener `/propiedades` activa con un aviso y enlace de regreso mientras se estabilizaba el modelo y el estado compartido.
- **Evidencia:** commits de cierre de la Fase 1.

## D-017 — Integrar el catálogo público desde el diseño aprobado

- **Estado:** implementada; el catálogo está activo en `/propiedades` en la rama `main`.
- **Contexto:** la Fase 1 dejó lista una fuente compartida de propiedades publicadas; el catálogo temporal debía sustituirse por la página diseñada.
- **Decisión:** construir `/propiedades` tomando como referencia la página 2 del PDF de diseño y consumir `propiedades` mediante `usePropiedades`. Las tarjetas muestran la imagen principal, precio, ubicación corta (sector y ciudad cuando hay sector), habitaciones, baños y área.
- **Controles pendientes:** búsqueda, filtros, ordenamiento, vista de mapa, paginación y navegación al detalle se muestran deshabilitados y quedan para la Fase 3. El botón de favoritos de cada tarjeta sí funciona y persiste sus IDs mediante `PropiedadesContext`. La opción «Arriendo» también permanece deshabilitada porque `Operacion` solo admite actualmente `Venta`.
- **Consecuencias:** las propiedades aprobadas en Admin aparecen automáticamente en el catálogo, sin un arreglo paralelo ni registros ficticios. No se modificó el modelo de datos.
- **Evidencia:** `src/pages/Propiedades/Propiedades.tsx`, `src/pages/Propiedades/Propiedades.css`, `src/context/PropiedadesContext.tsx`.

## D-018 — Compartir y persistir favoritos mediante PropiedadesContext

- **Estado:** implementada.
- **Contexto:** Home y el catálogo reutilizan `TarjetaPropiedad`, que ofrece una acción para agregar o quitar una propiedad de favoritos.
- **Decisión:** mantener los IDs favoritos en `PropiedadesContext` como `number[]`, exponerlos mediante `favoritos` y modificarlos con `alternarFavorito(id)`. Persistir el arreglo por separado en `localStorage` bajo la clave `orven_favoritos`.
- **Consecuencias:** el estado se comparte entre Home y el catálogo, sobrevive recargas y se sincroniza entre pestañas del mismo origen. No está asociado al usuario simulado; todos los usuarios del mismo navegador/origen comparten el arreglo.
- **Evidencia:** `src/context/PropiedadesContext.tsx`, `src/components/TarjetaPropiedad/TarjetaPropiedad.tsx`, `src/pages/Home/Home.tsx`, `src/pages/Propiedades/Propiedades.tsx`.
## Plantilla para nuevas decisiones

```md
## D-XXX — Título breve

- **Estado:** propuesta | aceptada | reemplazada.
- **Contexto:** qué necesidad motivó la decisión.
- **Alternativas consideradas:** opciones evaluadas.
- **Decisión:** qué se eligió.
- **Consecuencias:** ventajas, límites y compromisos.
- **Evidencia:** archivos o cambios relacionados.
```
