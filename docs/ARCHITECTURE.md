# Arquitectura de Orven
 
## 1. Visión general
 
Orven es una aplicación frontend de una sola página (SPA) construida con React, TypeScript y Vite. React Router DOM gestiona la navegación y dos Contexts de React comparten estado: `AuthContext` (sesión de demostración) y `PropiedadesContext` (propiedades publicadas y solicitudes de publicación).
 
No hay backend ni base de datos. El estado de propiedades y solicitudes vive en memoria y se reinicia al recargar la página; solo la sesión se guarda en `localStorage`.
 
## 2. Arranque de la aplicación
 
Flujo de entrada:
 
1. Vite carga `index.html` (`lang="es"`, título «Orven»), que contiene el elemento `#root` y carga `/src/main.tsx`.
2. `src/main.tsx` importa `index.css`, crea la raíz con `ReactDOM.createRoot` y renderiza `App` dentro de `React.StrictMode`.
3. `src/App.tsx` importa `App.css` (vacío) y monta, de afuera hacia adentro: `AuthProvider` → `PropiedadesProvider` → `BrowserRouter` → `AppRoutes`.
4. `AppRoutes` consulta el usuario con `useAuth` y declara las rutas activas.
Ambos proveedores están por fuera de `BrowserRouter`. Funciona porque ninguno usa hooks del router. Si alguno llegara a utilizar `useNavigate`, `useLocation` u otro hook del router, habría que colocar `BrowserRouter` por encima de ese proveedor.
 
## 3. Estructura actual
 
| Ruta | Responsabilidad y estado |
|---|---|
| `src/assets/` | Logos e iconos compartidos. |
| `src/components/AvatarProfile/` | Menú de cuenta, sesión y cierre de sesión. |
| `src/components/HomeNavbar/` | Barra de navegación de Home. |
| `src/context/AuthContext.tsx` | Estado y persistencia de la sesión simulada. |
| `src/context/PropiedadesContext.tsx` | Estado compartido de propiedades publicadas y solicitudes, con las operaciones para crear, aprobar y rechazar. |
| `src/data/propiedades.ts` | Datos iniciales: `propiedadesIniciales` y `solicitudesPropiedad`. |
| `src/types/propiedad.ts` | Modelo común: `DatosPropiedad`, `Propiedad` y `SolicitudPropiedad`. |
| `src/utils/archivos.ts` | `archivoADataUrl`: convierte un `File` en data URL. |
| `src/utils/formato.ts` | `formatoPrecio` y `ubicacionCorta`. |
| `src/pages/` | Pantallas Home, Login, Admin y RegistrarPropiedad, y la carpeta Propiedades (archivos vacíos). |
| `src/routes/ProtectedRoute.tsx` | Archivo existente, actualmente vacío; no protege rutas. |
| `src/main.tsx` | Punto de entrada de React. |
| `src/App.tsx` | Composición de proveedores y definición de rutas. |
 
La carpeta de componentes se llama actualmente `components` (plural).
 
## 4. Rutas activas
 
Las rutas se encuentran en `src/App.tsx`.
 
| Ruta | Componente | Comportamiento actual |
|---|---|---|
| `/` | `Home` | Página principal. |
| `/login` | `Login` | Muestra el formulario si no hay usuario. Si ya existe sesión, redirige a `/admin` para rol `admin` y a `/` para los demás roles. |
| `/admin` | `Admin` | Panel administrativo; no comprueba sesión ni rol antes de renderizar. |
| `/formulario` | `RegistrarPropiedad` | Formulario de solicitud; crea la solicitud mediante `PropiedadesContext`. No exige sesión. |
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
 
## 6. PropiedadesContext
 
`src/context/PropiedadesContext.tsx` es la única fuente de verdad de los inmuebles. Inicializa su estado con los arreglos de `src/data/propiedades.ts` y expone mediante el hook `usePropiedades` (que lanza un error fuera de su proveedor):
 
| Valor o función | Qué hace |
|---|---|
| `propiedades` | Inmuebles publicados (`Propiedad[]`). |
| `solicitudes` | Solicitudes de publicación (`SolicitudPropiedad[]`). |
| `crearSolicitud(datos, solicitante)` | Agrega al inicio de la lista una solicitud con estado `Pendiente`, fecha de hoy e id siguiente. |
| `aprobarSolicitud(id)` | Si la solicitud existe y está `Pendiente`, agrega una propiedad al catálogo (nuevo id y fecha de hoy) y marca la solicitud como `Aprobada`. En cualquier otro caso no hace nada. |
| `rechazarSolicitud(id, motivo?)` | Si la solicitud existe y está `Pendiente`, la marca como `Rechazada` y guarda el motivo. En cualquier otro caso no hace nada. |
 
