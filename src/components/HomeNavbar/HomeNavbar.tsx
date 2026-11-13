import logo from "../../assets/Logo.png";
import "./HomeNavbar.css";
import AvatarProfile from "../AvatarProfile/AvatarProfile";

export default function HomeNavbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#inicio">
          <img className="logo" src={logo} alt="Orven" />
        </a>

        <nav className="nav-links">
          <a href="#inicio" className="active">
            Inicio
          </a>
          <a href="#propiedades">Propiedades</a>
          <a href="#nosotros">Sobre Nosotros</a>
        </nav>

        <AvatarProfile />
      </div>
    </header>
  );
}
