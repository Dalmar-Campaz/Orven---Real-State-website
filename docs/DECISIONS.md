# Registro de decisiones técnicas

Este documento distingue decisiones implementadas de limitaciones y propuestas futuras. No se atribuyen motivos históricos cuando no están documentados.

## D-001 — No utilizar una base de datos real

- **Estado:** vigente como requisito académico.
- **Decisión:** mantener el prototipo sin servidor ni motor de base de datos. El catálogo inicial se lee desde `public/datos.json`; `localStorage` se utiliza solamente para conservar el flujo local de solicitudes, aprobaciones y favoritos.
- **Consecuencias:** no hay sincronización entre usuarios ni dispositivos. El JSON público es estático y se modifica en el repositorio.
- **Evidencia:** `public/datos.json`, `src/context/PropiedadesContext.tsx`.

## D-002 — Compartir la sesión mediante React Context

- **Estado:** implementada.
- **Decisión:** `AuthContext` expone `user`, `login` y `logout`.
- **Persistencia:** `localStorage/orven_user` cuando «Recordar mi sesión» está activo; `sessionStorage/orven_user_session` cuando está desactivado.
- **Consecuencias:** la sesión puede sobrevivir una recarga o limitarse a la pestaña. No se almacenan contraseñas.

## D-003 — Utilizar React Router DOM

- **Estado:** implementada.
- **Decisión:** declarar las rutas de la SPA en `src/App.tsx`.
- **Consecuencias:** navegación sin recargar la aplicación. Las rutas incluyen Home, Login, Admin, formulario, catálogo, detalle y favoritos.

## D-004 — Mantener los estilos junto a páginas y componentes

- **Estado:** vigente.
- **Decisión:** conservar CSS junto a los TSX correspondientes.
- **Consecuencia:** los CSS son hojas globales normales, no CSS Modules.

## D-005 — Utilizar Vite

- **Estado:** implementada.
- **Decisión:** Vite gestiona el servidor de desarrollo y la compilación.
- **Evidencia:** `vite.config.ts`, `package.json`.

## D-006 — Mantener la autenticación como simulación frontend

