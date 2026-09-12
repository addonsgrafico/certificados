import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './modules/storage/storage.module';
import { SecurityModule } from './modules/security/security.module';
import { AuthModule } from './modules/auth/auth.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { VerificationModule } from './modules/verification/verification.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { BulkImportModule } from './modules/bulk-import/bulk-import.module';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100, // 100 req/min por defecto a la API
      },
    ]),
    PrismaModule,
    StorageModule,
    SecurityModule,
    AuthModule,
    CertificatesModule,
    VerificationModule,
    CoursesModule,
    ParticipantsModule,
    BulkImportModule,
    UsersModule,
    SettingsModule,
    DashboardModule,
  ],
})
export class AppModule {}
