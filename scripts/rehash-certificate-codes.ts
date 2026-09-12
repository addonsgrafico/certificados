#!/usr/bin/env ts-node
/**
 * Script de Re-hashing de Códigos de Certificado
 *
 * USAR SOLO EN CASO DE ROTACIÓN DE PEPPER (emergencia de seguridad).
 * Requiere: códigos secretos originales en texto plano (si se tienen guardados).
 * Alternativa: Revocar todos y re-emitir con nuevos códigos.
 *
 * Uso:
 *   OLD_PEPPER=old_pepper_value NEW_PEPPER=new_pepper_value npx ts-node scripts/rehash-certificate-codes.ts
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function rehashCertificateCodes() {
  const OLD_PEPPER = process.env.OLD_PEPPER;
  const NEW_PEPPER = process.env.NEW_PEPPER;

  if (!OLD_PEPPER || !NEW_PEPPER) {
    console.error('ERROR: Se requieren OLD_PEPPER y NEW_PEPPER como variables de entorno.');
    process.exit(1);
  }

  console.log('⚠️  ADVERTENCIA: Este script modifica TODOS los certificados de la BD.');
  console.log('⚠️  Asegúrese de tener un backup ANTES de ejecutar este script.');
  console.log('');
  console.log('Como los códigos solo se almacenan como HMAC (no en texto plano),');
  console.log('este script NO puede re-calcular el HMAC desde el hash anterior.');
  console.log('');
  console.log('Las opciones son:');
  console.log('  1. Si tiene un export de códigos en texto plano (backup cifrado), use ese.');
  console.log('  2. Genere nuevos códigos para todos los certificados (recomendado).');
  console.log('');

  const { generateCertificateCode } = await import('../packages/shared/src/crypto');

  const certificates = await prisma.certificate.findMany({
    where: { archivedAt: null },
    select: { id: true, secretCode: true },
  });

  console.log(`Procesando ${certificates.length} certificados...`);

  let processed = 0;
  for (const cert of certificates) {
    // Si se tiene el código en texto plano (cert.secretCode), re-hashear
    // En este sistema, secretCode almacena el código formateado (CERT-XXXX-...)
    if (cert.secretCode) {
      const newHmac = crypto
        .createHmac('sha256', NEW_PEPPER)
        .update(cert.secretCode)
        .digest('hex');

      await prisma.certificate.update({
        where: { id: cert.id },
        data: { hmacHash: newHmac },
      });
      processed++;
    }
  }

  console.log(`✅ Re-hashing completado: ${processed}/${certificates.length} certificados actualizados.`);
  console.log('');
  console.log('SIGUIENTE PASO: Actualice CERTIFICATE_CODE_PEPPER en .env con el NEW_PEPPER y reinicie la API.');

  await prisma.$disconnect();
}

rehashCertificateCodes().catch((err) => {
  console.error('Error durante re-hashing:', err);
  process.exit(1);
});
