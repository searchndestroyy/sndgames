import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const gamesFolder = path.join(process.cwd(), 'games')
  
  // Create games folder if it doesn't exist
  if (!existsSync(gamesFolder)) {
    mkdirSync(gamesFolder, { recursive: true })
    return NextResponse.json([])
  }
  
  const folders = readdirSync(gamesFolder)
    .filter(item => {
      const itemPath = path.join(gamesFolder, item)
      return statSync(itemPath).isDirectory()
    })
    .sort()
  
  const folderData = []
  
  for (const folder of folders) {
    const folderPath = path.join(gamesFolder, folder)
    const gameJsonPath = path.join(folderPath, 'game.json')
    const items = readdirSync(folderPath)
    let gameCount = 0
    
    // Count games in folder
    for (const item of items) {
      const itemPath = path.join(folderPath, item)
      const stats = statSync(itemPath)
      
      if (stats.isFile() && item === 'game.json') {
        gameCount = 1
        break
      } else if (stats.isDirectory()) {
        const subGameJsonPath = path.join(itemPath, 'game.json')
        if (existsSync(subGameJsonPath)) {
          gameCount++
        }
      }
    }
    
    let folderTitle = folder.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    let description = `${gameCount} ${gameCount === 1 ? 'game' : 'games'}`
    
    // Try to get title from game.json if single game
    if (gameCount === 1 && existsSync(gameJsonPath)) {
      try {
        const gameData = JSON.parse(readFileSync(gameJsonPath, 'utf8'))
        folderTitle = gameData.title || folderTitle
        description = gameData.description || description
      } catch (error) {
        console.error(`Error reading ${gameJsonPath}:`, error)
      }
    }
    
    folderData.push({
      title: folderTitle,
      slug: folder,
      description: description,
      gameCount: gameCount,
      category: 'editors-choice'
    })
  }
  
  return NextResponse.json(folderData)
}
