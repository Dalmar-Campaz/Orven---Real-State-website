# Arquitectura de Orven

## 1. Visión general

Orven es una aplicación frontend de una sola página (SPA) construida con React, TypeScript y Vite. React Router DOM gestiona la navegación y dos Contexts comparten el estado:

- `AuthContext`: sesión y rol de demostración.
- `PropiedadesContext`: propiedades, agentes, solicitudes y favoritos.

No hay backend ni motor de base de datos. El catálogo de partida se lee desde `public/datos.json` mediante `fetch`, tal como requiere la entrega académica. `localStorage` conserva solicitudes y propiedades aprobadas durante la demostración local; no sustituye el archivo JSON como fuente inicial del catálogo.

## 2. Arranque de la aplicación

Flujo de entrada:

1. Vite sirve `index.html` y los archivos de `public/`.
2. `src/main.tsx` importa `index.css`, crea la raíz de React y renderiza `App` dentro de `React.StrictMode`.
3. `src/App.tsx` monta `AuthProvider` → `PropiedadesProvider` → `BrowserRouter` → `AppRoutes`.
4. `PropiedadesProvider` solicita `/datos.json`, valida el contrato de datos y carga las propiedades y agentes.
5. Mientras se carga el JSON, `AppRoutes` muestra un estado de carga. Si el archivo no existe o no cumple el contrato, muestra un mensaje de error en lugar de renderizar un catálogo vacío como si fuera válido.
6. `AppRoutes` consulta la sesión con `useAuth` y declara las rutas.
7. `ProtectedRoute` comprueba la sesión y el rol antes de mostrar el panel administrativo.

## 3. Estructura principal

| Ruta | Responsabilidad |
|---|---|
| `public/datos.json` | Datos iniciales del catálogo: 20 propiedades y 5 agentes relacionados mediante `agenteId`. |
| `src/assets/` | Logos e iconos compartidos. |
| `src/components/AvatarProfile/` | Menú de cuenta y cierre de sesión. |
| `src/components/HomeNavbar/` | Navegación compartida de la aplicación. |
| `src/components/TarjetaPropiedad/` | Tarjeta reutilizada en Home, catálogo y favoritos; permite guardar y abrir el detalle. |
| `src/context/AuthContext.tsx` | Sesión y rol de demostración. |
| `src/context/PropiedadesContext.tsx` | Lectura/validación del JSON, estado compartido, persistencia y operaciones. |
| `src/data/propiedades.ts` | Solicitudes ficticias iniciales para probar el panel administrativo. |
| `src/types/propiedad.ts` | Tipos del dominio: propiedad, agente, solicitud y contrato JSON. |
| `src/utils/archivos.ts` | Conversión de archivos a data URL. |
| `src/utils/formato.ts` | Formato de precio y ubicación. |
| `src/routes/ProtectedRoute.tsx` | Restricción frontend por sesión y rol. |
| `src/pages/` | Home, Login, Admin, formulario, catálogo, detalle y favoritos. |
| `src/App.tsx` | Proveedores y rutas. |
| `src/main.tsx` | Punto de entrada de React. |

## 4. Rutas

| Ruta | Componente | Comportamiento |
|---|---|---|
| `/` | `Home` | Página principal con propiedades destacadas y buscador conectado al catálogo. |
| `/login` | `Login` | Formulario de acceso simulado. Si hay sesión, redirige según el rol. |
| `/admin` | `ProtectedRoute` → `Admin` | Solo permite entrar al rol `admin`. |
| `/formulario` | `RegistrarPropiedad` | Formulario de solicitud; asocia el primer agente disponible y envía la solicitud a revisión. |
| `/propiedades` | `Propiedades` | Catálogo público con filtros combinados, ordenamiento y paginación. |
| `/propiedades/:id` | `DetallePropiedad` | Vista individual con características e información del agente relacionado. |
| `/favoritos` | `Favoritos` | Colección de propiedades guardadas por el usuario del navegador. |
| Cualquier otra ruta | — | Redirige a Home. |

Un usuario sin sesión que visite `/admin` es enviado a `/login`. Un usuario `customer` es enviado a Home.

## 5. Sesión y roles

`AuthContext` expone `user`, `login(email, role, remember)` y `logout()`.

- Con «Recordar mi sesión» marcado, la sesión se guarda en `localStorage` bajo `orven_user`.
- Sin marcarlo, se guarda en `sessionStorage` bajo `orven_user_session`; desaparece al cerrar esa pestaña.
- La lectura valida la estructura del JSON y tolera valores corruptos o almacenamiento no disponible.
- La contraseña nunca se guarda.
- Los cambios de `orven_user` en otra pestaña actualizan la sesión mediante el evento `storage`.

