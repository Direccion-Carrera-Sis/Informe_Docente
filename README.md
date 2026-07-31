# Sistema de Gestión de Informes Académicos - UCE 🎓

Este proyecto es una plataforma integral diseñada para la Universidad Central del Ecuador (UCE) que automatiza y digitaliza la creación, gestión y revisión de los informes de fin de período académico de los docentes.

## 🚀 Características Principales

### Rol Docente
* **Formulario Dinámico:** Interfaz intuitiva para registrar horas de docencia, prácticas (PAE), trabajos de titulación, proyectos de vinculación e investigación.
* **Generación de PDF:** Creación automática del informe estructurado en formato PDF oficial, listo para descargar e imprimir.
* **Historial de Informes:** Panel de control personal para visualizar el estado y el historial de los informes generados en períodos anteriores.

### Rol Administrador (Dirección)
* **Carga de Datos Masiva:** Funcionalidad para poblar el sistema subiendo archivos CSV (Perfiles de docentes, asignación de materias, proyectos de vinculación, etc.).
* **Monitor de Informes:** Acceso global a todos los informes enviados por el cuerpo docente, filtrados por período y estado.

## 🛠️ Stack Tecnológico

Este proyecto está construido bajo una arquitectura de **Monorepo** gestionado con [Turborepo](https://turbo.build/), separando el frontend y el backend pero compartiendo configuraciones.

**Frontend (`apps/web`):**
* [Next.js](https://nextjs.org/) (App Router)
* React & TypeScript
* React Hook Form (Manejo de estados del formulario)
* @react-pdf/renderer (Generación de documentos PDF)
* CSS Modules para el diseño de UI

**Backend (`apps/api`):**
* [NestJS](https://nestjs.com/) (Framework progresivo de Node.js)
* TypeScript
* Mongoose (ODM para la base de datos)
* Multer (Manejo de subida de archivos CSV)

**Base de Datos:**
* MongoDB

## 📂 Estructura del Proyecto

```text
sistema-informes-uce/
├── apps/
│   ├── api/            # Backend (NestJS)
│   ├── web/            # Frontend (Next.js)
│   └── docs/           # Documentación (Opcional)
├── packages/           # Paquetes compartidos por Turborepo
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
└── package.json