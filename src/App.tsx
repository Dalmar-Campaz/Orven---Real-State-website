import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";
import Admin from "./pages/Admin/Admin";
import RegistrarPropiedad from "./pages/RegistrarPropiedad/RegistrarPropiedad";
import Propiedades from "./pages/Propiedades/Propiedades";
import DetallePropiedad from "./pages/DetallePropiedad/DetallePropiedad";
import Favoritos from "./pages/Favoritos/Favoritos";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { PropiedadesProvider, usePropiedades } from "./context/PropiedadesContext";
import ProtectedRoute from "./routes/ProtectedRoute";

function AppRoutes() {
  const { user } = useAuth();
  const { cargando, errorCarga } = usePropiedades();

  if (cargando) {
    return (
      <main className="app-status" role="status" aria-live="polite">
        <p>Cargando el catálogo de Orven...</p>
      </main>
    );
  }

  if (errorCarga) {
    return (
      <main className="app-status app-status--error" role="alert">
        <h1>No pudimos cargar los datos de Orven</h1>
        <p>{errorCarga}</p>
        <p>Verifica que el archivo public/datos.json exista y cumpla el modelo de datos.</p>
      </main>
    );
  }

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
      <Route path="/propiedades/:id" element={<DetallePropiedad />} />
      <Route path="/favoritos" element={<Favoritos />} />

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
