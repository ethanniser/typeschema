import type {Infer, InferIn} from '..';

import {describe, expect, test} from '@jest/globals';
import {initTRPC} from '@trpc/server';
import {expectTypeOf} from 'expect-type';
import {coerce, date, number, object, string} from 'superstruct';

import {assert, validate, wrap} from '..';

describe('superstruct', () => {
  const schema = object({
    age: number(),
    createdAt: coerce(date(), string(), value => new Date(value)),
    email: string(),
    id: string(),
    name: string(),
    updatedAt: coerce(date(), string(), value => new Date(value)),
  });

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
  const badData = {
    age: '123',
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };

  test('infer', () => {
    expectTypeOf<Infer<typeof schema>>().toEqualTypeOf(outputData);
    expectTypeOf<InferIn<typeof schema>>().toEqualTypeOf<unknown>();
  });

  test('validate', async () => {
    expect(await validate(schema, data)).toStrictEqual({data: outputData});
    expect(await validate(schema, badData)).toStrictEqual({
      issues: [
        {
          message: 'At path: age -- Expected a number, but received: "123"',
          path: ['age'],
        },
      ],
    });
  });

  test('assert', async () => {
    expect(await assert(schema, data)).toStrictEqual(outputData);
    await expect(assert(schema, badData)).rejects.toThrow();
  });

  test('wrap', async () => {
    const tRPC = initTRPC.create();
    tRPC.router({
      hello: tRPC.procedure.input(wrap(schema)).query(({input}) => {
        expectTypeOf<typeof input>().toEqualTypeOf(outputData);
        return input;
      }),
    });
  });
});
