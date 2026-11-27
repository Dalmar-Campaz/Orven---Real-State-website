# Guía de cumplimiento de la rúbrica — Programación IV

Esta guía relaciona los requisitos del profesor con la implementación actual de Orven y recoge las pruebas para la defensa.

## 1. Base técnica

| Requisito | Implementación en Orven | Comprobación |
|---|---|---|
| React y Vite | Aplicación React montada con Vite. | Ejecutar `npm run dev`. |
| Componentes y props | `TarjetaPropiedad` recibe propiedad, agente, favoritos y callback mediante props. | Home, catálogo y favoritos reutilizan la tarjeta. |
| Estado con `useState` | Criterios de búsqueda, orden, paginación y estados de interfaz viven en React. | Cambiar filtros y observar los resultados. |
| Datos desde JSON | `PropiedadesContext` ejecuta `fetch("/datos.json")`. | Revisar la pestaña Network o modificar el JSON y recargar. |
| Renderizado dinámico | Las tarjetas y opciones se generan con `map()`. | No hay un JSX escrito por cada inmueble. |
| Filtros | Ubicación, tipo, operación, precio y habitaciones. | Probar cada control por separado. |
| Filtros anidados | Los criterios se aplican mediante varios `filter()` encadenados. | Activar dos o más filtros y comprobar que todos se cumplen. |

## 2. Datos

| Requisito | Implementación |
|---|---|
| Mínimo dos entidades relacionadas | `propiedades` y `agentes` dentro de `public/datos.json`. |
| 20 registros principales | 20 propiedades iniciales en el JSON. |
| 5 registros secundarios | 5 agentes iniciales en el JSON. |
| Identificador único | Cada propiedad y agente tiene un `id` único. |
| Relación entre entidades | Cada propiedad contiene `agenteId`, que referencia a `agentes.id`. |
| Campo filtrable | `tipo`, además de ubicación, operación, precio y habitaciones. |
| Vista de detalle | `/propiedades/:id` muestra los datos del inmueble y del agente relacionado. |
| Consistencia | El proveedor valida estructura, cantidades, IDs e integridad de las relaciones. |
| Sin propiedades hardcodeadas | Se eliminó `src/data/propiedades.ts`; el catálogo base procede del JSON. |

Las propiedades generadas desde una solicitud aprobada son datos creados por el usuario y guardados localmente para simular el flujo de publicación. No son registros precargados ni reemplazan la fuente JSON.

## 3. Pruebas que exige la defensa

### Prueba 1 — Agregar un registro al JSON

1. Abrir `public/datos.json`.
2. Duplicar un objeto de `propiedades` y cambiar su `id` por uno que no exista.
3. Mantener un `agenteId` que exista en `agentes`.
4. Guardar y recargar la aplicación.
5. Comprobar que el nuevo inmueble aparece en el catálogo sin modificar React.

### Prueba 2 — Agregar una categoría nueva

1. En el registro agregado, asignar a `tipo` una categoría que no exista, por ejemplo `Local comercial`.
2. Guardar y recargar.
3. Abrir el filtro «Tipo de propiedad».
4. Comprobar que aparece la nueva categoría automáticamente.

El validador acepta valores de `tipo` como cadenas no vacías; no hay que editar un enum cerrado ni una lista manual de opciones.

### Prueba 3 — Activar dos filtros

1. Elegir una ubicación o escribir parte de una ciudad.
2. Elegir un tipo de inmueble.
3. Comprobar que los resultados cumplen ambos criterios.
4. Añadir un rango de precio o un mínimo de habitaciones.
5. Comprobar que todos los criterios siguen aplicándose simultáneamente.

### Cambio en vivo

Una demostración sencilla consiste en cambiar un valor de `tipo` en el JSON, recargar la aplicación y explicar cómo `map()`, `Set` y el filtrado crean las opciones y resultados.

## 4. Fundamentos web

| Requisito | Implementación |
|---|---|
| HTML semántico | Home, catálogo, detalle y otras páginas utilizan `header`, `nav`, `main`, `section`, `article` o `footer`. |
| CSS propio | Hojas CSS junto a páginas y componentes; no se utiliza Tailwind. |
| Grid/Flexbox | Rejillas de propiedades, navegación y formularios. |
| Media queries | Home, catálogo, detalle y favoritos tienen estilos responsive. |
| `map()` | Tarjetas, ciudades, tipos, operaciones y habitaciones. |
| `filter()` | Propiedades destacadas, filtros combinados y favoritos. |
| `reduce()` | Precio promedio de los resultados filtrados. |
| `useEffect` con `fetch` | El proveedor carga `datos.json` al montar y cancela la actualización de estado si se desmonta. |

## 5. Pruebas funcionales complementarias

- Enviar una solicitud desde `/formulario` y comprobar que aparece en Admin.
- Aprobarla y comprobar que aparece en el catálogo como publicación local.
- Rechazar otra y comprobar que conserva el motivo.
- Agregar y quitar favoritos desde tarjeta y detalle.
- Comprobar el enlace de contacto del agente.
- Probar las rutas públicas, login, logout y protección de `/admin`.
- Probar la navegación y las rejillas en móvil.

## 6. Verificación de entrega

- Ejecutar `npm ci`.
- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Revisar el workflow de GitHub Actions `Orven quality checks`.
- Realizar las tres pruebas requeridas con `public/datos.json`.
- Preparar una presentación de cinco minutos que explique origen de datos, relación `agenteId`, filtros combinados y el flujo de solicitudes.

## 7. Límites de la implementación

El archivo `datos.json` es estático y el navegador no puede escribir en él. Por eso, los inmuebles iniciales proceden únicamente del JSON, mientras que las publicaciones aprobadas a partir del formulario se conservan localmente en el navegador para simular la administración sin backend. No se sincronizan entre usuarios o dispositivos.
