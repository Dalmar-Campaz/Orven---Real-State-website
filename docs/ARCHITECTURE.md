# Arquitectura de Orven

## 1. Visión general

Orven es una aplicación frontend de una sola página (SPA) construida con React, TypeScript y Vite. React Router DOM gestiona la navegación y dos Contexts comparten el estado:

- `AuthContext`: sesión y rol de demostración.
- `PropiedadesContext`: propiedades publicadas y solicitudes de publicación.

No hay backend ni base de datos. La persistencia utiliza almacenamiento del navegador para que el prototipo conserve cambios después de una recarga.

## 2. Arranque de la aplicación

Flujo de entrada:

1. Vite carga `index.html`, con idioma español y título «Orven».
2. `src/main.tsx` importa `index.css`, crea la raíz de React y renderiza `App` dentro de `React.StrictMode`.
3. `src/App.tsx` monta `AuthProvider` → `PropiedadesProvider` → `BrowserRouter` → `AppRoutes`.
4. `AppRoutes` consulta la sesión con `useAuth` y declara las rutas.
5. `ProtectedRoute` comprueba la sesión y el rol antes de mostrar el panel administrativo.

Los proveedores están fuera de `BrowserRouter`; ninguno utiliza hooks del router.

## 3. Estructura actual

| Ruta | Responsabilidad |
|---|---|
| `src/assets/` | Logos e iconos compartidos. |
| `src/components/AvatarProfile/` | Menú de cuenta y cierre de sesión. |
| `src/components/HomeNavbar/` | Navegación de Home. |
| `src/components/TarjetaPropiedad/` | Tarjeta reutilizada en Home y el catálogo; incluye el control de favoritos. |
| `src/context/AuthContext.tsx` | Sesión y rol de demostración. |
| `src/context/PropiedadesContext.tsx` | Estado compartido, persistencia y operaciones de propiedades/solicitudes. |
| `src/data/propiedades.ts` | Datos iniciales de ejemplo. |
| `src/types/propiedad.ts` | Tipos del dominio. |
| `src/utils/archivos.ts` | Conversión de archivos a data URL. |
| `src/utils/formato.ts` | Formato de precio y ubicación. |
| `src/routes/ProtectedRoute.tsx` | Restricción frontend por sesión y rol. |
| `src/pages/` | Home, Login, Admin, formulario y catálogo público de propiedades. |
| `src/App.tsx` | Proveedores y rutas. |
| `src/main.tsx` | Punto de entrada de React. |

## 4. Rutas

| Ruta | Componente | Comportamiento |
|---|---|---|
| `/` | `Home` | Página principal; muestra propiedades destacadas. |
| `/login` | `Login` | Formulario de acceso simulado. Si hay sesión, redirige según el rol. |
| `/admin` | `ProtectedRoute` → `Admin` | Solo permite entrar al rol `admin`. |
| `/formulario` | `RegistrarPropiedad` | Formulario de solicitud; no exige sesión. |
| `/propiedades` | `Propiedades` | Catálogo público conectado a `PropiedadesContext`; muestra los inmuebles publicados. |
| Cualquier otra ruta | — | Redirige a Home. |

Un usuario sin sesión que visite `/admin` es enviado a `/login`. Un usuario `customer` es enviado a Home.

## 5. Sesión y roles

`AuthContext` expone `user`, `login(email, role, remember)` y `logout()`.

- Con «Recordar mi sesión» marcado, la sesión se guarda en `localStorage` bajo `orven_user`.
- Sin marcarlo, se guarda en `sessionStorage` bajo `orven_user_session`; desaparece al cerrar esa pestaña.
- La lectura valida la estructura del JSON y tolera valores corruptos o almacenamiento no disponible.
- La contraseña nunca se guarda.
- Los cambios de `orven_user` en otra pestaña actualizan la sesión mediante el evento `storage`.

