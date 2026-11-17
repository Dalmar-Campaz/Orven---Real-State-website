import { useState, useEffect } from "react";
import logo from "../../assets/Logo.png";
import "./HomeNavbar.css";
import AvatarProfile from "../AvatarProfile/AvatarProfile";

type HomeNavbarProps = {
  activePage?: "home" | "properties";
};

export default function HomeNavbar({
  activePage = "home",
}: HomeNavbarProps) {
  // Estado para guardar el ID de la sección activa actual (ej: "inicio", "propiedades", "nosotros")
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    // Si no estamos en la página de inicio, no necesitamos observar el scroll de estas secciones
    if (activePage !== "home") return;

    // Seleccionamos todas las secciones del DOM que tienen un ID correspondiente a los enlaces
    const sections = document.querySelectorAll("section[id], div[id]"); // Ajusta según tus contenedores
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Si la sección entra en el área visible de la pantalla (al menos un 50% visible)
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        // Margen negativo superior para que detecte la sección un poco antes de llegar arriba del todo
        rootMargin: "-20% 0px -50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [activePage]);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#inicio" aria-label="Orven, volver al inicio">
          <img className="logo" src={logo} alt="Orven" />
        </a>

        {activePage === "home" ? (
          <nav className="nav-links" aria-label="Navegación principal">
            <a
              href="#inicio"
              className={activeSection === "inicio" ? "active" : ""}
              aria-current={activeSection === "inicio" ? "page" : undefined}
            >
              Inicio
            </a>

            <a
              href="#propiedades"
              className={activeSection === "propiedades" ? "active" : ""}
              aria-current={activeSection === "propiedades" ? "page" : undefined}
            >
              Propiedades
            </a>

            <a
              href="#nosotros"
              className={activeSection === "nosotros" ? "active" : ""}
              aria-current={activeSection === "nosotros" ? "page" : undefined}
            >
              Sobre Nosotros
            </a>
          </nav>
        ) : (
          ""
        )}

        <AvatarProfile />
      </div>
    </header>
  );
}