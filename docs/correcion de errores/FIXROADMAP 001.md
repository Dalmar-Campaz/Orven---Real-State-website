# Plan de trabajo — Orven

> **Objetivo:** estabilizar y organizar el proyecto antes de integrar la página de «Ver todas las propiedades» y desarrollar las funcionalidades adicionales.
>
> **Alcance actual:** prototipo académico construido con React, TypeScript y Vite. No se incorporará una base de datos real ni dependencias nuevas sin una necesidad justificada y compatible con las indicaciones del profesor.

---

## Orden general

- [ ] **Fase 0 — Preparar el proyecto y establecer un punto seguro.**
- [ ] **Fase 1 — Corregir los cimientos de la aplicación.**
- [ ] **Fase 2 — Integrar la página diseñada de «Ver todas las propiedades».**
- [ ] **Fase 3 — Implementar las funcionalidades de usuario.**
- [ ] **Fase 4 — Verificar, documentar y preparar la entrega.**

---

# Fase 0 — Preparación y punto seguro

**Objetivo:** conocer el estado real del repositorio antes de tocar archivos y poder revertir cambios si algo sale mal.

- [x] Confirmar que se está trabajando en el repositorio correcto y en la rama esperada (`main` o una rama de trabajo).
- [x] Revisar `git status` y guardar o resolver cualquier cambio local pendiente antes de empezar.
- [x] Crear un commit de respaldo con el estado actual, o una rama de trabajo desde la que hacer las correcciones.
- [x] Instalar las dependencias desde el archivo de bloqueo con `npm ci`.
- [x] Ejecutar `npm run build` y guardar los errores iniciales.
- [x] Ejecutar `npm run lint` y guardar los avisos o errores iniciales.
- [x] Distinguir los errores que ya existían de los que aparezcan después de cada modificación.

**Criterio para completar la fase:** existe un punto de retorno en Git y se conoce el estado inicial de compilación y lint.

---

# Fase 1 — Corregir los cimientos

**Objetivo:** dejar una aplicación coherente, compilable y con una fuente compartida de información. En esta fase no se implementarán todavía el buscador avanzado, el detalle de cada inmueble ni la página de favoritos.

## 1.1 Estabilizar el proyecto y los archivos de entrada

- [ ] Revisar `package.json` y confirmar qué scripts están disponibles (`dev`, `build`, `lint` y `preview`).
- [ ] Corregir los errores de compilación existentes sin ocultarlos con `any`, desactivando TypeScript ni quitando comprobaciones.
- [ ] Revisar todos los imports de imágenes, CSS y componentes para confirmar que las rutas y los archivos existen.
- [ ] Revisar el estado de `src/pages/Propiedades/`: identificar qué partes son un intento incompleto de integración y cuáles pertenecen al diseño final que se integrará en la Fase 2.
- [ ] Evitar rehacer ahora la página de «Ver todas las propiedades». Si su componente incompleto impide compilar, dejar temporalmente una pantalla mínima o aislar el código incompleto de forma que el resto del proyecto pueda ejecutarse. No descartar ni sobrescribir el diseño ya realizado.
- [ ] Confirmar que `src/index.css` se importa desde el punto de entrada adecuado, o eliminarlo solo si se comprueba que no se necesita.
- [ ] Revisar `index.html`: establecer el idioma español (`lang="es"`) y un título correcto para Orven.
- [ ] Comprobar que no haya estilos globales duplicados o reglas de `body`, `#root` y `:root` repartidas sin una responsabilidad clara.

**Criterio para completar:** la aplicación puede arrancar y compilar; los imports existentes están resueltos; la página aún no integrada no bloquea el trabajo del resto del proyecto.

## 1.2 Definir un modelo de datos común

