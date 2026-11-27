# Modelo de datos de Orven

## 1. Fuente principal: public/datos.json

El catálogo base se lee desde `public/datos.json` mediante `fetch("/datos.json")`. No se utiliza una base de datos ni un arreglo de propiedades en TypeScript.

El archivo contiene dos entidades relacionadas:

- `propiedades`: entidad principal, con al menos 20 registros.
- `agentes`: entidad secundaria, con al menos 5 registros.

Cada registro tiene un `id` único dentro de su colección. Cada propiedad guarda `agenteId`, que referencia un agente existente.

### Ejemplo reducido de estructura

```json
{
  "agentes": [
    {
      "id": 1,
      "nombre": "Agente de ejemplo",
      "cargo": "Asesor inmobiliario",
      "especialidad": "Vivienda urbana",
      "experiencia": 8,
      "email": "asesor@example.com",
      "telefono": "000 000 0001",
      "foto": "https://example.com/agente.jpg",
      "descripcion": "Descripción ficticia del agente."
    }
  ],
  "propiedades": [
    {
      "id": 1,
      "titulo": "Casa de ejemplo",
      "tipo": "Casa",
      "operacion": "Venta",
      "precio": 500000000,
      "ciudad": "Medellín",
      "departamento": "Antioquia",
      "sector": "El Poblado",
      "habitaciones": 3,
      "banos": 2,
      "area": 140,
      "descripcion": "Descripción ficticia del inmueble.",
      "imagenes": ["https://example.com/propiedad.jpg"],
      "fecha": "2026-11-01",
      "destacada": true,
      "agenteId": 1
    }
  ]
}
```

El archivo real contiene los registros completos de demostración. Los nombres, contactos y propiedades de ese archivo son ficticios.

### Validación al cargar

`PropiedadesContext` comprueba:

- Al menos 20 propiedades y 5 agentes.
- Tipos válidos para los campos utilizados por la interfaz.
- IDs positivos y únicos dentro de cada entidad.
- Que cada propiedad tenga un `agenteId` que exista en `agentes`.
- Que cada propiedad tenga al menos una imagen.

Si el archivo falta o no cumple el contrato, la aplicación muestra un estado de error y no presenta un catálogo parcial como si estuviera completo.

## 2. Tipos en src/types/propiedad.ts

### `Agente`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador único. |
| `nombre` | `string` | Nombre ficticio. |
| `cargo` | `string` | Cargo mostrado. |
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
| `tipo` | `string` | Categoría abierta para admitir valores nuevos del JSON. |
| `operacion` | `"Venta" \| "Arriendo"` | Operación del inmueble. |
| `precio` | `number` | Valor numérico en COP; se formatea en la interfaz. |
| `ciudad` | `string` | |
| `departamento` | `string` | |
| `sector` | `string` opcional | |
| `habitaciones` | `number` | |
| `banos` | `number` | |
| `area` | `number` | Metros cuadrados. |
| `descripcion` | `string` | |
| `imagenes` | `string[]` | URLs externas o data URLs. |
| `agenteId` | `number` opcional | ID del agente relacionado; requerido en el catálogo JSON y en las nuevas solicitudes. |

### `Propiedad`

Extiende `DatosPropiedad` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador único de propiedad. |
| `fecha` | `string` | Fecha ISO `AAAA-MM-DD`. |
| `destacada` | `boolean` opcional | Determina si aparece en Home. |

### `SolicitudPropiedad`

Extiende `DatosPropiedad` con:

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Identificador de solicitud. |
| `fecha` | `string` | Fecha ISO `AAAA-MM-DD`. |
| `estado` | `"Pendiente" \| "Aprobada" \| "Rechazada"` | Estado de revisión. |
| `solicitante` | objeto | `nombre`, `email` y `telefono`, todos `string`. |
| `motivoRechazo` | `string` opcional | Motivo guardado al rechazar. |

Una solicitud no se muestra en el catálogo como propiedad publicada. Solo al aprobarla se convierte en un registro local de `Propiedad`.

## 3. Relación entre entidades

La relación se expresa mediante la clave foránea conceptual:

```text
propiedades.agenteId → agentes.id
```

Una propiedad se relaciona con un agente y un agente puede tener varias propiedades. Las tarjetas muestran el nombre del asesor y el detalle individual muestra su perfil y datos de contacto.

