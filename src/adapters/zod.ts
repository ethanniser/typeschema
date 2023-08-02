import type {Resolver} from '../resolver';
import type {input, output, ZodSchema} from 'zod';

import {register} from '../registry';
import {ValidationIssue} from '../schema';
import {isJSONSchema, isTypeBoxSchema} from '../utils';

interface ZodResolver extends Resolver {
  base: ZodSchema<this['type']>;
  input: this['schema'] extends ZodSchema ? input<this['schema']> : never;
  output: this['schema'] extends ZodSchema ? output<this['schema']> : never;
  module: typeof import('zod');
}

declare global {
  export interface TypeSchemaRegistry {
    zod: ZodResolver;
  }
}

register<'zod'>(
  schema =>
    '_def' in schema && !isTypeBoxSchema(schema) && !isJSONSchema(schema)
      ? schema
      : null,
  async schema => ({
    validate: async data => {
      const result = await schema.safeParseAsync(data);
      if (result.success) {
        return {data: result.data};
      }
      return {
        issues: result.error.issues.map(
          ({message, path}) => new ValidationIssue(message, path),
        ),
      };
    },
  }),
  'zod',
);