- [ ] Crear `src/types/propiedad.ts` (o una ubicación equivalente acordada) para declarar los tipos del dominio.
- [ ] Definir un tipo **Propiedad** para los inmuebles que ya están publicados y pueden aparecer en el catálogo.
- [ ] Definir un tipo **SolicitudPropiedad** separado para las publicaciones enviadas por usuarios y pendientes de revisión.
- [ ] Definir los estados permitidos de una solicitud: pendiente, aprobada y rechazada.
- [ ] Acordar el tipo de identificador y evitar generar identificadores duplicados.
- [ ] Unificar nombres y tipos de campos: por ejemplo, `precio` debe tener un tipo consistente (preferiblemente número) y las imágenes deben tener una representación definida.
- [ ] Revisar cómo se relacionan `Property` de `data/propiedades.ts`, `Solicitud` de `Admin.tsx`, `SolicitudPropiedad` del formulario y `Propiedad` de la página de catálogo.
- [ ] Adaptar los datos iniciales al modelo común y eliminar tipos duplicados solo cuando ya no tengan consumidores.
- [ ] Cambiar los arreglos de datos iniciales que no necesitan reasignación de `let` a `const`.
- [ ] Decidir qué ocurre con las imágenes seleccionadas por el usuario. No guardar directamente objetos `File` ni URL temporales de `URL.createObjectURL()` en JSON esperando que sobrevivan a una recarga.
- [ ] Documentar los campos, estados y decisiones del modelo en `docs/DATA_MODEL.md`.

**Criterio para completar:** existe un modelo coherente para propiedades y otro para solicitudes; las páginas no mantienen interfaces incompatibles para representar el mismo concepto.

## 1.3 Crear el estado compartido de propiedades

- [ ] Crear `src/context/PropiedadesContext.tsx`.
- [ ] Inicializar el catálogo desde los datos de ejemplo de `src/data/propiedades.ts`.
- [ ] Mantener en el contexto una colección de propiedades publicadas y otra de solicitudes.
- [ ] Exponer un hook (por ejemplo, `usePropiedades`) para que las páginas consulten el contexto sin importar directamente los arreglos iniciales.
- [ ] Implementar una función para crear una solicitud.
- [ ] Implementar una función para aprobar una solicitud y convertirla en una propiedad publicada sin duplicarla.
- [ ] Implementar una función para rechazar una solicitud y conservar, cuando corresponda, el motivo del rechazo.
- [ ] Definir qué pasa si se intenta aprobar dos veces la misma solicitud o modificar una solicitud inexistente.
- [ ] Envolver la aplicación con `PropiedadesProvider` desde el nivel adecuado de `App.tsx`.
- [ ] Mantener `AuthContext` separado: uno gestiona la sesión y el otro los datos inmobiliarios.
- [ ] No añadir Redux, Zustand, React Query ni otra librería de estado para este alcance.

**Criterio para completar:** dos componentes diferentes pueden leer la misma colección desde el contexto y ven las actualizaciones hechas por otro componente sin pasarse arreglos manualmente.

## 1.4 Decidir e implementar la persistencia local

- [ ] Confirmar que el uso de `localStorage` es compatible con las indicaciones del profesor.
- [ ] Decidir qué datos deben sobrevivir a una recarga: propiedades publicadas, solicitudes, sesión y, más adelante, favoritos.
- [ ] Implementar la lectura inicial desde `localStorage` con manejo seguro de JSON inválido.
- [ ] Implementar el guardado de los cambios relevantes del contexto.
- [ ] Manejar errores cuando el almacenamiento del navegador no esté disponible o esté lleno.
- [ ] Evitar guardar contraseñas o asumir que los datos de `localStorage` son seguros o confiables.
- [ ] Documentar explícitamente que `localStorage` solo conserva datos en ese navegador y no sincroniza información entre usuarios o dispositivos.
- [ ] Definir la estrategia de persistencia de imágenes antes de permitir que el formulario dependa de ellas tras una recarga.

**Criterio para completar:** los datos que se decidió persistir se conservan tras recargar el mismo navegador y los errores de almacenamiento no dejan la aplicación inutilizable.

## 1.5 Conectar el formulario de registro

- [ ] Hacer que `RegistrarPropiedad` utilice `usePropiedades`.
- [ ] Al enviar un formulario válido, llamar a la función del contexto que crea una solicitud.
- [ ] Mostrar el mensaje de éxito únicamente después de que la operación de registro se haya completado correctamente.
- [ ] Mostrar un error si la operación falla.
- [ ] No mostrar «Solicitud enviada» si los datos no se han guardado en el mecanismo acordado.
- [ ] Confirmar que la nueva solicitud aparece en el panel administrativo sin escribirla manualmente en `Admin.tsx`.

