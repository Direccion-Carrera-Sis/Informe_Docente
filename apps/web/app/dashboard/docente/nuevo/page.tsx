/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch, FieldValues } from "react-hook-form";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { PlantillaPDF } from "./PlantillaPDF";

// ============================================================================
// COMPONENTES HELPER CON VISTA PREVIA MEJORADA Y SINCRONIZACIÓN DE SERVIDOR
// ============================================================================
const EvidenciaHiddenUploader = ({ name, label, watch, setValue, esSoloLectura }: { name: string; label: string; watch: any; setValue: any; esSoloLectura: boolean; }) => {
  const files = watch(name) || [];
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      newFiles.forEach(file => {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB
        if (!isPdf) alert(`⚠️ El archivo "${file.name}" no es un PDF.`);
        else if (!isValidSize) alert(`⚠️ El archivo "${file.name}" supera el límite de 2MB.`);
        else validFiles.push(file);
      });
      if (validFiles.length > 0) setValue(name, [...files, ...validFiles]);
    }
    e.target.value = "";
  };

  const handleRemove = (indexToRemove: number) => {
    const fileToRemove = files[indexToRemove];
    if (fileToRemove.isServer) {
      const confirmar = window.confirm("Este archivo ya se encuentra en el servidor.\nSi lo quitas de aquí, el sistema esperará que subas uno nuevo para reemplazarlo.\n¿Deseas quitarlo de la lista?");
      if (!confirmar) return;
    }
    setValue(name, files.filter((_: any, i: number) => i !== indexToRemove));
    if (previewIndex === indexToRemove) setPreviewIndex(null);
  };

  return (
    <div style={{ display: files.length > 0 ? "block" : "none", width: "100%" }}>
      <input id={`hidden-input-${name}`} type="file" accept=".pdf" multiple onChange={handleAdd} style={{ display: "none" }} />
      {files.length > 0 && (
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontWeight: "bold", fontSize: "0.85em", color: "#334155" }}>📁 {label}</div>
            <div style={{ fontSize: "0.75em", color: "#64748b", fontStyle: "italic" }}>Máx. 2MB / PDF</div>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85em" }}>
            {files.map((file: any, i: number) => (
              <li key={i} style={{ backgroundColor: "#f8fafc", padding: "6px 10px", marginBottom: "5px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "1.2em" }}>{file.isServer ? "☁️" : "📄"}</span>
                    {file.name ? file.name : `Archivo precargado ${i + 1}`}
                  </span>
                  <span style={{ display: "flex", gap: "5px" }}>
                    <button type="button" onClick={() => setPreviewIndex(previewIndex === i ? null : i)} title="Ver PDF" style={{ background: "#e0f2fe", border: "none", color: "#0284c7", fontWeight: "bold", cursor: "pointer", padding: "4px 8px", borderRadius: "4px" }}>
                      👁️ Ver
                    </button>
                    {!esSoloLectura && (
                      <button type="button" onClick={() => handleRemove(i)} title="Eliminar archivo" style={{ background: "#fee2e2", border: "none", color: "#dc2626", fontWeight: "bold", cursor: "pointer", padding: "4px 8px", borderRadius: "4px" }}>X</button>
                    )}
                  </span>
                </div>
                {/* 👇 MODAL VISTA PREVIA FULL SCREEN */}
                {previewIndex === i && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                      <h3 style={{color: 'white', margin: 0, fontSize: '1.1em'}}>{file.name}</h3>
                      <button type="button" onClick={() => setPreviewIndex(null)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Vista Previa ✖</button>
                    </div>
                    <iframe src={file.isServer ? file.url : URL.createObjectURL(file)} style={{ border: "none", backgroundColor: "white", borderRadius: "8px", width: "100%", maxWidth: "1000px", height: "85vh" }} title="Vista previa PDF" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const EvidenciaUploader = ({ name, label, watch, setValue, esSoloLectura }: { name: string; label: string; watch: any; setValue: any; esSoloLectura: boolean; }) => {
  const files = watch(name) || [];
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      newFiles.forEach(file => {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isValidSize = file.size <= 2 * 1024 * 1024;
        if (!isPdf) alert(`⚠️ El archivo "${file.name}" no es un PDF.`);
        else if (!isValidSize) alert(`⚠️ El archivo "${file.name}" supera el límite de 2MB.`);
        else validFiles.push(file);
      });
      if (validFiles.length > 0) setValue(name, [...files, ...validFiles]);
    }
    e.target.value = "";
  };

  const handleRemove = (indexToRemove: number) => {
    const fileToRemove = files[indexToRemove];
    if (fileToRemove.isServer) {
      const confirmar = window.confirm("Este archivo ya se encuentra en el servidor.\nSi lo quitas de aquí, el sistema esperará que subas uno nuevo para reemplazarlo.\n¿Deseas quitarlo de la lista?");
      if (!confirmar) return;
    }
    setValue(name, files.filter((_: any, i: number) => i !== indexToRemove));
    if (previewIndex === indexToRemove) setPreviewIndex(null);
  };

  return (
    <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ fontWeight: "bold", fontSize: "0.9em", color: "#334155" }}>{label}</div>
        <div style={{ fontSize: "0.75em", color: "#64748b", fontStyle: "italic" }}>Máx. 2MB / PDF</div>
      </div>
      {!esSoloLectura && <input type="file" accept=".pdf" multiple onChange={handleAdd} style={{ fontSize: "0.85em", marginBottom: "10px" }} />}
      {files.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85em" }}>
          {files.map((file: any, i: number) => (
            <li key={i} style={{ backgroundColor: "#f8fafc", padding: "6px 10px", marginBottom: "5px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: "1.2em" }}>{file.isServer ? "☁️" : "📄"}</span>
                  {file.name ? file.name : `Archivo precargado ${i + 1}`}
                </span>
                <span style={{ display: "flex", gap: "5px" }}>
                  <button type="button" onClick={() => setPreviewIndex(previewIndex === i ? null : i)} title="Ver PDF" style={{ background: "#e0f2fe", border: "none", color: "#0284c7", fontWeight: "bold", cursor: "pointer", padding: "4px 8px", borderRadius: "4px" }}>
                    👁️ Ver
                  </button>
                  {!esSoloLectura && (
                    <button type="button" onClick={() => handleRemove(i)} title="Eliminar archivo" style={{ background: "#fee2e2", border: "none", color: "#dc2626", fontWeight: "bold", cursor: "pointer", padding: "4px 8px", borderRadius: "4px" }}>X</button>
                  )}
                </span>
              </div>
              {/* 👇 MODAL VISTA PREVIA FULL SCREEN */}
              {previewIndex === i && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                  <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                    <h3 style={{color: 'white', margin: 0, fontSize: '1.1em'}}>{file.name}</h3>
                    <button type="button" onClick={() => setPreviewIndex(null)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Vista Previa ✖</button>
                  </div>
                  <iframe src={file.isServer ? file.url : URL.createObjectURL(file)} style={{ border: "none", backgroundColor: "white", borderRadius: "8px", width: "100%", maxWidth: "1000px", height: "85vh" }} title="Vista previa PDF" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ============================================================================
// CONSTANTES Y ESTILOS
// ============================================================================
const habilidadesOpciones = ["Comunicación efectiva", "Trabajo en equipo", "Liderazgo", "Empatía", "Resolución de problemas", "Adaptabilidad", "Gestión del tiempo", "Pensamiento crítico", "Manejo del estrés", "Ética y Responsabilidad", "Puntualidad", "Otros"];
const tacOpciones = ["Entornos virtuales de aprendizaje (LMS)", "Programas ofimáticos", "Simuladores académicos", "Aplicaciones de realidad virtual o aumentada", "Herramientas colaborativas", "Recursos multimedia interactivos", "Otros"];
const readOnlyStyle = { backgroundColor: "#e9ecef", color: "#555", cursor: "not-allowed" };
const reqStar = <span style={{ color: "red", marginLeft: "3px", fontWeight: "bold" }}>*</span>;
const selectMenu = { padding: "10px", borderRadius: "4px", border: "1px solid #94a3b8", backgroundColor: "#fff", cursor: "pointer", fontWeight: "bold", color: "#1e293b", width: "100%", maxWidth: "400px" };

export default function NuevoInformePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [esSoloLectura, setEsSoloLectura] = useState(false);
  const [materiaActiva, setMateriaActiva] = useState(0);
  const [informeId, setInformeId] = useState<string | null>(null);
  const [acordeon, setAcordeon] = useState({ sec3: false, sec4: false, sec5: false, sec6: false, sec7: false });

  const toggleAcordeon = (seccion: keyof typeof acordeon) => setAcordeon((prev) => ({ ...prev, [seccion]: !prev[seccion] }));

  const { register, handleSubmit, control, reset, watch, getValues, setValue } = useForm<FieldValues>({ defaultValues: { asignaturas: [], titulaciones_asignadas: [] } });
  const { fields } = useFieldArray({ control, name: "asignaturas" });
  const watchAsignaturas = useWatch({ control, name: "asignaturas", defaultValue: [] });
  const { fields: camposTitulacion, append: appendTitulacion, remove: removeTitulacion } = useFieldArray({ control, name: "titulaciones_asignadas" });
  const { fields: camposLector, append: appendLector, remove: removeLector } = useFieldArray({ control, name: "titulaciones_lector" });
  const { fields: camposPracticas, append: appendPractica, remove: removePractica } = useFieldArray({ control, name: "practicas" });
  const { fields: camposPublicaciones, append: appendPublicacion, remove: removePublicacion } = useFieldArray({ control, name: "publicaciones" });
  const { fields: camposProyectosInv, append: appendProyectoInv, remove: removeProyectoInv } = useFieldArray({ control, name: "proyectos_investigacion" });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const datosUsuario = JSON.parse(usuarioGuardado);
      setUserId(datosUsuario.cedula);
      setEsSoloLectura(datosUsuario.rol !== "docente");
      const urlParams = new URLSearchParams(window.location.search);
      const idDeLaUrl = urlParams.get("id");
      if (idDeLaUrl) { setInformeId(idDeLaUrl); cargarInformeExistente(idDeLaUrl); } else { cargarDatosPrecargados(datosUsuario); }
    } else { router.push("/"); }
  }, []);

  // 👇 FUNCIÓN PARA CRUZAR LO QUE HAY EN EL SERVIDOR CON EL FORMULARIO
  const clasificarArchivosDelServidor = (archivosEnServidor: any[], asignaturas: any[], dataDocente: any) => {
    const mapped: Record<string, any[]> = {};
    const pRaw = (dataDocente.periodo || "2026-2026").replace(/\//g, "-");
    const p = pRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const an = dataDocente.docente_nombre ? dataDocente.docente_nombre.replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '') : 'ApellidoNombre';

    const findAndMap = (key: string, regex: RegExp) => {
      const matches = archivosEnServidor.filter(f => regex.test(f.name));
      if (matches.length > 0) mapped[key] = matches;
    };

    findAndMap('general_ficha', new RegExp(`^01_${p}_FICHA_.+\\.pdf$`, 'i'));
    findAndMap('general_horario', new RegExp(`^02_${p}_HORARIO_.+\\.pdf$`, 'i'));
    findAndMap('general_cap_tac', new RegExp(`^03_TAC_\\d+_.+\\.pdf$`, 'i'));
    findAndMap('general_cap_metodologica', new RegExp(`^03_MET_\\d+_.+\\.pdf$`, 'i'));
    findAndMap('general_cap_profesional', new RegExp(`^03_PRO_\\d+_.+\\.pdf$`, 'i'));

    asignaturas.forEach((asig, idx) => {
      const cp = (asig.paralelo || 'SinParalelo').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cm = (asig.codigo || 'SinCodigo').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      findAndMap(`asignaturas.${idx}.silabo_evidencia`, new RegExp(`^01_${p}_${cm}_.+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.seguimiento_evidencia`, new RegExp(`^02_${p}_${cp}_${cm}_Seguimiento.*\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.asistencia_evidencia`, new RegExp(`^03_${p}_${cp}_${cm}_Asistencia.*\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.notas_evidencia`, new RegExp(`^04_${p}_${cp}_${cm}_Notas.*\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.indiv_evidencia`, new RegExp(`^05_${p}_${cp}_${cm}_TI_\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.grupales_evidencia`, new RegExp(`^06_${p}_${cp}_${cm}_TG_\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.pae_evidencia`, new RegExp(`^07_${p}_${cp}_${cm}_PAE_\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.refuerzo_evidencia`, new RegExp(`^08_${p}_${cp}_${cm}_Refuerzo_\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.sumativa1_evidencia`, new RegExp(`^09_${p}_${cp}_${cm}_Sumativa1_E\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.sumativa_final_evidencia`, new RegExp(`^10_${p}_${cp}_${cm}_SumativaFinal_E\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.recuperacion_evidencia`, new RegExp(`^11_${p}_${cp}_${cm}_Recuperacion_E\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.hab_evidencia`, new RegExp(`^12_${p}_Ev_HB_${cp}_${cm}_\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.res_evidencia`, new RegExp(`^13_${p}_Ev_RA_${cp}_${cm}_\\d+\\.pdf$`, 'i'));
      findAndMap(`asignaturas.${idx}.tac_evidencia`, new RegExp(`^14_${p}_Ev_TAC_${cp}_${cm}_\\d+\\.pdf$`, 'i'));
    });

    return mapped;
  };

// 👇 Inyección de Archivos del Servidor en los estados
  const inyectarArchivosEnFormulario = async (baseData: any) => {
    try {
      const nom = baseData.docente_nombre || "Desconocido";
      const per = baseData.periodo || "2026-2026";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes/escanear-archivos?docente=${nom}&periodo=${per}`);
      
      if (res.ok) {
        const archivosEscaneados = await res.json();
        const serverFilesObjects = archivosEscaneados.map((f: any) => ({
          name: f.name,
          url: `${process.env.NEXT_PUBLIC_API_URL}/informes/ver-archivo?ruta=${encodeURIComponent(f.path)}`,
          isServer: true
        }));

        const mappedFiles = clasificarArchivosDelServidor(serverFilesObjects, baseData.asignaturas, baseData);

        // Anexar los archivos al objeto de reset
        Object.keys(mappedFiles).forEach(key => {
          if (key.startsWith('general_')) {
            baseData[key] = mappedFiles[key];
          } else if (key.startsWith('asignaturas.')) {
            // 👇 CORRECCIÓN DE TIPADO TYPESCRIPT
            const partes = key.split('.');
            const idxStr = partes[1] as string;
            const asigKey = partes[2] as string;
            
            baseData.asignaturas[parseInt(idxStr, 10)][asigKey] = mappedFiles[key];
          }
        });
      }
    } catch (e) {
      console.log("Error escaneando archivos del servidor", e);
    }
    reset(baseData);
  };

  const cargarInformeExistente = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/informes/${id}`);
      if (res.ok) {
        const bd = await res.json();
        const asignaturasBD = bd.datosEstructurales?.asignaturas?.length ? bd.datosEstructurales.asignaturas : [];
        asignaturasBD.sort((a: any, b: any) => a.materia.localeCompare(b.materia));
        
        const baseData = {
          docente_nombre: bd.datosEstructurales?.docente_nombre || "", periodo: bd.periodoAcademico || "2026-2026", firma_docente: bd.datosEstructurales?.firma_docente || "", fecha_elaboracion: bd.datosEstructurales?.fecha_elaboracion || "",
          asignaturas: asignaturasBD, titulaciones_asignadas: bd.actividades?.titulacion || [], titulaciones_lector: bd.actividades?.lector || [], practicas: Array.isArray(bd.actividades?.practicas) ? bd.actividades.practicas : [],
          vinc_nombre: bd.actividades?.vinculacion?.nombre || "", vinc_codigo_proyecto: bd.actividades?.vinculacion?.codigo || "", vinc_tipo_proyecto: bd.actividades?.vinculacion?.tipo || "", vinc_programa: bd.actividades?.vinculacion?.programa || "",
          vinc_estado: bd.actividades?.vinculacion?.estado || "", vinc_objetivo: bd.actividades?.vinculacion?.objetivo || "", vinc_facultad: bd.actividades?.vinculacion?.facultad || "Facultad de Ingeniería y Ciencias Aplicadas",
          vinc_fecha_inicio: bd.actividades?.vinculacion?.fecha_inicio || "", vinc_fecha_fin_planeado: bd.actividades?.vinculacion?.fecha_fin_plan || "", vinc_fecha_fin_real: bd.actividades?.vinculacion?.fecha_fin_real || "",
          vinc_coordinador: bd.actividades?.vinculacion?.coordinador || "", vinc_correo_coordinador: bd.actividades?.vinculacion?.correo || "", vinc_telefono_coordinador: bd.actividades?.vinculacion?.telefono || "", vinc_linea_investigacion: bd.actividades?.vinculacion?.linea_inv || "",
          vinc_alcance: bd.actividades?.vinculacion?.alcance || "", vinc_impacto_social: bd.actividades?.vinculacion?.impacto_social || "", vinc_impacto_cientifico: bd.actividades?.vinculacion?.impacto_cientifico || "",
          vinc_impacto_economico: bd.actividades?.vinculacion?.impacto_economico || "", vinc_impacto_politico: bd.actividades?.vinculacion?.impacto_politico || "", vinc_otro_impacto: bd.actividades?.vinculacion?.otro_impacto || "",
          vinc_financiamiento: bd.actividades?.vinculacion?.financiamiento || "", vinc_presupuesto_plan: bd.actividades?.vinculacion?.p_planificado || "", vinc_presupuesto_ejec: bd.actividades?.vinculacion?.p_ejecutado || "",
          vinc_horas: bd.actividades?.vinculacion?.horas || "", vinc_tipo_participante: bd.actividades?.vinculacion?.tipo_participante || "", vinc_grupo_inv: bd.actividades?.vinculacion?.grupo_inv || "",
          publicaciones: Array.isArray(bd.actividades?.investigacion?.publicaciones) ? bd.actividades.investigacion.publicaciones : [], proyectos_investigacion: Array.isArray(bd.actividades?.investigacion?.proyectos) ? bd.actividades.investigacion.proyectos : [],
          designaciones: bd.datosEstructurales?.designaciones || "", designaciones_fecha_inicio: bd.datosEstructurales?.designaciones_fecha_inicio || "", designaciones_fecha_fin: bd.datosEstructurales?.designaciones_fecha_fin || "",
        };

        // Ejecutar la sincronización
        await inyectarArchivosEnFormulario(baseData);
      } else { alert("El backend no pudo encontrar este informe."); }
    } catch (error) { console.error("Error al cargar el informe:", error); }
  };

  const cargarDatosPrecargados = async (datosUsuario: any) => {
    try {
      const [resMaterias, resTit] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/asignaciones/docente/${datosUsuario.cedula}`), fetch(`${process.env.NEXT_PUBLIC_API_URL}/titulaciones/docente/${datosUsuario.cedula}`),
      ]);
      let asignaturasFormateadas: any[] = [];
      let titulacionesFormateadas = [];
      if (resMaterias.ok) {
        const materiasAsignadas = await resMaterias.json();
        asignaturasFormateadas = materiasAsignadas.map((m: any) => ({
          carrera: m.carrera || "", materia: m.materia || "", codigo: m.codigo || "", paralelo: m.paralelo || "",
          estudiantes: "", asistencia: "", aprobados: "", reprobados: "", tiene_pae: false, habilidades_tabla: [], tac_tabla: [], 
          res_evidencia: [], hab_evidencia: [], tac_evidencia: [], pae_evidencia: [], silabo_evidencia: [], seguimiento_evidencia: [], asistencia_evidencia: [], notas_evidencia: [], indiv_evidencia: [], grupales_evidencia: [], refuerzo_evidencia: [], sumativa1_evidencia: [], sumativa_final_evidencia: [], recuperacion_evidencia: []
        }));
        asignaturasFormateadas.sort((a, b) => a.materia.localeCompare(b.materia));
      }
      if (resTit.ok) {
        const dataTit = await resTit.json();
        if (dataTit && dataTit.length > 0) {
          titulacionesFormateadas = dataTit.map((tit: any) => ({ estudiante: tit.estudiante, tema: tit.tema, mecanismo: tit.mecanismo, fecha_designacion: "", estado: "", }));
        }
      }
      const baseData = {
        docente_nombre: datosUsuario.nombres || "", periodo: "2026-2026", firma_docente: datosUsuario.nombres || "",
        asignaturas: asignaturasFormateadas.length > 0 ? asignaturasFormateadas : [{ carrera: "", materia: "", codigo: "", paralelo: "", tiene_pae: false }],
        titulaciones_asignadas: titulacionesFormateadas, vinc_facultad: "Facultad de Ingeniería y Ciencias Aplicadas",
      };

      // Ejecutar la sincronización
      await inyectarArchivosEnFormulario(baseData);
    } catch (err) { console.error("Error de red:", err); }
  };

  const sincronizarAsignaturasAgrupadas = (asignaturas: any[]) => {
    return asignaturas.map((asig: any) => {
      const master = asignaturas.find((a: any) => a.materia === asig.materia) || asig;
      return {
        ...asig,
        resultados_tabla: master.resultados_tabla, res_criterios: master.res_criterios, res_instrumento: master.res_instrumento, resultados_actividades: master.resultados_actividades, resultados_logro: master.resultados_logro, res_acciones: master.res_acciones, res_propuestas: master.res_propuestas, res_cumplimiento: master.res_cumplimiento,
        habilidades_tabla: master.habilidades_tabla, habilidades_otros: master.habilidades_otros, hab_criterios: master.hab_criterios, hab_instrumento: master.hab_instrumento, habilidades_actividades: master.habilidades_actividades, habilidades_logro: master.habilidades_logro, hab_acciones: master.hab_acciones, hab_propuestas: master.hab_propuestas, hab_cumplimiento: master.hab_cumplimiento,
        tac_herramienta: master.tac_herramienta, tac_tabla: master.tac_tabla, tac_otros: master.tac_otros, tac_actividades: master.tac_actividades, tac_logro: master.tac_logro, tac_acciones: master.tac_acciones, tac_propuestas: master.tac_propuestas, tac_cumplimiento: master.tac_cumplimiento,
      };
    });
  };

  const validarNombresArchivos = (data: any, asignaturasSincronizadas: any[]) => {
    const errores: string[] = [];
    const pRaw = (data.periodo || "2026-2026").replace(/\//g, "-");
    const p = pRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    const an = data.docente_nombre ? data.docente_nombre.replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '') : 'ApellidoNombre';

    const checkFile = (files: any, regexObj: RegExp, formatoEjemplo: string) => {
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file: any) => {
        if (!file.isServer && !regexObj.test(file.name)) {
          errores.push(`❌ "${file.name}"\n   👉 Nombre requerido: ${formatoEjemplo}`);
        }
      });
    };

    checkFile(data.general_ficha, new RegExp(`^01_${p}_FICHA_.+\\.pdf$`, 'i'), `01_${pRaw}_FICHA_${an}.pdf`);
    checkFile(data.general_horario, new RegExp(`^02_${p}_HORARIO_.+\\.pdf$`, 'i'), `02_${pRaw}_HORARIO_${an}.pdf`);
    checkFile(data.general_cap_tac, new RegExp(`^03_TAC_\\d+_.+\\.pdf$`, 'i'), `03_TAC_YYYYMMDD_${an}_TemaCorto.pdf`);
    checkFile(data.general_cap_metodologica, new RegExp(`^03_MET_\\d+_.+\\.pdf$`, 'i'), `03_MET_YYYYMMDD_${an}_TemaCorto.pdf`);
    checkFile(data.general_cap_profesional, new RegExp(`^03_PRO_\\d+_.+\\.pdf$`, 'i'), `03_PRO_YYYYMMDD_${an}_TemaCorto.pdf`);

    asignaturasSincronizadas.forEach((asig) => {
      const codParRaw = asig.paralelo || 'SinParalelo';
      const codMatRaw = asig.codigo || 'SinCodigo';
      const nomMatRaw = asig.materia ? asig.materia.replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '') : 'NombreMateria';
      
      const cp = codParRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cm = codMatRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      checkFile(asig.silabo_evidencia, new RegExp(`^01_${p}_${cm}_.+\\.pdf$`, 'i'), `01_${pRaw}_${codMatRaw}_${nomMatRaw}.pdf`);
      checkFile(asig.seguimiento_evidencia, new RegExp(`^02_${p}_${cp}_${cm}_Seguimiento.*\\.pdf$`, 'i'), `02_${pRaw}_${codParRaw}_${codMatRaw}_Seguimiento.pdf`);
      checkFile(asig.asistencia_evidencia, new RegExp(`^03_${p}_${cp}_${cm}_Asistencia.*\\.pdf$`, 'i'), `03_${pRaw}_${codParRaw}_${codMatRaw}_Asistencia.pdf`);
      checkFile(asig.notas_evidencia, new RegExp(`^04_${p}_${cp}_${cm}_Notas.*\\.pdf$`, 'i'), `04_${pRaw}_${codParRaw}_${codMatRaw}_Notas.pdf`);
      checkFile(asig.indiv_evidencia, new RegExp(`^05_${p}_${cp}_${cm}_TI_\\d+\\.pdf$`, 'i'), `05_${pRaw}_${codParRaw}_${codMatRaw}_TI_1.pdf`);
      checkFile(asig.grupales_evidencia, new RegExp(`^06_${p}_${cp}_${cm}_TG_\\d+\\.pdf$`, 'i'), `06_${pRaw}_${codParRaw}_${codMatRaw}_TG_1.pdf`);
      checkFile(asig.pae_evidencia, new RegExp(`^07_${p}_${cp}_${cm}_PAE_\\d+\\.pdf$`, 'i'), `07_${pRaw}_${codParRaw}_${codMatRaw}_PAE_1.pdf`);
      checkFile(asig.refuerzo_evidencia, new RegExp(`^08_${p}_${cp}_${cm}_Refuerzo_\\d+\\.pdf$`, 'i'), `08_${pRaw}_${codParRaw}_${codMatRaw}_Refuerzo_1.pdf`);
      checkFile(asig.sumativa1_evidencia, new RegExp(`^09_${p}_${cp}_${cm}_Sumativa1_E\\d+\\.pdf$`, 'i'), `09_${pRaw}_${codParRaw}_${codMatRaw}_Sumativa1_E1.pdf`);
      checkFile(asig.sumativa_final_evidencia, new RegExp(`^10_${p}_${cp}_${cm}_SumativaFinal_E\\d+\\.pdf$`, 'i'), `10_${pRaw}_${codParRaw}_${codMatRaw}_SumativaFinal_E1.pdf`);
      checkFile(asig.recuperacion_evidencia, new RegExp(`^11_${p}_${cp}_${cm}_Recuperacion_E\\d+\\.pdf$`, 'i'), `11_${pRaw}_${codParRaw}_${codMatRaw}_Recuperacion_E1.pdf`);
      checkFile(asig.hab_evidencia, new RegExp(`^12_${p}_Ev_HB_${cp}_${cm}_\\d+\\.pdf$`, 'i'), `12_${pRaw}_Ev_HB_${codParRaw}_${codMatRaw}_1.pdf`);
      checkFile(asig.res_evidencia, new RegExp(`^13_${p}_Ev_RA_${cp}_${cm}_\\d+\\.pdf$`, 'i'), `13_${pRaw}_Ev_RA_${codParRaw}_${codMatRaw}_1.pdf`);
      checkFile(asig.tac_evidencia, new RegExp(`^14_${p}_Ev_TAC_${cp}_${cm}_\\d+\\.pdf$`, 'i'), `14_${pRaw}_Ev_TAC_${codParRaw}_${codMatRaw}_1.pdf`);
    });

    return errores;
  };

  const validarFormulario = (valoresActuales: any) => {
    const sec1Incompleta = valoresActuales.asignaturas?.some((a: any) => a.estudiantes === "" || a.asistencia === "" || a.aprobados === "" || a.reprobados === "");
    if (sec1Incompleta) return "Faltan datos numéricos obligatorios en la Tabla de Actividades de Docencia (Sección 1).";

    const camposTextoSec2 = ["resultados_tabla", "res_criterios", "res_instrumento", "resultados_actividades", "resultados_logro", "res_acciones", "res_propuestas", "res_cumplimiento", "hab_criterios", "hab_instrumento", "habilidades_actividades", "habilidades_logro", "hab_acciones", "hab_propuestas", "hab_cumplimiento", "tac_herramienta", "tac_actividades", "tac_logro", "tac_acciones", "tac_propuestas", "tac_cumplimiento"];
    const sec2Incompleta = valoresActuales.asignaturas?.some((a: any) => camposTextoSec2.some(c => !a[c] || a[c].trim() === "") || !a.habilidades_tabla?.length || !a.tac_tabla?.length);
    if (sec2Incompleta) return "Faltan campos obligatorios en la Evaluación Específica por Asignatura (Sección 2).";

    if (valoresActuales.titulaciones_asignadas?.length > 0) {
      if (valoresActuales.titulaciones_asignadas.some((t: any) => !t.estudiante || !t.mecanismo || !t.tema || !t.fecha_designacion || !t.estado)) return "Faltan datos obligatorios en Trabajos de Titulación (Tutor).";
    }
    if (valoresActuales.titulaciones_lector?.length > 0) {
      if (valoresActuales.titulaciones_lector.some((t: any) => !t.estudiante || !t.mecanismo || !t.tema || !t.fecha_designacion || !t.estado)) return "Faltan datos obligatorios en Trabajos de Titulación (Lector).";
    }
    if (valoresActuales.practicas?.length > 0) {
      if (valoresActuales.practicas.some((p: any) => !p.estudiante || !p.tipo_identificacion || !p.identificacion || !p.tipo_empresa || !p.fecha_designacion)) return "Faltan datos obligatorios en Prácticas Preprofesionales.";
    }
    if (valoresActuales.vinc_nombre) {
      if (!valoresActuales.vinc_codigo_proyecto || !valoresActuales.vinc_tipo_proyecto || !valoresActuales.vinc_programa || !valoresActuales.vinc_estado || !valoresActuales.vinc_objetivo || !valoresActuales.vinc_fecha_inicio || !valoresActuales.vinc_fecha_fin_planeado || !valoresActuales.vinc_fecha_fin_real || !valoresActuales.vinc_coordinador || !valoresActuales.vinc_correo_coordinador || !valoresActuales.vinc_telefono_coordinador || !valoresActuales.vinc_linea_investigacion || !valoresActuales.vinc_alcance || !valoresActuales.vinc_impacto_social || !valoresActuales.vinc_impacto_cientifico || !valoresActuales.vinc_impacto_economico || !valoresActuales.vinc_impacto_politico || !valoresActuales.vinc_financiamiento || !valoresActuales.vinc_presupuesto_plan || !valoresActuales.vinc_presupuesto_ejec || !valoresActuales.vinc_horas || !valoresActuales.vinc_tipo_participante || !valoresActuales.vinc_grupo_inv) return "Faltan datos en el Proyecto de Vinculación.";
    }
    if (valoresActuales.publicaciones?.length > 0) {
      if (valoresActuales.publicaciones.some((p: any) => !p.titulo || !p.nombres || !p.codigo_ies || !p.tipo_pub || !p.tipo_articulo || !p.codigo_pub || !p.base_indexada || !p.issn || !p.revista || !p.fecha_pub || !p.cargo || !p.intercultural || !p.link_pub || !p.link_revista)) return "Faltan datos requeridos en Publicaciones y Ponencias.";
    }
    if (valoresActuales.proyectos_investigacion?.length > 0) {
      if (valoresActuales.proyectos_investigacion.some((p: any) => !p.proyecto || !p.institucion || !p.cargo || !p.fecha_designacion || !p.fecha_inicio || !p.fecha_fin)) return "Faltan datos requeridos en Proyectos de Investigación.";
    }

    return "";
  };

  const onSubmit = async (data: FieldValues) => {
    const asignaturasSincronizadas = sincronizarAsignaturasAgrupadas(data.asignaturas);
    data.asignaturas = asignaturasSincronizadas;

    const erroresArchivos = validarNombresArchivos(data, asignaturasSincronizadas);
    if (erroresArchivos.length > 0) {
      const mostrarErrores = erroresArchivos.slice(0, 5).join('\n\n');
      const extraMsg = erroresArchivos.length > 5 ? `\n\n...y ${erroresArchivos.length - 5} archivos más con errores.` : '';
      return alert(`🚫 ERROR EN FORMATO DE ARCHIVOS:\nPor favor, renombre los archivos antes de subirlos:\n\n${mostrarErrores}${extraMsg}`);
    }

    const errorMsg = validarFormulario(data);
    if (errorMsg) return alert(`Formulario Incompleto:\n\n${errorMsg}`);

    setCargando(true);
    try {
      const payload = {
        docenteId: userId,
        periodoAcademico: data.periodo || "2026-2026",
        estado: "Borrador",
        progreso: calcularProgreso(),
        datosEstructurales: {
          docente_nombre: data.docente_nombre, fecha_elaboracion: data.fecha_elaboracion, firma_docente: data.firma_docente,
          asignaturas: asignaturasSincronizadas, designaciones: data.designaciones, designaciones_fecha_inicio: data.designaciones_fecha_inicio, designaciones_fecha_fin: data.designaciones_fecha_fin,
        },
        actividades: {
          titulacion: data.titulaciones_asignadas, lector: data.titulaciones_lector, practicas: data.practicas, 
          vinculacion: {
            nombre: data.vinc_nombre, codigo: data.vinc_codigo_proyecto, tipo: data.vinc_tipo_proyecto, programa: data.vinc_programa, estado: data.vinc_estado, objetivo: data.vinc_objetivo, facultad: data.vinc_facultad, fecha_inicio: data.vinc_fecha_inicio, fecha_fin_plan: data.vinc_fecha_fin_planeado, fecha_fin_real: data.vinc_fecha_fin_real, coordinador: data.vinc_coordinador, correo: data.vinc_correo_coordinador, telefono: data.vinc_telefono_coordinador, linea_inv: data.vinc_linea_investigacion, alcance: data.vinc_alcance, impacto_social: data.vinc_impacto_social, impacto_cientifico: data.vinc_impacto_cientifico, impacto_economico: data.vinc_impacto_economico, impacto_politico: data.vinc_impacto_politico, otro_impacto: data.vinc_otro_impacto, financiamiento: data.vinc_financiamiento, p_planificado: data.vinc_presupuesto_plan, p_ejecutado: data.vinc_presupuesto_ejec, horas: data.vinc_horas, tipo_participante: data.vinc_tipo_participante, grupo_inv: data.vinc_grupo_inv,
          },
          investigacion: { publicaciones: data.publicaciones, proyectos: data.proyectos_investigacion },
        },
      };

      const formData = new FormData();
      formData.append("informeData", JSON.stringify(payload));

      const generalKeys = ["ficha", "horario", "cap_tac", "cap_metodologica", "cap_profesional"];
      generalKeys.forEach(key => {
        const files = data[`general_${key}`];
        if (files?.length > 0) files.forEach((file: any) => {
          if (!file.isServer) formData.append(`archivos_generales_${key}`, file);
        });
      });

      asignaturasSincronizadas.forEach((asig, index) => {
        const asigKeys = ["res_evidencia", "hab_evidencia", "tac_evidencia", "pae_evidencia", "silabo_evidencia", "seguimiento_evidencia", "asistencia_evidencia", "notas_evidencia", "indiv_evidencia", "grupales_evidencia", "refuerzo_evidencia", "sumativa1_evidencia", "sumativa_final_evidencia", "recuperacion_evidencia"];
        asigKeys.forEach(key => {
          const files = asig[key];
          if (files?.length > 0) files.forEach((file: any) => {
            if (!file.isServer) formData.append(`archivo_asignatura_${asig.codigo}_${index}_${key}`, file);
          });
        });
      });

      const url = informeId ? `${process.env.NEXT_PUBLIC_API_URL}/informes/${informeId}` : `${process.env.NEXT_PUBLIC_API_URL}/informes`;
      const respuesta = await fetch(url, { method: informeId ? "PUT" : "POST", body: formData });

      if (respuesta.ok) {
        const resultado = await respuesta.json();
        if (!informeId && resultado._id) setInformeId(resultado._id);
        alert(informeId ? "¡Informe y archivos actualizados exitosamente!" : "¡Informe y archivos creados exitosamente!");
      } else { alert("Hubo un error al comunicarse con el servidor."); }
    } catch (error: any) { alert("Error de red: " + error.message); } finally { setCargando(false); }
  };

  const descargarPDF = async () => {
    const valoresActuales = getValues();
    valoresActuales.asignaturas = sincronizarAsignaturasAgrupadas(valoresActuales.asignaturas || []);
    
    const errorMsg = validarFormulario(valoresActuales);
    if (errorMsg) return alert(`No se puede generar el PDF.\n\n${errorMsg}`);

    try {
      const blob = await pdf(<PlantillaPDF datos={valoresActuales} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Informe_${valoresActuales.docente_nombre || "Docente"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) { alert("Hubo un error al crear el documento PDF."); }
  };

  const bloquearCaracteresInvalidos = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
  };

  const materiasUnicas = watchAsignaturas.reduce((acc: { materia: string; indices: number[] }[], asig: any, index: number) => {
    const existente = acc.find(item => item.materia === asig.materia);
    if (!existente) acc.push({ materia: asig.materia, indices: [index] });
    else existente.indices.push(index);
    return acc;
  }, []);

  const asignaturasVigiladas = watch("asignaturas");
  const calcularProgreso = () => {
    if (!asignaturasVigiladas || asignaturasVigiladas.length === 0) return 0;
    const camposSec1 = ["estudiantes", "asistencia", "aprobados", "reprobados"];
    const camposSec2 = ["resultados_tabla", "res_criterios", "res_instrumento", "resultados_actividades", "resultados_logro", "res_acciones", "res_propuestas", "res_cumplimiento", "hab_criterios", "hab_instrumento", "habilidades_actividades", "habilidades_logro", "hab_acciones", "hab_propuestas", "hab_cumplimiento", "tac_herramienta", "tac_actividades", "tac_logro", "tac_acciones", "tac_propuestas", "tac_cumplimiento"];
    const virtuales = sincronizarAsignaturasAgrupadas(asignaturasVigiladas);
    const camposPorMateria = camposSec1.length + camposSec2.length + 2;
    const camposTotales = virtuales.length * camposPorMateria;
    let camposLlenos = 0;

    virtuales.forEach((asig: any) => {
      camposSec1.forEach((c) => { if (asig[c] !== "" && asig[c] !== undefined) camposLlenos++; });
      camposSec2.forEach((c) => { if (asig[c] && asig[c].trim() !== "") camposLlenos++; });
      if (asig.habilidades_tabla?.length > 0) camposLlenos++;
      if (asig.tac_tabla?.length > 0) camposLlenos++;
    });

    return Math.round((camposLlenos / camposTotales) * 100) || 0;
  };
  const progreso = calcularProgreso();

  // ESTILOS
  const inputStyle = { width: "100%", padding: "8px", boxSizing: "border-box" as const, border: "1px solid #ccc", borderRadius: "4px" };
  const fieldsetStyle = { marginBottom: "25px", padding: "20px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#fafafa", boxSizing: "border-box" as const };
  const legendStyle = { fontWeight: "bold", color: "#1a3b5c", padding: "0 10px", fontSize: "1.1em" };
  const subTitleStyle = { fontWeight: "bold", marginTop: "15px", marginBottom: "10px", color: "#333", borderBottom: "1px solid #ddd" };
  const checkboxGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px", padding: "10px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "10px" };
  const checkboxLabelStyle = { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95em" };

  return (
    <div style={{ maxWidth: "1500px", margin: "40px auto", padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", boxSizing: "border-box" }}>
      <button type="button" onClick={() => router.push("/dashboard/docente")} style={{ marginBottom: "20px", backgroundColor: "#7f8c8d", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        ← Volver al Listado
      </button>

      <h2 style={{ textAlign: "center", borderBottom: "2px solid #1a3b5c", paddingBottom: "10px", color: "#1a3b5c", textTransform: "uppercase" }}>
        Informe Unificado de Actividades y Evaluación Docente
      </h2>

      <div style={{ marginBottom: "25px", backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
          <span>Progreso de Llenado</span>
          <span style={{ color: progreso === 100 ? "#16a085" : "#2980b9" }}>{progreso}%</span>
        </div>
        <div style={{ width: "100%", height: "12px", backgroundColor: "#e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progreso}%`, backgroundColor: progreso === 100 ? "#2ecc71" : "#3498db", transition: "width 0.4s ease-in-out" }} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ================= SECCIÓN 1 ================= */}
        <fieldset disabled={esSoloLectura} style={fieldsetStyle}>
          <legend style={legendStyle}>1. DATOS GENERALES Y ACTIVIDADES DE DOCENCIA</legend>
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px", minWidth: 0 }}>
            <div style={{ flex: 2, minWidth: 0 }}>
              <label>Docente:</label>
              <input {...register("docente_nombre")} type="text" readOnly style={{ ...inputStyle, ...readOnlyStyle, marginBottom: "10px" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label>Período académico:</label>
              <input {...register("periodo")} type="text" readOnly style={{ ...inputStyle, ...readOnlyStyle, marginBottom: "10px" }} />
            </div>
          </div>

          <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "bold", color: "#334155", marginBottom: "10px" }}>
              Cargar Archivos Generales <span style={{fontSize: "0.8em", fontWeight: "normal", color: "#64748b"}}>(Solo PDF, Máx. 2MB)</span>
            </label>
            {!esSoloLectura && (
              <div style={{ marginBottom: "15px" }}>
                <select 
                   value="" 
                   onChange={(e) => { const val = e.target.value; if(val) document.getElementById(`hidden-input-${val}`)?.click(); }}
                   style={selectMenu}
                >
                    <option value="" disabled>Seleccione un documento para cargar...</option>
                    <option value="general_ficha">1. Ficha Académica</option>
                    <option value="general_horario">2. Horario de Clases</option>
                    <optgroup label="3. Capacitaciones Recibidas">
                        <option value="general_cap_tac">↳ Capacitación TAC</option>
                        <option value="general_cap_metodologica">↳ Capacitación Metodológica</option>
                        <option value="general_cap_profesional">↳ Capacitación Profesional</option>
                    </optgroup>
                </select>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <EvidenciaHiddenUploader name="general_ficha" label="Ficha Académica" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
              <EvidenciaHiddenUploader name="general_horario" label="Horario de Clases" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
              <EvidenciaHiddenUploader name="general_cap_tac" label="Capacitación TAC" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
              <EvidenciaHiddenUploader name="general_cap_metodologica" label="Capacitación Metodológica" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
              <EvidenciaHiddenUploader name="general_cap_profesional" label="Capacitación Profesional" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
            </div>
          </div>

          <div style={subTitleStyle}>Tabla de Actividades de Docencia</div>
          <div style={{ width: "100%", overflowX: "auto", marginBottom: "10px" }}>
            <div style={{ minWidth: "950px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "40px 1.5fr 2fr 70px 70px 70px 70px 70px 70px 50px", gap: "5px", fontSize: "0.85em", textAlign: "center", fontWeight: "bold", alignItems: "center", marginBottom: "10px" }}>
                <div>Nº</div><div>Carrera</div><div>Asignatura / Materia</div><div>Código</div><div>Paralelo</div>
                <div>N° Est. {reqStar}</div><div>% Asist. {reqStar}</div><div>% Aprob. {reqStar}</div><div>% Reprob. {reqStar}</div><div style={{ color: "#0284c7" }}>PAE</div>
              </div>

              {fields.map((item, index) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "40px 1.5fr 2fr 70px 70px 70px 70px 70px 70px 50px", gap: "5px", marginBottom: "8px", alignItems: "center" }}>
                  <div style={{ textAlign: "center", fontWeight: "bold" }}>{index + 1}</div>
                  <div><input {...register(`asignaturas.${index}.carrera`)} readOnly type="text" style={{ ...inputStyle, ...readOnlyStyle }} /></div>
                  <div><input {...register(`asignaturas.${index}.materia`)} readOnly type="text" style={{ ...inputStyle, ...readOnlyStyle }} /></div>
                  <div><input {...register(`asignaturas.${index}.codigo`)} readOnly type="text" style={{ ...inputStyle, ...readOnlyStyle }} /></div>
                  <div><input {...register(`asignaturas.${index}.paralelo`)} readOnly type="text" style={{ ...inputStyle, ...readOnlyStyle }} /></div>
                  <div><input {...register(`asignaturas.${index}.estudiantes`)} type="number" min="0" onKeyDown={bloquearCaracteresInvalidos} style={inputStyle} /></div>
                  <div><input {...register(`asignaturas.${index}.asistencia`)} type="number" min="0" onKeyDown={bloquearCaracteresInvalidos} style={inputStyle} /></div>
                  <div><input {...register(`asignaturas.${index}.aprobados`)} type="number" min="0" onKeyDown={bloquearCaracteresInvalidos} style={inputStyle} /></div>
                  <div><input {...register(`asignaturas.${index}.reprobados`)} type="number" min="0" onKeyDown={bloquearCaracteresInvalidos} style={inputStyle} /></div>
                  <div style={{ display: "flex", justifyContent: "center" }}><input {...register(`asignaturas.${index}.tiene_pae`)} type="checkbox" style={{ transform: "scale(1.3)", cursor: "pointer" }} /></div>
                </div>
              ))}
            </div>
          </div>
        </fieldset>

        {/* ================= FILTRO DE MATERIAS AGRUPADAS ================= */}
        {materiasUnicas.length > 0 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", marginTop: "20px", overflowX: "auto", paddingBottom: "10px" }}>
            {materiasUnicas.map((grupo: { materia: string, indices: number[] }, indexGrupo: number) => (
              <button
                key={`tab-${indexGrupo}`} type="button" onClick={() => setMateriaActiva(indexGrupo)}
                style={{ padding: "12px 20px", backgroundColor: materiaActiva === indexGrupo ? "#3498db" : "#f3f4f6", color: materiaActiva === indexGrupo ? "white" : "#4b5563", border: materiaActiva === indexGrupo ? "none" : "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer", fontWeight: materiaActiva === indexGrupo ? "bold" : "normal", whiteSpace: "nowrap", boxShadow: materiaActiva === indexGrupo ? "0 4px 6px rgba(52, 152, 219, 0.3)" : "none" }}
              >
                {grupo.materia}
              </button>
            ))}
          </div>
        )}

        {/* ================= SECCIÓN 2 AGRUPADA ================= */}
        {materiasUnicas.map((grupo: { materia: string, indices: number[] }, indexGrupo: number) => {
          const pIdx = grupo.indices[0]; 
          return (
            <fieldset key={`eval-grupo-${indexGrupo}`} disabled={esSoloLectura} style={{ ...fieldsetStyle, borderColor: "#3498db", display: materiaActiva === indexGrupo ? "block" : "none" }}>
              <legend style={{ ...legendStyle, color: "#3498db", textTransform: "uppercase" }}>2. EVALUACIÓN ESPECÍFICA: {grupo.materia}</legend>

              {/* ARCHIVOS DE LA ASIGNATURA (SÍLABO Y PARALELOS) */}
              <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "20px", marginTop: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold", color: "#334155", marginBottom: "10px", fontSize: "1.1em" }}>
                  Cargar Archivos de la Asignatura <span style={{fontSize: "0.75em", fontWeight: "normal", color: "#64748b"}}>(Solo PDF, Máx. 2MB)</span>
                </label>

                <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px dashed #cbd5e1" }}>
                  <div style={{ fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>General de la Materia:</div>
                  {!esSoloLectura && (
                    <select value="" onChange={(e) => { const val = e.target.value; if(val) document.getElementById(`hidden-input-${val}`)?.click(); }} style={selectMenu}>
                      <option value="" disabled>Seleccione un documento...</option>
                      <option value={`asignaturas.${pIdx}.silabo_evidencia`}>Sílabo</option>
                    </select>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <EvidenciaHiddenUploader name={`asignaturas.${pIdx}.silabo_evidencia`} label="Sílabo" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                  </div>
                </div>

                <div style={{ fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>Por Paralelo:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
                  {grupo.indices.map((idx: number) => (
                    <div key={`archivos-paralelo-${idx}`} style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontWeight: "bold", color: "#1d4ed8", marginBottom: "10px", fontSize: "1.05em" }}>Paralelo: {watchAsignaturas[idx].paralelo}</div>
                      
                      {!esSoloLectura && (
                        <select value="" onChange={(e) => { const val = e.target.value; if(val) document.getElementById(`hidden-input-${val}`)?.click(); }} style={{ ...selectMenu, marginBottom: "10px" }}>
                          <option value="" disabled>Cargar evidencia de paralelo...</option>
                          <option value={`asignaturas.${idx}.seguimiento_evidencia`}>Seguimiento Sílabo </option>
                          <option value={`asignaturas.${idx}.asistencia_evidencia`}>Asistencia </option>
                          <option value={`asignaturas.${idx}.notas_evidencia`}>Notas </option>
                          <option value={`asignaturas.${idx}.indiv_evidencia`}>Trabajos Individuales</option>
                          <option value={`asignaturas.${idx}.grupales_evidencia`}>Trabajos Grupales</option>
                          <option value={`asignaturas.${idx}.refuerzo_evidencia`}>Refuerzo</option>
                          <option value={`asignaturas.${idx}.sumativa1_evidencia`}>Evidencia Sumativa 1 </option>
                          <option value={`asignaturas.${idx}.sumativa_final_evidencia`}>Evidencia Sumativa final </option>
                          <option value={`asignaturas.${idx}.recuperacion_evidencia`}>Evidencia Recuperación </option>
                          {watchAsignaturas[idx]?.tiene_pae && <option value={`asignaturas.${idx}.pae_evidencia`}>Evidencia PAE </option>}
                        </select>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.seguimiento_evidencia`} label="Seguimiento Sílabo" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.asistencia_evidencia`} label="Asistencia" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.notas_evidencia`} label="Notas" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.indiv_evidencia`} label="Tra. Individuales" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.grupales_evidencia`} label="Tra. Grupales" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.refuerzo_evidencia`} label="Refuerzo" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.sumativa1_evidencia`} label="Evidencia Sumativa 1" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.sumativa_final_evidencia`} label="Evidencia Sumativa final" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        <EvidenciaHiddenUploader name={`asignaturas.${idx}.recuperacion_evidencia`} label="Evidencia Recuperación" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                        {watchAsignaturas[idx]?.tiene_pae && <EvidenciaHiddenUploader name={`asignaturas.${idx}.pae_evidencia`} label="Evidencia PAE" watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2.1 Resultados de Aprendizaje */}
              <div style={subTitleStyle}>2.1. Resultados de Aprendizaje Evaluados</div>
              <label>Resultado de aprendizaje: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.resultados_tabla`)} rows={3} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Criterios evaluados: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.res_criterios`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Instrumento de evaluación: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.res_instrumento`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Actividades aplicadas: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.resultados_actividades`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Resultados obtenidos (Logro de aprendizaje): {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.resultados_logro`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />

              <label style={{ fontWeight: "bold", color: "#555" }}>Mejora Continua:</label>
              <div style={{ marginTop: "5px", marginBottom: "10px", paddingLeft: "10px", borderLeft: "3px solid #3498db" }}>
                <label>Acciones: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.res_acciones`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
                <label>Propuestas: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.res_propuestas`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
                <label>Cumplimiento: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.res_cumplimiento`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
              </div>

              <div style={{ padding: "15px", backgroundColor: "#e0f2fe", borderRadius: "6px", marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", color: "#0284c7", marginBottom: "10px" }}>📎 Cargar Evidencia de Resultados (Por Paralelo):</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
                  {grupo.indices.map((idx: number) => (
                    <EvidenciaUploader key={`res_evidencia_${idx}`} label={`Paralelo: ${watchAsignaturas[idx].paralelo}`} name={`asignaturas.${idx}.res_evidencia`} watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                  ))}
                </div>
              </div>

              {/* 2.2 Habilidades Blandas */}
              <div style={subTitleStyle}>2.2. Habilidades Blandas Implementadas</div>
              <div style={checkboxGridStyle}>
                {habilidadesOpciones.map((opcion) => (
                  <label key={opcion} style={checkboxLabelStyle}><input type="checkbox" value={opcion} {...register(`asignaturas.${pIdx}.habilidades_tabla`)} style={{ transform: "scale(1.2)" }} /> {opcion}</label>
                ))}
              </div>

              <label>Criterios Evaluados: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.hab_criterios`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Instrumento: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.hab_instrumento`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Actividades aplicadas: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.habilidades_actividades`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Resultados evidenciados: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.habilidades_logro`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />

              <label style={{ fontWeight: "bold", color: "#555" }}>Mejora Continua:</label>
              <div style={{ marginTop: "5px", marginBottom: "10px", paddingLeft: "10px", borderLeft: "3px solid #3498db" }}>
                <label>Acciones: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.hab_acciones`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
                <label>Propuestas: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.hab_propuestas`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
                <label>Cumplimiento: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.hab_cumplimiento`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
              </div>

              <div style={{ padding: "15px", backgroundColor: "#e0f2fe", borderRadius: "6px", marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", color: "#0284c7", marginBottom: "10px" }}>📎 Cargar Evidencia de Habilidades (Por Paralelo):</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
                  {grupo.indices.map((idx: number) => (
                    <EvidenciaUploader key={`hab_evidencia_${idx}`} label={`Paralelo: ${watchAsignaturas[idx].paralelo}`} name={`asignaturas.${idx}.hab_evidencia`} watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                  ))}
                </div>
              </div>

              {/* 2.3 TAC */}
              <div style={subTitleStyle}>2.3. TAC Implementadas</div>
              <label>Herramienta TAC: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.tac_herramienta`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <div style={checkboxGridStyle}>
                {tacOpciones.map((opcion) => (
                  <label key={opcion} style={checkboxLabelStyle}><input type="checkbox" value={opcion} {...register(`asignaturas.${pIdx}.tac_tabla`)} style={{ transform: "scale(1.2)" }} /> {opcion}</label>
                ))}
              </div>
              <label>Actividades desarrolladas con TAC: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.tac_actividades`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />
              <label>Resultados obtenidos: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.tac_logro`)} rows={2} style={{ ...inputStyle, marginBottom: "10px" }} />

              <label style={{ fontWeight: "bold", color: "#555" }}>Mejora Continua:</label>
              <div style={{ marginTop: "5px", marginBottom: "10px", paddingLeft: "10px", borderLeft: "3px solid #3498db" }}>
                <label>Acciones: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.tac_acciones`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
                <label>Propuestas: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.tac_propuestas`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
                <label>Cumplimiento: {reqStar}</label><textarea {...register(`asignaturas.${pIdx}.tac_cumplimiento`)} rows={2} style={{ ...inputStyle, marginBottom: "8px" }} />
              </div>

              <div style={{ padding: "15px", backgroundColor: "#e0f2fe", borderRadius: "6px", marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", color: "#0284c7", marginBottom: "10px" }}>📎 Cargar Evidencia TAC (Por Paralelo):</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
                  {grupo.indices.map((idx: number) => (
                    <EvidenciaUploader key={`tac_evidencia_${idx}`} label={`Paralelo: ${watchAsignaturas[idx].paralelo}`} name={`asignaturas.${idx}.tac_evidencia`} watch={watch} setValue={setValue} esSoloLectura={esSoloLectura} />
                  ))}
                </div>
              </div>

            </fieldset>
          );
        })}

        {/* ================= SECCIÓN 3: TITULACIÓN ================= */}
        <fieldset disabled={esSoloLectura} style={{ ...fieldsetStyle, borderColor: "#e67e22" }}>
          <legend onClick={() => toggleAcordeon("sec3")} style={{ ...legendStyle, color: "#e67e22", cursor: "pointer", userSelect: "none" }}>
            3. TRABAJOS DE TITULACIÓN
            <span style={{ marginLeft: "15px", fontSize: "0.8em", backgroundColor: "#fbdcbf", padding: "4px 10px", borderRadius: "12px", color: "#d35400" }}>{acordeon.sec3 ? "Ocultar ▲" : "Mostrar ▼"}</span>
          </legend>

          {acordeon.sec3 && (
            <div style={{ paddingTop: "10px" }}>
              <div style={{ ...subTitleStyle, color: "#d35400" }}>Participación como Tutor de Titulación</div>
              <button type="button" onClick={() => appendTitulacion({ estudiante: "", mecanismo: "", tema: "", fecha_designacion: "", estado: "" })} style={{ marginBottom: "15px", padding: "8px 15px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Añadir Proyecto</button>
              {camposTitulacion.map((campo, index) => (
                <div key={campo.id} style={{ display: "flex", gap: "10px", marginBottom: "15px", padding: "15px", backgroundColor: "#fff", border: "1px solid #fbdcbf", borderRadius: "6px", flexWrap: "wrap", position: "relative" }}>
                  <button type="button" onClick={() => removeTitulacion(index)} style={{ position: "absolute", top: "10px", right: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", padding: "4px 8px" }}>X Eliminar</button>
                  <div style={{ flex: "1 1 250px", marginTop: "15px" }}>
                    <label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Estudiante {reqStar}</label>
                    <input {...register(`titulaciones_asignadas.${index}.estudiante`)} style={{ ...inputStyle, marginBottom: "5px", width: "100%" }} />
                    <label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold", marginTop:"5px" }}>Mecanismo {reqStar}</label>
                    <input {...register(`titulaciones_asignadas.${index}.mecanismo`)} style={{ ...inputStyle, width: "100%" }} />
                  </div>
                  <div style={{ flex: "2 1 300px", marginTop: "15px" }}>
                    <label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Tema de Titulación {reqStar}</label>
                    <textarea {...register(`titulaciones_asignadas.${index}.tema`)} style={{ ...inputStyle, width: "100%", height: "100px", resize: "none" }} />
                  </div>
                  <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha Designación {reqStar}</label><input {...register(`titulaciones_asignadas.${index}.fecha_designacion`)} type="date" style={{ ...inputStyle, width: "100%" }} /></div>
                    <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Estado {reqStar}</label>
                      <select {...register(`titulaciones_asignadas.${index}.estado`)} style={{ ...inputStyle, width: "100%" }}>
                        <option value="">Seleccionar...</option><option value="En desarrollo">En desarrollo</option><option value="En revisión">En revisión</option><option value="Aprobado">Aprobado</option><option value="Sustentado">Sustentado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ ...subTitleStyle, marginTop: "25px", color: "#d35400" }}>Participación como Lector / Tribunal</div>
              <button type="button" onClick={() => appendLector({ estudiante: "", mecanismo: "", tema: "", fecha_designacion: "", estado: "" })} style={{ marginBottom: "15px", padding: "8px 15px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Añadir Proyecto Lector</button>
              {camposLector.map((campo, index) => (
                <div key={campo.id} style={{ display: "flex", gap: "10px", marginBottom: "15px", padding: "15px", backgroundColor: "#fff", border: "1px dashed #e67e22", borderRadius: "6px", flexWrap: "wrap", position: "relative" }}>
                  <button type="button" onClick={() => removeLector(index)} style={{ position: "absolute", top: "10px", right: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", padding: "4px 8px" }}>X Eliminar</button>
                  <div style={{ flex: "1 1 250px", marginTop: "15px" }}>
                    <label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Estudiante {reqStar}</label>
                    <input {...register(`titulaciones_lector.${index}.estudiante`)} style={{ ...inputStyle, marginBottom: "5px", width: "100%" }} />
                    <label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Mecanismo {reqStar}</label>
                    <input {...register(`titulaciones_lector.${index}.mecanismo`)} style={{ ...inputStyle, width: "100%" }} />
                  </div>
                  <div style={{ flex: "2 1 300px", marginTop: "15px" }}>
                    <label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Tema de Titulación {reqStar}</label>
                    <textarea {...register(`titulaciones_lector.${index}.tema`)} style={{ ...inputStyle, width: "100%", height: "100px", resize: "none" }} />
                  </div>
                  <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha Designación {reqStar}</label><input {...register(`titulaciones_lector.${index}.fecha_designacion`)} type="date" style={{ ...inputStyle, width: "100%" }} /></div>
                    <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Estado {reqStar}</label>
                      <select {...register(`titulaciones_lector.${index}.estado`)} style={{ ...inputStyle, width: "100%" }}>
                        <option value="">Seleccionar...</option><option value="En revisión">En revisión</option><option value="Aprobado">Aprobado</option><option value="Sustentado">Sustentado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 4: PRÁCTICAS ================= */}
        <fieldset disabled={esSoloLectura} style={{ ...fieldsetStyle, borderColor: "#8e44ad" }}>
          <legend onClick={() => toggleAcordeon("sec4")} style={{ ...legendStyle, color: "#8e44ad", cursor: "pointer", userSelect: "none" }}>
            4. PRÁCTICAS PREPROFESIONALES (Tutor)
            <span style={{ marginLeft: "15px", fontSize: "0.8em", backgroundColor: "#e8daef", padding: "4px 10px", borderRadius: "12px", color: "#6c3483" }}>{acordeon.sec4 ? "Ocultar ▲" : "Mostrar ▼"}</span>
          </legend>
          {acordeon.sec4 && (
            <div style={{ paddingTop: "10px" }}>
              <button type="button" onClick={() => appendPractica({ estudiante: "", tipo_identificacion: "", identificacion: "", empresa: "", tipo_empresa: "", fecha_designacion: "" })} style={{ marginBottom: "15px", padding: "8px 15px", backgroundColor: "#8e44ad", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Añadir Estudiante</button>
              {camposPracticas.map((campo, index) => (
                <div key={campo.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px", padding: "15px", backgroundColor: "#fff", border: "1px dashed #8e44ad", borderRadius: "6px", position: "relative" }}>
                  <button type="button" onClick={() => removePractica(index)} style={{ position: "absolute", top: "10px", right: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", padding: "4px 8px" }}>X Eliminar</button>
                  <div style={{ marginTop: "15px" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Estudiante: {reqStar}</label><input {...register(`practicas.${index}.estudiante`)} type="text" style={inputStyle} /></div>
                  <div style={{ marginTop: "15px" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Tipo Identificación: {reqStar}</label><select {...register(`practicas.${index}.tipo_identificacion`)} style={{ ...inputStyle, backgroundColor: "#fff" }}><option value="">Seleccione...</option><option value="Cédula">Cédula</option><option value="Pasaporte">Pasaporte</option></select></div>
                  <div style={{ marginTop: "15px" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Identificación: {reqStar}</label><input {...register(`practicas.${index}.identificacion`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Empresa: {reqStar}</label><input {...register(`practicas.${index}.empresa`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Tipo Empresa: {reqStar}</label><select {...register(`practicas.${index}.tipo_empresa`)} style={{ ...inputStyle, backgroundColor: "#fff" }}><option value="">Seleccione...</option><option value="Pública">Pública</option><option value="Privada">Privada</option></select></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha Designación: {reqStar}</label><input {...register(`practicas.${index}.fecha_designacion`)} type="date" style={inputStyle} /></div>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 5 ================= */}
        <fieldset disabled={esSoloLectura} style={{ ...fieldsetStyle, borderColor: "#e67e22" }}>
          <legend onClick={() => toggleAcordeon("sec5")} style={{ ...legendStyle, color: "#e67e22", cursor: "pointer", userSelect: "none" }}>
            5. VINCULACIÓN CON LA SOCIEDAD
            <span style={{ marginLeft: "15px", fontSize: "0.8em", backgroundColor: "#fbdcbf", padding: "4px 10px", borderRadius: "12px", color: "#d35400" }}>{acordeon.sec5 ? "Ocultar ▲" : "Mostrar ▼"}</span>
          </legend>
          {acordeon.sec5 && (
            <div style={{ paddingTop: "10px" }}>
              <div style={subTitleStyle}>Datos Oficiales del Proyecto</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px" }}>
                <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Nombre del Proyecto:</label><input {...register("vinc_nombre")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Código Proyecto: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_codigo_proyecto")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Tipo Proyecto: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_tipo_proyecto")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Programa: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_programa")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Avance (%): {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_estado")} type="text" style={inputStyle} /></div>
                <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Objetivo: {watch("vinc_nombre") && reqStar}</label><textarea {...register("vinc_objetivo")} rows={2} style={inputStyle}></textarea></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Facultad / Entidad: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_facultad")} type="text" readOnly style={{ ...inputStyle, ...readOnlyStyle }} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Fecha Inicio: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_fecha_inicio")} type="date" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Fecha Fin Planeado: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_fecha_fin_planeado")} type="date" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Fecha Fin Real: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_fecha_fin_real")} type="date" style={inputStyle} /></div>
              </div>
              <div style={subTitleStyle}>Dirección e Impacto</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px" }}>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Coordinador/Director: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_coordinador")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Correo Coordinador: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_correo_coordinador")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Teléfono: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_telefono_coordinador")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Línea Investigación: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_linea_investigacion")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Alcance Territorial: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_alcance")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Impacto Social: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_impacto_social")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Impacto Científico: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_impacto_cientifico")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Impacto Económico: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_impacto_economico")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Impacto Político: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_impacto_politico")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Otro Impacto:</label><input {...register("vinc_otro_impacto")} type="text" style={inputStyle} /></div>
              </div>
              <div style={subTitleStyle}>Gestión Administrativa y Financiera</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Fuente Financiamiento: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_financiamiento")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Presupuesto Planificado: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_presupuesto_plan")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Presupuesto Ejecutado: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_presupuesto_ejec")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Horas de Dedicación: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_horas")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Tipo Participante: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_tipo_participante")} type="text" style={inputStyle} /></div>
                <div><label style={{ fontSize: "0.8em", color: "#555" }}>Grupo Investigación: {watch("vinc_nombre") && reqStar}</label><input {...register("vinc_grupo_inv")} type="text" style={inputStyle} /></div>
              </div>
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 6 ================= */}
        <fieldset disabled={esSoloLectura} style={{ ...fieldsetStyle, borderColor: "#e67e22" }}>
          <legend onClick={() => toggleAcordeon("sec6")} style={{ ...legendStyle, color: "#e67e22", cursor: "pointer", userSelect: "none" }}>
            6. INVESTIGACIÓN Y PUBLICACIONES
            <span style={{ marginLeft: "15px", fontSize: "0.8em", backgroundColor: "#fbdcbf", padding: "4px 10px", borderRadius: "12px", color: "#d35400" }}>{acordeon.sec6 ? "Ocultar ▲" : "Mostrar ▼"}</span>
          </legend>
          {acordeon.sec6 && (
            <div style={{ paddingTop: "10px" }}>
              <div style={subTitleStyle}>Publicaciones y Ponencias Acreditadas</div>
              <button type="button" onClick={() => appendPublicacion({ titulo: "", nombres: "", codigo_ies: "", tipo_pub: "", tipo_articulo: "", codigo_pub: "", base_indexada: "", issn: "", revista: "", fecha_pub: "", cargo: "", facultad: "Facultad de Ingeniería y Ciencias Aplicadas", intercultural: "", link_pub: "", link_revista: "" })} style={{ marginBottom: "15px", padding: "8px 15px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Añadir Publicación</button>
              {camposPublicaciones.map((campo, index) => (
                <div key={campo.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "20px", padding: "15px", backgroundColor: "#fff", border: "1px dashed #e67e22", borderRadius: "6px", position: "relative" }}>
                  <button type="button" onClick={() => removePublicacion(index)} style={{ position: "absolute", top: "10px", right: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", padding: "4px 8px" }}>X Eliminar</button>
                  <div style={{ gridColumn: "1 / -1", marginTop:"15px" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Título: {reqStar}</label><input {...register(`publicaciones.${index}.titulo`)} type="text" style={inputStyle} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Autores: {reqStar}</label><input {...register(`publicaciones.${index}.nombres`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Código IES: {reqStar}</label><input {...register(`publicaciones.${index}.codigo_ies`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Tipo Publicación: {reqStar}</label><select {...register(`publicaciones.${index}.tipo_pub`)} style={{ ...inputStyle, backgroundColor: "#fff" }}><option value="">Seleccione...</option><option value="Artículo">Artículo</option><option value="Capítulo de Libro">Capítulo de Libro</option><option value="Libro">Libro</option></select></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Tipo Artículo: {reqStar}</label><select {...register(`publicaciones.${index}.tipo_articulo`)} style={{ ...inputStyle, backgroundColor: "#fff" }}><option value="">Seleccione...</option><option value="Revista">Revista</option><option value="Congreso">Congreso</option></select></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Código Pub: {reqStar}</label><input {...register(`publicaciones.${index}.codigo_pub`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Base Indexada: {reqStar}</label><input {...register(`publicaciones.${index}.base_indexada`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>ISSN: {reqStar}</label><input {...register(`publicaciones.${index}.issn`)} type="text" style={inputStyle} /></div>
                  <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: "0.8em", color: "#555" }}>Nombre Revista: {reqStar}</label><input {...register(`publicaciones.${index}.revista`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Fecha Publicación: {reqStar}</label><input {...register(`publicaciones.${index}.fecha_pub`)} type="date" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Cargo: {reqStar}</label><input {...register(`publicaciones.${index}.cargo`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.8em", color: "#555" }}>Enfoque Intercultural: {reqStar}</label><input {...register(`publicaciones.${index}.intercultural`)} type="text" style={inputStyle} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: "0.8em", color: "#555" }}>Link Publicación: {reqStar}</label><input {...register(`publicaciones.${index}.link_pub`)} type="text" style={inputStyle} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: "0.8em", color: "#555" }}>Link Revista: {reqStar}</label><input {...register(`publicaciones.${index}.link_revista`)} type="text" style={inputStyle} /></div>
                </div>
              ))}

              <div style={{ ...subTitleStyle, marginTop: "20px" }}>Proyectos de Investigación</div>
              <button type="button" onClick={() => appendProyectoInv({ proyecto: "", institucion: "", cargo: "", fecha_designacion: "", fecha_inicio: "", fecha_fin: "" })} style={{ marginBottom: "15px", padding: "8px 15px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Añadir Proyecto</button>
              {camposProyectosInv.map((campo, index) => (
                <div key={campo.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px", padding: "15px", backgroundColor: "#fff", border: "1px dashed #e67e22", borderRadius: "6px", position: "relative" }}>
                  <button type="button" onClick={() => removeProyectoInv(index)} style={{ position: "absolute", top: "10px", right: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", padding: "4px 8px" }}>X Eliminar</button>
                  <div style={{ gridColumn: "1 / -1", marginTop:"15px" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Proyecto: {reqStar}</label><input {...register(`proyectos_investigacion.${index}.proyecto`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Institución: {reqStar}</label><input {...register(`proyectos_investigacion.${index}.institucion`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Cargo: {reqStar}</label><input {...register(`proyectos_investigacion.${index}.cargo`)} type="text" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha designación: {reqStar}</label><input {...register(`proyectos_investigacion.${index}.fecha_designacion`)} type="date" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha inicio: {reqStar}</label><input {...register(`proyectos_investigacion.${index}.fecha_inicio`)} type="date" style={inputStyle} /></div>
                  <div><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha fin: {reqStar}</label><input {...register(`proyectos_investigacion.${index}.fecha_fin`)} type="date" style={inputStyle} /></div>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        {/* ================= SECCIÓN 7 ================= */}
        <fieldset disabled={esSoloLectura} style={fieldsetStyle}>
          <legend onClick={() => toggleAcordeon("sec7")} style={{ ...legendStyle, cursor: "pointer", userSelect: "none" }}>
            7. DESIGNACIONES Y CIERRE
            <span style={{ marginLeft: "15px", fontSize: "0.8em", backgroundColor: "#d4e6f1", padding: "4px 10px", borderRadius: "12px", color: "#1a3b5c" }}>{acordeon.sec7 ? "Ocultar ▲" : "Mostrar ▼"}</span>
          </legend>
          {acordeon.sec7 && (
            <div style={{ paddingTop: "10px" }}>
              <label style={{ fontWeight: "bold", color: "#555" }}>Otras Designaciones / Comisiones (Ingreso manual):</label>
              <textarea {...register("designaciones")} rows={3} placeholder="Ej. Miembro de Comisión de Prácticas, Coordinador de Área, etc..." style={{ ...inputStyle, marginBottom: "10px" }}></textarea>
              <div style={{ display: "flex", gap: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "150px" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha de inicio (Designación):</label><input {...register("designaciones_fecha_inicio")} type="date" style={inputStyle} /></div>
                <div style={{ flex: 1, minWidth: "150px" }}><label style={{ fontSize: "0.85em", color: "#555", fontWeight: "bold" }}>Fecha de fin (Designación):</label><input {...register("designaciones_fecha_fin")} type="date" style={inputStyle} /></div>
              </div>
              <div style={{ display: "flex", gap: "15px", marginTop: "15px", minWidth: 0, flexWrap: "wrap", borderTop: "1px solid #ddd", paddingTop: "15px" }}>
                <div style={{ flex: 1, minWidth: "150px" }}><label>Fecha de elaboración (Informe):</label><input {...register("fecha_elaboracion")} type="date" style={inputStyle} /></div>
                <div style={{ flex: 2, minWidth: "200px" }}><label>Firma y Nombre del Docente:</label><input {...register("firma_docente")} type="text" style={inputStyle} /></div>
              </div>
            </div>
          )}
        </fieldset>

        {/* ================= BOTONES FINALES ================= */}
        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
          {!esSoloLectura && (
            <button type="submit" disabled={cargando} style={{ flex: 1, backgroundColor: cargando ? "#9ca3af" : "#1a3b5c", color: "#fff", padding: "15px", border: "none", borderRadius: "4px", cursor: cargando ? "not-allowed" : "pointer", fontSize: "18px", fontWeight: "bold" }}>
              {cargando ? "Guardando..." : "Guardar Informe y Archivos"}
            </button>
          )}
          <button type="button" onClick={descargarPDF} style={{ flex: 1, backgroundColor: "#c0392b", color: "#fff", padding: "15px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "18px", fontWeight: "bold" }}>Descargar PDF</button>
        </div>
      </form>
    </div>
  );
}