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

interface EstadoPropiedades {
  propiedades: Propiedad[];
  solicitudes: SolicitudPropiedad[];
}

interface EstadoPersistido {
  version: 3;
  /** Solo propiedades creadas localmente al aprobar una solicitud. */
  propiedadesLocales: Propiedad[];
  solicitudes: SolicitudPropiedad[];
}

interface EstadoPersistidoLeido {
  propiedadesLocales: Propiedad[];
  solicitudes: SolicitudPropiedad[];
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

const hoy = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
};

const esRegistro = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null;

const esDatosPropiedad = (
  valor: unknown,
): valor is Record<string, unknown> & DatosPropiedad => {
  if (!esRegistro(valor)) return false;

  return (
    typeof valor.titulo === "string" &&
    valor.titulo.trim().length > 0 &&
    typeof valor.tipo === "string" &&
    valor.tipo.trim().length > 0 &&
    (valor.operacion === "Venta" || valor.operacion === "Arriendo") &&
    typeof valor.precio === "number" &&
    Number.isFinite(valor.precio) &&
    valor.precio >= 0 &&
    typeof valor.ciudad === "string" &&
    valor.ciudad.trim().length > 0 &&
    typeof valor.departamento === "string" &&
    valor.departamento.trim().length > 0 &&
    (valor.sector === undefined || typeof valor.sector === "string") &&
    typeof valor.habitaciones === "number" &&
    Number.isInteger(valor.habitaciones) &&
    valor.habitaciones >= 0 &&
    typeof valor.banos === "number" &&
    Number.isInteger(valor.banos) &&
    valor.banos >= 0 &&
    typeof valor.area === "number" &&
    Number.isFinite(valor.area) &&
    valor.area > 0 &&
    typeof valor.descripcion === "string" &&
    Array.isArray(valor.imagenes) &&
    valor.imagenes.length > 0 &&
    valor.imagenes.every(
      (imagen) => typeof imagen === "string" && imagen.length > 0,
    ) &&
    (valor.agenteId === undefined ||
      (typeof valor.agenteId === "number" &&
        Number.isSafeInteger(valor.agenteId) &&
        valor.agenteId > 0))
  );
};

const esPropiedad = (valor: unknown): valor is Propiedad => {
  if (!esRegistro(valor) || !esDatosPropiedad(valor)) return false;

  return (
    typeof valor.id === "number" &&
    Number.isSafeInteger(valor.id) &&
    valor.id > 0 &&
    typeof valor.fecha === "string" &&
    (valor.destacada === undefined || typeof valor.destacada === "boolean")
  );
};

