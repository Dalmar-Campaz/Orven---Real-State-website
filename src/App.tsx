import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";
import Admin from "./pages/Admin/Admin";
import RegistrarPropiedad from "./pages/RegistrarPropiedad/RegistrarPropiedad";
import Propiedades from "./pages/Propiedades/Propiedades";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { PropiedadesProvider } from "./context/PropiedadesContext";
import ProtectedRoute from "./routes/ProtectedRoute";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />

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

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route path="/formulario" element={<RegistrarPropiedad />} />
      <Route path="/propiedades" element={<Propiedades />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PropiedadesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PropiedadesProvider>
    </AuthProvider>
  );
}
