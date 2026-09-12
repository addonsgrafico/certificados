# Guía de Despliegue en Render y Guion de Demostración al Cliente

Este documento proporciona una guía paso a paso para desplegar la **Plataforma de Certificados Digitales** en [Render](https://render.com) utilizando el Blueprint automatizado (`render.yaml`) o mediante configuración manual, junto con un **guion ejecutivo para presentar la solución a clientes e instituciones**.

---

## 1. Arquitectura de Despliegue en Render

La plataforma está estructurada como un monorepo robusto con 3 componentes esenciales:

```mermaid
graph TD
    Client[Cliente / Estudiante / Empleador] -->|HTTPS| Frontend[Frontend Web - Next.js 14]
    Admin[Administrador Institucional] -->|HTTPS| Frontend
    Frontend -->|API REST / Cookies Seguras| Backend[Backend API - NestJS]
    Backend -->|Prisma ORM (SSL)| DB[(PostgreSQL Gestionado)]
    Backend -->|Almacenamiento Local o S3| Storage[(Certificados PDF y Plantillas)]
```

1. **Base de Datos PostgreSQL (Render Managed Database)**: Base de datos relacional con SSL habilitado.
2. **Backend Web Service (NestJS)**: API REST segura, validación criptográfica, motor de generación de PDF con `pdf-lib` y códigos QR.
3. **Frontend Web Service (Next.js 14)**: Portal público institucional, módulo de verificación instantánea y suite administrativa ejecutiva.

---

## 2. Método 1: Despliegue Automático mediante Blueprint (`render.yaml`)

El repositorio incluye el archivo [`render.yaml`](../render.yaml) configurado para orquestar la base de datos y ambos servicios con un solo clic.

### Pasos:

1. **Subir el código a GitHub**:
   Asegúrese de que el repositorio contiene todos los cambios actualizados.

2. **Crear Blueprint en Render**:
   - Inicie sesión en [dashboard.render.com](https://dashboard.render.com).
   - Haga clic en el botón superior **"New +"** y seleccione **"Blueprint"**.
   - Conecte su cuenta de GitHub y seleccione el repositorio de la plataforma.
   - Render detectará automáticamente el archivo `render.yaml`.

3. **Revisar y Confirmar Recursos**:
   - Render mostrará los 3 recursos a crear:
     - `certificados-db` (PostgreSQL)
     - `certificados-backend` (Web Service)
     - `certificados-frontend` (Web Service)
   - Haga clic en **"Apply"** para iniciar el aprovisionamiento.

4. **Sincronización de Variables**:
   - Una vez desplegados, la variable `DATABASE_URL` y las claves secretas (`SESSION_SECRET`, `CERTIFICATE_CODE_PEPPER`, `MFA_ENCRYPTION_KEY`) se generan automáticamente.
   - Copie la URL pública generada para el frontend (ej. `https://certificados-frontend.onrender.com`) y agréguela a las variables `CORS_ORIGINS` y `FRONTEND_URL` del servicio backend si no se autocompletó.

---

## 3. Método 2: Despliegue Manual (Paso a Paso)

Si prefiere crear los servicios individualmente desde la interfaz web de Render:

### Paso 3.1: Crear la Base de Datos PostgreSQL
1. En Render, clic en **"New +"** > **"PostgreSQL"**.
2. Parámetros:
   - **Name**: `certificados-db`
   - **Database**: `certificados_prod`
   - **User**: `certificados_user`
   - **Region**: `Oregon (US West)` o la más cercana a su audiencia.
   - **Plan**: `Free` (o Starter para producción comercial).
3. Guardar y copiar el **Internal Database URL** (o la cadena de conexión generada).

### Paso 3.2: Crear el Web Service del Backend (API)
1. Clic en **"New +"** > **"Web Service"**.
2. Conectar el repositorio de GitHub.
3. Configuración del servicio:
   - **Name**: `certificados-backend`
   - **Region**: Misma región de la base de datos.
   - **Branch**: `main`
   - **Root Directory**: Dejar en blanco (se ejecuta desde la raíz del monorepo).
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install --include=dev && npm run build --workspace=packages/shared && npx prisma generate --schema=./backend/prisma/schema.prisma && npm run build --workspace=backend
     ```
   - **Start Command**:
     ```bash
     npx prisma db push --schema=./backend/prisma/schema.prisma --accept-data-loss && npm run start:prod --workspace=backend
     ```
4. **Variables de Entorno (Environment Variables)**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: Pegar la URL interna de la base de datos de Render.
   - `SESSION_SECRET`: Generar un string aleatorio de 64 caracteres.
   - `CERTIFICATE_CODE_PEPPER`: Generar un string aleatorio de 32 caracteres.
   - `MFA_ENCRYPTION_KEY`: Generar un string aleatorio de 32 caracteres.
   - `STORAGE_DRIVER`: `local`
   - `STORAGE_PATH`: `./storage/private/certificates`
   - `CORS_ORIGINS`: `https://su-frontend.onrender.com`
   - `FRONTEND_URL`: `https://su-frontend.onrender.com`
5. Clic en **"Create Web Service"**.

### Paso 3.3: Crear el Web Service del Frontend (Web)
1. Clic en **"New +"** > **"Web Service"**.
2. Conectar el repositorio de GitHub.
3. Configuración del servicio:
   - **Name**: `certificados-frontend`
   - **Region**: Misma región del backend.
   - **Branch**: `main`
   - **Root Directory**: Dejar en blanco.
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install --include=dev && npm run build --workspace=packages/shared && npm run build --workspace=frontend
     ```
   - **Start Command**:
     ```bash
     npm run start --workspace=frontend
     ```
4. **Variables de Entorno**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `NEXT_PUBLIC_API_URL`: URL del backend desplegado (ej. `https://certificados-backend.onrender.com`).
5. Clic en **"Create Web Service"**.

---

## 4. Creación del Usuario Administrador Inicial (SuperAdmin)

Para acceder por primera vez al panel de control `/admin`:

### Opción A: Desde la consola Shell de Render
1. En el dashboard de Render, ingrese al servicio `certificados-backend`.
2. Vaya a la pestaña **"Shell"** (terminal integrada de Render).
3. Ejecute el comando de bootstrap:
   ```bash
   INITIAL_SUPERADMIN_EMAIL="admin@institucion.com" INITIAL_SUPERADMIN_NAME="Director Académico" INITIAL_SUPERADMIN_PASSWORD="MiPasswordSeguro2026!" npm run bootstrap:superadmin
   ```
4. El script creará la cuenta y configurará los ajustes base del sistema.

### Opción B: Mediante Variables de Entorno Temporales
1. En `certificados-backend` > **Environment**, agregue:
   - `INITIAL_SUPERADMIN_EMAIL`
   - `INITIAL_SUPERADMIN_NAME`
   - `INITIAL_SUPERADMIN_PASSWORD`
2. En el primer despliegue o reinicio, ejecute `npm run bootstrap:superadmin` desde la consola Shell y luego retire esas variables por seguridad.

---

## 5. Guion Ejecutivo para Demostración al Cliente (Pitch & Demo)

A continuación se detalla una secuencia guiada de **5 minutos** diseñada para presentar la plataforma a directores de capacitación, instituciones o clientes corporativos.

### 🌟 Fase 1: Bienvenida e Identidad Institucional (1 minuto)
- **URL**: `https://su-frontend.onrender.com/`
- **Mensaje**:
  > *"Esta es la cara visible de la institución. No es solo un verificador estático, sino un ecosistema académico moderno donde los estudiantes pueden explorar la oferta de cursos, conocer el perfil de los instructores y acceder de forma inmediata a la verificación de sus credenciales."*
- **Acción**:
  - Desplácese por la landing page mostrando el banner principal, la fotografía profesional de la coach/mentora, el catálogo de cursos destacados y el pie de página institucional.
  - Haga clic en un curso (ej. *'Comunicación Asertiva y Liderazgo'*) para mostrar el programa detallado, objetivos y temario modular.

---

### 📂 Fase 2: El Expediente Digital del Estudiante ("Carpetita del Alumno") (1.5 minutos)
- **URL**: `/admin/participants`
- **Mensaje**:
  > *"Para el equipo administrativo, la gestión de alumnos solía ser dispersa. En esta plataforma creamos el concepto de **Expediente Académico o 'Carpetita'**. Cada estudiante cuenta con su propio dossier centralizado."*
- **Acción**:
  - Muestre la **Vista Carpetas (Expedientes)** con las tarjetas de los alumnos, sus iniciales, documento de identidad (CI/DNI) y conteo de certificados.
  - Haga clic en **"Abrir Expediente"** de un alumno:
    - **Pestaña 'Cursos & Historial'**: Muestre cómo se visualizan los cursos que el alumno ha completado y aprobado, junto con las horas académicas acreditadas.
    - **Pestaña 'Diplomas Emitidos'**: Demuestre que desde la misma carpeta del alumno se puede previsualizar el certificado, descargarlo en PDF de alta fidelidad o consultar su QR.
  - Muestre el botón **"Asignar a Curso"** para evidenciar la facilidad con la que se matricula a un alumno en un nuevo programa formativo.

---

### 📜 Fase 3: Emisión Directa de Certificados (Sin Complicaciones) (1 minuto)
- **URL**: `/admin/certificates`
- **Mensaje**:
  > *"Eliminamos la fricción de códigos secretos complejos o rotaciones manuales innecesarias. La emisión ahora es ágil, transparente y con validez jurídica inmediata respaldada por códigos únicos y códigos QR verificables."*
- **Acción**:
  - Muestre el listado de certificados con filtro instantáneo por nombre, curso o documento de identidad.
  - Haga clic en el botón de descarga directa **"PDF Oficial"** para abrir el documento generado.
  - Haga clic en **"Emitir Certificado"**, seleccione un participante y un curso, y presione emitir:
    - Aparecerá la ventana ejecutiva de confirmación con el enlace público, el código QR y la opción de descarga inmediata.

---

### 🔍 Fase 4: Verificación Pública por Código QR (1 minuto)
- **URL**: `/verify/[id-del-certificado]`
- **Mensaje**:
  > *"Cualquier empresa, universidad o empleador en el mundo puede validar la autenticidad del diploma en 2 segundos escaneando el código QR con la cámara de su celular o ingresando el identificador público."*
- **Acción**:
  - Abra la URL de verificación pública de un certificado emitido.
  - Muestre el sello verde de **"CERTIFICADO AUTÉNTICO Y VÁLIDO"**, el nombre del alumno, las horas lectivas, la institución emisora y el botón de descarga del documento original.
  - Explique que el sistema previene falsificaciones mediante firmas hash SHA-256 inmutables en base de datos.

---

### ⚙️ Fase 5: Gestión de Contenidos y Personalización (CMS) (30 segundos)
- **URL**: `/admin/settings` y `/admin/courses`
- **Mensaje**:
  > *"El cliente tiene autonomía total: puede actualizar la foto y biografía de la mentora, el nombre de la institución, redes de contacto y el temario de los cursos sin escribir una sola línea de código."*
- **Acción**:
  - Muestre rápidamente el panel de ajustes institucionales y el editor de cursos.

---

## 6. Mantenimiento y Buenas Prácticas en Producción

1. **Almacenamiento Persistente de PDFs**:
   - En el plan gratuito de Render, el sistema de archivos del contenedor es efímero entre reinicios.
   - Para producción definitiva con miles de alumnos, configure un disco persistente en Render (**Render Disk** montado en `./storage`) o active el driver S3 compatible (`STORAGE_DRIVER=s3`) configurando las credenciales de AWS S3 o Cloudflare R2 en el archivo `.env`.

2. **Backups de Base de Datos**:
   - Render genera copias de seguridad automáticas de PostgreSQL.
   - Puede descargar dumps periódicos en formato SQL directamente desde la pestaña **"Backups"** de la base de datos en Render.

3. **Certificados SSL Automáticos**:
   - Render aprovisiona y renueva certificados SSL/TLS (HTTPS) de forma automática y gratuita tanto para los dominios `.onrender.com` como para dominios personalizados (ej. `certificados.suinstitucion.com`).
