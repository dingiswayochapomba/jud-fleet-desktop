export type AppRole = 'system_admin' | 'court_administrator' | 'transport_officer' | 'admin' | 'manager' | 'user' | string | null | undefined;

function normalizeRole(role?: AppRole): string {
  return (role || '').toString().trim().toLowerCase();
}

export function getRoleKey(role?: AppRole): string {
  const normalized = normalizeRole(role);
  if (normalized === 'system_admin' || normalized === 'admin') return 'system_admin';
  if (normalized === 'court_administrator' || normalized === 'manager') return 'court_administrator';
  if (normalized === 'transport_officer' || normalized === 'user') return 'transport_officer';
  return normalized || 'transport_officer';
}

export function canAccessUsersPage(role?: AppRole): boolean {
  const roleKey = getRoleKey(role);
  return roleKey === 'system_admin' || roleKey === 'court_administrator';
}

export function canCreateUsers(role?: AppRole): boolean {
  return getRoleKey(role) === 'system_admin';
}

export function isUsersReadOnly(role?: AppRole): boolean {
  return getRoleKey(role) === 'court_administrator';
}

export function canViewAllModules(role?: AppRole): boolean {
  return getRoleKey(role) !== 'transport_officer';
}

export function canBypassRestrictedFeatures(role?: AppRole): boolean {
  return getRoleKey(role) === 'court_administrator' || getRoleKey(role) === 'system_admin';
}
