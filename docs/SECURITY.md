# SECURITY.md — Modelo de Seguridad CertiValida

> **Este documento describe los controles de seguridad implementados y los riesgos residuales. No afirmamos que el sistema es "100% seguro". La seguridad es un proceso continuo.**

---

## Superficie de Ataque

| Superficie | Exposición |
|-----------|-----------|
| `/certificados` | Pública. Acepta código secreto para búsqueda. Rate limited. |
| `/verificar/[token]` | Pública. Solo muestra datos de autenticidad. Sin PDF. |
| `/api/v1/certificates/search` | Pública. Rate limit 5/min. HMAC validation. |
| `/api/v1/certificates/download` | Semi-pública. Requiere DownloadTicket temporal de 1 uso. |
| `/api/v1/verify/*` | Pública. Solo devuelve estado, sin secretos. |
| `/admin/*` | Protegida. AuthenticatedGuard + RolesGuard. |
| `/api/v1/admin/*` | Protegida. Cookie session + RBAC + Argon2id + TOTP. |

---

## Modelo de Amenazas

### T1 — Adivinanza de Códigos Secretos
- **Impacto**: Alto — descarga de certificados de terceros
- **Probabilidad**: Bajo — >100 bits de entropía (Crockford Base32 CSPRNG)
- **Mitigación**: Rate limiting 5/min/IP + HMAC-SHA256 (no timing attacks) + Security Events
- **Riesgo Residual**: Ataques distribuidos desde múltiples IPs no están completamente bloqueados sin CAPTCHA

### T2 — Enumeración de Certificados via IDs
- **Impacto**: Alto — exposición de nombres y cursos
- **Probabilidad**: Bajo — publicId y verificationToken son UUID/aleatorios, no incrementales
- **Mitigación**: Sin IDs incrementales, HMAC para búsqueda, nunca se retorna URL del archivo PDF

### T3 — Robo de QR para Hacerse Pasar por Titular
- **Impacto**: Bajo — el QR solo muestra info pública, no genera descarga
- **Probabilidad**: N/A — el QR NO permite descargar el PDF
- **Mitigación**: Token QR separado del código de descarga, página sin opción de descarga

### T4 — SQL Injection
- **Impacto**: Crítico — exfiltración masiva de datos
- **Probabilidad**: Muy Bajo — Prisma ORM con consultas parametrizadas, sin raw SQL
- **Mitigación**: Prisma parameterization, DTO validation, whitelist de campos
- **Riesgo Residual**: Raw SQL debe evitarse en cualquier extensión futura

### T5 — XSS (Cross-Site Scripting)
- **Impacto**: Alto — robo de sesiones, manipulación DOM
- **Probabilidad**: Bajo — React escapa por defecto, no se usa dangerouslySetInnerHTML
- **Mitigación**: React escaping, Helmet CSP headers, sin innerHTML directo
- **Riesgo Residual**: Extensiones de terceros o importaciones maliciosas

### T6 — CSRF (Cross-Site Request Forgery)
- **Impacto**: Medio — acciones administrativas no autorizadas
- **Probabilidad**: Bajo — SameSite=Strict, CORS restringido
- **Mitigación**: Cookie SameSite=Strict, CORS whitelist, Origin validation
- **Riesgo Residual**: Browsers antiguos pueden no respetar SameSite correctamente

### T7 — Carga de PDF Malicioso
- **Impacto**: Alto — ejecución de código en servidor
- **Probabilidad**: Bajo — validación de magic bytes (%PDF-), tamaño máximo
- **Mitigación**: Magic bytes check, MIME check, UUID rename, almacenamiento privado, SHA-256 hash
- **Riesgo Residual**: Sin ClamAV activo (requiere configuración manual), PDFs con contenido embebido malicioso podrían pasar

### T8 — Path Traversal en Descarga
- **Impacto**: Crítico — lectura de archivos del servidor
- **Probabilidad**: Muy Bajo — los PDFs se sirven por buffer interno, sin exponer rutas
- **Mitigación**: Sin URL pública de archivos, streaming desde `storagePath` interno, UUID rename
- **Riesgo Residual**: Ninguno conocido con la implementación actual

### T9 — Compromiso de Credencial de Administrador
- **Impacto**: Crítico — control total del sistema
- **Probabilidad**: Bajo-Medio — depende de seguridad del admin
- **Mitigación**: Argon2id, TOTP MFA obligatorio para SUPER_ADMIN, sesiones con expiración, invalidación al logout, audit logs
- **Riesgo Residual**: Compromise del dispositivo del admin o intercepción de TOTP

### T10 — Compromiso de Base de Datos
- **Impacto**: Alto — exposición de datos
- **Probabilidad**: Bajo — credenciales en entorno, usuario PostgreSQL con privilegios mínimos
- **Mitigación**: Codes HMAC (no texto plano), passwords Argon2id, tokens son hashes
- **Riesgo Residual**: Datos de participantes (nombre, email) expuestos si la BD es comprometida

