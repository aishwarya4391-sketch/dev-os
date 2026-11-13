export type Role = 'specialist' | 'lead' | 'admin'

export const ROLE_RANK: Record<Role, number> = { specialist: 1, lead: 2, admin: 3 }

export function isRole(value: unknown): value is Role {
  return value === 'specialist' || value === 'lead' || value === 'admin'
}

export function hasRole(userRole: Role | null, required: Role): boolean {
  return userRole !== null && ROLE_RANK[userRole] >= ROLE_RANK[required]
}

type UserLike = { app_metadata?: Record<string, unknown> | null } | null | undefined

/** Reads the role from Supabase app_metadata. Missing or unknown role returns null. */
export function roleFromUser(user: UserLike): Role | null {
  const role = user?.app_metadata?.role
  return isRole(role) ? role : null
}
