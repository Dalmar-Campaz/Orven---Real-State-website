import bañosIcon from "../../assets/icons/baños.png";
import addFavIcon from "../../assets/icons/add-fav.png";
import favIcon from "../../assets/icons/fav.png";
import habitacionesIcon from "../../assets/icons/habitaciones.png";
import tamañoIcon from "../../assets/icons/tamaño.png";
import ubicacionIcon from "../../assets/icons/ubicacion.png";
import { formatoPrecio, ubicacionCorta } from "../../utils/formato";
import type { Propiedad } from "../../types/propiedad";
import "./TarjetaPropiedad.css";

type Props =
  | {
      propiedad: Propiedad;
      favoritos: number[];
      onToggleFavorito: (id: number) => void;
    };

export default function TarjetaPropiedad(props: Props) {
  const { propiedad } = props;
  const esFavorita = props.favoritos.includes(propiedad.id);

    return (
      <article className="property-card">
        <div className="property-image">
          <img src={propiedad.imagenes[0]} alt={propiedad.titulo} />

          <button
            type="button"
            className={`favorite-button ${esFavorita ? "is-favorite" : ""}`}
            onClick={() => props.onToggleFavorito(propiedad.id)}
            aria-label={esFavorita ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={esFavorita}
          >
            <img src={esFavorita ? favIcon : addFavIcon} alt="" />
          </button>
        </div>

        <div className="property-info">
          <p className="property-price">{formatoPrecio(propiedad.precio)}</p>

          <p className="property-location">
            <img
              src={ubicacionIcon}
              alt="ubicación"
              style={{ width: 11, marginBottom: "-2px", marginRight: "4px" }}
            />
            {ubicacionCorta(propiedad)}
          </p>

          <div className="property-features">
            <span>
              <img className="icon" src={habitacionesIcon} alt="Habitaciones" />
              {propiedad.habitaciones}
            </span>
            <span>
              <img className="icon" src={bañosIcon} alt="Baños" />
              {propiedad.banos}
            </span>
            <span>
              <img className="icon" src={tamañoIcon} alt="Área" />
              {propiedad.area} m²
            </span>
          </div>

          <button
            type="button"
            className="property-button"
            disabled
            title="El detalle de cada propiedad se implementará en la Fase 3."
          >
            Ver detalles (próximamente)
          </button>
        </div>
      </article>
    );
}
