import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { DatabaseModule } from '@app/database';
import { AppConfigModule } from '@app/app-config';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