El formulario asocia la solicitud al primer agente del catálogo para mantener una relación válida durante el flujo de revisión.

## 4. Estado local y persistencia

El JSON contiene el catálogo base. El almacenamiento del navegador conserva únicamente el contenido generado durante el uso de la aplicación.

### `orven_propiedades`

La clave de `localStorage` contiene el formato actual:

```text
{
  version: 3,
  propiedadesLocales: Propiedad[],
  solicitudes: SolicitudPropiedad[]
}
```

- `propiedadesLocales` contiene solo inmuebles creados al aprobar solicitudes.
- El catálogo de `datos.json` no se copia a `localStorage`.
- Al iniciar, el contexto combina las propiedades base del JSON con las propiedades locales guardadas.
- Si un ID local coincide con uno del JSON, prevalece el registro del JSON.
- Las solicitudes se crean mediante el formulario y comienzan en estado `Pendiente`.
- En una instalación nueva no se cargan solicitudes de muestra.

Las versiones anteriores 1 y 2 se aceptan para una migración: se descartan las cuatro propiedades iniciales y las ocho solicitudes ficticias del prototipo anterior. El resto de solicitudes se conserva cuando es válido. Los registros locales con IDs ya utilizados en el JSON no se agregan duplicados.

### `orven_favoritos`

Arreglo JSON de IDs de propiedades favoritas (`number[]`). Es independiente de las solicitudes y se comparte entre las páginas y pestañas del mismo origen.

### Sesión

| Almacenamiento | Clave | Contenido |
|---|---|---|
| `localStorage` | `orven_user` | Sesión cuando se marca «Recordar mi sesión». |
| `sessionStorage` | `orven_user_session` | Sesión limitada a la pestaña cuando no se marca la opción. |

El almacenamiento pertenece al navegador/origen actual. No sincroniza dispositivos y no representa una base de datos compartida.

## 5. Reglas de PropiedadesContext

- El catálogo inicial siempre se lee desde `public/datos.json`.
- Una solicitud nueva requiere un `agenteId` existente, recibe un ID, fecha actual y estado `Pendiente`.
- Solo se puede aprobar o rechazar una solicitud existente y pendiente.
- Aprobar crea una propiedad local con un nuevo ID, conserva el agente y marca la solicitud como `Aprobada`.
- Rechazar marca la solicitud como `Rechazada` y guarda el motivo opcional.
- Cada cambio se guarda antes de actualizar React. Si el almacenamiento falla, la operación no se confirma.
- El evento `storage` sincroniza los cambios entre pestañas del mismo origen.
- `alternarFavorito(id)` agrega o quita un ID de `orven_favoritos`.

El navegador no puede escribir sobre el archivo estático `public/datos.json`. Las propiedades aprobadas desde Admin son locales y no cambian el archivo fuente.

## 6. Datos construidos por el formulario

| Campo del formulario | Resultado |
|---|---|
| `precio` | `Number(precio)` |
| `habitaciones`, `banos` | `parseInt(valor, 10)`; valores con sufijo `+` se convierten a su parte numérica. |
| `area` | `Number(area)` |
| Imágenes seleccionadas (`File`) | `string[]` de data URLs generadas mediante `archivoADataUrl`. |
| Contacto | Objeto `solicitante` con nombre, teléfono y correo. |
| Agente | ID del primer agente del JSON. |

Las URLs `blob:` se usan para previsualizar y se liberan al quitar imágenes o desmontar el formulario. Las data URLs se almacenan junto con la solicitud local.

**Límite de imágenes:** las data URLs pueden consumir la cuota de `localStorage`. Cuando no hay espacio o el almacenamiento está bloqueado, el contexto no actualiza los datos y el formulario muestra un error.

## 7. Métodos de arreglos utilizados

- `map()`: crear tarjetas y opciones de filtros desde las colecciones.
- `filter()`: filtrar propiedades destacadas, favoritos y criterios simultáneos del catálogo.
- `reduce()`: calcular el precio promedio de los resultados filtrados.

Las opciones de tipo, operación, ciudad y habitaciones se derivan de los datos; no se mantienen en listas manuales.

## 8. Datos ficticios y privacidad

Los registros de `public/datos.json` son ficticios. No se incluyen datos personales reales. Los formularios de la demostración pueden recibir datos introducidos durante las pruebas y guardarlos localmente en el navegador.
