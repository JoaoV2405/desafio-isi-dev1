import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isDateAfter', async: false })
export class IsDateAfterConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    // Allow null/undefined values (optional field)
    if (!value) {
      return true;
    }

    const [related_property_name] = args.constraints;
    const related_value = (args.object as Record<string, unknown>)[related_property_name];

    // If the related field is empty, skip validation
    if (!related_value) {
      return true;
    }

    const current_date = new Date(value as string);
    const related_date = new Date(related_value as string);

    return current_date > related_date;
  }

  defaultMessage(args: ValidationArguments) {
    const [related_property_name] = args.constraints;
    return `${args.property} deve ser posterior a ${related_property_name}`;
  }
}

export function IsDateAfter(property: string, validation_options?: ValidationOptions) {
  return (object: object, property_name: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: property_name,
      options: validation_options,
      constraints: [property],
      validator: IsDateAfterConstraint,
    });
  };
}
