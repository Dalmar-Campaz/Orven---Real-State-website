# Orven — plataforma inmobiliaria

Orven es una aplicación académica de frontend para explorar propiedades, consultar asesores y representar un flujo básico de publicación y revisión. Está construida con React, TypeScript y Vite.

> **Datos:** el catálogo inicial se lee desde `public/datos.json` mediante `fetch`. El archivo contiene 20 propiedades y 5 agentes ficticios relacionados mediante `agenteId`. No hay backend ni una base de datos real.

## Funcionalidades

- **Inicio:** muestra propiedades destacadas y un buscador que envía los criterios elegidos al catálogo. Las opciones de ciudad, tipo y rango de precio se derivan de los datos.
- **Catálogo (`/propiedades`):** muestra los inmuebles del JSON y los aprobados localmente. Incluye filtros combinados por ubicación, tipo, operación, precio mínimo/máximo y habitaciones; permite ordenar por fecha, precio o área y paginar los resultados.
- **Detalle (`/propiedades/:id`):** muestra imágenes, descripción, características y el agente relacionado con la propiedad.
- **Favoritos (`/favoritos`):** reúne las propiedades guardadas desde las tarjetas o el detalle.
- **Inicio de sesión (`/login`):** valida el formato del correo y una longitud mínima de contraseña, y asigna un rol de demostración según el correo. «Recordar mi sesión» utiliza `localStorage`; sin marcarlo, utiliza `sessionStorage`. No verifica credenciales con un servidor.
- **Registro de propiedades (`/formulario`):** valida campos, permite previsualizar imágenes y crea una solicitud pendiente. La solicitud se relaciona con el primer agente disponible.
- **Panel administrativo (`/admin`):** protegido para el rol `admin`. Lee las solicitudes compartidas, con búsqueda, filtros, paginación y detalle. Aprobar una solicitud la convierte en propiedad publicada; rechazarla guarda el motivo.

## Datos y persistencia

### Archivo JSON de la entrega

`public/datos.json` contiene dos entidades:

- `propiedades`: mínimo 20 inmuebles con ID único.
- `agentes`: mínimo 5 agentes con ID único.

Cada inmueble contiene un `agenteId` que referencia un agente existente. Todos los registros son ficticios y están marcados como datos de demostración. El proveedor valida las cantidades, la estructura, los IDs y las relaciones antes de mostrar la aplicación.

Para agregar una propiedad de prueba, añade un objeto con la misma estructura y un nuevo ID a `propiedades`, usando un `agenteId` que exista en `agentes`. Para probar una categoría nueva, cambia o añade el valor de `tipo`. Recarga la aplicación: el registro y la nueva opción del filtro deben aparecer sin modificar React.

### Almacenamiento del navegador

- `orven_propiedades` guarda un JSON versionado con propiedades locales y solicitudes. El formato actual es la versión 2; también se acepta la versión 1 para conservar datos de sesiones anteriores.
- El catálogo base siempre se obtiene de `datos.json`. Las propiedades guardadas localmente cuyos IDs no aparecen en el archivo se agregan al catálogo; si el ID existe en ambos, prevalece el JSON.
- `orven_favoritos` guarda un arreglo JSON de identificadores de propiedades favoritas (`number[]`).
- `orven_user` guarda la sesión cuando «Recordar mi sesión» está marcado.
- `orven_user_session` guarda la sesión solo en la pestaña actual cuando el checkbox está desmarcado.
- Las contraseñas no se guardan.
- Los cambios en propiedades, solicitudes y favoritos se sincronizan entre pestañas del mismo navegador mediante el evento `storage`. No se sincronizan navegadores, perfiles ni dispositivos; los favoritos tampoco están asociados a una cuenta de usuario.

Las imágenes del formulario se almacenan como data URL en el almacenamiento local. Pueden consumir rápidamente la cuota disponible; si el navegador rechaza el guardado, la operación no se aplica y el formulario muestra un error.

`localStorage` y `sessionStorage` son almacenamiento local del navegador, no una base de datos compartida. La autenticación es una simulación frontend: proteger una ruta en React no sustituye la autorización de un servidor.

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

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Ejecuta TypeScript (`tsc -b`) y después la compilación de Vite. |
| `npm run lint` | Ejecuta Oxlint. |
| `npm run preview` | Sirve localmente el resultado de una compilación previa. |

El proyecto no define un script de pruebas automatizadas.

## Cuenta de demostración

En `/login`, cualquier correo con formato válido y una contraseña de al menos 6 caracteres inicia sesión:

- `admin@orven.com` recibe el rol `admin` y accede a `/admin`.
- Cualquier otro correo recibe el rol `customer` y se dirige a Home.

La contraseña no se comprueba ni se almacena. Es una simulación académica, no autenticación real.

## Estructura principal

```text
public/
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
├── data/
│   └── propiedades.ts
├── pages/
│   ├── Admin/
│   ├── DetallePropiedad/
│   ├── Favoritos/
│   ├── Home/
│   ├── Login/
│   ├── Propiedades/
│   └── RegistrarPropiedad/
├── routes/
├── types/
├── utils/
├── App.tsx
├── index.css
└── main.tsx
```

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Modelo de datos](docs/DATA_MODEL.md)
- [Decisiones técnicas](docs/DECISIONS.md)
- [Correspondencia con la rúbrica y pruebas de defensa](docs/RUBRICA_PROYECTO.md)
- [Plan de trabajo original](docs/correcion%20de%20errores/FIXROADMAP%20001.md)

## Limitaciones conocidas

1. No hay backend ni base de datos compartida. El catálogo base es un archivo estático.
2. Las solicitudes y aprobaciones locales no modifican el archivo público `datos.json`; quedan en el navegador actual.
3. Los datos del navegador pueden borrarse o alterarse manualmente y no deben considerarse confiables.
4. Las data URLs de imágenes pueden agotar la cuota de almacenamiento.
5. La autenticación y los roles son simulados; la protección de rutas es navegación frontend, no seguridad de backend.
6. No hay pruebas automatizadas configuradas. Ejecuta `npm run build` y `npm run lint`, además de las pruebas manuales descritas en la guía de rúbrica.
