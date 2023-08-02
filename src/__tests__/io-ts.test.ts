import type {Infer, InferIn} from '..';

import {describe, expect, jest, test} from '@jest/globals';
import {expectTypeOf} from 'expect-type';
import * as t from 'io-ts';
import {DateFromISOString} from 'io-ts-types';

import {assert, createAssert, validate} from '..';
import {extractIssues} from './utils';

describe('io-ts', () => {
  const schema = t.type({
    age: t.number,
    createdAt: DateFromISOString,
    email: t.string,
    id: t.string,
    name: t.string,
    updatedAt: DateFromISOString,
  });
  const module = 'fp-ts/Either';

  const data = {
    age: 123,
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };
  const outputData = {
    age: 123,
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
  };

  test('peer dependency', async () => {
    jest.mock(module, () => {
      throw new Error('Cannot find module');
    });
    await expect(validate(schema, data)).rejects.toThrow();
    await expect(assert(schema, data)).rejects.toThrow();
    jest.unmock(module);
  });

  test('infer', () => {
    expectTypeOf<Infer<typeof schema>>().toEqualTypeOf(outputData);
    expectTypeOf<InferIn<typeof schema>>().toEqualTypeOf(data);
  });

  test('validate', async () => {
    expect(await validate(schema, data)).toStrictEqual({data: outputData});
    expect(extractIssues(await validate(schema, outputData))).toStrictEqual([
      {
        message: '',
        path: ['', 'createdAt'],
      },
      {
        message: '',
        path: ['', 'updatedAt'],
      },
    ]);
  });

  test('assert', async () => {
    expect(await assert(schema, data)).toStrictEqual(outputData);
    await expect(assert(schema, outputData)).rejects.toThrow();
  });

  test('createAssert', async () => {
    const assertSchema = createAssert(schema);
    expect(await assertSchema(data)).toEqual(outputData);
    await expect(assertSchema(outputData)).rejects.toThrow();
  });
});
