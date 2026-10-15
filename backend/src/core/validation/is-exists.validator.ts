import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { DataSource } from 'typeorm';

interface IsExistConstraint {
  table: string;
  field: string;
}

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const constraints: IsExistConstraint[] = args.constraints;
    for (const constraint of constraints) {
      if (Array.isArray(value)) {
        for (const actualValue of value) {
          const entity = await this.dataSource.getRepository(constraint.table).findOne({
            where: { [constraint.field]: actualValue },
            withDeleted: true,
          });
          if (!entity) {
            return false;
          }
        }
        return true;
      }

      const entity = await this.dataSource.getRepository(constraint.table).findOne({
        where: { [constraint.field]: value },
        withDeleted: true,
      });

      if (entity) {
        return true;
      }
    }

    return false;
  }
}
