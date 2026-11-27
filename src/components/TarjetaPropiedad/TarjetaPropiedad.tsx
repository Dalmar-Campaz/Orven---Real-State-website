import { Link } from "react-router-dom";
import bañosIcon from "../../assets/icons/baños.png";
import addFavIcon from "../../assets/icons/add-fav.png";
import favIcon from "../../assets/icons/fav.png";
import habitacionesIcon from "../../assets/icons/habitaciones.png";
import tamañoIcon from "../../assets/icons/tamaño.png";
import ubicacionIcon from "../../assets/icons/ubicacion.png";
import { formatoPrecio, ubicacionCorta } from "../../utils/formato";
import type { Agente, Propiedad } from "../../types/propiedad";
import "./TarjetaPropiedad.css";

type Props = {
  propiedad: Propiedad;
  agente?: Agente;
  favoritos: number[];
  onToggleFavorito: (id: number) => void;
};

export default function TarjetaPropiedad({
  propiedad,
  agente,
  favoritos,
  onToggleFavorito,
}: Props) {
  const esFavorita = favoritos.includes(propiedad.id);

  return (
    <article className="property-card">
      <div className="property-image">
        <img src={propiedad.imagenes[0]} alt={propiedad.titulo} />

        <button
          type="button"
          className={`favorite-button ${esFavorita ? "is-favorite" : ""}`}
          onClick={() => onToggleFavorito(propiedad.id)}
          aria-label={esFavorita ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={esFavorita}
        >
          <img src={esFavorita ? favIcon : addFavIcon} alt="" />
        </button>
      </div>

      <div className="property-info">
        <h3 className="property-title">{propiedad.titulo}</h3>
        <p className="property-price">{formatoPrecio(propiedad.precio)}</p>

        <p className="property-location">
          <img
            src={ubicacionIcon}
            alt=""
            style={{ width: 11, marginBottom: "-2px", marginRight: "4px" }}
          />
          {ubicacionCorta(propiedad)}
        </p>

        <div className="property-features">
          <span>
            <img className="icon" src={habitacionesIcon} alt="" />
            {propiedad.habitaciones}
          </span>
          <span>
            <img className="icon" src={bañosIcon} alt="" />
            {propiedad.banos}
          </span>
          <span>
            <img className="icon" src={tamañoIcon} alt="" />
            {propiedad.area} m²
          </span>
        </div>

        <p className="property-agent">
          Asesor: {agente?.nombre ?? "Equipo Orven"}
        </p>

        <Link className="property-button" to={`/propiedades/${propiedad.id}`}>
          Ver detalles
        </Link>
      </div>
    </article>
  );
}
