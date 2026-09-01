const fs = require('fs');
const path = require('path');

// Games that have CrazyGames URLs we can download thumbnails for
const games = [
  { folder: 'moto-x3m', cgName: 'moto-x3m' },
  { folder: 'krunkerio', cgName: 'krunker' },
  { folder: 'slitherio', cgName: 'slither-io' },
  { folder: 'agar-io', cgName: 'agar-io' },
  { folder: 'cookie-clicker', cgName: 'cookie-clicker' }
];

async function downloadThumbnail(folder, cgName) {
  const url = `https://images.crazygames.com/games/${cgName}/cover-1702289187142.png`;
  const filePath = path.join(__dirname, '..', 'static', 'games', folder, 'thumbnail.png');
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Failed to download thumbnail for ${folder}: ${response.status}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Downloaded thumbnail for ${folder}`);
    return true;
  } catch (error) {
    console.log(`Error downloading thumbnail for ${folder}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Downloading thumbnails...');
  
  for (const game of games) {
    await downloadThumbnail(game.folder, game.cgName);
  }
  
  console.log('Done!');
}

main().catch(console.error);
