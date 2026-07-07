import { FAKE_USERS } from './fake-users';

export const FAKE_MANAGER_TEAMS: Record<string, string[]> = {
  'manager-1': ['employee-1', 'employee-2'],
};

export function getTeamMemberIds(managerId: string): string[] {
  return FAKE_MANAGER_TEAMS[managerId] ?? [];
}

export function isTeamMember(
  managerId: string,
  userId: string,
): boolean {
  return getTeamMemberIds(managerId).includes(userId);
}

export function getFakeUserName(userId: string): string {
  return FAKE_USERS[userId]?.name ?? userId;
}