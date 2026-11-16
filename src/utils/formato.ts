import type { Propiedad } from "../types/propiedad";

export const formatoPrecio = (n: number) =>
  `$ ${n.toLocaleString("es-CO")}`;

export const ubicacionCorta = (p: Propiedad) =>
  p.sector ? `${p.sector}, ${p.ciudad}` : p.ciudad;