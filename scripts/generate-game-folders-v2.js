const fs = require('fs');
const path = require('path');
const { games } = require('../lib/games-data.js');

const GAMES_DIR = path.join(__dirname, 'public', 'games');

// Ensure games directory exists
if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR, { recursive: true });
}

// Generate game folders
games.forEach((game, index) => {
  // Generate folder name using the same logic as getThumbnail
  const getFolderName = (url) => {
    // For specific games with custom thumbnails
    if (url.includes("selenite1.freetls.fastly.net/resources/semag/gtavc")) {
      return "gta-vice-city";
    }
    if (url.includes("play2048.co")) {
      return "2048";
    }
    if (url === "https://1v1.lol" || (url.includes("1v1.lol") && !url.includes("sky-riders"))) {
      return "1v1lol";
    }
    if (url.includes("krunker.io")) {
      return "krunkerio";
    }
    if (url.includes("sky-riders-buk")) {
      return "sky-riders";
    }
    
    // For CrazyGames URLs, use the slug as folder name
    const slug = getSlug(url);
    if (slug) {
      return slug;
    }
    
    // For other URLs, create a folder name from the domain
    try {
      const u = new URL(url);
      return u.hostname.replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '');
    } catch {
      return "unknown";
    }
  };
  
  const getSlug = (url) => {
    const patterns = [
      /crazygames\.com\/embed\/([^\/]+)/,
      /crazygames\.com\/game\/([^\/]+)/,
      /crazygames\.com\/([^\/]+)/,
      /onlinegames\.io\/games\/\d+\/[^\/]+\/([^\/]+)/,
      /unblocked-games\.s3\.amazonaws\.com\/([^\/]+)\.html/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };
  
  const folderName = getFolderName(game.url);
  const gameFolder = path.join(GAMES_DIR, folderName);
  
  // Create folder if it doesn't exist
  if (!fs.existsSync(gameFolder)) {
    fs.mkdirSync(gameFolder, { recursive: true });
    console.log(`Created folder: ${folderName}`);
  }
  
  // Create game.json file
  const gameData = {
    title: game.title,
    url: game.url,
    category: game.category,
    folderName: folderName
  };
  
  const jsonPath = path.join(gameFolder, 'game.json');
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify(gameData, null, 2));
    console.log(`Created game.json for: ${game.title}`);
  }
  
  // Create placeholder thumbnail if it doesn't exist
  const thumbnailPath = path.join(gameFolder, 'thumbnail.png');
  if (!fs.existsSync(thumbnailPath)) {
    // Generate a simple placeholder using canvas or just create an empty file
    // For now, we'll create a 1x1 transparent PNG as placeholder
    const placeholderPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(thumbnailPath, placeholderPNG);
    console.log(`Created placeholder thumbnail for: ${game.title}`);
  }
});

console.log(`Generated folders for ${games.length} games in ${GAMES_DIR}`);
