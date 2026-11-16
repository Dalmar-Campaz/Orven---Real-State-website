# Modelo de datos de Orven
 
## 1. Almacenamiento actual
 
El proyecto no utiliza un motor de base de datos ni una API. Los datos de ejemplo se definen en un archivo TypeScript (`src/data/propiedades.ts`) y se cargan como estado inicial de `PropiedadesContext`. A partir de ahí, los cambios (solicitudes nuevas, aprobaciones, rechazos) viven solo en la memoria de la pestaña y **se pierden al recargar**.
 
El modelo de tipos está unificado en `src/types/propiedad.ts`. Home, Admin y el formulario consumen esos tipos mediante `usePropiedades`.
 
## 2. Tipos en `src/types/propiedad.ts`
 
### Tipos auxiliares
 
| Tipo | Valores |
|---|---|
| `TipoInmueble` | `"Casa" \| "Apartamento"` |
| `Operacion` | `"Venta"` (por ahora solo se maneja venta, según el comentario del archivo) |
| `EstadoSolicitud` | `"Pendiente" \| "Aprobada" \| "Rechazada"` |
 
### `DatosPropiedad`: lo que describe a un inmueble
 
| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | `string` | |
| `tipo` | `TipoInmueble` | |
| `operacion` | `Operacion` | |
| `precio` | `number` | Número puro; el texto con formato se calcula con `formatoPrecio`. |
| `ciudad` | `string` | |
| `departamento` | `string` | |
| `sector` | `string` (opcional) | Si existe, `ubicacionCorta` muestra «sector, ciudad». |
| `habitaciones` | `number` | |
| `banos` | `number` | |
| `area` | `number` | |
| `descripcion` | `string` | |
| `imagenes` | `string[]` | URLs (en los datos de ejemplo) o data URL (en solicitudes creadas desde el formulario). |
 
### `Propiedad`: inmueble publicado
 
Extiende `DatosPropiedad` con:
 
| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | |
| `fecha` | `string` | El comentario del tipo indica formato ISO, por ejemplo `"2026-11-06"`. |
| `destacada` | `boolean` (opcional) | Existe en el modelo, pero ningún componente lo utiliza todavía. |
 
### `SolicitudPropiedad`: publicación pendiente de revisión
 
Extiende `DatosPropiedad` con:
 
| Campo | Tipo | Notas |
|---|---|---|
| `id` | `number` | Independiente del id de las propiedades. |
| `fecha` | `string` | |
| `estado` | `EstadoSolicitud` | |
| `solicitante` | `{ nombre: string; email: string; telefono: string }` | |
| `motivoRechazo` | `string` (opcional) | Se asigna al rechazar. El panel no lo muestra todavía. |
 
`Propiedad` y `SolicitudPropiedad` son tipos separados: una solicitud pendiente no puede pasarse por una propiedad publicada.
 
## 3. Datos iniciales en `src/data/propiedades.ts`
 
- `propiedadesIniciales: Propiedad[]`: cuatro propiedades de ejemplo (ids 1 a 4), con precios numéricos y una imagen cada una. Dos tienen `sector`; tres tienen `destacada: true`, pero ese campo no se usa.
- `solicitudesPropiedad: SolicitudPropiedad[]`: ocho solicitudes de ejemplo (ids 1 a 8): seis `Pendiente`, una `Aprobada` (id 6) y una `Rechazada` (id 7, sin `motivoRechazo`).
Ambos son arreglos `const` en memoria dentro de un módulo; no son una base de datos ni guardan cambios. `PropiedadesContext` los copia a su estado al iniciar.
 
### Inconsistencias conocidas en los datos de ejemplo
 
1. **Formato de fecha mixto:** las solicitudes 1 y 2 (y las propiedades) usan ISO (`2026-11-05`); las solicitudes 3 a 8 usan `dd/mm/aaaa`. Admin muestra la cadena tal cual.
2. **Solicitud 3:** el título es «Casa moderna con piscina» pero el `tipo` es `Apartamento`.
3. **Solicitud 6 (`Aprobada`):** no existe una propiedad correspondiente en `propiedadesIniciales`; el estado no es coherente con el catálogo.
4. **Ciudades fuera de la lista del formulario:** `Santa Marta` (solicitud 1) y `La Calera` (propiedad 3) no están en la lista `CIUDADES` de `RegistrarPropiedad`.
5. **Imágenes repetidas:** varias solicitudes reutilizan la misma foto de ejemplo (`FOTO`).
## 4. Reglas de `PropiedadesContext`
 
