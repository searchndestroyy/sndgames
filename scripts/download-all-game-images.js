const { exec } = require('child_process');
const fs = require('fs');

// Import games data from the TypeScript file ONLY
const gamesDataPath = '../lib/games-data.ts';
const content = fs.readFileSync(gamesDataPath, 'utf8');

// Extract the raw games array
const rawArrayMatch = content.match(/const raw: \[string, string, string\]\[\] = \[([\s\S]*?)\]\s*$/m);
if (!rawArrayMatch) {
  console.error('Could not find games data array');
  process.exit(1);
}

// Parse the games data from the extracted content
const games = [];

// Extract games using regex - ONLY from TypeScript file
const gameMatches = content.match(/\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g);
if (gameMatches) {
  for (const match of gameMatches) {
    const gameMatch = match.match(/\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/);
    if (gameMatch) {
      const [, title, url, category] = gameMatch;
      games.push({ title, url, category });
    }
  }
}

console.log(`Found ${games.length} games from TypeScript file...`);

// Create a temporary games list for the scraper
const tempGamesList = games.map(game => game.title).join('\n');
fs.writeFileSync('./temp-games-list.txt', tempGamesList, 'utf8');

console.log('\n🎮 Downloading images for all games using your scraper...');
console.log('⚠️  This will use your existing scraper.js');
console.log('📁 Images will be saved to the scraper\'s output folder');
console.log('⏱️  This will take a very long time to complete');

// Run your scraper with the games list
const scraperCommand = `cd ../scraper && node scraper.js --games-list ../scripts/temp-games-list.txt`;

console.log(`\n🚀 Running: ${scraperCommand}`);

const child = exec(scraperCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`✅ Scraper output: ${stdout}`);
});

child.stdout.on('data', (data) => {
  console.log(data.toString());
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`\n✨ Scraper finished with code: ${code}`);
  
  // Clean up temp file
  try {
    fs.unlinkSync('./temp-games-list.txt');
    console.log('🧹 Cleaned up temporary files');
  } catch (err) {
    console.log('⚠️  Could not clean up temp file');
  }
  
  console.log('\n💡 Check the scraper\'s output folder for downloaded images!');
  console.log('📸 Images should be in: ../scraper/game-thumbnails/');
});

console.log('\n⏳ Waiting for scraper to complete...');
console.log('   Press Ctrl+C to cancel at any time.\n');
