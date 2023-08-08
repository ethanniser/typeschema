import type {Infer} from '../inference';
import type {InferSchema, Schema} from '../resolver';
import type {ValidationIssue} from '../validation';
import type {AjvResolver} from './ajv';
import type {ArkTypeResolver} from './arktype';
import type {DeepkitResolver} from './deepkit';
import type {FunctionResolver} from './function';
import type {IoTsResolver} from './io-ts';
import type {JoiResolver} from './joi';
import type {OwResolver} from './ow';
import type {RuntypesResolver} from './runtypes';
import type {SuperstructResolver} from './superstruct';
import type {TypeBoxResolver} from './typebox';
import type {ValibotResolver} from './valibot';
import type {YupResolver} from './yup';
import type {ZodResolver} from './zod';

import {memoizeWithKey} from '../utils';

export interface TypeSchemaRegistry {
  ajv: AjvResolver;
  arktype: ArkTypeResolver;
  deepkit: DeepkitResolver;
  function: FunctionResolver;
  'io-ts': IoTsResolver;
  joi: JoiResolver;
  ow: OwResolver;
  runtypes: RuntypesResolver;
  superstruct: SuperstructResolver;
  typebox: TypeBoxResolver;
  valibot: ValibotResolver;
  yup: YupResolver;
  zod: ZodResolver;
}

export type Coerce<TKey extends keyof TypeSchemaRegistry> = <
  TSchema extends Schema,
  TReturn,
>(
  fn: (
    schema: InferSchema<TypeSchemaRegistry[TKey], Infer<TSchema>>,
  ) => Promise<TReturn>,
) => (schema: TSchema) => Promise<TReturn | undefined>;

export type CreateValidate = <TSchema extends Schema>(
  schema: TSchema,
) => Promise<
  | ((
      data: unknown,
    ) => Promise<{data: Infer<TSchema>} | {issues: Array<ValidationIssue>}>)
  | undefined
>;

const wrappedFns: Array<{clear(): void}> = [];

export function wrap<TSchema extends Schema, TReturn>(
  adapters: Array<(schema: TSchema) => Promise<TReturn>>,
): (schema: TSchema) => Promise<NonNullable<TReturn>> {
  const memoizedFn = memoizeWithKey(async (schema: TSchema) => {
    const results = await Promise.all(adapters.map(fn => fn(schema)));
    const filteredResults = results.filter(Boolean);
    if (filteredResults.length === 0) {
      throw new Error('Missing adapters for schema: ' + schema);
    }
    if (filteredResults.length > 1) {
      throw new Error('Conflicting adapters for schema: ' + schema);
    }
    return filteredResults[0] as NonNullable<TReturn>;
  });
  wrappedFns.push(memoizedFn);
  return memoizedFn;
}

export function resetAdapters(): void {
  wrappedFns.forEach(fn => fn.clear());
}
