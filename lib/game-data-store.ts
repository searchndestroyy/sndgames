/**
 * Game-related user data: votes (likes/dislikes), favorites,
 * recently played, and playtime/streaks — all stored in localStorage.
 */

import type { Game } from './games-data'

// ─── Types ──────────────────────────────────────────────────────────────────

export type VoteType = 'like' | 'dislike'

export type VoteCounts = { likes: number; dislikes: number }

export type PlayStats = {
  totalSeconds: number
  gamesPlayed: number
  lastPlayedDate: string // 'YYYY-MM-DD'
  streak: number        // consecutive days played
}

// ─── Key helpers ─────────────────────────────────────────────────────────────

/** Stable, URL-safe key derived from game title. */
export function gameKey(game: Game): string {
  return game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Votes (global vote counts + per-user votes) ─────────────────────────────

const VOTE_COUNTS_KEY = 'snd_vote_counts'

export function getVoteCounts(): Record<string, VoteCounts> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(VOTE_COUNTS_KEY) || '{}') } catch { return {} }
}

function saveVoteCounts(counts: Record<string, VoteCounts>): void {
  localStorage.setItem(VOTE_COUNTS_KEY, JSON.stringify(counts))
}

function userVotesKey(identifier: string) { return `snd_votes_${identifier}` }

export function getUserVotes(identifier: string): Record<string, VoteType> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(userVotesKey(identifier)) || '{}') } catch { return {} }
}

/** Toggle or switch a like/dislike vote. */
export function vote(game: Game, type: VoteType, identifier: string): void {
  const key = gameKey(game)
  const userVotes = getUserVotes(identifier)
  const counts = getVoteCounts()
  const current: VoteCounts = counts[key] ?? { likes: 0, dislikes: 0 }
  const prev = userVotes[key]

  // Undo the previous vote
  if (prev === 'like')    current.likes    = Math.max(0, current.likes    - 1)
  if (prev === 'dislike') current.dislikes = Math.max(0, current.dislikes - 1)

  if (prev === type) {
    // Same button clicked again → toggle off
    delete userVotes[key]
  } else {
    // New vote or switching sides
    userVotes[key] = type
    if (type === 'like') current.likes++
    else                 current.dislikes++
  }

  counts[key] = current
  localStorage.setItem(userVotesKey(identifier), JSON.stringify(userVotes))
  saveVoteCounts(counts)
}

// ─── Favorites ───────────────────────────────────────────────────────────────

function favsKey(identifier: string) { return `snd_favs_${identifier}` }

export function getFavorites(identifier: string): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(favsKey(identifier)) || '[]') } catch { return [] }
}

/** Returns true if the game was just added (false = was removed). */
export function toggleFavorite(game: Game, identifier: string): boolean {
  const key = gameKey(game)
  const favs = getFavorites(identifier)
  const idx = favs.indexOf(key)
  if (idx === -1) favs.unshift(key)   // add at front
  else            favs.splice(idx, 1) // remove
  localStorage.setItem(favsKey(identifier), JSON.stringify(favs))
  return idx === -1
}

// ─── Recently Played (not per-user, shared on device) ─────────────────────────

const RECENT_KEY = 'snd_recent'

export function getRecentKeys(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}

export function addRecent(game: Game): void {
  const key = gameKey(game)
  const recent = getRecentKeys().filter(k => k !== key)
  recent.unshift(key)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 12)))
}

export function getRecentGames(allGames: Game[]): Game[] {
  return getRecentKeys()
    .map(k => allGames.find(g => gameKey(g) === k))
    .filter((g): g is Game => Boolean(g))
}

// ─── Playtime & Streaks ───────────────────────────────────────────────────────

function statsKey(identifier: string) { return `snd_stats_${identifier}` }

const EMPTY_STATS: PlayStats = { totalSeconds: 0, gamesPlayed: 0, lastPlayedDate: '', streak: 0 }

export function getPlayStats(identifier: string = 'anon'): PlayStats {
  if (typeof window === 'undefined') return { ...EMPTY_STATS }
  try {
    return JSON.parse(localStorage.getItem(statsKey(identifier)) || 'null') || { ...EMPTY_STATS }
  } catch {
    return { ...EMPTY_STATS }
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function prevDayStr(d: string): string {
  const dt = new Date(d)
  dt.setDate(dt.getDate() - 1)
  return dt.toISOString().slice(0, 10)
}

/** Call when a game session ends; seconds = time spent in the player. */
export function recordPlaySession(seconds: number, identifier: string = 'anon'): void {
  if (seconds < 5) return // ignore accidental opens
  const stats = getPlayStats(identifier)
  const today = todayStr()

  stats.totalSeconds += seconds
  stats.gamesPlayed  += 1

  if (!stats.lastPlayedDate || stats.lastPlayedDate === today) {
    // First time or already played today — streak stays the same (or initialised to 1)
    if (!stats.lastPlayedDate) stats.streak = 1
  } else if (stats.lastPlayedDate === prevDayStr(today)) {
    // Played yesterday → extend streak
    stats.streak = (stats.streak || 0) + 1
  } else {
    // Gap in days → reset streak
    stats.streak = 1
  }

  stats.lastPlayedDate = today
  localStorage.setItem(statsKey(identifier), JSON.stringify(stats))
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function formatPlaytime(seconds: number): string {
  if (seconds === 0) return '0m'
  if (seconds < 60)   return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
