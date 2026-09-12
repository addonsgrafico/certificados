# CertiValida — Plataforma Web Segura de Certificados Digitales

Sistema full-stack de emisión, gestión, verificación pública y descarga segura de certificados digitales institucionales. Construido con estándares de seguridad OWASP Top 10 y ASVS.

---

## Arquitectura del Sistema

```
certificados_web/
├── apps/
│   ├── web/          # Next.js 14 — Frontend público + Panel Admin
│   └── api/          # NestJS — REST API + Seguridad + Prisma ORM
├── packages/
│   └── shared/       # Tipos, Zod Schemas, Crockford Base32, HMAC Crypto
├── infrastructure/
│   ├── docker/       # Dockerfiles + nginx.conf
│   ├── docker-compose.yml       # Producción
│   └── docker-compose.dev.yml   # Desarrollo
├── scripts/
│   └── bootstrap-superadmin.ts  # CLI seguro de creación de SuperAdmin
└── docs/             # SECURITY.md, CHECKLIST, RESTORE_GUIDE
```

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, REST API |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma (migraciones versionadas) |
| Autenticación | Sesiones servidor, Cookies HttpOnly, Argon2id, TOTP MFA |
| Seguridad PDF | Validación Magic Bytes, SHA-256, almacenamiento privado |
| Código Secreto | Crockford Base32 >100 bits, HMAC-SHA256 + PEPPER |
| QR | qrcode.js (SVG/PNG), token independiente del código secreto |
| Descarga | DownloadTicket temporal de 1 solo uso (2 min TTL) |
| Infraestructura | Docker Compose, Nginx, HTTPS |

---

## Requisitos Previos

- Node.js >= 20
- Docker + Docker Compose (para producción)
- PostgreSQL 16 (para desarrollo sin Docker)

---

## Instalación y Configuración Local (Desarrollo)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-org/certificados-digitales.git
cd certificados_web
```

### 2. Instalar dependencias (monorepo)

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el .env de ejemplo de la API
cp .env.example apps/api/.env

# Copiar el .env del frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" > apps/web/.env.local
```

**Edite `apps/api/.env` con sus valores reales.** Variables críticas:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `SESSION_SECRET` | Secreto para hash de tokens de sesión (mín. 64 chars) |
| `CERTIFICATE_CODE_PEPPER` | HMAC Pepper para códigos de certificado. **NO cambiar en producción.** |
| `MFA_ENCRYPTION_KEY` | Clave de cifrado para secretos TOTP |

### 4. Levantar PostgreSQL (vía Docker Compose)

```bash
docker compose -f infrastructure/docker-compose.dev.yml up -d
```

### 5. Ejecutar migraciones de Prisma

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 6. Crear el SuperAdmin inicial (OBLIGATORIO)

```bash
cd apps/api
npx ts-node ../../scripts/bootstrap-superadmin.ts
```

O mediante variables de entorno temporales:

```bash
INITIAL_SUPERADMIN_EMAIL=admin@ejemplo.com \
INITIAL_SUPERADMIN_NAME="Administrador Principal" \
INITIAL_SUPERADMIN_PASSWORD=MiPasswordSegura2024! \
npx ts-node ../../scripts/bootstrap-superadmin.ts
```

### 7. Iniciar los servidores de desarrollo

En terminales separadas:

```bash
# Terminal 1: API
cd apps/api && npm run dev

# Terminal 2: Frontend
cd apps/web && npm run dev
```

- Frontend: http://localhost:3000
- API REST: http://localhost:4000
- Swagger Docs: http://localhost:4000/api/docs

---

## Flujo de Uso Completo

### Búsqueda y Descarga Pública

1. El estudiante accede a `/certificados`
2. Ingresa su **Código Secreto** (`CERT-XXXX-XXXX-XXXX-XXXX-XXXX`)
3. El sistema valida el HMAC contra la BD — **sin revelar el código real**
4. Se muestra: nombre, curso, fecha, estado (NO email ni datos privados)
5. Se genera un **DownloadTicket** temporal de 2 minutos, un solo uso
6. Al hacer clic en "Descargar PDF", el ticket se consume y el PDF se envía via streaming

### Verificación por QR (Autenticidad Pública)

1. El empleador escanea el QR del certificado físico
2. Accede a `/verificar/{verificationToken}` — **token diferente al código secreto**
3. Ve: VÁLIDO / REVOCADO / EXPIRADO + Nombre, Curso, Institución, Fecha
4. **NO puede descargar el PDF**

### Panel Administrativo

1. Acceder a `/admin/login`
2. Credenciales admin (email + password Argon2id)
3. TOTP MFA (Google Authenticator o Authy)
4. Emitir certificados, revocar, rotar claves, ver auditoría

---

## Despliegue en Producción (Docker)

### 1. Preparar variables de entorno de producción

```bash
cp .env.example .env
# Editar con valores reales de producción
```

### 2. Configurar SSL

Copiar certificados TLS en `infrastructure/ssl/`:
```
infrastructure/ssl/fullchain.pem
infrastructure/ssl/privkey.pem
```

### 3. Configurar dominio en nginx.conf

Editar `infrastructure/docker/nginx.conf` y reemplazar `certificados.example.com`.

### 4. Ejecutar en producción

```bash
docker compose -f infrastructure/docker-compose.yml up -d --build
```

### 5. Ejecutar migraciones en producción

```bash
docker compose -f infrastructure/docker-compose.yml exec api npx prisma migrate deploy
```

### 6. Crear SuperAdmin en producción

```bash
docker compose -f infrastructure/docker-compose.yml exec api \
  INITIAL_SUPERADMIN_EMAIL=admin@mi-org.com \
  INITIAL_SUPERADMIN_NAME="Admin Principal" \
  INITIAL_SUPERADMIN_PASSWORD=SuperSeguro2024! \
  node dist/scripts/bootstrap-superadmin.js
```

---

## Testing

```bash
# Lint
npm run lint --workspaces --if-present

# Type Check
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit

# Unit & Integration Tests
npm run test --workspaces --if-present

# Build check
npm run build --workspaces --if-present
```

---

## Seguridad

Ver [`SECURITY.md`](./docs/SECURITY.md) para el modelo de amenazas completo.

### Resumen de Controles Implementados

- **A01 Broken Access Control**: Guards RBAC en cada endpoint, validación server-side, no confiar en frontend
- **A04 Cryptographic Failures**: Argon2id passwords, HMAC-SHA256 PEPPER para códigos, no MD5/SHA1
- **A05 Injection**: Prisma ORM con consultas parametrizadas, sin raw SQL expuesto
- **A07 Authentication Failures**: Rate limiting (5/min búsqueda, 10/min login), TOTP MFA, sessions HttpOnly
- **Secrets**: Sin secretos hardcodeados, solo variables de entorno

---

## Backup y Restauración

Ver [`docs/RESTORE_GUIDE.md`](./docs/RESTORE_GUIDE.md)

### Backup manual de PostgreSQL

```bash
docker compose -f infrastructure/docker-compose.yml exec postgres \
  pg_dump -U certificados_user certificados_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## Licencia

Propietaria — Organización Emisora de Certificados Digitales
