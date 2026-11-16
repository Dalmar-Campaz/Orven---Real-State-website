# Registro de decisiones técnicas
 
Este documento registra decisiones comunicadas para el proyecto y decisiones que pueden observarse en el código actual. No se atribuyen motivos históricos cuando no están documentados. Las propuestas futuras deben identificarse como tales y no confundirse con funcionalidades implementadas.
 
## D-001 — No utilizar una base de datos real en el proyecto académico
 
- **Estado:** vigente como requisito del proyecto.
- **Contexto:** el profesor indicó evitar una base de datos para mantener manejable el alcance del trabajo.
- **Decisión:** representar los datos de demostración mediante estructuras TypeScript y estado del frontend.
- **Evidencia:** `src/data/propiedades.ts` (datos iniciales) y `src/context/PropiedadesContext.tsx` (estado en memoria).
- **Consecuencias:** menor configuración e infraestructura; no hay sincronización entre usuarios o dispositivos. Hoy los cambios en propiedades y solicitudes no se persisten y se pierden al recargar. La persistencia local, si se implementa (ver D-013), seguirá limitada al navegador.
## D-002 — Utilizar React Context para compartir la sesión
 
- **Estado:** implementada.
- **Contexto:** varias partes de la interfaz necesitan consultar el usuario y cerrar sesión.
- **Decisión observada:** `AuthContext` expone `user`, `login` y `logout` mediante `AuthProvider` y el hook `useAuth`.
- **Evidencia:** `src/context/AuthContext.tsx`.
- **Persistencia asociada:** se guarda el objeto de usuario en `localStorage` bajo la clave `orven_user`.
- **Consecuencias:** la sesión simulada sobrevive a una recarga en el mismo navegador. No constituye autenticación segura.
## D-003 — Usar React Router DOM para la navegación
 
- **Estado:** implementada.
- **Decisión observada:** las rutas activas se declaran con `BrowserRouter`, `Routes`, `Route` y `Navigate` en `src/App.tsx`.
- **Consecuencia:** las vistas se seleccionan según la URL dentro de una SPA. La ruta del catálogo está temporalmente comentada.
## D-004 — Mantener los estilos junto a sus páginas y componentes
 
- **Estado:** convención observada.
- **Decisión observada:** las páginas y componentes mantienen hojas CSS en sus respectivas carpetas; por ejemplo, `Home.tsx` y `Home.css`, o `AvatarProfile.tsx` y `AvatarProfile.css`.
- **Estructura actual:** los componentes reutilizables están en `src/components/`.
- **Consecuencia:** facilita localizar los estilos de cada parte. Como se utilizan hojas CSS normales y no CSS Modules, los selectores no quedan aislados automáticamente.
## D-005 — Utilizar Vite como herramienta de desarrollo y compilación
 
- **Estado:** implementada.
- **Evidencia:** `vite.config.ts` configura el plugin de React; `package.json` declara los scripts `dev`, `build` y `preview`.
- **Consecuencia:** Vite proporciona el servidor de desarrollo y genera el paquete de producción.
## D-006 — Mantener la autenticación como simulación frontend
 
