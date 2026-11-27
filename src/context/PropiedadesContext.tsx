import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Agente,
  DatosCatalogo,
  DatosPropiedad,
  Propiedad,
  SolicitudPropiedad,
} from "../types/propiedad";
import { solicitudesPropiedad } from "../data/propiedades";

interface EstadoPropiedades {
  propiedades: Propiedad[];
  solicitudes: SolicitudPropiedad[];
}

interface EstadoAlmacenado extends EstadoPropiedades {
  version: 2;
}

interface PropiedadesContextType extends EstadoPropiedades {
  agentes: Agente[];
  favoritos: number[];
  cargando: boolean;
  errorCarga: string | null;
  alternarFavorito: (id: number) => void;
  crearSolicitud: (
    datos: DatosPropiedad,
    solicitante: SolicitudPropiedad["solicitante"],
  ) => void;
  aprobarSolicitud: (id: number) => void;
  rechazarSolicitud: (id: number, motivo?: string) => void;
}

const CLAVE_ALMACENAMIENTO = "orven_propiedades";
const CLAVE_FAVORITOS = "orven_favoritos";

const PropiedadesContext = createContext<PropiedadesContextType | undefined>(
  undefined,
);

const siguienteId = (lista: { id: number }[]) =>
  Math.max(0, ...lista.map((item) => item.id)) + 1;

const hoy = () => new Date().toISOString().slice(0, 10);

const esRegistro = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null;

const esDatosPropiedad = (
  valor: unknown,
): valor is Record<string, unknown> & DatosPropiedad => {
  if (!esRegistro(valor)) return false;

  return (
    typeof valor.titulo === "string" &&
    typeof valor.tipo === "string" &&
    valor.tipo.trim().length > 0 &&
    (valor.operacion === "Venta" || valor.operacion === "Arriendo") &&
    typeof valor.precio === "number" &&
    Number.isFinite(valor.precio) &&
    typeof valor.ciudad === "string" &&
    typeof valor.departamento === "string" &&
    (valor.sector === undefined || typeof valor.sector === "string") &&
    Number.isInteger(valor.habitaciones) &&
    Number.isInteger(valor.banos) &&
    typeof valor.area === "number" &&
    Number.isFinite(valor.area) &&
    valor.area > 0 &&
    typeof valor.descripcion === "string" &&
    Array.isArray(valor.imagenes) &&
    valor.imagenes.length > 0 &&
    valor.imagenes.every((imagen) => typeof imagen === "string") &&
    (valor.agenteId === undefined ||
      (typeof valor.agenteId === "number" && Number.isSafeInteger(valor.agenteId)))
  );
};

const esPropiedad = (valor: unknown): valor is Propiedad => {
  if (!esRegistro(valor) || !esDatosPropiedad(valor)) return false;

  return (
    Number.isSafeInteger(valor.id) &&
    typeof valor.fecha === "string" &&
    (valor.destacada === undefined || typeof valor.destacada === "boolean")
  );
};

const esAgente = (valor: unknown): valor is Agente => {
  if (!esRegistro(valor)) return false;

  return (
    Number.isSafeInteger(valor.id) &&
    typeof valor.nombre === "string" &&
    typeof valor.cargo === "string" &&
    typeof valor.especialidad === "string" &&
    Number.isInteger(valor.experiencia) &&
    typeof valor.email === "string" &&
    typeof valor.telefono === "string" &&
    typeof valor.foto === "string" &&
    typeof valor.descripcion === "string"
  );
};

const esSolicitudPropiedad = (valor: unknown): valor is SolicitudPropiedad => {
  if (!esRegistro(valor) || !esDatosPropiedad(valor)) return false;

  const solicitante = valor.solicitante;
  return (
    Number.isSafeInteger(valor.id) &&
    typeof valor.fecha === "string" &&
    (valor.estado === "Pendiente" ||
      valor.estado === "Aprobada" ||
      valor.estado === "Rechazada") &&
    esRegistro(solicitante) &&
    typeof solicitante.nombre === "string" &&
    typeof solicitante.email === "string" &&
    typeof solicitante.telefono === "string" &&
    (valor.motivoRechazo === undefined ||
      typeof valor.motivoRechazo === "string")
  );
};

const esDatosCatalogo = (valor: unknown): valor is DatosCatalogo => {
  if (
    !esRegistro(valor) ||
    !Array.isArray(valor.propiedades) ||
    !Array.isArray(valor.agentes) ||
    valor.propiedades.length < 20 ||
    valor.agentes.length < 5 ||
    !valor.propiedades.every(esPropiedad) ||
    !valor.agentes.every(esAgente)
  ) {
    return false;
  }

  const idsPropiedades = valor.propiedades.map((propiedad) => propiedad.id);
  const idsAgentes = valor.agentes.map((agente) => agente.id);
  const agentesDisponibles = new Set(idsAgentes);

  return (
    new Set(idsPropiedades).size === idsPropiedades.length &&
    new Set(idsAgentes).size === idsAgentes.length &&
    valor.propiedades.every(
      (propiedad) =>
        typeof propiedad.agenteId === "number" &&
        agentesDisponibles.has(propiedad.agenteId),
    )
  );
};

