// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

export interface InformeData {
  docente_nombre?: string;
  periodo?: string;
  asignaturas?: AsignaturaDataPDF[];
  titulaciones_asignadas?: TitulacionDataPDF[];
  practicas_estudiante?: string;
  prac_nombre_institucion?: string;
  prac_fecha_inicio?: string;
  prac_fecha_fin?: string;
  prac_numero_horas?: string;
  vinc_nombre?: string;
  vinc_institucion?: string;
  vinc_estado?: string;
  inv_titulo?: string;
  inv_nombres?: string;
  inv_revista?: string;
  evidencias?: string;
  fecha_elaboracion?: string;
  firma_docente?: string;
}

const styles = StyleSheet.create({
  page: { paddingTop: 35, paddingBottom: 65, paddingHorizontal: 40, fontFamily: 'Helvetica' },
  headerContainer: { marginBottom: 20, textAlign: 'center' },
  universityText: { fontSize: 14, fontWeight: 'bold', color: '#003366' },
  facultyText: { fontSize: 12, fontWeight: 'bold', marginTop: 3 },
  careerText: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  reportTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 10, textDecoration: 'underline' },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginTop: 15, marginBottom: 5, backgroundColor: '#f0f0f0', padding: 3 },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { fontSize: 10, fontWeight: 'bold', width: 120 },
  value: { fontSize: 10, flex: 1 },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', borderRightWidth: 0, borderBottomWidth: 0, marginTop: 6, marginBottom: 8 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#e6e6e6' },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 4, fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  tableCell: { margin: 4, fontSize: 8, textAlign: 'center' },
  evalContainer: { marginTop: 8, marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  evalTitle: { fontSize: 10, fontWeight: 'bold', color: '#1a3b5c', marginBottom: 4 },
  subLabel: { fontSize: 9, fontWeight: 'bold', marginTop: 4, color: '#333' },
  textValue: { fontSize: 9, marginLeft: 8, color: '#444', marginTop: 2 },
  subTitle: { fontSize: 9, fontWeight: 'bold', marginTop: 6, color: '#1a3b5c' },
  signatureContainer: { marginTop: 30, alignItems: 'center' },
  signatureLine: { width: 200, borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 5 }
});

