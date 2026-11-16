# Orven — plataforma inmobiliaria
 
Orven es un proyecto académico de frontend para explorar propiedades y representar un flujo básico de publicación y revisión de inmuebles. Está construido con React, TypeScript y Vite.
 
> **Estado actual:** prototipo frontend en desarrollo. No tiene backend ni base de datos. Formulario, panel administrativo y página de inicio ya comparten una misma fuente de datos (`PropiedadesContext`), pero **esos datos viven solo en la memoria del navegador y se pierden al recargar la página**. La página «Ver todas las propiedades» aún no existe: su archivo y su CSS están vacíos y su ruta está deshabilitada. Consulta el [plan de trabajo](docs/correcion%20de%20errores/FIXROADMAP%20001.md).
 
## Funcionalidades y estado actual
 
- **Inicio:** muestra todas las propiedades publicadas del catálogo compartido (hoy 4 de ejemplo, más las que apruebe el administrador durante la sesión). El buscador todavía no filtra: sus campos no se leen y, al enviarlo, solo desplaza la vista a la sección de propiedades. Los favoritos viven únicamente en el estado de la pantalla. El botón «Ver detalles» y el enlace «Ver todas las propiedades» no llevan a ninguna página funcional.
- **Inicio de sesión:** valida el formato del correo y una longitud mínima de contraseña, y asigna un rol de demostración según el correo. No verifica credenciales con un servidor.
- **Registro de propiedades (`/formulario`):** valida los campos (incluidos nombre, teléfono y correo de contacto), permite previsualizar imágenes y, al enviar, crea una solicitud *pendiente* en el estado compartido. Si hay sesión, el correo se prellena. Las imágenes se guardan como data URL dentro de la solicitud.
- **Panel administrativo (`/admin`):** lee las solicitudes del estado compartido (las de ejemplo y las creadas desde el formulario) con búsqueda, filtro por estado, paginación y detalle. Aprobar una solicitud pendiente la convierte en propiedad publicada, y rechazarla guarda un motivo opcional. Los botones «Solicitudes» y «Propiedades» del menú lateral no tienen acción.
- **Ver todas las propiedades:** no implementada. `src/pages/Propiedades/Propiedades.tsx` y `Propiedades.css` existen, pero están vacíos; la ruta `/propiedades` está comentada en `App.tsx`.
Estas funciones describen el comportamiento del código presente. No implican persistencia, autenticación real ni sincronización entre usuarios o dispositivos.
 
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
 
El proyecto no define un script de pruebas automatizadas.
 
## Cuentas de demostración
 
No hay usuarios registrados. En `/login`, cualquier correo con formato válido y una contraseña de al menos 6 caracteres inicia sesión:
 
- `admin@orven.com` recibe el rol `admin` y es redirigido a `/admin`.
- Cualquier otro correo recibe el rol `customer` y es redirigido a Home.
La contraseña no se comprueba. Es una simulación académica, no autenticación real.
 
## Estructura actual
 
```text
src/
├── assets/                    # Logos e iconos
├── components/
│   ├── AvatarProfile/
│   └── HomeNavbar/
├── context/
│   ├── AuthContext.tsx        # Sesión y rol de demostración
│   └── PropiedadesContext.tsx # Propiedades publicadas y solicitudes
├── data/
│   └── propiedades.ts         # Datos iniciales: propiedades y solicitudes
├── pages/
│   ├── Admin/
│   ├── Home/
│   ├── Login/
│   ├── Propiedades/           # Archivos vacíos; ruta deshabilitada
│   └── RegistrarPropiedad/
├── routes/
│   └── ProtectedRoute.tsx     # Archivo creado, aún vacío
├── types/
│   └── propiedad.ts           # Modelo común: Propiedad y SolicitudPropiedad
├── utils/
│   ├── archivos.ts            # Convierte un File en data URL
│   └── formato.ts             # Formato de precio y ubicación
├── App.tsx                    # Proveedores y rutas
├── App.css                    # Vacío
├── index.css                  # Estilos base, importado desde main.tsx
└── main.tsx                   # Punto de entrada de React
```
 
## Documentación y planificación
 
