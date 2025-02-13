/** @type { import('denoify/lib/config/parseParams').DenoifyParams } */
const config = {
  includes: ['assets'],
  ports: {
    valibot: 'https://deno.land/x/valibot/mod.ts',
    zod: 'https://deno.land/x/zod/mod.ts',
  },
};

module.exports = config;
