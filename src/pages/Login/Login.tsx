import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "../../context/AuthContext";
import "./Login.css";
import logo from "../../assets/LogoWhite.png";
import handShake from "../../assets/icons/handshake.png";
import shield from "../../assets/icons/shield-check.png";
import home from "../../assets/icons/house.png";
const heroImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop";

/* ---------- Tipos ---------- */
type FormErrors = Partial<Record<"email" | "password", string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mientras no haya backend: estos correos entran como administrador.
const ADMIN_EMAILS = ["admin@orven.com"];

const FEATURES = [
  { id: "quality", label: ["Propiedades", "de calidad"], icon: "home" },
  { id: "secure", label: ["Transacciones", "seguras"], icon: "shield" },
  { id: "trust", label: ["Confianza en", "cada paso"], icon: "handshake" },
] as const;

/* ---------- Iconos (SVG en línea) ---------- */
const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const MailIcon = () => (
  <svg {...svgProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
);

const LockIcon = () => (
  <svg {...svgProps}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.5" r="0.9" fill="currentColor" />
  </svg>
);

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg {...svgProps}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="m4 4 16 16" />}
  </svg>
);

const ArrowIcon = () => (
  <svg {...svgProps} width={18} height={18} strokeWidth={2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const FeatureIcon = ({ name }: { name: (typeof FEATURES)[number]["icon"] }) => {
  const props = { ...svgProps, width: 34, height: 34, strokeWidth: 1.4 };
  switch (name) {
    case "home":
      return (
        <img src={home} alt="Home" width={40} height={40} />
      );
    case "shield":
      return (
        <img src={shield} alt="Shield" width={40} height={40} />
      );
    case "handshake":
      return (
        <img src={handShake} alt="Handshake" width={40} height={40} />
      );
  }
};

/* ---------- Componente ---------- */
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!email.trim()) next.email = "Ingresa tu correo electrónico.";
    else if (!EMAIL_REGEX.test(email.trim()))
      next.email = "El correo no tiene un formato válido.";

    if (!password) next.password = "Ingresa tu contraseña.";
    else if (password.length < 6)
      next.password = "La contraseña debe tener al menos 6 caracteres.";
    return next;
  };

  const handleEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const role: UserRole = ADMIN_EMAILS.includes(email.trim().toLowerCase())
        ? "admin"
        : "customer";

      login(email.trim(), role);
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No pudimos iniciar tu sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        {/* Panel izquierdo */}
        <section
          className="login-hero"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="login-hero__overlay" />

          <img className="login-hero__logo" src={logo} alt="Orven" />

          <div className="login-hero__copy">
            <h1>
              Bienvenido a <span>Orven</span>
            </h1>
            <p>
              Encuentra, publica y gestiona las
              <br />
              mejores propiedades.
            </p>
          </div>

          <ul className="login-hero__features">
            {FEATURES.map((f) => (
              <li key={f.id}>
                <FeatureIcon name={f.icon} />
                <span>
                  {f.label[0]}
                  <br />
                  {f.label[1]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Panel derecho */}
        <section className="login-panel">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h2>Iniciar sesión</h2>
            <p className="login-form__subtitle">
              Accede a tu cuenta para continuar
            </p>

            <div className="field">
              <div className={`field__box ${errors.email ? "has-error" : ""}`}>
                <span className="field__icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmail}
                  aria-label="Correo electrónico"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <span className="field__error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="field">
              <div
                className={`field__box ${errors.password ? "has-error" : ""}`}
              >
                <span className="field__icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePassword}
                  aria-label="Contraseña"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  <EyeIcon off={!showPassword} />
                </button>
              </div>
              {errors.password && (
                <span className="field__error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="login-form__options">
              <label className="check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="check__box" />
                Recordar mi sesión
              </label>
              <button
                type="button"
                className="link"
                onClick={() => navigate("/recuperar")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {submitError && (
              <p className="login-form__error" role="alert">
                {submitError}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
              {!loading && <ArrowIcon />}
            </button>
          </form>

          <p className="login-panel__footer">
            ¿No tienes una cuenta?{" "}
            <button type="button" className="link" onClick={() => navigate("/contacto")}>
              Contáctanos
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;