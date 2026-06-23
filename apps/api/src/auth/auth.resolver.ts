import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from './current-user.decorator';
import { CurrentUserModel } from './current-user.model';
import type { CurrentUserData } from './auth.types';
import { PermissionsGuard } from './permissions.guard';
import { RequirePerms } from './require-perms.decorator';

@Resolver()
export class AuthResolver {
  @Query(() => CurrentUserModel)
  currentUser(
    @CurrentUser() user: CurrentUserData,
  ): CurrentUserData {
    return user;
  }

  @Query(() => String)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  protectedAuthCheck(
    @CurrentUser() user: CurrentUserData,
  ): string {
    return `Access granted for ${user.name}`;
  }
}