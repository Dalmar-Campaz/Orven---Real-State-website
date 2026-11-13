# Modelo de datos de Orven

## 1. Almacenamiento actual

El proyecto no utiliza un motor de base de datos ni una API. Los datos de ejemplo se definen en archivos TypeScript y varias pantallas mantienen sus propios arreglos en estado React.

Hay persistencia limitada en el navegador mediante `localStorage` para la sesión y los favoritos de la página de propiedades. Esto no equivale a una base de datos compartida: los datos no se sincronizan entre navegadores o usuarios.

## 2. Propiedades definidas en `src/data/propiedades.ts`

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
| `image` | `string` | URL de imagen. |

El archivo exporta dos arreglos mutables de tipo `Property[]`:

- `propertiesDB`: cuatro propiedades de ejemplo. La página `Home` importa este arreglo como `properties`.
- `pendingPropertiesDB`: dos propiedades de ejemplo. Su nombre indica que son pendientes, pero el tipo `Property` no contiene un campo de estado ni información del solicitante.

Pese al sufijo `DB` de los nombres, estos arreglos son variables en memoria dentro del módulo; no son una base de datos y no guardan cambios en un almacenamiento persistente.

## 3. Solicitudes en el panel administrativo

`src/pages/Admin/Admin.tsx` define su propia interfaz `Solicitud` y el arreglo `SOLICITUDES_INICIALES` con seis registros.

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

El panel copia los registros al estado de React. Las acciones de aprobar y rechazar modifican ese estado local; al recargar la página, se restauran los registros iniciales. Este conjunto no está conectado con `pendingPropertiesDB` ni con el formulario de registro.

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

El formulario limita la descripción a 1000 caracteres y las imágenes a un máximo de 10. Exige al menos una imagen y valida los campos principales antes de preparar el objeto.

La interfaz permite seleccionar imágenes y generar URL temporales de vista previa. Esas URL se liberan al retirar imágenes o desmontar el componente. No se observa una subida de archivos a un servidor.

El componente declara un callback opcional `onSubmit`, pero la ruta de `App.tsx` no se lo proporciona. En la configuración actual, no existe un destino persistente para la solicitud.

## 5. Modelo esperado por la página de propiedades

`src/pages/Propiedades/Propiedades.tsx` define otra interfaz llamada `Propiedad`:

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

La pantalla recibe `propiedades: Propiedad[]` mediante una prop obligatoria. Su estructura no coincide con la interfaz `Property` de `src/data/propiedades.ts`; por ello, los arreglos actuales no se pueden pasar directamente sin transformar o unificar los modelos.

Además, la ruta actual no proporciona la prop requerida.

## 6. Datos guardados en el navegador

| Clave | Contenido | Uso |
|---|---|---|
| `orven_user` | JSON con `email` y `role` | Sesión simulada en `AuthContext`. |
| `orven:favoritos` | Arreglo JSON de identificadores | Favoritos de `Propiedades`. |

Los favoritos de `Home`, las solicitudes del panel administrativo y los datos introducidos en el formulario no se guardan en estas claves.

## 7. Inconsistencias que conviene resolver

1. Definir un modelo canónico de propiedad y adaptar `Home`, `Propiedades` y el panel a él.
2. Definir un modelo de solicitud separado del modelo de propiedad publicada, con un estado explícito.
3. Conectar el callback del formulario con el lugar donde se guardarán las solicitudes.
4. Hacer que el panel administrativo lea y actualice el mismo conjunto de solicitudes.
5. Decidir qué persistencia se espera para el prototipo (memoria, `localStorage` u otra solución aprobada por el curso) y documentar sus límites.

No se recomienda resolver estas inconsistencias mediante cambios de estructura de datos sin revisar primero los componentes que las consumen.
