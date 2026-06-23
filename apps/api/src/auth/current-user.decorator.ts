import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { CurrentUserData } from './auth.types';
import { getRequestFromContext } from './auth-request.util';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserData => {
    const request = getRequestFromContext(context);

    if (!request.user) {
      throw new UnauthorizedException('Current user is unavailable');
    }

    return request.user;
  },
);