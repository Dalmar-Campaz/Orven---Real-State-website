# Arquitectura de Orven

## 1. Visión general

Orven es una aplicación frontend de una sola página (SPA) construida con React, TypeScript y Vite. La navegación se gestiona con React Router DOM. El estado compartido de sesión se expone mediante React Context.

No existe una API ni una base de datos conectada en el código revisado. Los datos de demostración viven en archivos TypeScript o en el estado local de cada pantalla.

## 2. Arranque de la aplicación

Flujo de entrada:

1. Vite carga `index.html`, que contiene el elemento `#root` y carga `/src/main.tsx`.
2. `src/main.tsx` crea la raíz con `ReactDOM.createRoot` y renderiza `App` dentro de `React.StrictMode`.
3. `src/App.tsx` monta `AuthProvider`, `BrowserRouter` y `AppRoutes`.
4. `AppRoutes` consulta el usuario con `useAuth` y declara las rutas.

Actualmente `AuthProvider` está por fuera de `BrowserRouter`. Esto funciona con el contexto presente porque `AuthContext` no utiliza hooks del router. Si el proveedor llegara a utilizar `useNavigate`, `useLocation` u otro hook del router, habría que colocar `BrowserRouter` por encima de `AuthProvider`.

## 3. Estructura de carpetas

| Ruta | Responsabilidad observada |
|---|---|
| `src/assets/` | Logos e iconos compartidos. |
| `src/component/` | Componentes reutilizables, actualmente `AvatarProfile` y `HomeNavbar`. |
| `src/context/` | Contexto global de autenticación/sesión. |
| `src/data/` | Datos de propiedades de ejemplo. |
| `src/pages/` | Pantallas completas y sus hojas CSS. |
| `src/main.tsx` | Punto de entrada de React. |
| `src/App.tsx` | Composición de proveedores y definición de rutas. |
| `src/index.css` | Estilos globales y configuración básica del documento. |

La carpeta se llama actualmente `component` (singular). Esta documentación conserva el nombre real del repositorio; cambiarlo sería una modificación estructural aparte.

## 4. Rutas declaradas

Las rutas se encuentran en `src/App.tsx`.

| Ruta | Componente | Comportamiento |
|---|---|---|
| `/` | `Home` | Página principal. |
| `/login` | `Login` | Muestra el formulario si no hay usuario. Si ya existe una sesión, redirige a `/admin` para rol `admin` y a `/` para los demás roles. |
| `/admin` | `Admin` | Panel administrativo. Actualmente no tiene una comprobación de rol en la ruta. |
| `/formulario` | `RegistrarPropiedad` | Formulario de solicitud de publicación. |
| `/propiedades` | `Propiedades` | Pantalla de filtros y resultados; su integración está incompleta (ver sección 9). |
| Cualquier otra ruta | — | Redirige a `/` mediante `Navigate`. |

Hay enlaces y acciones que navegan a rutas no declaradas, entre ellas `/recuperar`, `/contacto`, `/nosotros` y `/propiedades/:id`.

## 5. Sesión y roles

### AuthContext

`src/context/AuthContext.tsx` define:

- `UserRole`: `'admin' | 'customer' | null`.
- `User`: correo y rol.
- `AuthProvider`: mantiene el usuario en estado React y lo comparte mediante Context.
- `useAuth`: hook de acceso al contexto; lanza un error si se utiliza fuera de `AuthProvider`.

Al inicializarse, el proveedor intenta leer el objeto `orven_user` desde `localStorage`. `login` guarda el usuario serializado y `logout` elimina esa clave.

### Inicio de sesión

En `Login.tsx`, la validación comprueba el formato del correo y que la contraseña tenga al menos seis caracteres. El valor de la contraseña no se verifica con un servidor. El rol se asigna comparando el correo con la lista `ADMIN_EMAILS`: `admin@orven.com` recibe `admin`; otros correos válidos reciben `customer`.

El checkbox «Recordar mi sesión» actualiza estado local del formulario, pero no cambia el mecanismo de persistencia: el contexto siempre usa `localStorage`.