**Criterio para completar:** una solicitud creada desde el formulario queda registrada en el estado compartido y puede consultarse desde el administrador.

## 1.6 Conectar el panel administrativo

- [ ] Eliminar el arreglo independiente `SOLICITUDES_INICIALES` de `Admin.tsx` cuando el contexto ya proporcione esos datos.
- [ ] Hacer que la tabla, filtros, contadores y detalle lean las solicitudes del contexto.
- [ ] Conectar las acciones de aprobar y rechazar con las funciones del contexto.
- [ ] Conservar el motivo de rechazo y mostrarlo en el detalle cuando corresponda.
- [ ] Confirmar que una solicitud aprobada deja de estar pendiente y pasa al catálogo de propiedades.
- [ ] Confirmar que una solicitud rechazada no aparece como propiedad publicada.
- [ ] Revisar el cálculo de miniaturas y fotos restantes de la galería.
- [ ] No dejar botones aparentes en el panel sin una acción definida; si una sección aún no existe, indicarlo o deshabilitarla claramente.

**Criterio para completar:** el panel administra las mismas solicitudes que crea el formulario y las decisiones se reflejan en el catálogo.

## 1.7 Conectar Home y preparar la ruta de catálogo

- [ ] Hacer que `Home` obtenga las propiedades publicadas desde `usePropiedades`.
- [ ] Calcular las propiedades destacadas a partir del catálogo compartido.
- [ ] Evitar importar `propertiesDB` directamente desde cada página.
- [ ] Mantener la ruta de «Ver todas las propiedades» preparada, pero sin implementar todavía el diseño completo reservado para la Fase 2.
- [ ] Revisar las rutas que apuntan a páginas todavía inexistentes y definir cuáles deben crearse después y cuáles deben retirarse temporalmente.

**Criterio para completar:** Home refleja los datos del catálogo compartido y no mantiene una copia independiente.

## 1.8 Proteger las rutas y revisar la sesión

- [ ] Crear `ProtectedRoute.tsx` (o un componente equivalente) para restringir las páginas que requieren sesión o rol.
- [ ] Proteger `/admin` para que solo el rol `admin` pueda acceder.
- [ ] Decidir qué debe ocurrir si un usuario no autenticado intenta entrar a `/admin` (por ejemplo, redirigir a `/login`).
- [ ] Decidir qué debe ocurrir si un usuario `customer` intenta entrar a `/admin` (por ejemplo, redirigir a Home o mostrar acceso denegado).
- [ ] Revisar el `JSON.parse` de `AuthContext` y manejar datos corruptos o inesperados en `localStorage`.
- [ ] Verificar que el botón «Cerrar sesión» borre la sesión y actualice la navegación.
- [ ] Aclarar el comportamiento del checkbox «Recordar mi sesión»: implementarlo de verdad o quitarlo. Actualmente la sesión se guarda siempre en `localStorage`.
- [ ] Documentar que esta autenticación es una simulación frontend y que no constituye seguridad real sin un backend.

**Criterio para completar:** los roles se comprueban al entrar a rutas protegidas y el contexto tolera una sesión local inválida sin impedir el arranque.

## 1.9 Pruebas de cierre de la Fase 1

- [ ] Ejecutar `npm run build` y corregir todos los errores.
- [ ] Ejecutar `npm run lint` y revisar los avisos relevantes.
- [ ] Abrir Home y comprobar que carga el catálogo inicial.
- [ ] Registrar una solicitud de prueba y comprobar que aparece en Admin.
- [ ] Aprobar una solicitud y comprobar que aparece en el catálogo.
- [ ] Rechazar una solicitud y comprobar que conserva el motivo.
- [ ] Recargar el navegador y comprobar la persistencia acordada.
- [ ] Probar `/admin` sin sesión, con rol `customer` y con rol `admin`.
- [ ] Actualizar `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md` y `docs/DECISIONS.md` para que describan el comportamiento real.

