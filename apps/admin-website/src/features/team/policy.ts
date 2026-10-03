import type { UserRole } from '@/types'

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadmin', admin: 'Admin', staff: 'Staff', user: 'Reader',
}
export const PASSWORD_HELP = 'Use 12–72 characters, including uppercase, lowercase, a number and a symbol.'
export const PAGE_SIZE = 12

export function isTeamManager(role: unknown): role is 'admin' | 'superadmin' {
  return role === 'admin' || role === 'superadmin'
}

export function assignableRoles(role: UserRole): UserRole[] {
  return role === 'superadmin' ? ['admin', 'staff', 'user'] : role === 'admin' ? ['staff', 'user'] : []
}

export function canManageMember(actor: { id: string; role: UserRole }, target: { id: string; role: UserRole }) {
  return actor.id !== target.id && assignableRoles(actor.role).includes(target.role)
}

export class TeamError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export function validatePassword(password: unknown, confirmation: unknown): string {
  if (typeof password !== 'string' || password.length < 12 || password.length > 72 ||
      !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9\s]/.test(password)) {
    throw new TeamError(PASSWORD_HELP)
  }
  if (password !== confirmation) throw new TeamError('The passwords do not match.')
  return password
}

export function validateMember(input: Record<string, unknown>, actorRole: UserRole) {
  const name = typeof input.full_name === 'string' ? input.full_name.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  if (!name || name.length > 100) throw new TeamError('Enter a name between 1 and 100 characters.')
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new TeamError('Enter a valid email address.')
  if (!assignableRoles(actorRole).includes(input.role as UserRole)) throw new TeamError('You cannot assign this role.', 403)
  return { full_name: name, email, role: input.role as UserRole }
}

export function validateId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new TeamError('Invalid member ID.')
  }
}

export function generatePassword() {
  const groups = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%&*?']
  const randomIndex = (length: number) => {
    const bytes = new Uint8Array(1)
    do { crypto.getRandomValues(bytes) } while (bytes[0] >= 256 - (256 % length))
    return bytes[0] % length
  }
  const characters = groups.map(group => group[randomIndex(group.length)])
  const alphabet = groups.join('')
  while (characters.length < 20) characters.push(alphabet[randomIndex(alphabet.length)])
  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[characters[i], characters[j]] = [characters[j], characters[i]]
  }
  return characters.join('')
}
