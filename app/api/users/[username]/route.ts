import { NextRequest, NextResponse } from 'next/server'
import { getUser, updateUser } from '@/lib/users-db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  
  const user = getUser(username)
  if (!user) {
    return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
  }

  // Return public info
  return NextResponse.json({
    ok: true,
    user: {
      username: user.username,
      createdAt: user.createdAt,
      bio: user.bio || ''
    }
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  
  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 })
  }

  const { bio } = body

  if (typeof bio !== 'string') {
    return NextResponse.json({ ok: false, error: 'Bio must be a string' }, { status: 400 })
  }

  if (bio.length > 1000) {
    return NextResponse.json({ ok: false, error: 'Bio cannot exceed 1000 characters' }, { status: 400 })
  }

  const user = getUser(username)
  if (!user) {
    return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
  }

  updateUser(username, { bio })

  return NextResponse.json({ ok: true })
}
