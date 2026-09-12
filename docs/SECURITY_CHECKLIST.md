# Checklist de Seguridad — Pre-Producción

Marcar cada ítem como completado antes de poner el sistema en producción.

---

## 🔐 Variables de Entorno

- [ ] `SESSION_SECRET` generado con `openssl rand -hex 64`
- [ ] `CERTIFICATE_CODE_PEPPER` generado con `openssl rand -hex 32` — documentado offline
- [ ] `MFA_ENCRYPTION_KEY` generado con `openssl rand -hex 32`
- [ ] `POSTGRES_PASSWORD` mínimo 32 caracteres aleatorios
- [ ] Ninguna variable sensible en el código fuente (grep `SESSION_SECRET\|PEPPER\|PASSWORD` en todo el repo)
- [ ] `.env` excluido del repositorio Git (`.gitignore` configurado)

---

## 🔒 TLS / HTTPS

- [ ] Certificado TLS válido (Let's Encrypt o CA comercial)
- [ ] HSTS habilitado (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`)
- [ ] TLS 1.2+ únicamente (TLS 1.0/1.1 deshabilitado en nginx.conf)
- [ ] HTTP redirige a HTTPS (configurado en nginx.conf)
- [ ] Verificar con: `ssl-labs.com` — objetivo grado A

---

## 🔑 Autenticación

- [ ] SuperAdmin inicial creado con contraseña fuerte (>15 chars, mixed)
- [ ] MFA TOTP configurado para SuperAdmin antes del primer acceso real
- [ ] Sin contraseñas de desarrollo en `.env` de producción
- [ ] Rate limiting en `/api/v1/auth/login` (10 req/min)
- [ ] Rate limiting en `/api/v1/certificates/search` (5 req/min)
- [ ] Sesiones expiran en 8 horas máximo

---

## 💾 Base de Datos

- [ ] PostgreSQL accesible solo desde la red interna Docker (sin puerto 5432 expuesto públicamente)
- [ ] Usuario de BD con privilegios mínimos (solo su base de datos)
- [ ] Migraciones aplicadas: `prisma migrate deploy`
- [ ] Backup automatizado configurado (cron diario)
- [ ] Primer backup de prueba verificado con restauración

---

## 📁 Almacenamiento de PDFs

- [ ] `STORAGE_PATH` fuera del web root (no accesible via URL directa)
- [ ] Permisos del directorio: solo el usuario `appuser` puede leer/escribir
- [ ] Verificar que `curl http://tu-dominio.com/storage/certificados/cualquier.pdf` devuelve 404
- [ ] Si S3: bucket configurado como privado, sin ACLs públicas

---

## 🛡️ Cabeceras HTTP

- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Strict-Transport-Security` (ver arriba)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Verificar con: `securityheaders.com`

---

## 🌐 CORS

- [ ] `CORS_ORIGINS` contiene solo el dominio de producción (no `*`)
- [ ] Verificar que peticiones desde `http://attacker.com` son rechazadas

---

## 📋 Auditoría

- [ ] `AuditLog` registra acciones críticas (login, emisión, revocación, rotación, eliminación)
- [ ] `SecurityEvent` registra búsquedas fallidas y rate limit hits
- [ ] Logs de auditoría son de solo lectura para ADMIN
- [ ] SUPER_ADMIN puede ver pero no borrar audit logs desde la UI

---

## 🐳 Infraestructura Docker

- [ ] Contenedores usan usuario no-root (`appuser`)
- [ ] `restart: unless-stopped` configurado en todos los servicios
- [ ] Healthchecks configurados para postgres, api y web
- [ ] Nginx configurado como reverse proxy (API no expuesta directamente)
- [ ] Verificar que el puerto 4000 (API) NO es accesible externamente: `curl http://tu-ip:4000` debe fallar

---

## 🔍 Revisión Manual de Código

- [ ] Sin `console.log` con datos sensibles en producción
- [ ] Sin `dangerouslySetInnerHTML` sin sanitizar en el frontend
- [ ] Sin comentarios con credenciales o URLs internas
- [ ] Sin endpoints `TODO` o de desarrollo sin protección
- [ ] `GlobalExceptionFilter` configurado (sin stack traces en producción)

---

## 🚀 Post-Despliegue

- [ ] Verificar `/api/v1/settings` devuelve datos correctos
- [ ] Verificar login admin + MFA funciona end-to-end
- [ ] Emitir 1 certificado de prueba y verificar búsqueda + descarga
- [ ] Verificar QR de verificación muestra estado correcto
- [ ] Revocar el certificado de prueba y verificar estado cambia a REVOCADO
- [ ] Verificar que el audit log registró todas las acciones anteriores
- [ ] Eliminar el certificado de prueba
- [ ] Revisar logs de nginx por errores 5xx
