import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { FakeAuthMiddleware } from './fake-auth.middleware';
import { PermissionsGuard } from './permissions.guard';

@Module({
  providers: [
    AuthResolver,
    FakeAuthMiddleware,
    PermissionsGuard,
  ],
  exports: [PermissionsGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(FakeAuthMiddleware)
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}