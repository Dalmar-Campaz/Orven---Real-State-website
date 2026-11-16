# Orven — plataforma inmobiliaria

Orven es un proyecto académico de frontend para explorar propiedades y representar un flujo básico de publicación y revisión de inmuebles. Está construido con React, TypeScript y Vite.

> **Estado actual:** prototipo frontend en desarrollo. No tiene backend ni base de datos. El formulario, el panel administrativo y Home comparten los datos mediante `PropiedadesContext`. Las propiedades publicadas y las solicitudes se guardan en `localStorage`; la página de catálogo tiene por ahora una pantalla temporal y su diseño final se integrará en la Fase 2.

## Funcionalidades y estado actual

- **Inicio:** muestra las propiedades marcadas como destacadas en el catálogo compartido. El buscador aún es visual y no aplica filtros. Los favoritos actuales solo viven en el estado local de Home; todavía no son compartidos ni persistentes. «Ver detalles» está deshabilitado hasta la Fase 3.
- **Inicio de sesión:** valida el formato del correo y una longitud mínima de contraseña, y asigna un rol de demostración según el correo. «Recordar mi sesión» utiliza `localStorage`; sin marcarlo, utiliza `sessionStorage`. No verifica credenciales con un servidor.
- **Registro de propiedades (`/formulario`):** valida los campos, permite previsualizar imágenes y crea una solicitud pendiente a través del contexto. Las imágenes seleccionadas se convierten a data URL y se guardan junto con la solicitud. Si el almacenamiento falla, se muestra un error y no se confirma el envío.
- **Panel administrativo (`/admin`):** protegido para el rol `admin`. Lee las solicitudes compartidas, con búsqueda, filtro, paginación y detalle. Aprobar una solicitud la convierte en propiedad publicada; rechazarla guarda el motivo y este aparece en el detalle. Las opciones de navegación aún no implementadas se muestran deshabilitadas.
- **Catálogo (`/propiedades`):** contiene una pantalla temporal que informa que el diseño final se integrará en la Fase 2.

## Persistencia y límites

- `orven_propiedades` guarda un único objeto JSON versionado con las propiedades publicadas y las solicitudes.
- `orven_user` guarda la sesión cuando «Recordar mi sesión» está marcado.
- `orven_user_session` guarda la sesión solo en la pestaña actual cuando el checkbox está desmarcado.
- Las contraseñas no se guardan.
- Los cambios de propiedades y solicitudes se sincronizan entre pestañas del mismo navegador mediante el evento `storage`. Este mecanismo no sincroniza usuarios, navegadores ni dispositivos.
- Las imágenes del formulario se almacenan como data URL dentro de los datos locales. Son prácticas para el prototipo, pero pueden consumir rápidamente la cuota disponible; si el navegador rechaza el guardado, la operación no se aplica y el formulario muestra un error. Para imágenes más grandes, una fase futura debería evaluar IndexedDB o un servicio de imágenes.

`localStorage` y `sessionStorage` son almacenamiento local del navegador, no una base de datos compartida. La autenticación también es una simulación frontend: proteger una ruta en React no sustituye la autorización de un servidor.

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

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Ejecuta TypeScript (`tsc -b`) y después la compilación de Vite. |
| `npm run lint` | Ejecuta Oxlint. |
| `npm run preview` | Sirve localmente el resultado de una compilación previa. |

El proyecto no define un script de pruebas automatizadas.

## Cuentas de demostración

En `/login`, cualquier correo con formato válido y una contraseña de al menos 6 caracteres inicia sesión:

- `admin@orven.com` recibe el rol `admin` y accede a `/admin`.
- Cualquier otro correo recibe el rol `customer` y se dirige a Home.

La contraseña no se comprueba. No se almacena. Es una simulación académica, no autenticación real.

## Estructura actual

```text
src/
├── assets/
├── components/
│   ├── AvatarProfile/
│   └── HomeNavbar/
├── context/
│   ├── AuthContext.tsx
│   └── PropiedadesContext.tsx
├── data/
│   └── propiedades.ts
├── pages/
│   ├── Admin/
│   ├── Home/
│   ├── Login/
│   ├── Propiedades/           # Pantalla temporal; el diseño se integra en Fase 2
│   └── RegistrarPropiedad/
├── routes/
│   └── ProtectedRoute.tsx
├── types/
│   └── propiedad.ts
├── utils/
│   ├── archivos.ts
│   └── formato.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## Documentación y planificación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Modelo de datos](docs/DATA_MODEL.md)
- [Decisiones técnicas](docs/DECISIONS.md)
- [Plan de trabajo](docs/correcion%20de%20errores/FIXROADMAP%20001.md)

## Limitaciones conocidas

1. No hay backend ni base de datos. El almacenamiento pertenece al navegador actual.
2. Los datos del navegador pueden borrarse manualmente y no deben considerarse confiables.
3. Las data URLs de imágenes pueden agotar la cuota de almacenamiento. El contexto maneja el error y evita confirmar una operación que no se pudo guardar.
4. El catálogo está en una pantalla temporal; el diseño final aún no está integrado.
5. El buscador de Home aún no filtra resultados.
6. Los favoritos todavía no están en un contexto común ni se guardan entre recargas.
7. El detalle individual de las propiedades está reservado para la Fase 3.
8. El rol administrativo se simula a partir del correo. La protección de rutas es una restricción de navegación del frontend, no seguridad de backend.
9. El proyecto no tiene pruebas automatizadas. El build y lint deben volver a ejecutarse después de integrar esta rama.
