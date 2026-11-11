import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistrarPropiedad.css";
import logo from "../../assets/Logo.png";
import AvatarProfile from "../../component/AvatarProfile/AvatarProfile";
const banner = "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1800&auto=format&fit=crop";

/* ---------- Tipos ---------- */
export type Operacion = "Venta";

export interface SolicitudPropiedad {
  titulo: string;
  tipo: string;
  operacion: Operacion;
  precio: number;
  ciudad: string;
  departamento: string;
  habitaciones: number;
  banos: number;
  area: number;
  descripcion: string;
  imagenes: File[];
}

interface FormState {
  titulo: string;
  tipo: string;
  operacion: Operacion;
  precio: string; // solo dígitos
  ciudad: string;
  departamento: string;
  habitaciones: string;
  banos: string;
  area: string;
  descripcion: string;
}

type Campo = keyof FormState | "imagenes";
type Errores = Partial<Record<Campo, string>>;

interface Imagen {
  file: File;
  url: string;
}

/* ---------- Datos ---------- */
const TIPOS = [
  "Casa",
  "Apartamento",
];

const OPERACIONES: Operacion[] = ["Venta"];

// Cada ciudad pertenece a un departamento (amplía la lista con tus datos).
const CIUDADES = [
  { nombre: "Medellín", departamento: "Antioquia" },
  { nombre: "Rionegro", departamento: "Antioquia" },
  { nombre: "Envigado", departamento: "Antioquia" },
  { nombre: "Bogotá", departamento: "Cundinamarca" },
  { nombre: "Chía", departamento: "Cundinamarca" },
  { nombre: "Cali", departamento: "Valle del Cauca" },
  { nombre: "Buenaventura", departamento: "Valle del Cauca" },
  { nombre: "Barranquilla", departamento: "Atlántico" },
  { nombre: "Cartagena", departamento: "Bolívar" },
];

const DEPARTAMENTOS = Array.from(
  new Set(CIUDADES.map((c) => c.departamento))
).sort((a, b) => a.localeCompare(b, "es"));

const CONTADOR = ["1", "2", "3", "4", "5", "6", "7", "8+"];

const PASOS = [
  {
    titulo: "Revisamos la información",
    texto: "Verificamos que todos los datos sean correctos y cumplan con nuestros criterios.",
  },
  {
    titulo: "Evaluamos la propiedad",
    texto: "Confirmamos que la propiedad cumpla con nuestros estándares de calidad.",
  },
  {
    titulo: "Te notificamos",
    texto: "Recibirás un correo con la confirmación de la publicación.",
  },
];

const MAX_DESCRIPCION = 1000;
const MAX_IMAGENES = 10;

const INICIAL: FormState = {
  titulo: "",
  tipo: "",
  operacion: "Venta",
  precio: "",
  ciudad: "",
  departamento: "",
  habitaciones: "",
  banos: "",
  area: "",
  descripcion: "",
};

/* ---------- Iconos ---------- */
const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};


