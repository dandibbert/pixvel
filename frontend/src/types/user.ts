export interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  pixivUserId: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}
