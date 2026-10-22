import { Module } from '@nestjs/common';
import { LigaModule } from '../liga/liga.module.js';
import { InicioController } from './inicio.controller.js';
import { InicioService } from './inicio.service.js';

@Module({
  imports: [LigaModule],
  controllers: [InicioController],
  providers: [InicioService],
})
export class InicioModule {}
