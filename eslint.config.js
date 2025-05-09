import nkzw from '@nkzw/eslint-config';

export default [
  ...nkzw,
  {
    ignores: ['src/prisma/prisma-client/*', 'src/prisma/pothos-types.ts'],
  },
  {
    files: ['src/index.tsx', 'src/prisma/seed.tsx', 'scripts/**/*.tsx'],
    rules: {
      'no-console': 0,
    },
  },
];
