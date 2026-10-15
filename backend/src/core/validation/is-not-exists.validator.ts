import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DataSource } from 'typeorm';

interface IsNotExistConstraint {
  table: string;
  field: string;
  // Quando true, desconsidera registros com soft delete (deletado_em preenchido) na verificação de unicidade.
  ignoreDeleted?: boolean;
}

@Injectable()
@ValidatorConstraint({ name: 'IsNotExist', async: true })
export class IsNotExist implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async validate(value: unknown, args: ValidationArguments) {
    const constraints: IsNotExistConstraint[] = args.constraints;

    for (const constraint of constraints) {
      if (Array.isArray(value)) {
        for (const actualValue of value) {
          const entity = await this.dataSource.getRepository(constraint.table).findOne({
            where: { [constraint.field]: actualValue },
            withDeleted: !constraint.ignoreDeleted,
          });
          if (entity) {
            return false;
          }
        }
        return true;
      }

      const entity = await this.dataSource.getRepository(constraint.table).findOne({
        where: { [constraint.field]: value },
        withDeleted: !constraint.ignoreDeleted,
      });

      if (entity) {
        return false;
      }
    }

    return true;
  }
}
