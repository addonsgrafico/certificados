import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Global()
@Module({
  providers: [SecurityService, PrismaService],
  controllers: [SecurityController],
  exports: [SecurityService],
})
export class SecurityModule {}
