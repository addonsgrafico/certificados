import { Module } from '@nestjs/common';
import { BulkImportService } from './bulk-import.service';
import { BulkImportController } from './bulk-import.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BulkImportService],
  controllers: [BulkImportController],
  exports: [BulkImportService],
})
export class BulkImportModule {}
