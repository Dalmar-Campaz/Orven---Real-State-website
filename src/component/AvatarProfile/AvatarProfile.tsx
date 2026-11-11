import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/icons/avatar.png";
import "./AvatarProfile.css";


export default function AvatarProfile() {
 const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };
return (
    <div className="account-menu">
          {!user ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="login-button"
            >
              Iniciar sesión
            </button>
          ) : (
            <>
              <img
                aria-label="Mi cuenta"
                aria-expanded={showDropdown}
                onClick={() => setShowDropdown(!showDropdown)}
                className="account-button"
                src={avatar}
                alt="Avatar"
              />

              {showDropdown && (
                <div className="account-dropdown">
                  <p className="dropdown-label">Sesión activa de:</p>

                  <p className="dropdown-email">{user.email}</p>

                  <hr />

                  {user.role === "admin" && (
                    <button type="button" onClick={() => navigate("/admin")}>
                      Panel de administración
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </>
          )}
        </div>
)
}