# Arquitectura de Orven

## 1. Visión general

Orven es una aplicación frontend de una sola página (SPA) construida con React, TypeScript y Vite. React Router DOM gestiona la navegación. React Context se utiliza actualmente solo para compartir la sesión de demostración.

No hay backend ni base de datos conectada. Tampoco está implementado todavía un contexto compartido para propiedades y solicitudes.

## 2. Arranque de la aplicación

Flujo de entrada:

1. Vite carga `index.html`, que contiene el elemento `#root` y carga `/src/main.tsx`.
2. `src/main.tsx` crea la raíz con `ReactDOM.createRoot` y renderiza `App` dentro de `React.StrictMode`.
3. `src/App.tsx` importa `App.css` y monta `AuthProvider`, `BrowserRouter` y `AppRoutes`.
4. `AppRoutes` consulta el usuario con `useAuth` y declara las rutas activas.

Actualmente `AuthProvider` está por fuera de `BrowserRouter`. Esto funciona con el contexto presente porque `AuthContext` no utiliza hooks del router. Si el proveedor llegara a utilizar `useNavigate`, `useLocation` u otro hook del router, habría que colocar `BrowserRouter` por encima de `AuthProvider`.

## 3. Estructura actual

| Ruta | Responsabilidad y estado |
|---|---|
| `src/assets/` | Logos e iconos compartidos. |
| `src/components/AvatarProfile/` | Menú de cuenta, sesión y cierre de sesión. |
| `src/components/HomeNavbar/` | Barra de navegación de Home. |
| `src/context/AuthContext.tsx` | Estado y persistencia de la sesión simulada. |
| `src/context/PropiedadesContext.tsx` | Archivo existente, actualmente vacío; no comparte datos todavía. |
| `src/data/propiedades.ts` | Tipos y arreglos de propiedades de ejemplo. |
| `src/pages/` | Pantallas de Home, Login, Admin, Registro y el componente de catálogo en preparación. |
| `src/routes/ProtectedRoute.tsx` | Archivo existente, actualmente vacío; no protege rutas. |
| `src/types/propiedad.ts` | Archivo existente, actualmente vacío; no define aún el modelo común. |
| `src/utils/formato.ts` | Archivo existente, actualmente vacío. |
| `src/main.tsx` | Punto de entrada de React. |
| `src/App.tsx` | Composición de proveedores y definición de rutas. |

La carpeta de componentes se llama actualmente `components` (plural).

## 4. Rutas activas

Las rutas se encuentran en `src/App.tsx`.

| Ruta | Componente | Comportamiento actual |
|---|---|---|
| `/` | `Home` | Página principal. |
| `/login` | `Login` | Muestra el formulario si no hay usuario. Si ya existe sesión, redirige a `/admin` para rol `admin` y a `/` para los demás roles. |
| `/admin` | `Admin` | Panel administrativo; no comprueba el rol antes de renderizar. |
| `/formulario` | `RegistrarPropiedad` | Formulario de solicitud; no recibe actualmente el callback de envío. |
| Cualquier otra ruta | — | Redirige a `/` mediante `Navigate`. |

La ruta `/propiedades` está comentada, por lo que no está activa. Home conserva un enlace que navega a esa URL; al no existir la ruta, la ruta comodín devuelve al usuario a Home.

Hay otros destinos no declarados, entre ellos `/recuperar`, `/contacto`, `/nosotros` y `/propiedades/:id`.

## 5. Sesión y roles

### AuthContext

`src/context/AuthContext.tsx` define:

- `UserRole`: `'admin' | 'customer' | null`.
- `User`: correo y rol.
- `AuthProvider`: mantiene el usuario en estado React y lo comparte mediante Context.
- `useAuth`: hook de acceso al contexto; lanza un error si se utiliza fuera de `AuthProvider`.

Al inicializarse, el proveedor intenta leer el objeto `orven_user` desde `localStorage`. `login` guarda el usuario serializado y `logout` elimina esa clave.

### Inicio de sesión

En `Login.tsx`, la validación comprueba el formato del correo y que la contraseña tenga al menos seis caracteres. La contraseña no se verifica con un servidor. El rol se asigna comparando el correo con `ADMIN_EMAILS`: `admin@orven.com` recibe `admin`; otros correos válidos reciben `customer`.

El checkbox «Recordar mi sesión» actualiza estado local del formulario, pero no cambia el mecanismo de persistencia: el contexto siempre usa `localStorage`.

