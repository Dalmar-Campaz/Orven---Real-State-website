import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";
import logo from "../../assets/LogoWhite.png";
import home from "../../assets/icons/house.png";
import houseVerde from "../../assets/icons/house-verde.png";
import clipboard from "../../assets/icons/clipboard-list.png";
import logOut from "../../assets/icons/log-out.png";
import panel from "../../assets/icons/layout-grid.png";

/* ---------- Tipos ---------- */
type Estado = "Pendiente" | "Aprobada" | "Rechazada";
type FiltroEstado = "Todos" | Estado;
type Accion = "aprobar" | "rechazar" | null;

interface Solicitud {
  id: number;
  titulo: string;
  solicitante: string;
  email: string;
  telefono: string;
  ubicacion: string; // ciudad corta para la tabla
  ubicacionCompleta: string;
  tipo: "Venta" | "Arriendo";
  fecha: string;
  estado: Estado;
  precio: string;
  descripcion: string;
  habitaciones: number;
  banos: number;
  area: number;
  fotos: string[];
  motivoRechazo?: string;
}

/* ---------- Datos simulados (reemplaza por tu array real) ---------- */
const FOTO = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop"; // pon aquí la URL / import de una foto de ejemplo

const SOLICITUDES_INICIALES: Solicitud[] = [
  {
    id: 1,
    titulo: "Casa moderna con piscina",
    solicitante: "Juan Pérez",
    email: "juan.perez@email.com",
    telefono: "300 123 4567",
    ubicacion: "Medellín",
    ubicacionCompleta: "Medellín, Antioquia",
    tipo: "Venta",
    fecha: "06/11/2026",
    estado: "Pendiente",
    precio: "$ 850.000.000",
    descripcion:
      "Hermosa casa de 2 pisos con piscina, jardín y excelentes acabados. Ubicada en una zona residencial tranquila de Medellín.",
    habitaciones: 4,
    banos: 3,
    area: 280,
    fotos: [FOTO, FOTO, FOTO, FOTO, FOTO],
  },
  {
    id: 2,
    titulo: "Apartamento en Laureles",
    solicitante: "María López",
    email: "maria.lopez@email.com",
    telefono: "301 555 1020",
    ubicacion: "Medellín",
    ubicacionCompleta: "Medellín, Antioquia",
    tipo: "Arriendo",
    fecha: "06/11/2026",
    estado: "Pendiente",
    precio: "$ 3.200.000 / mes",
    descripcion: "Apartamento luminoso en Laureles, cerca de parques y comercio.",
    habitaciones: 3,
    banos: 2,
    area: 96,
    fotos: [FOTO, FOTO, FOTO],
  },
  {
    id: 3,
    titulo: "Casa campestre",
    solicitante: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    telefono: "310 444 8899",
    ubicacion: "Rionegro",
    ubicacionCompleta: "Rionegro, Antioquia",
    tipo: "Venta",
    fecha: "05/11/2026",
    estado: "Pendiente",
    precio: "$ 620.000.000",
    descripcion: "Casa campestre con amplias zonas verdes y chimenea.",
    habitaciones: 5,
    banos: 4,
    area: 340,
    fotos: [FOTO, FOTO],
  },
  {
    id: 4,
    titulo: "Apartamento moderno",
    solicitante: "Ana Torres",
    email: "ana.torres@email.com",
    telefono: "320 777 2211",
    ubicacion: "Bogotá",
    ubicacionCompleta: "Bogotá, Cundinamarca",
    tipo: "Arriendo",
    fecha: "05/11/2026",
    estado: "Aprobada",
    precio: "$ 4.100.000 / mes",
    descripcion: "Apartamento moderno con balcón y vista a la ciudad.",
    habitaciones: 2,
    banos: 2,
    area: 78,
    fotos: [FOTO, FOTO],
  },
  {
    id: 5,
    titulo: "Casa en El Poblado",
    solicitante: "Diego Ramírez",
    email: "diego.ramirez@email.com",
    telefono: "315 909 3030",
    ubicacion: "Medellín",
    ubicacionCompleta: "Medellín, Antioquia",
    tipo: "Venta",
    fecha: "04/11/2026",
    estado: "Rechazada",
    precio: "$ 1.450.000.000",
    descripcion: "Casa de lujo en El Poblado con acabados premium.",
    habitaciones: 4,
    banos: 5,
    area: 410,
    fotos: [FOTO, FOTO],
  },
  {
    id: 6,
    titulo: "Apartamento en Chapinero",
    solicitante: "Valentina Gómez",
    email: "valentina.gomez@email.com",
    telefono: "311 200 6060",
    ubicacion: "Bogotá",
    ubicacionCompleta: "Bogotá, Cundinamarca",
    tipo: "Arriendo",
    fecha: "04/11/2026",
    estado: "Pendiente",
    precio: "$ 2.800.000 / mes",
    descripcion: "Apartamento cómodo en Chapinero, ideal para profesionales.",
    habitaciones: 2,
    banos: 1,
    area: 64,
    fotos: [FOTO],
  },
];

