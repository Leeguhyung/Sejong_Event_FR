export type UserRole = 'superuser' | 'organizer' | 'participant'

export interface User {
  id: number
  username: string
  name: string
  organization: string
  role: UserRole
}