Los ids se generan con el máximo existente más uno, de forma independiente para propiedades y solicitudes. Los cambios solo viven en el estado React: no se guardan en `localStorage`.
 
## 7. Componentes reutilizables
 
- `AvatarProfile`: consulta la sesión; ofrece iniciar sesión cuando no hay usuario y, cuando sí lo hay, muestra el correo, permite cerrar sesión y muestra un acceso al panel si el rol es `admin`. Lo usan Home (mediante `HomeNavbar`) y el formulario de registro.
- `HomeNavbar`: barra superior de Home; incluye el logo, enlaces de sección y `AvatarProfile`.
Las páginas contienen componentes auxiliares internos, como selectores e iconos SVG.
 
## 8. Páginas y responsabilidades
 
- **Home:** muestra el hero, un formulario de búsqueda visual, las propiedades de `usePropiedades().propiedades` (todas, sin filtrar por `destacada`), favoritos en estado local, testimonios y una llamada a publicar. El buscador solo desplaza la vista a la sección de propiedades; no aplica filtros. «Ver todas» apunta a `/propiedades`, que no está activa, y «Ver detalles» es un enlace sin destino.
- **Login:** valida campos en el navegador, asigna un rol de demostración y llama a `login`.
- **Admin:** lee `solicitudes` del contexto y ofrece búsqueda, filtro por estado, paginación, detalle con galería y las acciones de aprobar y rechazar (con motivo opcional). Del menú lateral solo «Cerrar sesión» tiene acción. El motivo de rechazo se guarda, pero el detalle no lo muestra.
- **RegistrarPropiedad:** mantiene el formulario como texto, valida, crea vistas previas locales de imágenes y, al enviar, convierte las imágenes a data URL, construye un `DatosPropiedad` y llama a `crearSolicitud` con los datos de contacto. El correo se prellena con el de la sesión. Muestra el mensaje de éxito solo después de crear la solicitud, y un error si falla la lectura de las imágenes.
- **Propiedades:** `Propiedades.tsx` y `Propiedades.css` existen pero están vacíos; la ruta está comentada.
## 9. Flujo de datos y persistencia
 
```text
RegistrarPropiedad ──crearSolicitud──▶ solicitudes (Pendiente) ──▶ Admin
                                                                    │
                                          aprobarSolicitud / rechazarSolicitud
                                                                    ▼
Home ◀── propiedades (catálogo) ◀──── solicitud Aprobada (se copia como propiedad)
```
 
- `Home`, `Admin` y `RegistrarPropiedad` obtienen sus datos mediante `usePropiedades`; ninguna importa directamente los arreglos de `src/data/propiedades.ts`.
- Una propiedad aprobada en Admin aparece en Home sin recargar, siempre que la navegación se haga dentro de la aplicación.
- Al recargar la página (o escribir una URL a mano), el estado vuelve a los datos iniciales.
- `AuthContext` persiste la sesión en `localStorage` bajo `orven_user`. No hay otra clave en uso.
- Los favoritos de `Home` solo existen en estado React y se pierden al desmontar o recargar.
## 10. Estilos
 
Los archivos CSS se encuentran junto a sus páginas o componentes y se importan directamente desde los TSX. Son hojas CSS normales, no CSS Modules; sus selectores pueden afectar globalmente al documento.
 
- `src/index.css` se importa desde `main.tsx`.
- `src/App.css` se importa desde `App.tsx`, pero está vacío.
- `src/pages/Propiedades/Propiedades.css` está vacío.
- `Home.css` vuelve a declarar reglas de `html`, `body` y `#root`, que ya existen en `index.css`.
- `Home.css` y `HomeNavbar.css` declaran ambas la clase `.navbar`.
- `AvatarProfile.css` declara variables de color en `:root`, por lo que quedan disponibles en toda la aplicación.
- Las demás páginas y componentes importan sus hojas CSS locales. Formulario, Admin y Login usan prefijos propios (`rp-`, `admin-`, `login-`) para sus clases principales.
## 11. Integraciones pendientes
 
1. Decidir e implementar la persistencia local (propiedades, solicitudes y, más adelante, favoritos), incluida la estrategia para las imágenes.
2. Implementar la protección de `/admin` para el rol administrativo.
3. Mostrar el motivo de rechazo en el detalle de Admin, corregir el contador de la galería y resolver los botones del menú sin acción.
4. Calcular las propiedades destacadas a partir del catálogo compartido.
5. Implementar `Propiedades.tsx` y habilitar `/propiedades` conectada a `usePropiedades`.
6. Resolver los destinos de navegación que aún no tienen rutas.
7. Revisar el manejo de datos corruptos en `AuthContext`, los `console.log` de depuración y los estilos globales repetidos.
Esta documentación describe el código inspeccionado en el commit `759cf3b`; no se realizaron cambios funcionales al elaborarla.
 