**Criterio para completar la Fase 1:** el flujo básico de datos es coherente, las rutas protegidas funcionan según lo acordado y build/lint no presentan errores pendientes conocidos.

---

# Fase 2 — Integrar la página diseñada de «Ver todas las propiedades»

**Objetivo:** incorporar a React el diseño que ya está preparado, conectándolo al modelo y al contexto establecidos en la Fase 1. Esta fase integra la página; las funcionalidades avanzadas se implementan en la Fase 3.

- [ ] Localizar y revisar el diseño final (archivo, maqueta o referencia) antes de escribir el componente.
- [ ] Comparar el diseño con el código que actualmente existe en `src/pages/Propiedades/` y decidir qué se puede reutilizar.
- [ ] Confirmar y organizar los assets que necesita el diseño; corregir las rutas de importación.
- [ ] Implementar `Propiedades.tsx` y su CSS a partir del diseño aprobado.
- [ ] Conectar la página a `usePropiedades` para leer la lista real del catálogo compartido.
- [ ] Mostrar los datos básicos de cada propiedad desde el modelo común, sin crear un arreglo paralelo dentro de la página.
- [ ] Conectar la navegación desde Home hacia «Ver todas las propiedades».
- [ ] Confirmar que la ruta `/propiedades` carga directamente y también al actualizar el navegador.
- [ ] Comprobar que el diseño se adapta a pantallas pequeñas y grandes.
- [ ] Mantener los controles que todavía no tengan lógica como elementos claramente pendientes, no como controles que aparenten funcionar.
- [ ] Revisar accesibilidad básica: botones reales para acciones, enlaces con destino, etiquetas para controles y textos alternativos útiles.
- [ ] Ejecutar `npm run build` y `npm run lint` después de integrar la página.
- [ ] Actualizar la arquitectura y el README si cambian rutas, componentes o capacidades.

**Criterio para completar la fase:** la página reproduce el diseño elegido, usa los datos compartidos y muestra las propiedades del catálogo sin mantener información duplicada.

---

# Fase 3 — Implementar funcionalidades de usuario

**Objetivo:** convertir los elementos visuales de la aplicación en interacciones funcionales. Implementar una funcionalidad por vez y probarla antes de continuar.

## 3.1 Buscador de Home

- [ ] Definir qué criterios podrá utilizar el usuario: ubicación, tipo de inmueble, operación y rango de precio, según el diseño.
- [ ] Controlar los campos del formulario con estado de React.
- [ ] Aplicar los criterios al catálogo compartido, no a un arreglo escrito dentro de Home.
- [ ] Decidir cómo se transfieren los criterios a la página de resultados (por ejemplo, parámetros de URL).
- [ ] Mostrar un estado vacío claro cuando no existan coincidencias.
- [ ] Añadir una opción para limpiar los criterios.
- [ ] Probar búsquedas con coincidencias, sin coincidencias y con campos vacíos.

## 3.2 Filtros, orden y paginación de la página de propiedades

- [ ] Implementar los filtros definidos por el diseño.
- [ ] Implementar ordenamiento por los criterios que se acuerden (por ejemplo, precio o fecha).
- [ ] Implementar paginación o carga progresiva si el número de registros lo justifica.
- [ ] Restablecer la página actual cuando cambien los filtros.
- [ ] Comprobar que los filtros recibidos desde Home se apliquen correctamente.

## 3.3 Detalle de cada propiedad

- [ ] Crear la ruta dinámica `/propiedades/:id`.
- [ ] Crear la página de detalle y obtener el inmueble por su identificador desde el contexto.
- [ ] Mostrar descripción, precio, ubicación, características e imágenes disponibles.
- [ ] Crear un estado de «propiedad no encontrada» cuando el ID no exista.
- [ ] Conectar los botones «Ver detalles» de las tarjetas a la ruta correspondiente.
- [ ] Probar navegación directa a un detalle y regreso al catálogo.

## 3.4 Favoritos y página de guardados

