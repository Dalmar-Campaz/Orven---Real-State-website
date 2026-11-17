import { Link } from "react-router-dom";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar";
import { usePropiedades } from "../../context/PropiedadesContext";
import bañosIcon from "../../assets/icons/baños.png";
import habitacionesIcon from "../../assets/icons/habitaciones.png";
import tamañoIcon from "../../assets/icons/tamaño.png";
import ubicacionIcon from "../../assets/icons/ubicacion.png";
import addFavIcon from "../../assets/icons/add-fav.png";
import shieldCheckIcon from "../../assets/icons/shield-check.png";
import gridIcon from "../../assets/icons/layout-grid.png";
import { formatoPrecio, ubicacionCorta } from "../../utils/formato";
import "./Propiedades.css";

export default function Propiedades() {
  const { propiedades } = usePropiedades();
  const totalPropiedades = propiedades.length;

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
                <button className="is-selected" type="button" disabled aria-pressed="true">
                  Todas
                </button>
                <button type="button" disabled title="Los filtros estarán disponibles en la Fase 3.">
                  Venta
                </button>
                <button
                  type="button"
                  disabled
                  title="Arriendo no está contemplado en el modelo actual."
                >
                  Arriendo
                </button>
              </div>

              <p className="catalog-trust">
                <img src={shieldCheckIcon} alt="" />
                Propiedades revisadas por nuestro equipo
              </p>
            </div>

            <div className="catalog-filter-grid">
              <div className="catalog-field">
                <label htmlFor="catalog-location">Ubicación</label>
                <input
                  id="catalog-location"
                  type="text"
                  placeholder="Ciudad, sector o barrio"
                  disabled
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-type">Tipo de propiedad</label>
                <select id="catalog-type" defaultValue="" disabled>
                  <option value="">Todos los tipos</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                </select>
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-price-min">Precio mínimo</label>
                <input id="catalog-price-min" type="text" placeholder="$ Sin mínimo" disabled />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-price-max">Precio máximo</label>
                <input id="catalog-price-max" type="text" placeholder="$ Sin máximo" disabled />
              </div>

              <div className="catalog-field">
                <label htmlFor="catalog-bedrooms">Habitaciones</label>
                <select id="catalog-bedrooms" defaultValue="" disabled>
                  <option value="">Cualquiera</option>
                  <option value="1">1 o más</option>
                  <option value="2">2 o más</option>
                  <option value="3">3 o más</option>
                  <option value="4">4 o más</option>
                </select>
              </div>

              <button className="catalog-search" type="button" disabled>
                <span aria-hidden="true">⌕</span>
                Buscar
              </button>
            </div>

            <div className="catalog-filters__bottom">
              <button className="catalog-more-filters" type="button" disabled>
                <span aria-hidden="true">☷</span>
                Más filtros
              </button>
              <button className="catalog-clear-filters" type="button" disabled>
                Limpiar filtros
              </button>
            </div>

            <p className="catalog-filters__notice">
              La búsqueda y los filtros estarán disponibles en la Fase 3.
            </p>
          </section>

          <section className="catalog-results" id="propiedades" aria-labelledby="catalog-results-title">
            <div className="catalog-results__heading">
              <div>
                <h2 id="catalog-results-title">Propiedades disponibles</h2>
                <p>
                  {totalPropiedades}{" "}
                  {totalPropiedades === 1 ? "propiedad encontrada" : "propiedades encontradas"}
                  {" · "}
                  Mostrando {totalPropiedades === 0 ? "0" : "1–" + totalPropiedades}
                </p>
              </div>

              <div className="catalog-view-controls">
                <label htmlFor="catalog-sort">Ordenar por:</label>
                <select id="catalog-sort" defaultValue="recent" disabled>
                  <option value="recent">Más recientes</option>
                </select>

                <button type="button" className="catalog-view-button is-active" disabled aria-label="Vista de cuadrícula">
                  <img src={gridIcon} alt="" />
                </button>

                <button type="button" className="catalog-view-button" disabled aria-label="Vista de mapa">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
                    <path d="M9 3v15M15 6v15" />
                  </svg>
                </button>
              </div>
            </div>

            {totalPropiedades > 0 ? (
              <div className="catalog-grid">
                {propiedades.map((propiedad) => (
                  <article className="catalog-card" key={propiedad.id}>
                    <div className="catalog-card__image">
                      {propiedad.imagenes[0] ? (
                        <img src={propiedad.imagenes[0]} alt={propiedad.titulo} />
                      ) : (
                        <div className="catalog-card__no-image">
                          Imagen no disponible
                        </div>
                      )}

                      {propiedad.destacada && (
                        <span className="catalog-card__featured">Destacada</span>
                      )}

                      <button
                        className="catalog-card__favorite"
                        type="button"
                        disabled
                        title="Los favoritos estarán disponibles en la Fase 3."
                        aria-label="Agregar a favoritos; función disponible en la Fase 3"
                      >
                        <img src={addFavIcon} alt="" />
                      </button>
                    </div>

                    <div className="catalog-card__body">
                      <div className="catalog-card__meta">
                        <span>{propiedad.tipo}</span>
                        <span>ORV-{String(propiedad.id).padStart(4, "0")}</span>
                      </div>

                      <h3>{propiedad.titulo}</h3>

                      <p className="catalog-card__location">
                        <img src={ubicacionIcon} alt="" />
                        {ubicacionCorta(propiedad)}, {propiedad.departamento}
                      </p>

                      <p className="catalog-card__price">
                        {formatoPrecio(propiedad.precio)}
                      </p>

                      <div className="catalog-card__features" aria-label="Características de la propiedad">
                        <span>
                          <img src={habitacionesIcon} alt="" />
                          {propiedad.habitaciones} hab.
                        </span>
                        <span>
                          <img src={bañosIcon} alt="" />
                          {propiedad.banos} baños
                        </span>
                        <span>
                          <img src={tamañoIcon} alt="" />
                          {propiedad.area} m²
                        </span>
                      </div>

                      <div className="catalog-card__footer">
                        <button
                          type="button"
                          disabled
                          title="El detalle de cada propiedad se implementará en la Fase 3."
                        >
                          Ver propiedad
                        </button>
                        <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <h3>Aún no hay propiedades publicadas</h3>
                <p>
                  Cuando una solicitud sea aprobada por el administrador,
                  la propiedad aparecerá aquí.
                </p>
                <Link to="/formulario">Registrar una propiedad</Link>
              </div>
            )}

            <nav className="catalog-pagination" aria-label="Paginación de propiedades">
              <button type="button" disabled aria-label="Página anterior">‹</button>
              <button type="button" className="is-current" disabled aria-current="page">
                1
              </button>
              <button type="button" disabled aria-label="Página siguiente">›</button>
              <span>La paginación estará disponible en la Fase 3.</span>
            </nav>
          </section>
        </div>
      </main>
    </div>
  );
}
