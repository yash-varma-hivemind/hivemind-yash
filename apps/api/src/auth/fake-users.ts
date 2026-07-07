import type { CurrentUserData } from './auth.types';

export const DEFAULT_USER_ID = 'employee-1';

export const FAKE_USERS: Record<string, CurrentUserData> = {
  'employee-1': {
    id: 'employee-1',
    name: 'Emma Employee',
    roles: [],
  },

  'employee-2': {
  id: 'employee-2',
  name: 'Ethan Employee',
  roles: [],
  },

  'manager-1': {
    id: 'manager-1',
    name: 'Maya Manager',
    roles: [
      'onboarding:manage',
      'onboarding:track-team',
      'onboarding-manager',
    ],
  },
};

export function resolveFakeUser(userId?: string): CurrentUserData {
  const user = userId ? FAKE_USERS[userId] : undefined;
  const resolvedUser = user ?? FAKE_USERS[DEFAULT_USER_ID];

  return {
    ...resolvedUser,
    roles: [...resolvedUser.roles],
  };
}