# Registro de decisiones técnicas

Este documento registra decisiones que pueden observarse en el código actual y requisitos comunicados para el proyecto. No se atribuyen motivos históricos cuando no están documentados. Las decisiones propuestas para el futuro deben añadirse con estado «Propuesta» y no confundirse con decisiones ya implementadas.

## D-001 — No utilizar una base de datos real en el proyecto académico

- **Estado:** vigente como requisito del proyecto.
- **Contexto:** el requisito indicado para la asignatura es evitar una base de datos para mantener manejable el alcance del trabajo.
- **Decisión:** representar los datos de demostración mediante estructuras TypeScript y estado del frontend.
- **Evidencia actual:** `src/data/propiedades.ts`, `src/pages/Admin/Admin.tsx` y el estado de las páginas.
- **Consecuencias:** menor configuración e infraestructura; no existe sincronización multiusuario ni persistencia central. Los datos locales pueden reiniciarse al recargar.

## D-002 — Utilizar React Context para compartir la sesión

- **Estado:** implementada.
- **Contexto:** varias partes de la interfaz necesitan consultar el usuario y cerrar sesión.
- **Decisión observada:** `AuthContext` expone `user`, `login` y `logout` mediante `AuthProvider` y el hook `useAuth`.
- **Evidencia:** `src/context/AuthContext.tsx`.
- **Persistencia asociada:** se guarda el objeto de usuario en `localStorage` bajo la clave `orven_user`.
- **Consecuencias:** la sesión simulada sobrevive a una recarga en el mismo navegador. No constituye autenticación segura y no debe utilizarse como control de acceso real.

## D-003 — Usar React Router DOM para la navegación

- **Estado:** implementada.
- **Decisión observada:** las rutas de la aplicación se declaran con `BrowserRouter`, `Routes`, `Route` y `Navigate` en `src/App.tsx`.
- **Motivo técnico:** no está registrado en el historial de decisiones; se documenta la implementación existente sin atribuirle una justificación no verificada.
- **Consecuencia:** las vistas se seleccionan según la URL dentro de una SPA.

## D-004 — Mantener los estilos junto a sus páginas y componentes

- **Estado:** convención observada.
- **Decisión observada:** archivos como `Home.tsx` y `Home.css`, o `AvatarProfile.tsx` y `AvatarProfile.css`, están en la misma carpeta.
- **Motivo histórico:** no documentado.
- **Consecuencia:** facilita localizar los estilos correspondientes a una pantalla o componente. No obliga a mover los estilos globales de `index.css`.

## D-005 — Utilizar Vite como herramienta de desarrollo y compilación

- **Estado:** implementada.
- **Evidencia:** `vite.config.ts` configura el plugin de React; `package.json` declara los scripts `dev`, `build` y `preview`.
- **Consecuencia:** el proyecto utiliza Vite para desarrollo local y generación del paquete de producción.

## D-006 — Mantener la autenticación como simulación frontend

- **Estado:** implementación actual; pendiente de definir su alcance final en la entrega.
- **Evidencia:** `Login.tsx` asigna el rol `admin` al correo `admin@orven.com` y `customer` a los demás correos válidos. El contexto solo guarda correo y rol.
- **Consecuencia:** no se validan contraseñas contra un servicio y el rol guardado en el navegador puede modificarse. La ruta `/admin` tampoco comprueba el rol actualmente.
- **Nota:** esto solo es aceptable como simulación académica, no como mecanismo de seguridad real.

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