export const PlantillaPDF = ({ datos }: { datos: InformeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer} fixed>
        <Text style={styles.universityText}>UNIVERSIDAD CENTRAL DEL ECUADOR</Text>
        <Text style={styles.facultyText}>FACULTAD DE INGENIERÍA Y CIENCIAS APLICADAS</Text>
        <Text style={styles.careerText}>CARRERA DE SISTEMAS DE INFORMACIÓN</Text>
        <Text style={styles.reportTitle}>INFORME DE ACTIVIDADES DOCENTES</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Docente:</Text>
        <Text style={styles.value}>{datos?.docente_nombre || 'No especificado'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Período Académico:</Text>
        <Text style={styles.value}>{datos?.periodo || 'No especificado'}</Text>
      </View>

      {/* --- 1. ACTIVIDADES DE DOCENCIA --- */}
      <Text style={styles.sectionTitle}>1. Actividades de Docencia</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={{...styles.tableColHeader, width: '5%'}}><Text style={styles.tableCellHeader}>No.</Text></View>
          <View style={{...styles.tableColHeader, width: '30%'}}><Text style={styles.tableCellHeader}>Materia</Text></View>
          <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>N° Est.</Text></View>
          <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>% Asist.</Text></View>
          <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>% Aprob.</Text></View>
          <View style={{...styles.tableColHeader, width: '10%'}}><Text style={styles.tableCellHeader}>PAE</Text></View>
        </View>
        
        {datos?.asignaturas?.map((asignatura: AsignaturaDataPDF, index: number) => (
          <View style={styles.tableRow} key={index}>
            <View style={{...styles.tableCol, width: '5%'}}><Text style={styles.tableCell}>{index + 1}</Text></View>
            <View style={{...styles.tableCol, width: '30%'}}><Text style={styles.tableCell}>{asignatura?.materia}</Text></View>
            <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{asignatura?.estudiantes}</Text></View>
            <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{asignatura?.asistencia}</Text></View>
            <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{asignatura?.aprobados}</Text></View>
            <View style={{...styles.tableCol, width: '10%'}}><Text style={styles.tableCell}>{asignatura?.tiene_pae ? 'SÍ' : 'NO'}</Text></View>
          </View>
        ))}
      </View>

      {/* --- 2. EVALUACIÓN ESPECÍFICA --- */}
      <Text style={styles.sectionTitle}>2. Evaluación Específica por Asignatura</Text>
      {datos?.asignaturas?.map((asignatura: AsignaturaDataPDF, index: number) => (
        <View key={index} style={styles.evalContainer}>
          <Text style={styles.evalTitle}>
            Asignatura {index + 1}: {asignatura?.materia || 'Sin nombre'} (Paralelo: {asignatura?.paralelo || 'N/A'})
          </Text>

          <Text style={styles.subLabel}>2.1. Resultados de Aprendizaje Evaluados:</Text>
          <Text style={styles.textValue}>• Resultado: {asignatura?.resultados_tabla || 'N/A'}</Text>
          <Text style={styles.textValue}>• Instrumento de evaluación: {asignatura?.res_instrumento || 'N/A'}</Text>
          <Text style={styles.textValue}>• Logro de aprendizaje: {asignatura?.resultados_logro || 'N/A'}</Text>

          <Text style={styles.subLabel}>2.2. Habilidades Blandas Implementadas:</Text>
          <Text style={styles.textValue}>
            • Habilidades: {asignatura?.habilidades_tabla?.join(', ') || 'Ninguna'}
            {asignatura?.habilidades_tabla?.includes('Otros') ? ` (${asignatura.habilidades_otros})` : ''}
          </Text>
          <Text style={styles.textValue}>• Actividades aplicadas: {asignatura?.habilidades_actividades || 'N/A'}</Text>

          <Text style={styles.subLabel}>2.3. Herramientas TAC:</Text>
          <Text style={styles.textValue}>
            • Tipo: {asignatura?.tac_tabla?.join(', ') || 'Ninguna'}
            {asignatura?.tac_tabla?.includes('Otros') ? ` (${asignatura.tac_otros})` : ''}
          </Text>
          <Text style={styles.textValue}>• Actividades desarrolladas: {asignatura?.tac_actividades || 'N/A'}</Text>
          
          {asignatura?.tiene_pae && (
             <Text style={{...styles.textValue, color: '#be185d', fontWeight: 'bold', marginTop: 5}}>
               * Esta materia incluye horas de Prácticas de Aplicación y Experimentación (PAE).
             </Text>
          )}
        </View>
      ))}

      {/* --- 3. TITULACIÓN --- */}
      <Text style={styles.sectionTitle}>3. Trabajos de Titulación</Text>
      {datos?.titulaciones_asignadas && datos.titulaciones_asignadas.length > 0 ? (
        datos.titulaciones_asignadas.map((tit, index) => (
          <View key={index} style={{ marginBottom: 5 }}>
            <Text style={styles.textValue}>• Estudiante: {tit.estudiante}</Text>
            <Text style={styles.textValue}>  Tema: {tit.tema}</Text>
            <Text style={styles.textValue}>  Mecanismo: {tit.mecanismo} | Estado: {tit.estado || 'N/A'} | Fecha: {tit.fecha_designacion || 'N/A'}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.textValue}>No registra trabajos de titulación en este período.</Text>
      )}

      {/* --- 4. PRÁCTICAS --- */}
      <Text style={styles.sectionTitle}>4. Prácticas Preprofesionales (Tutor)</Text>
      <Text style={styles.textValue}>• Estudiante: {datos?.practicas_estudiante || 'N/A'} | Institución: {datos?.prac_nombre_institucion || 'N/A'}</Text>
      <Text style={styles.textValue}>• Período: {datos?.prac_fecha_inicio || 'N/A'} al {datos?.prac_fecha_fin || 'N/A'} ({datos?.prac_numero_horas || '0'} horas)</Text>

      {/* --- 5. VINCULACIÓN --- */}
      <Text style={styles.sectionTitle}>5. Vinculación con la Sociedad</Text>
      <Text style={styles.textValue}>• Proyecto: {datos?.vinc_nombre || 'N/A'}</Text>
      <Text style={styles.textValue}>• Institución / Estado: {datos?.vinc_estado || 'N/A'}</Text>

      {/* --- 6. INVESTIGACIÓN --- */}
      <Text style={styles.sectionTitle}>6. Investigación y Publicaciones</Text>
      <Text style={styles.textValue}>• Título / Proyecto: {datos?.inv_titulo || 'N/A'}</Text>
      <Text style={styles.textValue}>• Autores: {datos?.inv_nombres || 'N/A'} | Revista: {datos?.inv_revista || 'N/A'}</Text>

      {/* --- 7. EVIDENCIAS Y CIERRE --- */}
      <Text style={styles.sectionTitle}>7. Evidencias Generales y Cierre</Text>
      <Text style={styles.textValue}>{datos?.evidencias || 'Sin observaciones adicionales.'}</Text>
      
      <View style={styles.signatureContainer} wrap={false}>
        <Text style={{ fontSize: 9, marginBottom: 25 }}>Fecha de elaboración: {datos?.fecha_elaboracion || 'N/A'}</Text>
        <View style={styles.signatureLine} />
        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{datos?.firma_docente || 'FIRMA Y NOMBRE DEL DOCENTE'}</Text>
      </View>
    </Page>
  </Document>
);