const POR_PAGINA = 6;
const FILTROS: FiltroEstado[] = ["Todos", "Pendiente", "Aprobada", "Rechazada"];

/* ---------- Iconos ---------- */
const ICONS = {
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <path d="M9 4.5V3.5h6v1M9 11h6M9 15h4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.8 2.8L16 9.5" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z" />
      <circle cx="8" cy="8" r="1.3" />
    </>
  ),
  dollar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2c-.4-.9-1.4-1.4-2.5-1.4-1.4 0-2.5.8-2.5 1.9 0 2.7 5.2 1.3 5.2 4 0 1.100-1.100 2-2.700 2-1.200 0-2.300-.6-2.700-1.600M12 6.500v1.300m0 8.400v1.300" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18V7M3 14h18v4M21 14v-2.500a2.500 2.500 0 0 0-2.500-2.500H11v5" />
      <circle cx="7" cy="11" r="1.600" />
    </>
  ),
  bath: (
    <>
      <path d="M3 12h18v2.500a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V12ZM6 12V6.500a2 2 0 0 1 3.500-1.300M7 19l-1 2m11-2 1 2" />
    </>
  ),
  area: (
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.800" />
      <path d="M5 20c.8-3.600 3.700-5.500 7-5.500s6.200 1.900 7 5.500" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.500 6.500 8.500 6.500 8.500-6.500" />
    </>
  ),
  phone: (
    <path d="M6.500 3.500h3l1.500 4-2 1.300a11 11 0 0 0 5.200 5.200l1.300-2 4 1.500v3a2 2 0 0 1-2.200 2A16 16 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200Z" />
  ),
} as const;

type IconName = keyof typeof ICONS;

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

