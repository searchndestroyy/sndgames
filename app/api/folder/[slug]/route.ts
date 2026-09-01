import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const folderPath = path.join(process.cwd(), 'games', params.slug)
  
  if (!existsSync(folderPath)) {
    return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
  }
  
  const items = readdirSync(folderPath)
  const games = []
  
  for (const item of items) {
    const itemPath = path.join(folderPath, item)
    const stats = statSync(itemPath)
    
    if (stats.isFile() && item === 'game.json') {
      // Single game in folder
      try {
        const gameData = JSON.parse(readFileSync(itemPath, 'utf8'))
        games.push({
          title: gameData.title || params.slug,
          url: gameData.url || `#${params.slug}`,
          description: gameData.description,
          thumbnail: gameData.thumbnail
        })
      } catch (error) {
        console.error(`Error reading ${itemPath}:`, error)
      }
    } else if (stats.isDirectory()) {
      // Subfolder with game.json
      const gameJsonPath = path.join(itemPath, 'game.json')
      if (existsSync(gameJsonPath)) {
        try {
          const gameData = JSON.parse(readFileSync(gameJsonPath, 'utf8'))
          games.push({
            title: gameData.title || item,
            url: gameData.url || `#${params.slug}/${item}`,
            description: gameData.description,
            thumbnail: gameData.thumbnail
          })
        } catch (error) {
          console.error(`Error reading ${gameJsonPath}:`, error)
        }
      }
    }
  }
  
  return NextResponse.json({ games })
}
