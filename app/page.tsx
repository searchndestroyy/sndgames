"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { games, categories, getThumbnail, type Game } from "@/lib/games-data"
import {
  Search, X, Maximize2, ChevronLeft, ChevronRight,
  Gamepad2, ArrowRight, ArrowLeft, Film, ShieldAlert,
  ExternalLink, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck,
  Shuffle, Settings, User, LogOut, Monitor, Sun, Moon,
  Flag, Play, Clock, Zap, Home, Compass, Command,
  MessageSquare, Send, Star, Keyboard, Mouse, MonitorPlay,
  AlertCircle
} from "lucide-react"
import { getStoredTheme, setTheme as applyTheme, type Theme } from "@/lib/theme-store"
import { register, login, logout, getSession } from "@/lib/user-store"
import {
  gameKey, getVoteCounts, getUserVotes, vote as castVote,
  getFavorites, toggleFavorite as toggleFav,
  getRecentKeys, addRecent, getRecentGames,
  getPlayStats, recordPlaySession, formatPlaytime,
  type PlayStats, type VoteType
} from "@/lib/game-data-store"
import type { ChatMessage } from "@/app/api/messages/route"

/* ─── Constants ─── */
const GAMES_PER_PAGE = 24
const FEATURED_COUNT = 5
const WELCOME_KEY = "snd_welcomed"

type Tab = "home" | "explore" | "favorites" | "movies" | "settings"
type AccountMode = "login" | "register"

/* ─────────────────── GAME THUMB ─────────────────── */
export function GameThumb({ game }: { game: Game }) {
  const [failed, setFailed] = useState(false)
  const src = getThumbnail(game.url)

  if (!src || failed) {
    const hue = game.title.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: `hsl(${hue}, 70%, 28%)` }}
      >
        <Gamepad2 className="h-7 w-7 text-white/20" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={game.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  )
}

