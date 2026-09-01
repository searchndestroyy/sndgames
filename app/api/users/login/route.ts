import { NextRequest, NextResponse } from 'next/server'
import { getUser, hashPassword } from '@/lib/users-db'

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 })
  }

  const { username, password } = body

  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json({ ok: false, error: 'Username and password required.' }, { status: 400 })
  }

  const user = getUser(username.trim())
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 })
  }

  const hash = await hashPassword(user.username, password)
  if (hash !== user.hash) {
    return NextResponse.json({ ok: false, error: 'Wrong password' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
