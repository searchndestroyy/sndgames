'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Gamepad2, Play } from 'lucide-react'
import { GameThumb } from '@/app/page'

interface FolderGame {
  title: string
  url: string
  description?: string
  thumbnail?: string
}

export default function FolderPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [games, setGames] = useState<FolderGame[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<FolderGame | null>(null)

  useEffect(() => {
    fetch(`/api/folder/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        setGames(data.games || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load folder:', err)
        setLoading(false)
      })
  }, [params.slug])

  const handlePlay = (game: FolderGame) => {
    setPlaying(game)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030308] flex items-center justify-center">
        <div className="text-white">Loading folder...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030308]">
      {/* Header */}
      <header className="header-glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[#a78bfa] hover:text-[#b8a5fa] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.15)] shadow-[0_0_25px_rgba(139,92,246,0.2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] via-[#8b5cf6] to-[#3b82f6] opacity-20"></div>
                <Gamepad2 className="relative h-5 w-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '800', letterSpacing: '0.05em' }}>
                  {params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-[#6b6b80]" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.2em' }}>
                  {games.length} {games.length === 1 ? 'Game' : 'Games'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-6 md:px-6">
        {games.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center rounded-2xl py-20">
            <Gamepad2 className="mb-4 h-12 w-12 text-[rgba(139,92,246,0.2)]" />
            <p className="text-sm text-[#6b6b80]">No games found in this folder</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {games.map((game, index) => (
              <button
                key={index}
                onClick={() => handlePlay(game)}
                className="glass-card group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-[rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:scale-105"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                  <GameThumb game={{ title: game.title, url: game.url, category: 'folder' }} />
                </div>
                <div className="mt-2 text-center">
                  <h3 className="text-xs font-medium text-[#e4e4f0] line-clamp-2">{game.title}</h3>
                </div>
                <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(139,92,246,0.2)] opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-4 w-4 text-[#8b5cf6]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Game Player Modal */}
      {playing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative mx-4 max-w-6xl w-full rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#030308] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
            <button
              onClick={() => setPlaying(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.1)] text-[#6b6b80] transition-colors hover:bg-[rgba(255,255,255,0.2)] hover:text-white"
            >
              ×
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={playing.url}
                className="h-full w-full rounded-t-2xl"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-bold text-white">{playing.title}</h2>
              {playing.description && (
                <p className="mt-2 text-sm text-[#6b6b80]">{playing.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
