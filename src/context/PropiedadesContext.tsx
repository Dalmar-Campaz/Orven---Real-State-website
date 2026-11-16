import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  DatosPropiedad,
  Propiedad,
  SolicitudPropiedad,
} from "../types/propiedad";
import { propiedadesIniciales, solicitudesPropiedad} from "../data/propiedades";

interface PropiedadesContextType {
  propiedades: Propiedad[];
  solicitudes: SolicitudPropiedad[];
  crearSolicitud: (
    datos: DatosPropiedad,
    solicitante: SolicitudPropiedad["solicitante"]
  ) => void;
  aprobarSolicitud: (id: number) => void;
  rechazarSolicitud: (id: number, motivo?: string) => void;
}

const PropiedadesContext = createContext<PropiedadesContextType | undefined>(
  undefined
);

const siguienteId = (lista: { id: number }[]) =>
  Math.max(0, ...lista.map((item) => item.id)) + 1;

const hoy = () => new Date().toISOString().slice(0, 10);

export const PropiedadesProvider = ({ children }: { children: ReactNode }) => {
  const [propiedades, setPropiedades] = useState(propiedadesIniciales);
  const [solicitudes, setSolicitudes] = useState(solicitudesPropiedad);

  const crearSolicitud: PropiedadesContextType["crearSolicitud"] = (
    datos,
    solicitante
  ) => {
    const nueva: SolicitudPropiedad = {
      ...datos,
      id: siguienteId(solicitudes),
      fecha: hoy(),
      estado: "Pendiente",
      solicitante,
    };
    setSolicitudes((prev) => [nueva, ...prev]);
  };

  const aprobarSolicitud = (id: number) => {
    const solicitud = solicitudes.find((s) => s.id === id);
    if (!solicitud || solicitud.estado !== "Pendiente") return;

    // Quitamos los campos que solo pertenecen a una solicitud
    const { id: _id, fecha: _fecha, estado: _estado, solicitante: _sol, motivoRechazo: _mot, ...datos } = solicitud;

    setPropiedades((prev) => [
      ...prev,
      { ...datos, id: siguienteId(prev), fecha: hoy() },
    ]);
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "Aprobada" } : s))
    );
  };

  const rechazarSolicitud = (id: number, motivo?: string) => {
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === id && s.estado === "Pendiente"
          ? { ...s, estado: "Rechazada", motivoRechazo: motivo || undefined }
          : s
      )
    );
  };

  return (
    <PropiedadesContext.Provider
      value={{ propiedades, solicitudes, crearSolicitud, aprobarSolicitud, rechazarSolicitud }}
    >
      {children}
    </PropiedadesContext.Provider>
  );
};

export const usePropiedades = () => {
  const context = useContext(PropiedadesContext);
  if (!context) {
    throw new Error("usePropiedades debe usarse dentro de un PropiedadesProvider");
  }
  return context;
};