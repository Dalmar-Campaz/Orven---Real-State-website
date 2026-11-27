# Arquitectura de Orven

## 1. Visión general

Orven es una aplicación frontend de una sola página (SPA) construida con React, TypeScript y Vite. React Router DOM gestiona la navegación y dos Contexts comparten el estado:

- `AuthContext`: sesión y rol de demostración.
- `PropiedadesContext`: catálogo, agentes, solicitudes y favoritos.

No hay backend ni motor de base de datos. El catálogo base se carga mediante `fetch("/datos.json")` desde `public/datos.json`. No hay arreglos TypeScript paralelos ni propiedades ficticias para inicializar Home o el catálogo.

`localStorage` solo conserva el trabajo generado dentro de la aplicación: solicitudes recibidas, propiedades aprobadas localmente y favoritos. No sustituye el JSON como fuente del catálogo base.

## 2. Arranque de la aplicación

1. Vite sirve `index.html` y los archivos de `public/`.
2. `src/main.tsx` importa `index.css`, crea la raíz de React y renderiza `App` dentro de `React.StrictMode`.
3. `src/App.tsx` monta `AuthProvider` → `PropiedadesProvider` → `BrowserRouter` → `AppRoutes`.
4. `PropiedadesProvider` solicita `/datos.json`, valida el contrato y carga las propiedades y los agentes.
5. Mientras se carga el archivo, `AppRoutes` presenta el estado de carga. Si falla la lectura o la validación, presenta un estado de error y no muestra un catálogo incompleto.
6. `AppRoutes` consulta la sesión con `useAuth` y declara las rutas.
7. `ProtectedRoute` comprueba la sesión y el rol antes de mostrar el panel administrativo.
8. En producción, Render debe entregar `index.html` para las rutas que no correspondan a archivos estáticos. La regla `public/_redirects` (`/* /index.html 200`) se copia a `dist/_redirects` con Vite y permite que `BrowserRouter` resuelva las rutas al abrirlas o recargarlas directamente.

## 3. Estructura principal

| Ruta | Responsabilidad |
|---|---|
| `public/datos.json` | Fuente del catálogo base: 20 propiedades y 5 agentes relacionados mediante `agenteId`. |
| `src/assets/` | Logos e iconos compartidos. |
| `src/components/AvatarProfile/` | Menú de cuenta y cierre de sesión. |
| `src/components/HomeNavbar/` | Navegación compartida entre páginas públicas. |
| `src/components/TarjetaPropiedad/` | Tarjeta reutilizada en Home, catálogo y favoritos; controla favoritos y detalle. |
| `src/context/AuthContext.tsx` | Sesión y rol de demostración. |
| `src/context/PropiedadesContext.tsx` | Lectura/validación del JSON, operaciones y persistencia local. |
| `src/types/propiedad.ts` | Tipos de propiedad, agente, solicitud y catálogo. |
| `src/utils/archivos.ts` | Conversión de archivos a data URL. |
| `src/utils/formato.ts` | Formato de precio y ubicación. |
| `src/routes/ProtectedRoute.tsx` | Restricción de interfaz por sesión y rol. |
| `src/pages/` | Home, Login, Admin, formulario, catálogo, detalle y favoritos. |
| `src/App.tsx` | Proveedores y rutas. |
| `src/main.tsx` | Punto de entrada de React. |

El antiguo archivo `src/data/propiedades.ts` se eliminó. No existe un catálogo de propiedades hardcodeado en TypeScript.

## 4. Rutas

| Ruta | Componente | Comportamiento |
|---|---|---|
| `/` | `Home` | Página principal; muestra propiedades destacadas del JSON y buscador conectado al catálogo. |
| `/login` | `Login` | Formulario de acceso simulado. Si hay sesión, redirige según el rol. |
| `/admin` | `ProtectedRoute` → `AdminPanel` | Solo permite entrar al rol `admin`; revisa solicitudes enviadas desde el formulario. |
| `/formulario` | `RegistrarPropiedad` | Crea una solicitud pendiente y la relaciona con un agente del JSON. |
| `/propiedades` | `Propiedades` | Catálogo con filtros combinados, ordenamiento y paginación. |
| `/propiedades/:id` | `DetallePropiedad` | Detalle del inmueble y del agente relacionado. |
| `/favoritos` | `Favoritos` | Colección de propiedades guardadas. |
| Cualquier otra ruta | — | Redirige a Home. |

Un usuario sin sesión que visite `/admin` es enviado a `/login`. Un usuario `customer` es enviado a Home.

## 5. Sesión y roles

`AuthContext` expone `user`, `login(email, role, remember)` y `logout()`.

- Con «Recordar mi sesión» marcado, la sesión se guarda en `localStorage/orven_user`.
- Sin marcarlo, se guarda en `sessionStorage/orven_user_session`; desaparece al cerrar esa pestaña.
- La lectura valida el JSON y tolera valores corruptos o almacenamiento no disponible.
- La contraseña nunca se guarda.
- Los cambios de `orven_user` en otra pestaña actualizan la sesión mediante el evento `storage`.

