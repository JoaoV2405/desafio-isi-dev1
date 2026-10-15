import {
  Injectable,
  NotFoundException,
  type PipeTransform,
} from '@nestjs/common';

const FORMATO_ID = /^[1-9]\d*$/;
const ID_MAXIMO = 2_147_483_647;

@Injectable()
export class IdPositivoPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!FORMATO_ID.test(value)) {
      throw new NotFoundException('Recurso não encontrado');
    }

    const id = Number(value);

    if (!Number.isSafeInteger(id) || id > ID_MAXIMO) {
      throw new NotFoundException('Recurso não encontrado');
    }

    return id;
  }
}
