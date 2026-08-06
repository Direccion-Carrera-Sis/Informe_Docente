/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CambiarClavePage() {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [formulario, setFormulario] = useState({
    claveActual: "",
    nuevaClave: "",
    confirmarClave: "",
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      setCedula(datosUsuario.cedula);
    } else {
      router.push("/");
    }
  }, [router]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    if (!formulario.claveActual || !formulario.nuevaClave || !formulario.confirmarClave) {
      setMensaje({ texto: "Todos los campos son obligatorios.", tipo: "error" });
      return;
    }

    if (formulario.nuevaClave !== formulario.confirmarClave) {
      setMensaje({ texto: "Las nuevas contraseñas no coinciden.", tipo: "error" });
      return;
    }

    if (formulario.nuevaClave.length < 6) {
      setMensaje({ texto: "La nueva contraseña debe tener al menos 6 caracteres.", tipo: "error" });
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch(`http://localhost:4000/usuarios/docente/${cedula}/cambiar-clave`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claveActual: formulario.claveActual,
          nuevaClave: formulario.nuevaClave,
        }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setMensaje({ texto: "¡Contraseña actualizada con éxito!", tipo: "exito" });
        setFormulario({ claveActual: "", nuevaClave: "", confirmarClave: "" });
      } else {
        setMensaje({ texto: data.message || "Hubo un error al cambiar la contraseña.", tipo: "error" });
      }
    } catch (error) {
      setMensaje({ texto: "Error de conexión con el servidor.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    margin: "8px 0 20px 0",
    boxSizing: "border-box" as const,
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const labelStyle = {
    fontSize: "0.9em",
    color: "#555",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
      }}
    >
      {/* Botón de volver con el mismo estilo gris del formulario principal */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/docente")}
        style={{
          marginBottom: "20px",
          backgroundColor: "#7f8c8d",
          color: "white",
          padding: "8px 15px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ← Volver al Dashboard
      </button>

      {/* Título unificado en azul marino, centrado y mayúsculas */}
      <h2
        style={{
          textAlign: "center",
          borderBottom: "2px solid #1a3b5c",
          paddingBottom: "10px",
          color: "#1a3b5c",
          textTransform: "uppercase",
          marginBottom: "25px",
        }}
      >
        Cambiar Contraseña
      </h2>

      {mensaje.texto && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
            backgroundColor: mensaje.tipo === "error" ? "#fef2f2" : "#f0fdf4",
            color: mensaje.tipo === "error" ? "#991b1b" : "#166534",
            border: `1px solid ${mensaje.tipo === "error" ? "#f87171" : "#86efac"}`,
            fontSize: "0.95em",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label style={labelStyle}>Contraseña Actual:</label>
        <input
          type="password"
          name="claveActual"
          value={formulario.claveActual}
          onChange={manejarCambio}
          style={inputStyle}
        />

        <label style={labelStyle}>Nueva Contraseña:</label>
        <input
          type="password"
          name="nuevaClave"
          value={formulario.nuevaClave}
          onChange={manejarCambio}
          style={inputStyle}
        />

        <label style={labelStyle}>Confirmar Nueva Contraseña:</label>
        <input
          type="password"
          name="confirmarClave"
          value={formulario.confirmarClave}
          onChange={manejarCambio}
          style={inputStyle}
        />

        {/* Botón principal unificado en color azul marino */}
        <button
          type="submit"
          disabled={cargando}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: cargando ? "#9ca3af" : "#1a3b5c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: cargando ? "not-allowed" : "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {cargando ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>
    </div>
  );
}