Documentadas con más detalle en `docs/ARCHITECTURE.md`. Resumen de las reglas de datos:
 
- Una solicitud nueva siempre nace `Pendiente`, con `fecha` de hoy (formato ISO, `AAAA-MM-DD`) y el id siguiente (máximo existente + 1). Se agrega al inicio de la lista.
- Solo se puede aprobar o rechazar una solicitud **existente y pendiente**; en cualquier otro caso la operación no hace nada. Esto evita aprobar dos veces la misma solicitud y duplicar la propiedad.
- Aprobar copia los datos del inmueble (sin `id`, `fecha`, `estado`, `solicitante` ni `motivoRechazo`) a una nueva `Propiedad` con id propio y fecha de hoy, y marca la solicitud como `Aprobada`. La solicitud se conserva.
- Rechazar marca la solicitud como `Rechazada` y guarda el motivo si se proporcionó.
## 5. Datos que construye el formulario de registro
 
`src/pages/RegistrarPropiedad/RegistrarPropiedad.tsx` mantiene su estado como texto (`FormState`): un `<input>` siempre entrega cadenas. Al enviar, convierte una sola vez y construye un `DatosPropiedad`:
 
| Campo del formulario | Resultado en `DatosPropiedad` |
|---|---|
| `precio` (solo dígitos) | `Number(precio)` |
| `habitaciones`, `banos` (`"1"` a `"8+"`) | `parseInt(valor, 10)`; `"8+"` se guarda como `8` |
| `area` | `Number(area)` |
| `tipo` | `TipoInmueble` validado |
| `operacion` | `"Venta"` (única opción) |
| Imágenes seleccionadas (`File`) | `string[]` de data URL generadas con `archivoADataUrl` |
 
El nombre, teléfono y correo se envían como `solicitante` a `crearSolicitud`. El correo se prellena con el de la sesión cuando existe. La validación exige nombre, un teléfono con al menos 7 dígitos y un correo con formato válido.
 
Las vistas previas usan URLs temporales (`blob:`) generadas con `URL.createObjectURL()`, que se liberan al retirar una imagen o desmontar el componente. Son independientes de los datos guardados: lo que se guarda en la solicitud son las data URL, que no dependen de esas URLs temporales.
 
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
 
No hay otras claves. Propiedades, solicitudes, favoritos y datos del formulario no se guardan en `localStorage`.
 
## 8. Utilidades de datos
 
- `src/utils/formato.ts`: `formatoPrecio(n)` devuelve el precio con separador de miles en formato `es-CO` precedido de `$`; `ubicacionCorta(p)` devuelve «sector, ciudad» o solo la ciudad.
- `src/utils/archivos.ts`: `archivoADataUrl(file)` lee un `File` y devuelve una `Promise` con su data URL; rechaza con un error si la lectura falla.
## 9. Pendientes del modelo
 
1. Decidir qué datos deben persistir y cómo (`localStorage`, con manejo de JSON inválido y de almacenamiento lleno).
2. Definir la estrategia de persistencia de las imágenes: una data URL ocupa mucho más que el archivo original y el límite de `localStorage` es reducido.
3. Corregir las inconsistencias de los datos de ejemplo (sección 3) y unificar el formato de fecha.
4. Ampliar `Operacion` (por ejemplo, `"Arriendo"`) solo si el alcance lo requiere; hoy el formulario y los datos solo contemplan `"Venta"`.
5. Unificar la lista de ciudades y departamentos, hoy repetida en Home y en el formulario.
6. Decidir cómo se guardarán los favoritos y si son del navegador o del usuario simulado.
7. Mostrar `motivoRechazo` en el detalle de Admin y decidir si debe haber un motivo en la solicitud de ejemplo rechazada.
No se debe documentar como implementada la persistencia de propiedades, solicitudes o favoritos hasta que exista código que la realice.
 