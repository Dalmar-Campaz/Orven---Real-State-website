# Modelo de datos de Orven

## 1. Fuente principal: public/datos.json

La entrega académica utiliza un archivo JSON en `public/`, leído desde React mediante `fetch("/datos.json")`. No hay servidor ni motor de base de datos.

El archivo contiene al menos dos entidades relacionadas:

- `propiedades`: entidad principal, con 20 registros iniciales.
- `agentes`: entidad secundaria, con 5 registros iniciales.

Cada registro tiene un identificador único `id`. Cada propiedad contiene `agenteId`, cuyo valor corresponde al `id` de un agente.

Ejemplo reducido de la estructura:

```json
{
  "agentes": [
    {
      "id": 1,
      "nombre": "Alejandro Gómez",
      "cargo": "Asesor inmobiliario senior",
      "especialidad": "Vivienda urbana",
      "experiencia": 8,
      "email": "alejandro.gomez@example.com",
      "telefono": "000 000 0001",
      "foto": "https://example.com/agente.jpg",
      "descripcion": "Descripción ficticia del agente."
    }
  ],
  "propiedades": [
    {
      "id": 1,
      "titulo": "Casa moderna con piscina",
      "tipo": "Casa",
      "operacion": "Venta",
      "precio": 1250000000,
      "ciudad": "Medellín",
      "departamento": "Antioquia",
      "sector": "El Poblado",
      "habitaciones": 4,
      "banos": 3,
      "area": 280,
      "descripcion": "Descripción ficticia del inmueble.",
      "imagenes": ["https://example.com/propiedad.jpg"],
      "fecha": "2026-11-01",
      "destacada": true,
      "agenteId": 1
    }
  ]
}
```

El archivo completo está en `public/datos.json`. Todos los datos de ejemplo son ficticios y no representan datos personales reales.

### Reglas validadas al cargar

`PropiedadesContext` comprueba:

- Al menos 20 propiedades y 5 agentes.
- Estructura y tipos de los campos que utiliza la interfaz.
- IDs únicos dentro de cada entidad.
- Que cada propiedad tenga un `agenteId` existente en la colección de agentes.

Una categoría nueva en `tipo` se admite como cadena y aparece en el filtro al recargar la aplicación. No exige modificar el código React.

## 2. Tipos en src/types/propiedad.ts

### `Agente`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador único del agente. |
| `nombre` | `string` | Nombre ficticio. |
| `cargo` | `string` | Cargo mostrado en la interfaz. |
| `especialidad` | `string` | Área de asesoría. |
| `experiencia` | `number` | Años de experiencia ficticios. |
| `email` | `string` | Correo de ejemplo. |
| `telefono` | `string` | Teléfono ficticio. |
| `foto` | `string` | URL de imagen. |
| `descripcion` | `string` | Presentación del agente. |

### `DatosPropiedad`

| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | `string` | Nombre o título del inmueble. |
| `tipo` | `string` | Categoría del inmueble; se mantiene abierta para admitir categorías nuevas del JSON. |
| `operacion` | `"Venta" \| "Arriendo"` | Tipo de operación. |
| `precio` | `number` | Número puro; se formatea en la interfaz. |
| `ciudad` | `string` | |
| `departamento` | `string` | |
| `sector` | `string` opcional | |
| `habitaciones` | `number` | |
| `banos` | `number` | |
| `area` | `number` | Metros cuadrados. |
| `descripcion` | `string` | |
| `imagenes` | `string[]` | URLs externas o data URLs. |
| `agenteId` | `number` opcional en el tipo | Obligatorio para cada registro del JSON; opcional para mantener compatibilidad con solicitudes antiguas guardadas localmente. |

### `Propiedad`

Extiende `DatosPropiedad` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador único de propiedad. |
| `fecha` | `string` | Fecha en formato ISO `AAAA-MM-DD`. |
| `destacada` | `boolean` opcional | Determina si aparece en la sección destacada de Home. |

### `SolicitudPropiedad`

Extiende `DatosPropiedad` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador de solicitud. |
| `fecha` | `string` | Fecha en formato ISO `AAAA-MM-DD`. |
| `estado` | `"Pendiente" \| "Aprobada" \| "Rechazada"` | Estado de revisión. |
| `solicitante` | objeto | `nombre`, `email` y `telefono`, todos `string`. |
| `motivoRechazo` | `string` opcional | Se conserva al rechazar. |

Una solicitud no es una propiedad publicada. Solo al aprobar una solicitud se copian sus datos a una nueva `Propiedad`.

## 3. Estado local y persistencia

