import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "./Propiedades.css";
import logo from "./assets/orven-logo.png";
// Foto del banner superior (la maqueta no la trae como archivo suelto).
import banner from "./assets/propiedades-banner.jpg";

/* ---------- Tipos ----------
 * Estos son los campos que usa la página. Si tu archivo de datos usa otros
 * nombres, adáptalos con un .map() al pasar la prop (ver nota al final).
 */
export interface Propiedad {
  id: number | string;
  tipo: string; // Casa, Apartamento, Casa campestre, Penthouse...
  titulo: string;
  sector: string; // El Poblado
  ciudad: string; // Medellín
  precio: number; // en pesos, sin formato
  operacion: "Venta" | "Arriendo";
  habitaciones: number;
  banos: number;
  area: number; // m²
  imagen: string;
  destacada?: boolean;
  codigo?: string; // CN-1024; si no existe se genera a partir del id
  fecha?: string; // ISO (2026-11-06) para ordenar por "Más recientes"
}

interface Props {
  /** La misma lista de propiedades de donde salen las destacadas del inicio. */
  propiedades: Propiedad[];
}

type Operacion = "Todas" | "Venta" | "Arriendo";
type Orden = "recientes" | "precio-asc" | "precio-desc" | "area-desc";

interface Filtros {
  ubicacion: string;
  tipo: string;
  precioMin: string; // solo dígitos
  precioMax: string;
  habitaciones: string; // "" | "1".."5"
  banos: string;
  areaMin: string;
  soloDestacadas: boolean;
}

const FILTROS_VACIOS: Filtros = {
  ubicacion: "",
  tipo: "",
  precioMin: "",
  precioMax: "",
  habitaciones: "",
  banos: "",
  areaMin: "",
  soloDestacadas: false,
};

const POR_PAGINA = 6;
const OPERACIONES: Operacion[] = ["Todas", "Venta", "Arriendo"];

const ORDENES: { value: Orden; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "area-desc", label: "Mayor área" },
];

const NAV = [
  { label: "Inicio", to: "/" },
  { label: "Propiedades", to: "/propiedades" },
  { label: "Sobre Nosotros", to: "/nosotros" },
  { label: "Contacto", to: "/contacto" },
];

/* ---------- Utilidades ---------- */
const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const formatoPrecio = (n: number) => `$ ${n.toLocaleString("es-CO")}`;
const soloDigitos = (v: string) => v.replace(/\D/g, "").slice(0, 13);
const conMiles = (v: string) => (v ? Number(v).toLocaleString("es-CO") : "");

const codigoDe = (p: Propiedad) =>
  p.codigo ?? `CN-${String(p.id).padStart(4, "0")}`;

/* ---------- Iconos ---------- */
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const Icon = ({ children, size = 18 }: { children: ReactNode; size?: number }) => (
  <svg {...base} width={size} height={size}>
    {children}
  </svg>
);