const leerEstadoSerializado = (contenido: string): EstadoPropiedades | null => {
  try {
    const valor: unknown = JSON.parse(contenido);

    // La versión 1 se acepta para conservar las solicitudes creadas antes
    // de integrar datos.json. Las propiedades base ahora vienen del JSON.
    if (
      !esRegistro(valor) ||
      (valor.version !== 1 && valor.version !== 2) ||
      !Array.isArray(valor.propiedades) ||
      !Array.isArray(valor.solicitudes) ||
      !valor.propiedades.every(esPropiedad) ||
      !valor.solicitudes.every(esSolicitudPropiedad)
    ) {
      return null;
    }

    return {
      propiedades: valor.propiedades,
      solicitudes: valor.solicitudes,
    };
  } catch {
    return null;
  }
};

const leerEstadoGuardado = (): EstadoPropiedades | null => {
  try {
    const contenido = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!contenido) return null;

    const guardado = leerEstadoSerializado(contenido);
    if (guardado) return guardado;

    window.localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  } catch {
    // El navegador puede bloquear el almacenamiento.
  }

  return null;
};

const combinarEstado = (
  propiedadesBase: Propiedad[],
  guardado: EstadoPropiedades | null,
): EstadoPropiedades => {
  if (!guardado) {
    return {
      propiedades: [...propiedadesBase],
      solicitudes: [...solicitudesPropiedad],
    };
  }

  const idsBase = new Set(propiedadesBase.map((propiedad) => propiedad.id));
  const propiedadesLocales = guardado.propiedades.filter(
    (propiedad) => !idsBase.has(propiedad.id),
  );

  // Los registros del JSON son la fuente principal: una modificación o un
  // registro nuevo en public/datos.json se refleja al volver a cargar la app.
  return {
    propiedades: [...propiedadesBase, ...propiedadesLocales],
    solicitudes: guardado.solicitudes,
  };
};

const leerFavoritosSerializados = (contenido: string): number[] | null => {
  try {
    const valor: unknown = JSON.parse(contenido);
    if (!Array.isArray(valor)) return null;

    const ids = valor.filter(
      (id): id is number =>
        typeof id === "number" && Number.isSafeInteger(id) && id > 0,
    );
    if (ids.length !== valor.length) return null;

    return [...new Set(ids)];
  } catch {
    return null;
  }
};

const cargarFavoritos = (): number[] => {
  try {
    const contenido = window.localStorage.getItem(CLAVE_FAVORITOS);
    if (contenido === null) return [];

    const favoritos = leerFavoritosSerializados(contenido);
    if (favoritos) return favoritos;

    window.localStorage.removeItem(CLAVE_FAVORITOS);
  } catch {
    // El almacenamiento puede estar bloqueado por el navegador.
  }

  return [];
};

const guardarEstado = (estado: EstadoPropiedades) => {
  const contenido: EstadoAlmacenado = { version: 2, ...estado };

  try {
    window.localStorage.setItem(
      CLAVE_ALMACENAMIENTO,
      JSON.stringify(contenido),
    );
  } catch {
    throw new Error(
      "No se pudieron guardar los cambios en este navegador. El almacenamiento puede estar lleno o deshabilitado. Reduce el tamaño de las imágenes e inténtalo de nuevo.",
    );
  }
};

const guardarFavoritos = (favoritos: number[]) => {
  try {
    window.localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  } catch {
    throw new Error(
      "No se pudieron guardar los favoritos en este navegador. Comprueba que el almacenamiento esté habilitado e inténtalo de nuevo.",
    );
  }
};

