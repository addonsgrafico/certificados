import { PrismaClient, CertificateStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando base de datos con información oficial de CONSULTANCY ORGANIZATIONAL LLC y Deisy Barrera...');

  // 1. Limpiar datos existentes respetando restricciones
  await prisma.downloadTicket.deleteMany();
  await prisma.qrScanLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.courseEvent.deleteMany();

  // Buscar o crear Admin por defecto
  let admin = await prisma.adminUser.findFirst({ where: { email: 'admin@ejemplo.com' } });
  if (!admin) {
    admin = await prisma.adminUser.create({
      data: {
        email: 'admin@ejemplo.com',
        fullName: 'Administrador Principal',
        passwordHash: '$2b$10$wT.3kL/eJt0wX.YqJ.G2t.5hB4f6n7g8h9i0j1k2l3m4n5o6p7q8r', // Dummy hash for seed
        role: 'SUPER_ADMIN',
      },
    });
  }

  // Crear archivo de certificado genérico para seed
  let certFile = await prisma.certificateFile.findFirst();
  if (!certFile) {
    certFile = await prisma.certificateFile.create({
      data: {
        originalName: 'Certificado-Plantilla-Base.pdf',
        storagePath: 'uploads/certificates/seed-template.pdf',
        mimeType: 'application/pdf',
        fileSize: 102400,
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    });
  }

  // 2. Crear Cursos Ricos y Completos
  const coursesData = [
    {
      name: 'Programa Ejecutivo en Inteligencia Comunicacional & Entrevistas de Alto Impacto',
      description: 'Dominio de técnicas de comunicación verbal y no verbal, preparación ejecutiva para entrevistas laborales de alto nivel, storytelling profesional y negociación salarial estratégicamente respaldada.',
      institution: 'CONSULTANCY ORGANIZATIONAL LLC',
      instructor: 'Deisy Barrera',
      date: new Date('2026-05-10'),
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Diplomado Internacional en Liderazgo Organizacional & Coaching Ejecutivo',
      description: 'Formación integral para directivos y líderes corporativos en gestión de equipos de alto rendimiento, cultura organizacional resiliente y resolución estratégica de conflictos.',
      institution: 'CONSULTANCY ORGANIZATIONAL LLC',
      instructor: 'Deisy Barrera',
      date: new Date('2026-04-18'),
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Taller Intensivo de Oratoria Corporativa & Presentaciones de Impacto',
      description: 'Estrategias prácticas de oratoria frente a directorios, superación del pánico escénico, lenguaje no verbal persuasivo y diseño de presentaciones ejecutivas memorables.',
      institution: 'CONSULTANCY ORGANIZATIONAL LLC',
      instructor: 'Deisy Barrera',
      date: new Date('2026-03-22'),
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Certificación en Negociación Estratégica & Resolución de Conflictos',
      description: 'Metodología Harvard aplicada a negociaciones corporativas complejas, acuerdos ganar-ganar, gestión de objeciones y mediación de conflictos interdepartamentales.',
      institution: 'CONSULTANCY ORGANIZATIONAL LLC',
      instructor: 'Deisy Barrera',
      date: new Date('2026-02-15'),
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Masterclass de Marca Personal & Networking Ejecutivo',
      description: 'Posicionamiento estratégico en LinkedIn, reputación profesional de alto nivel, alianzas de negocios y aceleración de oportunidades directivas.',
      institution: 'CONSULTANCY ORGANIZATIONAL LLC',
      instructor: 'Deisy Barrera',
      date: new Date('2026-01-20'),
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const createdCourses = [];
  for (const cData of coursesData) {
    const course = await prisma.courseEvent.create({ data: cData });
    createdCourses.push(course);
  }

  // 3. Crear Participantes con CI / DNI y Códigos de Estudiante
  const participantsData = [
    {
      fullName: 'María Fernanda López',
      email: 'maria.lopez@ejemplo.com',
      internalDocument: '7654321',
      code: 'EST-7654',
      courseIndex: 0,
    },
    {
      fullName: 'José Luis Rodríguez',
      email: 'jose.rodriguez@ejemplo.com',
      internalDocument: '8765432',
      code: 'EST-8765',
      courseIndex: 0,
    },
    {
      fullName: 'Ana Sofía Gutiérrez',
      email: 'ana.gutierrez@ejemplo.com',
      internalDocument: '9876543',
      code: 'EST-9876',
      courseIndex: 1,
    },
    {
      fullName: 'Roberto Carlos Mendoza',
      email: 'roberto.mendoza@ejemplo.com',
      internalDocument: '5432109',
      code: 'EST-5432',
      courseIndex: 1,
    },
    {
      fullName: 'Gabriela Beatriz Morales',
      email: 'gabriela.morales@ejemplo.com',
      internalDocument: '6543210',
      code: 'EST-6543',
      courseIndex: 2,
    },
  ];

  for (const pData of participantsData) {
    const participant = await prisma.participant.create({
      data: {
        fullName: pData.fullName,
        email: pData.email,
        internalDocument: pData.internalDocument,
      },
    });

    const targetCourse = createdCourses[pData.courseIndex];

    // Emitir Certificado Semilla
    await prisma.certificate.create({
      data: {
        publicId: pData.code,
        participantId: participant.id,
        courseEventId: targetCourse.id,
        codeDigest: `digest-${pData.code}-${Date.now()}`,
        codeLastFour: pData.code.slice(-4),
        status: CertificateStatus.ACTIVE,
        certificateFileId: certFile.id,
        createdById: admin.id,
      },
    });
  }

  // 4. Configurar Site Settings Oficiales
  await prisma.siteSetting.upsert({
    where: { id: '1' },
    update: {
      orgName: 'CONSULTANCY ORGANIZATIONAL LLC',
      orgLogoUrl: '/consultancy-logo.png',
      coachName: 'Deisy Barrera',
      coachTitle: 'Executive Coach & Mentora Organizacional',
      coachBio: 'Especialista en desarrollo institucional, liderazgo ejecutivo e inteligencia comunicacional con más de 10 años de trayectoria acompañando a profesionales e instituciones de alto impacto.',
      coachAvatarUrl: '/deisy-barrera.jpg',
      contactEmail: 'contacto@consultancyorganizational.com',
      contactPhone: '+1 (800) 555-DEISY / +591 700-00000',
      whatsapp: '+591 700-00000',
      address: 'CONSULTANCY ORGANIZATIONAL LLC — Sede Internacional',
    },
    create: {
      id: '1',
      orgName: 'CONSULTANCY ORGANIZATIONAL LLC',
      orgLogoUrl: '/consultancy-logo.png',
      coachName: 'Deisy Barrera',
      coachTitle: 'Executive Coach & Mentora Organizacional',
      coachBio: 'Especialista en desarrollo institucional, liderazgo ejecutivo e inteligencia comunicacional con más de 10 años de trayectoria acompañando a profesionales e instituciones de alto impacto.',
      coachAvatarUrl: '/deisy-barrera.jpg',
      contactEmail: 'contacto@consultancyorganizational.com',
      contactPhone: '+1 (800) 555-DEISY / +591 700-00000',
      whatsapp: '+591 700-00000',
      address: 'CONSULTANCY ORGANIZATIONAL LLC — Sede Internacional',
    },
  });

  console.log('✅ Poblado exitoso. 5 Cursos, 5 Estudiantes y 5 Certificados creados.');
}

main()
  .catch((e) => {
    console.error('❌ Error al poblar base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