const IUser = () => (
  <Icon size={22}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M5 20c.8-3.6 3.7-5.5 7-5.5s6.2 1.9 7 5.5" />
  </Icon>
);
const IArrowLeft = () => (
  <Icon size={16}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
const IArrowRight = () => (
  <Icon size={17}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
const IChevron = () => (
  <Icon size={15}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
const IShield = () => (
  <Icon size={17}>
    <path d="M12 3 5 6v5.5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5V6l-7-3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Icon>
);
const ISearch = () => (
  <Icon size={17}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icon>
);
const ISliders = () => (
  <Icon size={17}>
    <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="17" r="2" />
  </Icon>
);
const IPin = () => (
  <Icon size={16}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
);
const IBed = () => (
  <Icon size={17}>
    <path d="M3 18V7M3 14h18v4M21 14v-2.5a2.5 2.5 0 0 0-2.5-2.5H11v5" />
    <circle cx="7" cy="11" r="1.6" />
  </Icon>
);
const IBath = () => (
  <Icon size={17}>
    <path d="M3 12h18v2.5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V12ZM6 12V6.5a2 2 0 0 1 3.5-1.3M7 19l-1 2m11-2 1 2" />
  </Icon>
);
const IArea = () => (
  <Icon size={17}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icon>
);
const IGrid = () => (
  <Icon size={18}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </Icon>
);
const IMap = () => (
  <Icon size={18}>
    <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6ZM9 4v14M15 6v14" />
  </Icon>
);
const IHeart = ({ filled }: { filled: boolean }) => (
  <svg {...base} width={18} height={18} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.300a4.300 4.300 0 0 1 7.500 2.500C19.500 15.400 12 20 12 20Z" />
  </svg>
);

/* ---------- Campo select simple ---------- */
function SelectCampo({
  value,
  onChange,
  placeholder,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="pr-select">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={value ? "" : "is-placeholder"}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <IChevron />
    </div>
  );
}

/* ---------- Componente ---------- */
export function Propiedades({ propiedades }: Props) {
  const navigate = useNavigate();
  const resultadosRef = useRef<HTMLElement>(null);

  const [operacion, setOperacion] = useState<Operacion>("Todas");
  const [borrador, setBorrador] = useState<Filtros>(FILTROS_VACIOS); // lo que se escribe
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS); // lo que se aplica
  const [masFiltros, setMasFiltros] = useState(false);
  const [orden, setOrden] = useState<Orden>("recientes");
  const [pagina, setPagina] = useState(1);
  const [favoritos, setFavoritos] = useState<Set<string>>(() => {
    try {
      const guardado = localStorage.getItem("orven:favoritos");
      return new Set<string>(guardado ? JSON.parse(guardado) : []);
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("orven:favoritos", JSON.stringify([...favoritos]));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [favoritos]);

  const tipos = useMemo(
    () =>
      Array.from(new Set(propiedades.map((p) => p.tipo)))
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((t) => ({ value: t, label: t })),
    [propiedades]
  );

  const setB = <K extends keyof Filtros>(k: K, v: Filtros[K]) =>
    setBorrador((prev) => ({ ...prev, [k]: v }));

  const buscar = () => {
    setFiltros(borrador);
    setPagina(1);
  };

  const limpiar = () => {
    setOperacion("Todas");
    setBorrador(FILTROS_VACIOS);
    setFiltros(FILTROS_VACIOS);
    setPagina(1);
  };

  /* Filtrado + orden */
  const resultado = useMemo(() => {
    const q = normalizar(filtros.ubicacion);
    const min = filtros.precioMin ? Number(filtros.precioMin) : 0;
    const max = filtros.precioMax ? Number(filtros.precioMax) : Infinity;

    const lista = propiedades.filter((p) => {
      if (operacion !== "Todas" && p.operacion !== operacion) return false;
      if (q && !normalizar(`${p.sector} ${p.ciudad} ${p.titulo}`).includes(q)) return false;
      if (filtros.tipo && p.tipo !== filtros.tipo) return false;
      if (p.precio < min || p.precio > max) return false;
      if (filtros.habitaciones && p.habitaciones < Number(filtros.habitaciones)) return false;
      if (filtros.banos && p.banos < Number(filtros.banos)) return false;
      if (filtros.areaMin && p.area < Number(filtros.areaMin)) return false;
      if (filtros.soloDestacadas && !p.destacada) return false;
      return true;
    });

    return [...lista].sort((a, b) => {
      switch (orden) {
        case "precio-asc":
          return a.precio - b.precio;
        case "precio-desc":
          return b.precio - a.precio;
        case "area-desc":
          return b.area - a.area;
        default:
          return (b.fecha ?? "").localeCompare(a.fecha ?? "");
      }
    });
  }, [propiedades, operacion, filtros, orden]);

  const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visibles = resultado.slice(inicio, inicio + POR_PAGINA);

  const irAPagina = (n: number) => {
    setPagina(n);
    resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const alternarFavorito = (id: string) =>
    setFavoritos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="pr">
      {/* Navegación */}
      <header className="pr-nav">
        <img src={logo} alt="Orven" className="pr-nav__logo" onClick={() => navigate("/")} />
        <nav>
          {NAV.map((item) => (
            <button
              key={item.label}
              type="button"
              className={item.label === "Propiedades" ? "is-active" : ""}
              onClick={() => navigate(item.to)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <span className="pr-nav__avatar" aria-label="Mi cuenta">
          <IUser />
        </span>
      </header>

      {/* Banner */}
      <section className="pr-banner" style={{ backgroundImage: `url(${banner})` }}>
        <div className="pr-banner__overlay" />
        <div className="pr-banner__content">
          <button type="button" className="pr-back" onClick={() => navigate("/")}>
            <IArrowLeft /> Volver al inicio
          </button>
          <h1>Encuentra tu próxima propiedad</h1>
          <p>
            Explora espacios únicos para vivir o invertir.
            <br />
            Encuentra el lugar que se adapta a tu estilo de vida con Orven.
          </p>
        </div>
      </section>

      <main className="pr-main">
        {/* Filtros */}
        <section className="pr-filters">
          <div className="pr-filters__top">
            <div className="pr-tabs" role="tablist">
              {OPERACIONES.map((op) => (
                <button
                  key={op}
                  type="button"
                  role="tab"
                  aria-selected={operacion === op}
                  className={operacion === op ? "is-active" : ""}
                  onClick={() => {
                    setOperacion(op);
                    setPagina(1);
                  }}
                >
                  {op}
                </button>
              ))}
            </div>
            <span className="pr-verified">
              <IShield /> Propiedades revisadas por nuestro equipo
            </span>
          </div>

          <form
            className="pr-filters__grid"
            onSubmit={(e) => {
              e.preventDefault();
              buscar();
            }}
          >
            <label className="pr-field pr-field--wide">
              <span>Ubicación</span>
              <input
                type="text"
                placeholder="Ciudad, sector o barrio"
                value={borrador.ubicacion}
                onChange={(e) => setB("ubicacion", e.target.value)}
              />
            </label>

            <div className="pr-field">
              <span>Tipo de propiedad</span>
              <SelectCampo
                label="Tipo de propiedad"
                value={borrador.tipo}
                onChange={(v) => setB("tipo", v)}
                placeholder="Todos los tipos"
                options={tipos}
              />
            </div>

            <label className="pr-field">
              <span>Precio mínimo</span>
              <div className="pr-money">
                <i>$</i>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Sin mínimo"
                  value={conMiles(borrador.precioMin)}
                  onChange={(e) => setB("precioMin", soloDigitos(e.target.value))}
                />
              </div>
            </label>

            <label className="pr-field">
              <span>Precio máximo</span>
              <div className="pr-money">
                <i>$</i>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Sin máximo"
                  value={conMiles(borrador.precioMax)}
                  onChange={(e) => setB("precioMax", soloDigitos(e.target.value))}
                />
              </div>
            </label>

            <div className="pr-field">
              <span>Habitaciones</span>
              <SelectCampo
                label="Habitaciones"
                value={borrador.habitaciones}
                onChange={(v) => setB("habitaciones", v)}
                placeholder="Cualquiera"
                options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` }))}
              />
            </div>

            <button type="submit" className="pr-search">
              <ISearch /> Buscar
            </button>

            {masFiltros && (
              <div className="pr-extra">
                <div className="pr-field">
                  <span>Baños (mínimo)</span>
                  <SelectCampo
                    label="Baños"
                    value={borrador.banos}
                    onChange={(v) => setB("banos", v)}
                    placeholder="Cualquiera"
                    options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+` }))}
                  />
                </div>
                <label className="pr-field">
                  <span>Área mínima (m²)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej. 100"
                    value={borrador.areaMin}
                    onChange={(e) => setB("areaMin", e.target.value.replace(/\D/g, "").slice(0, 5))}
                  />
                </label>
                <label className="pr-check">
                  <input
                    type="checkbox"
                    checked={borrador.soloDestacadas}
                    onChange={(e) => setB("soloDestacadas", e.target.checked)}
                  />
                  <span className="pr-check__box" />
                  Solo propiedades destacadas
                </label>
              </div>
            )}
          </form>

          <div className="pr-filters__bottom">
            <button type="button" className="pr-linkbtn" onClick={() => setMasFiltros((v) => !v)}>
              <ISliders /> {masFiltros ? "Menos filtros" : "Más filtros"}
            </button>
            <button type="button" className="pr-linkbtn pr-linkbtn--muted" onClick={limpiar}>
              Limpiar filtros
            </button>
          </div>
        </section>

        {/* Resultados */}
        <section className="pr-results" ref={resultadosRef}>
          <div className="pr-results__head">
            <div>
              <h2>Propiedades disponibles</h2>
              <p>
                {resultado.length} {resultado.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
                {resultado.length > 0 &&
                  ` · Mostrando ${inicio + 1}–${Math.min(inicio + POR_PAGINA, resultado.length)}`}
              </p>
            </div>
            <div className="pr-results__tools">
              <span>Ordenar por:</span>
              <div className="pr-select pr-select--sort">
                <select
                  value={orden}
                  onChange={(e) => {
                    setOrden(e.target.value as Orden);
                    setPagina(1);
                  }}
                  aria-label="Ordenar por"
                >
                  {ORDENES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <IChevron />
              </div>
              <button type="button" className="pr-view is-active" aria-label="Vista en cuadrícula">
                <IGrid />
              </button>
              <button
                type="button"
                className="pr-view"
                aria-label="Vista de mapa (próximamente)"
                title="Próximamente"
                disabled
              >
                <IMap />
              </button>
            </div>
          </div>

          {visibles.length === 0 ? (
            <div className="pr-empty">
              <h3>No encontramos propiedades con esos filtros</h3>
              <p>Prueba ampliando la búsqueda o limpiando los filtros.</p>
              <button type="button" className="pr-search" onClick={limpiar}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <ul className="pr-grid">
              {visibles.map((p) => {
                const id = String(p.id);
                const esFavorito = favoritos.has(id);
                return (
                  <li key={id} className="pr-card">
                    <div className="pr-card__img" style={{ backgroundImage: `url(${p.imagen})` }}>
                      {p.destacada && <span className="pr-card__tag">Destacada</span>}
                      <button
                        type="button"
                        className={`pr-card__fav ${esFavorito ? "is-on" : ""}`}
                        onClick={() => alternarFavorito(id)}
                        aria-pressed={esFavorito}
                        aria-label={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
                      >
                        <IHeart filled={esFavorito} />
                      </button>
                    </div>

                    <div className="pr-card__body">
                      <div className="pr-card__meta">
                        <span>{p.tipo}</span>
                        <span>{codigoDe(p)}</span>
                      </div>
                      <h3>{p.titulo}</h3>
                      <p className="pr-card__loc">
                        <IPin /> {p.sector}, {p.ciudad}
                      </p>
                      <p className="pr-card__price">{formatoPrecio(p.precio)}</p>
                      <ul className="pr-card__specs">
                        <li>
                          <IBed /> {p.habitaciones} hab.
                        </li>
                        <li>
                          <IBath /> {p.banos} baños
                        </li>
                        <li>
                          <IArea /> {p.area} m²
                        </li>
                      </ul>
                      <button
                        type="button"
                        className="pr-card__link"
                        onClick={() => navigate(`/propiedades/${id}`)}
                      >
                        Ver propiedad <IArrowRight />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {resultado.length > POR_PAGINA && (
            <nav className="pr-pager" aria-label="Paginación">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => irAPagina(paginaActual - 1)}
                aria-label="Página anterior"
              >
                <IArrowLeft />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n === paginaActual ? "is-active" : ""}
                  aria-current={n === paginaActual ? "page" : undefined}
                  onClick={() => irAPagina(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={paginaActual === totalPaginas}
                onClick={() => irAPagina(paginaActual + 1)}
                aria-label="Página siguiente"
              >
                <IArrowRight />
              </button>
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}

export default Propiedades;

/* ---------- Cómo conectar tus datos ----------
 *
 * En la ruta/página que renderiza este componente, pásale la MISMA lista que
 * usa el inicio para las destacadas:
 *
 *   import { propiedades } from "../../data/propiedades"; // tu archivo real
 *   <Propiedades propiedades={propiedades} />
 *
 * Si tus objetos tienen otros nombres de campo, adáptalos así:
 *
 *   const lista: Propiedad[] = propiedades.map((p) => ({
 *     id: p.id,
 *     tipo: p.type,
 *     titulo: p.title,
 *     sector: p.neighborhood,
 *     ciudad: p.city,
 *     precio: p.price,
 *     operacion: p.operation,
 *     habitaciones: p.bedrooms,
 *     banos: p.bathrooms,
 *     area: p.area,
 *     imagen: p.image,
 *     destacada: p.featured,
 *   }));
 */