/* ---------- Componente ---------- */
export function AdminPanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(
    SOLICITUDES_INICIALES
  );
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("Todos");
  const [pagina, setPagina] = useState(1);

  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [accion, setAccion] = useState<Accion>(null);
  const [motivo, setMotivo] = useState("");

  /* Conteos de las tarjetas */
  const conteo = useMemo(
    () => ({
      pendientes: solicitudes.filter((s) => s.estado === "Pendiente").length,
      aprobadas: solicitudes.filter((s) => s.estado === "Aprobada").length,
      rechazadas: solicitudes.filter((s) => s.estado === "Rechazada").length,
    }),
    [solicitudes]
  );

  /* Filtrado + paginación */
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return solicitudes.filter((s) => {
      const coincide =
        !q ||
        s.titulo.toLowerCase().includes(q) ||
        s.solicitante.toLowerCase().includes(q);
      return coincide && (filtro === "Todos" || s.estado === filtro);
    });
  }, [solicitudes, busqueda, filtro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA);

  const seleccionada =
    solicitudes.find((s) => s.id === seleccionadaId) ?? null;

  /* Handlers */
  const abrirDetalle = (id: number) => {
    setSeleccionadaId(id);
    setFotoActiva(0);
    setAccion(null);
    setMotivo("");
  };

  const cerrarDetalle = () => {
    setSeleccionadaId(null);
    setAccion(null);
    setMotivo("");
  };

  const cambiarFoto = (dir: 1 | -1) => {
    if (!seleccionada) return;
    const total = seleccionada.fotos.length;
    setFotoActiva((i) => (i + dir + total) % total);
  };

  const enviar = () => {
    if (!seleccionada || !accion) return;
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === seleccionada.id
          ? {
              ...s,
              estado: accion === "aprobar" ? "Aprobada" : "Rechazada",
              motivoRechazo:
                accion === "rechazar" ? motivo.trim() || undefined : undefined,
            }
          : s
      )
    );
    cerrarDetalle();
  };

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  const fotosExtra = seleccionada ? Math.max(0, seleccionada.fotos.length - 4) : 0;

  return (
    <div className="admin">
      {/* Barra lateral */}
      <aside className="admin-sidebar">
        <img className="admin-sidebar__logo" src={logo} alt="Orven" />

        <nav className="admin-nav">
          <button type="button" className="admin-nav__item is-active">
            <img style={{ width: "20px", height: "20px" }} src={panel} alt="Panel Principal" /> Panel Principal
          </button>
          <button type="button" className="admin-nav__item">
            <img style={{ width: "20px", height: "20px" }} src={clipboard} alt="Solicitudes" /> Solicitudes
            <span className="admin-nav__badge">{conteo.pendientes}</span>
          </button>
          <button type="button" className="admin-nav__item">
            <img style={{ width: "20px", height: "20px" }} src={home} alt="Propiedades" /> Propiedades
          </button>
          <button
            type="button"
            className="admin-nav__item"
            onClick={cerrarSesion}
          >
            <img style={{ width: "20px", height: "20px" }} src={logOut} alt="Cerrar sesión" /> Cerrar sesión
          </button>
        </nav>

      </aside>

      {/* Contenido */}
      <div className="admin-content">
        <header className="admin-topbar">
          <span className="admin-topbar__avatar">A</span>
          <span>Administrador</span>
        </header>

        <div className="admin-body">
          <main className="admin-main">
            <h1>Panel de administración</h1>
            <p className="admin-main__subtitle">
              Gestiona las solicitudes de publicación y las propiedades de Orven.
            </p>

            {/* Tarjetas de resumen */}
            <section className="stats">
              <article className="stat stat--pending">
                <span className="stat__icon">
                  <Icon name="clipboard" size={30} />
                </span>
                <div>
                  <strong>{conteo.pendientes} Pendientes</strong>
                </div>
              </article>
              <article className="stat stat--approved">
                <span className="stat__icon">
                  <Icon name="checkCircle" size={30} />
                </span>
                <div>
                  <strong>{conteo.aprobadas} Aprobadas</strong>
                </div>
              </article>
              <article className="stat stat--rejected">
                <span className="stat__icon">
                  <Icon name="x" size={30} />
                </span>
                <div>
                  <strong>{conteo.rechazadas} Rechazadas</strong>
                </div>
              </article>
            </section>

            {/* Tabla */}
            <section className="table-card">
              <div className="table-card__head">
                <h2>
                  <Icon name="clipboard" size={22} /> Solicitudes recibidas
                </h2>
                <div className="table-card__tools">
                  <label className="search">
                    <Icon name="search" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por propietario o propiedad..."
                      value={busqueda}
                      onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPagina(1);
                      }}
                    />
                  </label>
                  <label className="select">
                    <select
                      value={filtro}
                      onChange={(e) => {
                        setFiltro(e.target.value as FiltroEstado);
                        setPagina(1);
                      }}
                      aria-label="Filtrar por estado"
                    >
                      {FILTROS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <Icon name="chevronDown" size={16} />
                  </label>
                </div>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        Propiedad / Solicitante <Icon name="chevronDown" size={14} />
                      </th>
                      <th>Ubicación</th>
                      <th>
                        Tipo <Icon name="chevronDown" size={14} />
                      </th>
                      <th>
                        Fecha <Icon name="chevronDown" size={14} />
                      </th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((s) => (
                      <tr
                        key={s.id}
                        className={s.id === seleccionadaId ? "is-selected" : ""}
                      >
                        <td>
                          <div className="prop">
                            <span
                              className="prop__thumb"
                              style={
                                s.fotos[0]
                                  ? { backgroundImage: `url(${s.fotos[0]})` }
                                  : undefined
                              }
                            />
                            <div>
                              <strong>{s.titulo}</strong>
                              <span>{s.solicitante}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="loc">
                            <Icon name="pin" size={16} /> {s.ubicacion}
                          </span>
                        </td>
                        <td>{s.tipo}</td>
                        <td>{s.fecha}</td>
                        <td>
                          <span className={`badge badge--${s.estado.toLowerCase()}`}>
                            {s.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-ver"
                            onClick={() => abrirDetalle(s.id)}
                          >
                            <Icon name="eye" size={18} /> Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visibles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="table__empty">
                          No hay solicitudes que coincidan con tu búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-card__foot">
                <span>
                  Mostrando{" "}
                  {filtradas.length === 0 ? 0 : inicio + 1}–
                  {Math.min(inicio + POR_PAGINA, filtradas.length)} de{" "}
                  {filtradas.length} solicitudes
                </span>
                <div className="pager">
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPagina(paginaActual - 1)}
                    aria-label="Página anterior"
                  >
                    <Icon name="chevronLeft" size={16} />
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        className={n === paginaActual ? "is-active" : ""}
                        onClick={() => setPagina(n)}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPagina(paginaActual + 1)}
                    aria-label="Página siguiente"
                  >
                    <Icon name="chevronRight" size={16} />
                  </button>
                </div>
              </div>
            </section>
          </main>

          {/* Detalle de la solicitud */}
          {seleccionada && (
            <aside className="detail" aria-label="Detalle de la solicitud">
              <div className="detail__head">
                <h2>
                  <img style={{ width: "20px", height: "20px" }} src={houseVerde} alt="Propiedades" /> Detalle de la solicitud
                </h2>
                <button
                  type="button"
                  className="detail__close"
                  onClick={cerrarDetalle}
                  aria-label="Cerrar detalle"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div className="gallery">
                <div
                  className="gallery__main"
                  style={
                    seleccionada.fotos[fotoActiva]
                      ? {
                          backgroundImage: `url(${seleccionada.fotos[fotoActiva]})`,
                        }
                      : undefined
                  }
                >
                  {seleccionada.fotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="gallery__nav gallery__nav--prev"
                        onClick={() => cambiarFoto(-1)}
                        aria-label="Foto anterior"
                      >
                        <Icon name="chevronLeft" size={18} />
                      </button>
                      <button
                        type="button"
                        className="gallery__nav gallery__nav--next"
                        onClick={() => cambiarFoto(1)}
                        aria-label="Foto siguiente"
                      >
                        <Icon name="chevronRight" size={18} />
                      </button>
                    </>
                  )}
                </div>

                <div className="gallery__thumbs">
                  {seleccionada.fotos.slice(0, 3).map((foto, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`gallery__thumb ${i === fotoActiva ? "is-active" : ""}`}
                      style={foto ? { backgroundImage: `url(${foto})` } : undefined}
                      onClick={() => setFotoActiva(i)}
                      aria-label={`Ver foto ${i + 1}`}
                    />
                  ))}
                  {fotosExtra > 0 && (
                    <button
                      type="button"
                      className="gallery__thumb gallery__thumb--more"
                      onClick={() => setFotoActiva(3)}
                    >
                      +{fotosExtra}
                    </button>
                  )}
                </div>
              </div>

              <h3 className="detail__section">
                <img style={{ width: "20px", height: "20px" }} src={houseVerde} alt="Propiedad" /> Detalles:
              </h3>
              <div className="info">
                <div className="info__text">
                  <strong>{seleccionada.titulo}</strong>
                  <p>{seleccionada.descripcion}</p>
                </div>
                <ul className="info__list">
                  <li>
                    <Icon name="tag" size={18} /> {seleccionada.tipo}
                  </li>
                  <li>
                    <Icon name="dollar" size={18} /> {seleccionada.precio}
                  </li>
                  <li>
                    <Icon name="pin" size={18} /> {seleccionada.ubicacionCompleta}
                  </li>
                  <li>
                    <Icon name="bed" size={18} /> {seleccionada.habitaciones} Habitaciones
                  </li>
                  <li>
                    <Icon name="bath" size={18} /> {seleccionada.banos} Baños
                  </li>
                  <li>
                    <Icon name="area" size={18} /> {seleccionada.area} m²
                  </li>
                </ul>
              </div>

              <h3 className="detail__section detail__section--divided">
                <Icon name="user" size={20} /> Información del solicitante:
              </h3>
              <ul className="contact">
                <li>
                  <Icon name="user" size={18} /> {seleccionada.solicitante}
                </li>
                <li>
                  <Icon name="mail" size={18} /> {seleccionada.email}
                </li>
                <li>
                  <Icon name="phone" size={18} /> {seleccionada.telefono}
                </li>
              </ul>

              <h3 className="detail__section detail__section--divided">
                <Icon name="checkCircle" size={20} /> Acciones
              </h3>
              <div className="actions">
                <button
                  type="button"
                  className={`btn-approve ${accion === "aprobar" ? "is-active" : ""}`}
                  onClick={() => setAccion("aprobar")}
                >
                  <Icon name="check" size={18} /> Aprobar solicitud
                </button>
                <button
                  type="button"
                  className={`btn-reject ${accion === "rechazar" ? "is-active" : ""}`}
                  onClick={() => setAccion("rechazar")}
                >
                  <Icon name="x" size={18} /> Rechazar solicitud
                </button>
              </div>

              {accion === "rechazar" && (
                <label className="reason">
                  <span>Motivo del rechazo (opcional)</span>
                  <textarea
                    rows={3}
                    placeholder="Ej: Información incompleta en la descripción..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                </label>
              )}

              <div className="detail__footer">
                <button type="button" className="btn-cancel" onClick={cerrarDetalle}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-send"
                  disabled={!accion}
                  onClick={enviar}
                >
                  Enviar
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;