- [Arquitectura](docs/ARCHITECTURE.md): arranque, rutas, contextos y flujo de datos.
- [Modelo de datos](docs/DATA_MODEL.md): tipos, datos de ejemplo, reglas del contexto y persistencia.
- [Decisiones técnicas](docs/DECISIONS.md): decisiones observadas y alcance acordado.
- [Plan de trabajo](docs/correcion%20de%20errores/FIXROADMAP%20001.md): checklist por fases para estabilizar el proyecto.
## Limitaciones conocidas
 
1. **No hay backend ni base de datos.** Los arreglos de TypeScript y el estado de React son datos locales de demostración.
2. **No hay persistencia de propiedades ni solicitudes.** `PropiedadesContext` guarda todo en memoria. Al recargar la página se restauran los datos de ejemplo y se pierden las solicitudes creadas y las decisiones del administrador. Solo la sesión se guarda, en `localStorage`.
3. **Las imágenes del formulario se guardan como data URL** dentro del estado. Si más adelante se persisten en `localStorage`, el límite de almacenamiento del navegador puede agotarse; la estrategia está pendiente.
4. **La página de catálogo no existe todavía.** `/propiedades` está comentada en `App.tsx`; el enlace «Ver todas las propiedades» de Home navega a esa URL y la ruta comodín lo redirige a `/`.
5. **Home muestra todo el catálogo como «destacadas».** El campo `destacada` existe en el modelo, pero ningún componente lo utiliza.
6. **El buscador de Home y los botones «Ver detalles» no funcionan.** Los selectores del buscador no se leen y «Ver detalles» es un enlace sin destino.
7. **La autenticación es simulada y `/admin` no está protegida.** La ruta renderiza el panel sin comprobar sesión ni rol; `ProtectedRoute.tsx` está vacío. El rol sale del correo y se guarda en `localStorage` bajo `orven_user`; no es una garantía de seguridad.
8. **`AuthContext` no maneja datos corruptos:** la lectura de `orven_user` usa `JSON.parse` sin `try/catch`.
9. **«Recordar mi sesión» no tiene efecto.** El checkbox cambia un estado local del formulario; la sesión siempre se guarda en `localStorage`.
10. **El motivo de rechazo se guarda, pero el panel no lo muestra.**
11. **Galería del panel:** muestra 3 miniaturas pero calcula las fotos restantes como `total − 4`, por lo que el contador «+N» no coincide con las fotos ocultas.
12. **Los botones «Solicitudes» y «Propiedades» del menú del panel no tienen acción.**
13. **Datos de ejemplo con inconsistencias:** fechas en formatos distintos (ISO y `dd/mm/aaaa`), una solicitud con título de casa pero tipo `Apartamento` (id 3), una solicitud aprobada (id 6) sin su propiedad en el catálogo, y ciudades (`Santa Marta`, `La Calera`) que no existen en la lista del formulario.
14. **Destinos sin ruta declarada:** `/recuperar`, `/contacto`, `/nosotros` y `/propiedades/:id`. La ruta comodín redirige a Home.
15. **Código duplicado:** la lista de ciudades (Home y formulario) y la expresión regular de correo (Login y formulario).
16. **Residuos de depuración:** `PropiedadesContext` conserva dos `console.log` en `aprobarSolicitud`, y `Admin.tsx` tiene un comentario con el antiguo arreglo `SOLICITUDES_INICIALES`.
17. **Estilos globales repetidos:** `Home.css` redefine reglas de `html`, `body` y `#root` que ya están en `index.css`; `AvatarProfile.css` declara variables en `:root`. Todas las hojas CSS son globales (no CSS Modules).
18. **`src/assets/Logo.png` pesa cerca de 1,1 MB** en la compilación.
## Verificación
 
Última verificación automatizada, sobre el commit `759cf3b` (2026-11-16), con Node 22 y `npm ci`:
 
- `npm run build`: compila sin errores.
- `npm run lint`: 0 errores y 3 avisos. Dos son de `react/only-export-components` (los hooks `useAuth` y `usePropiedades` se exportan junto a su proveedor) y uno es de `react/refs` en `RegistrarPropiedad.tsx` (asigna `imagenesRef.current` durante el renderizado).
No se ejecutó la aplicación en un navegador para esta verificación, y el proyecto no tiene pruebas automatizadas.
 