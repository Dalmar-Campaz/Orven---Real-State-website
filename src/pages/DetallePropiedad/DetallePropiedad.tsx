import { Link, useParams } from "react-router-dom";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar";
import { usePropiedades } from "../../context/PropiedadesContext";
import { formatoPrecio, ubicacionCorta } from "../../utils/formato";
import "./DetallePropiedad.css";

export default function DetallePropiedad() {
  const { id } = useParams<{ id: string }>();
  const { propiedades, agentes, favoritos, alternarFavorito } = usePropiedades();
  const propiedad = propiedades.find((item) => item.id === Number(id));

  if (!propiedad) {
    return (
      <div className="property-detail-page">
        <HomeNavbar activePage="properties" />
        <main className="property-detail-empty">
          <h1>Esta propiedad no está disponible</h1>
          <p>Puede que haya sido retirada del catálogo o que el enlace no sea válido.</p>
          <Link to="/propiedades">Volver al catálogo</Link>
        </main>
      </div>
    );
  }

  const agente = agentes.find((item) => item.id === propiedad.agenteId);
  const esFavorita = favoritos.includes(propiedad.id);

  return (
    <div className="property-detail-page">
      <HomeNavbar activePage="properties" />

      <main className="property-detail">
        <Link className="property-detail__back" to="/propiedades">
          <span aria-hidden="true">←</span> Volver a propiedades
        </Link>

        <section className="property-detail__heading">
          <div>
            <p className="property-detail__eyebrow">
              {propiedad.tipo} · {propiedad.operacion}
            </p>
            <h1>{propiedad.titulo}</h1>
            <p className="property-detail__location">{ubicacionCorta(propiedad)}, {propiedad.departamento}</p>
          </div>
          <button
            type="button"
            className={`property-detail__favorite ${esFavorita ? "is-active" : ""}`}
            onClick={() => alternarFavorito(propiedad.id)}
            aria-pressed={esFavorita}
          >
            {esFavorita ? "Quitar de favoritos" : "Guardar en favoritos"}
          </button>
        </section>

        <section className="property-detail__gallery" aria-label="Fotografías de la propiedad">
          {propiedad.imagenes.map((imagen, indice) => (
            <img
              key={`${propiedad.id}-${indice}`}
              src={imagen}
              alt={`${propiedad.titulo}, fotografía ${indice + 1}`}
            />
          ))}
        </section>

        <div className="property-detail__layout">
          <section className="property-detail__information">
            <p className="property-detail__price">{formatoPrecio(propiedad.precio)}</p>
            <h2>Acerca de esta propiedad</h2>
            <p className="property-detail__description">{propiedad.descripcion}</p>

            <h2>Características</h2>
            <dl className="property-detail__features">
              <div><dt>Habitaciones</dt><dd>{propiedad.habitaciones}</dd></div>
              <div><dt>Baños</dt><dd>{propiedad.banos}</dd></div>
              <div><dt>Área construida</dt><dd>{propiedad.area} m²</dd></div>
              <div><dt>Ciudad</dt><dd>{propiedad.ciudad}</dd></div>
              {propiedad.sector && <div><dt>Sector</dt><dd>{propiedad.sector}</dd></div>}
              <div><dt>Publicada</dt><dd>{propiedad.fecha}</dd></div>
            </dl>
          </section>

          <aside className="property-detail__agent">
            <h2>Asesor inmobiliario</h2>
            {agente ? (
              <>
                <img className="property-detail__agent-photo" src={agente.foto} alt={agente.nombre} />
                <h3>{agente.nombre}</h3>
                <p className="property-detail__agent-role">{agente.cargo}</p>
                <p>{agente.descripcion}</p>
                <ul>
                  <li><strong>Especialidad:</strong> {agente.especialidad}</li>
                  <li><strong>Experiencia:</strong> {agente.experiencia} años</li>
                </ul>
                <a href={`mailto:${agente.email}`}>Contactar por correo</a>
                <a href={`tel:${agente.telefono.replaceAll(" ", "")}`}>Llamar al asesor</a>
              </>
            ) : (
              <p>El equipo de Orven puede ayudarte con esta propiedad.</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
