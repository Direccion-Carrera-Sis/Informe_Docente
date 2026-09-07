/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  
  // Estados para la carga de CSV (Lo que ya tenías)
  const [archivoCSV, setArchivoCSV] = useState<File | null>(null);
  const [tipoCSV, setTipoCSV] = useState<string>("docentes");
  const [cargando, setCargando] = useState(false);

  // 👉 NUEVOS ESTADOS para informes, navegación y sesión
  const [vistaActual, setVistaActual] = useState<"csv" | "informes">("csv");
  const [usuario, setUsuario] = useState<any>(null);
  const [informesGlobales, setInformesGlobales] = useState<any[]>([]);

  // 👉 NUEVO: Validar sesión y cargar informes al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      // Seguridad: Verificar si es admin (ajusta según cómo guardes el rol)
      if (datosUsuario.rol !== "admin" && datosUsuario.rol !== "direccion") {
        // router.push("/dashboard/docente"); // Descomentar si usas roles estrictos
      }
      setUsuario(datosUsuario);
      cargarTodosLosInformes();
    } else {
      router.push("/login");
    }
  }, []);

  // 👉 NUEVO: Función para traer informes de la BD
  const cargarTodosLosInformes = async () => {
    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes`);
      if (respuesta.ok) {
        const data = await respuesta.json();
        setInformesGlobales(data);
      }
    } catch (error) {
      console.error("Error al cargar informes globales:", error);
    }
  };

  // 👉 NUEVO: Función para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  // Función original de carga CSV
  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoCSV(e.target.files[0] || null);
    }
  };

  const subirArchivo = async () => {
    if (!archivoCSV) {
      alert("Por favor, selecciona un archivo CSV primero.");
      return;
    }
    setCargando(true);
    const formData = new FormData();
    formData.append("file", archivoCSV);
    formData.append("tipo", tipoCSV);

    const urlDestino =
      tipoCSV === "docentes"
        ? `${process.env.NEXT_PUBLIC_API_URL}/usuarios/upload`
        : tipoCSV === "materias"
          ? `${process.env.NEXT_PUBLIC_API_URL}/asignaciones/upload`
          : tipoCSV === "titulacion"
            ? `${process.env.NEXT_PUBLIC_API_URL}/titulaciones/upload`
            : `${process.env.NEXT_PUBLIC_API_URL}/asignaciones/upload`;

    try {
      const respuesta = await fetch(urlDestino, {
        method: "POST",
        body: formData,
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        let mensajeAlerta = `✅ ¡Éxito! ${data.mensaje}.`;
        if (tipoCSV === "docentes") {
          mensajeAlerta += ` \nNuevos creados: ${data.nuevosCreados} \nActualizados: ${data.docentesActualizados}`;
        } else {
          mensajeAlerta += ` \nFilas procesadas: ${data.totalFilasLeidas || 0}`;
        }
        alert(mensajeAlerta);
        setArchivoCSV(null);
        const fileInput = document.getElementById("csvInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        alert("❌ Hubo un error al procesar el archivo en el servidor.");
      }
    } catch (error: any) {
      alert("Error de conexión con la API: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Panel Dirección</h2>
        <ul style={{ marginTop: "2rem", listStyle: "none", padding: 0 }}>
          {/* 👉 NUEVO: Menú interactivo */}
          <li
            onClick={() => setVistaActual("csv")}
            style={{
              marginBottom: "1rem",
              color: vistaActual === "csv" ? "#60a5fa" : "inherit",
              fontWeight: vistaActual === "csv" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            Carga de Datos CSV
          </li>
          <li
            onClick={() => setVistaActual("informes")}
            style={{
              marginBottom: "1rem",
              color: vistaActual === "informes" ? "#60a5fa" : "inherit",
              fontWeight: vistaActual === "informes" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            Informes de Docentes
          </li>
          <li style={{ marginBottom: "1rem", cursor: "pointer" }}>Gestión de Usuarios</li>
          <li style={{ cursor: "pointer" }}>Aprobación Final</li>
        </ul>
        
        {/* 👉 NUEVO: Botón de cerrar sesión en la barra lateral */}
        <button 
          onClick={cerrarSesion}
          style={{ 
            marginTop: "3rem", 
            width: "100%", 
            backgroundColor: "#e74c3c", 
            color: "white", 
            padding: "10px", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer", 
            fontWeight: "bold" 
          }}
        >
          Cerrar Sesión
        </button>
      </aside>

      <main className={styles.mainContent}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 className={styles.title}>Administración General</h1>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>
            Administrador: <b>{usuario?.nombres || "Sesión Activa"}</b>
          </span>
        </div>

        {/* ================= VISTA 1: CARGA DE CSV (Tu código original) ================= */}
        {vistaActual === "csv" && (
          <div className={styles.card} style={{ maxWidth: "600px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#1f2937" }}>
              Cargar Asignaciones (CSV)
            </h3>
            <p style={{ marginBottom: "1.5rem", color: "#4b5563", fontSize: "0.9rem" }}>
              Selecciona el tipo de información que vas a cargar y sube el archivo
              CSV correspondiente exportado desde el sistema central.
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem", color: "#374151" }}>
                1. ¿Qué tipo de datos vas a subir?
              </label>
              <select
                value={tipoCSV}
                onChange={(e) => setTipoCSV(e.target.value)}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontSize: "1rem" }}
              >
                <option value="docentes">Perfiles de Docentes</option>
                <option value="materias">Asignación de Materias</option>
                <option value="titulacion">Trabajos de Titulación</option>
                <option value="practicas">Prácticas Preprofesionales</option>
                <option value="vinculacion">Proyectos de Vinculación</option>
                <option value="investigacion">Investigación y Publicaciones</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem", color: "#374151" }}>
                2. Selecciona el archivo
              </label>
              <div style={{ padding: "20px", border: "2px dashed #d1d5db", borderRadius: "8px", textAlign: "center", backgroundColor: "#f9fafb" }}>
                <input
                  id="csvInput"
                  type="file"
                  accept=".csv"
                  onChange={manejarCambioArchivo}
                  style={{ display: "block", margin: "0 auto", cursor: "pointer" }}
                />
                {archivoCSV && (
                  <p style={{ marginTop: "10px", color: "#059669", fontWeight: "bold", fontSize: "0.9rem" }}>
                    Archivo listo: {archivoCSV.name}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={subirArchivo}
              disabled={cargando || !archivoCSV}
              style={{ width: "100%", padding: "0.75rem", backgroundColor: cargando || !archivoCSV ? "#9ca3af" : "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: cargando || !archivoCSV ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1rem" }}
            >
              {cargando ? "Procesando en el servidor..." : `Subir CSV de ${tipoCSV.toUpperCase()}`}
            </button>
          </div>
        )}

        {/* ================= VISTA 2: INFORMES DE DOCENTES ================= */}
        {vistaActual === "informes" && (
          <div className={styles.card} style={{ maxWidth: "1000px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#1f2937", borderBottom: "2px solid #e5e7eb", paddingBottom: "10px" }}>
              Todos los Informes Registrados
            </h3>
            
            {informesGlobales.length === 0 ? (
              <p style={{ color: "#777", textAlign: "center", padding: "20px" }}>
                No hay informes registrados en el sistema por el momento.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left", color: "#374151" }}>
                      <th style={{ padding: "12px", borderBottom: "2px solid #d1d5db" }}>Docente (Cédula)</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #d1d5db" }}>Nombre del Docente</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #d1d5db" }}>Período</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #d1d5db" }}>Estado</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #d1d5db" }}>Fecha de Envío</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informesGlobales.map((informe) => (
                      <tr key={informe._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>{informe.docenteId}</td>
                        <td style={{ padding: "12px" }}>
                          {informe.datosEstructurales?.docente_nombre || "Sin nombre"}
                        </td>
                        <td style={{ padding: "12px" }}>{informe.periodoAcademico}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ backgroundColor: "#3b82f6", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" }}>
                            {informe.estado}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#6b7280" }}>
                          {new Date(informe.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}