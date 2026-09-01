import { NextRequest, NextResponse } from 'next/server'
import { getUsers, saveUsers, hashPassword } from '@/lib/users-db'

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 })
  }

  const { username, password } = body

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return NextResponse.json({ ok: false, error: 'Username must be at least 3 characters' }, { status: 400 })
  }
  if (username.length > 20) {
    return NextResponse.json({ ok: false, error: 'Username must be 20 characters or fewer' }, { status: 400 })
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    return NextResponse.json({ ok: false, error: 'Only letters, numbers, and underscores allowed' }, { status: 400 })
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const users = getUsers()
  if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return NextResponse.json({ ok: false, error: 'That username is already taken' }, { status: 409 })
  }

  const hash = await hashPassword(username.trim(), password)
  users.push({ username: username.trim(), hash, createdAt: Date.now() })
  saveUsers(users)

  return NextResponse.json({ ok: true })
}
