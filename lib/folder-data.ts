import { Game } from './games-data'

export interface Folder {
  id: string
  name: string
  games: Game[]
  isExpanded?: boolean
}

// Sample folder data - in real implementation, this would come from your data source
export const folderData: Folder[] = [
  {
    id: 'slope-games',
    name: 'Slope Games',
    isExpanded: false,
    games: [
      { title: 'Slope', url: 'https://example.com/slope', category: 'arcade' },
      { title: 'Slope 2', url: 'https://example.com/slope2', category: 'arcade' },
      { title: 'Slope 3', url: 'https://example.com/slope3', category: 'arcade' }
    ]
  }
]

export function getGamesWithFolders(): (Game | Folder)[] {
  // Mix standalone games with folders
  const standaloneGames = [
    { title: 'GTA Vice City', url: 'https://example.com/gta', category: 'arcade' },
    { title: 'Moto Racing', url: 'https://example.com/moto', category: 'racing' }
  ]
  
  return [...folderData, ...standaloneGames]
}