### T11 — Compromiso de Storage/S3
- **Impacto**: Alto — acceso a PDFs privados
- **Probabilidad**: Bajo-Medio — depende de configuración de bucket
- **Mitigación**: Almacenamiento local privado (fuera de web root) o bucket S3 privado, sin URLs públicas permanentes
- **Riesgo Residual**: Si STORAGE_PATH apunta a directorio web accesible, PDFs quedan expuestos

### T12 — Dependencia Comprometida (Supply Chain)
- **Impacto**: Alto
- **Probabilidad**: Bajo-Medio — ecosistema npm es amplio
- **Mitigación**: `npm audit`, lockfile fijado, dependencias conocidas y mantenidas
- **Riesgo Residual**: Ataques de supply chain sofisticados son difíciles de detectar

---

## Controles de Autenticación

- **Passwords**: Argon2id con parámetros seguros (memory=65536, time=3, parallelism=4)
- **MFA**: TOTP RFC 6238, compatible con Google Authenticator/Authy/Microsoft Authenticator
- **SUPER_ADMIN**: MFA obligatorio antes del primer acceso
- **Recovery Codes**: 8 códigos de recuperación, hash Argon2id, cada uno de un solo uso
- **Sesiones**: Opacas, almacenadas en BD, token hash SHA-256 en cookie HttpOnly Secure SameSite=Strict
- **Expiración**: 8 horas absoluto, invalidación en logout, invalidación en cambio de password

---

## Controles de Autorización (RBAC)

| Acción | SUPER_ADMIN | ADMIN | AUDITOR |
|--------|------------|-------|---------|
| Emitir certificados | ✅ | ✅ | ❌ |
| Revocar certificados | ✅ | ✅ | ❌ |
| Rotar código secreto | ✅ | ✅ | ❌ |
| Crear administradores | ✅ | ❌ | ❌ |
| Ver audit logs | ✅ | ❌ | ✅ |
| Ver security events | ✅ | ❌ | ✅ |
| Cambiar configuración | ✅ | ❌ | ❌ |
| Importación masiva | ✅ | ✅ | ❌ |
| Ver participantes | ✅ | ✅ | ✅ |
| Ver certificados | ✅ | ✅ | ✅ |

**IMPORTANTE**: Los permisos se validan en el servidor. Ocultar botones en el frontend NO es control de acceso.

---

## Secretos y Gestión de Claves

| Variable | Propósito | Rotación |
|----------|-----------|----------|
| `SESSION_SECRET` | Hash de session tokens | Rota sesiones activas al cambiar |
| `CERTIFICATE_CODE_PEPPER` | HMAC de códigos de certificado | **NUNCA en producción** (invalidaría todos los códigos) |
| `MFA_ENCRYPTION_KEY` | Cifrado de secretos TOTP | Requiere re-cifrar todos los secretos MFA |
| `DATABASE_URL` | Conexión PostgreSQL | Cambiar credenciales de DB directamente |

---

## Manejo de Logs de Auditoría

Los logs de auditoría son:
- Inmutables desde el panel (admins normales no pueden borrarlos)
- Estructurados con: `adminId`, `action`, `resource`, `resourceId`, `ip`, `userAgent`, `result`, `metadata`
- **NUNCA registran**: passwords, códigos secretos completos, session cookies, TOTP secrets, recovery codes

---

## Incident Response

1. **Sospecha de compromiso de código PEPPER**: Revocar todos los certificados activos, regenerar PEPPER, re-emitir.
2. **Sospecha de cuenta admin comprometida**: Desactivar cuenta desde `/admin/users`, invalidar sesiones, revisar audit logs.
3. **Brecha de base de datos**: Notificar a titulares, los datos sensibles tienen protección (HMAC, Argon2id).
4. **Archivo PDF malicioso pasó validación**: Revisar logs, aislar el archivo, reportar en issue tracker.

---

## Medidas OWASP Top 10 Aplicadas

| ID | Categoría | Control Aplicado |
|----|-----------|-----------------|
| A01 | Broken Access Control | Guards RBAC, validación server-side, UUIDs no predecibles |
| A02 | Security Misconfiguration | Helmet headers, CORS whitelist, no defaults hardcodeados |
| A03 | Supply Chain Failures | npm audit, lockfile, dependencias conocidas |
| A04 | Cryptographic Failures | Argon2id, HMAC-SHA256, no MD5/SHA1, HTTPS obligatorio |
| A05 | Injection | Prisma ORM parameterized, DTO validation, no raw SQL |
| A06 | Insecure Design | Threat model documentado, separación QR/código |
| A07 | Authentication Failures | Rate limiting, TOTP MFA, sesiones servidor, sin localStorage tokens |
| A08 | Software Integrity | Lockfile, no CDN sin SRI para assets críticos |
| A09 | Logging Failures | AuditLog inmutable, SecurityEvent por tipo, request IDs |
| A10 | SSRF/Exceptional Conditions | Global exception filter, timeouts, graceful shutdown |
