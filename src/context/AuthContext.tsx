import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "admin" | "customer";

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole, remember: boolean) => void;
  logout: () => void;
}

const CLAVE_SESION = "orven_user";
const CLAVE_SESION_PESTANA = "orven_user_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const esUsuario = (valor: unknown): valor is User => {
  if (typeof valor !== "object" || valor === null) return false;

  const usuario = valor as Record<string, unknown>;
  return (
    typeof usuario.email === "string" &&
    (usuario.role === "admin" || usuario.role === "customer")
  );
};

const leerUsuario = (almacenamiento: Storage, clave: string): User | null => {
  try {
    const contenido = almacenamiento.getItem(clave);
    if (!contenido) return null;

    const valor: unknown = JSON.parse(contenido);
    if (esUsuario(valor)) return valor;

    almacenamiento.removeItem(clave);
  } catch {
    // Un JSON inválido o un almacenamiento bloqueado no debe impedir el arranque.
  }

  return null;
};

const cargarUsuario = (): User | null => {
  try {
    const usuarioRecordado = leerUsuario(window.localStorage, CLAVE_SESION);
    if (usuarioRecordado) return usuarioRecordado;
  } catch {
    // Se intenta leer la sesión temporal como alternativa.
  }

  try {
    return leerUsuario(window.sessionStorage, CLAVE_SESION_PESTANA);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(cargarUsuario);

  const login = (email: string, role: UserRole, remember: boolean) => {
    const nuevoUsuario: User = { email, role };
    const contenido = JSON.stringify(nuevoUsuario);

    try {
      if (remember) {
        window.localStorage.setItem(CLAVE_SESION, contenido);
        try {
          window.sessionStorage.removeItem(CLAVE_SESION_PESTANA);
        } catch {
          // La sesión persistente ya se guardó; el estado actual puede continuar.
        }
      } else {
        window.sessionStorage.setItem(CLAVE_SESION_PESTANA, contenido);
        try {
          window.localStorage.removeItem(CLAVE_SESION);
        } catch {
          // La sesión temporal ya se guardó; el estado actual puede continuar.
        }
      }
    } catch {
      throw new Error(
        "No se pudo guardar la sesión en este navegador. Comprueba la configuración de almacenamiento."
      );
    }

    setUser(nuevoUsuario);
  };

  const logout = () => {
    setUser(null);

    try {
      window.localStorage.removeItem(CLAVE_SESION);
    } catch {
      // El cierre de sesión en la pestaña actual sigue siendo efectivo.
    }

    try {
      window.sessionStorage.removeItem(CLAVE_SESION_PESTANA);
    } catch {
      // El cierre de sesión en la pestaña actual sigue siendo efectivo.
    }
  };

  useEffect(() => {
    const sincronizarSesion = (evento: StorageEvent) => {
      try {
        if (
          evento.storageArea !== window.localStorage ||
          (evento.key !== CLAVE_SESION && evento.key !== null)
        ) {
          return;
        }
      } catch {
        return;
      }

      setUser(cargarUsuario());
    };

    window.addEventListener("storage", sincronizarSesion);
    return () => window.removeEventListener("storage", sincronizarSesion);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
