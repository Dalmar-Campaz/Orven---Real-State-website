export type TipoInmueble = "Casa" | "Apartamento";
export type Operacion = "Venta";
export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";

/** Lo que describe a un inmueble, sea solicitud o ya publicado. */
export interface DatosPropiedad {
  titulo: string;
  tipo: TipoInmueble;
  operacion: Operacion;
  precio: number;
  ciudad: string;
  departamento: string;
  sector?: string;
  habitaciones: number;
  banos: number;
  area: number;
  descripcion: string;
  imagenes: string[]; // URLs
}

/** Un inmueble ya publicado en el catálogo. */
export interface Propiedad extends DatosPropiedad {
  id: number;
  fecha: string; // ISO: "2026-11-06"
  destacada?: boolean;
}

/** Una publicación enviada por un usuario y pendiente de revisión. */
export interface SolicitudPropiedad extends DatosPropiedad {
  id: number;
  fecha: string;
  estado: EstadoSolicitud;
  solicitante: { nombre: string; email: string; telefono: string };
  motivoRechazo?: string;
}