export const PropiedadesProvider = ({ children }: { children: ReactNode }) => {
  const [estado, setEstado] = useState<EstadoPropiedades>({
    propiedades: [],
    solicitudes: [],
  });
  const estadoRef = useRef(estado);
  const propiedadesBaseRef = useRef<Propiedad[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>(cargarFavoritos);
  const favoritosRef = useRef(favoritos);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargarCatalogo = async () => {
      try {
        const respuesta = await fetch("/datos.json");
        if (!respuesta.ok) {
          throw new Error("No se pudo leer public/datos.json.");
        }

        const datos: unknown = await respuesta.json();
        if (!esDatosCatalogo(datos)) {
          throw new Error(
            "datos.json no cumple el contrato: debe contener al menos 20 propiedades, 5 agentes y relaciones válidas mediante agenteId.",
          );
        }

        if (!activo) return;

        propiedadesBaseRef.current = datos.propiedades;
        const inicial = combinarEstado(
          datos.propiedades,
          leerEstadoGuardado(),
        );
        estadoRef.current = inicial;
        setEstado(inicial);
        setAgentes(datos.agentes);
        setErrorCarga(null);
      } catch (error) {
        if (!activo) return;
        setErrorCarga(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar los datos de Orven.",
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargarCatalogo();

    return () => {
      activo = false;
    };
  }, []);

  // Primero se persiste y después se actualiza React. Así el formulario no
  // puede mostrar éxito cuando el navegador rechazó el guardado.
  const actualizarEstado = (
    actualizar: (actual: EstadoPropiedades) => EstadoPropiedades,
  ) => {
    if (cargando) {
      throw new Error("Espera a que el catálogo termine de cargar.");
    }

    const siguiente = actualizar(estadoRef.current);
    if (siguiente === estadoRef.current) return;

    guardarEstado(siguiente);
    estadoRef.current = siguiente;
    setEstado(siguiente);
  };

  const alternarFavorito = (id: number) => {
    const siguientes = favoritosRef.current.includes(id)
      ? favoritosRef.current.filter((favoritoId) => favoritoId !== id)
      : [...favoritosRef.current, id];

    guardarFavoritos(siguientes);
    favoritosRef.current = siguientes;
    setFavoritos(siguientes);
  };

  useEffect(() => {
    const sincronizarPestanas = (evento: StorageEvent) => {
      try {
        if (
          evento.storageArea !== window.localStorage ||
          (evento.key !== CLAVE_ALMACENAMIENTO &&
            evento.key !== CLAVE_FAVORITOS &&
            evento.key !== null)
        ) {
          return;
        }
      } catch {
        return;
      }

      if (evento.key === null) {
        const inicial = combinarEstado(propiedadesBaseRef.current, null);
        estadoRef.current = inicial;
        setEstado(inicial);
        favoritosRef.current = [];
        setFavoritos([]);
        return;
      }

      if (evento.key === CLAVE_FAVORITOS) {
        const actualizados =
          evento.newValue === null
            ? []
            : leerFavoritosSerializados(evento.newValue);
        if (!actualizados) return;

        favoritosRef.current = actualizados;
        setFavoritos(actualizados);
        return;
      }

      if (evento.newValue === null) {
        const inicial = combinarEstado(propiedadesBaseRef.current, null);
        estadoRef.current = inicial;
        setEstado(inicial);
        return;
      }

      const actualizado = leerEstadoSerializado(evento.newValue);
      if (!actualizado) return;

      const combinado = combinarEstado(
        propiedadesBaseRef.current,
        actualizado,
      );
      estadoRef.current = combinado;
      setEstado(combinado);
    };

    window.addEventListener("storage", sincronizarPestanas);
    return () => window.removeEventListener("storage", sincronizarPestanas);
  }, []);

  const crearSolicitud: PropiedadesContextType["crearSolicitud"] = (
    datos,
    solicitante,
  ) => {
    actualizarEstado((actual) => {
      const nueva: SolicitudPropiedad = {
        ...datos,
        id: siguienteId(actual.solicitudes),
        fecha: hoy(),
        estado: "Pendiente",
        solicitante,
      };

      return {
        ...actual,
        solicitudes: [nueva, ...actual.solicitudes],
      };
    });
  };

  const aprobarSolicitud = (id: number) => {
    actualizarEstado((actual) => {
      const solicitud = actual.solicitudes.find((item) => item.id === id);
      if (!solicitud || solicitud.estado !== "Pendiente") return actual;

      const {
        id: _id,
        fecha: _fecha,
        estado: _estado,
        solicitante: _solicitante,
        motivoRechazo: _motivo,
        ...datos
      } = solicitud;

      return {
        propiedades: [
          ...actual.propiedades,
          {
            ...datos,
            agenteId: solicitud.agenteId ?? agentes[0]?.id,
            id: siguienteId(actual.propiedades),
            fecha: hoy(),
          },
        ],
        solicitudes: actual.solicitudes.map((item) =>
          item.id === id ? { ...item, estado: "Aprobada" } : item,
        ),
      };
    });
  };

  const rechazarSolicitud = (id: number, motivo?: string) => {
    actualizarEstado((actual) => {
      const solicitud = actual.solicitudes.find((item) => item.id === id);
      if (!solicitud || solicitud.estado !== "Pendiente") return actual;

      return {
        ...actual,
        solicitudes: actual.solicitudes.map((item) =>
          item.id === id
            ? {
                ...item,
                estado: "Rechazada",
                motivoRechazo: motivo?.trim() || undefined,
              }
            : item,
        ),
      };
    });
  };

  return (
    <PropiedadesContext.Provider
      value={{
        propiedades: estado.propiedades,
        solicitudes: estado.solicitudes,
        agentes,
        favoritos,
        cargando,
        errorCarga,
        alternarFavorito,
        crearSolicitud,
        aprobarSolicitud,
        rechazarSolicitud,
      }}
    >
      {children}
    </PropiedadesContext.Provider>
  );
};

export const usePropiedades = () => {
  const context = useContext(PropiedadesContext);
  if (!context) {
    throw new Error(
      "usePropiedades debe usarse dentro de un PropiedadesProvider",
    );
  }
  return context;
};