const ArrowLeftIcon = () => (
  <svg {...svg} width={16} height={16}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

const ChevronIcon = () => (
  <svg {...svg} width={16} height={16}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ShieldIcon = () => (
  <svg {...svg} width={24} height={24}>
    <path d="M12 3 5 6v5.500c0 4.400 2.900 8 7 9.500 4.100-1.500 7-5.100 7-9.500V6l-7-3Z" />
    <path d="m9 12 2.200 2.200L15.500 10" />
  </svg>
);

const UploadIcon = () => (
  <svg {...svg} width={26} height={26} strokeWidth={1.3}>
    <rect x="3.500" y="3.500" width="17" height="17" rx="1" />
    <path d="M12 16V8m-3.500 3.500L12 8l3.500 3.500M7 16.500h10" />
  </svg>
);

const InfoIcon = () => (
  <svg {...svg} width={22} height={22}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.01" />
  </svg>
);

const CloseIcon = () => (
  <svg {...svg} width={14} height={14} strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/* ---------- Select reutilizable ---------- */
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
  error?: string;
  label: string;
}

function Select({ value, onChange, placeholder, options, error, label }: SelectProps) {
  return (
    <>
      <div className={`rp-select ${error ? "has-error" : ""}`}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          aria-invalid={!!error}
          className={value ? "" : "is-placeholder"}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronIcon />
      </div>
      {error && (
        <span className="rp-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

/* ---------- Componente ---------- */
interface Props {
  /** Se ejecuta con la solicitud ya validada. Si lanza un error, se muestra. */
  onSubmit?: (solicitud: SolicitudPropiedad) => Promise<void> | void;
}

export function RegistrarPropiedad({ onSubmit }: Props) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INICIAL);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [enviado, setEnviado] = useState(false);

  // Libera las URLs temporales de las imágenes al desmontar
  const imagenesRef = useRef(imagenes);
  imagenesRef.current = imagenes;
  useEffect(
    () => () => imagenesRef.current.forEach((i) => URL.revokeObjectURL(i.url)),
    []
  );

  const set = <K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /* Ciudad ↔ Departamento */
  const ciudadesDisponibles = CIUDADES.filter(
    (c) => !form.departamento || c.departamento === form.departamento
  ).map((c) => c.nombre);

  const cambiarCiudad = (nombre: string) => {
    const ciudad = CIUDADES.find((c) => c.nombre === nombre);
    setForm((prev) => ({
      ...prev,
      ciudad: nombre,
      departamento: ciudad ? ciudad.departamento : prev.departamento,
    }));
    setErrores((prev) => ({ ...prev, ciudad: undefined, departamento: undefined }));
  };

  const cambiarDepartamento = (nombre: string) => {
    setForm((prev) => {
      const ciudadValida = CIUDADES.some(
        (c) => c.nombre === prev.ciudad && c.departamento === nombre
      );
      return {
        ...prev,
        departamento: nombre,
        ciudad: !nombre || ciudadValida ? prev.ciudad : "",
      };
    });
    setErrores((prev) => ({ ...prev, departamento: undefined }));
  };

  /* Precio con separador de miles */
  const precioFormateado = form.precio
    ? Number(form.precio).toLocaleString("es-CO")
    : "";

  const cambiarPrecio = (e: ChangeEvent<HTMLInputElement>) =>
    set("precio", e.target.value.replace(/\D/g, "").slice(0, 13));

  /* Imágenes */
  const agregarImagenes = (e: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    e.target.value = "";
    if (archivos.length === 0) return;

    setImagenes((prev) => {
      const nuevas = archivos
        .slice(0, MAX_IMAGENES - prev.length)
        .map((file) => ({ file, url: URL.createObjectURL(file) }));
      return [...prev, ...nuevas];
    });
    setErrores((prev) => ({ ...prev, imagenes: undefined }));
  };

  const quitarImagen = (url: string) => {
    URL.revokeObjectURL(url);
    setImagenes((prev) => prev.filter((i) => i.url !== url));
  };

  /* Validación */
  const validar = (): Errores => {
    const e: Errores = {};
    const req = "Este campo es obligatorio.";

    if (!form.titulo.trim()) e.titulo = req;
    if (!form.tipo) e.tipo = "Selecciona un tipo.";
    if (!form.precio || Number(form.precio) <= 0) e.precio = "Ingresa un precio válido.";
    if (!form.ciudad) e.ciudad = "Selecciona una ciudad.";
    if (!form.departamento) e.departamento = "Selecciona un departamento.";
    if (!form.habitaciones) e.habitaciones = "Selecciona.";
    if (!form.banos) e.banos = "Selecciona.";
    if (!form.area || Number(form.area) <= 0) e.area = "Ingresa un área válida.";
    if (!form.descripcion.trim()) e.descripcion = req;
    if (imagenes.length === 0) e.imagenes = "Añade al menos una imagen.";
    return e;
  };

  const enviar = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErrorEnvio("");

    const encontrados = validar();
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      document
        .querySelector<HTMLElement>(".rp-field.has-error, .rp-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const solicitud: SolicitudPropiedad = {
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      operacion: form.operacion,
      precio: Number(form.precio),
      ciudad: form.ciudad,
      departamento: form.departamento,
      habitaciones: parseInt(form.habitaciones, 10),
      banos: parseInt(form.banos, 10),
      area: Number(form.area),
      descripcion: form.descripcion.trim(),
      imagenes: imagenes.map((i) => i.file),
    };

    setEnviando(true);
    try {
      await onSubmit?.(solicitud);
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorEnvio(
        err instanceof Error ? err.message : "No pudimos enviar tu solicitud."
      );
    } finally {
      setEnviando(false);
    }
  };

  const nuevaSolicitud = () => {
    imagenes.forEach((i) => URL.revokeObjectURL(i.url));
    setImagenes([]);
    setForm(INICIAL);
    setErrores({});
    setEnviado(false);
  };

  const claseCampo = (c: Campo) => `rp-field ${errores[c] ? "has-error" : ""}`;

  return (
    <div className="rp">
      {/* Encabezado */}
      <header className="rp-header">
        <img style={{ cursor: "pointer" }} onClick={() => navigate("/")} src={logo} alt="Orven" className="rp-header__logo" />
        <AvatarProfile />
      </header>

      {/* Banner */}
      <section
        className="rp-banner"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="rp-banner__overlay" />
        <div className="rp-banner__content">
          <button type="button" className="rp-back" onClick={() => navigate("/")}>
            <ArrowLeftIcon /> Volver al inicio
          </button>
          <h1>Registrar propiedad</h1>
          <p>
            Completa el formulario con la información de la propiedad.
            <br />
            Antes de publicarse, será revisada y aprobada por nuestro administrador.
          </p>
        </div>
      </section>

      <div className="rp-layout">
        {/* Formulario */}
        <section className="rp-card">
          <div className="rp-tabs">
            <span className="rp-tabs__num">1</span>
            <span className="rp-tabs__label">Información básica</span>
          </div>

          {enviado ? (
            <div className="rp-success" role="status">
              <span className="rp-success__icon">
                <svg {...svg} width={34} height={34} strokeWidth={2}>
                  <path d="m5 12.500 4.500 4.500L19 7.500" />
                </svg>
              </span>
              <h2>¡Solicitud enviada!</h2>
              <p>
                Tu propiedad será revisada por nuestro administrador. Te notificaremos
                por correo cuando sea aprobada.
              </p>
              <div className="rp-success__actions">
                <button type="button" className="rp-btn rp-btn--ghost" onClick={nuevaSolicitud}>
                  Registrar otra propiedad
                </button>
                <button type="button" className="rp-btn" onClick={() => navigate("/")}>
                  Volver al inicio
                </button>
              </div>
            </div>
          ) : (
            <form className="rp-form" onSubmit={enviar} noValidate>
              <h2>Información básica</h2>

              <div className="rp-grid rp-grid--2">
                <div className={claseCampo("titulo")}>
                  <label htmlFor="titulo">Título de la propiedad *</label>
                  <input
                    id="titulo"
                    type="text"
                    placeholder="Ej. Casa moderna con piscina"
                    value={form.titulo}
                    onChange={(e) => set("titulo", e.target.value)}
                    aria-invalid={!!errores.titulo}
                  />
                  {errores.titulo && <span className="rp-error" role="alert">{errores.titulo}</span>}
                </div>

                <div className={claseCampo("tipo")}>
                  <label>Tipo de propiedad *</label>
                  <Select
                    label="Tipo de propiedad"
                    value={form.tipo}
                    onChange={(v) => set("tipo", v)}
                    placeholder="Selecciona un tipo"
                    options={TIPOS}
                    error={errores.tipo}
                  />
                </div>

                <div className="rp-field">
                  <label id="lbl-operacion">Operación *</label>
                  <div className="rp-radios" role="radiogroup" aria-labelledby="lbl-operacion">
                    {OPERACIONES.map((op) => (
                      <label key={op} className="rp-radio">
                        <input
                          type="radio"
                          name="operacion"
                          value={op}
                          checked={form.operacion === op}
                          onChange={() => set("operacion", op)}
                        />
                        <span className="rp-radio__dot" />
                        {op}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={claseCampo("precio")}>
                  <label htmlFor="precio">Precio *</label>
                  <div className="rp-money">
                    <span>$</span>
                    <input
                      id="precio"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ingresa el precio"
                      value={precioFormateado}
                      onChange={cambiarPrecio}
                      aria-invalid={!!errores.precio}
                    />
                  </div>
                  {errores.precio && <span className="rp-error" role="alert">{errores.precio}</span>}
                </div>
              </div>

              <p className="rp-group">Ubicación</p>
              <div className="rp-grid rp-grid--4">
                <div className={claseCampo("ciudad")}>
                  <label>Ciudad *</label>
                  <Select
                    label="Ciudad"
                    value={form.ciudad}
                    onChange={cambiarCiudad}
                    placeholder="Selecciona una ciudad"
                    options={ciudadesDisponibles}
                    error={errores.ciudad}
                  />
                </div>
                <div className={claseCampo("departamento")}>
                  <label>Departamento *</label>
                  <Select
                    label="Departamento"
                    value={form.departamento}
                    onChange={cambiarDepartamento}
                    placeholder="Selecciona un departamento"
                    options={DEPARTAMENTOS}
                    error={errores.departamento}
                  />
                </div>
                <div className={claseCampo("habitaciones")}>
                  <label>Habitaciones *</label>
                  <Select
                    label="Habitaciones"
                    value={form.habitaciones}
                    onChange={(v) => set("habitaciones", v)}
                    placeholder="Selecciona"
                    options={CONTADOR}
                    error={errores.habitaciones}
                  />
                </div>
                <div className={claseCampo("banos")}>
                  <label>Baños *</label>
                  <Select
                    label="Baños"
                    value={form.banos}
                    onChange={(v) => set("banos", v)}
                    placeholder="Selecciona"
                    options={CONTADOR}
                    error={errores.banos}
                  />
                </div>
              </div>

              <div className="rp-grid rp-grid--area">
                <div className="rp-col">
                  <div className={claseCampo("area")}>
                    <label htmlFor="area">Área (m²) *</label>
                    <input
                      id="area"
                      type="number"
                      min={1}
                      placeholder="Ej. 280"
                      value={form.area}
                      onChange={(e) => set("area", e.target.value)}
                      aria-invalid={!!errores.area}
                    />
                    {errores.area && <span className="rp-error" role="alert">{errores.area}</span>}
                  </div>

                  <div className={`${claseCampo("imagenes")} rp-upload`}>
                    <label>Añadir imagenes*</label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={agregarImagenes}
                    />
                    <button
                      type="button"
                      className="rp-upload__btn"
                      onClick={() => fileRef.current?.click()}
                      disabled={imagenes.length >= MAX_IMAGENES}
                    >
                      Adjuntar imagen <UploadIcon />
                    </button>
                    {errores.imagenes && <span className="rp-error" role="alert">{errores.imagenes}</span>}
                  </div>
                </div>

                <div className={claseCampo("descripcion")}>
                  <label htmlFor="descripcion">Descripción *</label>
                  <textarea
                    id="descripcion"
                    rows={5}
                    maxLength={MAX_DESCRIPCION}
                    placeholder="Describe las características principales del inmueble..."
                    value={form.descripcion}
                    onChange={(e) => set("descripcion", e.target.value)}
                    aria-invalid={!!errores.descripcion}
                  />
                  <span className="rp-counter">
                    {form.descripcion.length}/{MAX_DESCRIPCION}
                  </span>
                  {errores.descripcion && <span className="rp-error" role="alert">{errores.descripcion}</span>}
                </div>
              </div>

              {imagenes.length > 0 && (
                <ul className="rp-previews">
                  {imagenes.map((img) => (
                    <li key={img.url} style={{ backgroundImage: `url(${img.url})` }}>
                      <button
                        type="button"
                        onClick={() => quitarImagen(img.url)}
                        aria-label={`Quitar ${img.file.name}`}
                      >
                        <CloseIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {errorEnvio && (
                <p className="rp-submit-error" role="alert">
                  {errorEnvio}
                </p>
              )}

              <div className="rp-footer">
                <span className="rp-footer__icon">
                  <InfoIcon />
                </span>
                <p>
                  Tu propiedad será revisada por nuestro administrador antes de ser
                  publicada en el sitio.
                  <br />
                  Te notificaremos por correo cuando sea aprobada.
                </p>
                <button type="submit" className="rp-btn" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Proceso de aprobación */}
        <aside className="rp-aside">
          <div className="rp-process">
            <h3>
              <ShieldIcon /> Nuestro proceso de aprobación
            </h3>
            <ol>
              {PASOS.map((paso, i) => (
                <li key={paso.titulo}>
                  <span className="rp-process__num">{i + 1}</span>
                  <div>
                    <strong>{paso.titulo}</strong>
                    <p>{paso.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default RegistrarPropiedad;