# Orven — plataforma inmobiliaria

Orven es un proyecto académico de frontend para explorar propiedades y representar un flujo básico de publicación y revisión de inmuebles. Está construido con React, TypeScript y Vite.

> **Estado actual:** prototipo frontend en desarrollo. No tiene backend ni base de datos. El catálogo, el formulario y el panel administrativo todavía no comparten un mismo flujo de datos. La página de «Ver todas las propiedades» tiene un componente en preparación, pero su ruta no está habilitada. Consulta el [plan de trabajo](docs/correcion%20de%20errores/FIXROADMAP%20001.md).

## Funcionalidades y estado actual

- **Inicio:** muestra cuatro propiedades destacadas desde `src/data/propiedades.ts`. El buscador todavía no filtra; al enviarlo, desplaza la vista a la sección de propiedades. Los favoritos de esta pantalla viven solo en el estado del componente.
- **Inicio de sesión:** valida el formato del correo y una longitud mínima de contraseña, y asigna un rol de demostración según el correo. No verifica credenciales con un servidor.
- **Panel administrativo:** presenta solicitudes de ejemplo con búsqueda, filtros, paginación y acciones de aprobación/rechazo. Los cambios solo viven en el estado de la pantalla.
- **Registro de propiedades:** valida los campos y permite previsualizar imágenes seleccionadas. La ruta actual no conecta el callback de envío con un almacenamiento, por lo que el mensaje de éxito no significa que la solicitud haya quedado guardada.
- **Ver todas las propiedades:** existe un componente `Propiedades.tsx` con una implementación visual y lógica de filtros, orden, paginación y favoritos, pero la ruta `/propiedades` está comentada en `App.tsx`. Su CSS está vacío y el componente todavía no recibe datos del catálogo compartido.

Estas funciones describen el comportamiento del código presente; no implican persistencia central, autenticación real ni sincronización entre páginas.

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

- Node.js compatible con Vite y Oxlint: `^20.19.0` o `>=22.12.0`, según los requisitos declarados en el archivo de bloqueo.
- npm.
- Git para clonar el repositorio.

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
| `npm run build` | Ejecuta TypeScript (`tsc -b`) y después la compilación de Vite. |
| `npm run lint` | Ejecuta Oxlint. |
| `npm run preview` | Sirve localmente el resultado de una compilación previa. |

Los comandos anteriores están definidos en `package.json`. El repositorio incluye `package-lock.json`, por lo que `npm ci` es el comando apropiado para instalar exactamente las dependencias bloqueadas.

## Estructura actual

```text
src/
├── assets/                    # Logos e iconos
├── components/
│   ├── AvatarProfile/
│   └── HomeNavbar/
├── context/
│   ├── AuthContext.tsx        # Sesión y rol de demostración
│   └── PropiedadesContext.tsx # Archivo creado, aún vacío
├── data/
│   └── propiedades.ts         # Datos de ejemplo
├── pages/
│   ├── Admin/
│   ├── Home/
│   ├── Login/
│   ├── Propiedades/           # Componente en preparación; ruta deshabilitada
│   └── RegistrarPropiedad/
├── routes/
│   └── ProtectedRoute.tsx     # Archivo creado, aún vacío
├── types/
│   └── propiedad.ts           # Archivo creado, aún vacío
├── utils/
│   └── formato.ts             # Archivo creado, aún vacío
├── App.tsx                    # Proveedores y rutas
├── App.css
├── index.css
└── main.tsx                   # Punto de entrada de React
```

Los archivos indicados como «aún vacíos» existen en el repositorio, pero todavía no implementan esas responsabilidades.

## Documentación y planificación

- [Arquitectura](docs/ARCHITECTURE.md): arranque, rutas, contexto y responsabilidades actuales.
- [Modelo de datos](docs/DATA_MODEL.md): estructuras existentes, datos de ejemplo y persistencia.
- [Decisiones técnicas](docs/DECISIONS.md): decisiones observadas y alcance acordado.
- [Plan de trabajo](docs/correcion%20de%20errores/FIXROADMAP%20001.md): checklist por fases para estabilizar el proyecto, integrar el catálogo y después implementar funcionalidades.

## Limitaciones conocidas

1. **No hay backend ni base de datos.** Los arreglos de TypeScript y el estado de React son datos locales de demostración.
2. **Los modelos están fragmentados.** `data/propiedades.ts`, `Admin.tsx`, `RegistrarPropiedad.tsx` y `Propiedades.tsx` utilizan estructuras distintas para representar inmuebles o solicitudes.
3. **No existe estado compartido de propiedades.** `PropiedadesContext.tsx` está vacío. Home, Admin y el formulario no comparten sus datos.
4. **La ruta del catálogo está deshabilitada.** `App.tsx` tiene comentada la ruta `/propiedades`. El enlace «Ver todas las propiedades» de Home navega a esa URL, pero la ruta comodín la redirige a `/`.
5. **El componente de catálogo no está integrado.** `Propiedades.tsx` exige una prop `propiedades`; todavía no hay un componente padre que le entregue el catálogo. `Propiedades.css` está vacío. El archivo importa el logo desde `src/assets/Logo.png`, que sí está presente en el repositorio.
6. **El formulario no guarda solicitudes.** `RegistrarPropiedad` acepta un callback opcional `onSubmit`, pero `App.tsx` no se lo pasa. Si no recibe callback, el formulario puede mostrar confirmación sin almacenar los datos.
7. **El panel usa datos independientes.** `Admin.tsx` define `SOLICITUDES_INICIALES` y modifica una copia en estado local; los cambios se pierden al recargar.
8. **Los datos pendientes de ejemplo no se consumen.** `pendingPropertiesDB` está definido en `src/data/propiedades.ts`, pero ninguna página actual lo importa.
9. **La autenticación es simulada y la ruta administrativa no está protegida.** `/admin` renderiza el panel sin comprobar el rol. El usuario se guarda en `localStorage` bajo `orven_user`; el rol no es una garantía de seguridad.
10. **Los favoritos no comparten comportamiento.** Home los mantiene en estado React; el componente no integrado de Propiedades usa `localStorage` con `orven:favoritos`.
11. **Hay destinos sin ruta declarada.** Entre ellos `/recuperar`, `/contacto`, `/nosotros` y `/propiedades/:id`. La ruta comodín redirige a Home.
12. **Estilos globales:** `src/index.css` existe, pero no se importa desde los archivos TSX actuales. `src/App.css` y `src/pages/Propiedades/Propiedades.css` están vacíos.
13. **Metadatos pendientes:** `index.html` conserva `lang="en"` y el título «Orven - Real State», aunque la interfaz está en español.

## Verificación

La disponibilidad de los comandos se comprobó contra `package.json`, la existencia de `package-lock.json` y los requisitos de Node declarados por las dependencias bloqueadas. No se ejecutaron `npm ci`, `npm run build` ni `npm run lint` durante esta revisión remota. Por tanto, no se afirma que la instalación, compilación o lint estén pasando actualmente.