El login asigna el rol `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos. No hay comprobación de contraseñas ni servidor de identidad.

**Seguridad:** el rol está en el navegador y puede modificarse. `ProtectedRoute` mejora la navegación del prototipo, pero no proporciona seguridad real ni reemplaza autorización en un backend.

## 6. PropiedadesContext y carga de datos

`src/context/PropiedadesContext.tsx` es la fuente compartida para las páginas:

| Valor o función | Responsabilidad |
|---|---|
| `propiedades` | Inmuebles publicados del JSON más los aprobados localmente. |
| `agentes` | Asesores leídos desde `datos.json`. |
| `solicitudes` | Solicitudes de publicación. |
| `favoritos` | Identificadores de propiedades favoritas (`number[]`). |
| `cargando`, `errorCarga` | Estado de la lectura y validación de `datos.json`. |
| `alternarFavorito(id)` | Agrega o quita un identificador y persiste el arreglo de favoritos. |
| `crearSolicitud(datos, solicitante)` | Crea una solicitud pendiente, asigna fecha e id. |
| `aprobarSolicitud(id)` | Convierte una solicitud pendiente en propiedad y actualiza su estado. |
| `rechazarSolicitud(id, motivo?)` | Marca la solicitud como rechazada y conserva el motivo opcional. |

El JSON público es la fuente de los registros base. Al iniciar, el contexto lo vuelve a leer y lo combina con las propiedades locales guardadas cuyos IDs no existan en el archivo. Por eso, agregar un registro al JSON o modificar una propiedad base se refleja al recargar, incluso si existe almacenamiento local de una sesión anterior.

Las solicitudes y las propiedades aprobadas por el administrador se conservan localmente. Solo se procesan solicitudes existentes y pendientes. Al aprobar una solicitud, se conserva la relación con el agente asignado.

## 7. Contrato del archivo JSON

`public/datos.json` tiene dos colecciones:

- `propiedades`: mínimo 20 inmuebles, cada uno con un `id` único y un `agenteId`.
- `agentes`: mínimo 5 agentes, cada uno con un `id` único.

Cada `agenteId` de una propiedad debe coincidir con el `id` de un agente existente. El proveedor valida las cantidades, la estructura, los IDs y las relaciones antes de exponer el catálogo. Los nombres, precios, ubicaciones, características, imágenes y opciones de filtro proceden de esos datos.

Los valores de `tipo` se manejan como cadenas para que una nueva categoría añadida al JSON no requiera modificar el código de React. Las opciones de tipo, operación y habitaciones se calculan desde las propiedades cargadas.

## 8. Persistencia y sincronización

La clave `orven_propiedades` contiene un objeto JSON versionado:

```text
{
  version: 2,
  propiedades: Propiedad[],
  solicitudes: SolicitudPropiedad[]
}
```

- Se acepta también la versión 1 para conservar datos creados antes de integrar `datos.json`.
- Al reconstruir el catálogo, los registros con IDs presentes en el JSON se toman del archivo. Los registros locales con otros IDs se conservan como propiedades aprobadas durante la demostración.
- Cada cambio se escribe en `localStorage` antes de actualizar el estado React.
- Si el navegador rechaza el guardado, la operación lanza un error y no se confirma como exitosa.
- El evento `storage` actualiza otras pestañas del mismo navegador/origen para `orven_propiedades` y `orven_favoritos`.
- Los favoritos se guardan por separado bajo `orven_favoritos` como un arreglo JSON de IDs numéricos.
- La sincronización no cruza navegadores, perfiles ni dispositivos. Los favoritos son globales para el origen del navegador y no están asociados al usuario simulado.

Las imágenes seleccionadas por el formulario se convierten a data URL. Las URL temporales `blob:` se utilizan solo para previsualizar y no se guardan. Las data URLs pueden consumir la cuota de `localStorage`; el formulario y el contexto muestran un error si no se puede guardar.

## 9. Páginas y funcionalidades

- **Home:** genera las opciones de ciudad, tipo y rangos de precio a partir del catálogo JSON. Al buscar, navega a `/propiedades` con los criterios seleccionados. Las propiedades destacadas y el agente destacado se leen del contexto.
- **Login:** valida el formato de correo y la longitud mínima de contraseña; no comprueba credenciales contra un servidor. El checkbox controla el tipo de persistencia de sesión.
- **Admin:** lee solicitudes del contexto, calcula contadores, filtra, pagina y permite ver detalles. Aprobar publica la propiedad; rechazar guarda el motivo.
- **RegistrarPropiedad:** valida el formulario, previsualiza archivos y convierte imágenes a data URL. Asocia la solicitud al primer agente disponible y llama a `crearSolicitud`.
- **Propiedades:** genera dinámicamente las opciones de filtro; combina ubicación, tipo, operación, precio mínimo/máximo y habitaciones. Incluye ordenamiento por fecha, precio y área, paginación de ocho registros y promedio de precio calculado con `reduce()`.
- **DetallePropiedad:** muestra imágenes, descripción, características y datos del agente cuyo ID coincide con `agenteId`.
- **Favoritos:** filtra el catálogo por los IDs guardados y permite quitar inmuebles de la colección.

## 10. Fundamentos web evaluables

- HTML semántico mediante `header`, `nav`, `main`, `section`, `article` y `footer`.
- CSS propio, organizado junto a páginas y componentes, con Flexbox/Grid y media queries.
- `map()` para generar tarjetas y opciones; `filter()` para obtener resultados; `reduce()` para calcular el precio promedio.
- `useState` mantiene los criterios de búsqueda y la página actual.
- `useEffect` en el proveedor realiza la lectura asíncrona del JSON y justifica sus dependencias.

## 11. Estilos y validación

Los CSS están junto a sus páginas/componentes y son hojas globales normales, no CSS Modules. `index.css` se importa desde `main.tsx`.

Comandos disponibles:

- `npm run build`: ejecuta TypeScript y Vite.
- `npm run lint`: ejecuta Oxlint.

El repositorio no incluye pruebas automatizadas configuradas. La validación final requiere ejecutar ambos comandos y hacer las pruebas funcionales descritas en `docs/RUBRICA_PROYECTO.md`.
