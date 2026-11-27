import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePropiedades } from "../../context/PropiedadesContext";
import "./Home.css";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar";
import logo from "../../assets/Logo.png";
import TarjetaPropiedad from "../../components/TarjetaPropiedad/TarjetaPropiedad";
import { formatoPrecio } from "../../utils/formato";

function Home() {
  const navigate = useNavigate();
  const { propiedades, agentes, favoritos, alternarFavorito } = usePropiedades();
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [rangoPrecio, setRangoPrecio] = useState("");

  const propiedadesDestacadas = propiedades.filter(
    (propiedad) => propiedad.destacada,
  );
  const ciudades = [...new Set(propiedades.map((propiedad) => propiedad.ciudad))].sort();
  const tipos = [...new Set(propiedades.map((propiedad) => propiedad.tipo))].sort();
  const precioMaximo = Math.max(0, ...propiedades.map((propiedad) => propiedad.precio));
  const tercioPrecio = Math.max(
    100000000,
    Math.ceil(precioMaximo / 3 / 100000000) * 100000000,
  );
  const rangosDisponibles = [
    { valor: `0-${tercioPrecio}`, etiqueta: `Hasta ${formatoPrecio(tercioPrecio)}` },
    {
      valor: `${tercioPrecio}-${tercioPrecio * 2}`,
      etiqueta: `${formatoPrecio(tercioPrecio)} a ${formatoPrecio(tercioPrecio * 2)}`,
    },
    { valor: `${tercioPrecio * 2}-`, etiqueta: `Más de ${formatoPrecio(tercioPrecio * 2)}` },
  ];
  const agenteDestacado = agentes[0];

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (ciudadSeleccionada) params.set("ciudad", ciudadSeleccionada);
    if (tipoSeleccionado) params.set("tipo", tipoSeleccionado);
    if (rangoPrecio) {
      const [minimo, maximo] = rangoPrecio.split("-");
      if (minimo) params.set("min", minimo);
      if (maximo) params.set("max", maximo);
    }

    const query = params.toString();
    navigate(query ? `/propiedades?${query}` : "/propiedades");
  };

  const handleClickFormulario = () => navigate("/formulario");
  const handleClickPropiedades = () => navigate("/propiedades");

  return (
    <div className="orven-page">
      <HomeNavbar />

      <main>
        <section className="hero" id="inicio" aria-labelledby="home-title">
          <div className="hero-content">
            <h1 id="home-title">
              Encuentra el hogar
              <br />
              de tus sueños
            </h1>
            <p className="hero-subtitle">
              Las mejores propiedades, en los mejores lugares.
            </p>
            <p className="hero-description">
              Tu próximo hogar está más cerca de lo que piensas.
            </p>
          </div>
        </section>

        <section className="search-section" aria-label="Buscar propiedades">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="3" />
              </svg>
              <div className="field-content">
                <label htmlFor="location">Ubicación</label>
                <select
                  id="location"
                  value={ciudadSeleccionada}
                  onChange={(event) => setCiudadSeleccionada(event.target.value)}
                >
                  <option value="">Todas las ciudades</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-field">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="3.5,22 21,22 21,10 12,2 3.5,10" />
                <rect x="9.5" y="14" width="5.5" height="8" />
              </svg>
              <div className="field-content">
                <label htmlFor="property-type">Tipo de propiedad</label>
                <select
                  id="property-type"
                  value={tipoSeleccionado}
                  onChange={(event) => setTipoSeleccionado(event.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  {tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-field price-field">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="6" width="20" height="12" />
                <circle cx="7" cy="12.5" r="0.5" fill="currentColor" />
                <circle cx="12" cy="12.5" r="2" />
                <circle cx="17" cy="12.5" r="0.5" fill="currentColor" />
              </svg>
              <div className="field-content">
                <label htmlFor="price">Precio</label>
                <select
                  id="price"
                  value={rangoPrecio}
                  onChange={(event) => setRangoPrecio(event.target.value)}
                >
                  <option value="">Cualquier precio</option>
                  {rangosDisponibles.map((rango) => (
                    <option key={rango.valor} value={rango.valor}>{rango.etiqueta}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="search-button" type="submit">Buscar</button>
          </form>
        </section>

        <section className="properties-section" id="propiedades" aria-labelledby="featured-title">
          <div className="section-heading">
            <h2 id="featured-title">Propiedades Destacadas</h2>
            <button
              type="button"
              className="view-all-button"
              onClick={handleClickPropiedades}
            >
              Ver todas las propiedades <span>→</span>
            </button>
          </div>

          <div className="properties-grid">
            {propiedadesDestacadas.length > 0 ? (
              propiedadesDestacadas.map((propiedad) => (
                <TarjetaPropiedad
                  key={propiedad.id}
                  propiedad={propiedad}
                  agente={agentes.find((agente) => agente.id === propiedad.agenteId)}
                  favoritos={favoritos}
                  onToggleFavorito={alternarFavorito}
                />
              ))
            ) : (
              <p className="properties-empty">
                Por el momento no hay propiedades destacadas.
              </p>
            )}
          </div>
        </section>

        <section className="social-proof" id="nosotros" aria-label="Clientes y agentes de Orven">
          <article className="testimonial">
            <h2>Lo que dicen nuestros clientes</h2>
            <div className="testimonial-content">
              <span className="quote-mark">“</span>
              <div>
                <p className="testimonial-text">
                  Encontramos nuestro hogar soñado con la ayuda del <br />
                  equipo de Orven. El proceso fue sencillo y nos
                  <br />
                  acompañaron en todo momento.
                </p>
                <div className="client">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop"
                    alt="Retrato ilustrativo de una clienta"
                  />
                  <div>
                    <strong>Laura Martínez</strong>
                    <span>Compradora feliz</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="featured-agent">
            <h2>Agentes destacados</h2>
            {agenteDestacado && (
              <div className="agent-card">
                <img
                  className="agent-image"
                  src={agenteDestacado.foto}
                  alt={agenteDestacado.nombre}
                />
                <div className="agent-info">
                  <strong>{agenteDestacado.nombre}</strong>
                  <span>{agenteDestacado.cargo}</span>
                  <div className="agent-rating">
                    <span>{agenteDestacado.especialidad}</span>
                    <small>{agenteDestacado.experiencia} años de experiencia</small>
                  </div>
                </div>
                <span className="contact-agent">Agente destacado</span>
              </div>
            )}
          </article>
        </section>

        <section className="publish-section" id="contacto" aria-labelledby="publish-title">
          <h2 id="publish-title">¿Quieres publicar tu inmueble?</h2>
          <p>
            En Orven te ayudamos a encontrar a las personas ideales para tu
            propiedad. Envíanos tu solicitud y da el primer paso.
          </p>
          <button onClick={handleClickFormulario} className="publish-button">
            Solicitar mi venta
          </button>
        </section>
      </main>

      <footer className="footer">
        <a href="#inicio">
          <img className="logo" src={logo} alt="Orven" />
        </a>
        <div className="footer-bottom">
          <p>© 2026 Orven. Todos los derechos reservados.</p>
          <p>Code By: Dalmar Campaz - Jhoan Galindo - Jose Vidal</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