El login asigna el rol `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos. No hay comprobación de contraseñas ni servidor de identidad.

**Seguridad:** el rol está en el navegador y puede modificarse. `ProtectedRoute` evita navegación accidental, pero no proporciona seguridad real ni reemplaza autorización en un backend.

## 6. PropiedadesContext

`src/context/PropiedadesContext.tsx` es la fuente compartida para las páginas.

| Valor o función | Responsabilidad |
|---|---|
| `propiedades` | Propiedades del JSON más las aprobadas localmente desde una solicitud. |
| `agentes` | Asesores leídos desde `datos.json`. |
| `solicitudes` | Solicitudes enviadas desde el formulario. No hay solicitudes de muestra en una instalación nueva. |
| `favoritos` | IDs de propiedades favoritas (`number[]`). |
| `cargando`, `errorCarga` | Estado de la lectura y validación del JSON. |
| `alternarFavorito(id)` | Agrega o quita un ID y persiste la selección. |
| `crearSolicitud(datos, solicitante)` | Crea una solicitud pendiente, asigna fecha e ID y exige un agente existente. |
| `aprobarSolicitud(id)` | Convierte una solicitud pendiente en una propiedad local publicada. |
| `rechazarSolicitud(id, motivo?)` | Marca la solicitud como rechazada y conserva el motivo opcional. |

El catálogo base se construye únicamente con los registros de `datos.json`. Las propiedades creadas al aprobar una solicitud son registros generados por el usuario, no fixtures precargados.

## 7. Contrato de datos JSON

`public/datos.json` contiene:

- `propiedades`: al menos 20 inmuebles, cada uno con un `id` único.
- `agentes`: al menos 5 asesores, cada uno con un `id` único.

Cada propiedad debe incluir un `agenteId` que coincida con el `id` de un agente. El proveedor valida cantidades mínimas, estructura, tipos, IDs únicos y relaciones.

Las opciones de tipo, operación, ciudad y habitaciones se derivan de los datos cargados. `tipo` es una cadena abierta para que una categoría nueva en el JSON aparezca automáticamente en los filtros.

Si el profesor añade una propiedad, debe usar un ID no repetido y un `agenteId` válido. Si agrega una categoría, basta con asignar su nombre al campo `tipo`; no se requiere modificar TypeScript.

## 8. Persistencia local

La clave `orven_propiedades` conserva un objeto versionado:

```text
{
  version: 3,
  propiedadesLocales: Propiedad[],
  solicitudes: SolicitudPropiedad[]
}
```

- `propiedadesLocales` solo contiene inmuebles creados cuando Admin aprueba una solicitud.
- Los registros base de `datos.json` nunca se copian al almacenamiento local.
- En cada carga se combinan los registros locales con el JSON. Si hay IDs repetidos, prevalece el JSON.
- Los estados antiguos de versiones 1 y 2 se migran; se descartan los cuatro fixtures iniciales de propiedades y las ocho solicitudes ficticias que pertenecían a la versión anterior.
- Los cambios se guardan antes de actualizar React. Si el navegador rechaza el guardado, la operación no se confirma.
- El evento `storage` sincroniza cambios entre pestañas del mismo navegador/origen.

Los favoritos se guardan por separado bajo `orven_favoritos` como un arreglo JSON de IDs. No están asociados al usuario simulado y se comparten en el navegador/origen.

El navegador no puede modificar el archivo estático `public/datos.json`. Por tanto, las propiedades aprobadas desde Admin son visibles como registros locales y no se publican en el JSON del repositorio ni en otros dispositivos.

## 9. Páginas y funcionalidades

- **Home:** genera ciudades, tipos y rangos de precio desde el catálogo. El buscador navega a `/propiedades` con los criterios seleccionados. Las tarjetas destacadas y el agente destacado provienen del contexto. El contacto del agente utiliza su correo del JSON.
- **Login:** valida el formato de correo y la longitud mínima de contraseña; no comprueba credenciales contra un servidor.
- **Admin:** filtra, busca, pagina y permite revisar solicitudes. Aprobar publica localmente la propiedad y rechazar conserva el motivo.
- **RegistrarPropiedad:** valida el formulario, previsualiza archivos, convierte imágenes a data URL y asocia la solicitud al primer agente disponible.
- **Propiedades:** genera opciones de filtros desde los datos; combina ubicación, tipo, operación, precio mínimo/máximo y habitaciones. Ordena por fecha, precio o área, pagina ocho registros y calcula el promedio con `reduce()`.
- **DetallePropiedad:** muestra imágenes, descripción, características y datos del agente relacionado.
- **Favoritos:** muestra las propiedades cuyos IDs están guardados y permite quitarlas de la selección.

## 10. Estilos y validación

Los CSS están junto a páginas y componentes. La navegación compartida tiene sus propios estilos en `HomeNavbar.css`; no se duplica su estructura básica en las páginas. Se utilizan CSS propio, Grid/Flexbox y media queries.

Comandos:

- `npm run lint`: Oxlint.
- `npm run build`: TypeScript y Vite.

El workflow `.github/workflows/quality.yml` ejecuta ambos comandos después de instalar dependencias. No hay un runner de pruebas automatizadas de componentes configurado.

### Despliegue SPA en Render

`BrowserRouter` utiliza rutas del lado del cliente. Al navegar desde Home, React Router puede resolverlas sin pedir un documento nuevo al servidor; al abrir una URL interna directamente o recargarla, Render recibe esa ruta. Sin una regla de rewrite, el servidor intenta localizar un archivo o directorio físico y responde 404 antes de que React arranque.

El archivo `public/_redirects` contiene `/* /index.html 200`. Vite copia los archivos de `public/` a la raíz del directorio de salida (`dist/`), por lo que Render recibe la regla al publicar el sitio. El código `200` configura un rewrite interno y conserva la URL del navegador; React Router interpreta después la ruta. Esta regla no sustituye el manejo de rutas desconocidas definido en `AppRoutes`.