- **Estado:** implementación actual; debe mantenerse documentada como limitación académica.
- **Evidencia:** `Login.tsx` asigna el rol `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos. El contexto guarda correo y rol en `localStorage`.
- **Consecuencias:** no se validan contraseñas contra un servicio; el rol guardado en el navegador puede modificarse. La ruta `/admin` no comprueba el rol actualmente.
- **Nota:** esto no debe utilizarse como mecanismo de seguridad real.
## D-007 — Estabilizar los cimientos antes de integrar el catálogo y las funcionalidades
 
- **Estado:** vigente como orden de trabajo.
- **Contexto:** la página de «Ver todas las propiedades» ya tiene un componente en preparación, pero depende de un modelo de datos y un flujo compartido que todavía no existen.
- **Decisión:** primero corregir la estructura, unificar los modelos y conectar el flujo de propiedades y solicitudes; después habilitar e integrar `/propiedades`; finalmente implementar buscador, detalle y favoritos compartidos.
- **Evidencia:** `docs/correcion de errores/FIXROADMAP 001.md` y la ruta comentada en `src/App.tsx`.
- **Consecuencias:** evita integrar la pantalla sobre estructuras incompatibles y reduce la necesidad de rehacerla. Mientras tanto, el enlace «Ver todas las propiedades» de Home todavía no conduce a una página funcional.
- **Avance verificado en el código (commit `759cf3b`):** el modelo común (D-008), el estado compartido (D-010) y la conexión de Home, formulario y Admin ya están implementados. Siguen pendientes la persistencia (D-013), la protección de `/admin` y la página `/propiedades`, cuyos archivos están vacíos y cuya ruta continúa comentada.
## D-008 — Un modelo común con solicitudes y propiedades publicadas separadas
 
- **Estado:** implementada.
- **Contexto:** antes existían estructuras distintas para el mismo concepto en `data/propiedades.ts`, `Admin.tsx`, el formulario y el componente de catálogo, con nombres y tipos incompatibles (por ejemplo, precio como texto y como número).
- **Decisión observada:** `src/types/propiedad.ts` define `DatosPropiedad` (campos comunes), `Propiedad` (añade `id`, `fecha` y `destacada`) y `SolicitudPropiedad` (añade `id`, `fecha`, `estado`, `solicitante` y `motivoRechazo`). El precio es un número y las imágenes son `string[]`.
- **Fundamento documentado:** la regla 4 del plan de trabajo indica no mezclar una solicitud pendiente con una propiedad ya publicada.
- **Consecuencias:** un cambio en los campos del inmueble se hace en un solo lugar; TypeScript impide tratar una solicitud como propiedad publicada. Aprobar una solicitud implica copiar sus datos a una nueva propiedad.
- **Evidencia:** `src/types/propiedad.ts`, `src/data/propiedades.ts`.
## D-009 — Manejar por ahora solo la operación «Venta»
 
- **Estado:** implementada.
- **Decisión observada:** `type Operacion = "Venta"`, con el comentario «por ahora solo se manejara venta». El formulario ofrece únicamente esa opción y los datos de ejemplo usan solo `"Venta"`.
- **Consecuencias:** el tipo es más simple; agregar `"Arriendo"` exigirá ampliar el tipo y revisar los lugares que lo usen.
- **Evidencia:** `src/types/propiedad.ts`, constante `OPERACIONES` en `RegistrarPropiedad.tsx`.
## D-010 — Compartir propiedades y solicitudes mediante un Context propio, sin librerías de estado
 
- **Estado:** implementada.
- **Decisión observada:** `PropiedadesContext` es independiente de `AuthContext` y expone el hook `usePropiedades`. Inicializa su estado desde los datos de ejemplo y ofrece `crearSolicitud`, `aprobarSolicitud` y `rechazarSolicitud`. No se añadió ninguna dependencia nueva.
- **Fundamento documentado:** el plan de trabajo establece mantener separados sesión y datos inmobiliarios, y no añadir Redux, Zustand, React Query u otra librería de estado para este alcance.
- **Reglas de datos:** solo se aprueba o rechaza una solicitud existente y pendiente, lo que evita duplicar una propiedad al aprobar dos veces.
- **Consecuencias:** Home, Admin y el formulario ven los mismos datos sin pasarse arreglos. El estado vive en memoria y se reinicia al recargar. El proveedor está fuera de `BrowserRouter`, por lo que no debe usar hooks del router.
- **Evidencia:** `src/context/PropiedadesContext.tsx`, `src/App.tsx`.
## D-011 — El formulario guarda texto y convierte al enviar; las imágenes se guardan como data URL
 
- **Estado:** implementada.
- **Decisión observada:** `FormState` almacena cadenas, y la conversión a número ocurre una sola vez al enviar. Las imágenes seleccionadas se previsualizan con URLs temporales (`blob:`), pero lo que se guarda en la solicitud son data URL generadas con `archivoADataUrl`.
- **Fundamento documentado:** comentarios en el código: un `<input>` siempre entrega texto, y las URLs temporales no sirven para guardar.
- **Consecuencias:** las imágenes guardadas no dependen de las URLs temporales ni de que el formulario siga montado. Una data URL ocupa más espacio que el archivo original, lo que condiciona la persistencia futura (D-013). `"8+"` habitaciones o baños se guarda como `8`.
- **Evidencia:** `RegistrarPropiedad.tsx`, `src/utils/archivos.ts`.
## D-012 — Tomar los datos del solicitante desde el formulario
 
- **Estado:** implementada.
- **Decisión observada:** el formulario pide nombre, teléfono y correo de contacto; el correo se prellena con el de la sesión si existe. `/formulario` no exige sesión.
- **Consecuencias:** se puede enviar una solicitud sin iniciar sesión. La expresión regular de correo está duplicada en el formulario y en `Login.tsx`.
- **Evidencia:** `RegistrarPropiedad.tsx`, `SolicitudPropiedad["solicitante"]` en `src/types/propiedad.ts`.
## D-013 — Persistencia local de propiedades y solicitudes
 
- **Estado:** propuesta, no implementada.
- **Contexto:** los cambios del contexto se pierden al recargar; el plan de trabajo tiene pendiente confirmar con el profesor si `localStorage` está permitido y definir qué datos persistir y cómo guardar las imágenes.
- **Alternativas consideradas en el plan:** guardar propiedades y solicitudes en `localStorage` con lectura segura de JSON inválido y manejo de errores de almacenamiento; decidir la estrategia de imágenes (por ejemplo, limitar, reducir o no persistirlas) por el límite de espacio del navegador.
- **Decisión:** pendiente.
- **Consecuencias previstas:** `localStorage` solo conservaría datos en ese navegador y no sincronizaría usuarios ni dispositivos.
---
 
## Plantilla para nuevas decisiones
 
Añadir una sección por decisión relevante:
 
```md
## D-XXX — Título breve
 
- **Estado:** propuesta | aceptada | reemplazada.
- **Contexto:** qué necesidad o problema motivó la decisión.
- **Alternativas consideradas:** opciones evaluadas.
- **Decisión:** qué se eligió.
- **Consecuencias:** ventajas, límites y compromisos.
- **Evidencia:** archivos o cambios relacionados.
```
 
Registrar decisiones que afecten la arquitectura, los datos, las dependencias, la seguridad o el flujo principal. No es necesario documentar cada cambio pequeño de CSS.
 