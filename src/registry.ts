import type {Infer} from '.';
import type {InferSchema} from './resolver';
import type {Schema, TypeSchema} from './schema';

import {maybe} from './utils';

export type Adapter = <TSchema extends Schema>(
  schema: TSchema,
) => Promise<TypeSchema<Infer<TSchema>> | null>;

export const adapters: Array<Adapter> = [];

export function register<TKey extends keyof TypeSchemaRegistry>(
  coerce: <TSchema extends Schema>(
    schema: TSchema,
  ) => InferSchema<TypeSchemaRegistry[TKey], Infer<TSchema>> | null,
  wrap: <T>(
    schema: InferSchema<TypeSchemaRegistry[TKey], T>,
  ) => Promise<TypeSchema<T>>,
  importModule?: () => Promise<unknown>,
) {
  adapters.push(async schema => {
    if (importModule != null) {
      const module = await maybe(importModule);
      if (module == null) {
        return null;
      }
    }
    const coercedSchema = coerce(schema);
    return coercedSchema != null ? wrap(coercedSchema) : null;
  });
}