**Seguridad:** guardar un rol en `localStorage` y decidirlo a partir del correo no constituye autenticación ni autorización segura. La ruta `/admin` no está protegida actualmente. `ProtectedRoute.tsx` existe, pero está vacío.

Además, la lectura de `orven_user` utiliza `JSON.parse` sin manejo de errores; un valor corrupto puede impedir la inicialización del contexto.

## 6. Componentes reutilizables

- `AvatarProfile`: consulta la sesión; ofrece iniciar sesión cuando no hay usuario y, cuando sí lo hay, muestra el correo, permite cerrar sesión y muestra un acceso al panel si el rol es `admin`.
- `HomeNavbar`: barra superior de Home; incluye el logo, enlaces de sección y `AvatarProfile`.

Las páginas contienen componentes auxiliares internos, como selectores e iconos SVG.

## 7. Páginas y responsabilidades

- **Home:** muestra el hero, un formulario de búsqueda visual, propiedades destacadas importadas directamente desde `propertiesDB`, favoritos en estado local, testimonios y una llamada a publicar. El buscador solo desplaza la vista a la sección de propiedades; no aplica filtros. El enlace «Ver todas» apunta a `/propiedades`, que aún no está activa.
- **Login:** valida campos en el navegador, asigna un rol de demostración y llama a `login`.
- **Admin:** define `SOLICITUDES_INICIALES` dentro de `Admin.tsx`, mantiene las solicitudes en estado local y ofrece búsqueda, filtros, paginación, detalle y acciones de aprobar/rechazar.
- **RegistrarPropiedad:** valida el formulario, crea vistas previas locales de imágenes y construye un objeto `SolicitudPropiedad`. Su prop `onSubmit` es opcional y no se conecta desde la ruta actual.
- **Propiedades:** el componente contiene lógica de filtros, ordenamiento, paginación y favoritos en `localStorage`. Requiere una prop `propiedades`, pero la ruta está comentada y el componente no está conectado al catálogo. Su CSS está vacío.

## 8. Flujo de datos y persistencia

- `Home` importa `propertiesDB` directamente desde `src/data/propiedades.ts`.
- `pendingPropertiesDB` está definido en ese archivo, pero no se consume desde las páginas actuales.
- `Propiedades` espera una colección propia de tipo `Propiedad[]` mediante props; no utiliza `propertiesDB` ni un Context.
- `Admin` declara sus solicitudes de ejemplo dentro del componente y las copia a estado local.
- `RegistrarPropiedad` construye una solicitud y llama a `onSubmit` solo si recibe ese callback. La ruta no se lo proporciona.
- `AuthContext` persiste sesión en `localStorage` bajo `orven_user`.
- Los favoritos de `Home` solo existen en estado React y se pierden al desmontar o recargar.
- El componente no integrado `Propiedades` guarda sus favoritos bajo `orven:favoritos`.

No hay sincronización entre el formulario de registro, las solicitudes del administrador y las propiedades destacadas.

## 9. Archivos preparados pero aún no implementados

Los siguientes archivos existen, pero están vacíos en la revisión actual:

- `src/context/PropiedadesContext.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/types/propiedad.ts`
- `src/utils/formato.ts`

Por tanto, no se debe documentar todavía un modelo unificado, un estado compartido de propiedades, una utilidad común de formato ni protección de rutas como funcionalidades implementadas.

## 10. Estilos

Los archivos CSS se encuentran junto a sus páginas o componentes y se importan directamente desde los TSX. Son hojas CSS normales, no CSS Modules; sus selectores pueden afectar globalmente al documento.

- `src/App.css` se importa desde `App.tsx`, pero está vacío.
- `src/index.css` existe, pero no se importa desde `main.tsx`, `App.tsx` ni los demás TSX actuales.
- `src/pages/Propiedades/Propiedades.css` está vacío.
- Las demás páginas y componentes importan sus hojas CSS locales.

## 11. Integraciones pendientes

1. Definir un modelo común de propiedad y un modelo separado para solicitudes.
2. Implementar `PropiedadesContext` y conectar formulario, Admin y Home.
3. Decidir e implementar la persistencia local compatible con el alcance académico.
4. Habilitar e integrar la página `/propiedades` después de estabilizar el modelo y el flujo de datos.
5. Implementar la protección de `/admin` para el rol administrativo.
6. Resolver los destinos de navegación que aún no tienen rutas.
7. Revisar el manejo de datos corruptos en `AuthContext` y los estilos globales no utilizados.

Esta documentación describe el código inspeccionado; no se realizaron cambios funcionales al elaborar esta revisión.
