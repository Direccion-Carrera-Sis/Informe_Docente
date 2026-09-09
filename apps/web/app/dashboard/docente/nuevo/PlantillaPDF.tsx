// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export interface AsignaturaDataPDF {
  carrera: string;
  materia: string;
  codigo: string;
  paralelo: string;
  estudiantes: string;
  asistencia: string;
  aprobados: string;
  reprobados: string;
  tiene_pae?: boolean;

  resultados_tabla?: string;
  res_criterios?: string;
  res_instrumento?: string;
  resultados_actividades?: string;
  resultados_logro?: string;
  res_acciones?: string;
  res_propuestas?: string;
  res_cumplimiento?: string;

  habilidades_tabla?: string[];
  habilidades_otros?: string;
  hab_criterios?: string;
  hab_instrumento?: string;
  habilidades_actividades?: string;
  habilidades_logro?: string;
  hab_acciones?: string;
  hab_propuestas?: string;
  hab_cumplimiento?: string;

  tac_herramienta?: string;
  tac_tabla?: string[];
  tac_otros?: string;
  tac_actividades?: string;
  tac_logro?: string;
  tac_acciones?: string;
  tac_propuestas?: string;
  tac_cumplimiento?: string;
}

export interface TitulacionDataPDF {
  estudiante: string;
  mecanismo: string;
  tema: string;
  fecha_designacion: string;
  estado: string;
}

export interface PracticaDataPDF {
  estudiante: string;
  empresa: string;
  fecha_designacion: string;
}

export interface ProyectoInvDataPDF {
  proyecto: string;
  institucion: string;
  cargo: string;
}

export interface PublicacionDataPDF {
  nombres: string;
  titulo: string;
  revista: string;
  fecha_pub: string;
}

export interface InformeData {
  docente_nombre?: string;
  periodo?: string;
  asignaturas?: AsignaturaDataPDF[];
  titulaciones_asignadas?: TitulacionDataPDF[];
  titulaciones_lector?: TitulacionDataPDF[];
  practicas?: PracticaDataPDF[];
  proyectos_investigacion?: ProyectoInvDataPDF[];
  publicaciones?: PublicacionDataPDF[];
  vinc_nombre?: string;
  vinc_facultad?: string;
  vinc_estado?: string;
  designaciones?: string;
  fecha_elaboracion?: string;
  firma_docente?: string;
  archivos_adjuntos?: string[]; // 👈 NUEVO: Lista de nombres de archivos
}

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 60, paddingHorizontal: 50, fontFamily: "Helvetica" },
  headerContainer: { marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoBox: { width: 60, height: 60, justifyContent: "center" },
  logoImage: { width: "100%", maxHeight: 60, objectFit: "contain" },
  headerTextContainer: { flex: 1, textAlign: "center", paddingHorizontal: 10 },
  universityText: { fontSize: 13, fontWeight: "bold", color: "#000" },
  facultyText: { fontSize: 11, fontWeight: "bold", marginTop: 3 },
  careerText: { fontSize: 10, fontWeight: "bold", marginTop: 2 },
  reportTitle: { fontSize: 12, fontWeight: "bold", marginTop: 15, textDecoration: "underline" },
  periodText: { fontSize: 10, marginTop: 5 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginTop: 15, marginBottom: 8, color: "#000", backgroundColor: "#f0f0f0", padding: 4 },
  subSectionTitle: { fontSize: 10, fontWeight: "bold", marginTop: 10, marginBottom: 5, color: "#1a3b5c" },
  table: { display: "flex", flexDirection: "column", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000", marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" },
  tableRowLast: { flexDirection: "row" },
  tableHeader: { backgroundColor: "#e6e6e6", fontWeight: "bold" },
  tableCell: { padding: 4, fontSize: 8, borderRightWidth: 1, borderRightColor: "#000", display: "flex", justifyContent: "center", lineHeight: 1.3 },
  tableCellLast: { padding: 4, fontSize: 8, display: "flex", justifyContent: "center", lineHeight: 1.3 },
  noteText: { fontSize: 8, color: "#333", marginBottom: 10, fontStyle: "italic" },
  bodyText: { fontSize: 9, marginBottom: 4, lineHeight: 1.4, color: "#333" },
  evalContainer: { marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  evalTitle: { fontSize: 10, fontWeight: "bold", color: "#1a3b5c", marginBottom: 5 },
  evalSubTitle: { fontSize: 9, fontWeight: "bold", marginTop: 8, marginBottom: 3, color: "#000" },
  legendText: { fontSize: 7, color: "#555", marginTop: 2, marginBottom: 10, fontStyle: "italic" },
  signatureContainer: { marginTop: 50, alignItems: "center" },
  signatureLine: { width: 250, borderBottomWidth: 1, borderBottomColor: "#000", marginBottom: 5 },
  signatureText: { fontSize: 10, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 50, right: 50, fontSize: 8, flexDirection: "row", justifyContent: "space-between", color: "#555" },
});

