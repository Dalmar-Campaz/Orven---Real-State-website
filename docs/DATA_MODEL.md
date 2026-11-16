# Modelo de datos de Orven

## 1. Almacenamiento actual

Orven no utiliza un motor de base de datos ni una API. Los datos iniciales se definen en `src/data/propiedades.ts`; después, `PropiedadesContext` mantiene y persiste las colecciones.

La clave `orven_propiedades` de `localStorage` contiene un JSON versionado:

| Campo | Contenido |
|---|---|
| `version` | Versión del formato persistido; actualmente `1`. |
| `propiedades` | Array de propiedades publicadas. |
| `solicitudes` | Array de solicitudes de publicación. |

Al iniciar, el contexto intenta leer y validar el JSON. Si no existe o no coincide con el modelo, utiliza los datos de ejemplo. Los cambios se escriben en almacenamiento antes de actualizar el estado React. Si el navegador no permite guardar o la cuota está llena, la operación falla y la interfaz muestra un error.

El evento `storage` permite que otras pestañas del mismo navegador/origen reciban los cambios. No sincroniza dispositivos ni usuarios.

## 2. Tipos en `src/types/propiedad.ts`

### Tipos auxiliares

| Tipo | Valores |
|---|---|
| `TipoInmueble` | `"Casa" \| "Apartamento"` |
| `Operacion` | `"Venta"` |
| `EstadoSolicitud` | `"Pendiente" \| "Aprobada" \| "Rechazada"` |

### `DatosPropiedad`

| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | `string` | Nombre o título del inmueble. |
| `tipo` | `TipoInmueble` | Casa o apartamento. |
| `operacion` | `Operacion` | Actualmente solo venta. |
| `precio` | `number` | Número puro; se formatea en la interfaz. |
| `ciudad` | `string` | |
| `departamento` | `string` | |
| `sector` | `string` opcional | |
| `habitaciones` | `number` | |
| `banos` | `number` | |
| `area` | `number` | Metros cuadrados. |
| `descripcion` | `string` | |
| `imagenes` | `string[]` | URLs externas o data URLs. |

### `Propiedad`

Extiende `DatosPropiedad` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador de propiedad. |
| `fecha` | `string` | Fecha en formato ISO `AAAA-MM-DD`. |
| `destacada` | `boolean` opcional | Determina si se muestra en la sección destacada de Home. |

### `SolicitudPropiedad`

Extiende `DatosPropiedad` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador de solicitud. |
| `fecha` | `string` | Fecha en formato ISO `AAAA-MM-DD`. |
| `estado` | `EstadoSolicitud` | Pendiente, aprobada o rechazada. |
| `solicitante` | objeto | `nombre`, `email` y `telefono`, todos `string`. |
| `motivoRechazo` | `string` opcional | Se conserva al rechazar. |

Una solicitud no es una propiedad publicada. Solo al aprobar una solicitud se copian los datos comunes a una nueva `Propiedad`.

## 3. Datos iniciales

- `propiedadesIniciales: Propiedad[]`: cuatro propiedades de ejemplo.
- `solicitudesPropiedad: SolicitudPropiedad[]`: ocho solicitudes de ejemplo; siete pendientes y una rechazada.
- Las fechas del conjunto inicial se expresan como ISO `AAAA-MM-DD`.
- Las imágenes de ejemplo utilizan URLs externas. Las imágenes agregadas desde el formulario son data URLs.

Estos arreglos son constantes TypeScript, no una base de datos.

## 4. Reglas de `PropiedadesContext`

- Una solicitud nueva nace con estado `Pendiente`, fecha de hoy e id siguiente.
- Solo se puede aprobar o rechazar una solicitud existente y pendiente.
- Aprobar crea una propiedad nueva con su propio id y fecha, y marca la solicitud como `Aprobada`.
- Rechazar marca la solicitud como `Rechazada` y guarda el motivo opcional.
- Cada operación genera un nuevo estado completo y lo guarda como un único objeto JSON. La aplicación actualiza React solo cuando el guardado tuvo éxito.
- Si se recibe una modificación en otra pestaña, el contexto actualiza su estado a partir del evento `storage`.

## 5. Datos construidos por el formulario

El formulario mantiene sus campos como texto y convierte los valores numéricos al enviar:

| Campo del formulario | Resultado |
|---|---|
| `precio` | `Number(precio)` |
| `habitaciones`, `banos` | `parseInt(valor, 10)`; `"8+"` se guarda como `8`. |
| `area` | `Number(area)` |
| Imágenes seleccionadas (`File`) | `string[]` de data URLs generadas mediante `archivoADataUrl`. |
| Contacto | Objeto `solicitante` con nombre, teléfono y correo. |

Las vistas previas utilizan URLs temporales `blob:`, que se liberan al quitar imágenes o desmontar el formulario. No se guardan esas URLs temporales; se guardan las data URLs.

**Límite de imágenes:** las data URLs ocupan más espacio que el archivo original. `localStorage` tiene una cuota limitada que depende del navegador. Cuando no hay espacio o el almacenamiento está bloqueado, el contexto no cambia los datos y el formulario muestra el error. Para imágenes más grandes se debe evaluar IndexedDB o almacenamiento remoto en una fase futura.

## 6. Sesión de usuario

`AuthContext` mantiene un objeto con correo y rol:

| Campo | Tipo |
|---|---|
| `email` | `string` |
| `role` | `"admin" \| "customer"` |

- Con «Recordar mi sesión» marcado, se utiliza `localStorage` con la clave `orven_user`.
- Sin marcarlo, se utiliza `sessionStorage` con la clave `orven_user_session`.
- El contexto valida el JSON al iniciar y tolera datos corruptos o almacenamiento no disponible.
- No se guardan contraseñas.

El login es una simulación frontend y no comprueba las credenciales contra un servidor.

## 7. Claves del navegador

| Almacenamiento | Clave | Contenido |
|---|---|---|
| `localStorage` | `orven_propiedades` | JSON versionado con propiedades y solicitudes. |
| `localStorage` | `orven_user` | Sesión cuando el usuario marca «Recordar mi sesión». |
| `sessionStorage` | `orven_user_session` | Sesión limitada a la pestaña cuando no se marca la opción. |

El almacenamiento solo pertenece al navegador y origen actuales. No representa una base de datos central ni sincroniza otros dispositivos. Los usuarios pueden modificar o borrar esos valores, por lo que no son confiables para seguridad.

## 8. Utilidades

- `src/utils/formato.ts`: `formatoPrecio` formatea valores según `es-CO`; `ubicacionCorta` devuelve sector y ciudad cuando hay sector.
- `src/utils/archivos.ts`: `archivoADataUrl(file)` convierte un archivo a data URL y rechaza si la lectura falla.

## 9. Pendientes del modelo

1. Definir en la Fase 3 si los favoritos pertenecen al usuario simulado y persistir solo sus identificadores.
2. Evaluar IndexedDB o un servicio de imágenes si la cuota de `localStorage` resulta insuficiente para las imágenes del formulario.
3. Unificar en una fuente compartida los catálogos de ciudades y departamentos, hoy repetidos en páginas distintas.
4. Ampliar `Operacion` solo si el alcance incorpora arriendo.
