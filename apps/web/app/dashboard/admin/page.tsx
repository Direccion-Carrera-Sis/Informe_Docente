/* eslint-disable no-empty */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import styles from "../dashboard.module.css";

export default function AdminDashboard() {
  const router = useRouter();

  const [archivoCSV, setArchivoCSV] = useState<File | null>(null);
  const [tipoCSV, setTipoCSV] = useState<string>("docentes");
  const [cargando, setCargando] = useState(false);
  const [vistaActual, setVistaActual] = useState<"csv" | "informes" | "configuracion">("csv");
  const [usuario, setUsuario] = useState<any>(null);
  const [informesGlobales, setInformesGlobales] = useState<any[]>([]);
  const [cargandoConfig, setCargandoConfig] = useState(false);

  // 👉 Extraemos setValue y watch para manejar los logos correctamente
  const { register: registerConfig, handleSubmit: handleConfigSubmit, reset: resetConfig, setValue: setConfigValue, watch: watchConfig } = useForm();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      if (datosUsuario.rol !== "admin" && datosUsuario.rol !== "direccion") {}
      setUsuario(datosUsuario);
      cargarTodosLosInformes();
      cargarConfiguracionSistema(); 
    } else {
      router.push("/login");
    }
  }, []);

  const cargarTodosLosInformes = async () => {
    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes`);
      if (respuesta.ok) {
        const data = await respuesta.json();
        setInformesGlobales(data);
      }
    } catch (error) { console.error("Error al cargar informes:", error); }
  };

  const cargarConfiguracionSistema = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes/sistema/configuracion`);
      if (res.ok) {
        const data = await res.json();
        resetConfig({
          pesoMaximoMB: data.pesoMaximoMB,
          logo_facultad: data.logo_facultad || null,
          logo_carrera: data.logo_carrera || null,
          ...data.reglas,
        });
      }
    } catch (error) { console.error("Error al cargar configuración:", error); }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setArchivoCSV(e.target.files[0] || null);
  };

  const subirArchivo = async () => {
    if (!archivoCSV) return alert("Por favor, selecciona un archivo CSV primero.");
    setCargando(true);
    const formData = new FormData();
    formData.append("file", archivoCSV);
    formData.append("tipo", tipoCSV);

    const urlDestino = tipoCSV === "docentes" ? `${process.env.NEXT_PUBLIC_API_URL}/usuarios/upload` : tipoCSV === "materias" ? `${process.env.NEXT_PUBLIC_API_URL}/asignaciones/upload` : tipoCSV === "titulacion" ? `${process.env.NEXT_PUBLIC_API_URL}/titulaciones/upload` : `${process.env.NEXT_PUBLIC_API_URL}/asignaciones/upload`;

    try {
      const respuesta = await fetch(urlDestino, { method: "POST", body: formData });
      if (respuesta.ok) {
        const data = await respuesta.json();
        let mensajeAlerta = `✅ ¡Éxito! ${data.mensaje}.`;
        if (tipoCSV === "docentes") mensajeAlerta += ` \nNuevos creados: ${data.nuevosCreados} \nActualizados: ${data.docentesActualizados}`;
        else mensajeAlerta += ` \nFilas procesadas: ${data.totalFilasLeidas || 0}`;
        alert(mensajeAlerta);
        setArchivoCSV(null);
        const fileInput = document.getElementById("csvInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else { alert("❌ Hubo un error al procesar el archivo en el servidor."); }
    } catch (error: any) { alert("Error de conexión: " + error.message); } finally { setCargando(false); }
  };

  const guardarConfiguracion = async (data: any) => {
    setCargandoConfig(true);
    const payload = {
      pesoMaximoMB: parseFloat(data.pesoMaximoMB),
      logo_facultad: data.logo_facultad || null,
      logo_carrera: data.logo_carrera || null,
      reglas: {
        general_ficha: data.general_ficha, general_horario: data.general_horario, general_cap_tac: data.general_cap_tac, general_cap_metodologica: data.general_cap_metodologica, general_cap_profesional: data.general_cap_profesional, silabo_evidencia: data.silabo_evidencia, seguimiento_evidencia: data.seguimiento_evidencia, asistencia_evidencia: data.asistencia_evidencia, notas_evidencia: data.notas_evidencia, indiv_evidencia: data.indiv_evidencia, grupales_evidencia: data.grupales_evidencia, pae_evidencia: data.pae_evidencia, refuerzo_evidencia: data.refuerzo_evidencia, sumativa1_evidencia: data.sumativa1_evidencia, sumativa_final_evidencia: data.sumativa_final_evidencia, recuperacion_evidencia: data.recuperacion_evidencia, hab_evidencia: data.hab_evidencia, res_evidencia: data.res_evidencia, tac_evidencia: data.tac_evidencia,
      },
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes/sistema/configuracion`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) alert("✅ ¡Configuración actualizada correctamente para todos los docentes!");
      else alert("Error al guardar la configuración en el servidor.");
    } catch (e) { alert("Error de red al comunicarse con el servidor."); }
    setCargandoConfig(false);
  };

  // 👉 Lógica corregida para cargar y ver los logos en vivo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("El logo no debe pesar más de 1MB.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Guarda el base64 directamente en el estado del formulario de react-hook-form
        setConfigValue(fieldName, reader.result, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const inputStyle = { width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.95em", fontFamily: "monospace", color: "#1e293b", boxSizing: "border-box" as const };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Panel Dirección</h2>
        <ul style={{ marginTop: "2rem", listStyle: "none", padding: 0 }}>
          <li onClick={() => setVistaActual("csv")} style={{ marginBottom: "1rem", color: vistaActual === "csv" ? "#60a5fa" : "inherit", fontWeight: vistaActual === "csv" ? "bold" : "normal", cursor: "pointer" }}>Carga de Datos CSV</li>
          <li onClick={() => setVistaActual("informes")} style={{ marginBottom: "1rem", color: vistaActual === "informes" ? "#60a5fa" : "inherit", fontWeight: vistaActual === "informes" ? "bold" : "normal", cursor: "pointer" }}>Informes de Docentes</li>
          <li onClick={() => setVistaActual("configuracion")} style={{ marginBottom: "1rem", color: vistaActual === "configuracion" ? "#60a5fa" : "inherit", fontWeight: vistaActual === "configuracion" ? "bold" : "normal", cursor: "pointer" }}>Configuración de Archivos</li>
          <li style={{ marginBottom: "1rem", cursor: "pointer" }}>Gestión de Usuarios</li>
          <li style={{ cursor: "pointer" }}>Aprobación Final</li>
        </ul>

        <button onClick={cerrarSesion} style={{ marginTop: "3rem", width: "100%", backgroundColor: "#e74c3c", color: "white", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Cerrar Sesión</button>
      </aside>

      <main className={styles.mainContent}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 className={styles.title}>Administración General</h1>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>Administrador: <b>{usuario?.nombres || "Sesión Activa"}</b></span>
        </div>

        {/* ================= VISTA 1: CARGA DE CSV ================= */}
        {vistaActual === "csv" && (
          <div className={styles.card} style={{ maxWidth: "600px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#1f2937" }}>Cargar Asignaciones (CSV)</h3>
            <p style={{ marginBottom: "1.5rem", color: "#4b5563", fontSize: "0.9rem" }}>Selecciona el tipo de información que vas a cargar y sube el archivo CSV correspondiente.</p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem", color: "#374151" }}>1. ¿Qué tipo de datos vas a subir?</label>
              <select value={tipoCSV} onChange={(e) => setTipoCSV(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontSize: "1rem" }}>
                <option value="docentes">Perfiles de Docentes</option><option value="materias">Asignación de Materias</option><option value="titulacion">Trabajos de Titulación</option><option value="practicas">Prácticas Preprofesionales</option><option value="vinculacion">Proyectos de Vinculación</option><option value="investigacion">Investigación y Publicaciones</option>
              </select>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem", color: "#374151" }}>2. Selecciona el archivo</label>
              <div style={{ padding: "20px", border: "2px dashed #d1d5db", borderRadius: "8px", textAlign: "center", backgroundColor: "#f9fafb" }}>
                <input id="csvInput" type="file" accept=".csv" onChange={manejarCambioArchivo} style={{ display: "block", margin: "0 auto", cursor: "pointer" }} />
                {archivoCSV && <p style={{ marginTop: "10px", color: "#059669", fontWeight: "bold", fontSize: "0.9rem" }}>Archivo listo: {archivoCSV.name}</p>}
              </div>
            </div>
            <button onClick={subirArchivo} disabled={cargando || !archivoCSV} style={{ width: "100%", padding: "0.75rem", backgroundColor: cargando || !archivoCSV ? "#9ca3af" : "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: cargando || !archivoCSV ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1rem" }}>
              {cargando ? "Procesando en el servidor..." : `Subir CSV de ${tipoCSV.toUpperCase()}`}
            </button>
          </div>
        )}

        {/* ================= VISTA 2: INFORMES ================= */}
        {vistaActual === "informes" && (
          <div className={styles.card} style={{ maxWidth: "1000px" }}>
            <h3 style={{ marginBottom: "1rem", color: "#1f2937", borderBottom: "2px solid #e5e7eb", paddingBottom: "10px" }}>Todos los Informes Registrados</h3>
            {informesGlobales.length === 0 ? (
              <p style={{ color: "#777", textAlign: "center", padding: "20px" }}>No hay informes registrados en el sistema por el momento.</p>
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
                        <td style={{ padding: "12px" }}>{informe.datosEstructurales?.docente_nombre || "Sin nombre"}</td>
                        <td style={{ padding: "12px" }}>{informe.periodoAcademico}</td>
                        <td style={{ padding: "12px" }}><span style={{ backgroundColor: "#3b82f6", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" }}>{informe.estado}</span></td>
                        <td style={{ padding: "12px", fontSize: "0.9rem", color: "#6b7280" }}>{new Date(informe.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= VISTA 3: CONFIGURACIÓN ================= */}
        {vistaActual === "configuracion" && (
          <div className={styles.card} style={{ maxWidth: "1000px" }}>
            <h3 style={{ color: "#0f172a", borderBottom: "2px solid #3b82f6", paddingBottom: "10px", marginBottom: "20px" }}>⚙️ Reglas de Nomenclatura y Restricciones</h3>
            
            <form onSubmit={handleConfigSubmit(guardarConfiguracion)}>
              {/* Logos Institucionales */}
              <fieldset style={{ border: "1px solid #cbd5e1", padding: "20px", borderRadius: "6px", marginBottom: "25px", backgroundColor: "#f8fafc" }}>
                <legend style={{ fontWeight: "bold", color: "#334155", padding: "0 10px" }}>Logos Institucionales para el PDF</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  
                  {/* Logo Facultad */}
                  <div style={{ backgroundColor: "#fff", padding: "15px", border: "1px dashed #94a3b8", borderRadius: "6px", textAlign: "center" }}>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px", color: "#1e293b" }}>Logo de la Facultad</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleLogoUpload(e, 'logo_facultad')} style={{ marginBottom: "15px", width: "100%" }} />
                    <input type="hidden" {...registerConfig("logo_facultad")} />
                    
                    <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                       {watchConfig("logo_facultad") ? (
                         <img src={watchConfig("logo_facultad")} alt="Preview" style={{ maxHeight: "80px", maxWidth: "100%", objectFit: "contain" }} />
                      ) : <span style={{ color: "#94a3b8", fontSize: "0.85em" }}>Sin logo cargado</span>}
                    </div>
                    {watchConfig("logo_facultad") && (
                      <button type="button" onClick={() => setConfigValue('logo_facultad', null, {shouldDirty: true})} style={{marginTop: "10px", fontSize: "0.8em", color: "red", cursor: "pointer", border: "none", background: "none"}}>Quitar Logo</button>
                    )}
                  </div>

                  {/* Logo Carrera */}
                  <div style={{ backgroundColor: "#fff", padding: "15px", border: "1px dashed #94a3b8", borderRadius: "6px", textAlign: "center" }}>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "10px", color: "#1e293b" }}>Logo de la Carrera</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleLogoUpload(e, 'logo_carrera')} style={{ marginBottom: "15px", width: "100%" }} />
                    <input type="hidden" {...registerConfig("logo_carrera")} />
                    
                    <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                      {watchConfig("logo_carrera") ? (
                         <img src={watchConfig("logo_carrera")} alt="Preview" style={{ maxHeight: "80px", maxWidth: "100%", objectFit: "contain" }} />
                      ) : <span style={{ color: "#94a3b8", fontSize: "0.85em" }}>Sin logo cargado</span>}
                    </div>
                    {watchConfig("logo_carrera") && (
                      <button type="button" onClick={() => setConfigValue('logo_carrera', null, {shouldDirty: true})} style={{marginTop: "10px", fontSize: "0.8em", color: "red", cursor: "pointer", border: "none", background: "none"}}>Quitar Logo</button>
                    )}
                  </div>

                </div>
              </fieldset>

              <fieldset style={{ border: "1px solid #cbd5e1", padding: "20px", borderRadius: "6px", marginBottom: "25px", backgroundColor: "#f8fafc" }}>
                <legend style={{ fontWeight: "bold", color: "#334155", padding: "0 10px" }}>Restricciones de Sistema</legend>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Peso Máximo permitido por archivo PDF (en Megabytes):</label>
                <input type="number" step="0.1" {...registerConfig("pesoMaximoMB")} style={{ ...inputStyle, width: "150px" }} />
              </fieldset>

              <fieldset style={{ border: "1px solid #cbd5e1", padding: "20px", borderRadius: "6px", marginBottom: "25px", backgroundColor: "#f8fafc" }}>
                <legend style={{ fontWeight: "bold", color: "#334155", padding: "0 10px" }}>Reglas de Carpeta: GENERAL</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>Ficha Académica:</label><input {...registerConfig("general_ficha")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>Horario de Clases:</label><input {...registerConfig("general_horario")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>Capacitación TAC:</label><input {...registerConfig("general_cap_tac")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>Capacitación Metodológica:</label><input {...registerConfig("general_cap_metodologica")} style={inputStyle} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>Capacitación Profesional:</label><input {...registerConfig("general_cap_profesional")} style={inputStyle} /></div>
                </div>
              </fieldset>

              <fieldset style={{ border: "1px solid #cbd5e1", padding: "20px", borderRadius: "6px", backgroundColor: "#f8fafc" }}>
                <legend style={{ fontWeight: "bold", color: "#334155", padding: "0 10px" }}>Reglas de Carpeta: ASIGNATURAS</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>01. Sílabo:</label><input {...registerConfig("silabo_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>02. Seguimiento:</label><input {...registerConfig("seguimiento_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>03. Asistencia:</label><input {...registerConfig("asistencia_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>04. Notas:</label><input {...registerConfig("notas_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>05. Trabajo Individual (TI):</label><input {...registerConfig("indiv_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>06. Trabajo Grupal (TG):</label><input {...registerConfig("grupales_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>07. PAE:</label><input {...registerConfig("pae_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>08. Refuerzo:</label><input {...registerConfig("refuerzo_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>09. Sumativa 1:</label><input {...registerConfig("sumativa1_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>10. Sumativa Final:</label><input {...registerConfig("sumativa_final_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>11. Recuperación:</label><input {...registerConfig("recuperacion_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>12. Habilidades Blandas (HB):</label><input {...registerConfig("hab_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>13. Resultados Ap. (RA):</label><input {...registerConfig("res_evidencia")} style={inputStyle} /></div>
                  <div><label style={{ fontWeight: "bold", fontSize: "0.85em" }}>14. Evidencia TAC:</label><input {...registerConfig("tac_evidencia")} style={inputStyle} /></div>
                </div>
              </fieldset>

              <button type="submit" disabled={cargandoConfig} style={{ width: "100%", marginTop: "30px", padding: "15px", backgroundColor: cargandoConfig ? "#94a3b8" : "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1.1em", fontWeight: "bold", cursor: cargandoConfig ? "not-allowed" : "pointer" }}>
                {cargandoConfig ? "Guardando..." : "Guardar Reglas y Tamaños"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}