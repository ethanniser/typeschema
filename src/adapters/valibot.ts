import type {Resolver} from '../resolver';
import type {Coerce, CreateValidate} from '.';
import type {BaseSchema, BaseSchemaAsync, Input, Output} from 'valibot';

import {isJSONSchema, isTypeBoxSchema, memoize} from '../utils';
import {ValidationIssue} from '../validation';

export interface ValibotResolver extends Resolver {
  base: BaseSchema | BaseSchemaAsync;
  input: this['schema'] extends BaseSchema | BaseSchemaAsync
    ? Input<this['schema']>
    : never;
  output: this['schema'] extends BaseSchema | BaseSchemaAsync
    ? Output<this['schema']>
    : never;
}

export const fetchModule = /* @__PURE__ */ memoize(
  () => import('./modules/valibot'),
);

const coerce: Coerce<'valibot'> = /* @__NO_SIDE_EFFECTS__ */ fn => schema =>
  'async' in schema && !isTypeBoxSchema(schema) && !isJSONSchema(schema)
    ? fn(schema)
    : undefined;

export const createValidate: CreateValidate = coerce(async schema => {
  const {safeParseAsync} = await fetchModule();
  return async (data: unknown) => {
    const result = await safeParseAsync(schema, data);
    if (result.success) {
      return {data: result.data};
    }
    return {
      issues: result.issues.map(
        ({message, path}) =>
          new ValidationIssue(message, path?.map(({key}) => key)),
      ),
    };
  };
});
