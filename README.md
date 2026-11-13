# Orven — plataforma inmobiliaria

Orven es un proyecto académico de frontend para explorar propiedades y representar un flujo básico de publicación y revisión de inmuebles. Está construido con React y TypeScript sobre Vite.

> **Estado del proyecto:** prototipo frontend. No tiene backend ni base de datos. Varias pantallas utilizan datos de demostración y todavía hay integraciones pendientes; consulta [Limitaciones conocidas](#limitaciones-conocidas).

## Funcionalidades representadas

- Página de inicio con propiedades destacadas y secciones informativas.
- Formulario de inicio de sesión que asigna un rol de demostración según el correo.
- Menú de cuenta que muestra la sesión y permite cerrarla.
- Panel administrativo con solicitudes de ejemplo, filtros, búsqueda, paginación y acciones de aprobación/rechazo en memoria.
- Formulario de registro de propiedades con validaciones y vista previa local de imágenes.
- Pantalla de exploración de propiedades con filtros, ordenamiento, paginación y favoritos, pendiente de integración con el conjunto de datos de la aplicación.

Estas funciones describen el comportamiento del código actual; no implican autenticación real, envío de solicitudes a un servidor ni persistencia de publicaciones.

## Tecnologías

| Tecnología | Uso |
|---|---|
| React 19 | Construcción de interfaces |
| TypeScript 7 | Tipado estático |
| React Router DOM 7 | Navegación entre rutas |
| Vite 8 | Servidor de desarrollo y compilación |
| CSS | Estilos |
| Oxlint | Análisis estático configurado |

Las versiones corresponden a los rangos declarados en `package.json`.

## Requisitos

- Node.js y npm compatibles con las versiones instaladas de Vite y TypeScript.
- Git para clonar el repositorio.

Consulta los requisitos de versión de las herramientas instaladas si el entorno presenta errores de compatibilidad.

## Instalación y ejecución

Clona el repositorio:

```bash
git clone https://github.com/Dalmar-Campaz/Orven---Real-State-website.git
cd Orven---Real-State-website
```

Instala las dependencias usando el archivo de bloqueo:

```bash
npm ci
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Ejecuta la compilación de TypeScript (`tsc -b`) y después la compilación de Vite. |
| `npm run lint` | Ejecuta Oxlint. |
| `npm run preview` | Sirve localmente el resultado de una compilación previa. |

## Estructura actual

```text
src/
├── assets/                 # Logos e iconos
├── component/              # Componentes reutilizables
│   ├── AvatarProfile/
│   └── HomeNavbar/
├── context/
│   └── AuthContext.tsx     # Estado de sesión y rol
├── data/
│   └── propiedades.ts     # Datos de propiedades de ejemplo
├── pages/
│   ├── Admin/
│   ├── Home/
│   ├── Login/
│   ├── Propiedades/
│   └── RegistrarPropiedad/
├── App.tsx                 # Proveedor de contexto y rutas
├── App.css
├── index.css
└── main.tsx                # Punto de entrada de React
```

La estructura refleja el repositorio actual; los estilos CSS de cada página o componente se encuentran junto a su TSX.

## Documentación técnica

- [Arquitectura](docs/ARCHITECTURE.md): arranque, rutas, contexto y responsabilidades.
- [Modelo de datos](docs/DATA_MODEL.md): estructuras, datos de ejemplo y persistencia.
- [Decisiones técnicas](docs/DECISIONS.md): decisiones observables y sus consecuencias.

## Limitaciones conocidas

1. **La pantalla de propiedades no está conectada todavía al modelo compartido.** `Propiedades.tsx` requiere una prop `propiedades`, pero la ruta en `App.tsx` renderiza `<Propiedades />` sin proporcionarla. Además, el componente importa `./assets/orven-logo.png` y `./assets/propiedades-banner.jpg`, archivos que no aparecen en el contenido actual de `src/pages/Propiedades/`.
2. **El formulario no persiste solicitudes.** `RegistrarPropiedad` recibe un callback opcional `onSubmit`, pero `App.tsx` no se lo pasa. Sin callback, el formulario puede mostrar confirmación aunque no se haya almacenado ni enviado una solicitud.
3. **El panel administrativo utiliza su propio conjunto de datos local.** Sus solicitudes iniciales están definidas dentro de `Admin.tsx`; aprobar o rechazar modifica únicamente el estado React de esa pantalla.
4. **Los modelos de propiedades no coinciden.** `src/data/propiedades.ts` y `Propiedades.tsx` usan nombres y campos distintos. Se necesita una adaptación explícita antes de conectarlos.
5. **El acceso administrativo no está protegido por ruta.** `/admin` se declara directamente y no verifica el rol antes de renderizar la página.
6. **El inicio de sesión es simulado.** No verifica credenciales contra un servidor. El correo `admin@orven.com` recibe el rol `admin`; cualquier otro correo que supere la validación recibe `customer`.
7. **No hay una base de datos ni backend.** Los cambios de estado del panel no sobreviven a una recarga. La sesión y los favoritos de la página de propiedades sí usan `localStorage`, con claves distintas.
8. Algunas acciones apuntan a rutas que no están declaradas (`/recuperar`, `/contacto`, `/nosotros` y `/propiedades/:id`); la ruta comodín redirige a `/`.

## Verificación

Los comandos de instalación, desarrollo, lint y build se documentaron a partir de los scripts de `package.json`. No se ejecutaron en un entorno de compilación durante la elaboración de esta documentación. Por tanto, no se afirma que la compilación o el lint estén pasando actualmente.
