import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  DatosPropiedad,
  Propiedad,
  SolicitudPropiedad,
} from "../types/propiedad";
import {
  propiedadesIniciales,
  solicitudesPropiedad,
} from "../data/propiedades";

interface EstadoPropiedades {
  propiedades: Propiedad[];
  solicitudes: SolicitudPropiedad[];
}

interface EstadoAlmacenado extends EstadoPropiedades {
  version: 1;
}

interface PropiedadesContextType extends EstadoPropiedades {
  favoritos: number[];
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
    (valor.tipo === "Casa" || valor.tipo === "Apartamento") &&
    valor.operacion === "Venta" &&
    typeof valor.precio === "number" &&
    Number.isFinite(valor.precio) &&
    typeof valor.ciudad === "string" &&
    typeof valor.departamento === "string" &&
    (valor.sector === undefined || typeof valor.sector === "string") &&
    typeof valor.habitaciones === "number" &&
    Number.isFinite(valor.habitaciones) &&
    typeof valor.banos === "number" &&
    Number.isFinite(valor.banos) &&
    typeof valor.area === "number" &&
    Number.isFinite(valor.area) &&
    typeof valor.descripcion === "string" &&
    Array.isArray(valor.imagenes) &&
    valor.imagenes.every((imagen) => typeof imagen === "string")
  );
};

const esPropiedad = (valor: unknown): valor is Propiedad => {
  if (!esRegistro(valor) || !esDatosPropiedad(valor)) return false;

  return (
    Number.isInteger(valor.id) &&
    typeof valor.fecha === "string" &&
    (valor.destacada === undefined || typeof valor.destacada === "boolean")
  );
};

const esSolicitudPropiedad = (valor: unknown): valor is SolicitudPropiedad => {
  if (!esRegistro(valor) || !esDatosPropiedad(valor)) return false;

  const solicitante = valor.solicitante;
  return (
    Number.isInteger(valor.id) &&
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

const estadoInicial = (): EstadoPropiedades => ({
  propiedades: [...propiedadesIniciales],
  solicitudes: [...solicitudesPropiedad],
});

const leerEstadoSerializado = (contenido: string): EstadoPropiedades | null => {
  try {
    const valor: unknown = JSON.parse(contenido);

    if (
      !esRegistro(valor) ||
      valor.version !== 1 ||
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

const cargarEstado = (): EstadoPropiedades => {
  try {
    const contenido = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!contenido) return estadoInicial();

    const guardado = leerEstadoSerializado(contenido);
    if (guardado) return guardado;

    // Si el JSON está corrupto o no coincide con el modelo, volvemos a los ejemplos.
    window.localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  } catch {
    // El navegador puede bloquear el almacenamiento. La aplicación aún puede abrir.
  }

  return estadoInicial();
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
  const contenido: EstadoAlmacenado = { version: 1, ...estado };

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
  const [estado, setEstado] = useState<EstadoPropiedades>(cargarEstado);
  const estadoRef = useRef(estado);
  const [favoritos, setFavoritos] = useState<number[]>(cargarFavoritos);
  const favoritosRef = useRef(favoritos);

  // Primero se persiste y después se actualiza React. Así el formulario no
  // puede mostrar éxito cuando el navegador rechazó el guardado.
  const actualizarEstado = (
    actualizar: (actual: EstadoPropiedades) => EstadoPropiedades,
  ) => {
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
        const inicial = estadoInicial();
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
        const inicial = estadoInicial();
        estadoRef.current = inicial;
        setEstado(inicial);
        return;
      }

      const actualizado = leerEstadoSerializado(evento.newValue);
      if (!actualizado) return;

      estadoRef.current = actualizado;
      setEstado(actualizado);
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
        favoritos,
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
