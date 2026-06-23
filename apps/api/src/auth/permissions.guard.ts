import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRequestFromContext } from './auth-request.util';
import { REQUIRED_PERMISSIONS_KEY } from './require-perms.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        REQUIRED_PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = getRequestFromContext(context);
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Current user is unavailable');
    }

    const missingPermissions = requiredPermissions.filter(
      (permission) => !user.roles.includes(permission),
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(
        `Missing required permission: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}