El login asigna el rol `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos. No hay comprobación de contraseñas ni servidor de identidad.

**Seguridad:** el rol está en el navegador y puede modificarse. `ProtectedRoute` mejora la navegación del prototipo, pero no proporciona seguridad real ni reemplaza autorización en un backend.

## 6. PropiedadesContext

`src/context/PropiedadesContext.tsx` mantiene la única fuente de verdad para el catálogo y las solicitudes. El hook `usePropiedades` expone:

| Valor o función | Responsabilidad |
|---|---|
| `propiedades` | Inmuebles publicados (`Propiedad[]`). |
| `solicitudes` | Solicitudes (`SolicitudPropiedad[]`). |
| `favoritos` | Identificadores de propiedades favoritas (`number[]`). |
| `alternarFavorito(id)` | Agrega o quita un identificador y persiste el arreglo de favoritos. |
| `crearSolicitud(datos, solicitante)` | Crea una solicitud pendiente, asigna fecha e id. |
| `aprobarSolicitud(id)` | Convierte una solicitud pendiente en propiedad y actualiza su estado. |
| `rechazarSolicitud(id, motivo?)` | Marca la solicitud como rechazada y conserva el motivo opcional. |

Solo se procesan solicitudes existentes y pendientes. La aprobación y el cambio de estado se guardan juntos para evitar que el catálogo y la solicitud queden desincronizados.

## 7. Persistencia y sincronización

`PropiedadesContext` conserva un único objeto JSON versionado bajo la clave `orven_propiedades`:

```text
{
  version: 1,
  propiedades: Propiedad[],
  solicitudes: SolicitudPropiedad[]
}
```

- La primera carga intenta leer y validar esa estructura. Si no existe o está corrupta, utiliza los datos de ejemplo.
- Cada cambio se escribe en `localStorage` antes de actualizar el estado React.
- Si el navegador rechaza el guardado, la operación lanza un error y no se confirma como exitosa.
- El evento `storage` actualiza otras pestañas del mismo navegador/origen para `orven_propiedades` y `orven_favoritos`. No se dispara en la pestaña que realizó el cambio; esa pestaña actualiza React directamente.
- Los favoritos se guardan por separado bajo `orven_favoritos` como un arreglo JSON de IDs numéricos; no forman parte del objeto versionado `orven_propiedades`.
- La sincronización no cruza navegadores, perfiles ni dispositivos. Los favoritos son globales para el origen del navegador y no están asociados al usuario simulado.

Las imágenes seleccionadas por el formulario se convierten a data URL. Las URL temporales `blob:` se utilizan solo para previsualizar y no se guardan. Las data URLs pueden consumir la cuota de `localStorage`; el formulario y el contexto muestran un error si no se puede guardar.

## 8. Páginas y responsabilidades

- **Home:** consulta el catálogo mediante `usePropiedades` y filtra los inmuebles con `destacada === true`. El formulario de búsqueda no aplica filtros; al enviarlo desplaza la página hasta la sección de destacadas. Los favoritos se comparten mediante `PropiedadesContext` y persisten en `localStorage`. Los botones de detalle están deshabilitados hasta la Fase 3.
- **Login:** valida el formato de correo y la longitud mínima de contraseña; no comprueba credenciales contra un servidor. El checkbox controla el tipo de persistencia de sesión.
- **Admin:** lee solicitudes del contexto, calcula contadores, filtra, pagina y permite ver detalles. Muestra motivos de rechazo; las acciones solo aparecen en solicitudes pendientes. La gestión de catálogo del menú está deshabilitada mientras no exista esa sección.
- **RegistrarPropiedad:** valida el formulario, previsualiza archivos y convierte imágenes a data URL. Llama a `crearSolicitud`; muestra éxito solo si el contexto consigue persistirla.
- **Propiedades:** reproduce la página de catálogo del diseño aprobado. Lee `propiedades` desde `usePropiedades` y muestra el conteo real. Las tarjetas presentan la primera imagen, el precio formateado, la ubicación corta (sector y ciudad cuando hay sector) y las habitaciones, baños y área. El botón de favoritos funciona y usa el mismo estado persistente que Home. Los controles de búsqueda, filtros, orden, vista de mapa, paginación y detalle permanecen deshabilitados y se reservan para la Fase 3.

## 9. Estilos

Los CSS están junto a sus páginas/componentes y son hojas globales normales, no CSS Modules. Los selectores pueden afectar a otras partes de la SPA. `index.css` se importa desde `main.tsx`.

## 10. Trabajo pendiente

1. Verificar manualmente la persistencia, el flujo formulario → Admin, la aprobación/rechazo y la sincronización entre pestañas.
2. Ejecutar nuevamente build y lint en la rama actual.
3. Implementar búsqueda, filtros, ordenamiento, vista de mapa, paginación y detalle individual del catálogo.
4. Decidir si los favoritos deben asociarse al usuario simulado y si se necesita una sección dedicada; hoy el botón de las tarjetas ya funciona y el arreglo se comparte globalmente en el navegador.
5. Revisar los enlaces y estados de UI durante las pruebas de cierre.
