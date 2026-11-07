
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Página protegida para administradores
function AdminPage() {
  const { user, logout } = useAuth();

  // Si no inició sesión, enviarlo al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si es cliente, no puede entrar al panel
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#222",
          color: "#fff",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h1>Panel de Administración - Orven</h1>

        <button
          onClick={logout}
          style={{
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <div style={{ marginTop: "2rem" }}>
        <h3>Solicitudes pendientes de aprobación:</h3>

        <p>
          Aquí el administrador podrá revisar las propiedades
          enviadas por los clientes, aceptarlas o rechazarlas.
        </p>
      </div>
    </div>
  );
}


// Configuración de las rutas
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* Página principal */}
      <Route path="/" element={<Home />} />

      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin" : "/"}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Panel de administración */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Ruta desconocida */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}


// Aplicación principal
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
