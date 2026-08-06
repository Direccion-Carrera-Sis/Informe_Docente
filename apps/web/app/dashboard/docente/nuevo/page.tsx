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
  const [informeId, setInformeId] = useState<string | null>(null);

  const [acordeon, setAcordeon] = useState({
    sec3: false,
    sec4: false,
    sec5: false,
    sec6: false,
    sec7: false,
  });

  const toggleAcordeon = (seccion: keyof typeof acordeon) => {
    setAcordeon((prev) => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  // 👇 Aquí está la clave: hemos importado 'getValues'
  const { register, handleSubmit, control, reset, watch, getValues } =
    useForm<FieldValues>({
      defaultValues: { asignaturas: [], titulaciones_asignadas: [] },
    });

  const { fields } = useFieldArray({ control, name: "asignaturas" });
  const watchAsignaturas = useWatch({
    control,
    name: "asignaturas",
    defaultValue: [],
  });

  const {
    fields: camposTitulacion,
    append: appendTitulacion,
    remove: removeTitulacion,
  } = useFieldArray({ control, name: "titulaciones_asignadas" });

  const {
    fields: camposLector,
    append: appendLector,
    remove: removeLector,
  } = useFieldArray({
    control,
    name: "titulaciones_lector",
  });

  const {
    fields: camposPracticas,
    append: appendPractica,
    remove: removePractica,
  } = useFieldArray({
    control,
    name: "practicas",
  });

  const {
    fields: camposPublicaciones,
    append: appendPublicacion,
    remove: removePublicacion,
  } = useFieldArray({
    control,
    name: "publicaciones",
  });

  const {
    fields: camposProyectosInv,
    append: appendProyectoInv,
    remove: removeProyectoInv,
  } = useFieldArray({
    control,
    name: "proyectos_investigacion",
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      setUserId(datosUsuario.cedula);
      setEsSoloLectura(datosUsuario.rol !== "docente");

      const urlParams = new URLSearchParams(window.location.search);
      const idDeLaUrl = urlParams.get("id");

      if (idDeLaUrl) {
        console.log("Modo Edición activado para el ID:", idDeLaUrl);
        setInformeId(idDeLaUrl);
        cargarInformeExistente(idDeLaUrl);
      } else {
        console.log("Modo Creación activado");
        cargarDatosPrecargados(datosUsuario);
      }
    } else {
      router.push("/");
    }
  }, []);

  const cargarInformeExistente = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/informes/${id}`);

      if (res.ok) {
        const bd = await res.json();
        console.log("Datos del borrador descargados:", bd);

reset({
          docente_nombre: bd.datosEstructurales?.docente_nombre || "",
          periodo: bd.periodoAcademico || "2026-2026",
          firma_docente: bd.datosEstructurales?.firma_docente || "",
          fecha_elaboracion: bd.datosEstructurales?.fecha_elaboracion || "",
          asignaturas: bd.datosEstructurales?.asignaturas?.length
            ? bd.datosEstructurales.asignaturas
            : [],
          titulaciones_asignadas: bd.actividades?.titulacion || [],
          titulaciones_lector: bd.actividades?.lector || [],

          // 👇 Arreglo de prácticas (Elimina todas las variables viejas)
          practicas: Array.isArray(bd.actividades?.practicas) 
            ? bd.actividades.practicas 
            : [],

          vinc_nombre: bd.actividades?.vinculacion?.nombre || "",
          vinc_codigo_proyecto: bd.actividades?.vinculacion?.codigo || "",
          vinc_tipo_proyecto: bd.actividades?.vinculacion?.tipo || "",
          vinc_programa: bd.actividades?.vinculacion?.programa || "",
          vinc_estado: bd.actividades?.vinculacion?.estado || "",
          vinc_objetivo: bd.actividades?.vinculacion?.objetivo || "",
          vinc_facultad:
            bd.actividades?.vinculacion?.facultad ||
            "Facultad de Ingeniería y Ciencias Aplicadas",
          vinc_fecha_inicio: bd.actividades?.vinculacion?.fecha_inicio || "",
          vinc_fecha_fin_planeado:
            bd.actividades?.vinculacion?.fecha_fin_plan || "",
          vinc_fecha_fin_real:
            bd.actividades?.vinculacion?.fecha_fin_real || "",
          vinc_coordinador: bd.actividades?.vinculacion?.coordinador || "",
          vinc_correo_coordinador: bd.actividades?.vinculacion?.correo || "",
          vinc_telefono_coordinador:
            bd.actividades?.vinculacion?.telefono || "",
          vinc_linea_investigacion:
            bd.actividades?.vinculacion?.linea_inv || "",
          vinc_alcance: bd.actividades?.vinculacion?.alcance || "",
          vinc_impacto_social:
            bd.actividades?.vinculacion?.impacto_social || "",
          vinc_impacto_cientifico:
            bd.actividades?.vinculacion?.impacto_cientifico || "",
          vinc_impacto_economico:
            bd.actividades?.vinculacion?.impacto_economico || "",
          vinc_impacto_politico:
            bd.actividades?.vinculacion?.impacto_politico || "",
          vinc_otro_impacto: bd.actividades?.vinculacion?.otro_impacto || "",
          vinc_financiamiento:
            bd.actividades?.vinculacion?.financiamiento || "",
          vinc_presupuesto_plan:
            bd.actividades?.vinculacion?.p_planificado || "",
          vinc_presupuesto_ejec: bd.actividades?.vinculacion?.p_ejecutado || "",
          vinc_horas: bd.actividades?.vinculacion?.horas || "",
          vinc_tipo_participante:
            bd.actividades?.vinculacion?.tipo_participante || "",
          vinc_grupo_inv: bd.actividades?.vinculacion?.grupo_inv || "",

          publicaciones: Array.isArray(
            bd.actividades?.investigacion?.publicaciones,
          )
            ? bd.actividades.investigacion.publicaciones
            : [],
          proyectos_investigacion: Array.isArray(
            bd.actividades?.investigacion?.proyectos,
          )
            ? bd.actividades.investigacion.proyectos
            : [],

          // 👇 Designaciones leyendo de datosEstructurales
          designaciones: bd.datosEstructurales?.designaciones || "",
          designaciones_fecha_inicio: bd.datosEstructurales?.designaciones_fecha_inicio || "",
          designaciones_fecha_fin: bd.datosEstructurales?.designaciones_fecha_fin || "",
        });
      } else {
        alert("El backend no pudo encontrar este informe para editarlo.");
      }
    } catch (error) {
      console.error("Error al cargar el informe:", error);
    }
  };

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
        vinc_facultad: "Facultad de Ingeniería y Ciencias Aplicadas",
      });
    } catch (err) {
      console.error("Error de red al comunicarse con el backend:", err);
    }
  };

  const onSubmit = async (data: FieldValues) => {
    setCargando(true);
    try {
      const payload = {
        docenteId: userId,
        periodoAcademico: data.periodo || "2026-2026",
        estado: "Borrador",
        progreso: calcularProgreso(),
        datosEstructurales: {
          docente_nombre: data.docente_nombre,
          fecha_elaboracion: data.fecha_elaboracion,
          firma_docente: data.firma_docente,
          asignaturas: data.asignaturas,
          // 👇 Aquí van las designaciones
          designaciones: data.designaciones,
          designaciones_fecha_inicio: data.designaciones_fecha_inicio,
          designaciones_fecha_fin: data.designaciones_fecha_fin,
        },
        actividades: {
          titulacion: data.titulaciones_asignadas,
          lector: data.titulaciones_lector,
          practicas: data.practicas, // 👈 Esto enviará el arreglo completo
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
            publicaciones: data.publicaciones,
            proyectos: data.proyectos_investigacion,
          },
        },
      };

      const url = informeId
        ? `http://localhost:4000/informes/${informeId}`
        : "http://localhost:4000/informes";

      const metodo = informeId ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (respuesta.ok) {
        const resultado = await respuesta.json();

        if (!informeId && resultado._id) {
          setInformeId(resultado._id);
        }

        alert(
          informeId
            ? "¡Informe actualizado correctamente!"
            : "¡Informe guardado!",
        );
      } else {
        alert("Hubo un error al guardar el informe.");
      }
    } catch (error: any) {
      alert("Error de red: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // 👇 Lógica para PDF (Verifica Sección 1 y TODA la Sección 2)
  const descargarPDF = async () => {
    const valoresActuales = getValues();

    // ================= VALIDACIÓN OBLIGATORIA (SECCIONES 1 y 2) =================
    let formularioIncompleto = false;
    let mensajeFalta = "";

    // Lista de todos los cuadros de texto obligatorios de la Sección 2
    const camposTextoSec2 = [
      "resultados_tabla",
      "res_criterios",
      "res_instrumento",
      "resultados_actividades",
      "resultados_logro",
      "res_acciones",
      "res_propuestas",
      "res_cumplimiento",
      "hab_criterios",
      "hab_instrumento",
      "habilidades_actividades",
      "habilidades_logro",
      "hab_acciones",
      "hab_propuestas",
      "hab_cumplimiento",
      "tac_herramienta",
      "tac_actividades",
      "tac_logro",
      "tac_acciones",
      "tac_propuestas",
      "tac_cumplimiento",
    ];

    if (valoresActuales.asignaturas && valoresActuales.asignaturas.length > 0) {
      formularioIncompleto = valoresActuales.asignaturas.some(
        (asig: any, index: number) => {
          // 1. Validamos Sección 1 (Campos numéricos)
          const faltaEst =
            asig.estudiantes === "" || asig.estudiantes === undefined;
          const faltaAsist =
            asig.asistencia === "" || asig.asistencia === undefined;
          const faltaAprob =
            asig.aprobados === "" || asig.aprobados === undefined;
          const faltaReprob =
            asig.reprobados === "" || asig.reprobados === undefined;

          if (faltaEst || faltaAsist || faltaAprob || faltaReprob) {
            mensajeFalta = `Faltan datos en la Sección 1.`;
            return true;
          }

          // 2. Validamos Sección 2 (Campos de Texto)
          const faltaTextos = camposTextoSec2.some(
            (campo) => !asig[campo] || asig[campo].trim() === "",
          );
          if (faltaTextos) {
            mensajeFalta = `Faltan datos en la Sección 2.1`;
            return true;
          }

          // 3. Validamos Sección 2 (Checkboxes obligatorios)
          if (!asig.habilidades_tabla || asig.habilidades_tabla.length === 0) {
            mensajeFalta = `Faltan datos en la Sección 2.2.`;
            return true;
          }
          if (!asig.tac_tabla || asig.tac_tabla.length === 0) {
            mensajeFalta = `Faltan datos en la Sección 2.3.`;
            return true;
          }

          return false;
        },
      );
    }

    if (formularioIncompleto) {
      alert(
        `Para descargar el PDF, debes completar las Secciones 1 y 2.\n\nDetalle: ${mensajeFalta}`,
      );
      return;
    }
    // =========================================================================

    try {
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

  // 👇 Función para bloquear letras en inputs number (Mantén esto igual)
  const bloquearCaracteresInvalidos = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  // 👇 Progreso que observa TODOS los 27 campos requeridos por Asignatura
  const asignaturasVigiladas = watch("asignaturas");

  const calcularProgreso = () => {
    if (!asignaturasVigiladas || asignaturasVigiladas.length === 0) return 0;

    const camposSec1 = ["estudiantes", "asistencia", "aprobados", "reprobados"];
    const camposSec2 = [
      "resultados_tabla",
      "res_criterios",
      "res_instrumento",
      "resultados_actividades",
      "resultados_logro",
      "res_acciones",
      "res_propuestas",
      "res_cumplimiento",
      "hab_criterios",
      "hab_instrumento",
      "habilidades_actividades",
      "habilidades_logro",
      "hab_acciones",
      "hab_propuestas",
      "hab_cumplimiento",
      "tac_herramienta",
      "tac_actividades",
      "tac_logro",
      "tac_acciones",
      "tac_propuestas",
      "tac_cumplimiento",
    ];

    // 4 numéricos + 21 textos + 2 arrays de checkboxes = 27 requerimientos por materia
    const camposPorMateria = camposSec1.length + camposSec2.length + 2;
    const camposTotales = asignaturasVigiladas.length * camposPorMateria;
    let camposLlenos = 0;

    asignaturasVigiladas.forEach((asig: any) => {
      // 1. Contar campos numéricos
      camposSec1.forEach((campo) => {
        if (asig[campo] !== "" && asig[campo] !== undefined) camposLlenos++;
      });

      // 2. Contar campos de texto
      camposSec2.forEach((campo) => {
        if (asig[campo] && asig[campo].trim() !== "") camposLlenos++;
      });

      // 3. Contar checkboxes seleccionados
      if (asig.habilidades_tabla && asig.habilidades_tabla.length > 0)
        camposLlenos++;
      if (asig.tac_tabla && asig.tac_tabla.length > 0) camposLlenos++;
    });

    return Math.round((camposLlenos / camposTotales) * 100) || 0;
  };

  const progreso = calcularProgreso();

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

      {/* BARRA DE PROGRESO */}
      <div
        style={{
          marginBottom: "25px",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          padding: "15px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontWeight: "bold",
            color: "#374151",
          }}
        >
          <span>Progreso de Llenado</span>
          <span style={{ color: progreso === 100 ? "#16a085" : "#2980b9" }}>
            {progreso}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor: "#e5e7eb",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progreso}%`,
              backgroundColor: progreso === 100 ? "#2ecc71" : "#3498db",
              transition: "width 0.4s ease-in-out",
            }}
          />
        </div>
      </div>

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
                      min="0"
                      onKeyDown={bloquearCaracteresInvalidos}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.asistencia`)}
                      type="number"
                      min="0"
                      onKeyDown={bloquearCaracteresInvalidos}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.aprobados`)}
                      type="number"
                      min="0"
                      onKeyDown={bloquearCaracteresInvalidos}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      {...register(`asignaturas.${index}.reprobados`)}
                      type="number"
                      min="0"
                      onKeyDown={bloquearCaracteresInvalidos}
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
                    border:
                      materiaActiva === index ? "none" : "1px solid #d1d5db",
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
              placeholder="Aplica conceptos de Arquitectura de Computadores en la resolución de problemas."
            ></textarea>
            <label>Criterios evaluados:</label>
            <textarea
              {...register(`asignaturas.${index}.res_criterios`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Aplicación práctica, Comprensión conceptual, Análisis de resultados"
            ></textarea>
            <label>Instrumento de evaluación:</label>
            <textarea
              {...register(`asignaturas.${index}.res_instrumento`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Exámenes, Tareas, Proyectos"
            ></textarea>
            <label>Actividades aplicadas:</label>
            <textarea
              {...register(`asignaturas.${index}.resultados_actividades`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Actividades de aula, Trabajos prácticos, Proyectos de investigación"
            ></textarea>
            <label>Resultados obtenidos (Logro de aprendizaje):</label>
            <textarea
              {...register(`asignaturas.${index}.resultados_logro`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Desarrollo de proyectos integradores / Evaluaciones prácticas y teóricas / Uso de simuladores y herramientas digitales (TAC) / Resolución de problemas en clase / Actividades en aula virtual, etc"
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
                placeholder="Acciones para mejorar el desempeño..."
              ></textarea>
              <label>Propuestas:</label>
              <textarea
                {...register(`asignaturas.${index}.res_propuestas`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
                placeholder="Propuestas para mejorar el desempeño..."
              ></textarea>
              <label>Cumplimiento:</label>
              <textarea
                {...register(`asignaturas.${index}.res_cumplimiento`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
                placeholder="Se cumplió el 100% de los resultados de aprendizaje planificados en el sílabo / Se cumplió la mayoría de los resultados, con ajustes en ciertas actividades por tiempo "
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
              placeholder="Criterios de evaluación para las habilidades blandas"
            ></textarea>
            <label>Instrumento:</label>
            <textarea
              {...register(`asignaturas.${index}.hab_instrumento`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Instrumento de evaluación para las habilidades blandas"
            ></textarea>
            <label>Actividades aplicadas:</label>
            <textarea
              {...register(`asignaturas.${index}.habilidades_actividades`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Actividades aplicadas para desarrollar las habilidades blandas"
            ></textarea>
            <label>Resultados evidenciados:</label>
            <textarea
              {...register(`asignaturas.${index}.habilidades_logro`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Resultados evidenciados en el desarrollo de las habilidades blandas"
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
                placeholder="Acciones para mejorar el desempeño..."
              ></textarea>
              <label>Propuestas:</label>
              <textarea
                {...register(`asignaturas.${index}.hab_propuestas`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
                placeholder="Propuestas para mejorar el desempeño..."
              ></textarea>
              <label>Cumplimiento:</label>
              <textarea
                {...register(`asignaturas.${index}.hab_cumplimiento`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
                placeholder="Cumplimiento de las acciones y propuestas implementadas"
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
              placeholder="Herramienta TAC utilizada en la enseñanza"
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
              placeholder="Actividades desarrolladas con la herramienta TAC"
            ></textarea>
            <label>Resultados obtenidos:</label>
            <textarea
              {...register(`asignaturas.${index}.tac_logro`)}
              rows={2}
              style={{ ...inputStyle, marginBottom: "10px" }}
              placeholder="Resultados obtenidos con la herramienta TAC"
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
                placeholder="Acciones para mejorar el desempeño..."
              ></textarea>
              <label>Propuestas:</label>
              <textarea
                {...register(`asignaturas.${index}.tac_propuestas`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
                placeholder="Propuestas para mejorar el desempeño..."
              ></textarea>
              <label>Cumplimiento:</label>
              <textarea
                {...register(`asignaturas.${index}.tac_cumplimiento`)}
                rows={2}
                style={{ ...inputStyle, marginBottom: "8px" }}
                placeholder="Cumplimiento de las acciones y propuestas implementadas"
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

        {/* ================= SECCIÓN 3: TITULACIÓN ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#e67e22" }}
        >
          <legend
            onClick={() => toggleAcordeon("sec3")}
            style={{
              ...legendStyle,
              color: "#e67e22",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            3. TRABAJOS DE TITULACIÓN
            <span
              style={{
                marginLeft: "15px",
                fontSize: "0.8em",
                backgroundColor: "#fbdcbf",
                padding: "4px 10px",
                borderRadius: "12px",
                color: "#d35400",
              }}
            >
              {acordeon.sec3 ? "Ocultar ▲" : "Mostrar ▼"}
            </span>
          </legend>

          {acordeon.sec3 && (
            <div style={{ paddingTop: "10px" }}>
              {/* ================= TUTOR DE TITULACIÓN ================= */}
              <div style={{ ...subTitleStyle, color: "#d35400" }}>
                Participación como Tutor de Titulación
              </div>

              <button
                type="button"
                onClick={() =>
                  appendTitulacion({
                    estudiante: "",
                    mecanismo: "",
                    tema: "",
                    fecha_designacion: "",
                    estado: "",
                  })
                }
                style={{
                  marginBottom: "15px",
                  padding: "8px 15px",
                  backgroundColor: "#e67e22",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Añadir Proyecto como Tutor
              </button>

              {camposTitulacion.map((campo, index) => (
                <div
                  key={campo.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                    padding: "15px",
                    backgroundColor: "#fff",
                    border: "1px solid #fbdcbf",
                    borderRadius: "6px",
                    flexWrap: "wrap",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeTitulacion(index)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#c0392b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    X Eliminar
                  </button>

                  <div style={{ flex: "1 1 250px", marginTop: "15px" }}>
                    <label
                      style={{
                        fontSize: "0.85em",
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      Estudiante
                    </label>
                    <input
                      {...register(
                        `titulaciones_asignadas.${index}.estudiante` as const,
                      )}
                      placeholder="Nombre del estudiante"
                      style={{
                        ...inputStyle,
                        marginBottom: "5px",
                        width: "100%",
                      }}
                    />
                    <label
                      style={{
                        fontSize: "0.85em",
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      Mecanismo
                    </label>
                    <input
                      {...register(
                        `titulaciones_asignadas.${index}.mecanismo` as const,
                      )}
                      placeholder="Ej. Proyecto de Grado"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                  <div style={{ flex: "2 1 300px", marginTop: "15px" }}>
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
                      placeholder="Escriba el tema..."
                      style={{
                        ...inputStyle,
                        width: "100%",
                        height: "100px",
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
                      marginTop: "15px",
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
              ))}

              {camposTitulacion.length === 0 && (
                <p
                  style={{
                    color: "#555",
                    fontStyle: "italic",
                    padding: "0 0 15px 0",
                  }}
                >
                  No hay proyectos de titulación asignados.
                </p>
              )}

              {/* ================= LECTOR MANUAL ================= */}
              <div
                style={{
                  ...subTitleStyle,
                  marginTop: "25px",
                  color: "#d35400",
                }}
              >
                Participación como Docente Lector / Tribunal
              </div>
              <button
                type="button"
                onClick={() =>
                  appendLector({
                    estudiante: "",
                    mecanismo: "",
                    tema: "",
                    fecha_designacion: "",
                    estado: "",
                  })
                }
                style={{
                  marginBottom: "15px",
                  padding: "8px 15px",
                  backgroundColor: "#e67e22",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Añadir Proyecto como Lector
              </button>

              {camposLector.map((campo, index) => (
                <div
                  key={campo.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                    padding: "15px",
                    backgroundColor: "#fff",
                    border: "1px dashed #e67e22",
                    borderRadius: "6px",
                    flexWrap: "wrap",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeLector(index)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#c0392b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    X Eliminar
                  </button>
                  <div style={{ flex: "1 1 250px", marginTop: "15px" }}>
                    <label
                      style={{
                        fontSize: "0.85em",
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      Estudiante
                    </label>
                    <input
                      {...register(`titulaciones_lector.${index}.estudiante`)}
                      style={{
                        ...inputStyle,
                        marginBottom: "5px",
                        width: "100%",
                      }}
                      placeholder="Nombre del estudiante"
                    />
                    <label
                      style={{
                        fontSize: "0.85em",
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      Mecanismo
                    </label>
                    <input
                      {...register(`titulaciones_lector.${index}.mecanismo`)}
                      style={{ ...inputStyle, width: "100%" }}
                      placeholder="Ej. Proyecto de Grado"
                    />
                  </div>
                  <div style={{ flex: "2 1 300px", marginTop: "15px" }}>
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
                      {...register(`titulaciones_lector.${index}.tema`)}
                      style={{
                        ...inputStyle,
                        width: "100%",
                        height: "100px",
                        resize: "none",
                      }}
                      placeholder="Escriba el tema..."
                    />
                  </div>
                  <div
                    style={{
                      flex: "1 1 150px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginTop: "15px",
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
                          `titulaciones_lector.${index}.fecha_designacion`,
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
                        {...register(`titulaciones_lector.${index}.estado`)}
                        style={{ ...inputStyle, width: "100%" }}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Sustentado">Sustentado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {camposLector.length === 0 && (
                <p
                  style={{
                    color: "#555",
                    fontStyle: "italic",
                    padding: "0 0 10px 0",
                  }}
                >
                  No hay proyectos como lector agregados.
                </p>
              )}
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 4: PRÁCTICAS PREPROFESIONALES ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#8e44ad" }}
        >
          <legend
            onClick={() => toggleAcordeon("sec4")}
            style={{
              ...legendStyle,
              color: "#8e44ad",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            4. PRÁCTICAS PREPROFESIONALES (Tutor)
            <span
              style={{
                marginLeft: "15px",
                fontSize: "0.8em",
                backgroundColor: "#e8daef",
                padding: "4px 10px",
                borderRadius: "12px",
                color: "#6c3483",
              }}
            >
              {acordeon.sec4 ? "Ocultar ▲" : "Mostrar ▼"}
            </span>
          </legend>

          {acordeon.sec4 && (
            <div style={{ paddingTop: "10px" }}>
              <button
                type="button"
                onClick={() =>
                  appendPractica({
                    estudiante: "",
                    tipo_identificacion: "",
                    identificacion: "",
                    empresa: "",
                    tipo_empresa: "",
                    fecha_designacion: "",
                  })
                }
                style={{
                  marginBottom: "15px",
                  padding: "8px 15px",
                  backgroundColor: "#8e44ad",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Añadir Estudiante
              </button>

              {camposPracticas.map((campo, index) => (
                <div
                  key={campo.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                    padding: "15px",
                    backgroundColor: "#fff",
                    border: "1px dashed #8e44ad",
                    borderRadius: "6px",
                    flexWrap: "wrap",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removePractica(index)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#c0392b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    X Eliminar
                  </button>

                  <div
                    style={{
                      flex: "1 1 100%",
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "15px",
                      marginTop: "15px",
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
                        Estudiante:
                      </label>
                      <input
                        {...register(`practicas.${index}.estudiante`)}
                        type="text"
                        style={inputStyle}
                        placeholder="Nombre completo"
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
                      <select
                        {...register(`practicas.${index}.tipo_identificacion`)}
                        style={{ ...inputStyle, backgroundColor: "#fff" }}
                      >
                        <option value="">Seleccione...</option>
                        <option value="Cédula">Cédula</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
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
                        {...register(`practicas.${index}.identificacion`)}
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
                        Empresa:
                      </label>
                      <input
                        {...register(`practicas.${index}.empresa`)}
                        type="text"
                        style={inputStyle}
                        placeholder="Nombre de la empresa"
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
                        Tipo Empresa:
                      </label>
                      <select
                        {...register(`practicas.${index}.tipo_empresa`)}
                        style={{ ...inputStyle, backgroundColor: "#fff" }}
                      >
                        <option value="">Seleccione...</option>
                        <option value="Pública">Pública</option>
                        <option value="Privada">Privada</option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: "0.85em",
                          color: "#555",
                          fontWeight: "bold",
                        }}
                      >
                        Fecha Designación:
                      </label>
                      <input
                        {...register(`practicas.${index}.fecha_designacion`)}
                        type="date"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {camposPracticas.length === 0 && (
                <p
                  style={{
                    color: "#555",
                    fontStyle: "italic",
                    padding: "10px 0",
                  }}
                >
                  No hay estudiantes de prácticas agregados.
                </p>
              )}
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 5 ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#e67e22" }}
        >
          <legend
            onClick={() => toggleAcordeon("sec5")}
            style={{
              ...legendStyle,
              color: "#e67e22",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            5. VINCULACIÓN CON LA SOCIEDAD
            <span
              style={{
                marginLeft: "15px",
                fontSize: "0.8em",
                backgroundColor: "#fbdcbf",
                padding: "4px 10px",
                borderRadius: "12px",
                color: "#d35400",
              }}
            >
              {acordeon.sec5 ? "Ocultar ▲" : "Mostrar ▼"}
            </span>
          </legend>

          {acordeon.sec5 && (
            <div style={{ paddingTop: "10px" }}>
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
                  <label style={{ fontSize: "0.8em", color: "#555" }}>
                    Estado:
                  </label>
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
                    readOnly
                    style={{ ...inputStyle, ...readOnlyStyle }}
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

              <div style={subTitleStyle}>
                Gestión Administrativa y Financiera
              </div>
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
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 6 ================= */}
        <fieldset
          disabled={esSoloLectura}
          style={{ ...fieldsetStyle, borderColor: "#e67e22" }}
        >
          <legend
            onClick={() => toggleAcordeon("sec6")}
            style={{
              ...legendStyle,
              color: "#e67e22",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            6. INVESTIGACIÓN Y PUBLICACIONES
            <span
              style={{
                marginLeft: "15px",
                fontSize: "0.8em",
                backgroundColor: "#fbdcbf",
                padding: "4px 10px",
                borderRadius: "12px",
                color: "#d35400",
              }}
            >
              {acordeon.sec6 ? "Ocultar ▲" : "Mostrar ▼"}
            </span>
          </legend>

          {acordeon.sec6 && (
            <div style={{ paddingTop: "10px" }}>
              {/* ------------ SUBCATEGORÍA: PUBLICACIONES ------------ */}
              <div style={subTitleStyle}>
                Publicaciones y Ponencias Acreditadas
              </div>

              <button
                type="button"
                onClick={() =>
                  appendPublicacion({
                    titulo: "",
                    nombres: "",
                    codigo_ies: "",
                    tipo_pub: "",
                    tipo_articulo: "",
                    codigo_pub: "",
                    base_indexada: "",
                    issn: "",
                    revista: "",
                    fecha_pub: "",
                    cargo: "",
                    facultad: "Facultad de Ingeniería y Ciencias Aplicadas", // 👈 VALOR POR DEFECTO AÑADIDO
                    intercultural: "",
                    link_pub: "",
                    link_revista: "",
                  })
                }
                style={{
                  marginBottom: "15px",
                  padding: "8px 15px",
                  backgroundColor: "#e67e22",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Añadir Publicación / Ponencia
              </button>

              {camposPublicaciones.map((campo, index) => (
                <div
                  key={campo.id}
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#fff",
                    border: "1px dashed #e67e22",
                    borderRadius: "6px",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removePublicacion(index)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#c0392b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    X Eliminar
                  </button>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px",
                      marginTop: "15px",
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
                        {...register(`publicaciones.${index}.titulo`)}
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
                        {...register(`publicaciones.${index}.nombres`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Código IES:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.codigo_ies`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>

                    {/* 👇 TIPO PUBLICACIÓN COMO SELECT */}
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Tipo Publicación:
                      </label>
                      <select
                        {...register(`publicaciones.${index}.tipo_pub`)}
                        style={{ ...inputStyle, backgroundColor: "#fff" }}
                      >
                        <option value="">Seleccione...</option>
                        <option value="Artículo">Artículo</option>
                        <option value="Capítulo de Libro">
                          Capítulo de Libro
                        </option>
                        <option value="Libro">Libro</option>
                      </select>
                    </div>

                    {/* 👇 TIPO ARTÍCULO COMO SELECT */}
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Tipo Artículo:
                      </label>
                      <select
                        {...register(`publicaciones.${index}.tipo_articulo`)}
                        style={{ ...inputStyle, backgroundColor: "#fff" }}
                      >
                        <option value="">Seleccione...</option>
                        <option value="Revista">Revista</option>
                        <option value="Congreso">Congreso</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Código Publicación:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.codigo_pub`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Base Datos Indexada:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.base_indexada`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Código ISSN:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.issn`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Nombre Revista:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.revista`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Fecha Publicación:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.fecha_pub`)}
                        type="date"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Cargo Institucional:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.cargo`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>

                    {/* 👇 FACULTAD BLOQUEADA (SOLO LECTURA) */}
                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Facultad:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.facultad`)}
                        type="text"
                        defaultValue="Facultad de Ingeniería y Ciencias Aplicadas"
                        readOnly // Bloquea la edición
                        style={{ ...inputStyle, ...readOnlyStyle }} // Estilo grisáceo
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Enfoque Intercultural:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.intercultural`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Link Publicación:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.link_pub`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "0.8em", color: "#555" }}>
                        Link Revista:
                      </label>
                      <input
                        {...register(`publicaciones.${index}.link_revista`)}
                        type="text"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {camposPublicaciones.length === 0 && (
                <p
                  style={{
                    color: "#555",
                    fontStyle: "italic",
                    padding: "0 0 15px 0",
                  }}
                >
                  No hay publicaciones agregadas.
                </p>
              )}

              {/* ------------ SUBCATEGORÍA: PROYECTOS DE INVESTIGACIÓN ------------ */}
              <div style={{ ...subTitleStyle, marginTop: "20px" }}>
                Proyectos de Investigación
              </div>

              <button
                type="button"
                onClick={() =>
                  appendProyectoInv({
                    proyecto: "",
                    institucion: "",
                    cargo: "",
                    fecha_designacion: "",
                    fecha_inicio: "", // 👈 NUEVO CAMPO AL CREAR
                    fecha_fin: "", // 👈 NUEVO CAMPO AL CREAR
                  })
                }
                style={{
                  marginBottom: "15px",
                  padding: "8px 15px",
                  backgroundColor: "#e67e22",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Añadir Proyecto de Investigación
              </button>

              {camposProyectosInv.map((campo, index) => (
                <div
                  key={campo.id}
                  style={{
                    marginBottom: "15px",
                    padding: "15px",
                    backgroundColor: "#fff",
                    border: "1px dashed #e67e22",
                    borderRadius: "6px",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeProyectoInv(index)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#c0392b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                  >
                    X Eliminar
                  </button>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px",
                      marginTop: "15px",
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
                        Proyecto:
                      </label>
                      <input
                        {...register(
                          `proyectos_investigacion.${index}.proyecto`,
                        )}
                        type="text"
                        style={inputStyle}
                        placeholder="Nombre del proyecto"
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
                        Institución:
                      </label>
                      <input
                        {...register(
                          `proyectos_investigacion.${index}.institucion`,
                        )}
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
                        Cargo:
                      </label>
                      <input
                        {...register(`proyectos_investigacion.${index}.cargo`)}
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
                        Fecha de designación:
                      </label>
                      <input
                        {...register(
                          `proyectos_investigacion.${index}.fecha_designacion`,
                        )}
                        type="date"
                        style={inputStyle}
                      />
                    </div>

                    {/* 👇 NUEVO: FECHA DE INICIO */}
                    <div>
                      <label
                        style={{
                          fontSize: "0.85em",
                          color: "#555",
                          fontWeight: "bold",
                        }}
                      >
                        Fecha de inicio:
                      </label>
                      <input
                        {...register(
                          `proyectos_investigacion.${index}.fecha_inicio`,
                        )}
                        type="date"
                        style={inputStyle}
                      />
                    </div>

                    {/* 👇 NUEVO: FECHA DE FIN */}
                    <div>
                      <label
                        style={{
                          fontSize: "0.85em",
                          color: "#555",
                          fontWeight: "bold",
                        }}
                      >
                        Fecha de fin:
                      </label>
                      <input
                        {...register(
                          `proyectos_investigacion.${index}.fecha_fin`,
                        )}
                        type="date"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {camposProyectosInv.length === 0 && (
                <p
                  style={{
                    color: "#555",
                    fontStyle: "italic",
                    padding: "0 0 10px 0",
                  }}
                >
                  No hay proyectos de investigación agregados.
                </p>
              )}
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 7 ================= */}
        <fieldset disabled={esSoloLectura} style={fieldsetStyle}>
          <legend
            onClick={() => toggleAcordeon("sec7")}
            style={{ ...legendStyle, cursor: "pointer", userSelect: "none" }}
          >
            7. DESIGNACIONES Y CIERRE
            <span
              style={{
                marginLeft: "15px",
                fontSize: "0.8em",
                backgroundColor: "#d4e6f1",
                padding: "4px 10px",
                borderRadius: "12px",
                color: "#1a3b5c",
              }}
            >
              {acordeon.sec7 ? "Ocultar ▲" : "Mostrar ▼"}
            </span>
          </legend>

          {acordeon.sec7 && (
            <div style={{ paddingTop: "10px" }}>
              <label style={{ fontWeight: "bold", color: "#555" }}>
                Otras Designaciones / Comisiones (Ingreso manual):
              </label>
              <textarea
                {...register("designaciones")}
                rows={3}
                placeholder="Ej. Miembro de Comisión de Prácticas, Coordinador de Área, etc. Detalle sus designaciones aquí..."
                style={{ ...inputStyle, marginBottom: "10px" }}
              ></textarea>

              {/* 👇 NUEVOS CAMPOS: FECHAS DE DESIGNACIÓN */}
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label
                    style={{
                      fontSize: "0.85em",
                      color: "#555",
                      fontWeight: "bold",
                    }}
                  >
                    Fecha de inicio (Designación):
                  </label>
                  <input
                    {...register("designaciones_fecha_inicio")}
                    type="date"
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label
                    style={{
                      fontSize: "0.85em",
                      color: "#555",
                      fontWeight: "bold",
                    }}
                  >
                    Fecha de fin (Designación):
                  </label>
                  <input
                    {...register("designaciones_fecha_fin")}
                    type="date"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "15px",
                  minWidth: 0,
                  flexWrap: "wrap",
                  borderTop: "1px solid #ddd" /* 👈 Línea separadora sutil */,
                  paddingTop: "15px",
                }}
              >
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label>Fecha de elaboración (Informe):</label>
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
            </div>
          )}
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
              {cargando ? "Guardando..." : "Guardar Informe"}
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
