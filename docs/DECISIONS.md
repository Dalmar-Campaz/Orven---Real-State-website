# Registro de decisiones técnicas

Este documento distingue decisiones implementadas de limitaciones y propuestas futuras. No se atribuyen motivos históricos cuando no están documentados.

## D-001 — No utilizar una base de datos real

- **Estado:** vigente como requisito académico.
- **Decisión:** mantener el prototipo sin servidor ni motor de base de datos. El catálogo base se lee desde `public/datos.json`; `localStorage` conserva solicitudes, publicaciones aprobadas localmente y favoritos.
- **Consecuencias:** no hay sincronización entre usuarios ni dispositivos. El JSON público se modifica en el repositorio y no puede escribirse desde el navegador.
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
- **Consecuencia:** CSS propio, con Grid/Flexbox y media queries; no se utiliza Tailwind.

## D-005 — Utilizar Vite

- **Estado:** implementada.
- **Decisión:** Vite gestiona el servidor de desarrollo y la compilación.
- **Evidencia:** `vite.config.ts`, `package.json`.

## D-006 — Mantener la autenticación como simulación frontend

- **Estado:** limitación vigente.
- **Decisión:** asignar `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos.
- **Consecuencias:** no se comprueba la contraseña en un servidor y el rol se puede manipular desde el navegador. La protección de rutas no equivale a autorización segura.

## D-007 — Estabilizar los cimientos antes de integrar funciones avanzadas

- **Estado:** cumplida como secuencia de trabajo.
- **Decisión:** completar modelo, estado compartido, persistencia y protección de rutas antes de integrar el catálogo y funciones de usuario.
- **Evidencia:** plan de trabajo en `docs/correcion de errores/FIXROADMAP 001.md`.

## D-008 — Separar propiedades publicadas y solicitudes

- **Estado:** implementada.
- **Decisión:** `DatosPropiedad` contiene los campos comunes; `Propiedad` representa un inmueble publicado; `SolicitudPropiedad` representa una solicitud con estado, solicitante y motivo de rechazo.
- **Consecuencias:** una solicitud pendiente no se trata como propiedad publicada.

## D-009 — Mantener un catálogo de operaciones extensible

- **Estado:** implementada en el modelo; los datos iniciales se concentran en venta.
- **Decisión:** `Operacion` admite `"Venta"` y `"Arriendo"`. Las opciones que aparecen en el catálogo se calculan desde los registros cargados.

## D-010 — Compartir el estado de propiedades y solicitudes con Context

- **Estado:** implementada.
- **Decisión:** `PropiedadesContext` expone catálogo, agentes, solicitudes y favoritos; contiene las operaciones de crear, aprobar y rechazar solicitudes.

## D-011 — Convertir las imágenes del formulario a data URLs

- **Estado:** implementada.
- **Decisión:** usar URLs `blob:` solo para previsualización y convertir archivos a data URLs al guardar la solicitud.
- **Consecuencias:** las imágenes no dependen de URLs temporales después de desmontar el formulario. Las data URLs consumen espacio significativo en almacenamiento local.

## D-012 — Recibir los datos de contacto desde el formulario

- **Estado:** implementada.
- **Decisión:** pedir nombre, teléfono y correo del solicitante. El correo se prellena si hay sesión.
- **Consecuencia:** se permite registrar una solicitud sin iniciar sesión.

## D-013 — Persistir operaciones locales en localStorage

- **Estado:** implementada.
- **Decisión:** guardar el formato versionado bajo `orven_propiedades`. La versión 3 contiene solo `propiedadesLocales` (inmuebles creados al aprobar solicitudes) y `solicitudes`.
- **Manejo de errores:** validar el JSON al leer; si el navegador rechaza un guardado, no actualizar React ni mostrar éxito.
- **Sincronización:** escuchar `storage` para reflejar cambios en otras pestañas del mismo navegador/origen.
- **Consecuencias:** el catálogo base no se duplica en almacenamiento local. Los cambios locales no modifican `public/datos.json`.

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

- **Estado:** ampliada por D-019 y D-020.
- **Decisión histórica:** construir `/propiedades` tomando como referencia la página diseñada y consumir propiedades mediante `usePropiedades`.

## D-018 — Compartir y persistir favoritos mediante PropiedadesContext

- **Estado:** implementada.
- **Decisión:** mantener los IDs favoritos en `PropiedadesContext` como `number[]`, exponerlos mediante `favoritos` y modificarlos con `alternarFavorito(id)`. Persistir el arreglo por separado en `localStorage` bajo `orven_favoritos`.
- **Consecuencias:** el estado se comparte entre páginas y pestañas del mismo origen, sobrevive recargas y no está asociado al usuario simulado.

## D-019 — Utilizar public/datos.json como única fuente del catálogo base

- **Estado:** implementada.
- **Contexto:** la rúbrica exige cargar los registros desde un archivo JSON con dos entidades relacionadas.
- **Decisión:** `public/datos.json` contiene las propiedades y los agentes iniciales. `PropiedadesContext` lee y valida el archivo con `fetch`; los componentes no importan arreglos de propiedades en TypeScript.
- **Consecuencias:** agregar registros o categorías al JSON se refleja al recargar sin modificar componentes. El archivo no puede escribirse desde el navegador. Las publicaciones generadas desde el formulario y aprobadas por Admin son registros locales separados.
- **Evidencia:** `public/datos.json`, `src/context/PropiedadesContext.tsx`, `src/types/propiedad.ts`.

## D-020 — Derivar filtros y resultados desde el catálogo

- **Estado:** implementada.
- **Contexto:** la rúbrica exige filtros, filtros anidados y opciones derivadas de los datos.
- **Decisión:** derivar tipos, operaciones y habitaciones con `map()` y `Set`; aplicar ubicación, tipo, operación, precio y habitaciones mediante `filter()`; calcular el promedio con `reduce()`. Home envía los criterios al catálogo.
- **Consecuencias:** los filtros funcionan simultáneamente y una categoría nueva del JSON aparece sin editar JSX.

## D-021 — Incorporar detalle individual y sección de favoritos

- **Estado:** implementada.
- **Decisión:** añadir `/propiedades/:id` y `/favoritos`; ambas páginas consumen el mismo Context que Home y el catálogo.

## D-022 — Eliminar fixtures de propiedades y solicitudes hardcodeadas

- **Estado:** implementada.
- **Contexto:** después de integrar la fuente JSON, `src/data/propiedades.ts` todavía contenía cuatro propiedades de ejemplo y ocho solicitudes precargadas.
- **Decisión:** eliminar el archivo de datos TypeScript y retirar el fallback de solicitudes de muestra. Una instalación nueva carga el catálogo desde JSON y Admin comienza sin solicitudes; las solicitudes aparecen cuando se envía el formulario.
- **Migración:** al leer estados antiguos (versiones 1 y 2), descartar las cuatro propiedades de muestra (IDs 1–4) y las ocho solicitudes precargadas (IDs 1–8).
- **Consecuencias:** no hay catálogo de propiedades paralelo en código. El formulario y la aprobación administrativa siguen funcionando.
- **Evidencia:** eliminación de `src/data/propiedades.ts`, `src/context/PropiedadesContext.tsx`.

## D-023 — Persistir solo contenido local generado por el usuario

- **Estado:** implementada.
- **Decisión:** la versión 3 de `orven_propiedades` almacena `propiedadesLocales` y `solicitudes`, no una copia del catálogo completo.
- **Consecuencias:** `datos.json` permanece como fuente base; los registros aprobados localmente se combinan para soportar el flujo académico sin backend.

## D-024 — Centralizar y limpiar la navegación compartida

- **Estado:** implementada.
- **Decisión:** mantener la estructura y estilos comunes de la barra de navegación en `HomeNavbar`, y dejar en las páginas solo los ajustes propios de cada vista.
- **Consecuencias:** Home, catálogo, detalle y favoritos comparten una sola implementación visual.


## D-025 — Configurar fallback para rutas SPA en Render

- **Estado:** implementada.
- **Contexto:** la aplicación usa `BrowserRouter`. La navegación interna funcionaba, pero al abrir o recargar directamente una ruta como `/propiedades` el servidor de Render podía responder 404 antes de que React Router se ejecutara.
- **Decisión:** añadir `public/_redirects` con la regla `/* /index.html 200`. Vite copia los archivos de `public/` a la raíz de `dist/`; Render Static Sites aplica la regla como rewrite interno hacia la entrada de la SPA.
- **Consecuencias:** las rutas de cliente se sirven desde `index.html` y React Router decide qué página renderizar. Las rutas desconocidas siguen el fallback `*` definido en `src/App.tsx`.
- **Verificación pendiente en el entorno desplegado:** abrir y recargar directamente rutas internas después de que Render publique el nuevo build.
- **Evidencia:** `public/_redirects`, `src/App.tsx`, `vite.config.ts`.
