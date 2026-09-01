/**
 * Global chat messages API — in-memory store.
 *
 * In development this persists for the lifetime of the dev server.
 * On Vercel / other serverless platforms messages persist per warm
 * function instance — perfectly fine for a casual gaming-site chat.
 * For full persistence, swap the `globalStore` lines for Vercel KV /
 * Upstash / any key-value service.
 */

import { NextRequest, NextResponse } from 'next/server'
import { filterMessage } from '@/lib/message-filter'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string
  username: string
  text: string
  timestamp: number
}

// ─── In-memory store (survives hot-reload & across requests) ─────────────────

// eslint-disable-next-line no-var
declare global { var _sndMessages: ChatMessage[]; var _sndRateMap: Map<string, number[]> }
globalThis._sndMessages ??= []
globalThis._sndRateMap  ??= new Map()

const MAX_STORED   = 120  // keep latest N messages
const MAX_PER_MIN  = 8    // max sends per 60 s per user
const MIN_INTERVAL = 2000 // ms between sends for one user

// ─── Rate limiting ───────────────────────────────────────────────────────────

function isRateLimited(username: string): boolean {
  const now   = Date.now()
  const times = globalThis._sndRateMap.get(username) ?? []

  // Remove timestamps older than 60 s
  const recent = times.filter(t => now - t < 60_000)

  // Minimum interval between any two messages
  if (recent.length > 0 && now - recent[recent.length - 1] < MIN_INTERVAL) return true

  // Per-minute cap
  if (recent.length >= MAX_PER_MIN) return true

  recent.push(now)
  globalThis._sndRateMap.set(username, recent)
  return false
}

// ─── GET — fetch latest messages ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Optional ?since= param to fetch only messages after a timestamp
  const since = Number(req.nextUrl.searchParams.get('since') ?? 0)
  const messages = globalThis._sndMessages.filter(m => m.timestamp > since)

  return NextResponse.json({ messages }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

// ─── POST — send a message ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 })
  }

  const { username, text } = body as { username?: string; text?: string }

  // Validate username
  if (
    typeof username !== 'string' ||
    username.length < 3 ||
    username.length > 20 ||
    !/^[a-zA-Z0-9_]+$/.test(username)
  ) {
    return NextResponse.json({ ok: false, error: 'Invalid username.' }, { status: 400 })
  }

  if (typeof text !== 'string') {
    return NextResponse.json({ ok: false, error: 'Message text is required.' }, { status: 400 })
  }

  // Content filter
  const filtered = filterMessage(text)
  if (!filtered.ok) {
    return NextResponse.json({ ok: false, error: filtered.reason }, { status: 422 })
  }

  // Rate limiting
  if (isRateLimited(username)) {
    return NextResponse.json({ ok: false, error: 'Slow down — you\'re sending messages too fast.' }, { status: 429 })
  }

  // Build & store message
  const message: ChatMessage = {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    username,
    text:      filtered.text,
    timestamp: Date.now(),
  }

  globalThis._sndMessages.push(message)

  // Keep store trimmed
  if (globalThis._sndMessages.length > MAX_STORED) {
    globalThis._sndMessages = globalThis._sndMessages.slice(-MAX_STORED)
  }

  return NextResponse.json({ ok: true, message }, { status: 201 })
}
