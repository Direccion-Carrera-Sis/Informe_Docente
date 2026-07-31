export class CreateInformeDto {
  docenteId!: string;
  periodoAcademico!: string;
  estado?: string;
  datosEstructurales?: Record<string, any>;
  actividades?: Record<string, any>;
}
