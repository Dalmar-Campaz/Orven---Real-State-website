import { useState, useEffect } from "react";
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
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    if (activePage !== "home") return;

    const sections = document.querySelectorAll("section[id], div[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -50% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activePage]);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" aria-label="Orven, volver al inicio">
          <img className="logo" src={logo} alt="Orven" />
        </Link>

        {activePage === "home" ? (
          <nav className="nav-links" aria-label="Navegación principal">
            <a
              href="#inicio"
              className={activeSection === "inicio" ? "active" : ""}
              aria-current={activeSection === "inicio" ? "location" : undefined}
            >
              Inicio
            </a>
            <a
              href="#propiedades"
              className={activeSection === "propiedades" ? "active" : ""}
              aria-current={activeSection === "propiedades" ? "location" : undefined}
            >
              Propiedades
            </a>
            <a
              href="#nosotros"
              className={activeSection === "nosotros" ? "active" : ""}
              aria-current={activeSection === "nosotros" ? "location" : undefined}
            >
              Sobre Nosotros
            </a>
          </nav>
        ) : (
          <nav className="nav-links" aria-label="Navegación principal">
            <Link to="/">Inicio</Link>
            <Link to="/propiedades">Propiedades</Link>
          </nav>
        )}

        <div className="navbar-actions">
          <Link className="nav-favorites" to="/favoritos">
            Favoritos
          </Link>
          <AvatarProfile />
        </div>
      </div>
    </header>
  );
}