const esAgente = (valor: unknown): valor is Agente => {
  if (!esRegistro(valor)) return false;

  return (
    typeof valor.id === "number" &&
    Number.isSafeInteger(valor.id) &&
    valor.id > 0 &&
    typeof valor.nombre === "string" &&
    valor.nombre.trim().length > 0 &&
    typeof valor.cargo === "string" &&
    typeof valor.especialidad === "string" &&
    typeof valor.experiencia === "number" &&
    Number.isInteger(valor.experiencia) &&
    valor.experiencia >= 0 &&
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
    typeof valor.id === "number" &&
    Number.isSafeInteger(valor.id) &&
    valor.id > 0 &&
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

const leerEstadoSerializado = (
  contenido: string,
): EstadoPersistidoLeido | null => {
  try {
    const valor: unknown = JSON.parse(contenido);

    if (
      !esRegistro(valor) ||
      !Array.isArray(valor.solicitudes) ||
      !valor.solicitudes.every(esSolicitudPropiedad)
    ) {
      return null;
    }

    // Formato actual: solo persiste registros creados desde el formulario.
    if (valor.version === 3) {
      if (
        !Array.isArray(valor.propiedadesLocales) ||
        !valor.propiedadesLocales.every(esPropiedad)
      ) {
        return null;
      }

      return {
        propiedadesLocales: valor.propiedadesLocales,
        solicitudes: valor.solicitudes,
      };
    }

    // Compatibilidad con versiones anteriores. Las propiedades que ya estén
    // en datos.json se descartan al combinar; las aprobadas localmente se conservan.
    if (
      (valor.version === 1 || valor.version === 2) &&
      Array.isArray(valor.propiedades) &&
      valor.propiedades.every(esPropiedad)
    ) {
      return {
        propiedadesLocales: valor.propiedades,
        solicitudes: valor.solicitudes,
      };
    }

    return null;
  } catch {
    return null;
  }
};

const leerEstadoGuardado = (): EstadoPersistidoLeido | null => {
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
  guardado: EstadoPersistidoLeido | null,
): EstadoPropiedades => {
  const idsBase = new Set(propiedadesBase.map((propiedad) => propiedad.id));
  const propiedadesLocales =
    guardado?.propiedadesLocales.filter(
      (propiedad) => !idsBase.has(propiedad.id),
    ) ?? [];

  return {
    propiedades: [...propiedadesBase, ...propiedadesLocales],
    solicitudes: guardado?.solicitudes ?? [],
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

const guardarEstado = (
  estado: EstadoPropiedades,
  propiedadesBase: Propiedad[],
) => {
  const idsBase = new Set(propiedadesBase.map((propiedad) => propiedad.id));
  const contenido: EstadoPersistido = {
    version: 3,
    propiedadesLocales: estado.propiedades.filter(
      (propiedad) => !idsBase.has(propiedad.id),
    ),
    solicitudes: estado.solicitudes,
  };

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

        const idsDisponibles = new Set(
          inicial.propiedades.map((propiedad) => propiedad.id),
        );
        const favoritosValidos = favoritosRef.current.filter((id) =>
          idsDisponibles.has(id),
        );

        if (favoritosValidos.length !== favoritosRef.current.length) {
          favoritosRef.current = favoritosValidos;
          setFavoritos(favoritosValidos);
          try {
            guardarFavoritos(favoritosValidos);
          } catch {
            // Los favoritos actuales siguen disponibles en el estado React.
          }
        }

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

  // El estado se persiste antes de actualizar React para no confirmar
  // solicitudes o aprobaciones que el navegador no pudo guardar.
  const actualizarEstado = (
    actualizar: (actual: EstadoPropiedades) => EstadoPropiedades,
  ) => {
    if (cargando || errorCarga) {
      throw new Error("El catálogo todavía no está disponible.");
    }

    const siguiente = actualizar(estadoRef.current);
    if (siguiente === estadoRef.current) return;

    guardarEstado(siguiente, propiedadesBaseRef.current);
    estadoRef.current = siguiente;
    setEstado(siguiente);
  };

  const alternarFavorito = (id: number) => {
    if (!estadoRef.current.propiedades.some((propiedad) => propiedad.id === id)) {
      return;
    }

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

        const idsDisponibles = new Set(
          estadoRef.current.propiedades.map((propiedad) => propiedad.id),
        );
        const validos = actualizados.filter((id) => idsDisponibles.has(id));

        favoritosRef.current = validos;
        setFavoritos(validos);
        return;
      }

      const actualizado =
        evento.newValue === null
          ? null
          : leerEstadoSerializado(evento.newValue);

      if (evento.newValue !== null && !actualizado) return;

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
    if (
      typeof datos.agenteId !== "number" ||
      !agentes.some((agente) => agente.id === datos.agenteId)
    ) {
      throw new Error(
        "La solicitud debe estar relacionada con un agente del catálogo.",
      );
    }

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

      const agenteId =
        solicitud.agenteId && agentes.some((agente) => agente.id === solicitud.agenteId)
          ? solicitud.agenteId
          : agentes[0]?.id;

      if (typeof agenteId !== "number") {
        throw new Error("No hay un agente disponible para publicar la propiedad.");
      }

      const nuevaPropiedad: Propiedad = {
        id: siguienteId(actual.propiedades),
        titulo: solicitud.titulo,
        tipo: solicitud.tipo,
        operacion: solicitud.operacion,
        precio: solicitud.precio,
        ciudad: solicitud.ciudad,
        departamento: solicitud.departamento,
        sector: solicitud.sector,
        habitaciones: solicitud.habitaciones,
        banos: solicitud.banos,
        area: solicitud.area,
        descripcion: solicitud.descripcion,
        imagenes: solicitud.imagenes,
        agenteId,
        fecha: hoy(),
      };

      return {
        propiedades: [...actual.propiedades, nuevaPropiedad],
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
