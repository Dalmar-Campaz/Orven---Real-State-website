import { Link } from "react-router-dom";
import HomeNavbar from "../../components/HomeNavbar/HomeNavbar";
import TarjetaPropiedad from "../../components/TarjetaPropiedad/TarjetaPropiedad";
import { usePropiedades } from "../../context/PropiedadesContext";
import "./Favoritos.css";

export default function Favoritos() {
  const { propiedades, agentes, favoritos, alternarFavorito } = usePropiedades();
  const propiedadesFavoritas = propiedades.filter((propiedad) =>
    favoritos.includes(propiedad.id),
  );

  return (
    <div className="favorites-page">
      <HomeNavbar activePage="properties" />
      <main className="favorites-main">
        <div className="favorites-heading">
          <p>Tu selección personal</p>
          <h1>Propiedades favoritas</h1>
          <span>
            {propiedadesFavoritas.length}{" "}
            {propiedadesFavoritas.length === 1 ? "propiedad guardada" : "propiedades guardadas"}
          </span>
        </div>

        {propiedadesFavoritas.length > 0 ? (
          <section className="favorites-grid" aria-label="Mis propiedades favoritas">
            {propiedadesFavoritas.map((propiedad) => (
              <TarjetaPropiedad
                key={propiedad.id}
                propiedad={propiedad}
                agente={agentes.find((item) => item.id === propiedad.agenteId)}
                favoritos={favoritos}
                onToggleFavorito={alternarFavorito}
              />
            ))}
          </section>
        ) : (
          <section className="favorites-empty">
            <h2>Aún no tienes propiedades guardadas</h2>
            <p>Guarda las propiedades que te interesen y aparecerán en esta sección.</p>
            <Link to="/propiedades">Explorar propiedades</Link>
          </section>
        )}
      </main>
    </div>
  );
}
