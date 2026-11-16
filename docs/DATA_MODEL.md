# Modelo de datos de Orven

## 1. Almacenamiento actual

El proyecto no utiliza un motor de base de datos ni una API. Los datos de ejemplo se definen en archivos TypeScript y varias pantallas mantienen sus propios arreglos en estado React.

Actualmente no existe un modelo único ni un Context que comparta las propiedades y solicitudes entre páginas. Los archivos `PropiedadesContext.tsx` y `types/propiedad.ts` existen, pero están vacíos.

## 2. Propiedades iniciales en `src/data/propiedades.ts`

El archivo exporta la interfaz `Property`:

| Campo | Tipo | Significado |
|---|---|---|
| `id` | `number` | Identificador de ejemplo. |
| `title` | `string` | Título de la propiedad. |
| `location` | `string` | Ubicación en texto. |
| `price` | `string` | Precio ya formateado como texto. |
| `bedrooms` | `number` | Cantidad de habitaciones. |
| `bathrooms` | `number` | Cantidad de baños. |
| `area` | `number` | Área. |
| `image` | `string` | URL de una imagen. |

El archivo exporta dos arreglos mutables de tipo `Property[]`:

- `propertiesDB`: cuatro propiedades de ejemplo. La página `Home` importa este arreglo.
- `pendingPropertiesDB`: dos propiedades de ejemplo. Su nombre indica que son pendientes, pero el tipo `Property` no contiene estado ni información del solicitante. Ninguna página actual importa este arreglo.

Pese al sufijo `DB`, estos arreglos son datos en memoria dentro de un módulo TypeScript; no son una base de datos ni guardan cambios.

## 3. Solicitudes en el panel administrativo

`src/pages/Admin/Admin.tsx` define su propia interfaz `Solicitud` y el arreglo `SOLICITUDES_INICIALES`.

| Campo | Tipo |
|---|---|
| `id` | `number` |
| `titulo` | `string` |
| `solicitante` | `string` |
| `email` | `string` |
| `telefono` | `string` |
| `ubicacion` | `string` |
| `ubicacionCompleta` | `string` |
| `tipo` | `"Venta" \| "Arriendo"` |
| `fecha` | `string` |
| `estado` | `"Pendiente" \| "Aprobada" \| "Rechazada"` |
| `precio` | `string` |
| `descripcion` | `string` |
| `habitaciones` | `number` |
| `banos` | `number` |
| `area` | `number` |
| `fotos` | `string[]` |
| `motivoRechazo` | `string` opcional |

El panel copia los registros al estado de React. Aprobar o rechazar modifica ese estado local; al recargar la página, se restauran los registros iniciales. Este conjunto no está conectado con `pendingPropertiesDB` ni con el formulario de registro.

## 4. Datos construidos por el formulario de registro

`src/pages/RegistrarPropiedad/RegistrarPropiedad.tsx` exporta:

- `Operacion`: actualmente solo admite `"Venta"`.
- `SolicitudPropiedad`: objeto que el formulario prepara al validarse.

| Campo de `SolicitudPropiedad` | Tipo |
|---|---|
| `titulo` | `string` |
| `tipo` | `string` |
| `operacion` | `"Venta"` |
| `precio` | `number` |
| `ciudad` | `string` |
| `departamento` | `string` |
| `habitaciones` | `number` |
| `banos` | `number` |
| `area` | `number` |
| `descripcion` | `string` |
| `imagenes` | `File[]` |

El formulario valida los campos principales, limita la descripción y las imágenes, y genera URL temporales de vista previa mediante `URL.createObjectURL()`. Las URL se liberan al retirar imágenes o desmontar el componente.

Los objetos `File` y las URL temporales no son una estrategia de persistencia JSON. No se observa una subida de archivos a un servidor ni un mecanismo alternativo de almacenamiento persistente para esas imágenes.

El componente declara un callback opcional `onSubmit`, pero la ruta de `App.tsx` no se lo proporciona. Por tanto, la solicitud no llega a un almacenamiento ni al panel actual; el formulario puede mostrar confirmación aunque el callback no haya ejecutado ninguna operación.

## 5. Modelo esperado por el componente de catálogo

`src/pages/Propiedades/Propiedades.tsx` define una interfaz independiente llamada `Propiedad`:

| Campo | Tipo |
|---|---|
| `id` | `number \| string` |
| `tipo` | `string` |
| `titulo` | `string` |
| `sector` | `string` |
| `ciudad` | `string` |
| `precio` | `number` |
| `operacion` | `"Venta" \| "Arriendo"` |
| `habitaciones` | `number` |
| `banos` | `number` |
| `area` | `number` |
| `imagen` | `string` |
| `destacada` | `boolean` opcional |
| `codigo` | `string` opcional |
| `fecha` | `string` opcional |

La pantalla requiere `propiedades: Propiedad[]` mediante una prop obligatoria. Este tipo no coincide con `Property` de `src/data/propiedades.ts`: cambian nombres, ubicación, representación del precio y operación.

El componente tiene código para filtros, ordenamiento, paginación y favoritos, pero la ruta `/propiedades` está comentada. No recibe actualmente datos del catálogo y su CSS está vacío.

## 6. Sesión de usuario

`src/context/AuthContext.tsx` define un usuario con:

| Campo | Tipo |
|---|---|
| `email` | `string` |
| `role` | `'admin' \| 'customer' \| null` |

El contexto guarda el objeto serializado en `localStorage` bajo la clave `orven_user`. Es una sesión de demostración, no una autenticación validada por un servidor.

## 7. Datos guardados en el navegador

| Clave | Contenido | Uso |
|---|---|---|
| `orven_user` | JSON con `email` y `role` | Sesión simulada en `AuthContext`. |
| `orven:favoritos` | Arreglo JSON de identificadores | Favoritos del componente no integrado `Propiedades`. |

Los favoritos de Home, las solicitudes del panel administrativo y los datos del formulario no se guardan en estas claves.

## 8. Inconsistencias que deben resolverse

1. Definir un modelo canónico de propiedad y adaptarlo a Home y al catálogo.
2. Definir un modelo de solicitud separado del modelo de propiedad publicada, con estado explícito y datos del solicitante.
3. Unificar el tipo de operación; el formulario actual solo admite `"Venta"`, mientras el catálogo contempla `"Venta" | "Arriendo"`.
4. Acordar una representación para imágenes que sea compatible con la persistencia elegida.
5. Conectar el formulario con el conjunto de solicitudes que administra Admin.
6. Hacer que la aprobación transforme una solicitud en una propiedad publicada sin duplicar registros.
7. Unificar los favoritos de Home y del catálogo cuando la página se integre.

No se debe tratar el Context, el modelo común ni la persistencia como implementados hasta que los archivos correspondientes contengan código y las páginas estén conectadas.
