import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as readline from 'readline';

const prisma = new PrismaClient();

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

async function bootstrapSuperAdmin() {
  console.log('=== BOOTSTRAP SUPERADMIN DE LA PLATAFORMA DE CERTIFICADOS ===\n');

  let email = process.env.INITIAL_SUPERADMIN_EMAIL;
  let fullName = process.env.INITIAL_SUPERADMIN_NAME;
  let password = process.env.INITIAL_SUPERADMIN_PASSWORD;

  if (!email) {
    email = await askQuestion('Ingrese el correo del SuperAdmin: ');
  }
  if (!fullName) {
    fullName = await askQuestion('Ingrese el nombre completo del SuperAdmin: ');
  }
  if (!password) {
    password = await askQuestion('Ingrese la contraseña (mínimo 10 caracteres): ');
  }

  email = email.trim().toLowerCase();
  fullName = fullName.trim();

  if (!email || !email.includes('@')) {
    console.error('Error: El correo electrónico no es válido.');
    process.exit(1);
  }

  if (!password || password.length < 10) {
    console.error('Error: La contraseña debe tener al menos 10 caracteres por seguridad.');
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`El usuario SuperAdmin con correo ${email} ya existe en la base de datos.`);
    process.exit(0);
  }

  const passwordHash = await argon2.hash(password);

  const superadmin = await prisma.adminUser.create({
    data: {
      email,
      fullName,
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      mfaEnabled: false,
    },
  });

  await prisma.siteSetting.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      orgName: 'Organización Emisora de Certificados Digitales',
      contactEmail: email,
      contactPhone: '+1 (555) 019-2834',
      whatsapp: '+1 (555) 019-2834',
      address: 'Av. Principal #100, Centro Corporativo',
    },
  });

  console.log('\n✅ SUPERADMIN CREADO CON ÉXITO:');
  console.log(`- Email: ${superadmin.email}`);
  console.log(`- Nombre: ${superadmin.fullName}`);
  console.log(`- Rol: ${superadmin.role}`);
  console.log('\nNOTA: Al ingresar por primera vez a /admin/login, se le solicitará activar TOTP MFA.');
}

bootstrapSuperAdmin()
  .catch((e) => {
    console.error('Error durante el bootstrap:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