/* ─────────────────── GAME CARD ─────────────────── */
function GameCard({
  game, onPlay, favorites, voteCounts,
}: {
  game: Game
  onPlay: (g: Game) => void
  favorites: string[]
  voteCounts: Record<string, { likes: number; dislikes: number }>
}) {
  const catLabel = categories.find(c => c.id === game.category)?.label ?? game.category
  const key = gameKey(game)
  const isFav = favorites.includes(key)
  const counts = voteCounts[key]

  return (
    <button
      onClick={() => onPlay(game)}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-[#111] text-left transition-all duration-200 hover:bg-[#161616] hover:ring-1 hover:ring-[#ff4d00]/40 focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a0a]">
        <GameThumb game={game} />
        <span className="absolute right-2 top-2 z-10 rounded bg-[#0a0a0a]/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#555]">
          {catLabel}
        </span>
        {isFav && (
          <div className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded bg-[#ff4d00]">
            <Bookmark className="h-3 w-3 fill-white text-white" />
          </div>
        )}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4d00]">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="truncate text-[13px] font-semibold text-[#ccc] transition-colors duration-200 group-hover:text-white">
          {game.title}
        </h3>
        {counts && counts.likes > 0 && (
          <span className="ml-2 shrink-0 text-[10px] font-bold text-[#ff4d00]">
            👍{counts.likes}
          </span>
        )}
      </div>
    </button>
  )
}

/* ─────────────────── FEATURED HERO ─────────────────── */
function FeaturedHero({ game, onPlay }: { game: Game; onPlay: (g: Game) => void }) {
  return (
    <button
      onClick={() => onPlay(game)}
      className="group relative w-full overflow-hidden rounded-xl bg-[#111] text-left transition-all duration-300 hover:ring-1 hover:ring-[#ff4d00]/30 focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
    >
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#0a0a0a]">
        <GameThumb game={game} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <span className="mb-3 inline-block rounded bg-[#ff4d00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
            Featured
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white md:text-4xl">
            {game.title}
          </h2>
          <p className="mt-2 text-sm text-[#666]">Click to play now</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff4d00]">
            <Play className="h-6 w-6 fill-white text-white" />
          </div>
        </div>
      </div>
    </button>
  )
}

/* ─────────────────── PAGINATION ─────────────────── */
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null
  const pages = Array.from({ length: total }, (_, i) => i + 1)
  const range = pages.filter(p => p === 1 || p === total || Math.abs(p - page) <= 2)

  return (
    <div className="flex items-center justify-center gap-1 py-10">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111] text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {range.map((p, i) => {
        const prev = range[i - 1]
        const showDots = prev && p - prev > 1
        return (
          <span key={p} className="flex items-center gap-1">
            {showDots && <span className="px-1 text-[10px] text-[#444]">···</span>}
            <button
              onClick={() => onChange(p)}
              className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2.5 text-xs font-bold transition-all ${
                p === page ? "bg-[#ff4d00] text-white" : "bg-[#111] text-[#666] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              {p}
            </button>
          </span>
        )
      })}
      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111] text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ─────────────────── ONBOARDING ─────────────────── */
function OnboardingModal({ onDone, onThemeChange }: { onDone: () => void; onThemeChange: (t: Theme) => void }) {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<Theme>("dark")

  const pick = (t: Theme) => { setPicked(t); onThemeChange(t) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-sm rounded-xl border border-[#222] bg-[#111] p-8">
        <button
          onClick={onDone}
          className="absolute right-4 top-4 text-xs font-semibold text-[#555] transition-colors hover:text-[#888]"
        >
          skip
        </button>

        {/* Progress dots */}
        <div className="mb-8 flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? "#ff4d00" : "#222" }} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a]">
              <Gamepad2 className="h-7 w-7 text-[#ff4d00]" />
            </div>
            <h2 className="font-display mb-2 text-2xl font-bold text-white">welcome to SND<span className="text-[#ff4d00]">.</span></h2>
            <p className="mb-8 text-sm leading-relaxed text-[#666]">
              free games, no ads, no nonsense. make an account to save favourites, track playtime, and vote on games — totally optional.
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-display mb-2 text-2xl font-bold text-white">how do you like it?</h2>
            <p className="mb-6 text-sm text-[#666]">you can change this later in settings</p>
            <div className="mb-8 flex gap-2">
              {([
                { id: "dark" as const, label: "Dark", Icon: Moon },
                { id: "light" as const, label: "Light", Icon: Sun },
                { id: "system" as const, label: "System", Icon: Monitor },
              ]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => pick(id)}
                  className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 py-4 text-xs font-bold transition-all ${
                    picked === id
                      ? "border-[#ff4d00] bg-[#ff4d00]/10 text-white"
                      : "border-[#222] bg-[#1a1a1a] text-[#666] hover:border-[#333] hover:text-[#aaa]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-6 text-3xl">✅</div>
            <h2 className="font-display mb-2 text-2xl font-bold text-white">you&apos;re in</h2>
            <p className="mb-8 text-sm leading-relaxed text-[#666]">
              hit the user icon to make an account — saves your votes, favourites, and streak. completely optional though.
            </p>
          </>
        )}

        <button
          onClick={() => step < 2 ? setStep(s => s + 1) : onDone()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff4d00] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {step < 2 ? "next" : "start playing"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────── ACCOUNT MODAL ─────────────────── */
function AccountModal({
  onClose, onSuccess, username: currentUser, onLogout,
}: {
  onClose: () => void
  onSuccess: (u: string) => void
  username: string | null
  onLogout: () => void
}) {
  const [mode, setMode] = useState<AccountMode>("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = mode === "register" ? await register(username, password) : await login(username, password)
      if (res.ok) onSuccess(username.trim())
      else setError(res.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="w-full max-w-sm rounded-xl border border-[#222] bg-[#111] p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff4d00] text-2xl font-bold text-white">
              {currentUser[0].toUpperCase()}
            </div>
            <h2 className="font-display mb-1 text-xl font-bold text-white">{currentUser}</h2>
            <p className="mb-6 text-sm text-[#555]">local account</p>
            <button
              onClick={() => { onLogout(); onClose() }}
              className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-semibold text-[#888] transition-colors hover:bg-[#222] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-xl border border-[#222] bg-[#111] p-6">
        <div className="mb-4 flex rounded-lg bg-[#1a1a1a] p-1">
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError("") }}
              className={`flex-1 rounded-md py-1.5 text-sm font-semibold capitalize transition-colors ${
                mode === m ? "bg-[#111] text-white shadow-sm" : "text-[#555] hover:text-[#888]"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#ff4d00]/20 bg-[#ff4d00]/8 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4d00]" />
            <p className="text-xs text-[#ccc]">
              <strong className="text-[#ff4d00]">No account recovery.</strong> Accounts are stored locally on this device. Write down your password.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-800/30 px-3 py-2 text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#555]">Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="gamer_123" autoComplete="username"
              className="w-full rounded-lg border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#444] outline-none transition-colors focus:border-[#ff4d00]/50"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#555]">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete={mode === "register" ? "new-password" : "current-password"}
              className="w-full rounded-lg border border-[#222] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#444] outline-none transition-colors focus:border-[#ff4d00]/50"
              required
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-1 w-full rounded-lg bg-[#ff4d00] py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────── COMMAND PALETTE ─────────────────── */
function CommandPalette({
  onClose, onPlay, onNavigate, onThemeChange,
}: {
  onClose: () => void
  onPlay: (g: Game) => void
  onNavigate: (tab: Tab) => void
  onThemeChange: (t: Theme) => void
}) {
  const [query, setQuery] = useState("")
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return games.filter(g => g.title.toLowerCase().includes(q)).slice(0, 7)
  }, [query])

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setIdx(0) }, [query])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose() }
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
      if (e.key === "Enter" && results[idx]) { e.preventDefault(); onPlay(results[idx]); onClose() }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [results, idx, onClose, onPlay])

  const shortcuts = [
    { label: "Home", Icon: Home, action: () => { onNavigate("home"); onClose() } },
    { label: "Explore", Icon: Compass, action: () => { onNavigate("explore"); onClose() } },
    { label: "Random game", Icon: Shuffle, action: () => { onPlay(games[Math.floor(Math.random() * games.length)]); onClose() } },
    { label: "Dark mode", Icon: Moon, action: () => { onThemeChange("dark"); onClose() } },
    { label: "Light mode", Icon: Sun, action: () => { onThemeChange("light"); onClose() } },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 pt-[15vh] p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[#222] bg-[#111] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[#1a1a1a] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[#555]" />
          <input
            ref={inputRef}
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="search games or type a command..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#444]"
          />
          <kbd className="rounded border border-[#222] bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] font-semibold text-[#444]">esc</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {!query.trim() && (
            <div className="p-2">
              <p className="mb-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#444]">Quick actions</p>
              {shortcuts.map(({ label, Icon, action }) => (
                <button key={label} onClick={action}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                >
                  <Icon className="h-4 w-4 text-[#555]" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="py-10 text-center text-sm text-[#555]">no games found</div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <p className="mb-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#444]">Games</p>
              {results.map((g, i) => (
                <button
                  key={gameKey(g)}
                  onClick={() => { onPlay(g); onClose() }}
                  onMouseEnter={() => setIdx(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    i === idx ? "bg-[#1a1a1a] text-white" : "text-[#888] hover:bg-[#161616]"
                  }`}
                >
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded border border-[#222]">
                    <GameThumb game={g} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{g.title}</p>
                    <p className="text-[11px] text-[#555]">{categories.find(c => c.id === g.category)?.label}</p>
                  </div>
                  {i === idx && <span className="shrink-0 text-[10px] text-[#444]">↵</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── GAME PLAYER ─────────────────── */
function GamePlayer({
  game, onClose, username, userVotes, voteCounts, onVote, favorites, onFavorite, onStatsRefresh,
}: {
  game: Game
  onClose: () => void
  username: string | null
  userVotes: Record<string, VoteType>
  voteCounts: Record<string, { likes: number; dislikes: number }>
  onVote: (g: Game, t: VoteType) => void
  favorites: string[]
  onFavorite: (g: Game) => void
  onStatsRefresh: () => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const startRef = useRef(Date.now())
  const [viewMode, setViewMode] = useState<"default" | "theater">("default")
  const [showControls, setShowControls] = useState(false)
  const [reported, setReported] = useState(false)

  const key = gameKey(game)
  const myVote = userVotes[key]
  const counts = voteCounts[key] ?? { likes: 0, dislikes: 0 }
  const isFav = favorites.includes(key)

  // Track playtime on unmount
  useEffect(() => {
    startRef.current = Date.now()
    return () => {
      const secs = Math.floor((Date.now() - startRef.current) / 1000)
      recordPlaySession(secs, username || "anon")
      onStatsRefresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen()
        else onClose()
      }
      if (e.key.toLowerCase() === "f") iframeRef.current?.requestFullscreen?.()
      if (e.key.toLowerCase() === "t") setViewMode(v => v === "default" ? "theater" : "default")
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])

  const goFullscreen = () => iframeRef.current?.requestFullscreen?.()

  const Header = (
    <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] text-[#666] transition-colors hover:bg-[#222] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="font-display text-sm font-bold text-white">{game.title}</h2>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">Playing Now</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Votes */}
        <div className="hidden items-center gap-1 rounded-lg bg-[#1a1a1a] p-1 sm:flex">
          <button
            onClick={() => onVote(game, "like")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-colors ${
              myVote === "like" ? "bg-[#ff4d00]/20 text-[#ff4d00]" : "text-[#555] hover:bg-[#222] hover:text-[#888]"
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" /> {counts.likes}
          </button>
          <button
            onClick={() => onVote(game, "dislike")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-colors ${
              myVote === "dislike" ? "bg-red-900/30 text-red-400" : "text-[#555] hover:bg-[#222] hover:text-[#888]"
            }`}
          >
            <ThumbsDown className="h-3.5 w-3.5" /> {counts.dislikes}
          </button>
        </div>

        {/* Favorite */}
        <button
          onClick={() => onFavorite(game)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isFav ? "bg-[#ff4d00]/20 text-[#ff4d00]" : "bg-[#1a1a1a] text-[#555] hover:bg-[#222] hover:text-[#888]"
          }`}
          title={isFav ? "Remove favourite" : "Add to favourites"}
        >
          {isFav ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>

        {/* Controls */}
        <button
          onClick={() => setShowControls(v => !v)}
          className="flex h-8 items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 text-xs font-semibold text-[#555] transition-colors hover:bg-[#222] hover:text-white"
        >
          <Keyboard className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Controls</span>
        </button>

        {/* Theater */}
        <button
          onClick={() => setViewMode(v => v === "default" ? "theater" : "default")}
          className="hidden h-8 items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 text-xs font-semibold text-[#555] transition-colors hover:bg-[#222] hover:text-white sm:flex"
        >
          <MonitorPlay className="h-3.5 w-3.5" />
          <span>{viewMode === "theater" ? "Default" : "Theater"}</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={goFullscreen}
          className="flex h-8 items-center gap-2 rounded-lg bg-[#ff4d00]/10 px-3 text-xs font-bold text-[#ff4d00] transition-colors hover:bg-[#ff4d00]/20"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
      </div>
    </div>
  )

  if (viewMode === "theater") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
        {Header}
        {showControls && <ControlsBar />}
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="h-full w-full max-w-5xl overflow-hidden rounded-xl bg-black ring-1 ring-[#222]">
            <iframe ref={iframeRef} src={game.url} title={game.title} className="h-full w-full border-0" allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
          </div>
        </div>
        <ReportBar reported={reported} onReport={() => { setReported(true); setTimeout(() => setReported(false), 3000) }} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
      {Header}
      {showControls && <ControlsBar />}
      <div className="flex-1 bg-black">
        <iframe ref={iframeRef} src={game.url} title={game.title} className="h-full w-full border-0" allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
      </div>
      <ReportBar reported={reported} onReport={() => { setReported(true); setTimeout(() => setReported(false), 3000) }} />
    </div>
  )
}

function ControlsBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-2 text-xs font-semibold text-[#555]">
      {[["WASD / Arrows", "move"], ["Space", "jump"], ["Mouse", "aim/click"], ["F", "fullscreen"], ["T", "theater"], ["Esc", "exit"]].map(([k, v]) => (
        <div key={k} className="flex items-center gap-1.5">
          <kbd className="rounded border border-[#222] bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-[#666]">{k}</kbd>
          <span>{v}</span>
        </div>
      ))}
    </div>
  )
}

function ReportBar({ reported, onReport }: { reported: boolean; onReport: () => void }) {
  return (
    <div className="flex items-center justify-end border-t border-[#1a1a1a] bg-[#0f0f0f] px-4 py-2">
      <button
        onClick={onReport}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#444] transition-colors hover:text-[#ff4d00]"
      >
        <Flag className="h-3.5 w-3.5" />
        {reported ? "reported — thanks" : "report game"}
      </button>
    </div>
  )
}

/* ─────────────────── MOVIES DISCLAIMER ─────────────────── */
function MoviesDisclaimer({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#222] bg-[#111] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#ff4d00]/10">
          <ShieldAlert className="h-7 w-7 text-[#ff4d00]" />
        </div>
        <h2 className="font-display mb-2 text-xl font-bold text-white">Content Disclaimer</h2>
        <p className="mb-6 text-sm leading-relaxed text-[#666]">
          This section uses external APIs that may include mature content (18+). By continuing you confirm you&apos;re of appropriate age.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onAccept} className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#ff4d00] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
            I understand, continue <ExternalLink className="h-4 w-4" />
          </button>
          <button onClick={onDecline} className="py-2.5 text-sm font-semibold text-[#555] transition-colors hover:text-[#888]">go back</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SETTINGS MODAL ─────────────────── */
function SettingsModal({
  onClose, theme, onThemeChange, username, onShowAccount, onLogout, stats,
}: {
  onClose: () => void
  theme: Theme
  onThemeChange: (t: Theme) => void
  username: string | null
  onShowAccount: () => void
  onLogout: () => void
  stats: PlayStats
}) {
  const themes = [
    { id: "system" as const, label: "System", Icon: Monitor },
    { id: "light" as const, label: "Light", Icon: Sun },
    { id: "dark" as const, label: "Dark", Icon: Moon },
  ]

  const hours = Math.floor(stats.totalSeconds / 3600)
  const mins = Math.floor((stats.totalSeconds % 3600) / 60)
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-xl border border-[#222] bg-[#111] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Settings & Stats</h2>
          <button onClick={onClose} className="text-[#555] transition-colors hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#444]">Theme</p>
            <div className="flex gap-2">
              {themes.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onThemeChange(id)}
                  className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 py-3 text-xs font-bold transition-all ${
                    theme === id ? "border-[#ff4d00] bg-[#ff4d00]/10 text-white" : "border-[#222] bg-[#1a1a1a] text-[#555] hover:border-[#333] hover:text-[#888]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Account */}
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#444]">Account</p>
            {username ? (
              <div className="flex items-center justify-between rounded-lg bg-[#1a1a1a] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff4d00] text-sm font-bold text-white">
                    {username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{username}</p>
                    <p className="text-xs text-[#555]">local account</p>
                  </div>
                </div>
                <button onClick={() => { onLogout(); onClose() }} className="flex items-center gap-1.5 text-xs font-semibold text-[#555] transition-colors hover:text-white">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-[#1a1a1a] px-4 py-3">
                <p className="mb-2 text-sm text-[#666]">Sign in to track stats and save favourites.</p>
                <button onClick={() => { onShowAccount(); onClose() }} className="text-sm font-bold text-[#ff4d00] transition-opacity hover:opacity-80">
                  Login / Create Account →
                </button>
              </div>
            )}
          </section>

          {/* Stats */}
          {username && (
            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#444]">Your Stats</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { Icon: Zap, label: "Streak", value: `${stats.streak}d`, color: "text-[#ff4d00]" },
                  { Icon: Clock, label: "Played", value: timeStr, color: "text-blue-400" },
                  { Icon: Gamepad2, label: "Sessions", value: String(stats.gamesPlayed), color: "text-green-400" },
                ].map(({ Icon, label, value, color }) => (
                  <div key={label} className="flex flex-col items-center rounded-lg bg-[#1a1a1a] py-4 text-center">
                    <Icon className={`mb-1.5 h-5 w-5 ${color}`} />
                    <p className="font-display text-lg font-bold text-white">{value}</p>
                    <p className="text-[10px] font-semibold uppercase text-[#444]">{label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── CHAT PANEL ─────────────────── */
function ChatPanel({ username, onClose }: { username: string | null; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [lastTs, setLastTs] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?since=${lastTs}`)
      if (!res.ok) return
      const data = await res.json() as { messages: ChatMessage[] }
      if (data.messages.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMsgs = data.messages.filter(m => !existingIds.has(m.id))
          if (newMsgs.length === 0) return prev
          const merged = [...prev, ...newMsgs].slice(-100)
          setLastTs(merged[merged.length - 1].timestamp)
          return merged
        })
      }
    } catch { /* silently fail */ }
  }, [lastTs])

  // Initial load + poll every 3s
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/messages")
        if (!res.ok) return
        const data = await res.json() as { messages: ChatMessage[] }
        setMessages(data.messages)
        if (data.messages.length > 0) setLastTs(data.messages[data.messages.length - 1].timestamp)
      } catch { /* silently fail */ }
    }
    init()
    const timer = setInterval(fetchMessages, 3000)
    return () => clearInterval(timer)
  }, [fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !username || sending) return
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, text: text.trim() }),
      })
      const data = await res.json() as { ok: boolean; error?: string; message?: ChatMessage }
      if (data.ok && data.message) {
        setMessages(prev => [...prev, data.message!].slice(-100))
        setLastTs(data.message.timestamp)
        setText("")
        inputRef.current?.focus()
      } else {
        setError(data.error || "Failed to send")
      }
    } catch {
      setError("Network error. Try again.")
    } finally {
      setSending(false)
    }
  }

  const fmt = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const hue = (name: string) => name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360

  return (
    <div className="fixed bottom-0 right-0 top-[57px] z-30 flex w-[300px] flex-col border-l border-[#1a1a1a] bg-[#0a0a0a] shadow-2xl md:w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#ff4d00]" />
          <span className="font-display text-sm font-bold text-white">Global Chat</span>
          <span className="flex h-2 w-2 rounded-full bg-green-500" title="Live" />
        </div>
        <button onClick={onClose} className="text-[#555] transition-colors hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-12 text-center">
            <MessageSquare className="mb-3 h-8 w-8 text-[#222]" />
            <p className="text-xs text-[#444]">no messages yet</p>
            <p className="text-xs text-[#333]">be the first to say something</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.username === username ? "flex-row-reverse" : ""}`}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: `hsl(${hue(msg.username)}, 65%, 45%)` }}
            >
              {msg.username[0].toUpperCase()}
            </div>
            <div className={`min-w-0 max-w-[200px] ${msg.username === username ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`flex items-baseline gap-1.5 mb-1 ${msg.username === username ? "flex-row-reverse" : ""}`}>
                <span className="text-[11px] font-bold" style={{ color: `hsl(${hue(msg.username)}, 65%, 60%)` }}>
                  {msg.username}
                </span>
                <span className="text-[10px] text-[#333]">{fmt(msg.timestamp)}</span>
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  msg.username === username
                    ? "bg-[#ff4d00]/20 text-[#ccc]"
                    : "bg-[#161616] text-[#bbb]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#1a1a1a] p-3">
        {!username ? (
          <p className="text-center text-xs text-[#444]">
            <span className="font-semibold text-[#ff4d00]">Sign in</span> to send messages
          </p>
        ) : (
          <>
            {error && <p className="mb-2 text-[11px] text-[#ff4d00]">{error}</p>}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={e => { setText(e.target.value); setError("") }}
                placeholder="say something..."
                maxLength={280}
                className="flex-1 min-w-0 rounded-lg border border-[#222] bg-[#111] px-3 py-2 text-xs text-white placeholder-[#444] outline-none focus:border-[#ff4d00]/40"
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ff4d00] text-white transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <p className="mt-1.5 text-right text-[10px] text-[#333]">{text.length}/280</p>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function SndGames() {
  /* ── Core state ── */
  const [tab, setTab] = useState<Tab>("home")
  const [theme, setThemeState] = useState<Theme>("dark")
  const [username, setUsername] = useState<string | null>(null)

  /* ── Modal / overlay state ── */
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showMoviesDisclaimer, setShowMoviesDisclaimer] = useState(false)
  const [moviesAccepted, setMoviesAccepted] = useState(false)

  /* ── Search ── */
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  /* ── Games ── */
  const [category, setCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [playing, setPlaying] = useState<Game | null>(null)
  const [featuredIdx, setFeaturedIdx] = useState(0)

  /* ── User data ── */
  const [userVotes, setUserVotes] = useState<Record<string, VoteType>>({})
  const [voteCounts, setVoteCounts] = useState<Record<string, { likes: number; dislikes: number }>>({})
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentKeys, setRecentKeys] = useState<string[]>([])
  const [playStats, setPlayStats] = useState<PlayStats>({ totalSeconds: 0, gamesPlayed: 0, lastPlayedDate: "", streak: 0 })

  const identifier = username || "anon"
  const featured = useMemo(() => games.slice(0, FEATURED_COUNT), [])

  /* ── Init ── */
  useEffect(() => {
    const t = getStoredTheme()
    setThemeState(t)
    const session = getSession()
    if (session) setUsername(session)
    if (!localStorage.getItem(WELCOME_KEY)) setShowOnboarding(true)
    setVoteCounts(getVoteCounts())
    setRecentKeys(getRecentKeys())
  }, [])

  useEffect(() => {
    setUserVotes(getUserVotes(identifier))
    setFavorites(getFavorites(identifier))
    setPlayStats(getPlayStats(identifier))
  }, [identifier])

  useEffect(() => {
    const t = setInterval(() => setFeaturedIdx(i => (i + 1) % FEATURED_COUNT), 6000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowPalette(p => !p) }
      if (e.key === "/" && !playing) { e.preventDefault(); setSearchOpen(true) }
      if ((e.key === "r" || e.key === "R") && !playing) handleRandom()
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  /* ── Actions ── */
  const handleThemeChange = useCallback((t: Theme) => {
    setThemeState(t)
    applyTheme(t)
  }, [])

  const handlePlay = useCallback((g: Game) => {
    setPlaying(g)
    addRecent(g)
    setRecentKeys(getRecentKeys())
  }, [])

  const handleRandom = useCallback(() => {
    handlePlay(games[Math.floor(Math.random() * games.length)])
  }, [handlePlay])

  const handleVote = useCallback((game: Game, type: VoteType) => {
    castVote(game, type, identifier)
    setUserVotes(getUserVotes(identifier))
    setVoteCounts(getVoteCounts())
  }, [identifier])

  const handleFavorite = useCallback((game: Game) => {
    toggleFav(game, identifier)
    setFavorites(getFavorites(identifier))
  }, [identifier])

  const handleLogout = useCallback(() => {
    logout()
    setUsername(null)
  }, [])

  const handleAccountSuccess = useCallback((u: string) => {
    setUsername(u.trim())
    setShowAccount(false)
  }, [])

  const handleStatsRefresh = useCallback(() => {
    setPlayStats(getPlayStats(identifier))
  }, [identifier])

  /* ── Filtered games ── */
  const filtered = useMemo(() => {
    let list = games
    if (category !== "all") list = list.filter(g => g.category === category)
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(g => g.title.toLowerCase().includes(q)) }
    return list
  }, [category, search])

  const totalPages = Math.ceil(filtered.length / GAMES_PER_PAGE)
  const pageGames = filtered.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE)

  const recentGames = useMemo(() =>
    recentKeys.map(k => games.find(g => gameKey(g) === k)).filter(Boolean).slice(0, 8) as Game[],
    [recentKeys]
  )

  const favGames = useMemo(() =>
    favorites.map(k => games.find(g => gameKey(g) === k)).filter(Boolean) as Game[],
    [favorites]
  )

  const navTabs: { id: Tab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "explore", label: "Explore" },
    { id: "favorites", label: `Favs${favorites.length > 0 ? ` (${favorites.length})` : ""}` },
    { id: "movies", label: "Movies" },
  ]

  return (
    <div className={`relative min-h-screen bg-[#0a0a0a] text-[#e5e5e5] ${showChat ? "mr-[300px] md:mr-[320px]" : ""}`}>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="mx-auto flex h-[57px] max-w-[1400px] items-stretch justify-between px-5 md:px-8">
          {/* Logo + Tabs */}
          <div className="flex items-stretch gap-6">
            <button
              onClick={() => setTab("home")}
              className="flex items-center self-center font-display text-lg font-bold tracking-tight text-white"
            >
              SND<span className="text-[#ff4d00]">.</span>
            </button>

            <nav className="flex items-stretch gap-1">
              {navTabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === "movies") {
                      if (!moviesAccepted) setShowMoviesDisclaimer(true)
                      else setTab("movies")
                    } else {
                      setTab(t.id)
                      if (t.id !== "explore") { setCategory("all"); setPage(1) }
                    }
                  }}
                  className={`relative px-3 text-sm font-semibold transition-colors duration-200 ${
                    tab === t.id ? "text-white" : "text-[#555] hover:text-[#888]"
                  }`}
                >
                  {t.label}
                  {tab === t.id && (
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#ff4d00]" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {searchOpen ? (
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-[#555]" />
                <input
                  ref={searchRef} type="text" value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); if (e.target.value) setTab("explore") }}
                  onBlur={() => { if (!search) setSearchOpen(false) }}
                  placeholder="Search games..."
                  className="h-8 w-44 rounded-lg border border-[#222] bg-[#111] pl-9 pr-8 text-sm text-white placeholder-[#444] outline-none transition-all focus:border-[#ff4d00]/40 focus:w-56"
                />
                {search && (
                  <button onClick={() => { setSearch(""); searchRef.current?.focus() }} className="absolute right-2.5 text-[#555] hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-[#161616] hover:text-white" title="Search (/)">
                <Search className="h-4 w-4" />
              </button>
            )}

            <button onClick={() => setShowPalette(true)} className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg px-2 text-[#555] transition-colors hover:bg-[#161616] hover:text-white" title="Command palette (Ctrl+K)">
              <Command className="h-4 w-4" />
              <span className="text-xs font-semibold">K</span>
            </button>

            <button onClick={handleRandom} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-[#161616] hover:text-white" title="Random game (R)">
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowChat(v => !v)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${showChat ? "bg-[#ff4d00]/20 text-[#ff4d00]" : "text-[#555] hover:bg-[#161616] hover:text-white"}`}
              title="Global chat"
            >
              <MessageSquare className="h-4 w-4" />
            </button>

            <button onClick={() => setShowSettings(true)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-[#161616] hover:text-white" title="Settings">
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowAccount(true)}
              className={`flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-bold transition-colors ${
                username ? "bg-[#ff4d00]/15 text-[#ff4d00] hover:bg-[#ff4d00]/25" : "bg-[#161616] text-[#555] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{username || "Sign In"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="mx-auto max-w-[1400px] px-5 md:px-8">

        {/* HOME */}
        {tab === "home" && (
          <div className="py-8">
            {/* Featured */}
            <section className="mb-10">
              <FeaturedHero game={featured[featuredIdx]} onPlay={handlePlay} />
              <div className="mt-4 flex items-center justify-center gap-2">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeaturedIdx(i)}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ width: i === featuredIdx ? 28 : 8, background: i === featuredIdx ? "#ff4d00" : "#222" }}
                  />
                ))}
              </div>
            </section>

            {/* Recently Played */}
            {recentGames.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#555]">Recently Played</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {recentGames.map(g => (
                    <button
                      key={gameKey(g)}
                      onClick={() => handlePlay(g)}
                      className="group shrink-0 overflow-hidden rounded-lg bg-[#111] text-left transition-all hover:bg-[#161616] hover:ring-1 hover:ring-[#ff4d00]/30"
                      style={{ width: 140 }}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0a]">
                        <GameThumb game={g} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play className="h-5 w-5 fill-white text-white" />
                        </div>
                      </div>
                      <p className="truncate px-3 py-2 text-[11px] font-semibold text-[#888] transition-colors group-hover:text-white">{g.title}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Quick stats */}
            <section className="mb-10 flex flex-wrap items-center justify-center gap-8 border-y border-[#1a1a1a] py-6">
              {[
                { label: "Games", value: String(games.length) },
                { label: "Categories", value: String(categories.length - 1) },
                { label: "Free", value: "100%" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-[#444]">{s.label}</p>
                </div>
              ))}
            </section>

            {/* Categories */}
            <section className="mb-10">
              <h2 className="font-display mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#555]">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c.id !== "all").map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.id); setPage(1); setTab("explore") }}
                    className="rounded-lg border border-[#222] bg-[#111] px-4 py-2 text-sm font-medium text-[#666] transition-all hover:border-[#ff4d00]/30 hover:text-white"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Popular */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#555]">Popular Games</h2>
                <button onClick={() => setTab("explore")} className="flex items-center gap-1.5 text-sm font-bold text-[#ff4d00] transition-opacity hover:opacity-80">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {games.slice(0, 12).map(g => (
                  <GameCard key={gameKey(g)} game={g} onPlay={handlePlay} favorites={favorites} voteCounts={voteCounts} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* EXPLORE */}
        {tab === "explore" && (
          <div className="py-8">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <div className="flex flex-1 flex-wrap gap-1.5">
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.id); setPage(1) }}
                    className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                      category === c.id ? "bg-[#ff4d00] text-white" : "bg-[#111] text-[#666] hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <span className="shrink-0 text-xs font-semibold text-[#444]">{filtered.length} games</span>
            </div>

            {pageGames.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {pageGames.map(g => (
                  <GameCard key={gameKey(g)} game={g} onPlay={handlePlay} favorites={favorites} voteCounts={voteCounts} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#1a1a1a] py-24">
                <Gamepad2 className="mb-4 h-10 w-10 text-[#222]" />
                <p className="text-sm text-[#555]">No games found</p>
                <button onClick={() => { setSearch(""); setCategory("all") }} className="mt-3 text-sm font-bold text-[#ff4d00] hover:opacity-80">
                  Clear filters
                </button>
              </div>
            )}

            <Pagination page={page} total={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0 }) }} />
          </div>
        )}

        {/* FAVORITES */}
        {tab === "favorites" && (
          <div className="py-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold text-white">Favourites</h1>
              <span className="text-sm text-[#444]">{favGames.length} game{favGames.length !== 1 ? "s" : ""}</span>
            </div>
            {favGames.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {favGames.map(g => (
                  <GameCard key={gameKey(g)} game={g} onPlay={handlePlay} favorites={favorites} voteCounts={voteCounts} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#1a1a1a] py-24 text-center">
                <Star className="mb-4 h-10 w-10 text-[#222]" />
                <p className="text-sm text-[#555]">No favourites yet</p>
                <p className="mt-1 text-xs text-[#333]">open any game and hit ★ to save it here</p>
              </div>
            )}
          </div>
        )}

        {/* MOVIES */}
        {tab === "movies" && moviesAccepted && (
          <div className="py-8">
            <div className="overflow-hidden rounded-xl border border-[#1a1a1a]">
              <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#0f0f0f] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-[#ff4d00]" />
                  <span className="font-display text-sm font-bold text-white">QMovies</span>
                </div>
                <a href="https://qmovies.lovable.app" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#555] transition-colors hover:text-[#ff4d00]">
                  Open directly <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <iframe src="https://qmovies.lovable.app" title="QMovies" className="w-full border-0"
                style={{ height: "calc(100vh - 200px)" }} allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox" />
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-6 md:px-8">
          <p className="text-xs text-[#333]">
            <span className="font-display font-bold text-[#555]">SND<span className="text-[#ff4d00]">.</span></span>
            {" "}— free games, always.
          </p>
          <div className="flex items-center gap-5">
            <a href="/credits" className="text-xs text-[#333] transition-colors hover:text-[#666]">Credits</a>
          </div>
        </div>
      </footer>

      {/* ─── Overlays ─── */}
      {playing && (
        <GamePlayer
          game={playing}
          onClose={() => setPlaying(null)}
          username={username}
          userVotes={userVotes}
          voteCounts={voteCounts}
          onVote={handleVote}
          favorites={favorites}
          onFavorite={handleFavorite}
          onStatsRefresh={handleStatsRefresh}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          onDone={() => { localStorage.setItem(WELCOME_KEY, "1"); setShowOnboarding(false) }}
          onThemeChange={handleThemeChange}
        />
      )}

      {showAccount && (
        <AccountModal
          onClose={() => setShowAccount(false)}
          onSuccess={handleAccountSuccess}
          username={username}
          onLogout={handleLogout}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          theme={theme}
          onThemeChange={handleThemeChange}
          username={username}
          onShowAccount={() => { setShowSettings(false); setShowAccount(true) }}
          onLogout={handleLogout}
          stats={playStats}
        />
      )}

      {showPalette && (
        <CommandPalette
          onClose={() => setShowPalette(false)}
          onPlay={g => { handlePlay(g); setShowPalette(false) }}
          onNavigate={t => { setTab(t); setShowPalette(false) }}
          onThemeChange={t => { handleThemeChange(t); setShowPalette(false) }}
        />
      )}

      {showMoviesDisclaimer && (
        <MoviesDisclaimer
          onAccept={() => { setShowMoviesDisclaimer(false); setMoviesAccepted(true); setTab("movies") }}
          onDecline={() => setShowMoviesDisclaimer(false)}
        />
      )}

      {/* Chat panel */}
      {showChat && <ChatPanel username={username} onClose={() => setShowChat(false)} />}
    </div>
  )
}
