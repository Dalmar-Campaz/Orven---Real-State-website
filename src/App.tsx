import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";
import Admin from "./pages/Admin/Admin";
import RegistrarPropiedad from "./pages/RegistrarPropiedad/RegistrarPropiedad";

import { AuthProvider, useAuth } from "./context/AuthContext";

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
            <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Panel de administración */}
      <Route path="/admin" element={<Admin />} />

      {/*Ruta del formulario*/}
      <Route path="/formulario" element={<RegistrarPropiedad />} />

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
