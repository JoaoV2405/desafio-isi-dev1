import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubesController } from './clubes.controller.js';
import { Clube } from './entities/clube.entity.js';
import { ClubesService } from './services/clubes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Clube])],
  controllers: [ClubesController],
  providers: [ClubesService],
})
export class ClubesModule {}
