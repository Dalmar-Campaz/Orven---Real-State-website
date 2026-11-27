# Orven — plataforma inmobiliaria

Orven es una aplicación académica frontend para explorar propiedades, consultar asesores y representar un flujo básico de publicación y revisión. Está construida con React, TypeScript y Vite.

> **Fuente del catálogo:** las propiedades y los agentes iniciales se leen exclusivamente desde `public/datos.json` mediante `fetch("/datos.json")`. No existen arreglos TypeScript alternativos para poblar el catálogo.

## Funcionalidades

- **Inicio:** muestra las propiedades destacadas del JSON. El buscador obtiene ciudades, tipos y rangos de precio a partir de los datos y envía los criterios al catálogo.
- **Catálogo (`/propiedades`):** muestra todas las propiedades del JSON y las publicaciones creadas por el flujo local de aprobación. Incluye filtros combinados por ubicación, tipo, operación, precio y habitaciones; ordenamiento por fecha, precio o área; paginación y precio promedio.
- **Detalle (`/propiedades/:id`):** muestra las imágenes, descripción, características y el agente relacionado mediante `agenteId`.
- **Favoritos (`/favoritos`):** reúne las propiedades guardadas desde las tarjetas o desde el detalle.
- **Inicio de sesión (`/login`):** valida el formato del correo y una longitud mínima de contraseña, y asigna un rol de demostración según el correo. «Recordar mi sesión» utiliza `localStorage`; sin marcarlo, utiliza `sessionStorage`. No verifica credenciales con un servidor.
- **Registro de propiedades (`/formulario`):** permite enviar una solicitud pendiente con datos del inmueble y del solicitante. La solicitud se asocia a un agente del JSON.
- **Panel administrativo (`/admin`):** protegido para el rol `admin`. Permite consultar, buscar, filtrar y revisar solicitudes; aprobarlas para publicarlas en el catálogo local o rechazarlas guardando un motivo. El panel comienza sin solicitudes de muestra: las solicitudes aparecen al enviar el formulario.

## Datos del catálogo

### Archivo `public/datos.json`

El archivo contiene dos entidades:

- `propiedades`: 20 inmuebles iniciales, cada uno con un ID único.
- `agentes`: 5 asesores iniciales, cada uno con un ID único.

Cada propiedad incluye `agenteId`, que referencia el `id` de un agente existente. El proveedor valida cantidades, tipos, identificadores y relaciones antes de mostrar las páginas.

Para agregar una propiedad de prueba, añade un objeto a `propiedades` con un ID nuevo y un `agenteId` válido. Para probar una categoría nueva, escribe un nuevo valor no vacío en `tipo`. Recarga la aplicación: el inmueble y la nueva opción del filtro aparecerán sin modificar código React.

Todos los registros y perfiles incluidos son ficticios y se utilizan como datos académicos de demostración.

### Publicaciones creadas desde la aplicación

El navegador no puede escribir de vuelta en el archivo estático `public/datos.json`. Por eso, cuando el administrador aprueba una solicitud, esa propiedad se guarda como registro local creado por el usuario y se muestra junto al catálogo base. No es un arreglo de propiedades precargadas ni reemplaza el JSON como fuente inicial. Estos registros locales se pierden al borrar los datos del navegador o cambiar de navegador/dispositivo.

## Persistencia del navegador

- `orven_propiedades` guarda un objeto versionado con las propiedades aprobadas localmente y las solicitudes. La versión actual es la 3 y solo almacena registros creados desde el formulario; no duplica el catálogo base del JSON.
- `orven_favoritos` guarda un arreglo JSON de IDs de propiedades favoritas (`number[]`).
- `orven_user` guarda la sesión cuando «Recordar mi sesión» está marcado.
- `orven_user_session` guarda la sesión solo en la pestaña actual cuando el checkbox está desmarcado.
- Las contraseñas no se guardan.
- Los cambios se sincronizan entre pestañas del mismo navegador/origen mediante el evento `storage`; no se sincronizan perfiles o dispositivos distintos.
- Se aceptan estados antiguos de versiones 1 y 2 para migrar datos. Durante esa migración se descartan los cuatro registros iniciales de propiedades y las ocho solicitudes ficticias de la versión anterior.

`localStorage` y `sessionStorage` son almacenamiento del navegador, no una base de datos compartida. La autenticación también es una simulación frontend: proteger una ruta en React no sustituye la autorización de un servidor.

