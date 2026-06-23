import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './auth.types';
import { resolveFakeUser } from './fake-users';

@Injectable()
export class FakeAuthMiddleware implements NestMiddleware {
  use(
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): void {
    const userId = request.header('x-user-id');

    request.user = resolveFakeUser(userId);

    next();
  }
}