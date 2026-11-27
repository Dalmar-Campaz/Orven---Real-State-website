import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar";
import { usePropiedades } from "../../context/PropiedadesContext";
import { formatoPrecio } from "../../utils/formato";
import shieldCheckIcon from "../../assets/icons/shield-check.png";
import gridIcon from "../../assets/icons/layout-grid.png";
import TarjetaPropiedad from "../../components/TarjetaPropiedad/TarjetaPropiedad";
import "./Propiedades.css";

const PROPIEDADES_POR_PAGINA = 8;

export default function Propiedades() {
  const { propiedades, agentes, favoritos, alternarFavorito } = usePropiedades();
  const [searchParams] = useSearchParams();
  const [ubicacion, setUbicacion] = useState(searchParams.get("ciudad") ?? "");
  const [tipo, setTipo] = useState(searchParams.get("tipo") ?? "Todos");
  const [operacion, setOperacion] = useState("Todas");
  const [precioMinimo, setPrecioMinimo] = useState(searchParams.get("min") ?? "");
  const [precioMaximo, setPrecioMaximo] = useState(searchParams.get("max") ?? "");
  const [habitaciones, setHabitaciones] = useState("");
  const [orden, setOrden] = useState("recent");
  const [pagina, setPagina] = useState(1);

  // Los valores de los filtros se calculan desde el archivo datos.json.
  const tipos = [...new Set(propiedades.map((propiedad) => propiedad.tipo))].sort();
  const operaciones = [...new Set(propiedades.map((propiedad) => propiedad.operacion))].sort();
  const opcionesHabitaciones = [
    ...new Set(propiedades.map((propiedad) => propiedad.habitaciones)),
  ].sort((a, b) => a - b);

  const propiedadesFiltradas = useMemo(() => {
    const minimo = precioMinimo.trim() === "" ? 0 : Number(precioMinimo);
    const maximo = precioMaximo.trim() === "" ? Number.POSITIVE_INFINITY : Number(precioMaximo);
    const textoUbicacion = ubicacion.trim().toLocaleLowerCase();

    return propiedades
      .filter((propiedad) => {
        const textoPropiedad = [
          propiedad.titulo,
          propiedad.ciudad,
          propiedad.departamento,
          propiedad.sector ?? "",
        ].join(" ").toLocaleLowerCase();

        return !textoUbicacion || textoPropiedad.includes(textoUbicacion);
      })
      .filter((propiedad) => tipo === "Todos" || propiedad.tipo === tipo)
      .filter((propiedad) => operacion === "Todas" || propiedad.operacion === operacion)
      .filter((propiedad) => propiedad.precio >= minimo && propiedad.precio <= maximo)
      .filter(
        (propiedad) =>
          habitaciones === "" || propiedad.habitaciones >= Number(habitaciones),
      )
      .sort((a, b) => {
        switch (orden) {
          case "price-asc":
            return a.precio - b.precio;
          case "price-desc":
            return b.precio - a.precio;
          case "area-desc":
            return b.area - a.area;
          case "recent":
          default:
            return b.fecha.localeCompare(a.fecha);
        }
      });
  }, [
    propiedades,
    ubicacion,
    tipo,
    operacion,
    precioMinimo,
    precioMaximo,
    habitaciones,
    orden,
  ]);

  const totalPropiedades = propiedades.length;
  const totalResultados = propiedadesFiltradas.length;
  const totalPaginas = Math.max(
    1,
    Math.ceil(totalResultados / PROPIEDADES_POR_PAGINA),
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const indiceInicial = (paginaActual - 1) * PROPIEDADES_POR_PAGINA;
  const propiedadesVisibles = propiedadesFiltradas.slice(
    indiceInicial,
    indiceInicial + PROPIEDADES_POR_PAGINA,
  );

  // reduce() calcula una estadística agregada del conjunto filtrado.
  const precioPromedio =
    propiedadesFiltradas.reduce(
      (total, propiedad) => total + propiedad.precio,
      0,
    ) / Math.max(totalResultados, 1);

  const buscar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPagina(1);
    document
      .getElementById("catalog-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const limpiarFiltros = () => {
    setUbicacion("");
    setTipo("Todos");
    setOperacion("Todas");
    setPrecioMinimo("");
    setPrecioMaximo("");
    setHabitaciones("");
    setOrden("recent");
    setPagina(1);
  };

  const actualizarFiltro = (actualizar: () => void) => {
    actualizar();
    setPagina(1);
  };

  return (
    <div className="catalog-page">
      <HomeNavbar activePage="properties" />

      <main className="catalog-main">
        <section className="catalog-hero" aria-labelledby="catalog-title">
          <div className="catalog-hero__content">
            <Link className="catalog-hero__back" to="/">
              <span aria-hidden="true">←</span>
              Volver al inicio
            </Link>
            <h1 id="catalog-title">Encuentra tu próxima propiedad</h1>
            <p>Explora espacios únicos para vivir o invertir.</p>
            <p className="catalog-hero__description">
              Encuentra el lugar que se adapta a tu estilo de vida con Orven.
            </p>
          </div>
        </section>

        <div className="catalog-shell">
          <section className="catalog-filters" aria-label="Filtros de propiedades">
            <div className="catalog-filters__top">
              <div className="catalog-tabs" aria-label="Tipo de operación">
                <button
                  className={operacion === "Todas" ? "is-selected" : ""}
                  type="button"
                  onClick={() => actualizarFiltro(() => setOperacion("Todas"))}
                  aria-pressed={operacion === "Todas"}
                >
                  Todas
                </button>
                {operaciones.map((opcion) => (
                  <button
                    key={opcion}
                    className={operacion === opcion ? "is-selected" : ""}
                    type="button"
                    onClick={() => actualizarFiltro(() => setOperacion(opcion))}
                    aria-pressed={operacion === opcion}
                  >
                    {opcion}
                  </button>
                ))}
              </div>

              <p className="catalog-trust">
                <img src={shieldCheckIcon} alt="" />
                Propiedades revisadas por nuestro equipo
              </p>
            </div>

            <form className="catalog-filter-grid" onSubmit={buscar}>
              <div className="catalog-field">
                <label htmlFor="catalog-location">Ubicación o nombre</label>
                <input
                  id="catalog-location"
                  type="search"
                  placeholder="Ciudad, sector o inmueble"
                  value={ubicacion}
                  onChange={(event) =>
                    actualizarFiltro(() => setUbicacion(event.target.value))
                  }
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-type">Tipo de propiedad</label>
                <select
                  id="catalog-type"
                  value={tipo}
                  onChange={(event) =>
                    actualizarFiltro(() => setTipo(event.target.value))
                  }
                >
                  <option value="Todos">Todos los tipos</option>
                  {tipos.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-price-min">Precio mínimo (COP)</label>
                <input
                  id="catalog-price-min"
                  type="number"
                  min="0"
                  step="1000000"
                  placeholder="Sin mínimo"
                  value={precioMinimo}
                  onChange={(event) =>
                    actualizarFiltro(() => setPrecioMinimo(event.target.value))
                  }
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-price-max">Precio máximo (COP)</label>
                <input
                  id="catalog-price-max"
                  type="number"
                  min="0"
                  step="1000000"
                  placeholder="Sin máximo"
                  value={precioMaximo}
                  onChange={(event) =>
                    actualizarFiltro(() => setPrecioMaximo(event.target.value))
                  }
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-bedrooms">Habitaciones</label>
                <select
                  id="catalog-bedrooms"
                  value={habitaciones}
                  onChange={(event) =>
                    actualizarFiltro(() => setHabitaciones(event.target.value))
                  }
                >
                  <option value="">Cualquiera</option>
                  {opcionesHabitaciones.map((cantidad) => (
                    <option key={cantidad} value={cantidad}>{cantidad} o más</option>
                  ))}
                </select>
              </div>

              <button className="catalog-search" type="submit">
                <span aria-hidden="true">⌕</span>
                Buscar
              </button>
            </form>

            <div className="catalog-filters__bottom">
              <span className="catalog-active-filters">
                Los filtros se combinan: cada resultado cumple todos los criterios activos.
              </span>
              <button className="catalog-clear-filters" type="button" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          </section>

          <section
            className="catalog-results"
            id="catalog-results"
            aria-labelledby="catalog-results-title"
          >
            <div className="catalog-results__heading">
              <div>
                <h2 id="catalog-results-title">Propiedades disponibles</h2>
                <p>
                  {totalResultados} de {totalPropiedades} propiedades encontradas
                  {" · "}
                  Mostrando{" "}
                  {totalResultados === 0
                    ? "0"
                    : `${indiceInicial + 1}–${Math.min(
                        indiceInicial + propiedadesVisibles.length,
                        totalResultados,
                      )}`}
                </p>
                {totalResultados > 0 && (
                  <p className="catalog-average">
                    Precio promedio de la selección: {formatoPrecio(precioPromedio)}
                  </p>
                )}
              </div>

              <div className="catalog-view-controls">
                <label htmlFor="catalog-sort">Ordenar por:</label>
                <select
                  id="catalog-sort"
                  value={orden}
                  onChange={(event) =>
                    actualizarFiltro(() => setOrden(event.target.value))
                  }
                >
                  <option value="recent">Más recientes</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="area-desc">Mayor área</option>
                </select>
                <button
                  type="button"
                  className="catalog-view-button is-active"
                  disabled
                  aria-label="Vista de cuadrícula seleccionada"
                >
                  <img src={gridIcon} alt="" />
                </button>
                <button
                  type="button"
                  className="catalog-view-button"
                  disabled
                  title="La vista de mapa no forma parte de esta entrega."
                  aria-label="Vista de mapa no disponible"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
                    <path d="M9 3v15M15 6v15" />
                  </svg>
                </button>
              </div>
            </div>

            {propiedadesVisibles.length > 0 ? (
              <div className="catalog-grid">
                {propiedadesVisibles.map((propiedad) => (
                  <TarjetaPropiedad
                    key={propiedad.id}
                    propiedad={propiedad}
                    agente={agentes.find((agente) => agente.id === propiedad.agenteId)}
                    favoritos={favoritos}
                    onToggleFavorito={alternarFavorito}
                  />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <h3>No encontramos propiedades con esos filtros</h3>
                <p>Prueba cambiando la ubicación, el tipo de inmueble o el rango de precio.</p>
                <button type="button" onClick={limpiarFiltros}>Limpiar filtros</button>
              </div>
            )}

            {totalResultados > PROPIEDADES_POR_PAGINA && (
              <nav className="catalog-pagination" aria-label="Paginación de propiedades">
                <button
                  type="button"
                  onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                  disabled={paginaActual === 1}
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                <span aria-current="page">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPagina((actual) => Math.min(totalPaginas, actual + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  aria-label="Página siguiente"
                >
                  ›
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
