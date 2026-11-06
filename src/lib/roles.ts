export const ROLES = {
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isRole(role: string): role is Role {
  return Object.values(ROLES).some((knownRole) => knownRole === role);
}

export function hasRole(role: string, allowedRoles: readonly Role[]): boolean {
  return allowedRoles.some((allowedRole) => allowedRole === role);
}
