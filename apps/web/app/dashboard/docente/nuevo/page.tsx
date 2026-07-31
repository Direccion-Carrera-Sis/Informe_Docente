/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch, FieldValues } from "react-hook-form";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { PlantillaPDF } from "./PlantillaPDF";

interface AsignaturaData {
  carrera: string;
  materia: string;
  codigo: string;
  paralelo: string;
  estudiantes: string;
  asistencia: string;
  aprobados: string;
  reprobados: string;
  tiene_pae: boolean;
  pae_evidencia: any;
  resultados_tabla: string;
  resultados_actividades: string;
  res_instrumento: string;
  resultados_logro: string;
  res_criterios: string;
  res_acciones: string;
  res_propuestas: string;
  res_cumplimiento: string;
  habilidades_tabla: string[];
  hab_criterios: string;
  hab_instrumento: string;
  habilidades_actividades: string;
  habilidades_logro: string;
  hab_acciones: string;
  hab_propuestas: string;
  hab_cumplimiento: string;
  tac_herramienta: string;
  tac_tabla: string[];
  tac_actividades: string;
  tac_logro: string;
  tac_acciones: string;
  tac_propuestas: string;
  tac_cumplimiento: string;
  res_evidencia: any;
  hab_evidencia: any;
  tac_evidencia: any;
  habilidades_otros?: string;
  tac_otros?: string;
}

const habilidadesOpciones = [
  "Comunicación efectiva",
  "Trabajo en equipo",
  "Liderazgo",
  "Empatía",
  "Resolución de problemas",
  "Adaptabilidad",
  "Gestión del tiempo",
  "Pensamiento crítico",
  "Manejo del estrés",
  "Ética y Responsabilidad",
  "Puntualidad",
  "Otros",
];

const tacOpciones = [
  "Entornos virtuales de aprendizaje (LMS)",
  "Programas ofimáticos",
  "Simuladores académicos",
  "Aplicaciones de realidad virtual o aumentada",
  "Herramientas colaborativas",
  "Recursos multimedia interactivos",
  "Otros",
];

const readOnlyStyle = {
  backgroundColor: "#e9ecef",
  color: "#555",
  cursor: "not-allowed",
};

