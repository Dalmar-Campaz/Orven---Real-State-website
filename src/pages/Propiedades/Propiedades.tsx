import { Link } from "react-router-dom";
import "./Propiedades.css";

export default function Propiedades() {
  return (
    <main className="catalog-pending">
      <div className="catalog-pending__content">
        <p className="catalog-pending__eyebrow">ORVEN · CATÁLOGO</p>
        <h1>Estamos preparando nuestro catálogo</h1>
        <p>
          La página de todas las propiedades se integrará en la siguiente fase
          del proyecto.
        </p>
        <Link to="/">Volver al inicio</Link>
      </div>
    </main>
  );
}
