import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorpoJsonPipe } from '../../core/validation/corpo-json.pipe.js';
import { ClubesController } from './clubes.controller.js';
import { CriarClubeDtoPipe } from './dto/criar-clube.dto.js';
import { Clube } from './entities/clube.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Clube])],
  controllers: [ClubesController],
  providers: [CorpoJsonPipe, CriarClubeDtoPipe],
})
export class ClubesModule {}
