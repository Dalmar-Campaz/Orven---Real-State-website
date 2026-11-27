export type TipoInmueble = string;
export type Operacion = "Venta" | "Arriendo";
export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";

/** Persona asesora relacionada con una o varias propiedades. */
export interface Agente {
  id: number;
  nombre: string;
  cargo: string;
  especialidad: string;
  experiencia: number;
  email: string;
  telefono: string;
  foto: string;
  descripcion: string;
}

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
  imagenes: string[];
  agenteId?: number;
}

/** Un inmueble ya publicado en el catálogo. */
export interface Propiedad extends DatosPropiedad {
  id: number;
  fecha: string;
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

/** Estructura pública del archivo public/datos.json. */
export interface DatosCatalogo {
  propiedades: Propiedad[];
  agentes: Agente[];
}
