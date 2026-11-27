# Guía de cumplimiento de la rúbrica — Programación IV

Esta guía relaciona los requisitos del documento del profesor con la implementación de Orven y propone una secuencia breve para comprobarlos durante la defensa.

## 1. Base técnica

| Requisito | Implementación en Orven | Comprobación |
|---|---|---|
| React y Vite | Aplicación React montada con Vite. | Ejecutar `npm run dev`. |
| Componentes y props | `TarjetaPropiedad` recibe propiedad, agente, favoritos y callback mediante props. | Abrir Home y el catálogo; ambas páginas reutilizan la tarjeta. |
| Estado con `useState` | Criterios de búsqueda, orden y paginación viven en el estado React. | Cambiar filtros y observar los resultados. |
| Datos desde JSON | `PropiedadesContext` ejecuta `fetch("/datos.json")`. | Verificar la pestaña Network o modificar el JSON y recargar. |
| Renderizado dinámico | Tarjetas y opciones se generan con `map()`. | No existe un JSX escrito por cada inmueble. |
| Al menos un filtro | Ubicación, tipo, operación, precio y habitaciones. | Probar cada control por separado. |
| Filtros anidados | Los criterios se aplican mediante varios `filter()` encadenados. | Activar dos o más filtros y comprobar que se cumplen simultáneamente. |

## 2. Datos

| Requisito | Implementación |
|---|---|
| Mínimo dos entidades relacionadas | `propiedades` y `agentes`. |
| 20 registros principales | 20 propiedades en `public/datos.json`. |
| 5 registros secundarios | 5 agentes en `public/datos.json`. |
| ID único | Cada propiedad y agente tiene un `id` único. |
| Relación entre entidades | Cada propiedad contiene `agenteId`, que referencia a `agentes.id`. |
| Campo filtrable | `tipo`, además de ubicación, operación, precio y habitaciones. |
| Vista de detalle | `/propiedades/:id` muestra los datos del inmueble y del agente relacionado. |
| Consistencia | El proveedor valida estructura, cantidades, IDs y referencias antes de cargar el catálogo. |
| Datos ficticios | Los nombres y registros del JSON son datos de demostración; no representan personas reales. |

## 3. Pruebas que exige la defensa

### Prueba 1 — Agregar un registro al JSON

1. Abrir `public/datos.json`.
2. Duplicar un objeto de `propiedades` y cambiar su `id` por uno que no exista.
3. Mantener un `agenteId` válido.
4. Guardar y recargar la aplicación.
5. Comprobar que el nuevo inmueble aparece en el catálogo sin modificar componentes React.

### Prueba 2 — Agregar una categoría nueva

1. En el registro anterior, cambiar `tipo` por una categoría nueva, por ejemplo `Local comercial`.
2. Guardar y recargar.
3. Abrir el filtro «Tipo de propiedad».
4. Comprobar que aparece la categoría nueva automáticamente.

El validador acepta valores de `tipo` como cadenas no vacías; no hay que editar un enum cerrado ni un arreglo manual de opciones.

### Prueba 3 — Activar dos filtros

1. Elegir una ubicación o escribir parte de una ciudad.
2. Elegir un tipo de inmueble.
3. Comprobar que los resultados cumplen ambos criterios.
4. Añadir un rango de precio o un mínimo de habitaciones.
5. Comprobar que los resultados siguen cumpliendo todos los filtros activos.

### Cambio en vivo

El profesor puede pedir un cambio concreto. Una demostración sencilla consiste en modificar un valor de `tipo` en el JSON y explicar cómo `map()`, `Set` y el filtrado construyen las opciones y resultados después de recargar.

## 4. Fundamentos web

| Requisito | Ubicación |
|---|---|
| HTML semántico | Home, catálogo, detalle y demás páginas utilizan `header`, `nav`, `main`, `section`, `article` o `footer`. |
| CSS propio | Hojas CSS junto a páginas y componentes; no se usa Tailwind. |
| Grid/Flexbox | Rejillas de propiedades, navegación y formularios. |
| Media query | Hojas de estilo de Home, catálogo, detalle y favoritos. |
| `map()` | Tarjetas, ciudades, tipos, operaciones y habitaciones. |
| `filter()` | Propiedades destacadas, filtros combinados y favoritos. |
| `reduce()` | Precio promedio de los resultados filtrados. |
| `useEffect` con `fetch` | El proveedor carga `datos.json` una vez al montar y limpia la ejecución si se desmonta. |

## 5. Entrega y preparación

- Ejecutar `npm run build`.
- Ejecutar `npm run lint`.
- Probar las tres pruebas de defensa.
- Probar también formulario → Admin → aprobar/rechazar.
- Probar favoritos, detalle, enlaces de navegación y versión móvil.
- Preparar una presentación de 5 minutos que explique origen de los datos, relación `agenteId`, filtros combinados y flujo de una solicitud.
- Explicar que `localStorage` conserva el estado local de la demostración, pero que el catálogo inicial se carga desde `public/datos.json`.

## 6. Alcance que no exige la rúbrica

La rúbrica enumera como extras opcionales los gráficos, CRUD general, ordenamiento, modo oscuro y Next.js. Orven conserva su flujo de solicitudes, favoritos, ordenamiento y vistas de detalle porque forman parte de la experiencia ya diseñada; no requiere agregar un backend ni una base de datos real para esta entrega.
