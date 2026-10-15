import { Transform, type TransformFnParams } from 'class-transformer';

export function NormalizarTexto(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams): unknown => {
    if (typeof value !== 'string') {
      return value;
    }

    return value.replace(/ +/g, ' ').replace(/^ +| +$/g, '');
  });
}
