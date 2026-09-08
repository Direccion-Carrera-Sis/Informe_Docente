/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

  // 👇 LECTOR RECURSIVO DE DIRECTORIOS
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

  // 👇 RUTA NUEVA: ESCÁNER DEL DISCO DURO
  @Get('escanear-archivos')
  escanearArchivos(
    @Query('docente') docente: string,
    @Query('periodo') periodoRaw: string,
  ) {
    try {
      const apellidoNombre = this.formatearCadena(docente);
      const periodo = (periodoRaw || '2026-2026').replace(/\//g, '-');
      const nombreCarpetaPrincipal = `${periodo}_Portafolio_${apellidoNombre}`;
      const basePath = path.join(
        process.cwd(),
        'uploads',
        nombreCarpetaPrincipal,
      );

      if (!fs.existsSync(basePath)) return [];

      const allFiles = this.obtenerTodosLosArchivos(basePath);
      return allFiles.map((filePath) => ({
        name: path.basename(filePath),
        path: path.relative(process.cwd(), filePath),
      }));
       
    } catch (e) {
      return [];
    }
  }

  // 👇 RUTA NUEVA: VISOR DEL ARCHIVO (STREAM)
  @Get('ver-archivo')
  verArchivo(@Query('ruta') ruta: string, @Res() res: any) {
    try {
      const absPath = path.resolve(process.cwd(), ruta);
      // Seguridad: solo permite archivos dentro de /uploads
      if (!absPath.includes(path.join(process.cwd(), 'uploads')))
        return res.status(403).send('Acceso denegado');
      if (!fs.existsSync(absPath)) return res.status(404).send('Archivo no encontrado');
      return res.sendFile(absPath);
    } catch (e) {
      return res.status(500).send('Error interno');
    }
  }

  private guardarArchivosLocal(archivos: Array<any>, datosFormulario: any) {
    if (!archivos || archivos.length === 0) return;
    const nombreDocenteBruto = datosFormulario.datosEstructurales?.docente_nombre || 'Docente Desconocido';
    const apellidoNombre = this.formatearCadena(nombreDocenteBruto);
    const periodo = (datosFormulario.periodoAcademico || '2026-2026').replace(/\//g, '-');
    const fechaStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); 
    
    const nombreCarpetaPrincipal = `${periodo}_Portafolio_${apellidoNombre}`;
    const basePath = path.join(process.cwd(), 'uploads', nombreCarpetaPrincipal);
    const pathGeneral = path.join(basePath, 'GENERAL');
    const pathAsignaturas = path.join(basePath, 'ASIGNATURAS');

    if (!fs.existsSync(pathGeneral)) fs.mkdirSync(pathGeneral, { recursive: true });
    if (!fs.existsSync(pathAsignaturas)) fs.mkdirSync(pathAsignaturas, { recursive: true });

    const contadoresGenerales: Record<string, number> = {};
    const contadoresAsignaturas: Record<string, number> = {};

    archivos.forEach((file) => {
      const ext = path.extname(file.originalname);
      if (file.fieldname.startsWith('archivos_generales_')) {
        const tipo = file.fieldname.replace('archivos_generales_', '');
        contadoresGenerales[tipo] = (contadoresGenerales[tipo] || 0) + 1;
        const num = contadoresGenerales[tipo];
        let nuevoNombre = '';
        const sufijoMult = num > 1 ? `_${num}` : '';

        switch (tipo) {
          case 'ficha': nuevoNombre = `01_${periodo}_FICHA_${apellidoNombre}${sufijoMult}`; break;
          case 'horario': nuevoNombre = `02_${periodo}_HORARIO_${apellidoNombre}${sufijoMult}`; break;
          case 'cap_tac': nuevoNombre = `03_TAC_${fechaStr}_${apellidoNombre}_${num}`; break;
          case 'cap_metodologica': nuevoNombre = `03_MET_${fechaStr}_${apellidoNombre}_${num}`; break;
          case 'cap_profesional': nuevoNombre = `03_PRO_${fechaStr}_${apellidoNombre}_${num}`; break;
          default: nuevoNombre = `${tipo}_${num}`;
        }
        fs.writeFileSync(path.join(pathGeneral, `${nuevoNombre}${ext}`), file.buffer);
      } 
      else if (file.fieldname.startsWith('archivo_asignatura_')) {
        const partes = file.fieldname.split('_');
        const indexAsig = parseInt(partes[3]);
        const key = partes.slice(4).join('_');
        const asignatura = datosFormulario.datosEstructurales?.asignaturas[indexAsig] || {};
        const codMateria = asignatura.codigo || 'SinCodigoMateria';
        const codParalelo = asignatura.paralelo || 'SinParalelo';
        const nombreMateria = this.formatearCadena(asignatura.materia);

        const nombreCarpetaMateria = `${codParalelo}_${codMateria}`;
        const pathMateria = path.join(pathAsignaturas, nombreCarpetaMateria);
        if (!fs.existsSync(pathMateria)) fs.mkdirSync(pathMateria, { recursive: true });

        const contadorKey = `${indexAsig}_${key}`;
        contadoresAsignaturas[contadorKey] = (contadoresAsignaturas[contadorKey] || 0) + 1;
        const num = contadoresAsignaturas[contadorKey];
        const sufijoMult = num > 1 ? `_${num}` : '';
        let nuevoNombre = '';

        switch (key) {
          case 'silabo_evidencia': nuevoNombre = `01_${periodo}_${codMateria}_${nombreMateria}${sufijoMult}`; break;
          case 'seguimiento_evidencia': nuevoNombre = `02_${periodo}_${codParalelo}_${codMateria}_Seguimiento${sufijoMult}`; break;
          case 'asistencia_evidencia': nuevoNombre = `03_${periodo}_${codParalelo}_${codMateria}_Asistencia${sufijoMult}`; break;
          case 'notas_evidencia': nuevoNombre = `04_${periodo}_${codParalelo}_${codMateria}_Notas${sufijoMult}`; break;
          case 'indiv_evidencia': nuevoNombre = `05_${periodo}_${codParalelo}_${codMateria}_TI_${num}`; break;
          case 'grupales_evidencia': nuevoNombre = `06_${periodo}_${codParalelo}_${codMateria}_TG_${num}`; break;
          case 'pae_evidencia': nuevoNombre = `07_${periodo}_${codParalelo}_${codMateria}_PAE_${num}`; break;
          case 'refuerzo_evidencia': nuevoNombre = `08_${periodo}_${codParalelo}_${codMateria}_Refuerzo_${num}`; break;
          case 'sumativa1_evidencia': nuevoNombre = `09_${periodo}_${codParalelo}_${codMateria}_Sumativa1_E${num}`; break;
          case 'sumativa_final_evidencia': nuevoNombre = `10_${periodo}_${codParalelo}_${codMateria}_SumativaFinal_E${num}`; break;
          case 'recuperacion_evidencia': nuevoNombre = `11_${periodo}_${codParalelo}_${codMateria}_Recuperacion_E${num}`; break;
          case 'hab_evidencia': nuevoNombre = `12_${periodo}_Ev_HB_${codParalelo}_${codMateria}_${num}`; break;
          case 'res_evidencia': nuevoNombre = `13_${periodo}_Ev_RA_${codParalelo}_${codMateria}_${num}`; break;
          case 'tac_evidencia': nuevoNombre = `14_${periodo}_Ev_TAC_${codParalelo}_${codMateria}_${num}`; break;
          default: nuevoNombre = `${key}_${num}`;
        }
        fs.writeFileSync(path.join(pathMateria, `${nuevoNombre}${ext}`), file.buffer);
      }
    });
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async crearInforme(@UploadedFiles() archivos: Array<any>, @Body() body: any) {
    const datosParsed = typeof body.informeData === 'string' ? JSON.parse(body.informeData) : body;
    this.guardarArchivosLocal(archivos, datosParsed);
    return this.informesService.crear(datosParsed);
  }

  @Get()
  async obtenerInformes() { return this.informesService.obtenerTodos(); }

  @Get('docente/:id')
  async obtenerInformesDelDocente(@Param('id') docenteId: string) { return this.informesService.obtenerPorDocente(docenteId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.informesService.findOne(id); }

  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(@Param('id') id: string, @UploadedFiles() archivos: Array<any>, @Body() body: any) {
    const updateData = typeof body.informeData === 'string' ? JSON.parse(body.informeData) : body;
    const usuarioEjecutorId = updateData.docenteId || 'Desconocido';
    this.guardarArchivosLocal(archivos, updateData);
    return this.informesService.update(id, updateData, usuarioEjecutorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) { return this.informesService.remove(id, usuarioId); }
}