- [ ] Definir una única fuente de estado para los favoritos.
- [ ] Hacer que Home, el catálogo y el detalle utilicen el mismo mecanismo para agregar o quitar favoritos.
- [ ] Persistir los identificadores favoritos en `localStorage` si se mantiene esa decisión.
- [ ] Crear una página o apartado «Favoritos» / «Guardados».
- [ ] Mostrar allí las propiedades guardadas a partir del catálogo compartido.
- [ ] Mostrar un estado vacío cuando el usuario todavía no tenga favoritos.
- [ ] Comprobar que agregar o quitar un favorito se refleje en todas las páginas.
- [ ] Decidir si los favoritos son generales del navegador o asociados al usuario simulado y documentar esa limitación.

## 3.5 Navegación y experiencia de uso

- [ ] Revisar todos los enlaces y botones de la aplicación.
- [ ] Crear las páginas de contacto, nosotros o recuperación solo si forman parte del alcance; en caso contrario, quitar o reemplazar los enlaces que las anuncian.
- [ ] Definir qué ocurre con rutas desconocidas mediante una página 404 o una redirección intencional.
- [ ] Unificar el acceso a la cuenta y la navegación entre páginas cuando sea útil.
- [ ] Añadir estados visibles de carga, éxito, error y ausencia de resultados cuando correspondan.
- [ ] Revisar la navegación por teclado, etiquetas, roles ARIA y contraste básico.
- [ ] Comprobar el diseño responsive en las páginas integradas.

**Criterio para completar la Fase 3:** las funcionalidades acordadas se pueden utilizar de principio a fin y no son únicamente elementos visuales.

---

# Fase 4 — Verificación y preparación de entrega

- [ ] Ejecutar `npm ci` en un entorno limpio para comprobar que las dependencias se instalan desde el lockfile.
- [ ] Ejecutar `npm run build` y resolver errores.
- [ ] Ejecutar `npm run lint` y resolver errores o justificar los avisos que se mantengan.
- [ ] Probar los flujos principales como visitante, customer y admin.
- [ ] Probar el flujo completo: registro de solicitud → revisión → aprobación → aparición en catálogo → detalle → favorito.
- [ ] Probar persistencia después de recargar el navegador.
- [ ] Revisar que no existan botones sin función ni enlaces rotos.
- [ ] Revisar que las imágenes y demás assets carguen correctamente.
- [ ] Actualizar `README.md` con las funcionalidades realmente terminadas y los pasos de ejecución.
- [ ] Actualizar `docs/ARCHITECTURE.md` si cambió la estructura o el flujo de componentes.
- [ ] Actualizar `docs/DATA_MODEL.md` si cambiaron entidades, campos o persistencia.
- [ ] Registrar en `docs/DECISIONS.md` las decisiones importantes tomadas durante el desarrollo.
- [ ] Revisar que la documentación no afirme que existe backend, base de datos o seguridad real si no se implementaron.
- [ ] Crear un commit final con un mensaje que describa el conjunto de cambios.

**Criterio para completar el proyecto:** la aplicación compila, los flujos principales están probados y la documentación coincide con el comportamiento entregado.

---

## Registro de progreso

| Fecha | Fase / tarea | Resultado o notas |
|---|---|---|
|  |  |  |
|  |  |  |
|  |  |  |

## Decisiones pendientes de confirmar

- [ ] Confirmar con el profesor si `localStorage` está permitido como mecanismo de persistencia para simular la base de datos.
- [ ] Definir la estrategia para almacenar imágenes seleccionadas en el formulario.
- [ ] Confirmar el alcance de las páginas auxiliares (Contacto, Nosotros y Recuperar contraseña).
- [ ] Confirmar si los favoritos se comparten entre sesiones del mismo navegador o si se asocian al usuario simulado.

## Reglas para mantener el alcance bajo control

1. No agregar una dependencia si React y TypeScript ya resuelven la necesidad.
2. No crear carpetas vacías por anticipado; crear una carpeta cuando exista código que deba vivir allí.
3. No duplicar los datos de propiedades en cada página.
4. No mezclar una solicitud pendiente con una propiedad ya publicada.
5. No implementar la página diseñada ni las funcionalidades avanzadas antes de estabilizar el modelo y el flujo de datos.
6. Después de cada cambio, explicar qué cambió, por qué y cómo comprobarlo.
7. Actualizar la documentación cuando una decisión o comportamiento del proyecto cambie.
