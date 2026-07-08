import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3000/graphql',
  documents: ['apps/web/src/**/*.graphql'],
  generates: {
    'apps/web/src/gql/': {
      preset: 'client',
      config: {
        avoidOptionals: true,
        scalars: {
          Date: {
            input: 'string',
            output: 'string',
          },
          DateTime: {
            input: 'string',
            output: 'string',
          },
          ISODateTime: {
            input: 'string',
            output: 'string',
          },
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;