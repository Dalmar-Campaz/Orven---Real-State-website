import { useState, type FormEvent } from "react";
import { propertiesDB as properties } from "../../data/propiedades";
import { useNavigate } from "react-router-dom";
import baños from "../../assets/icons/baños.png";
import addFav from "../../assets/icons/add-fav.png";
import fav from "../../assets/icons/fav.png";
import habitaciones from "../../assets/icons/habitaciones.png";
import tamaño from "../../assets/icons/tamaño.png";
import ubicacion from "../../assets/icons/ubicacion.png";
import logo from "../../assets/Logo.png";
import "./Home.css";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar";

function Home() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const navigate = useNavigate();
  // Agregar o quitar una propiedad de favoritos.
  const toggleFavorite = (id: number) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id],
    );
  };
  // Llevar al usuario a las propiedades después de buscar.
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    document
      .getElementById("propiedades")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  function handleClickFormulario() {
    navigate("/formulario");
  }
  function handleClickPropiedades() {
    navigate("/propiedades");
  }

  const CIUDADES = [
    { nombre: "Medellín" },
    { nombre: "Rionegro" },
    { nombre: "Envigado" },
    { nombre: "Bogotá" },
    { nombre: "Chía" },
    { nombre: "Cali" },
    { nombre: "Buenaventura" },
    { nombre: "Barranquilla" },
    { nombre: "Cartagena" },
  ];
  return (
    <div className="orven-page">
      {/* NAVBAR */}

      <HomeNavbar />

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <h1>
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

      {/* APARTADO BUSQUEDA */}
      <section className="search-section">
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
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
              <circle cx="12" cy="9" r="3"></circle>
            </svg>

            <div className="field-content">
              <label htmlFor="location">Ubicación</label>
              <select id="location" defaultValue="">
                <option value="">Seleccionar ubicación</option>
                {CIUDADES.map((ciudad) => (
                  <option
                    key={ciudad.nombre}
                    value={ciudad.nombre.toLowerCase()}
                  >
                    {ciudad.nombre}
                  </option>
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
            >
              <polygon points="3.5,22 21,22 21,10 12,2 3.5,10"></polygon>
              <rect x="9.5" y="14" width="5.5" height="8" />
            </svg>

            <div className="field-content">
              <label htmlFor="property-type">Tipo de propiedad</label>
              <select id="property-type" defaultValue="">
                <option value="">Casa, apartamento...</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="penthouse">Penthouse</option>
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
            >
              <rect x="2" y="6" width="20" height="12"></rect>
              <circle cx="7" cy="12.5" r="0.5" fill="currentColor"></circle>
              <circle cx="12" cy="12.5" r="2"></circle>
              <circle cx="17" cy="12.5" r="0.5" fill="currentColor"></circle>
            </svg>

            <div className="field-content">
              <label htmlFor="price">Precio</label>
              <select id="property-type" defaultValue="">
                <option value="">$0 - $500.000.000</option>
                <option value="$500.000.000 - $1.000.000.000">
                  $500.000.000 - $1.000.000.000
                </option>
                <option value="$1.000.000.000+">$1.000.000.000+</option>
              </select>
            </div>
          </div>

          <button className="search-button" type="submit">
            {/* <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg> */}
            Buscar
          </button>
        </form>
      </section>

      {/* CARACTERISTICAS PROPIEDADES */}
      <section className="properties-section" id="propiedades">
        <div className="section-heading">
          <h2>Propiedades Destacadas</h2>

          <div className="view-all-button" onClick={handleClickPropiedades}>
            Ver todas las propiedades <span>→</span>
          </div>
        </div>

        <div className="properties-grid">
          {properties.map((property) => (
            <article className="property-card" key={property.id}>
              <div className="property-image">
                <img src={property.image} alt={property.title} />

                <img
                  style={{ width: 26, height: 26 }}
                  className={`favorite-button ${
                    favorites.includes(property.id) ? "is-favorite" : ""
                  }`}
                  onClick={() => toggleFavorite(property.id)}
                  aria-label={
                    favorites.includes(property.id)
                      ? "Quitar de favoritos"
                      : "Agregar a favoritos"
                  }
                  aria-pressed={favorites.includes(property.id)}
                  src={favorites.includes(property.id) ? fav : addFav}
                />
              </div>

              <div className="property-info">
                <p className="property-price">{property.price}</p>

                <p className="property-location">
                  <img
                    src={ubicacion}
                    alt="ubicación"
                    style={{
                      width: 11,
                      marginBottom: "-2px",
                      marginRight: "4px",
                    }}
                  />
                  {property.location}
                </p>

                <div className="property-features">
                  <span>
                    <img
                      className="icon"
                      src={habitaciones}
                      alt="Habitaciones"
                    />
                    {property.bedrooms}
                  </span>

                  <span>
                    <img className="icon" src={baños} alt="Baños" />

                    {property.bathrooms}
                  </span>

                  <span>
                    <img className="icon" src={tamaño} alt="Área" />
                    {property.area} m²
                  </span>
                </div>

                <a className="property-button">Ver detalles</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TESTIMONIALES Y AGENTES */}
      <section className="social-proof" id="nosotros">
        <div className="testimonial">
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
                  alt="Laura Martínez"
                />

                <div>
                  <strong>Laura Martínez</strong>
                  <span>Compradora feliz</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="featured-agent">
          <h2>Agentes destacados</h2>

          <div className="agent-card">
            <img
              className="agent-image"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop"
              alt="Alejandro Gómez"
            />

            <div className="agent-info">
              <strong>Alejandro Gómez</strong>
              <span>Asesor inmobiliario</span>

              <div className="agent-rating">
                <span>★★★★★</span>
                <small>4.9 (32 opiniones)</small>
              </div>
            </div>

            <a className="contact-agent">Contactar</a>
          </div>
        </div>
      </section>

      {/*FORMULARIO*/}
      <section className="publish-section" id="contacto">
        <h2>¿Quieres publicar tu inmueble?</h2>

        <p>
          En Orven te ayudamos a encontrar a las personas ideales para tu
          propiedad. Envíanos tu solicitud y da el primer paso.
        </p>

        <button onClick={handleClickFormulario} className="publish-button">
          Solicitar mi venta
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <a href="#inicio">
          <img className="logo" src={logo} alt="Orven" />
        </a>

        <div className="footer-bottom">
          {/* <div className="social-links">
            <a href="#contacto" aria-label="Facebook">
              f
            </a>
            <a href="#contacto" aria-label="Instagram">
              ◎
            </a>
            <a href="#contacto" aria-label="LinkedIn">
              in
            </a>
          </div> */}

          <p>© 2026 Orven. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