- **Estado:** limitación vigente.
- **Decisión:** asignar `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos.
- **Consecuencias:** no se comprueba la contraseña en un servidor y el rol se puede manipular desde el navegador. La protección de rutas evita navegación accidental, pero no equivale a autorización segura.

## D-007 — Estabilizar los cimientos antes de integrar funciones avanzadas

- **Estado:** cumplida como secuencia de trabajo.
- **Decisión:** completar modelo, estado compartido, persistencia y protección de rutas antes de integrar catálogo y funciones de usuario.
- **Evidencia:** plan de trabajo en `docs/correcion de errores/FIXROADMAP 001.md`.

## D-008 — Separar propiedades publicadas y solicitudes

- **Estado:** implementada.
- **Decisión:** `DatosPropiedad` contiene los campos comunes; `Propiedad` representa un inmueble publicado; `SolicitudPropiedad` representa una solicitud con estado, solicitante y motivo de rechazo.
- **Consecuencias:** una solicitud pendiente no se trata como propiedad publicada.
- **Evidencia:** `src/types/propiedad.ts`.

## D-009 — Mantener un catálogo de operaciones extensible

- **Estado:** implementada en el modelo; los datos iniciales se concentran en venta.
- **Decisión:** `Operacion` admite `"Venta"` y `"Arriendo"`. Las opciones que aparecen en el catálogo se calculan desde los registros cargados.
- **Consecuencias:** las opciones de filtro no necesitan escribirse manualmente.

## D-010 — Compartir propiedades y solicitudes con un Context propio

- **Estado:** implementada.
- **Decisión:** `PropiedadesContext` expone los datos y las funciones para crear, aprobar y rechazar solicitudes. No se agrega una librería externa de estado.
- **Consecuencias:** Home, Admin, formulario, catálogo, detalle y favoritos consumen una fuente compartida.

## D-011 — Convertir las imágenes del formulario a data URLs

- **Estado:** implementada.
- **Decisión:** usar URLs `blob:` solo para previsualización y convertir archivos a data URLs al guardar la solicitud.
- **Consecuencias:** las imágenes no dependen de URL temporales después de desmontar el formulario. Las data URLs consumen espacio significativo en almacenamiento local.

## D-012 — Recibir los datos de contacto desde el formulario

- **Estado:** implementada.
- **Decisión:** pedir nombre, teléfono y correo del solicitante. El correo se prellena si hay sesión.
- **Consecuencia:** se permite registrar una solicitud sin iniciar sesión.

## D-013 — Persistir operaciones locales en localStorage

- **Estado:** implementada.
- **Decisión:** guardar propiedades locales y solicitudes bajo `orven_propiedades` en un JSON versionado.
- **Manejo de errores:** validar el JSON al leer; si está corrupto, descartar el estado inválido. Si el navegador rechaza un guardado, no actualizar React ni mostrar éxito.
- **Sincronización:** escuchar `storage` para reflejar cambios en otras pestañas del mismo navegador/origen.
- **Consecuencias:** persiste en ese navegador, no en otros dispositivos o usuarios. El catálogo base sigue viniendo de `public/datos.json`.

## D-014 — Persistir la sesión según «Recordar mi sesión»

- **Estado:** implementada.
- **Decisión:** checkbox marcado usa `localStorage`; desmarcado usa `sessionStorage`. La lectura valida el objeto y no guarda la contraseña.
- **Evidencia:** `src/context/AuthContext.tsx`, `src/pages/Login/Login.tsx`.

## D-015 — Proteger el panel por rol

- **Estado:** implementada.
- **Decisión:** `ProtectedRoute` redirige visitantes a `/login` y usuarios `customer` a Home. Solo `admin` entra a `/admin`.
- **Consecuencia:** es una restricción de interfaz; sin backend no se considera seguridad real.

## D-016 — Mantener un catálogo temporal

- **Estado:** reemplazada.
- **Decisión histórica:** mantener `/propiedades` activa con un aviso mientras se estabilizaba el modelo y el estado compartido.

## D-017 — Integrar el catálogo público desde el diseño aprobado

- **Estado:** reemplazada y ampliada por D-019 y D-020.
- **Decisión histórica:** construir `/propiedades` tomando como referencia la página diseñada y consumir propiedades mediante `usePropiedades`.

## D-018 — Compartir y persistir favoritos mediante PropiedadesContext

- **Estado:** implementada.
- **Decisión:** mantener los IDs favoritos en `PropiedadesContext` como `number[]`, exponerlos mediante `favoritos` y modificarlos con `alternarFavorito(id)`. Persistir el arreglo por separado en `localStorage` bajo `orven_favoritos`.
- **Consecuencias:** el estado se comparte entre páginas y pestañas del mismo origen, sobrevive recargas y no está asociado al usuario simulado.

## D-019 — Utilizar public/datos.json como fuente del catálogo académico

- **Estado:** implementada.
- **Contexto:** la rúbrica exige que las tarjetas y los detalles procedan de un archivo `datos.json` en `public/`, con dos entidades relacionadas.
- **Decisión:** almacenar en el JSON 20 propiedades y 5 agentes; cada propiedad guarda el ID de su agente en `agenteId`. `PropiedadesContext` lee el archivo con `fetch` y valida cantidades, estructura, IDs únicos y relaciones.
- **Consecuencias:** al agregar registros o categorías al JSON, se reflejan al recargar sin modificar componentes. Los datos son ficticios. El JSON público no se reemplaza por localStorage.
- **Evidencia:** `public/datos.json`, `src/context/PropiedadesContext.tsx`, `src/types/propiedad.ts`.

## D-020 — Derivar filtros y resultados desde el catálogo

- **Estado:** implementada.
- **Contexto:** la rúbrica exige al menos un filtro, filtros anidados y opciones obtenidas de los datos.
- **Decisión:** derivar tipos, operaciones y cantidades de habitaciones con `map()` y `Set`; cruzar ubicación, tipo, operación, precio y habitaciones mediante varios `filter()`; calcular el promedio del conjunto con `reduce()`. Home envía criterios al catálogo.
- **Consecuencias:** los filtros trabajan a la vez; una categoría nueva en el JSON aparece en las opciones sin editar JSX.

## D-021 — Incorporar detalle individual y sección de favoritos

- **Estado:** implementada.
- **Decisión:** añadir `/propiedades/:id` para mostrar el inmueble y su agente relacionado, y `/favoritos` para consultar los IDs guardados.
- **Consecuencias:** se conserva el flujo de favoritos existente y se completa la acción «Ver detalles» sin cambiar la identidad visual del catálogo.
