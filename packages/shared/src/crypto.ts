import * as crypto from 'crypto';

const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Genera un código secreto de certificado seguro utilizando CSPRNG y Crockford Base32.
 * Formato resultante: CERT-XXXX-XXXX-XXXX-XXXX-XXXX (20 caracteres Base32 = 100 bits de entropía).
 */
export function generateCertificateCode(): { rawCode: string; formattedCode: string } {
  const bytes = crypto.randomBytes(20);
  let base32Str = '';
  for (let i = 0; i < 20; i++) {
    const charIndex = bytes[i] % CROCKFORD_ALPHABET.length;
    base32Str += CROCKFORD_ALPHABET[charIndex];
  }

  // Formato: CERT-XXXX-XXXX-XXXX-XXXX-XXXX
  const chunks = base32Str.match(/.{1,4}/g) || [base32Str];
  const formattedCode = `CERT-${chunks.join('-')}`;

  return {
    rawCode: base32Str,
    formattedCode,
  };
}

/**
 * Normaliza un código ingresado por el usuario:
 * - Pasa a Mayúsculas.
 * - Sustituye confusiones visuales Crockford (I, L -> 1; O -> 0).
 * - Elimina espacios y guiones no esenciales.
 * - Retorna la cadena canónica sin prefijo CERT ni guiones.
 */
export function normalizeCertificateCode(input: string): string {
  if (!input) return '';
  let cleaned = input.toUpperCase().trim();
  
  // Remover prefijo CERT- si existe
  if (cleaned.startsWith('CERT-')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('CERT')) {
    cleaned = cleaned.substring(4);
  }

  // Reemplazar confusiones Crockford
  cleaned = cleaned
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0')
    .replace(/[^0-9A-Z]/g, ''); // Eliminar guiones, espacios y cualquier otro caracter no válido

  return cleaned;
}

/**
 * Formatea una cadena canónica limpia a formato visual estándar: CERT-XXXX-XXXX-XXXX-XXXX-XXXX
 */
export function formatNormalizedCode(canonicalCode: string): string {
  const chunks = canonicalCode.match(/.{1,4}/g) || [canonicalCode];
  return `CERT-${chunks.join('-')}`;
}

/**
 * Extrae los últimos 4 caracteres para auxilio administrativo / logs sin revelar el secreto.
 */
export function getCodeLastFour(canonicalCode: string): string {
  if (!canonicalCode || canonicalCode.length < 4) return 'XXXX';
  return canonicalCode.slice(-4);
}

/**
 * Calcula el HMAC-SHA256 del código normalizado utilizando el CERTIFICATE_CODE_PEPPER.
 * Esto evita almacenar el código en texto plano en la base de datos.
 */
export function calculateCodeDigest(normalizedCode: string, pepper: string): string {
  if (!pepper) {
    throw new Error('CERTIFICATE_CODE_PEPPER environment variable is required');
  }
  return crypto
    .createHmac('sha256', pepper)
    .update(normalizedCode)
    .digest('hex');
}
