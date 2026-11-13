# Registro de decisiones técnicas

Este documento registra decisiones comunicadas para el proyecto y decisiones que pueden observarse en el código actual. No se atribuyen motivos históricos cuando no están documentados. Las propuestas futuras deben identificarse como tales y no confundirse con funcionalidades implementadas.

## D-001 — No utilizar una base de datos real en el proyecto académico

- **Estado:** vigente como requisito del proyecto.
- **Contexto:** el profesor indicó evitar una base de datos para mantener manejable el alcance del trabajo.
- **Decisión:** representar los datos de demostración mediante estructuras TypeScript y estado del frontend.
- **Evidencia:** `src/data/propiedades.ts` y el estado local de las páginas.
- **Consecuencias:** menor configuración e infraestructura; no hay sincronización entre usuarios o dispositivos. La persistencia local, si se implementa, seguirá limitada al navegador.

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
