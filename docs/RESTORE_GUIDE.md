# Guía de Restauración y Disaster Recovery

## Escenario 1: Pérdida Total del Servidor

### Pre-requisitos
- Backup de PostgreSQL (`.sql.gz`)
- Backup del volumen Docker `private_storage` (PDFs)
- Copia del archivo `.env` con secretos de producción
- Copia de `infrastructure/ssl/` (certificados TLS)

### Procedimiento

```bash
# 1. Clonar el repositorio en el nuevo servidor
git clone https://github.com/tu-org/certificados-digitales.git
cd certificados_web

# 2. Restaurar variables de entorno
cp /backup/.env .env

# 3. Restaurar certificados SSL
cp /backup/ssl/* infrastructure/ssl/

# 4. Levantar infraestructura
docker compose -f infrastructure/docker-compose.yml up -d postgres

# 5. Esperar a que postgres esté healthy
docker compose -f infrastructure/docker-compose.yml exec postgres pg_isready

# 6. Restaurar base de datos
gunzip -c /backup/certificados_YYYYMMDD.sql.gz | \
  docker compose -f infrastructure/docker-compose.yml exec -T postgres \
  psql -U certificados_user -d certificados_db

# 7. Restaurar PDFs privados
docker run --rm -v certificados_web_private_storage:/data \
  -v /backup/storage:/source alpine \
  sh -c "cp -r /source/* /data/"

# 8. Levantar todo
docker compose -f infrastructure/docker-compose.yml up -d

# 9. Verificar estado
docker compose -f infrastructure/docker-compose.yml ps
```

---

## Escenario 2: Corrupción de Base de Datos

```bash
# Detener API para evitar escrituras
docker compose -f infrastructure/docker-compose.yml stop api

# Hacer backup del estado actual (por si acaso)
docker compose -f infrastructure/docker-compose.yml exec postgres \
  pg_dump -U certificados_user certificados_db | gzip > corrupted_state_$(date +%Y%m%d_%H%M%S).sql.gz

# Restaurar desde backup limpio
docker compose -f infrastructure/docker-compose.yml exec postgres \
  psql -U certificados_user -c "DROP DATABASE certificados_db;"
docker compose -f infrastructure/docker-compose.yml exec postgres \
  psql -U certificados_user -c "CREATE DATABASE certificados_db;"
gunzip -c /backup/certificados_YYYYMMDD.sql.gz | \
  docker compose -f infrastructure/docker-compose.yml exec -T postgres \
  psql -U certificados_user -d certificados_db

# Ejecutar migraciones pendientes si las hay
docker compose -f infrastructure/docker-compose.yml exec api npx prisma migrate deploy

# Reiniciar API
docker compose -f infrastructure/docker-compose.yml start api
```

---

## Escenario 3: Compromiso del PEPPER (CERTIFICATE_CODE_PEPPER)

> ⚠️ SITUACIÓN CRÍTICA: Si el PEPPER es comprometido, todos los códigos secretos actuales son inútiles como factor de seguridad.

### Procedimiento de Emergencia

```bash
# 1. Generar nuevo PEPPER
openssl rand -hex 32

# 2. Script de re-hashing (ejecutar con nueva PEPPER antes de actualizar .env)
# El script debe leer todos los certificados, recomputar el HMAC con nuevo PEPPER
# y actualizar hmacHash en BD para cada certificado.
# Ver: scripts/rehash-certificate-codes.ts

# 3. Actualizar .env con nuevo PEPPER
# SESSION_SECRET y CERTIFICATE_CODE_PEPPER

# 4. Reiniciar la API
docker compose -f infrastructure/docker-compose.yml restart api
```

> **IMPORTANTE**: El script `scripts/rehash-certificate-codes.ts` requiere los **códigos secretos originales en texto plano**, que no se almacenan en la BD (solo el HMAC). Esto significa que si el PEPPER es comprometido, los códigos actuales deben ser **rotados** (se generan nuevos y se notifica a cada titular).

---

## Escenario 4: Pérdida de PDFs (Storage)

Si los PDFs se pierden pero la BD está intacta:
- Los metadatos (nombre, curso, código) permanecen en la BD
- Los certificados aparecerán como "válidos" pero sin descarga disponible
- Acción: Re-subir los PDFs originales por el panel admin (opción de re-upload por certificado)

---

## Backup Automatizado (Recomendado)

Crear cron job en el servidor:

```bash
# /etc/cron.d/certificados-backup
0 2 * * * root /opt/certificados/scripts/backup.sh >> /var/log/certificados-backup.log 2>&1
```

Contenido de `scripts/backup.sh`:
```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/backups/certificados"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker compose -f /opt/certificados/infrastructure/docker-compose.yml exec -T postgres \
  pg_dump -U certificados_user certificados_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup storage (PDFs)
tar -czf "$BACKUP_DIR/storage_$DATE.tar.gz" \
  -C /var/lib/docker/volumes/certificados_web_private_storage/_data .

# Limpiar backups de más de 30 días
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "[$DATE] Backup completado exitosamente"
```

---

## Verificación de Integridad Post-Restauración

```bash
# 1. Verificar count de certificados
docker compose -f infrastructure/docker-compose.yml exec postgres \
  psql -U certificados_user -d certificados_db \
  -c "SELECT COUNT(*) FROM certificates WHERE \"archivedAt\" IS NULL;"

# 2. Verificar que la API responde
curl -f http://localhost/api/v1/settings

# 3. Verificar que una búsqueda pública funciona (requiere código real)
curl -X POST http://localhost/api/v1/certificates/search \
  -H "Content-Type: application/json" \
  -d '{"code": "CERT-XXXX-XXXX-XXXX-XXXX-XXXX"}'

# 4. Verificar login admin
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "..."}'
```
