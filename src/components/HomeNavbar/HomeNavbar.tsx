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
        <Link to="/#inicio" aria-label="Orven, volver al inicio">
          <img className="logo" src={logo} alt="Orven" />
        </Link>

        <nav className="nav-links" aria-label="Navegación principal">
          <Link
            to="/"
            className={activePage === "home" ? "active" : undefined}
            aria-current={activePage === "home" ? "page" : undefined}
          >
            Inicio
          </Link>
          <Link
            to="/propiedades"
            className={activePage === "properties" ? "active" : undefined}
            aria-current={activePage === "properties" ? "page" : undefined}
          >
            Propiedades
          </Link>
          <Link to="/#nosotros">Sobre Nosotros</Link>
          <Link to="/#contacto">Contacto</Link>
        </nav>

        <AvatarProfile />
      </div>
    </header>
  );
}
