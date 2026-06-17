import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthResolver } from './health.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,

      // Code-first GraphQL:
      // NestJS creates the schema from TypeScript decorators.
      autoSchemaFile: true,

      // Keep the generated schema in a predictable order.
      sortSchema: true,

      // Enable the browser-based GraphQL testing screen.
      graphiql: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, HealthResolver],
})
export class AppModule {}