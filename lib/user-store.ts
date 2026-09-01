/**
 * User account system — now uses API backend.
 */

export type User = {
  username: string
  createdAt: number
  bio?: string
}

const SESSION_KEY = 'snd_session'

// ─── Public API ─────────────────────────────────────────────────────────────

export async function register(
  username: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.ok) {
      localStorage.setItem(SESSION_KEY, username.trim())
      return { ok: true }
    }
    return { ok: false, error: data.error || 'Registration failed' }
  } catch (err) {
    return { ok: false, error: 'Network error' }
  }
}

export async function login(
  username: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.ok) {
      localStorage.setItem(SESSION_KEY, username.trim())
      return { ok: true }
    }
    return { ok: false, error: data.error || 'Login failed' }
  } catch (err) {
    return { ok: false, error: 'Network error' }
  }
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

export async function fetchUser(username: string): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(username)}`)
    const data = await res.json()
    return data
  } catch (err) {
    return { ok: false, error: 'Network error' }
  }
}

export async function updateBio(username: string, bio: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio })
    })
    const data = await res.json()
    return data
  } catch (err) {
    return { ok: false, error: 'Network error' }
  }
}
