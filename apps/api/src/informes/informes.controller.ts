/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { InformesService } from './informes.service';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  private formatearCadena(texto: string): string {
    if (!texto) return 'Desconocido';
    return texto
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private obtenerRutaEscritorio(): string {

    // 👇 CAMBIO AQUÍ: Usamos una ruta externa al código fuente para evitar reinicios
    const rutaContenedorDocker = '/archivos_docentes';
    
    if (fs.existsSync('/usr/src/app') || process.env.NODE_ENV === 'production') {
      return rutaContenedorDocker;
    }
    
    const homedir = os.homedir();
    const escritorioEs = path.join(homedir, 'Escritorio');
    const escritorioEn = path.join(homedir, 'Desktop');

    if (fs.existsSync(escritorioEs)) return escritorioEs;
    if (fs.existsSync(escritorioEn)) return escritorioEn;
    return escritorioEn;
  }

  private obtenerTodosLosArchivos(
    dirPath: string,
    arrayOfFiles: string[] = [],
  ) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = this.obtenerTodosLosArchivos(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    });
    return arrayOfFiles;
  }

  @Get('escanear-archivos')
  escanearArchivos(
    @Query('docente') docente: string,
    @Query('periodo') periodoRaw: string,
  ) {
    try {
      const apellidoNombre = this.formatearCadena(docente);
      const periodo = (periodoRaw || '26-26').replace(/\//g, '-');
      const nombreCarpetaPrincipal = `${periodo}_Portafolio_${apellidoNombre}`;

      const escritorio = this.obtenerRutaEscritorio();
      const basePath = path.join(
        escritorio,
        'Docentes',
        nombreCarpetaPrincipal,
      );

      if (!fs.existsSync(basePath)) return [];

      const allFiles = this.obtenerTodosLosArchivos(basePath);
      return allFiles.map((filePath) => ({
        name: path.basename(filePath),
        path: filePath,
      }));
    } catch (e) {
      return [];
    }
  }

  @Get('ver-archivo')
  verArchivo(@Query('ruta') ruta: string, @Res() res: any) {
    try {
      if (!ruta) return res.status(400).send('Ruta no proporcionada');
      const absPath = path.resolve(ruta);

      if (!fs.existsSync(absPath))
        return res.status(404).send('Archivo no encontrado');
      return res.sendFile(absPath);
    } catch (e) {
      return res.status(500).send('Error interno');
    }
  }

  // =======================================================================
  // 👇 CONFIGURACIÓN GLOBAL DEL SISTEMA (Panel Admin)
  // =======================================================================
  @Get('sistema/configuracion')
  obtenerConfiguracion() {
    const escritorio = this.obtenerRutaEscritorio();
    const configPath = path.join(escritorio, 'Docentes', 'sistema_config.json');

    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Valores por defecto si es la primera vez que se ejecuta el sistema
    return {
      pesoMaximoMB: 2,
      logo_facultad: null, // 👈 NUEVO
      logo_carrera: null,
      reglas: {
        general_ficha: '01_{PERIODO}_FICHA_{DOCENTE}',
        general_horario: '02_{PERIODO}_HORARIO_{DOCENTE}',
        general_cap_tac: "03_TAC_\\d+_{DOCENTE}_",
        general_cap_metodologica: "03_MET_\\d+_{DOCENTE}_",
        general_cap_profesional: "03_PRO_\\d+_{DOCENTE}_",
        silabo_evidencia: "01_{PERIODO}_{COD_MATERIA}_{NOM_MATERIA}",
        seguimiento_evidencia: "02_{PERIODO}_{PARALELO}_{COD_MATERIA}_Seguimiento",
        asistencia_evidencia: "03_{PERIODO}_{PARALELO}_{COD_MATERIA}_Asistencia",
        notas_evidencia: "04_{PERIODO}_{PARALELO}_{COD_MATERIA}_Notas",
        indiv_evidencia: "05_{PERIODO}_{PARALELO}_{COD_MATERIA}_TI_",
        grupales_evidencia: "06_{PERIODO}_{PARALELO}_{COD_MATERIA}_TG_",
        pae_evidencia: "07_{PERIODO}_{PARALELO}_{COD_MATERIA}_PAE_",
        refuerzo_evidencia: "08_{PERIODO}_{PARALELO}_{COD_MATERIA}_Refuerzo_",
        sumativa1_evidencia: "09_{PERIODO}_{PARALELO}_{COD_MATERIA}_Sumativa1_E",
        sumativa_final_evidencia: "10_{PERIODO}_{PARALELO}_{COD_MATERIA}_SumativaFinal_E",
        recuperacion_evidencia: "11_{PERIODO}_{PARALELO}_{COD_MATERIA}_Recuperacion_E",
        hab_evidencia: "12_{PERIODO}_Ev_HB_{PARALELO}_{COD_MATERIA}_",
        res_evidencia: "13_{PERIODO}_Ev_RA_{PARALELO}_{COD_MATERIA}_",
        tac_evidencia: "14_{PERIODO}_Ev_TAC_{PARALELO}_{COD_MATERIA}_"
      }
    };
  }

  @Put('sistema/configuracion')
  actualizarConfiguracion(@Body() body: any) {
    const escritorio = this.obtenerRutaEscritorio();
    const configPath = path.join(escritorio, 'Docentes', 'sistema_config.json');

    // Si la carpeta Docentes en el escritorio no existe aún, la crea
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(configPath, JSON.stringify(body, null, 2));
    return { message: 'Configuración del sistema actualizada', config: body };
  }
  // =======================================================================

  // 👇 LÓGICA DE GUARDADO FÍSICO CORREGIDA Y ROBUSTA
  private guardarArchivosLocal(archivos: Array<any>, datosFormulario: any) {
    if (!archivos || archivos.length === 0) {
      console.log('⚠️ No se recibieron archivos físicos para guardar.');
      return;
    }

    const nombreDocenteBruto =
      datosFormulario.datosEstructurales?.docente_nombre ||
      'Docente Desconocido';
    const apellidoNombre = this.formatearCadena(nombreDocenteBruto);
    const periodo = (datosFormulario.periodoAcademico || '26-26').replace(
      /\//g,
      '-',
    );

    const nombreCarpetaPrincipal = `${periodo}_Portafolio_${apellidoNombre}`;
    const escritorio = this.obtenerRutaEscritorio();
    const basePath = path.join(escritorio, 'Docentes', nombreCarpetaPrincipal);

    const pathGeneral = path.join(basePath, 'GENERAL');
    const pathAsignaturas = path.join(basePath, 'ASIGNATURAS');

    if (!fs.existsSync(pathGeneral))
      fs.mkdirSync(pathGeneral, { recursive: true });
    if (!fs.existsSync(pathAsignaturas))
      fs.mkdirSync(pathAsignaturas, { recursive: true });

    console.log(
      `📂 Procesando ${archivos.length} archivos para guardar en:`,
      basePath,
    );

    archivos.forEach((file) => {
      const nombreOriginal = file.originalname;

      // 1. Archivos que van a la carpeta GENERAL
      if (file.fieldname.startsWith('archivos_generales_')) {
        const filePath = path.join(pathGeneral, nombreOriginal);
        fs.writeFileSync(filePath, file.buffer);
        console.log(`📄 Guardado en GENERAL: ${nombreOriginal}`);
      }
      // 2. Archivos que van a la carpeta ASIGNATURAS
      else if (file.fieldname.startsWith('archivo_asignatura_')) {
        // Formato del fieldname enviado por front: archivo_asignatura_[CODIGO]_[INDEX]_[TIPO]
        const partes = file.fieldname.split('_');
        const indexAsig = parseInt(partes[3], 10);

        const asignatura =
          datosFormulario.datosEstructurales?.asignaturas[indexAsig] || {};
        const codMateria = asignatura.codigo || 'SinCodigoMateria';
        const codParalelo = asignatura.paralelo || 'SinParalelo';

        const nombreCarpetaMateria = `${codParalelo}_${codMateria}`;
        const pathMateria = path.join(pathAsignaturas, nombreCarpetaMateria);

        if (!fs.existsSync(pathMateria))
          fs.mkdirSync(pathMateria, { recursive: true });

        const filePath = path.join(pathMateria, nombreOriginal);
        fs.writeFileSync(filePath, file.buffer);
        console.log(
          `📚 Guardado en ASIGNATURAS/${nombreCarpetaMateria}: ${nombreOriginal}`,
        );
      }
    });
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async crearInforme(@UploadedFiles() archivos: Array<any>, @Body() body: any) {
    const datosParsed =
      typeof body.informeData === 'string'
        ? JSON.parse(body.informeData)
        : body;
    this.guardarArchivosLocal(archivos, datosParsed);
    return this.informesService.crear(datosParsed);
  }

  @Get()
  async obtenerInformes() {
    return this.informesService.obtenerTodos();
  }

  @Get('docente/:id')
  async obtenerInformesDelDocente(@Param('id') docenteId: string) {
    return this.informesService.obtenerPorDocente(docenteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informesService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id') id: string,
    @UploadedFiles() archivos: Array<any>,
    @Body() body: any,
  ) {
    const updateData =
      typeof body.informeData === 'string'
        ? JSON.parse(body.informeData)
        : body;
    const usuarioEjecutorId = updateData.docenteId || 'Desconocido';
    this.guardarArchivosLocal(archivos, updateData);
    return this.informesService.update(id, updateData, usuarioEjecutorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    return this.informesService.remove(id, usuarioId);
  }
}