Las imágenes del formulario se convierten a data URLs para conservarlas con la solicitud local. Pueden consumir la cuota de almacenamiento del navegador; si el guardado falla, el formulario muestra un error y no confirma el envío.

## Tecnologías

| Tecnología | Uso |
|---|---|
| React 19 | Construcción de interfaces |
| TypeScript 7 | Tipado estático |
| React Router DOM 7 | Navegación entre rutas |
| Vite 8 | Servidor de desarrollo y compilación |
| CSS | Estilos propios, Grid/Flexbox y media queries |
| Oxlint | Análisis estático configurado |

Las versiones corresponden a los rangos declarados en `package.json`.

## Requisitos

- Node.js compatible con Vite y Oxlint: `^20.19.0` o `>=22.12.0`.
- npm.
- Git para clonar el repositorio.

## Instalación y ejecución

Clona el repositorio:

```bash
git clone https://github.com/Dalmar-Campaz/Orven---Real-State-website.git
cd Orven---Real-State-website
```

Instala las dependencias desde el archivo de bloqueo:

```bash
npm ci
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación.

## Despliegue y rutas directas

Orven utiliza `BrowserRouter`, por lo que las rutas como `/propiedades`, `/favoritos` o `/admin` son gestionadas por React en el navegador. En producción, el servidor debe entregar `index.html` para las rutas de la SPA en lugar de buscar un archivo físico con ese nombre de ruta.

Para Render Static Sites, `public/_redirects` contiene:

```text
/* /index.html 200
```

Vite copia los archivos de `public/` directamente a la raíz de `dist/` durante la compilación. Render utiliza esta regla como rewrite interno: conserva la URL solicitada y entrega la aplicación, que después resuelve la ruta con React Router. Sin este fallback, abrir o recargar una ruta distinta de Home puede devolver un 404 del servidor antes de que React se ejecute.

Después de desplegar, comprueba que puedes abrir y recargar directamente `/propiedades`, `/favoritos`, `/login` y `/admin` (esta última con una sesión de administrador).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Ejecuta TypeScript (`tsc -b`) y después la compilación de Vite. |
| `npm run lint` | Ejecuta Oxlint. |
| `npm run preview` | Sirve localmente el resultado de una compilación previa. |

El workflow de GitHub Actions ejecuta `npm ci`, `npm run lint` y `npm run build` en los cambios de la rama principal y en las pull requests.

## Cuenta de demostración

En `/login`, cualquier correo con formato válido y una contraseña de al menos 6 caracteres inicia sesión:

- `admin@orven.com` recibe el rol `admin` y accede a `/admin`.
- Cualquier otro correo recibe el rol `customer` y se dirige a Home.

La contraseña no se comprueba ni se almacena. Es una simulación académica, no autenticación real.

## Estructura principal

```text
public/
├── _redirects
└── datos.json
src/
├── assets/
├── components/
│   ├── AvatarProfile/
│   ├── HomeNavbar/
│   └── TarjetaPropiedad/
├── context/
│   ├── AuthContext.tsx
│   └── PropiedadesContext.tsx
├── pages/
│   ├── Admin/
│   ├── DetallePropiedad/
│   ├── Favoritos/
│   ├── Home/
│   ├── Login/
│   ├── Propiedades/
│   └── RegistrarPropiedad/
├── routes/
│   └── ProtectedRoute.tsx
├── types/
│   └── propiedad.ts
├── utils/
│   ├── archivos.ts
│   └── formato.ts
├── index.css
├── main.tsx
└── App.tsx
```

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Modelo de datos](docs/DATA_MODEL.md)
- [Decisiones técnicas](docs/DECISIONS.md)
- [Correspondencia con la rúbrica y pruebas de defensa](docs/RUBRICA_PROYECTO.md)
- [Plan de trabajo original](docs/correcion%20de%20errores/FIXROADMAP%20001.md)

## Limitaciones conocidas

1. No hay backend ni base de datos compartida. El catálogo base es un archivo JSON estático.
2. Las solicitudes y aprobaciones locales pertenecen al navegador actual y no modifican el JSON del repositorio.
3. Los datos del navegador pueden borrarse o alterarse manualmente y no deben considerarse confiables.
4. La autenticación y los roles son simulados; la protección de rutas es navegación frontend, no seguridad de backend.
5. El almacenamiento de imágenes en data URLs puede agotar la cuota disponible.
6. No hay pruebas automatizadas de componentes configuradas; la verificación continua comprueba lint, TypeScript y compilación de producción.
