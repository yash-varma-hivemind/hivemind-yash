import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AuthenticatedRequest } from './auth.types';

export function getRequestFromContext(
  context: ExecutionContext,
): AuthenticatedRequest {
  if (context.getType<string>() === 'http') {
    return context.switchToHttp().getRequest<AuthenticatedRequest>();
  }

  return GqlExecutionContext.create(context)
    .getContext<{ req: AuthenticatedRequest }>()
    .req;
}