**Seguridad:** esto es una simulación de autenticación para un prototipo. Guardar un rol en `localStorage` y decidirlo a partir del correo no constituye autenticación ni autorización segura. No debe utilizarse para proteger datos o funciones reales.

## 6. Componentes reutilizables

- `AvatarProfile`: consulta la sesión; ofrece iniciar sesión cuando no hay usuario y, cuando sí lo hay, muestra el correo, permite cerrar sesión y muestra un acceso al panel si el rol es `admin`.
- `HomeNavbar`: barra superior de la página de inicio; incluye el logo, enlaces de sección y `AvatarProfile`.

Las páginas de propiedades y registro mantienen componentes auxiliares internos (selectores e iconos SVG) dentro de sus propios archivos.

## 7. Páginas principales

- **Home:** muestra el hero, formulario visual de búsqueda, propiedades destacadas importadas desde `propertiesDB`, favoritos en estado local, testimonios y llamada a publicar un inmueble. El formulario de búsqueda actualmente desplaza la vista hacia la sección de propiedades; no aplica filtros.
- **Login:** valida campos en el navegador, asigna el rol de demostración y llama a `login`.
- **Admin:** muestra solicitudes de ejemplo, búsqueda, filtros por estado, paginación, detalle, galería y acciones de aprobar/rechazar. Las modificaciones quedan en el estado de React de esa página.
- **RegistrarPropiedad:** valida los datos del formulario, crea vistas previas locales de archivos y construye un objeto `SolicitudPropiedad`. Su prop `onSubmit` es opcional y no se conecta desde la ruta actual.
- **Propiedades:** implementa filtros, ordenamiento, paginación y favoritos persistidos en `localStorage`. Requiere una lista mediante la prop `propiedades`; la ruta actual no la proporciona.

## 8. Flujo de datos y persistencia

- `Home` lee directamente `propertiesDB` desde `src/data/propiedades.ts`.
- `Propiedades` espera una colección de tipo `Propiedad` por props, pero no consume el archivo de datos directamente.
- `Admin` declara `SOLICITUDES_INICIALES` dentro de su propio archivo y las copia a estado local.
- `RegistrarPropiedad` construye una solicitud y llama a `onSubmit` únicamente si alguien proporciona ese callback.
- `AuthContext` persiste sesión en `localStorage` bajo `orven_user`.
- `Propiedades` persiste favoritos bajo `orven:favoritos`.
- Los favoritos de `Home` y los cambios del panel administrativo solo existen en estado React y se pierden al desmontar o recargar.

No hay sincronización entre el formulario de registro, el conjunto de solicitudes del administrador y las propiedades destacadas.

## 9. Integraciones pendientes detectadas

1. **Propiedades:** el componente declara `interface Props { propiedades: Propiedad[] }`, pero `App.tsx` usa `<Propiedades />` sin pasar esa prop. Además, el archivo importa `./assets/orven-logo.png` y `./assets/propiedades-banner.jpg`; esos archivos no aparecen en el listado actual de `src/pages/Propiedades/`.
2. **Modelos incompatibles:** el tipo `Property` de `src/data/propiedades.ts` tiene `title`, `location` y `price` como texto, entre otros campos; el tipo `Propiedad` de `Propiedades.tsx` requiere `tipo`, `titulo`, `sector`, `ciudad`, `precio` numérico y `operacion`. Hace falta definir un modelo común o un adaptador.
3. **Registro y administración:** la ruta no pasa `onSubmit` al formulario y el panel usa otra lista independiente. El flujo de solicitud → revisión → publicación no está implementado.
4. **Autorización:** la ruta `/admin` no comprueba si `user.role === 'admin'`.
5. **Rutas incompletas:** los enlaces a recuperación de contraseña, contacto, nosotros y detalle de propiedad no tienen rutas declaradas en `App.tsx`.

Estas observaciones describen el estado del código inspeccionado; no se realizaron cambios funcionales al elaborar este documento.

## 10. Estilos

Los estilos globales básicos se encuentran en `src/index.css`. Cada página y componente mantiene su CSS junto a su archivo TSX, por ejemplo `src/pages/Home/Home.css` y `src/component/HomeNavbar/HomeNavbar.css`. `src/App.css` existe, pero está vacío en la revisión actual.
