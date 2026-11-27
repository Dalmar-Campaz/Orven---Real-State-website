import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

  if (!user) {
    return (
      <div className="account-menu">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="login-button"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="account-menu">
      <button
        type="button"
        className="account-button"
        aria-label="Abrir menú de cuenta"
        aria-expanded={showDropdown}
        aria-controls="account-dropdown"
        onClick={() => setShowDropdown((visible) => !visible)}
      >
        <img src={avatar} alt="" />
      </button>

      {showDropdown && (
        <div className="account-dropdown" id="account-dropdown">
          <p className="dropdown-label">Sesión activa de:</p>
          <p className="dropdown-email">{user.email}</p>
          <hr />

          {user.role === "admin" && (
            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                navigate("/admin");
              }}
            >
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
    </div>
  );
}