// 👉 Recibimos los logos como propiedad
export const PlantillaPDF = ({ datos, logos }: { datos: InformeData, logos?: { facultad?: string, carrera?: string } }) => {
  const renderBullets = (texto?: string) => {
    if (!texto) return <Text style={styles.bodyText}>N/A</Text>;
    return texto.split("\n").map((line, i) =>
      line.trim() !== "" ? <Text key={i} style={styles.bodyText}>• {line}</Text> : null,
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ENCABEZADO OFICIAL CON LOGOS CONDICIONALES */}
        <View style={styles.headerContainer} fixed>
          <View style={styles.logoBox}>
            {logos?.facultad && <Image src={logos.facultad} style={styles.logoImage} />}
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.universityText}>UNIVERSIDAD CENTRAL DEL ECUADOR</Text>
            <Text style={styles.facultyText}>FACULTAD DE INGENIERÍA Y CIENCIAS APLICADAS</Text>
            <Text style={styles.careerText}>CARRERA DE SISTEMAS DE INFORMACIÓN</Text>
            <Text style={styles.reportTitle}>INFORME DE ACTIVIDADES DOCENTES</Text>
            <Text style={styles.periodText}>Período Académico: {datos?.periodo || "26-26"}</Text>
            <Text style={{ fontSize: 10, marginTop: 5 }}>Docente: {datos?.docente_nombre || "No especificado"}</Text>
          </View>

          <View style={styles.logoBox}>
            {logos?.carrera && <Image src={logos.carrera} style={styles.logoImage} />}
          </View>
        </View>

        {/* 1. ACTIVIDADES DE DOCENCIA */}
        <Text style={styles.sectionTitle}>1. Actividades de Docencia</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>No.</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Carrera</Text>
            <Text style={[styles.tableCell, { width: "35%" }]}>Materia</Text>
            <Text style={[styles.tableCell, { width: "10%", textAlign: "center" }]}>N° Est.</Text>
            <Text style={[styles.tableCell, { width: "10%", textAlign: "center" }]}>% Asist.</Text>
            <Text style={[styles.tableCell, { width: "10%", textAlign: "center" }]}>% Aprob.</Text>
            <Text style={[styles.tableCellLast, { width: "10%", textAlign: "center" }]}>% Reprob.</Text>
          </View>

          {datos?.asignaturas && datos.asignaturas.length > 0 ? (
            datos.asignaturas.map((asig, index) => {
              const isLast = index === datos.asignaturas.length - 1;
              return (
                <View style={isLast ? styles.tableRowLast : styles.tableRow} key={index}>
                  <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{asig.carrera || "Sistemas de Información"}</Text>
                  <Text style={[styles.tableCell, { width: "35%" }]}>{asig.materia} {asig.codigo ? `- ${asig.codigo}` : ""}</Text>
                  <Text style={[styles.tableCell, { width: "10%", textAlign: "center" }]}>{asig.estudiantes || "0"}</Text>
                  <Text style={[styles.tableCell, { width: "10%", textAlign: "center" }]}>{asig.asistencia || "0"}</Text>
                  <Text style={[styles.tableCell, { width: "10%", textAlign: "center" }]}>{asig.aprobados || "0"}</Text>
                  <Text style={[styles.tableCellLast, { width: "10%", textAlign: "center" }]}>{asig.reprobados || "0"}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRowLast}><Text style={[styles.tableCellLast, { width: "100%", textAlign: "center" }]}>N/A</Text></View>
          )}
        </View>
        {(!datos?.asignaturas || datos.asignaturas.length === 0) && <Text style={styles.legendText}>* N/A: No Aplica</Text>}

        {/* 2. EVALUACIÓN ESPECÍFICA */}
        <Text style={styles.sectionTitle}>2. Evaluación Específica por Asignatura</Text>
        {datos?.asignaturas && datos.asignaturas.length > 0 ? (
          datos.asignaturas.map((asig, index) => (
            <View key={`eval-${index}`} style={styles.evalContainer}>
              <Text style={styles.evalTitle}>2.{index + 1}. Asignatura: {asig.materia || "Sin nombre"} (Paralelo: {asig.paralelo || "N/A"})</Text>

              {/* Tabla A */}
              <View wrap={false}>
                <Text style={styles.evalSubTitle}>a) Resultados de Aprendizaje Evaluados</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, { width: "25%", textAlign: "center" }]}>Resultado</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "center" }]}>Criterios / Instrumento</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "center" }]}>Actividades / Logro</Text>
                    <Text style={[styles.tableCellLast, { width: "35%", textAlign: "center" }]}>Mejora Continua</Text>
                  </View>
                  <View style={styles.tableRowLast}>
                    <Text style={[styles.tableCell, { width: "25%", textAlign: "left" }]}>{asig.resultados_tabla || "N/A"}</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "left" }]}>C: {asig.res_criterios || "N/A"}{"\n"}I: {asig.res_instrumento || "N/A"}</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "left" }]}>A: {asig.resultados_actividades || "N/A"}{"\n"}L: {asig.resultados_logro || "N/A"}</Text>
                    <Text style={[styles.tableCellLast, { width: "35%", textAlign: "left" }]}>Ac: {asig.res_acciones || "N/A"}{"\n"}Pr: {asig.res_propuestas || "N/A"}{"\n"}Cu: {asig.res_cumplimiento || "N/A"}</Text>
                  </View>
                </View>
                <Text style={styles.legendText}>*C (Criterios), I (Instrumento), A (Actividades), L (Logro), Ac (Acciones), Pr (Propuestas), Cu (Cumplimiento).</Text>
              </View>

              {/* Tabla B */}
              <View wrap={false}>
                <Text style={styles.evalSubTitle}>b) Habilidades Blandas Implementadas</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, { width: "25%", textAlign: "center" }]}>Habilidades</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "center" }]}>Criterios / Instrumento</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "center" }]}>Actividades / Logro</Text>
                    <Text style={[styles.tableCellLast, { width: "35%", textAlign: "center" }]}>Mejora Continua</Text>
                  </View>
                  <View style={styles.tableRowLast}>
                    <Text style={[styles.tableCell, { width: "25%", textAlign: "left" }]}>{asig.habilidades_tabla?.join(", ") || "N/A"} {asig.habilidades_tabla?.includes("Otros") ? ` (${asig.habilidades_otros})` : ""}</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "left" }]}>C: {asig.hab_criterios || "N/A"}{"\n"}I: {asig.hab_instrumento || "N/A"}</Text>
                    <Text style={[styles.tableCell, { width: "20%", textAlign: "left" }]}>A: {asig.habilidades_actividades || "N/A"}{"\n"}L: {asig.habilidades_logro || "N/A"}</Text>
                    <Text style={[styles.tableCellLast, { width: "35%", textAlign: "left" }]}>Ac: {asig.hab_acciones || "N/A"}{"\n"}Pr: {asig.hab_propuestas || "N/A"}{"\n"}Cu: {asig.hab_cumplimiento || "N/A"}</Text>
                  </View>
                </View>
                <Text style={styles.legendText}>*C (Criterios), I (Instrumento), A (Actividades), L (Logro), Ac (Acciones), Pr (Propuestas), Cu (Cumplimiento).</Text>
              </View>

              {/* Tabla C */}
              <View wrap={false}>
                <Text style={styles.evalSubTitle}>c) Herramientas TAC</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, { width: "25%", textAlign: "center" }]}>Herramienta / Tipo</Text>
                    <Text style={[styles.tableCell, { width: "40%", textAlign: "center" }]}>Actividades / Logro</Text>
                    <Text style={[styles.tableCellLast, { width: "35%", textAlign: "center" }]}>Mejora Continua</Text>
                  </View>
                  <View style={styles.tableRowLast}>
                    <Text style={[styles.tableCell, { width: "25%", textAlign: "left" }]}>H: {asig.tac_herramienta || "N/A"}{"\n"}T: {asig.tac_tabla?.join(", ") || "N/A"} {asig.tac_tabla?.includes("Otros") ? `(${asig.tac_otros})` : ""}</Text>
                    <Text style={[styles.tableCell, { width: "40%", textAlign: "left" }]}>A: {asig.tac_actividades || "N/A"}{"\n"}L: {asig.tac_logro || "N/A"}</Text>
                    <Text style={[styles.tableCellLast, { width: "35%", textAlign: "left" }]}>Ac: {asig.tac_acciones || "N/A"}{"\n"}Pr: {asig.tac_propuestas || "N/A"}{"\n"}Cu: {asig.tac_cumplimiento || "N/A"}</Text>
                  </View>
                </View>
                <Text style={styles.legendText}>*H (Herramienta), T (Tipo), A (Actividades), L (Logro), Ac (Acciones), Pr (Propuestas), Cu (Cumplimiento).</Text>
              </View>

              {asig.tiene_pae && <Text style={{ fontSize: 9, color: "#be185d", fontWeight: "bold", marginTop: 6 }}>* Esta materia incluye horas de Prácticas de Aplicación y Experimentación (PAE).</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.bodyText}>No registra asignaturas para evaluación.</Text>
        )}

        {/* 3. TRABAJOS DE TITULACIÓN */}
        <Text style={styles.sectionTitle}>3. Trabajos de Titulación</Text>
        <Text style={styles.subSectionTitle}>Trabajos de titulación (tutor)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>No.</Text>
            <Text style={[styles.tableCell, { width: "30%" }]}>Estudiante(s)</Text>
            <Text style={[styles.tableCell, { width: "40%" }]}>Título</Text>
            <Text style={[styles.tableCell, { width: "15%" }]}>Fecha designación</Text>
            <Text style={[styles.tableCellLast, { width: "10%" }]}>Estado</Text>
          </View>
          {datos?.titulaciones_asignadas && datos.titulaciones_asignadas.length > 0 ? (
            datos.titulaciones_asignadas.map((tit, index) => {
              const isLast = index === datos.titulaciones_asignadas.length - 1;
              return (
                <View style={isLast ? styles.tableRowLast : styles.tableRow} key={index} wrap={false}>
                  <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { width: "30%" }]}>{tit.estudiante}</Text>
                  <Text style={[styles.tableCell, { width: "40%" }]}>{tit.tema}</Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>{tit.fecha_designacion}</Text>
                  <Text style={[styles.tableCellLast, { width: "10%" }]}>{tit.estado}</Text>
                </View>
              );
            })
          ) : <View style={styles.tableRowLast}><Text style={[styles.tableCellLast, { width: "100%", textAlign: "center" }]}>N/A</Text></View>}
        </View>
        {(!datos?.titulaciones_asignadas || datos.titulaciones_asignadas.length === 0) && <Text style={styles.legendText}>* N/A: No Aplica</Text>}

        <Text style={styles.subSectionTitle}>Trabajos de titulación (lector)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>No.</Text>
            <Text style={[styles.tableCell, { width: "35%" }]}>Estudiante(s)</Text>
            <Text style={[styles.tableCell, { width: "45%" }]}>Título</Text>
            <Text style={[styles.tableCellLast, { width: "15%" }]}>Fecha designación</Text>
          </View>
          {datos?.titulaciones_lector && datos.titulaciones_lector.length > 0 ? (
            datos.titulaciones_lector.map((tit, index) => {
              const isLast = index === datos.titulaciones_lector.length - 1;
              return (
                <View style={isLast ? styles.tableRowLast : styles.tableRow} key={index} wrap={false}>
                  <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { width: "35%" }]}>{tit.estudiante}</Text>
                  <Text style={[styles.tableCell, { width: "45%" }]}>{tit.tema}</Text>
                  <Text style={[styles.tableCellLast, { width: "15%" }]}>{tit.fecha_designacion}</Text>
                </View>
              );
            })
          ) : <View style={styles.tableRowLast}><Text style={[styles.tableCellLast, { width: "100%", textAlign: "center" }]}>N/A</Text></View>}
        </View>
        {(!datos?.titulaciones_lector || datos.titulaciones_lector.length === 0) && <Text style={styles.legendText}>* N/A: No Aplica</Text>}

        {/* 4. PRÁCTICAS */}
        <Text style={styles.sectionTitle}>4. Prácticas Preprofesionales (Tutor)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>No.</Text>
            <Text style={[styles.tableCell, { width: "45%" }]}>Estudiante</Text>
            <Text style={[styles.tableCell, { width: "35%" }]}>Empresa / Institución</Text>
            <Text style={[styles.tableCellLast, { width: "15%" }]}>Fecha designación</Text>
          </View>
          {datos?.practicas && datos.practicas.length > 0 ? (
            datos.practicas.map((prac, index) => {
              const isLast = index === datos.practicas.length - 1;
              return (
                <View style={isLast ? styles.tableRowLast : styles.tableRow} key={index} wrap={false}>
                  <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { width: "45%" }]}>{prac.estudiante}</Text>
                  <Text style={[styles.tableCell, { width: "35%" }]}>{prac.empresa}</Text>
                  <Text style={[styles.tableCellLast, { width: "15%" }]}>{prac.fecha_designacion}</Text>
                </View>
              );
            })
          ) : <View style={styles.tableRowLast}><Text style={[styles.tableCellLast, { width: "100%", textAlign: "center" }]}>N/A</Text></View>}
        </View>
        {(!datos?.practicas || datos.practicas.length === 0) && <Text style={styles.legendText}>* N/A: No Aplica</Text>}

        {/* 5. VINCULACIÓN */}
        <Text style={styles.sectionTitle}>5. Vinculación con la Sociedad</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>No.</Text>
            <Text style={[styles.tableCell, { width: "45%" }]}>Proyecto</Text>
            <Text style={[styles.tableCell, { width: "35%" }]}>Institución</Text>
            <Text style={[styles.tableCellLast, { width: "15%" }]}>Avance (%)</Text>
          </View>
          {datos?.vinc_nombre ? (
            <View style={styles.tableRowLast} wrap={false}>
              <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>1</Text>
              <Text style={[styles.tableCell, { width: "45%" }]}>{datos.vinc_nombre}</Text>
              <Text style={[styles.tableCell, { width: "35%" }]}>{datos.vinc_facultad || "N/A"}</Text>
              <Text style={[styles.tableCellLast, { width: "15%" }]}>{datos.vinc_estado || "N/A"}</Text>
            </View>
          ) : <View style={styles.tableRowLast}><Text style={[styles.tableCellLast, { width: "100%", textAlign: "center" }]}>N/A</Text></View>}
        </View>
        {!datos?.vinc_nombre && <Text style={styles.legendText}>* N/A: No Aplica</Text>}

        {/* 6. INVESTIGACIÓN Y PUBLICACIONES */}
        <Text style={styles.sectionTitle}>6. Investigación y Publicaciones</Text>
        <Text style={styles.subSectionTitle}>Proyectos de investigación</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>No.</Text>
            <Text style={[styles.tableCell, { width: "45%" }]}>Proyecto</Text>
            <Text style={[styles.tableCell, { width: "30%" }]}>Institución</Text>
            <Text style={[styles.tableCellLast, { width: "20%" }]}>Cargo</Text>
          </View>
          {datos?.proyectos_investigacion && datos.proyectos_investigacion.length > 0 ? (
            datos.proyectos_investigacion.map((proy, index) => {
              const isLast = index === datos.proyectos_investigacion.length - 1;
              return (
                <View style={isLast ? styles.tableRowLast : styles.tableRow} key={index} wrap={false}>
                  <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { width: "45%" }]}>{proy.proyecto}</Text>
                  <Text style={[styles.tableCell, { width: "30%" }]}>{proy.institucion}</Text>
                  <Text style={[styles.tableCellLast, { width: "20%" }]}>{proy.cargo}</Text>
                </View>
              );
            })
          ) : <View style={styles.tableRowLast}><Text style={[styles.tableCellLast, { width: "100%", textAlign: "center" }]}>N/A</Text></View>}
        </View>
        {(!datos?.proyectos_investigacion || datos.proyectos_investigacion.length === 0) && <Text style={styles.legendText}>* N/A: No Aplica</Text>}

        <Text style={styles.subSectionTitle}>Publicaciones y Ponencias Acreditadas</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>No.</Text>
            <Text style={[styles.tableCell, { width: "25%" }]}>Autor(es)</Text>
            <Text style={[styles.tableCell, { width: "35%" }]}>Título</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>Revista/Congreso</Text>
            <Text style={[styles.tableCellLast, { width: "15%" }]}>Fecha</Text>
          </View>
          {datos?.publicaciones && datos.publicaciones.length > 0 ? (
            datos.publicaciones.map((pub, index) => {
              const isLast = index === datos.publicaciones.length - 1;
              return (
                <View style={isLast ? styles.tableRowLast : styles.tableRow} key={index} wrap={false}>
                  <Text style={[styles.tableCell, { width: "5%", textAlign: "center" }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { width: "25%" }]}>{pub.nombres}</Text>
                  <Text style={[styles.tableCell, { width: "35%" }]}>{pub.titulo}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{pub.revista}</Text>
                  <Text style={[styles.tableCellLast, { width: "15%" }]}>{pub.fecha_pub}</Text>
                </View>
              );
            })
          ) : <View style={styles.tableRowLast}><Text style={[styles.tableCellLast, { width: "100%", textAlign: "center" }]}>N/A</Text></View>}
        </View>
        {(!datos?.publicaciones || datos.publicaciones.length === 0) && <Text style={styles.legendText}>* N/A: No Aplica</Text>}

        {/* 7. DESIGNACIONES Y CIERRE */}
        <Text style={styles.sectionTitle}>7. Designaciones y Cierre</Text>
        <Text style={styles.bodyText}>Otras designaciones, comisiones o actividades administrativas:</Text>
        <View style={{ marginTop: 5 }}>{renderBullets(datos?.designaciones)}</View>

        {/* 👇 NUEVA SECCIÓN 8: LISTADO DE EVIDENCIAS CARGADAS */}
        <Text style={styles.sectionTitle} break>8. Listado de Evidencias Digitales Cargadas</Text>
        <View style={{ marginTop: 5 }}>
          {datos?.archivos_adjuntos && datos.archivos_adjuntos.length > 0 ? (
            datos.archivos_adjuntos.map((nombre, idx) => (
              <Text key={idx} style={styles.bodyText}>• {nombre}</Text>
            ))
          ) : (
            <Text style={styles.bodyText}>No se adjuntaron evidencias digitales.</Text>
          )}
        </View>

        {/* FIRMAS */}
        <View style={styles.signatureContainer} wrap={false}>
          <Text style={{ fontSize: 9, marginBottom: 40 }}>Fecha de elaboración: {datos?.fecha_elaboracion || "___/___/______"}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>{datos?.firma_docente || "FIRMA Y NOMBRE DEL DOCENTE"}</Text>
        </View>

        {/* PIE DE PÁGINA */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${datos?.docente_nombre || ""}                                                                                                     Página ${pageNumber} | ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};