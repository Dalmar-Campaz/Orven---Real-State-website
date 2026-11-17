import { Link } from "react-router-dom";
import logo from "../../assets/Logo.png";
import "./HomeNavbar.css";
import AvatarProfile from "../AvatarProfile/AvatarProfile";

type HomeNavbarProps = {
  activePage?: "home" | "properties";
};

export default function HomeNavbar({
  activePage = "home",
}: HomeNavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {activePage === "home" ? (
          <a href="#inicio" aria-label="Orven, volver al inicio">
            <img className="logo" src={logo} alt="Orven" />
          </a>
        ) : (
          <Link to="/" aria-label="Orven, volver al inicio">
            <img className="logo" src={logo} alt="Orven" />
          </Link>
        )}

        <nav className="nav-links" aria-label="Navegación principal">
          {activePage === "home" ? (
            <a href="#inicio" className="active" aria-current="page">
              Inicio
            </a>
          ) : (
            <Link to="/">Inicio</Link>
          )}

          {activePage === "properties" ? (
            <a href="#propiedades" className="active" aria-current="page">
              Propiedades
            </a>
          ) : (
            <Link to="/propiedades">Propiedades</Link>
          )}

          <a href={activePage === "home" ? "#nosotros" : "/#nosotros"}>
            Sobre Nosotros
          </a>
          <a href={activePage === "home" ? "#contacto" : "/#contacto"}>
            Contacto
          </a>
        </nav>

        <AvatarProfile />
      </div>
    </header>
  );
}
