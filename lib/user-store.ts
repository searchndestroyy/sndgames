/**
 * User account system — localStorage-only, no backend required.
 * Passwords are hashed with SHA-256 via the Web Crypto API (no external libs).
 * Each hash includes the username as a salt to prevent cross-account attacks.
 */

export type User = {
  username: string
  createdAt: number
}

type StoredUser = {
  username: string
  hash: string
  createdAt: number
}

const USERS_KEY = 'snd_users'
const SESSION_KEY = 'snd_session'

// ─── Hashing ───────────────────────────────────────────────────────────────

/** SHA-256 via Web Crypto. Salted with username (lowercase) to prevent attacks. */
async function hashPassword(username: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  // Salting prevents two users with the same password from having the same hash
  const raw = `snd:${username.toLowerCase()}:${password}:v1`
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Storage helpers ────────────────────────────────────────────────────────

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function register(
  username: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  username = username.trim()

  if (username.length < 3)
    return { ok: false, error: 'Username must be at least 3 characters' }
  if (username.length > 20)
    return { ok: false, error: 'Username must be 20 characters or fewer' }
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return { ok: false, error: 'Only letters, numbers, and underscores allowed' }
  if (password.length < 6)
    return { ok: false, error: 'Password must be at least 6 characters' }

  const users = getStoredUsers()
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase()))
    return { ok: false, error: 'That username is already taken' }

  const hash = await hashPassword(username, password)
  users.push({ username, hash, createdAt: Date.now() })
  saveStoredUsers(users)
  localStorage.setItem(SESSION_KEY, username)
  return { ok: true }
}

export async function login(
  username: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  username = username.trim()
  const users = getStoredUsers()
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())

  if (!user) return { ok: false, error: 'Account not found' }

  const hash = await hashPassword(user.username, password)
  if (hash !== user.hash) return { ok: false, error: 'Wrong password' }

  localStorage.setItem(SESSION_KEY, user.username)
  return { ok: true }
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

/** Returns the username of the currently logged-in user, or null. */
export function getSession(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SESSION_KEY)
}

/** Returns full User object for the active session, or null. */
export function getUser(): User | null {
  const username = getSession()
  if (!username) return null
  const user = getStoredUsers().find(u => u.username === username)
  if (!user) return null
  return { username: user.username, createdAt: user.createdAt }
}