El JSON público contiene el catálogo base y los agentes. Para mantener el flujo de publicación y revisión del prototipo, `PropiedadesContext` conserva cambios locales adicionales.

### `orven_propiedades`

La clave de `localStorage` contiene un JSON versionado:

```text
{
  version: 2,
  propiedades: Propiedad[],
  solicitudes: SolicitudPropiedad[]
}
```

- La versión 1 también se acepta para conservar datos creados antes de introducir el archivo JSON.
- En cada carga, las propiedades base se leen del archivo JSON.
- Las propiedades guardadas localmente cuyos IDs no aparecen en el JSON se conservan como registros locales (por ejemplo, inmuebles aprobados desde Admin).
- Si una propiedad tiene un ID que ya existe en `datos.json`, prevalece la versión del archivo público. Esto permite que las pruebas de la entrega modifiquen o agreguen datos al JSON sin que una copia antigua de `localStorage` oculte el cambio.
- Las solicitudes se conservan en `localStorage`.

### `orven_favoritos`

Arreglo JSON de identificadores de propiedades favoritas (`number[]`). Es independiente del objeto de propiedades, se comparte entre páginas y pestañas del mismo origen, y no está asociado al usuario simulado.

### Sesión

| Almacenamiento | Clave | Contenido |
|---|---|---|
| `localStorage` | `orven_user` | Sesión cuando el usuario marca «Recordar mi sesión». |
| `sessionStorage` | `orven_user_session` | Sesión limitada a la pestaña cuando no se marca la opción. |

El almacenamiento solo pertenece al navegador y origen actuales. No sincroniza otros dispositivos y no se considera una base de datos compartida.

## 4. Relación entre entidades

La relación se modela con una clave foránea conceptual:

```text
propiedades.agenteId → agentes.id
```

Una propiedad se relaciona con un agente. Un agente puede estar relacionado con varias propiedades. El catálogo muestra el nombre del agente en las tarjetas y el detalle individual muestra su perfil y datos de contacto.

El formulario de publicación asigna el primer agente disponible a la solicitud para mantener la relación durante el flujo de aprobación. En una implementación futura se podría permitir elegir el asesor desde el formulario.

## 5. Reglas de PropiedadesContext

- Una solicitud nueva nace con estado `Pendiente`, fecha de hoy e ID siguiente.
- Solo se puede aprobar o rechazar una solicitud existente y pendiente.
- Aprobar crea una propiedad nueva con su propio ID y fecha, y marca la solicitud como `Aprobada`.
- Rechazar marca la solicitud como `Rechazada` y guarda el motivo opcional.
- Cada operación genera un nuevo estado y lo guarda como un único objeto JSON. React se actualiza solo cuando el guardado tiene éxito.
- El evento `storage` actualiza otras pestañas del mismo navegador/origen.
- `favoritos` contiene los IDs de las propiedades marcadas; `alternarFavorito(id)` agrega o quita un ID y guarda el arreglo en `orven_favoritos`.

## 6. Datos construidos por el formulario

El formulario mantiene sus campos como texto y convierte los valores numéricos al enviar:

| Campo del formulario | Resultado |
|---|---|
| `precio` | `Number(precio)` |
| `habitaciones`, `banos` | `parseInt(valor, 10)`; los valores con sufijo `+` se convierten a su parte numérica. |
| `area` | `Number(area)` |
| Imágenes seleccionadas (`File`) | `string[]` de data URLs generadas mediante `archivoADataUrl`. |
| Contacto | Objeto `solicitante` con nombre, teléfono y correo. |
| Agente | ID del primer agente disponible en el JSON. |

Las vistas previas utilizan URLs temporales `blob:`, que se liberan al quitar imágenes o desmontar el formulario. No se guardan esas URLs temporales; se guardan las data URLs.

**Límite de imágenes:** las data URLs ocupan más espacio que el archivo original. `localStorage` tiene una cuota limitada que depende del navegador. Cuando no hay espacio o el almacenamiento está bloqueado, el contexto no cambia los datos y el formulario muestra el error.

## 7. Métodos de arreglos exigidos

- `map()`: renderizar tarjetas y opciones de filtros a partir de las colecciones.
- `filter()`: combinar ubicación, tipo, operación, rango de precio y habitaciones.
- `reduce()`: calcular el precio promedio de las propiedades que cumplen los filtros.

Las opciones de tipo, operación y número de habitaciones se derivan de los datos; no se codifican como listas fijas.

## 8. Datos ficticios

Los registros y perfiles incluidos en `public/datos.json` son ficticios y se usan exclusivamente como datos de demostración académica. No se incluyen datos personales reales.