export default function NuevoInformePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  const [userId, setUserId] = useState<string>("");
  const [esSoloLectura, setEsSoloLectura] = useState(false);

  const [materiaActiva, setMateriaActiva] = useState(0);

  const { register, handleSubmit, control, reset, watch } =
    useForm<FieldValues>({
      defaultValues: { asignaturas: [], titulaciones_asignadas: [] },
    });

  const { fields } = useFieldArray({ control, name: "asignaturas" });
  const watchAsignaturas = useWatch({
    control,
    name: "asignaturas",
    defaultValue: [],
  });

  const { fields: camposTitulacion } = useFieldArray({
    control,
    name: "titulaciones_asignadas",
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      console.log("👤 Usuario en navegador:", datosUsuario);
      setUserId(datosUsuario.cedula);
      setEsSoloLectura(datosUsuario.rol !== "docente");
      cargarDatosPrecargados(datosUsuario);
    } else {
      router.push("/");
    }
  }, []);

  const cargarDatosPrecargados = async (datosUsuario: any) => {
    try {
      console.log("🔍 Buscando datos para la cédula:", datosUsuario.cedula);

      const [resMaterias, resTit] = await Promise.all([
        fetch(
          `http://localhost:4000/asignaciones/docente/${datosUsuario.cedula}`,
        ),
        fetch(
          `http://localhost:4000/titulaciones/docente/${datosUsuario.cedula}`,
        ),
      ]);

      let asignaturasFormateadas = [];
      let titulacionesFormateadas = [];

      if (resMaterias.ok) {
        const materiasAsignadas = await resMaterias.json();
        asignaturasFormateadas = materiasAsignadas.map((m: any) => ({
          carrera: m.carrera || "",
          materia: m.materia || "",
          codigo: m.codigo || "",
          paralelo: m.paralelo || "",
          estudiantes: "",
          asistencia: "",
          aprobados: "",
          reprobados: "",
          tiene_pae: false,
          habilidades_tabla: [],
          tac_tabla: [],
        }));
      }

      if (resTit.ok) {
        const dataTit = await resTit.json();
        if (dataTit && dataTit.length > 0) {
          titulacionesFormateadas = dataTit.map((tit: any) => ({
            estudiante: tit.estudiante,
            tema: tit.tema,
            mecanismo: tit.mecanismo,
            fecha_designacion: "",
            estado: "",
          }));
        }
      }

      reset({
        docente_nombre: datosUsuario.nombres || "",
        periodo: "2026-2026",
        firma_docente: datosUsuario.nombres || "",
        asignaturas:
          asignaturasFormateadas.length > 0
            ? asignaturasFormateadas
            : [
                {
                  carrera: "",
                  materia: "",
                  codigo: "",
                  paralelo: "",
                  tiene_pae: false,
                },
              ],
        titulaciones_asignadas: titulacionesFormateadas,
      });
    } catch (err) {
      console.error("❌ Error de red al comunicarse con el backend:", err);
    }
  };

  const onSubmit = async (data: FieldValues) => {
    setCargando(true);
    try {
      const payload = {
        docenteId: userId,
        periodoAcademico: data.periodo || "2026-2027",
        estado: "Borrador",
        datosEstructurales: {
          docente_nombre: data.docente_nombre,
          fecha_elaboracion: data.fecha_elaboracion,
          firma_docente: data.firma_docente,
          asignaturas: data.asignaturas,
        },
        actividades: {
          titulacion: data.titulaciones_asignadas,
          practicas: {
            estudiante: data.practicas_estudiante,
            id_docente: data.prac_id_docente,
            identificacion: data.prac_identificacion,
            tipo_identificacion: data.prac_tipo_identificacion,
            institucion: data.prac_nombre_institucion,
            tipo_institucion: data.prac_tipo_institucion,
            fecha_inicio: data.prac_fecha_inicio,
            fecha_fin: data.prac_fecha_fin,
            horas: data.prac_numero_horas,
            codigo_ies: data.prac_codigo_ies,
            codigo_carrera: data.prac_codigo_carrera,
            ciudad: data.prac_ciudad_carrera,
            campo: data.prac_campo_especifico,
          },
          vinculacion: {
            nombre: data.vinc_nombre,
            codigo: data.vinc_codigo_proyecto,
            tipo: data.vinc_tipo_proyecto,
            programa: data.vinc_programa,
            estado: data.vinc_estado,
            objetivo: data.vinc_objetivo,
            facultad: data.vinc_facultad,
            fecha_inicio: data.vinc_fecha_inicio,
            fecha_fin_plan: data.vinc_fecha_fin_planeado,
            fecha_fin_real: data.vinc_fecha_fin_real,
            coordinador: data.vinc_coordinador,
            correo: data.vinc_correo_coordinador,
            telefono: data.vinc_telefono_coordinador,
            linea_inv: data.vinc_linea_investigacion,
            alcance: data.vinc_alcance,
            impacto_social: data.vinc_impacto_social,
            impacto_cientifico: data.vinc_impacto_cientifico,
            impacto_economico: data.vinc_impacto_economico,
            impacto_politico: data.vinc_impacto_politico,
            otro_impacto: data.vinc_otro_impacto,
            financiamiento: data.vinc_financiamiento,
            p_planificado: data.vinc_presupuesto_plan,
            p_ejecutado: data.vinc_presupuesto_ejec,
            horas: data.vinc_horas,
            tipo_participante: data.vinc_tipo_participante,
            grupo_inv: data.vinc_grupo_inv,
          },
          investigacion: {
            titulo: data.inv_titulo,
            nombres: data.inv_nombres,
            codigo_ies: data.inv_codigo_ies,
            tipo_pub: data.inv_tipo_publicacion,
            tipo_articulo: data.inv_tipo_articulo,
            codigo_pub: data.inv_codigo_publicacion,
            base_indexada: data.inv_base_indexada,
            issn: data.inv_issn,
            revista: data.inv_revista,
            fecha_pub: data.inv_fecha_pub,
            cargo: data.inv_cargo,
            facultad: data.inv_facultad,
            intercultural: data.inv_intercultural,
            link_pub: data.inv_link_pub,
            link_revista: data.inv_link_revista,
          },
        },
      };

      const respuesta = await fetch("http://localhost:4000/informes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (respuesta.ok) {
        alert("¡Informe guardado con éxito en MongoDB!");
      } else {
        alert("Hubo un error al guardar el informe.");
      }
    } catch (error: any) {
      alert("Error de red: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box" as const,
    border: "1px solid #ccc",
    borderRadius: "4px",
  };
  const fieldsetStyle = {
    marginBottom: "25px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fafafa",
    boxSizing: "border-box" as const,
  };
  const legendStyle = {
    fontWeight: "bold",
    color: "#1a3b5c",
    padding: "0 10px",
    fontSize: "1.1em",
  };
  const subTitleStyle = {
    fontWeight: "bold",
    marginTop: "15px",
    marginBottom: "10px",
    color: "#333",
    borderBottom: "1px solid #ddd",
  };
  const checkboxGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "10px",
    padding: "10px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "10px",
  };
  const checkboxLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "0.95em",
  };

  const descargarPDF = async () => {
    try {
      const valoresActuales = watch();
      const blob = await pdf(<PlantillaPDF datos={valoresActuales} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Informe_${valoresActuales.docente_nombre || "Docente"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al crear el documento PDF.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
      }}
    >
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
        ← Volver al Listado
      </button>

      <h2
        style={{
          textAlign: "center",
          borderBottom: "2px solid #1a3b5c",
          paddingBottom: "10px",
          color: "#1a3b5c",
          textTransform: "uppercase",
        }}
      >
        Informe Unificado de Actividades y Evaluación Docente
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ================= SECCIÓN 1 ================= */}
        <fieldset disabled={esSoloLectura} style={fieldsetStyle}>
          <legend style={legendStyle}>
            1. DATOS GENERALES Y ACTIVIDADES DE DOCENCIA
          </legend>
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "15px",
              minWidth: 0,
            }}
          >
            <div style={{ flex: 2, minWidth: 0 }}>
              <label>Docente:</label>
              <input
                {...register("docente_nombre")}
                type="text"
                readOnly
                style={{
                  ...inputStyle,
                  ...readOnlyStyle,
                  marginBottom: "10px",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label>Período académico:</label>
              <input
                {...register("periodo")}
                type="text"
                readOnly
                style={{
                  ...inputStyle,
                  ...readOnlyStyle,
                  marginBottom: "10px",
                }}
              />
            </div>
          </div>

          <div style={subTitleStyle}>Tabla de Actividades de Docencia</div>
          <div
            style={{ width: "100%", overflowX: "auto", marginBottom: "10px" }}
          >
            <div style={{ minWidth: "950px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "40px 1.5fr 2fr 70px 70px 70px 70px 70px 70px 50px",
                  gap: "5px",
                  fontSize: "0.85em",
                  textAlign: "center",
                  fontWeight: "bold",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div>Nº</div>
                <div>Carrera</div>
                <div>Asignatura / Materia</div>
                <div>Código</div>
                <div>Paralelo</div>
                <div>N° Est.</div>
                <div>% Asist.</div>
                <div>% Aprob.</div>
                <div>% Reprob.</div>
                <div style={{ color: "#0284c7" }}>PAE</div>
              </div>

              {fields.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "40px 1.5fr 2fr 70px 70px 70px 70px 70px 70px 50px",
                    gap: "5px",
                    marginBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "center", fontWeight: "bold" }}>
                    {index + 1}
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.carrera`)}
                      readOnly
                      type="text"
                      style={{ ...inputStyle, ...readOnlyStyle }}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.materia`)}
                      readOnly
                      type="text"
                      style={{ ...inputStyle, ...readOnlyStyle }}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.codigo`)}
                      readOnly
                      type="text"
                      style={{ ...inputStyle, ...readOnlyStyle }}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.paralelo`)}
                      readOnly
                      type="text"
                      style={{ ...inputStyle, ...readOnlyStyle }}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.estudiantes`)}
                      type="number"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.asistencia`)}
                      type="number"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.aprobados`)}
                      type="number"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.reprobados`)}
                      type="number"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <input
                      {...register(`asignaturas.${index}.tiene_pae`)}
                      type="checkbox"
                      style={{ transform: "scale(1.3)", cursor: "pointer" }}
                      title="Marcar si esta materia tiene Horas PAE"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        {/* ================= FILTRO DE MATERIAS (PESTAÑAS) ================= */}
        {fields.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              marginTop: "20px",
              overflowX: "auto",
              paddingBottom: "10px",
            }}
          >
            {fields.map((campo, index) => {
              const nombreMateria =
                watchAsignaturas[index]?.materia || `Asignatura ${index + 1}`;

              return (
                <button
                  key={`tab-${campo.id}`}
                  type="button"
                  onClick={() => setMateriaActiva(index)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor:
                      materiaActiva === index ? "#3498db" : "#f3f4f6",
                    color: materiaActiva === index ? "white" : "#4b5563",
                    border: materiaActiva === index ? "none" : "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: materiaActiva === index ? "bold" : "normal",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    boxShadow:
                      materiaActiva === index
                        ? "0 4px 6px rgba(52, 152, 219, 0.3)"
                        : "none",
                  }}
                >
                  {nombreMateria}
                </button>
              );
            })}
          </div>
        )}

        {/* ================= SECCIÓN 2 (EVALUACIÓN POR MATERIA) ================= */}
        {fields.map((item, index) => (
          <fieldset
            key={`eval-${item.id}`}
            disabled={esSoloLectura}
            style={{
              ...fieldsetStyle,
              borderColor: "#3498db",
              display: materiaActiva === index ? "block" : "none",
            }}
          >
            <legend
              style={{
                ...legendStyle,
                color: "#3498db",
                textTransform: "uppercase",
              }}
            >
              2. EVALUACIÓN ESPECÍFICA:{" "}
              {watchAsignaturas[index]?.materia || `Materia ${index + 1}`}
            </legend>
            <div
              style={{
                display: "flex",
                gap: "15px",
                marginBottom: "15px",
                minWidth: 0,
              }}
            >
              <div style={{ flex: 2, minWidth: 0 }}>
                <label>Asignatura:</label>
                <input
                  value={watchAsignaturas[index]?.materia || ""}
                  readOnly
                  style={{ ...inputStyle, ...readOnlyStyle }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label>Paralelo:</label>
                <input
                  value={watchAsignaturas[index]?.paralelo || ""}
                  readOnly
                  style={{ ...inputStyle, ...readOnlyStyle }}
                />
              </div>
            </div>

            <div style={subTitleStyle}>
              2.1. Resultados de Aprendizaje Evaluados
            </div>
            <label>Resultado de aprendizaje:</label>
            <textarea
              {...register(`asignaturas.${index}.resultados_tabla`)}
              rows={3}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Criterios evaluados:</label>
            <textarea
              {...register(`asignaturas.${index}.res_criterios`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Instrumento de evaluación:</label>
            <textarea
              {...register(`asignaturas.${index}.res_instrumento`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Actividades aplicadas:</label>
            <textarea
              {...register(`asignaturas.${index}.resultados_actividades`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Resultados obtenidos (Logro de aprendizaje):</label>
            <textarea
              {...register(`asignaturas.${index}.resultados_logro`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>

            <label style={{ fontWeight: "bold", color: "#555" }}>
              Mejora Continua:
            </label>
            <div
              style={{
                marginTop: "5px",
                marginBottom: "10px",
                paddingLeft: "10px",
                borderLeft: "3px solid #3498db",
              }}
            >
              <label>Acciones:</label>
              <textarea
                {...register(`asignaturas.${index}.res_acciones`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
              <label>Propuestas:</label>
              <textarea
                {...register(`asignaturas.${index}.res_propuestas`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
              <label>Cumplimiento:</label>
              <textarea
                {...register(`asignaturas.${index}.res_cumplimiento`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
            </div>
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e0f2fe",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  color: "#0284c7",
                  marginBottom: "5px",
                }}
              >
                📎 Cargar Evidencia (Resultados de Aprendizaje):
              </label>
              <input
                type="file"
                multiple
                {...register(`asignaturas.${index}.res_evidencia`)}
                style={inputStyle}
              />
            </div>

            <div style={subTitleStyle}>
              2.2. Habilidades Blandas Implementadas
            </div>
            <div style={checkboxGridStyle}>
              {habilidadesOpciones.map((opcion) => (
                <label key={opcion} style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    value={opcion}
                    {...register(`asignaturas.${index}.habilidades_tabla`)}
                    style={{ transform: "scale(1.2)" }}
                  />{" "}
                  {opcion}
                </label>
              ))}
            </div>

            {watchAsignaturas[index]?.habilidades_tabla?.includes("Otros") && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f9fafb",
                  border: "1px dashed #ccc",
                  borderRadius: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.85em",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  Especifique qué otra Habilidad Blanda:
                </label>
                <input
                  {...register(`asignaturas.${index}.habilidades_otros`)}
                  type="text"
                  placeholder="Escriba la habilidad..."
                  style={{ ...inputStyle, marginTop: "5px" }}
                />
              </div>
            )}

            <label>Criterios Evaluados:</label>
            <textarea
              {...register(`asignaturas.${index}.hab_criterios`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Instrumento:</label>
            <textarea
              {...register(`asignaturas.${index}.hab_instrumento`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Actividades aplicadas:</label>
            <textarea
              {...register(`asignaturas.${index}.habilidades_actividades`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Resultados evidenciados:</label>
            <textarea
              {...register(`asignaturas.${index}.habilidades_logro`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>

            <label style={{ fontWeight: "bold", color: "#555" }}>
              Mejora Continua:
            </label>
            <div
              style={{
                marginTop: "5px",
                marginBottom: "10px",
                paddingLeft: "10px",
                borderLeft: "3px solid #3498db",
              }}
            >
              <label>Acciones:</label>
              <textarea
                {...register(`asignaturas.${index}.hab_acciones`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
              <label>Propuestas:</label>
              <textarea
                {...register(`asignaturas.${index}.hab_propuestas`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
              <label>Cumplimiento:</label>
              <textarea
                {...register(`asignaturas.${index}.hab_cumplimiento`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
            </div>
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e0f2fe",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  color: "#0284c7",
                  marginBottom: "5px",
                }}
              >
                📎 Cargar Evidencia (Habilidades Blandas):
              </label>
              <input
                type="file"
                multiple
                {...register(`asignaturas.${index}.hab_evidencia`)}
                style={inputStyle}
              />
            </div>

            <div style={subTitleStyle}>2.3. TAC Implementadas</div>
            <label>Herramienta TAC:</label>
            <textarea
              {...register(`asignaturas.${index}.tac_herramienta`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <div style={checkboxGridStyle}>
              {tacOpciones.map((opcion) => (
                <label key={opcion} style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    value={opcion}
                    {...register(`asignaturas.${index}.tac_tabla`)}
                    style={{ transform: "scale(1.2)" }}
                  />{" "}
                  {opcion}
                </label>
              ))}
            </div>

            {watchAsignaturas[index]?.tac_tabla?.includes("Otros") && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f9fafb",
                  border: "1px dashed #ccc",
                  borderRadius: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.85em",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  Especifique qué otra herramienta TAC:
                </label>
                <input
                  {...register(`asignaturas.${index}.tac_otros`)}
                  type="text"
                  placeholder="Escriba la herramienta..."
                  style={{ ...inputStyle, marginTop: "5px" }}
                />
              </div>
            )}

            <label>Actividades desarrolladas con TAC:</label>
            <textarea
              {...register(`asignaturas.${index}.tac_actividades`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>
            <label>Resultados obtenidos:</label>
            <textarea
              {...register(`asignaturas.${index}.tac_logro`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
            ></textarea>

            <label style={{ fontWeight: "bold", color: "#555" }}>
              Mejora Continua:
            </label>
            <div
              style={{
                marginTop: "5px",
                marginBottom: "10px",
                paddingLeft: "10px",
                borderLeft: "3px solid #3498db",
              }}
            >
              <label>Acciones:</label>
              <textarea
                {...register(`asignaturas.${index}.tac_acciones`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
              <label>Propuestas:</label>
              <textarea
                {...register(`asignaturas.${index}.tac_propuestas`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
              <label>Cumplimiento:</label>
              <textarea
                {...register(`asignaturas.${index}.tac_cumplimiento`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
              ></textarea>
            </div>
            <div
              style={{
                padding: "10px",
                backgroundColor: "#e0f2fe",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  color: "#0284c7",
                  marginBottom: "5px",
                }}
              >
                📎 Cargar Evidencia (Herramientas TAC):
              </label>
              <input
                type="file"
                multiple
                {...register(`asignaturas.${index}.tac_evidencia`)}
                style={inputStyle}
              />
            </div>

            {watchAsignaturas[index]?.tiene_pae && (
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#fef0f6",
                  border: "1px solid #fbcfe8",
                  borderRadius: "4px",
                  marginTop: "15px",
                  marginBottom: "10px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    color: "#be185d",
                    marginBottom: "5px",
                  }}
                >
                  📎 Cargar Evidencia (Horas PAE):
                </label>
                <p
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    marginBottom: "8px",
                  }}
                >
                  Al haber marcado esta materia con Horas PAE en la Sección 1,
                  debes adjuntar la evidencia respectiva.
                </p>
                <input
                  type="file"
                  multiple
                  {...register(`asignaturas.${index}.pae_evidencia`)}
                  style={inputStyle}
                />
              </div>
            )}
          </fieldset>
        ))}

        {/* ================= SECCIÓN 3: TITULACIÓN (DINÁMICA) ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#e67e22" }}
        >
          <legend style={{ ...legendStyle, color: "#e67e22" }}>
            3. TRABAJOS DE TITULACIÓN
          </legend>

          {camposTitulacion.length === 0 ? (
            <p
              style={{ color: "#555", fontStyle: "italic", padding: "10px 0" }}
            >
              No tienes trabajos de titulación asignados en este período.
            </p>
          ) : (
            camposTitulacion.map((campo, index) => (
              <div
                key={campo.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "15px",
                  padding: "15px",
                  backgroundColor: "#fef9f5",
                  border: "1px solid #fbdcbf",
                  borderRadius: "6px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 250px" }}>
                  <label
                    style={{
                      fontSize: "0.85em",
                      color: "#555",
                      fontWeight: "bold",
                    }}
                  >
                    Estudiante / Mecanismo
                  </label>
                  <input
                    {...register(
                      `titulaciones_asignadas.${index}.estudiante` as const,
                    )}
                    readOnly
                    title="Viene del sistema central"
                    style={{
                      ...inputStyle,
                      backgroundColor: "#e5e7eb",
                      marginBottom: "5px",
                      width: "100%",
                    }}
                  />
                  <input
                    {...register(
                      `titulaciones_asignadas.${index}.mecanismo` as const,
                    )}
                    readOnly
                    style={{
                      ...inputStyle,
                      backgroundColor: "#e5e7eb",
                      fontSize: "0.8em",
                      width: "100%",
                    }}
                  />
                </div>

                <div style={{ flex: "2 1 300px" }}>
                  <label
                    style={{
                      fontSize: "0.85em",
                      color: "#555",
                      fontWeight: "bold",
                    }}
                  >
                    Tema de Titulación
                  </label>
                  <textarea
                    {...register(
                      `titulaciones_asignadas.${index}.tema` as const,
                    )}
                    readOnly
                    style={{
                      ...inputStyle,
                      backgroundColor: "#e5e7eb",
                      width: "100%",
                      height: "70px",
                      resize: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    flex: "1 1 150px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "0.85em",
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      Fecha Designación
                    </label>
                    <input
                      {...register(
                        `titulaciones_asignadas.${index}.fecha_designacion` as const,
                      )}
                      type="date"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "0.85em",
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      Estado
                    </label>
                    <select
                      {...register(
                        `titulaciones_asignadas.${index}.estado` as const,
                      )}
                      style={{ ...inputStyle, width: "100%" }}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="En desarrollo">En desarrollo</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Sustentado">Sustentado</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </fieldset>

        {/* ================= SECCIÓN 4: PRÁCTICAS PREPROFESIONALES ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#8e44ad" }}
        >
          <legend style={{ ...legendStyle, color: "#8e44ad" }}>
            4. PRÁCTICAS PREPROFESIONALES (Tutor)
          </legend>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
              marginBottom: "10px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Nombre del Estudiante:
              </label>
              <input
                {...register("practicas_estudiante")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Tipo Identificación:
              </label>
              <input
                {...register("prac_tipo_identificacion")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Identificación:
              </label>
              <input
                {...register("prac_identificacion")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "15px" }}>
              <div style={{ flex: 2 }}>
                <label
                  style={{
                    fontSize: "0.85em",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  Nombre Institución Receptora:
                </label>
                <input
                  {...register("prac_nombre_institucion")}
                  type="text"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.85em",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  Tipo Institución:
                </label>
                <input
                  {...register("prac_tipo_institucion")}
                  type="text"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Fecha Inicio:
              </label>
              <input
                {...register("prac_fecha_inicio")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Fecha Fin:
              </label>
              <input
                {...register("prac_fecha_fin")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Número de Horas:
              </label>
              <input
                {...register("prac_numero_horas")}
                type="number"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Código IES:
              </label>
              <input
                {...register("prac_codigo_ies")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Código Carrera:
              </label>
              <input
                {...register("prac_codigo_carrera")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Ciudad Carrera:
              </label>
              <input
                {...register("prac_ciudad_carrera")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Campo Específico:
              </label>
              <input
                {...register("prac_campo_especifico")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Identificación Docente Tutor:
              </label>
              <input
                {...register("prac_id_docente")}
                type="text"
                style={inputStyle}
              />
            </div>
          </div>
        </fieldset>

        {/* ================= SECCIÓN 5 ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#e67e22" }}
        >
          <legend style={{ ...legendStyle, color: "#e67e22" }}>
            5. VINCULACIÓN CON LA SOCIEDAD
          </legend>
          <div style={subTitleStyle}>Datos Oficiales del Proyecto</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Nombre del Proyecto:
              </label>
              <input
                {...register("vinc_nombre")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Código Proyecto:
              </label>
              <input
                {...register("vinc_codigo_proyecto")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Tipo Proyecto:
              </label>
              <input
                {...register("vinc_tipo_proyecto")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Programa:
              </label>
              <input
                {...register("vinc_programa")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>Estado:</label>
              <input
                {...register("vinc_estado")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Objetivo:
              </label>
              <textarea
                {...register("vinc_objetivo")}
                rows={2}
                style={inputStyle}
              ></textarea>
            </div>

            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Facultad / Entidad:
              </label>
              <input
                {...register("vinc_facultad")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Fecha Inicio:
              </label>
              <input
                {...register("vinc_fecha_inicio")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Fecha Fin Planeado:
              </label>
              <input
                {...register("vinc_fecha_fin_planeado")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Fecha Fin Real:
              </label>
              <input
                {...register("vinc_fecha_fin_real")}
                type="date"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={subTitleStyle}>Dirección e Impacto</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Coordinador/Director:
              </label>
              <input
                {...register("vinc_coordinador")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Correo Coordinador:
              </label>
              <input
                {...register("vinc_correo_coordinador")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Teléfono:
              </label>
              <input
                {...register("vinc_telefono_coordinador")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Línea Investigación:
              </label>
              <input
                {...register("vinc_linea_investigacion")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Alcance Territorial:
              </label>
              <input
                {...register("vinc_alcance")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Impacto Social:
              </label>
              <input
                {...register("vinc_impacto_social")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Impacto Científico:
              </label>
              <input
                {...register("vinc_impacto_cientifico")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Impacto Económico:
              </label>
              <input
                {...register("vinc_impacto_economico")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Impacto Político:
              </label>
              <input
                {...register("vinc_impacto_politico")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Otro Impacto:
              </label>
              <input
                {...register("vinc_otro_impacto")}
                type="text"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={subTitleStyle}>Gestión Administrativa y Financiera</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Fuente Financiamiento:
              </label>
              <input
                {...register("vinc_financiamiento")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Presupuesto Planificado:
              </label>
              <input
                {...register("vinc_presupuesto_plan")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Presupuesto Ejecutado:
              </label>
              <input
                {...register("vinc_presupuesto_ejec")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Horas de Dedicación:
              </label>
              <input
                {...register("vinc_horas")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Tipo Participante:
              </label>
              <input
                {...register("vinc_tipo_participante")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Grupo Investigación:
              </label>
              <input
                {...register("vinc_grupo_inv")}
                type="text"
                style={inputStyle}
              />
            </div>
          </div>
        </fieldset>

        {/* ================= SECCIÓN 6 ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#e67e22" }}
        >
          <legend style={{ ...legendStyle, color: "#e67e22" }}>
            6. INVESTIGACIÓN Y PUBLICACIONES
          </legend>
          <div style={subTitleStyle}>Publicaciones y Ponencias Acreditadas</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Título de Publicación:
              </label>
              <input
                {...register("inv_titulo")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Nombres y Apellidos (Autores):
              </label>
              <input
                {...register("inv_nombres")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Código IES:
              </label>
              <input
                {...register("inv_codigo_ies")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Tipo Publicación:
              </label>
              <input
                {...register("inv_tipo_publicacion")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Tipo Artículo:
              </label>
              <input
                {...register("inv_tipo_articulo")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Código Publicación:
              </label>
              <input
                {...register("inv_codigo_publicacion")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Base Datos Indexada:
              </label>
              <input
                {...register("inv_base_indexada")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Código ISSN:
              </label>
              <input {...register("inv_issn")} type="text" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Nombre Revista:
              </label>
              <input
                {...register("inv_revista")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Fecha Publicación:
              </label>
              <input
                {...register("inv_fecha_pub")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Cargo Institucional:
              </label>
              <input
                {...register("inv_cargo")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Facultad:
              </label>
              <input
                {...register("inv_facultad")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Enfoque Intercultural:
              </label>
              <input
                {...register("inv_intercultural")}
                type="text"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Link Publicación:
              </label>
              <input
                {...register("inv_link_pub")}
                type="text"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8em", color: "#555" }}>
                Link Revista:
              </label>
              <input
                {...register("inv_link_revista")}
                type="text"
                style={inputStyle}
              />
            </div>
          </div>
        </fieldset>

        {/* ================= SECCIÓN 7 ================= */}
        <fieldset disabled={esSoloLectura} style={fieldsetStyle}>
          <legend style={legendStyle}>7. EVIDENCIAS GENERALES Y CIERRE</legend>
          <label>Evidencias generales:</label>
          <textarea
            {...register("evidencias")}
            rows={3}
            style={{ ...inputStyle, marginBottom: "10px" }}
          ></textarea>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "15px",
              minWidth: 0,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label>Fecha de elaboración:</label>
              <input
                {...register("fecha_elaboracion")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 2, minWidth: "200px" }}>
              <label>Firma y Nombre del Docente:</label>
              <input
                {...register("firma_docente")}
                type="text"
                style={inputStyle}
                placeholder="Nombre completo para firma digital"
              />
            </div>
          </div>
        </fieldset>

        {/* ================= BOTONES FINALES ================= */}
        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
          {!esSoloLectura && (
            <button
              type="submit"
              disabled={cargando}
              style={{
                flex: 1,
                backgroundColor: cargando ? "#9ca3af" : "#1a3b5c",
                color: "#fff",
                padding: "15px",
                border: "none",
                borderRadius: "4px",
                cursor: cargando ? "not-allowed" : "pointer",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {cargando ? "Guardando en MongoDB..." : "Guardar Informe"}
            </button>
          )}

          <button
            type="button"
            onClick={descargarPDF}
            style={{
              flex: 1,
              backgroundColor: "#c0392b",
              color: "#fff",
              padding: "15px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Descargar PDF
          </button>
        </div>
      </form>
    </div>
  );
}